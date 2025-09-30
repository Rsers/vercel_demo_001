// 支持多种 HTTP 方法的 API 接口
export default function handler(req, res) {
    // 设置 CORS 头部
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // 处理 OPTIONS 请求（预检请求）
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { method } = req;
    const { id } = req.query;

    try {
        switch (method) {
            case 'GET':
                // 获取所有任务或特定任务
                if (id) {
                    // 模拟获取特定任务
                    const task = {
                        id: parseInt(id),
                        title: `任务 ${id}`,
                        description: `这是任务 ${id} 的描述`,
                        completed: false,
                        createdAt: new Date().toISOString()
                    };
                    res.status(200).json({ task });
                } else {
                    // 模拟获取所有任务
                    const tasks = [
                        { id: 1, title: '学习 Vercel API', completed: true },
                        { id: 2, title: '构建项目', completed: false },
                        { id: 3, title: '部署到 Vercel', completed: false }
                    ];
                    res.status(200).json({ tasks });
                }
                break;

            case 'POST':
                // 创建新任务
                const { title, description } = req.body;
                if (!title) {
                    return res.status(400).json({ error: '标题是必填字段' });
                }

                const newTask = {
                    id: Date.now(),
                    title,
                    description: description || '',
                    completed: false,
                    createdAt: new Date().toISOString()
                };

                res.status(201).json({
                    message: '任务创建成功',
                    task: newTask
                });
                break;

            case 'PUT':
                // 更新任务
                if (!id) {
                    return res.status(400).json({ error: '缺少任务 ID' });
                }

                const { title: updateTitle, description: updateDescription, completed } = req.body;
                const updatedTask = {
                    id: parseInt(id),
                    title: updateTitle || `任务 ${id}`,
                    description: updateDescription || '',
                    completed: completed || false,
                    updatedAt: new Date().toISOString()
                };

                res.status(200).json({
                    message: '任务更新成功',
                    task: updatedTask
                });
                break;

            case 'DELETE':
                // 删除任务
                if (!id) {
                    return res.status(400).json({ error: '缺少任务 ID' });
                }

                res.status(200).json({
                    message: `任务 ${id} 已删除`,
                    deletedId: parseInt(id)
                });
                break;

            default:
                res.status(405).json({ error: `不支持 ${method} 方法` });
        }
    } catch (error) {
        console.error('API 错误:', error);
        res.status(500).json({
            error: '服务器内部错误',
            message: error.message
        });
    }
}
