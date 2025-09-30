// 简化的边缘函数演示 - 避免部署配置问题
export default async function handler(req, res) {
    // 设置 CORS 头部
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // 模拟边缘计算功能
        const startTime = Date.now();

        // 获取请求信息
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const acceptLanguage = req.headers['accept-language'] || 'Unknown';

        // 模拟地理位置检测 (简化版)
        const country = req.headers['x-vercel-ip-country'] || 'Unknown';
        const city = req.headers['x-vercel-ip-city'] || 'Unknown';
        const region = req.headers['x-vercel-ip-region'] || 'Unknown';

        // 模拟边缘计算处理
        const data = {
            users: [
                { id: 1, name: '张三', location: city },
                { id: 2, name: '李四', location: city },
                { id: 3, name: '王五', location: city }
            ],
            stats: {
                totalUsers: 3,
                averageAge: 28,
                location: city
            }
        };

        const processingTime = Date.now() - startTime;

        // 返回响应
        const response = {
            success: true,
            message: `Hello from ${city}, ${country}! This is a simplified Edge Function.`,
            location: {
                country,
                city,
                region,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            request: {
                method: req.method,
                userAgent,
                acceptLanguage,
                timestamp: new Date().toISOString()
            },
            edge: {
                runtime: 'serverless', // 使用标准 serverless 运行时
                processingTime: processingTime,
                latency: 'optimized'
            },
            data,
            processingTime: Math.round(processingTime * 100) / 100
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Edge Function 错误:', error);
        res.status(500).json({
            success: false,
            error: 'Edge Function 执行失败',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}
