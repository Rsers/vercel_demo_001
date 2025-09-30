// 资料库管理 API - 存储和管理知识库
export default async function handler(req, res) {
    // 设置 CORS 头部
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 支持 GET 和 POST 请求
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: '只支持 GET 和 POST 请求' });
    }

    // 简单的内存存储（生产环境建议使用数据库）
    // 在 Vercel 环境中，每次请求可能重新初始化，所以我们使用一个更稳定的方式
    if (!global.knowledgeBase) {
        global.knowledgeBase = [];
        console.log('📚 初始化资料库存储');
    }

    // 如果资料库为空，添加一些示例数据
    if (global.knowledgeBase.length === 0) {
        global.knowledgeBase.push(
            {
                id: 'demo-1',
                content: '我们的产品支持7x24小时在线服务，随时为您提供帮助。',
                category: 'service',
                timestamp: new Date().toISOString(),
                created_at: new Date().toISOString()
            },
            {
                id: 'demo-2',
                content: '产品保修期为一年，在保修期内提供免费维修服务。',
                category: 'policy',
                timestamp: new Date().toISOString(),
                created_at: new Date().toISOString()
            },
            {
                id: 'demo-3',
                content: '如需技术支持，请发送邮件至 support@example.com 或拨打客服热线 400-123-4567。',
                category: 'technical',
                timestamp: new Date().toISOString(),
                created_at: new Date().toISOString()
            }
        );
        console.log('📚 添加示例数据到资料库');
    }

    console.log(`📊 当前资料库条目数: ${global.knowledgeBase.length}`);

    try {
        // 处理 GET 和 POST 请求
        let action, content, category = 'general', id;

        if (req.method === 'GET') {
            // GET 请求从 query 参数获取
            action = req.query.action;
            category = req.query.category || 'general';
        } else if (req.method === 'POST') {
            // POST 请求从 body 获取
            action = req.body.action;
            content = req.body.content;
            category = req.body.category || 'general';
            id = req.body.id;
        }

        console.log(`📚 资料库操作: ${action}, 方法: ${req.method}`);

        switch (action) {
            case 'add':
                return handleAddKnowledge(req, res, content, category);
            case 'get':
                return handleGetKnowledge(req, res, category);
            case 'delete':
                return handleDeleteKnowledge(req, res, id);
            case 'search':
                return handleSearchKnowledge(req, res, content);
            default:
                return res.status(400).json({ error: '无效的操作类型' });
        }
    } catch (error) {
        console.error('❌ 资料库 API 错误:', error);
        res.status(500).json({
            error: '资料库操作失败',
            message: error.message
        });
    }
}

// 添加知识条目
function handleAddKnowledge(req, res, content, category) {
    if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: '内容不能为空' });
    }

    const knowledgeItem = {
        id: Date.now().toString(),
        content: content.trim(),
        category: category,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString()
    };

    global.knowledgeBase.push(knowledgeItem);

    console.log(`📚 添加知识条目: ${category} - ${content.substring(0, 50)}...`);

    res.status(200).json({
        success: true,
        message: '知识条目添加成功',
        data: knowledgeItem,
        total: global.knowledgeBase.length
    });
}

// 获取所有知识条目
function handleGetKnowledge(req, res, category) {
    let filteredKnowledge = global.knowledgeBase;
    if (category && category !== 'all') {
        filteredKnowledge = global.knowledgeBase.filter(item => item.category === category);
    }

    console.log(`📖 获取资料库: ${category || 'all'}, 共 ${filteredKnowledge.length} 条`);

    res.status(200).json({
        success: true,
        data: filteredKnowledge,
        total: filteredKnowledge.length,
        categories: [...new Set(global.knowledgeBase.map(item => item.category))]
    });
}

// 删除知识条目
function handleDeleteKnowledge(req, res, id) {
    if (!id) {
        return res.status(400).json({ error: 'ID 不能为空' });
    }

    const index = global.knowledgeBase.findIndex(item => item.id === id);
    if (index === -1) {
        return res.status(404).json({ error: '知识条目不存在' });
    }

    const deletedItem = global.knowledgeBase.splice(index, 1)[0];

    console.log(`🗑️ 删除知识条目: ${deletedItem.category} - ${deletedItem.content.substring(0, 50)}...`);

    res.status(200).json({
        success: true,
        message: '知识条目删除成功',
        deleted_item: deletedItem,
        total: global.knowledgeBase.length
    });
}

// 搜索知识条目
function handleSearchKnowledge(req, res, query) {
    if (!query || query.trim().length === 0) {
        return res.status(400).json({ error: '搜索关键词不能为空' });
    }

    const searchTerm = query.trim().toLowerCase();
    const results = global.knowledgeBase.filter(item =>
        item.content.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
    );

    res.status(200).json({
        success: true,
        query: query,
        results: results,
        total: results.length
    });
}
