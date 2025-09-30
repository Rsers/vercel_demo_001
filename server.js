const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

// 中间件
app.use(express.json());
app.use(express.static('.'));

// 模拟 API 端点用于测试
app.post('/api/auth/register-simple', (req, res) => {
    console.log('注册请求:', req.body);

    // 模拟成功响应
    res.json({
        message: '注册成功（模拟）',
        user: {
            id: 1,
            username: req.body.username,
            email: req.body.email,
            fullName: req.body.fullName,
            role: 'user',
            createdAt: new Date().toISOString()
        }
    });
});

app.get('/api/test-db', (req, res) => {
    res.json({
        message: '数据库连接成功（模拟）',
        currentTime: new Date().toISOString(),
        environment: 'development'
    });
});

app.post('/api/init-db-simple', (req, res) => {
    res.json({
        message: '数据库初始化成功（模拟）',
        tables: ['users']
    });
});

app.listen(PORT, () => {
    console.log(`测试服务器运行在 http://localhost:${PORT}`);
    console.log(`访问测试页面: http://localhost:${PORT}/test-user.html`);
});
