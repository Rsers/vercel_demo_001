# 数据库方案对比

## 🔍 当前项目状态

### 📊 两个 API 文件对比

| 特性 | `/api/db-simple.js` | `/api/db-demo.js` |
|------|-------------------|------------------|
| **数据库类型** | 模拟 (内存数组) | 真实 (PostgreSQL) |
| **导入语句** | 无 | `import { sql } from '@vercel/postgres'` |
| **数据存储** | `global.users` 数组 | PostgreSQL 表 |
| **持久化** | ❌ 重启后丢失 | ✅ 真正持久化 |
| **查询能力** | 基础数组操作 | 完整 SQL 查询 |
| **事务支持** | ❌ | ✅ |
| **并发安全** | ❌ | ✅ |
| **生产就绪** | ❌ 仅演示 | ✅ |

### 🎯 代码对比

#### 模拟数据库 (`db-simple.js`)
```javascript
// 模拟数据存储
if (!global.users) {
  global.users = [
    { id: 1, name: '张三', email: 'zhangsan@example.com' },
    { id: 2, name: '李四', email: 'lisi@example.com' }
  ];
}

// 简单数组操作
const users = global.users;
users.push(newUser);
```

#### 真实数据库 (`db-demo.js`)
```javascript
// 真实数据库连接
import { sql } from '@vercel/postgres';

// SQL 查询
const users = await sql`
  SELECT * FROM demo_users 
  ORDER BY created_at DESC
`;

// SQL 插入
const result = await sql`
  INSERT INTO demo_users (name, email, age, city)
  VALUES (${name}, ${email}, ${age}, ${city})
  RETURNING *
`;
```

## 🚀 升级步骤

### 1. 确保 Vercel 项目有 PostgreSQL 数据库

在 Vercel Dashboard 中：
1. 进入你的项目
2. 点击 "Storage" 标签
3. 如果没有数据库，点击 "Create Database"
4. 选择 "PostgreSQL"

### 2. 初始化数据库表

访问：`https://your-app.vercel.app/api/db-demo`

发送 POST 请求：
```bash
curl -X POST https://your-app.vercel.app/api/db-demo \
  -H "Content-Type: application/json" \
  -d '{"action": "init"}'
```

### 3. 测试真实数据库

现在你的前端会调用 `/api/db-demo`，使用真实的 PostgreSQL 数据库！

## 📈 功能对比

### 模拟数据库功能
- ✅ 基本的 CRUD 操作
- ✅ 简单的搜索
- ✅ 基础统计
- ❌ 数据持久化
- ❌ 复杂查询
- ❌ 事务支持

### 真实数据库功能
- ✅ 完整的 CRUD 操作
- ✅ 强大的搜索和过滤
- ✅ 复杂统计和聚合
- ✅ 真正的数据持久化
- ✅ 事务和并发控制
- ✅ 索引优化
- ✅ 数据完整性约束

## 🎓 学习要点

### Serverless 函数的特点
1. **无状态**: 函数执行完毕后，内存被清空
2. **冷启动**: 每次调用可能启动新的实例
3. **分布式**: 不同请求可能运行在不同服务器上

### 为什么需要外部数据库？
- **内存数据会丢失**
- **无法在请求间共享数据**
- **需要持久化存储**
- **需要事务支持**

### 渐进式开发策略
1. **阶段 1**: 模拟数据 (快速原型)
2. **阶段 2**: 内存持久化 (演示)
3. **阶段 3**: 真实数据库 (生产)

## 🔧 故障排除

### 如果切换到真实数据库后出现错误：

1. **检查数据库连接**:
   ```bash
   # 测试数据库连接
   curl -X POST https://your-app.vercel.app/api/db-demo \
     -H "Content-Type: application/json" \
     -d '{"action": "test"}'
   ```

2. **初始化数据库表**:
   ```bash
   # 创建必要的表
   curl -X POST https://your-app.vercel.app/api/db-demo \
     -H "Content-Type: application/json" \
     -d '{"action": "init"}'
   ```

3. **查看 Vercel 日志**:
   - 进入 Vercel Dashboard
   - 查看 Functions 日志
   - 检查错误信息

## 🎉 总结

现在你理解了：
- **模拟数据库 vs 真实数据库的区别**
- **为什么需要外部数据存储**
- **Serverless 架构的特点**
- **渐进式开发的价值**

你现在可以享受真正的数据库持久化了！🚀
