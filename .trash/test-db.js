import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    try {
        // 测试数据库连接
        const result = await sql`SELECT NOW() as current_time`;

        res.status(200).json({
            message: '数据库连接成功',
            currentTime: result.rows[0].current_time,
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        console.error('数据库连接错误:', error);
        res.status(500).json({
            error: '数据库连接失败',
            details: error.message,
            environment: process.env.NODE_ENV || 'development'
        });
    }
}
