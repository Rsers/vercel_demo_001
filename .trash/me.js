import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const sessionToken = req.cookies.session_token;

        if (!sessionToken) {
            return res.status(401).json({ error: '未登录' });
        }

        // 验证会话
        const session = await sql`
      SELECT s.user_id, u.username, u.email, u.full_name, u.role, u.avatar_url, u.created_at
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_token = ${sessionToken} 
      AND s.expires_at > NOW()
    `;

        if (session.rows.length === 0) {
            // 清除无效的 Cookie
            res.setHeader('Set-Cookie', 'session_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax');
            return res.status(401).json({ error: '会话已过期，请重新登录' });
        }

        const user = session.rows[0];

        res.status(200).json({
            user: {
                id: user.user_id,
                username: user.username,
                email: user.email,
                fullName: user.full_name,
                role: user.role,
                avatarUrl: user.avatar_url,
                createdAt: user.created_at
            }
        });

    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({
            error: '获取用户信息失败',
            details: error.message
        });
    }
}
