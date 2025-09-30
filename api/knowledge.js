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

    // 简单的内存存储（生产环境建议使用数据库）
    if (!global.knowledgeBase) {
        global.knowledgeBase = [];
    }

    try {
        const { action, content, category = 'general', id } = req.body;

        switch (action) {
            case 'add':
                return handleAddKnowledge(req, res, content, category);
            case 'get':
                return handleGetKnowledge(req, res);
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
function handleGetKnowledge(req, res) {
    const { category } = req.query;

    let filteredKnowledge = global.knowledgeBase;
    if (category && category !== 'all') {
        filteredKnowledge = global.knowledgeBase.filter(item => item.category === category);
    }

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
