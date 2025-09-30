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
    // 调用内部 RAG 检索 API
    const ragResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/rag-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        context_type: contextType,
        max_results: 3,
        similarity_threshold: 0.3
      })
    });

    if (!ragResponse.ok) {
      console.warn('RAG 检索失败，使用基础检索');
      return { context: '', metadata: null, found: false };
    }

    const ragData = await ragResponse.json();

    if (ragData.results && ragData.results.length > 0) {
      const context = ragData.results.map(result =>
        `[${result.category}] ${result.content} (相关度: ${result.similarity_score})`
      ).join('\n');

      return {
        context: context,
        metadata: {
          total_found: ragData.total_found,
          confidence_score: ragData.confidence_score,
          results: ragData.results
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
