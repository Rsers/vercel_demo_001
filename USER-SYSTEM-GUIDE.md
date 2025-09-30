# Vercel 用户管理系统使用指南

这是一个完整的用户管理系统，使用 Vercel PostgreSQL 数据库来存储和管理用户数据。

## 🚀 快速开始

### 1. 部署到 Vercel

1. 将代码推送到 GitHub 仓库
2. 在 Vercel 中导入项目
3. 在 Vercel 项目中添加 PostgreSQL 数据库

### 2. 初始化数据库

访问 `/api/init-db` 端点来创建必要的数据库表：

```bash
curl -X POST https://your-app.vercel.app/api/init-db
```

### 3. 创建管理员账户

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

## 📚 API 端点说明

### 认证相关

#### 用户注册
- **端点**: `POST /api/auth/register`
- **参数**:
  ```json
  {
    "username": "用户名",
    "email": "邮箱地址",
    "password": "密码",
    "fullName": "姓名（可选）"
  }
  ```

#### 用户登录
- **端点**: `POST /api/auth/login`
- **参数**:
  ```json
  {
    "username": "用户名或邮箱",
    "password": "密码"
  }
  ```

#### 获取当前用户信息
- **端点**: `GET /api/auth/me`
- **需要**: 有效的会话 Cookie

#### 用户登出
- **端点**: `POST /api/auth/logout`
- **需要**: 有效的会话 Cookie

### 用户管理（管理员功能）

#### 获取用户列表
- **端点**: `GET /api/users?page=1&limit=10`
- **需要**: 管理员权限

#### 更新用户信息
- **端点**: `PUT /api/users`
- **需要**: 管理员权限
- **参数**:
  ```json
  {
    "userId": "用户ID",
    "fullName": "新姓名（可选）",
    "role": "新角色（可选）",
    "avatarUrl": "头像URL（可选）"
  }
  ```

#### 删除用户
- **端点**: `DELETE /api/users`
- **需要**: 管理员权限
- **参数**:
  ```json
  {
    "userId": "用户ID"
  }
  ```

## 🗄️ 数据库结构

### users 表
- `id` - 主键
- `username` - 用户名（唯一）
- `email` - 邮箱（唯一）
- `password_hash` - 加密后的密码
- `full_name` - 姓名
- `avatar_url` - 头像URL
- `role` - 角色（user/admin）
- `created_at` - 创建时间
- `updated_at` - 更新时间

### user_sessions 表
- `id` - 主键
- `user_id` - 用户ID（外键）
- `session_token` - 会话令牌
- `expires_at` - 过期时间
- `created_at` - 创建时间

### user_activities 表
- `id` - 主键
- `user_id` - 用户ID（外键）
- `activity_type` - 活动类型
- `description` - 活动描述
- `ip_address` - IP地址
- `user_agent` - 用户代理
- `created_at` - 创建时间

## 🔐 安全特性

1. **密码加密**: 使用 bcryptjs 进行密码哈希
2. **会话管理**: 基于令牌的会话管理
3. **权限控制**: 基于角色的访问控制
4. **输入验证**: 服务器端数据验证
5. **SQL 注入防护**: 使用参数化查询

## 🎨 前端功能

### 用户界面
- 现代化的响应式设计
- 用户注册和登录表单
- 个人资料展示
- 用户列表管理（管理员）
- 实时状态更新

### 功能特点
- 自动登录状态检查
- 友好的错误提示
- 分页显示用户列表
- 移动端适配

## 🚀 部署注意事项

1. **环境变量**: 确保 Vercel PostgreSQL 连接字符串正确配置
2. **HTTPS**: 生产环境必须使用 HTTPS
3. **Cookie 安全**: 会话 Cookie 设置为 HttpOnly
4. **错误处理**: 完善的错误处理和日志记录

## 📱 使用流程

1. 访问 `/index-user.html` 页面
2. 首次使用需要创建管理员账户
3. 使用管理员账户登录
4. 可以创建普通用户或管理现有用户
5. 所有操作都会记录在用户活动日志中

## 🔧 开发说明

### 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 技术栈
- **后端**: Vercel Serverless Functions
- **数据库**: Vercel PostgreSQL
- **前端**: 原生 HTML/CSS/JavaScript
- **安全**: bcryptjs, 会话管理

这个系统展示了如何在 Vercel 平台上构建完整的用户管理系统，包括数据库操作、认证授权、会话管理等核心功能。
