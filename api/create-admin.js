import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 简单的安全验证 - 在生产环境中应该使用更严格的安全措施
    const { adminKey, username, email, password, fullName } = req.body;

    if (adminKey !== 'vercel-demo-2024') {
        return res.status(403).json({ error: '无效的管理员密钥' });
    }

    if (!username || !email || !password) {
        return res.status(400).json({
            error: '用户名、邮箱和密码都是必填项'
        });
    }

    try {
        // 检查是否已存在管理员
        const existingAdmin = await sql`
      SELECT id FROM users WHERE role = 'admin'
    `;

        if (existingAdmin.rows.length > 0) {
            return res.status(409).json({
                error: '管理员账户已存在'
            });
        }

        // 检查用户名和邮箱是否已存在
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

        // 创建管理员用户
        const result = await sql`
      INSERT INTO users (username, email, password_hash, full_name, role)
      VALUES (${username}, ${email}, ${passwordHash}, ${fullName || ''}, 'admin')
      RETURNING id, username, email, full_name, role, created_at
    `;

        const adminUser = result.rows[0];

        res.status(201).json({
            message: '管理员账户创建成功',
            user: {
                id: adminUser.id,
                username: adminUser.username,
                email: adminUser.email,
                fullName: adminUser.full_name,
                role: adminUser.role,
                createdAt: adminUser.created_at
            }
        });

    } catch (error) {
        console.error('创建管理员错误:', error);
        res.status(500).json({
            error: '创建管理员失败',
            details: error.message
        });
    }
}
