# 📖 使用指南

## 🚨 API Key 问题解决

### 问题：
- OpenWeatherMap API Key 无效 (401 错误)
- 无法获取真实天气数据

### 解决方案：
使用免费的 `wttr.in` API，无需 API Key！

---

## 📊 三个版本对比

| 版本 | API 路径 | 数据来源 | API Key | 推荐度 |
|------|---------|---------|---------|--------|
| **演示版** | `/api/weather` | 硬编码 | ❌ 不需要 | ⭐⭐ |
| **OpenWeather版** | `/api/weather-real` | OpenWeatherMap | ✅ 需要有效 Key | ⭐⭐⭐ |
| **免费版** | `/api/weather-free` | wttr.in | ❌ 不需要 | ⭐⭐⭐⭐⭐ |

---

## 🎯 推荐使用方案

### 🥇 **最佳选择：免费版**
- **页面**: `index-free.html`
- **API**: `/api/weather-free`
- **特点**: 
  - ✅ 真实外部 API 调用
  - ✅ 无需 API Key
  - ✅ 支持中文城市
  - ✅ 完全免费

### 🥈 **备选方案：演示版**
- **页面**: `index.html`
- **API**: `/api/weather`
- **特点**: 
  - ✅ 快速演示
  - ❌ 模拟数据

### 🥉 **高级方案：OpenWeather版**
- **页面**: `index-real.html`
- **API**: `/api/weather-real`
- **特点**: 
  - ✅ 专业 API
  - ❌ 需要有效 API Key

---

## 🚀 快速开始

### 1. 启动服务器
```bash
vercel dev
```

### 2. 访问免费版（推荐）
```bash
open http://localhost:3000/index-free.html
```

### 3. 测试 API
```bash
# 测试免费版 API
curl -X POST http://localhost:3000/api/weather-free \
  -H "Content-Type: application/json" \
  -d '{"city":"北京","country":"CN"}'
```

---

## 🌍 支持的城市

### ✅ 中文城市（完全支持）
- 北京
- 上海
- 深圳
- 广州
- 西安
- 成都
- 杭州
- 武汉

### ✅ 英文城市
- Beijing
- Shanghai
- New York
- London
- Tokyo

---

## 🔍 故障排除

### 问题1: API Key 无效
**解决方案**: 使用 `/api/weather-free`

### 问题2: 城市名称不支持
**解决方案**: 尝试英文名称，如 "Beijing" 而不是 "北京"

### 问题3: 网络连接问题
**解决方案**: 检查网络连接，wttr.in 可能需要科学上网

---

## 📈 性能对比

| 指标 | 演示版 | 免费版 | OpenWeather版 |
|------|--------|--------|-------------|
| 响应速度 | 最快 | 中等 | 中等 |
| 数据真实性 | 模拟 | 真实 | 真实 |
| 稳定性 | 高 | 高 | 高 |
| 成本 | 免费 | 免费 | 付费 |

---

## 💡 学习建议

1. **初学者**: 从演示版开始 (`index.html`)
2. **进阶用户**: 使用免费版 (`index-free.html`)
3. **生产环境**: 配置有效的 OpenWeatherMap API Key

---

## 🔗 相关链接

- [wttr.in API 文档](https://github.com/chubin/wttr.in)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
