import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    const sessionToken = req.cookies.session_token;

    if (!sessionToken) {
        return res.status(401).json({ error: '未登录' });
    }

    try {
        // 验证管理员权限
        const session = await sql`
      SELECT u.role
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_token = ${sessionToken} 
      AND s.expires_at > NOW()
    `;

        if (session.rows.length === 0) {
            return res.status(401).json({ error: '会话已过期' });
        }

        const userRole = session.rows[0].role;
        if (userRole !== 'admin') {
            return res.status(403).json({ error: '需要管理员权限' });
        }

        if (req.method === 'GET') {
            // 获取所有用户列表
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const users = await sql`
        SELECT 
          u.id, u.username, u.email, u.full_name, u.role, u.avatar_url,
          u.created_at, u.updated_at,
          COUNT(a.id) as activity_count,
          MAX(a.created_at) as last_activity
        FROM users u
        LEFT JOIN user_activities a ON u.id = a.user_id
        GROUP BY u.id
        ORDER BY u.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

            const totalCount = await sql`
        SELECT COUNT(*) as count FROM users
      `;

            res.status(200).json({
                users: users.rows,
                pagination: {
                    page,
                    limit,
                    total: parseInt(totalCount.rows[0].count),
                    totalPages: Math.ceil(parseInt(totalCount.rows[0].count) / limit)
                }
            });

        } else if (req.method === 'PUT') {
            // 更新用户信息
            const { userId, fullName, role, avatarUrl } = req.body;

            if (!userId) {
                return res.status(400).json({ error: '用户ID是必填项' });
            }

            const result = await sql`
        UPDATE users 
        SET 
          full_name = COALESCE(${fullName}, full_name),
          role = COALESCE(${role}, role),
          avatar_url = COALESCE(${avatarUrl}, avatar_url),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
        RETURNING id, username, email, full_name, role, avatar_url, updated_at
      `;

            if (result.rows.length === 0) {
                return res.status(404).json({ error: '用户不存在' });
            }

            res.status(200).json({
                message: '用户信息更新成功',
                user: result.rows[0]
            });

        } else if (req.method === 'DELETE') {
            // 删除用户
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({ error: '用户ID是必填项' });
            }

            // 不能删除自己
            const currentUser = await sql`
        SELECT user_id FROM user_sessions 
        WHERE session_token = ${sessionToken}
      `;

            if (currentUser.rows[0].user_id === parseInt(userId)) {
                return res.status(400).json({ error: '不能删除自己的账户' });
            }

            const result = await sql`
        DELETE FROM users WHERE id = ${userId}
        RETURNING username
      `;

            if (result.rows.length === 0) {
                return res.status(404).json({ error: '用户不存在' });
            }

            res.status(200).json({
                message: `用户 ${result.rows[0].username} 已删除`
            });

        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }

    } catch (error) {
        console.error('用户管理错误:', error);
        res.status(500).json({
            error: '操作失败',
            details: error.message
        });
    }
}
