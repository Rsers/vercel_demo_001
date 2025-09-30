// 简单的 GET API 接口
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

    // 只允许 GET 请求
    if (req.method !== 'GET') {
        return res.status(405).json({ error: '只支持 GET 请求' });
    }

    // 获取查询参数
    const { name = '世界' } = req.query;

    // 返回 JSON 响应
    res.status(200).json({
        message: `你好，${name}！`,
        timestamp: new Date().toISOString(),
        method: req.method,
        query: req.query
    });
}
