import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { username, email, password, fullName } = req.body;

        // 输入验证
        if (!username || !email || !password) {
            return res.status(400).json({
                error: '用户名、邮箱和密码都是必填项'
            });
        }

        // 简单的密码哈希（仅用于测试）
        const passwordHash = Buffer.from(password).toString('base64');

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

        // 创建用户
        const result = await sql`
      INSERT INTO users (username, email, password_hash, full_name)
      VALUES (${username}, ${email}, ${passwordHash}, ${fullName || ''})
      RETURNING id, username, email, full_name, role, created_at
    `;

        const newUser = result.rows[0];

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
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
