# Vercel 数据库实践演示

这是一个精简版的 Vercel PostgreSQL 数据库实践项目，专注于数据库的 CRUD 操作。

## 🎯 项目特点

- **精简设计**: 只使用 1 个 Serverless Function，符合 Hobby 计划限制
- **完整功能**: 包含数据库的所有基本操作（增删改查）
- **易于理解**: 代码简洁，注释清晰
- **实用性强**: 真实的数据操作场景

## 📁 项目结构

```
├── api/
│   └── db-demo.js          # 核心数据库 API（唯一需要的函数）
├── index-db-demo.html      # 数据库操作界面
├── package.json            # 项目依赖
└── DATABASE-DEMO-GUIDE.md  # 使用说明
```

## 🚀 部署步骤

### 1. 准备项目
```bash
# 确保代码已提交到 GitHub
git add .
git commit -m "添加数据库演示项目"
git push origin main
```

### 2. 在 Vercel 中部署
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 选择你的 GitHub 仓库
4. 点击 "Deploy"

### 3. 添加 PostgreSQL 数据库
1. 在项目页面点击 "Storage" 标签
2. 点击 "Create Database"
3. 选择 "PostgreSQL"
4. 等待数据库创建完成

### 4. 开始使用
访问 `https://your-app.vercel.app/index-db-demo.html`

## 💡 功能说明

### 数据库操作
- **初始化**: 创建 `demo_users` 表
- **插入**: 添加新用户（姓名、邮箱、年龄、城市）
- **查询**: 显示所有用户或搜索特定用户
- **更新**: 修改用户信息
- **删除**: 删除用户记录
- **统计**: 查看用户统计信息

### API 端点
所有操作都通过 `/api/db-demo` 端点处理：

```javascript
// 请求格式
{
  "action": "操作类型",
  "data": "操作数据"
}
```

**支持的操作类型**:
- `init` - 初始化数据库
- `insert` - 插入数据
- `select` - 查询数据
- `update` - 更新数据
- `delete` - 删除数据
- `search` - 搜索数据
- `stats` - 获取统计信息

## 🗄️ 数据库结构

### demo_users 表
```sql
CREATE TABLE demo_users (
  id SERIAL PRIMARY KEY,           -- 主键
  name VARCHAR(100) NOT NULL,      -- 姓名
  email VARCHAR(100) UNIQUE NOT NULL, -- 邮箱（唯一）
  age INTEGER,                     -- 年龄
  city VARCHAR(50),                -- 城市
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 创建时间
);
```

## 🎮 使用流程

1. **初始化数据库**
   - 点击"初始化数据库"按钮
   - 只需要执行一次

2. **添加用户**
   - 填写用户信息表单
   - 点击"添加用户"

3. **查看用户列表**
   - 点击"刷新列表"
   - 查看所有用户数据

4. **搜索用户**
   - 在搜索框输入关键词
   - 支持按姓名、邮箱、城市搜索

5. **管理用户**
   - 点击"编辑"修改用户信息
   - 点击"删除"删除用户

6. **查看统计**
   - 点击"刷新统计"
   - 查看用户数量和分布

## 🔧 技术实现

### 后端 (db-demo.js)
- 使用 `@vercel/postgres` 连接数据库
- 参数化查询防止 SQL 注入
- 统一的错误处理
- CORS 支持

### 前端 (index-db-demo.html)
- 原生 HTML/CSS/JavaScript
- 响应式设计
- 实时数据更新
- 用户友好的界面

## 📊 实践要点

### 数据库操作
1. **连接管理**: Vercel 自动管理数据库连接池
2. **参数化查询**: 使用 `sql` 模板标签防止注入
3. **错误处理**: 完善的错误捕获和用户提示
4. **数据类型**: 正确处理 NULL 值和数据类型转换

### 性能优化
1. **索引**: 邮箱字段有唯一索引
2. **查询优化**: 使用 ILIKE 进行模糊搜索
3. **分页**: 大数据量时考虑添加分页功能

## 🚨 注意事项

1. **数据安全**: 这是演示项目，生产环境需要更严格的安全措施
2. **数据备份**: 重要数据需要定期备份
3. **性能监控**: 监控数据库查询性能
4. **错误日志**: 查看 Vercel 函数日志排查问题

## 🎓 学习收获

通过这个项目，你可以学会：
- Vercel PostgreSQL 的基本使用
- Serverless Functions 的开发
- 数据库 CRUD 操作
- 前后端数据交互
- 错误处理和用户体验优化

这是一个很好的 Vercel 数据库入门项目，适合学习和实践！
