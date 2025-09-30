import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error: '用户名和密码都是必填项'
        });
    }

    try {
        // 查找用户（支持用户名或邮箱登录）
        const user = await sql`
      SELECT id, username, email, password_hash, full_name, role, created_at
      FROM users 
      WHERE username = ${username} OR email = ${username}
    `;

        if (user.rows.length === 0) {
            return res.status(401).json({
                error: '用户名或密码错误'
            });
        }

        const foundUser = user.rows[0];

        // 验证密码
        const isValidPassword = await bcrypt.compare(password, foundUser.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                error: '用户名或密码错误'
            });
        }

        // 创建新的会话令牌
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天后过期

        // 清除旧的会话
        await sql`
      DELETE FROM user_sessions 
      WHERE user_id = ${foundUser.id} AND expires_at < NOW()
    `;

        // 创建新会话
        await sql`
      INSERT INTO user_sessions (user_id, session_token, expires_at)
      VALUES (${foundUser.id}, ${sessionToken}, ${expiresAt.toISOString()})
    `;

        // 记录登录活动
        await sql`
      INSERT INTO user_activities (user_id, activity_type, description, ip_address, user_agent)
      VALUES (${foundUser.id}, 'login', '用户登录', ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}, ${req.headers['user-agent']})
    `;

        // 设置 Cookie
        res.setHeader('Set-Cookie', `session_token=${sessionToken}; Path=/; HttpOnly; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`);

        res.status(200).json({
            message: '登录成功',
            user: {
                id: foundUser.id,
                username: foundUser.username,
                email: foundUser.email,
                fullName: foundUser.full_name,
                role: foundUser.role,
                createdAt: foundUser.created_at
            }
        });

    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({
            error: '登录失败',
            details: error.message
        });
    }
}
