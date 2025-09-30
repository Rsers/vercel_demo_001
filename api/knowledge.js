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

    // 使用文件系统存储（在 Vercel 环境中更可靠）
    const fs = require('fs');
    const path = require('path');

    // 知识库文件路径
    const knowledgeFilePath = path.join(process.cwd(), 'knowledge-base.json');

    // 读取知识库
    let knowledgeBase = [];
    try {
        if (fs.existsSync(knowledgeFilePath)) {
            const data = fs.readFileSync(knowledgeFilePath, 'utf8');
            knowledgeBase = JSON.parse(data);
            console.log(`📚 从文件加载知识库，条目数: ${knowledgeBase.length}`);
        } else {
            // 初始化示例数据
            knowledgeBase = [
                {
                    id: 'demo-1',
                    content: '我们的产品支持7x24小时在线服务，随时为您提供帮助。',
                    category: 'service',
                    keywords: ['产品', '7x24', '在线服务', '帮助'],
                    timestamp: new Date().toISOString(),
                    created_at: new Date().toISOString()
                },
                {
                    id: 'demo-2',
                    content: '产品保修期为一年，在保修期内提供免费维修服务。',
                    category: 'policy',
                    keywords: ['保修期', '一年', '免费维修', '服务'],
                    timestamp: new Date().toISOString(),
                    created_at: new Date().toISOString()
                },
                {
                    id: 'demo-3',
                    content: '如需技术支持，请发送邮件至 support@example.com 或拨打客服热线 400-123-4567。',
                    category: 'technical',
                    keywords: ['技术支持', '邮件', '客服热线', '联系'],
                    timestamp: new Date().toISOString(),
                    created_at: new Date().toISOString()
                }
            ];
            saveKnowledgeBase(knowledgeBase);
            console.log('📚 初始化知识库，包含示例数据');
        }
    } catch (error) {
        console.error('❌ 知识库加载失败:', error);
        knowledgeBase = [];
    }

    console.log(`📊 当前资料库条目数: ${knowledgeBase.length}`);

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
                return handleAddKnowledge(req, res, content, category, knowledgeBase);
            case 'get':
                return handleGetKnowledge(req, res, category, knowledgeBase);
            case 'delete':
                return handleDeleteKnowledge(req, res, id, knowledgeBase);
            case 'search':
                return handleSearchKnowledge(req, res, content, knowledgeBase);
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

// 保存知识库到文件
function saveKnowledgeBase(knowledgeBase) {
    try {
        const fs = require('fs');
        const path = require('path');
        const knowledgeFilePath = path.join(process.cwd(), 'knowledge-base.json');
        fs.writeFileSync(knowledgeFilePath, JSON.stringify(knowledgeBase, null, 2));
        console.log(`💾 知识库已保存，条目数: ${knowledgeBase.length}`);
    } catch (error) {
        console.error('❌ 保存知识库失败:', error);
    }
}

// 添加知识条目
function handleAddKnowledge(req, res, content, category, knowledgeBase) {
    if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: '内容不能为空' });
    }

    const knowledgeItem = {
        id: Date.now().toString(),
        content: content.trim(),
        category: category,
        keywords: extractKeywords(content.trim()),
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString()
    };

    knowledgeBase.push(knowledgeItem);
    saveKnowledgeBase(knowledgeBase);

    console.log(`📚 添加知识条目: ${category} - ${content.substring(0, 50)}...`);

    res.status(200).json({
        success: true,
        message: '知识条目添加成功',
        data: knowledgeItem,
        total: knowledgeBase.length
    });
}

// 获取所有知识条目
function handleGetKnowledge(req, res, category, knowledgeBase) {
    let filteredKnowledge = knowledgeBase;
    if (category && category !== 'all') {
        filteredKnowledge = knowledgeBase.filter(item => item.category === category);
    }

    console.log(`📖 获取资料库: ${category || 'all'}, 共 ${filteredKnowledge.length} 条`);

    res.status(200).json({
        success: true,
        data: filteredKnowledge,
        total: filteredKnowledge.length,
        categories: [...new Set(knowledgeBase.map(item => item.category))]
    });
}

// 删除知识条目
function handleDeleteKnowledge(req, res, id, knowledgeBase) {
    if (!id) {
        return res.status(400).json({ error: 'ID 不能为空' });
    }

    const index = knowledgeBase.findIndex(item => item.id === id);
    if (index === -1) {
        return res.status(404).json({ error: '知识条目不存在' });
    }

    const deletedItem = knowledgeBase.splice(index, 1)[0];
    saveKnowledgeBase(knowledgeBase);

    console.log(`🗑️ 删除知识条目: ${deletedItem.category} - ${deletedItem.content.substring(0, 50)}...`);

    res.status(200).json({
        success: true,
        message: '知识条目删除成功',
        deleted_item: deletedItem,
        total: knowledgeBase.length
    });
}

// 搜索知识条目
function handleSearchKnowledge(req, res, query, knowledgeBase) {
    if (!query || query.trim().length === 0) {
        return res.status(400).json({ error: '搜索关键词不能为空' });
    }

    const searchTerm = query.trim().toLowerCase();
    const results = knowledgeBase.filter(item =>
        item.content.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm) ||
        (item.keywords && item.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm)))
    );

    res.status(200).json({
        success: true,
        query: query,
        results: results,
        total: results.length
    });
}

// 提取关键词
function extractKeywords(content) {
    const commonWords = ['的', '是', '在', '有', '和', '与', '或', '如何', '什么', '怎么', '为什么', '我们', '您', '可以', '支持', '提供'];
    return content.toLowerCase()
        .split(/[\s,，。！？]/)
        .filter(word => word.length > 1 && !commonWords.includes(word))
        .slice(0, 5); // 最多5个关键词
}
