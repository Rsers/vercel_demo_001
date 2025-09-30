# Vercel 用户管理系统部署指南

## 🚀 部署步骤

### 1. 准备 GitHub 仓库

1. 将代码推送到 GitHub 仓库
2. 确保所有文件都已提交

### 2. 在 Vercel 中创建项目

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 选择你的 GitHub 仓库
4. 配置项目设置

### 3. 添加 PostgreSQL 数据库

1. 在 Vercel Dashboard 中，进入你的项目
2. 点击 "Storage" 标签
3. 点击 "Create Database"
4. 选择 "PostgreSQL"
5. 等待数据库创建完成

### 4. 配置环境变量

数据库创建后，Vercel 会自动添加以下环境变量：
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### 5. 部署和初始化

1. 部署完成后，访问你的应用 URL
2. 首先访问 `/api/init-db` 来初始化数据库：

```bash
curl -X POST https://your-app.vercel.app/api/init-db
```

3. 创建管理员账户：

```bash
curl -X POST https://your-app.vercel.app/api/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "adminKey": "vercel-demo-2024",
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123456",
    "fullName": "系统管理员"
  }'
```

4. 访问 `/index-user.html` 开始使用

## 🔧 常见问题解决

### 问题 1: 500 Internal Server Error

**原因**: 数据库连接问题或缺少依赖

**解决方案**:
1. 确保 PostgreSQL 数据库已正确创建
2. 检查环境变量是否正确设置
3. 确保所有依赖都在 `package.json` 中

### 问题 2: 数据库表不存在

**原因**: 数据库未初始化

**解决方案**:
1. 访问 `/api/init-db` 端点初始化数据库
2. 检查数据库连接是否正常

### 问题 3: bcryptjs 模块未找到

**原因**: 依赖未正确安装

**解决方案**:
1. 确保 `bcryptjs` 在 `package.json` 的 `dependencies` 中
2. 重新部署项目

### 问题 4: CORS 错误

**原因**: 跨域请求问题

**解决方案**:
1. 确保 API 端点返回正确的 CORS 头
2. 检查请求 URL 是否正确

## 📋 测试清单

部署完成后，请测试以下功能：

- [ ] 数据库连接正常
- [ ] 数据库初始化成功
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 会话管理正常
- [ ] 管理员功能正常
- [ ] 用户列表显示正常

## 🌐 本地开发

如果需要本地开发，可以：

1. 安装 Vercel CLI:
```bash
npm i -g vercel
```

2. 登录 Vercel:
```bash
vercel login
```

3. 启动开发服务器:
```bash
vercel dev
```

## 📞 获取帮助

如果遇到问题：

1. 检查 Vercel 部署日志
2. 查看浏览器控制台错误
3. 使用测试页面 `/test-user.html` 调试
4. 检查数据库连接状态

## 🔐 安全注意事项

1. 更改默认的管理员密钥
2. 使用强密码
3. 在生产环境中启用 HTTPS
4. 定期备份数据库
5. 监控用户活动日志
