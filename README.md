# Vercel 演示项目

这是一个简单的 Vercel 演示项目，用于学习和体验 Vercel 的部署功能。

## 项目特点

- 🎨 现代化的响应式设计
- ⚡ 快速加载和部署
- 📱 完美适配移动端
- 🌍 全球 CDN 加速
- 🔄 自动部署更新

## 技术栈

- HTML5
- CSS3 (渐变、毛玻璃效果)
- JavaScript (交互效果)
- Vercel 平台

## 快速开始

### 本地开发

1. 克隆项目
```bash
git clone https://github.com/Rsers/vercel_demo_001.git
cd vercel_demo_001
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

### 部署到 Vercel

#### 方法一：通过 Vercel CLI

1. 安装 Vercel CLI
```bash
npm i -g vercel
```

2. 登录 Vercel
```bash
vercel login
```

3. 部署项目
```bash
vercel
```

#### 方法二：通过 GitHub 集成

1. 将代码推送到 GitHub
2. 在 [Vercel Dashboard](https://vercel.com/dashboard) 中导入项目
3. 选择 GitHub 仓库
4. 自动部署完成

## 项目结构

```
vercel_demo_001/
├── index.html          # 主页面
├── package.json        # 项目配置
├── vercel.json         # Vercel 部署配置
└── README.md          # 项目说明
```

## 功能说明

- **响应式设计**: 使用 CSS Grid 和 Flexbox 实现完美适配
- **毛玻璃效果**: 使用 `backdrop-filter` 实现现代化视觉效果
- **交互效果**: JavaScript 实现鼠标跟随和点击动画
- **性能优化**: 配置了缓存策略和静态资源优化

## 学习要点

通过这个项目，你可以学习到：

1. **Vercel 基础配置**: 了解 `vercel.json` 的配置方法
2. **静态网站部署**: 学习如何部署纯静态网站
3. **现代 CSS 技术**: 渐变、毛玻璃、响应式设计
4. **前端交互**: 基础的 JavaScript 交互效果

## 下一步

- 尝试添加更多页面
- 集成 API 功能
- 添加数据库支持
- 实现用户认证

## 许可证

MIT License

## 作者

Rsers

---

**开始你的 Vercel 之旅吧！** 🚀
