# Vercel API 演示项目

这个项目展示了如何使用 Vercel 的 Serverless Functions 创建 API 接口。

## 🚀 项目结构

```
vercel_demo_001/
├── api/                    # API 接口目录
│   ├── hello.js           # GET 接口示例
│   ├── users.js           # POST 接口示例
│   └── tasks.js           # 多方法接口示例
├── index.html             # 前端测试页面
├── package.json           # 项目配置
├── vercel.json           # Vercel 配置
└── README.md             # 项目说明
```

## 📡 API 接口说明

### 1. Hello API - `/api/hello`
- **方法**: GET
- **功能**: 简单的问候接口
- **参数**: `name` (可选，默认为"世界")
- **示例**: `/api/hello?name=张三`

### 2. Users API - `/api/users`
- **方法**: POST
- **功能**: 创建用户数据
- **请求体**:
  ```json
  {
    "name": "张三",
    "email": "zhangsan@example.com",
    "message": "你好世界"
  }
  ```

### 3. Tasks API - `/api/tasks`
- **方法**: GET, POST, PUT, DELETE
- **功能**: 任务管理接口
- **GET**: 获取所有任务或特定任务 (`?id=1`)
- **POST**: 创建新任务
- **PUT**: 更新任务 (`?id=1`)
- **DELETE**: 删除任务 (`?id=1`)

## 🛠️ 本地开发

1. 安装依赖：
   ```bash
   npm install
   ```

2. 启动开发服务器：
   ```bash
   npm run dev
   # 或
   vercel dev
   ```

3. 访问 `http://localhost:3000` 查看测试页面

## 🌐 部署到 Vercel

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 自动部署完成

## 📝 Vercel API 特点

### Serverless Functions
- 每个 API 文件都是一个独立的函数
- 自动扩缩容，按需执行
- 支持多种运行时环境

### 文件结构
- API 文件必须放在 `api/` 目录下
- 文件名对应 API 路径
- 支持动态路由 (`[id].js`)

### 请求处理
```javascript
export default function handler(req, res) {
  // req.method - HTTP 方法
  // req.query - 查询参数
  // req.body - 请求体
  // req.headers - 请求头
  
  // res.status() - 设置状态码
  // res.json() - 返回 JSON
  // res.setHeader() - 设置响应头
}
```

### CORS 处理
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

## 🔧 环境变量

在 Vercel 项目设置中添加环境变量：
- `VERCEL_ENV` - 环境类型 (development, preview, production)
- 自定义变量用于数据库连接等

## 📊 监控和日志

- Vercel 提供函数执行监控
- 查看执行时间、内存使用等
- 错误日志和性能分析

## 🎯 最佳实践

1. **错误处理**: 始终包含 try-catch 和适当的错误响应
2. **CORS**: 根据需要设置 CORS 头部
3. **验证**: 验证输入参数和请求体
4. **状态码**: 使用正确的 HTTP 状态码
5. **性能**: 避免长时间运行的操作
6. **安全**: 验证用户权限和输入数据

## 📚 相关资源

- [Vercel 文档](https://vercel.com/docs)
- [Serverless Functions](https://vercel.com/docs/functions)
- [API Routes](https://vercel.com/docs/api-routes)