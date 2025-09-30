export default async function handler(req, res) {
    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // 简单的测试响应
        return res.status(200).json({
            success: true,
            message: 'API 连接成功',
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url
        });
    } catch (error) {
        console.error('测试 API 错误:', error);
        return res.status(500).json({
            success: false,
            error: 'API 测试失败',
            details: error.message
        });
    }
}
