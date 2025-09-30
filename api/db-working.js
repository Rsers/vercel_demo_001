export default async function handler(req, res) {
    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { action, data } = req.body;

        // 使用全局变量模拟数据库存储
        if (!global.workingUsers) {
            global.workingUsers = [
                {
                    id: 1,
                    name: '张三',
                    email: 'zhangsan@example.com',
                    age: 25,
                    city: '北京',
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    name: '李四',
                    email: 'lisi@example.com',
                    age: 30,
                    city: '上海',
                    created_at: new Date().toISOString()
                }
            ];
        }

        const users = global.workingUsers;

        switch (action) {
            case 'init':
                return res.status(200).json({
                    success: true,
                    message: '数据库初始化成功（临时版本）',
                    note: '这是临时版本，数据存储在内存中'
                });

            case 'insert':
                if (!data || !data.name || !data.email) {
                    return res.status(400).json({
                        success: false,
                        error: '姓名和邮箱是必填项'
                    });
                }

                // 检查邮箱是否已存在
                const existingUser = users.find(u => u.email === data.email);
                if (existingUser) {
                    return res.status(409).json({
                        success: false,
                        error: '邮箱已存在'
                    });
                }

                const newUser = {
                    id: Math.max(...users.map(u => u.id), 0) + 1,
                    name: data.name,
                    email: data.email,
                    age: data.age || null,
                    city: data.city || null,
                    created_at: new Date().toISOString()
                };

                users.push(newUser);

                return res.status(201).json({
                    success: true,
                    message: '用户创建成功',
                    user: newUser
                });

            case 'select':
                return res.status(200).json({
                    success: true,
                    users: users
                });

            case 'stats':
                const totalUsers = users.length;
                const usersWithAge = users.filter(u => u.age !== null).length;
                const avgAge = usersWithAge > 0 ?
                    Math.round(users.reduce((sum, u) => sum + (u.age || 0), 0) / usersWithAge) : null;

                // 计算城市分布
                const cityStats = {};
                users.forEach(user => {
                    if (user.city) {
                        cityStats[user.city] = (cityStats[user.city] || 0) + 1;
                    }
                });

                const topCities = Object.entries(cityStats)
                    .map(([city, count]) => ({ city, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                return res.status(200).json({
                    success: true,
                    stats: {
                        total_users: totalUsers,
                        users_with_age: usersWithAge,
                        avg_age: avgAge,
                        top_cities: topCities
                    }
                });

            case 'search':
                const searchTerm = data?.search || '';
                const filteredUsers = users.filter(user =>
                    user.name.includes(searchTerm) ||
                    user.email.includes(searchTerm) ||
                    (user.city && user.city.includes(searchTerm))
                );

                return res.status(200).json({
                    success: true,
                    users: filteredUsers
                });

            case 'update':
                if (!data || !data.id) {
                    return res.status(400).json({
                        success: false,
                        error: '用户ID是必填项'
                    });
                }

                const userIndex = users.findIndex(u => u.id === parseInt(data.id));
                if (userIndex === -1) {
                    return res.status(404).json({
                        success: false,
                        error: '用户不存在'
                    });
                }

                users[userIndex] = {
                    ...users[userIndex],
                    name: data.name || users[userIndex].name,
                    email: data.email || users[userIndex].email,
                    age: data.age !== undefined ? data.age : users[userIndex].age,
                    city: data.city !== undefined ? data.city : users[userIndex].city
                };

                return res.status(200).json({
                    success: true,
                    message: '用户信息更新成功',
                    user: users[userIndex]
                });

            case 'delete':
                if (!data || !data.id) {
                    return res.status(400).json({
                        success: false,
                        error: '用户ID是必填项'
                    });
                }

                const deleteIndex = users.findIndex(u => u.id === parseInt(data.id));
                if (deleteIndex === -1) {
                    return res.status(404).json({
                        success: false,
                        error: '用户不存在'
                    });
                }

                const deletedUser = users.splice(deleteIndex, 1)[0];

                return res.status(200).json({
                    success: true,
                    message: '用户删除成功',
                    user: deletedUser
                });

            default:
                return res.status(400).json({
                    success: false,
                    error: '无效的操作类型'
                });
        }

    } catch (error) {
        console.error('数据库操作错误:', error);
        return res.status(500).json({
            success: false,
            error: '数据库操作失败',
            details: error.message
        });
    }
}
