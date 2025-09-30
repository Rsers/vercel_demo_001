import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { action, data } = req.body;

        switch (action) {
            case 'init':
                // 初始化数据库表
                await sql`
          CREATE TABLE IF NOT EXISTS demo_users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            age INTEGER,
            city VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `;
                return res.status(200).json({
                    success: true,
                    message: '数据库表初始化成功'
                });

            case 'insert':
                // 插入用户数据
                if (!data || !data.name || !data.email) {
                    return res.status(400).json({
                        success: false,
                        error: '姓名和邮箱是必填项'
                    });
                }

                const result = await sql`
          INSERT INTO demo_users (name, email, age, city)
          VALUES (${data.name}, ${data.email}, ${data.age || null}, ${data.city || null})
          RETURNING *
        `;

                return res.status(201).json({
                    success: true,
                    message: '用户创建成功',
                    user: result.rows[0]
                });

            case 'select':
                // 查询所有用户
                const users = await sql`
          SELECT * FROM demo_users 
          ORDER BY created_at DESC
        `;

                return res.status(200).json({
                    success: true,
                    users: users.rows
                });

            case 'update':
                // 更新用户信息
                if (!data || !data.id) {
                    return res.status(400).json({
                        success: false,
                        error: '用户ID是必填项'
                    });
                }

                const updateResult = await sql`
          UPDATE demo_users 
          SET 
            name = COALESCE(${data.name}, name),
            email = COALESCE(${data.email}, email),
            age = COALESCE(${data.age}, age),
            city = COALESCE(${data.city}, city)
          WHERE id = ${data.id}
          RETURNING *
        `;

                if (updateResult.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: '用户不存在'
                    });
                }

                return res.status(200).json({
                    success: true,
                    message: '用户信息更新成功',
                    user: updateResult.rows[0]
                });

            case 'delete':
                // 删除用户
                if (!data || !data.id) {
                    return res.status(400).json({
                        success: false,
                        error: '用户ID是必填项'
                    });
                }

                const deleteResult = await sql`
          DELETE FROM demo_users 
          WHERE id = ${data.id}
          RETURNING *
        `;

                if (deleteResult.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: '用户不存在'
                    });
                }

                return res.status(200).json({
                    success: true,
                    message: '用户删除成功',
                    user: deleteResult.rows[0]
                });

            case 'search':
                // 搜索用户
                const searchTerm = data?.search || '';
                const searchUsers = await sql`
          SELECT * FROM demo_users 
          WHERE name ILIKE ${'%' + searchTerm + '%'} 
          OR email ILIKE ${'%' + searchTerm + '%'}
          OR city ILIKE ${'%' + searchTerm + '%'}
          ORDER BY created_at DESC
        `;

                return res.status(200).json({
                    success: true,
                    users: searchUsers.rows
                });

            case 'stats':
                // 获取统计信息
                const stats = await sql`
          SELECT 
            COUNT(*) as total_users,
            AVG(age) as avg_age,
            COUNT(CASE WHEN age IS NOT NULL THEN 1 END) as users_with_age
          FROM demo_users
        `;

                const cityStats = await sql`
          SELECT 
            city, 
            COUNT(*) as count 
          FROM demo_users 
          WHERE city IS NOT NULL 
          GROUP BY city 
          ORDER BY count DESC 
          LIMIT 5
        `;

                return res.status(200).json({
                    success: true,
                    stats: {
                        ...stats.rows[0],
                        avg_age: stats.rows[0].avg_age ? Math.round(stats.rows[0].avg_age) : null,
                        top_cities: cityStats.rows
                    }
                });

            default:
                return res.status(400).json({
                    success: false,
                    error: '无效的操作类型'
                });
        }

    } catch (error) {
        console.error('数据库操作错误:', error);
        return res.status(500).json({
            success: false,
            error: '数据库操作失败',
            details: error.message
        });
    }
}
