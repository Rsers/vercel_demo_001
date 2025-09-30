import { NextResponse } from 'next/server';

// Middleware - 在请求到达页面/API 之前运行
export function middleware(request) {
    const { pathname, searchParams } = request.nextUrl;

    // 创建响应对象
    const response = NextResponse.next();

    // 1. 添加自定义头部
    response.headers.set('X-Custom-Header', 'Hello from Middleware');
    response.headers.set('X-Request-Time', new Date().toISOString());

    // 2. 地理位置处理
    const country = request.geo?.country || 'Unknown';
    const city = request.geo?.city || 'Unknown';

    response.headers.set('X-User-Country', country);
    response.headers.set('X-User-City', city);

    // 3. A/B 测试 - 为用户分配不同版本
    const variant = Math.random() > 0.5 ? 'A' : 'B';
    response.headers.set('X-AB-Test-Variant', variant);

    // 4. 认证检查 - 保护管理页面
    if (pathname.startsWith('/admin')) {
        const authToken = request.cookies.get('auth-token');

        if (!authToken) {
            // 重定向到登录页面
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // 验证 token (简化版)
        if (authToken.value !== 'valid-token') {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // 5. 重定向处理
    if (pathname === '/old-page') {
        return NextResponse.redirect(new URL('/new-page', request.url));
    }

    // 6. 语言检测和重定向
    const acceptLanguage = request.headers.get('accept-language') || '';
    const preferredLanguage = acceptLanguage.split(',')[0]?.split('-')[0] || 'en';

    if (pathname === '/' && preferredLanguage === 'zh') {
        return NextResponse.redirect(new URL('/zh', request.url));
    }

    // 7. 请求日志记录
    console.log(`[Middleware] ${request.method} ${pathname} - ${country}, ${city} - Variant: ${variant}`);

    // 8. 添加 CORS 头部 (如果需要)
    if (request.method === 'OPTIONS') {
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    // 9. 缓存控制
    if (pathname.startsWith('/api/')) {
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (pathname.startsWith('/static/')) {
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }

    // 10. 安全头部
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
}

// 配置 Middleware 匹配规则
export const config = {
    // 匹配所有路径，除了静态资源
    matcher: [
        /*
         * 匹配所有路径，除了:
         * - api (API 路由)
         * - _next/static (静态文件)
         * - _next/image (图片优化)
         * - favicon.ico (网站图标)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};

// 导出配置信息
export const middlewareConfig = {
    name: 'Custom Middleware',
    version: '1.0.0',
    features: [
        'Authentication',
        'A/B Testing',
        'Geolocation',
        'CORS',
        'Security Headers',
        'Cache Control',
        'Request Logging'
    ]
};
