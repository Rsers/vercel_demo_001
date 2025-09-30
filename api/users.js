// POST API 接口示例
export default function handler(req, res) {
    // 设置 CORS 头部
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // 处理 OPTIONS 请求（预检请求）
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 只允许 POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: '只支持 POST 请求' });
    }

    try {
        // 获取请求体数据
        const { name, email, message } = req.body;

        // 简单的数据验证
        if (!name || !email) {
            return res.status(400).json({
                error: '缺少必要字段',
                required: ['name', 'email']
            });
        }

        // 模拟保存数据（实际项目中这里会连接数据库）
        const userData = {
            id: Date.now(), // 简单的 ID 生成
            name,
            email,
            message: message || '',
            createdAt: new Date().toISOString()
        };

        // 返回成功响应
        res.status(201).json({
            success: true,
            message: '用户数据已保存',
            data: userData
        });

    } catch (error) {
        console.error('API 错误:', error);
        res.status(500).json({
            error: '服务器内部错误',
            message: error.message
        });
    }
}
