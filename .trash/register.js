import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, email, password, fullName } = req.body;

    // 输入验证
    if (!username || !email || !password) {
        return res.status(400).json({
            error: '用户名、邮箱和密码都是必填项'
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            error: '密码长度至少需要6位'
        });
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: '邮箱格式不正确'
        });
    }

    try {
        // 检查用户名是否已存在
        const existingUser = await sql`
      SELECT id FROM users 
      WHERE username = ${username} OR email = ${email}
    `;

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                error: '用户名或邮箱已存在'
            });
        }

        // 加密密码
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 创建用户
        const result = await sql`
      INSERT INTO users (username, email, password_hash, full_name)
      VALUES (${username}, ${email}, ${passwordHash}, ${fullName || ''})
      RETURNING id, username, email, full_name, role, created_at
    `;

        const newUser = result.rows[0];

        // 创建会话令牌
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天后过期

        await sql`
      INSERT INTO user_sessions (user_id, session_token, expires_at)
      VALUES (${newUser.id}, ${sessionToken}, ${expiresAt.toISOString()})
    `;

        // 记录用户活动
        await sql`
      INSERT INTO user_activities (user_id, activity_type, description, ip_address, user_agent)
      VALUES (${newUser.id}, 'register', '用户注册', ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}, ${req.headers['user-agent']})
    `;

        // 设置 Cookie
        res.setHeader('Set-Cookie', `session_token=${sessionToken}; Path=/; HttpOnly; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`);

        res.status(201).json({
            message: '注册成功',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                fullName: newUser.full_name,
                role: newUser.role,
                createdAt: newUser.created_at
            }
        });

    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({
            error: '注册失败',
            details: error.message
        });
    }
}
