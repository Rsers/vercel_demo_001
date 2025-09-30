// DeepSeek AI 聊天 API - 基于 RAG 的智能客服
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
    const { message, model = 'deepseek-chat', use_rag = true, context_type = 'all' } = req.body;

    if (!message) {
      return res.status(400).json({ error: '消息内容不能为空' });
    }

    console.log(`🤖 RAG 智能客服处理: "${message}", 使用 RAG: ${use_rag}`);

    // 🚀 RAG 检索增强生成
    let ragContext = '';
    let ragMetadata = null;

    if (use_rag) {
      const ragResult = await performRAGRetrieval(message, context_type);
      ragContext = ragResult.context;
      ragMetadata = ragResult.metadata;
      console.log(`📚 RAG 检索结果: ${ragResult.found ? '找到相关信息' : '未找到相关信息'}`);
    }

    // 🚀 调用 DeepSeek API
    const DEEPSEEK_API_KEY = 'sk-74770ffee655466ca5e4d45d390964ba';
    const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

    // 构建增强的系统提示词
    let systemPrompt = buildSystemPrompt(ragContext, ragMetadata);

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        stream: false,
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    console.log(`📡 DeepSeek API 响应状态: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('DeepSeek API 错误:', errorData);
      return res.status(400).json({
        error: `DeepSeek API 调用失败: ${errorData.error?.message || '未知错误'}`,
        details: '这展示了为什么需要服务端 API - 外部 AI 服务调用需要错误处理'
      });
    }

    const data = await response.json();
    console.log(`✅ 成功从 DeepSeek 获取 AI 响应`);

    // 🔄 处理响应数据
    const aiResponse = data.choices?.[0]?.message?.content || '抱歉，我无法生成回复。';

    // 📊 一致性校验
    const consistencyCheck = await performConsistencyCheck(message, aiResponse, ragContext);

    const processedData = {
      message: message,
      response: aiResponse,
      model: model,
      use_rag: use_rag,
      rag_context: ragContext,
      rag_metadata: ragMetadata,
      consistency_check: consistencyCheck,
      usage: data.usage || null,
      timestamp: new Date().toISOString(),
      apiInfo: {
        source: 'DeepSeek API + RAG System',
        model: model,
        rag_enabled: use_rag,
        consistency_validated: consistencyCheck.passed,
        note: '这是基于 RAG 检索增强生成的智能客服系统'
      }
    };

    res.status(200).json(processedData);

  } catch (error) {
    console.error('❌ RAG 智能客服 API 错误:', error);
    res.status(500).json({
      error: 'RAG 智能客服调用失败',
      message: error.message,
      details: '这展示了为什么需要服务端 API - RAG 系统调用可能失败，需要统一的错误处理'
    });
  }
}

// RAG 检索增强生成
async function performRAGRetrieval(query, contextType) {
  try {
    // 从文件系统读取知识库
    const knowledgeBase = await loadKnowledgeBaseFromFile();

    console.log(`🔍 执行 RAG 检索: "${query}", 知识库条目数: ${knowledgeBase.length}`);

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
        return item.similarity >= 0.3;
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    console.log(`📊 RAG 检索结果: ${filteredResults.length} 条匹配`);

    if (filteredResults.length > 0) {
      const context = filteredResults.map(item =>
        `[${item.knowledge.category}] ${item.knowledge.content} (相关度: ${item.similarity.toFixed(2)})`
      ).join('\n');

      return {
        context: context,
        metadata: {
          total_found: filteredResults.length,
          confidence_score: calculateConfidenceScore(filteredResults),
          results: filteredResults.map(item => ({
            id: item.knowledge.id,
            content: item.knowledge.content,
            category: item.knowledge.category,
            similarity_score: item.similarity
          }))
        },
        found: true
      };
    }

    return { context: '', metadata: null, found: false };
  } catch (error) {
    console.error('RAG 检索错误:', error);
    return { context: '', metadata: null, found: false };
  }
}

// 从文件系统加载知识库
async function loadKnowledgeBaseFromFile() {
  try {
    const fs = require('fs');
    const path = require('path');
    const knowledgeFilePath = path.join(process.cwd(), 'knowledge-base.json');

    if (fs.existsSync(knowledgeFilePath)) {
      const data = fs.readFileSync(knowledgeFilePath, 'utf8');
      const knowledgeBase = JSON.parse(data);
      console.log(`📚 从文件加载知识库，条目数: ${knowledgeBase.length}`);
      return knowledgeBase;
    } else {
      console.log('📚 知识库文件不存在，返回空数组');
      return [];
    }
  } catch (error) {
    console.error('❌ 加载知识库失败:', error);
    return [];
  }
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

// 文本相似度计算
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

// 计算整体置信度分数
function calculateConfidenceScore(results) {
  if (results.length === 0) return 0;

  const avgSimilarity = results.reduce((sum, result) => sum + result.similarity, 0) / results.length;
  const resultCount = Math.min(results.length / 5, 1);

  return Math.round((avgSimilarity * 0.7 + resultCount * 0.3) * 100) / 100;
}

// 构建系统提示词
function buildSystemPrompt(ragContext, ragMetadata) {
  let systemPrompt = `你是一个专业的AI客服助手，专门帮助用户解答问题。请用中文回答，回答要简洁明了、准确专业。

回答原则：
1. 优先使用提供的资料库信息
2. 如果资料库中没有相关信息，基于你的知识回答
3. 保持专业和友好的语调
4. 如果无法确定答案，诚实说明并建议联系人工客服`;

  if (ragContext) {
    systemPrompt += `\n\n请基于以下资料库内容来回答问题：\n${ragContext}\n\n`;

    if (ragMetadata && ragMetadata.confidence_score > 0.7) {
      systemPrompt += `这些信息具有较高的可信度（置信度: ${ragMetadata.confidence_score}），请优先使用。`;
    } else if (ragMetadata && ragMetadata.confidence_score > 0.4) {
      systemPrompt += `这些信息具有中等可信度（置信度: ${ragMetadata.confidence_score}），请谨慎使用并建议用户核实。`;
    } else {
      systemPrompt += `这些信息的可信度较低，请结合你的知识进行回答。`;
    }
  }

  return systemPrompt;
}

// 一致性校验
async function performConsistencyCheck(question, answer, context) {
  // 简化的 consistency check
  const checks = {
    passed: true,
    issues: [],
    confidence: 0.8
  };

  // 检查答案是否为空
  if (!answer || answer.trim().length < 10) {
    checks.passed = false;
    checks.issues.push('答案过短或为空');
    checks.confidence = 0.2;
  }

  // 检查是否包含"不知道"等不确定词汇
  const uncertainWords = ['不知道', '不确定', '可能', '也许', '大概'];
  const hasUncertainty = uncertainWords.some(word => answer.includes(word));

  if (hasUncertainty) {
    checks.confidence = Math.max(checks.confidence - 0.3, 0.1);
  }

  // 检查是否基于上下文回答
  if (context && !answer.includes('根据') && !answer.includes('基于')) {
    checks.confidence = Math.max(checks.confidence - 0.1, 0.1);
  }

  return checks;
}
