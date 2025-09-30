// Middleware 功能演示 - 通过 API 模拟中间件功能
export default async function handler(req, res) {
    // 设置 CORS 头部
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // 模拟中间件功能
        const requestInfo = {
            method: req.method,
            url: req.url,
            headers: req.headers,
            timestamp: new Date().toISOString()
        };

        // 1. 添加自定义头部 (模拟中间件添加头部)
        const customHeaders = {
            'X-Custom-Header': 'Hello from Middleware Demo',
            'X-Request-Time': requestInfo.timestamp,
            'X-Middleware-Processed': 'true'
        };

        // 2. 地理位置处理
        const locationInfo = {
            country: req.headers['x-vercel-ip-country'] || 'Unknown',
            city: req.headers['x-vercel-ip-city'] || 'Unknown',
            region: req.headers['x-vercel-ip-region'] || 'Unknown'
        };

        // 3. A/B 测试 (模拟为用户分配版本)
        const variant = Math.random() > 0.5 ? 'A' : 'B';

        // 4. 认证检查 (简化版)
        const authToken = req.headers['authorization'] || req.cookies?.authToken;
        const isAuthenticated = !!authToken;

        // 5. 请求日志记录
        console.log(`[Middleware Demo] ${req.method} ${req.url} - ${locationInfo.city}, ${locationInfo.country} - Variant: ${variant}`);

        // 6. 安全头部
        const securityHeaders = {
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'strict-origin-when-cross-origin'
        };

        // 7. 缓存控制
        const cacheHeaders = {
            'Cache-Control': req.url.startsWith('/api/') ? 'no-cache, no-store, must-revalidate' : 'public, max-age=3600'
        };

        // 设置所有头部
        Object.entries({ ...customHeaders, ...securityHeaders, ...cacheHeaders }).forEach(([key, value]) => {
            res.setHeader(key, value);
        });

        // 返回中间件处理结果
        const middlewareResult = {
            success: true,
            message: 'Middleware 功能演示',
            middleware: {
                customHeaders,
                locationInfo,
                abTest: {
                    variant,
                    message: `用户分配到版本 ${variant}`
                },
                authentication: {
                    isAuthenticated,
                    message: isAuthenticated ? '用户已认证' : '用户未认证'
                },
                security: securityHeaders,
                cache: cacheHeaders
            },
            request: requestInfo,
            timestamp: new Date().toISOString()
        };

        res.status(200).json(middlewareResult);

    } catch (error) {
        console.error('Middleware 演示错误:', error);
        res.status(500).json({
            success: false,
            error: 'Middleware 演示失败',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}
