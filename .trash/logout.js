import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const sessionToken = req.cookies.session_token;

        if (sessionToken) {
            // 查找会话
            const session = await sql`
        SELECT user_id FROM user_sessions 
        WHERE session_token = ${sessionToken}
      `;

            if (session.rows.length > 0) {
                const userId = session.rows[0].user_id;

                // 删除会话
                await sql`
          DELETE FROM user_sessions 
          WHERE session_token = ${sessionToken}
        `;

                // 记录登出活动
                await sql`
          INSERT INTO user_activities (user_id, activity_type, description, ip_address, user_agent)
          VALUES (${userId}, 'logout', '用户登出', ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}, ${req.headers['user-agent']})
        `;
            }
        }

        // 清除 Cookie
        res.setHeader('Set-Cookie', 'session_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax');

        res.status(200).json({ message: '登出成功' });

    } catch (error) {
        console.error('登出错误:', error);
        res.status(500).json({
            error: '登出失败',
            details: error.message
        });
    }
}
