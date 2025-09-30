# 🚀 快速开始指南

## 📝 两种 API 版本

### 1. 演示版本（无需配置）
- **页面**: `index.html`
- **API**: `/api/weather`
- **特点**: 使用模拟数据，快速演示

### 2. 真实版本（展示核心价值）
- **页面**: `index-real.html`  
- **API**: `/api/weather-real`
- **特点**: 真实调用 OpenWeatherMap API

---

## 🛠️ 本地运行

### 启动开发服务器：
```bash
# 方式1：使用 npm
npm run dev

# 方式2：使用 vercel CLI
vercel dev
```

### 访问页面：
```bash
# 演示版本（模拟数据）
open http://localhost:3000/index.html

# 真实版本（外部API）
open http://localhost:3000/index-real.html
```

---

## 🧪 测试 API

### 测试演示版本：
```bash
curl -X POST http://localhost:3000/api/weather \
  -H "Content-Type: application/json" \
  -d '{"city":"北京","country":"CN"}'
```

### 测试真实版本：
```bash
curl -X POST http://localhost:3000/api/weather-real \
  -H "Content-Type: application/json" \
  -d '{"city":"北京","country":"CN"}'
```

---

## 💡 关键区别

### `/api/weather` - 演示版本
```javascript
// 返回硬编码的模拟数据
const cityData = cityWeatherMap[city] || {...};
return res.json(processedData);
```

### `/api/weather-real` - 真实版本
```javascript
// 🚀 真正调用外部 API
const response = await fetch('https://api.openweathermap.org/...');
const data = await response.json();
return res.json(data);
```

---

## 🎯 学习路径

1. ✅ **先运行演示版本** - 理解基本概念
2. ✅ **查看代码** - api/weather.js
3. ✅ **运行真实版本** - 看到真正的API调用
4. ✅ **对比代码** - api/weather-real.js
5. ✅ **理解价值** - 为什么需要API

---

## 📊 API 核心价值展示

`/api/weather-real` 展示了：

1. ✅ **外部API调用** - 从 OpenWeatherMap 获取真实数据
2. ✅ **API Key保护** - 密钥隐藏在服务端
3. ✅ **数据聚合** - 并行调用多个API
4. ✅ **错误处理** - 统一的错误处理机制
5. ✅ **数据处理** - 服务端计算和转换

---

## 🌐 部署到 Vercel

```bash
# 部署到生产环境
vercel --prod

# 添加环境变量（如果需要）
# 在 Vercel 项目设置中添加：
# OPENWEATHER_API_KEY = 你的API密钥
```

---

## 📚 更多信息

查看 `API-COMPARISON.md` 了解两个版本的详细对比。
