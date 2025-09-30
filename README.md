# 🌤️ 智能天气助手 - Vercel API 演示

这个项目展示了一个**必须依赖 API** 的真实应用场景：智能天气查询系统。

## 🚀 项目结构

```
vercel_demo_001/
├── api/                    # API 接口目录
│   ├── weather.js         # 天气查询 API（依赖外部服务）
│   ├── geocode.js         # 地理位置 API（依赖外部服务）
│   ├── aggregate.js       # 数据聚合 API（展示 API 价值）
│   ├── hello.js           # 问候接口
│   ├── users.js           # 用户接口
│   └── tasks.js           # 任务接口
├── index.html             # 天气查询应用界面
├── package.json           # 项目配置
├── vercel.json           # Vercel 配置
└── README.md             # 项目说明
```

## 📡 API 接口说明

### 🌤️ 核心 API（必须依赖外部服务）

#### 1. Weather API - `/api/weather`
- **方法**: POST
- **功能**: 实时天气查询
- **依赖**: OpenWeatherMap API
- **为什么必须用 API**: 天气数据无法在前端生成，需要专业气象服务
- **请求体**:
  ```json
  {
    "city": "北京",
    "country": "CN"
  }
  ```

#### 2. Geocode API - `/api/geocode`
- **方法**: GET
- **功能**: 地理位置解析
- **依赖**: 外部地理编码服务
- **为什么必须用 API**: 经纬度转换需要专业地理数据库
- **示例**: `/api/geocode?lat=39.9042&lon=116.4074`

#### 3. Aggregate API - `/api/aggregate`
- **方法**: POST
- **功能**: 多源数据聚合和分析
- **价值**: 整合天气、空气质量、生活指数等多个数据源
- **为什么必须用 API**: 数据聚合和处理需要服务端计算

### 🔧 辅助 API

#### 4. Hello API - `/api/hello`
- **方法**: GET
- **功能**: 个性化问候
- **示例**: `/api/hello?name=张三`

#### 5. Users API - `/api/users`
- **方法**: POST
- **功能**: 用户信息管理

#### 6. Tasks API - `/api/tasks`
- **方法**: GET, POST, PUT, DELETE
- **功能**: 任务管理（CRUD 操作）

## 🎯 为什么这个场景必须使用 API？

### ❌ 无法在前端实现的功能：
1. **实时天气数据** - 需要专业气象服务，无法在前端生成
2. **地理位置解析** - 需要庞大的地理数据库支持
3. **数据聚合处理** - 需要服务端计算和缓存
4. **外部 API 调用** - 浏览器安全限制，无法直接调用第三方 API
5. **敏感信息保护** - API Key 不能暴露在前端

### ✅ API 的核心价值：
1. **数据获取** - 从外部服务获取实时数据
2. **数据处理** - 服务端计算和业务逻辑
3. **安全保护** - 隐藏 API Key 和敏感信息
4. **性能优化** - 数据缓存和请求优化
5. **错误处理** - 统一的错误处理和重试机制

## 🛠️ 本地开发

1. 安装依赖：
   ```bash
   npm install
   ```

2. 设置环境变量（可选）：
   ```bash
   # 创建 .env.local 文件
   OPENWEATHER_API_KEY=your_api_key_here
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   # 或
   vercel dev
   ```

4. 访问 `http://localhost:3000` 查看天气应用

## 🌐 部署到 Vercel

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 在项目设置中添加环境变量：
   - `OPENWEATHER_API_KEY` - OpenWeatherMap API Key
4. 自动部署完成

## 📝 技术特点

### Serverless Functions 优势
- **按需执行** - 只在请求时运行，节省成本
- **自动扩缩容** - 根据请求量自动调整资源
- **全球部署** - 边缘计算，低延迟访问
- **零运维** - 无需管理服务器

### API 设计模式
```javascript
// 1. 外部 API 调用
const response = await fetch('https://api.openweathermap.org/...');

// 2. 数据处理和转换
const processedData = processWeatherData(response);

// 3. 错误处理和重试
if (!response.ok) {
  throw new Error('API 调用失败');
}

// 4. 返回标准化响应
res.status(200).json(processedData);
```

## 🔧 环境变量配置

在 Vercel 项目设置中添加：
- `OPENWEATHER_API_KEY` - OpenWeatherMap API Key
- `VERCEL_ENV` - 环境类型 (development, preview, production)

## 📊 监控和性能

- **函数执行监控** - 查看执行时间、内存使用
- **错误日志** - 详细的错误信息和堆栈跟踪
- **性能分析** - 冷启动时间和执行效率
- **成本控制** - 按请求量计费，透明可控

## 🎯 最佳实践

1. **API Key 管理** - 使用环境变量，不在代码中硬编码
2. **错误处理** - 完善的错误处理和用户友好的错误信息
3. **数据验证** - 验证输入参数和 API 响应
4. **缓存策略** - 合理使用缓存减少 API 调用
5. **限流保护** - 防止 API 滥用和过载
6. **日志记录** - 详细的日志记录便于调试

## 📚 相关资源

- [Vercel 文档](https://vercel.com/docs)
- [Serverless Functions](https://vercel.com/docs/functions)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [环境变量配置](https://vercel.com/docs/environment-variables)