// RAG 检索增强生成 API - 专业的知识检索系统
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

    if (req.method !== 'POST') {
        return res.status(405).json({ error: '只支持 POST 请求' });
    }

    try {
        const { query, context_type = 'all', max_results = 5, similarity_threshold = 0.3 } = req.body;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({ error: '查询内容不能为空' });
        }

        console.log(`🔍 RAG 检索: "${query}", 类型: ${context_type}`);

        // 🚀 执行 RAG 检索
        const searchResults = await performRAGSearch(query, context_type, max_results, similarity_threshold);

        // 📊 构建检索结果
        const ragResponse = {
            query: query,
            context_type: context_type,
            results: searchResults,
            total_found: searchResults.length,
            confidence_score: calculateConfidenceScore(searchResults),
            retrieval_metadata: {
                search_strategy: 'semantic_similarity',
                max_results: max_results,
                similarity_threshold: similarity_threshold,
                timestamp: new Date().toISOString()
            }
        };

        console.log(`✅ RAG 检索完成，找到 ${searchResults.length} 条相关结果`);

        res.status(200).json(ragResponse);

    } catch (error) {
        console.error('❌ RAG 检索 API 错误:', error);
        res.status(500).json({
            error: 'RAG 检索失败',
            message: error.message,
            details: '检索增强生成系统调用失败'
        });
    }
}

// 执行 RAG 检索
async function performRAGSearch(query, contextType, maxResults, threshold) {
    // 初始化知识库（如果不存在）
    if (!global.knowledgeBase) {
        await initializeKnowledgeBase();
    }

    // 1. 查询预处理
    const processedQuery = preprocessQuery(query);

    // 2. 语义相似度计算
    const similarityScores = calculateSimilarityScores(processedQuery, global.knowledgeBase);

    // 3. 过滤和排序
    const filteredResults = similarityScores
        .filter(item => {
            // 按上下文类型过滤
            if (contextType !== 'all' && item.knowledge.category !== contextType) {
                return false;
            }
            // 按相似度阈值过滤
            return item.similarity >= threshold;
        })
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, maxResults);

    // 4. 构建检索结果
    return filteredResults.map(item => ({
        id: item.knowledge.id,
        content: item.knowledge.content,
        category: item.knowledge.category,
        similarity_score: item.similarity,
        relevance_reason: generateRelevanceReason(item.knowledge.content, processedQuery),
        metadata: {
            created_at: item.knowledge.created_at,
            confidence_level: getConfidenceLevel(item.similarity)
        }
    }));
}

// 初始化知识库
async function initializeKnowledgeBase() {
    global.knowledgeBase = [
        {
            id: 'product-001',
            content: '我们的旗舰产品是一款智能客服系统，支持多语言对话、情感分析和知识库管理。',
            category: 'product',
            keywords: ['产品', '智能客服', '多语言', '情感分析', '知识库'],
            created_at: new Date().toISOString()
        },
        {
            id: 'service-001',
            content: '我们提供7x24小时专业技术支持，响应时间不超过2小时，支持电话、邮件和在线聊天。',
            category: 'service',
            keywords: ['技术支持', '7x24', '响应时间', '电话', '邮件', '在线聊天'],
            created_at: new Date().toISOString()
        },
        {
            id: 'policy-001',
            content: '产品保修期为12个月，在保修期内提供免费维修和更换服务，不包括人为损坏。',
            category: 'policy',
            keywords: ['保修期', '12个月', '免费维修', '更换', '人为损坏'],
            created_at: new Date().toISOString()
        },
        {
            id: 'technical-001',
            content: '系统支持API集成，提供RESTful接口，支持Webhook回调，文档可在开发者中心查看。',
            category: 'technical',
            keywords: ['API', '集成', 'RESTful', 'Webhook', '回调', '文档', '开发者中心'],
            created_at: new Date().toISOString()
        },
        {
            id: 'faq-001',
            content: '常见问题：如何重置密码？请访问登录页面，点击"忘记密码"，输入邮箱地址即可收到重置链接。',
            category: 'faq',
            keywords: ['重置密码', '忘记密码', '邮箱', '重置链接'],
            created_at: new Date().toISOString()
        }
    ];

    console.log('📚 RAG 知识库初始化完成，包含结构化数据');
}

