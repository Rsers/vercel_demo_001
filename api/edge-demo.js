// Edge Function - 在边缘节点运行，延迟更低
export const config = {
    runtime: 'edge', // 指定为边缘函数
};

export default async function handler(req) {
    // 获取请求信息
    const url = new URL(req.url);
    const method = req.method;

    // 获取地理位置信息
    const country = req.geo?.country || 'Unknown';
    const city = req.geo?.city || 'Unknown';
    const region = req.geo?.region || 'Unknown';

    // 获取用户代理信息
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // 获取请求时间
    const timestamp = new Date().toISOString();

    // 边缘函数特有的功能
    const edgeInfo = {
        // 地理位置
        location: {
            country,
            city,
            region,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },

        // 请求信息
        request: {
            method,
            url: url.pathname,
            userAgent,
            timestamp
        },

        // 边缘计算特性
        edge: {
            runtime: 'edge',
            region: req.geo?.region || 'unknown',
            isEdge: true,
            latency: 'low' // 边缘计算的优势
        },

        // 性能信息
        performance: {
            startTime: performance.now(),
            memory: process.memoryUsage?.() || 'N/A'
        }
    };

    // 模拟一些计算
    const startTime = performance.now();

    // 简单的数据处理
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

    const endTime = performance.now();
    const processingTime = endTime - startTime;

    // 返回响应
    return new Response(JSON.stringify({
        ...edgeInfo,
        data,
        processingTime: Math.round(processingTime * 100) / 100,
        message: `Hello from ${city}, ${country}! This is an Edge Function.`
    }), {
        headers: {
            'Content-Type': 'application/json',
            'X-Edge-Function': 'true',
            'X-Processing-Time': processingTime.toString(),
            'X-Location': `${city}, ${country}`,
            'Cache-Control': 'public, max-age=60' // 边缘缓存
        }
    });
}
