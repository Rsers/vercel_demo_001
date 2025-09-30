import { track } from '@vercel/analytics';

// 用户操作事件追踪
export const trackUserAction = (action, properties = {}) => {
    track(action, {
        timestamp: new Date().toISOString(),
        ...properties
    });
};

// 页面浏览事件
export const trackPageView = (pageName) => {
    track('page_view', {
        page: pageName,
        timestamp: new Date().toISOString()
    });
};

// 用户注册事件
export const trackUserRegistration = (userId, method = 'email') => {
    track('user_registration', {
        user_id: userId,
        method: method,
        timestamp: new Date().toISOString()
    });
};

// 用户登录事件
export const trackUserLogin = (userId, method = 'email') => {
    track('user_login', {
        user_id: userId,
        method: method,
        timestamp: new Date().toISOString()
    });
};

// 数据库操作事件
export const trackDatabaseOperation = (operation, table, success = true) => {
    track('database_operation', {
        operation: operation,
        table: table,
        success: success,
        timestamp: new Date().toISOString()
    });
};

// 错误事件追踪
export const trackError = (errorType, errorMessage, context = {}) => {
    track('error_occurred', {
        error_type: errorType,
        error_message: errorMessage,
        context: JSON.stringify(context),
        timestamp: new Date().toISOString()
    });
};

// 性能事件追踪
export const trackPerformance = (metric, value, unit = 'ms') => {
    track('performance_metric', {
        metric: metric,
        value: value,
        unit: unit,
        timestamp: new Date().toISOString()
    });
};