// 查询预处理
function preprocessQuery(query) {
    return {
        original: query,
        normalized: query.toLowerCase().trim(),
        keywords: extractKeywords(query),
        intent: classifyIntent(query)
    };
}

// 提取关键词
function extractKeywords(query) {
    const commonWords = ['的', '是', '在', '有', '和', '与', '或', '如何', '什么', '怎么', '为什么'];
    return query.toLowerCase()
        .split(/[\s,，。！？]/)
        .filter(word => word.length > 1 && !commonWords.includes(word));
}

// 意图分类
function classifyIntent(query) {
    const intents = {
        product: ['产品', '功能', '特性', '版本', '价格'],
        service: ['服务', '支持', '帮助', '联系', '客服'],
        policy: ['政策', '条款', '保修', '退款', '隐私'],
        technical: ['技术', 'API', '集成', '开发', '文档'],
        faq: ['问题', '常见', '如何', '怎么', '为什么']
    };

    for (const [intent, keywords] of Object.entries(intents)) {
        if (keywords.some(keyword => query.includes(keyword))) {
            return intent;
        }
    }
    return 'general';
}

// 计算相似度分数
function calculateSimilarityScores(processedQuery, knowledgeBase) {
    return knowledgeBase.map(knowledge => {
        const similarity = calculateTextSimilarity(
            processedQuery.normalized,
            knowledge.content.toLowerCase(),
            processedQuery.keywords,
            knowledge.keywords || []
        );

        return {
            knowledge,
            similarity
        };
    });
}

// 文本相似度计算（简化版）
function calculateTextSimilarity(query, content, queryKeywords, contentKeywords) {
    let score = 0;

    // 1. 关键词匹配
    const matchedKeywords = queryKeywords.filter(keyword =>
        contentKeywords.includes(keyword) || content.includes(keyword)
    );
    score += matchedKeywords.length * 0.3;

    // 2. 完整匹配
    if (content.includes(query)) {
        score += 0.8;
    }

    // 3. 部分匹配
    const queryWords = query.split(' ');
    const contentWords = content.split(' ');
    const matchedWords = queryWords.filter(word =>
        contentWords.some(contentWord => contentWord.includes(word))
    );
    score += matchedWords.length * 0.1;

    // 4. 意图匹配
    if (processedQuery.intent === 'general' || processedQuery.intent === knowledge.category) {
        score += 0.2;
    }

    return Math.min(score, 1.0);
}

// 生成相关性原因
function generateRelevanceReason(content, processedQuery) {
    const matchedKeywords = processedQuery.keywords.filter(keyword =>
        content.toLowerCase().includes(keyword)
    );

    if (matchedKeywords.length > 0) {
        return `匹配关键词: ${matchedKeywords.join(', ')}`;
    }

    if (content.toLowerCase().includes(processedQuery.normalized)) {
        return '包含完整查询内容';
    }

    return '语义相似度匹配';
}

// 获取置信度等级
function getConfidenceLevel(similarity) {
    if (similarity >= 0.8) return 'high';
    if (similarity >= 0.5) return 'medium';
    return 'low';
}

// 计算整体置信度分数
function calculateConfidenceScore(results) {
    if (results.length === 0) return 0;

    const avgSimilarity = results.reduce((sum, result) => sum + result.similarity_score, 0) / results.length;
    const resultCount = Math.min(results.length / 5, 1); // 结果数量因子

    return Math.round((avgSimilarity * 0.7 + resultCount * 0.3) * 100) / 100;
}
