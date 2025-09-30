// DeepSeek 文本分析 API - 基于实际支持的功能
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
    const { text, analysis_type = 'general', question } = req.body;

    if (!text) {
      return res.status(400).json({ error: '文本内容不能为空' });
    }

    console.log(`📝 正在分析文本，类型: ${analysis_type}`);

    // 🚀 调用 DeepSeek API 进行文本分析
    const DEEPSEEK_API_KEY = 'sk-74770ffee655466ca5e4d45d390964ba';
    const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

    // 根据分析类型生成不同的提示词
    const prompts = {
      general: `请分析以下文本内容：\n\n${text}`,
      summary: `请为以下文本生成一个简洁的摘要：\n\n${text}`,
      sentiment: `请分析以下文本的情感倾向（正面、负面、中性）：\n\n${text}`,
      keywords: `请从以下文本中提取关键词：\n\n${text}`,
      translation: `请将以下文本翻译成中文：\n\n${text}`,
      qa: question ? `基于以下文本回答问题：\n\n文本：${text}\n\n问题：${question}` : `请分析以下文本内容：\n\n${text}`,
      grammar: `请检查以下文本的语法和表达，并提供改进建议：\n\n${text}`,
      creative: `请基于以下文本内容进行创意扩展：\n\n${text}`
    };

    const systemPrompts = {
      general: '你是一个专业的文本分析师，能够深入分析文本内容。',
      summary: '你是一个专业的摘要生成专家，能够生成简洁准确的摘要。',
      sentiment: '你是一个专业的情感分析专家，能够准确判断文本的情感倾向。',
      keywords: '你是一个专业的关键词提取专家，能够准确提取文本中的关键词。',
      translation: '你是一个专业的翻译专家，能够准确翻译文本内容。',
      qa: '你是一个专业的问答专家，能够根据文本内容回答问题。',
      grammar: '你是一个专业的语法检查专家，能够发现并改进文本中的语法问题。',
      creative: '你是一个专业的创意写作专家，能够基于文本内容进行创意扩展。'
    };

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompts[analysis_type]
          },
          {
            role: 'user',
            content: prompts[analysis_type]
          }
        ],
        stream: false,
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    console.log(`📡 DeepSeek API 响应状态: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('DeepSeek API 错误:', errorData);
      return res.status(400).json({
        error: `DeepSeek API 调用失败: ${errorData.error?.message || '未知错误'}`,
        details: '这展示了为什么需要服务端 API - 文本分析需要 AI 服务支持'
      });
    }

    const data = await response.json();
    console.log(`✅ 成功分析文本`);

    // 🔄 处理响应数据
    const analysisResult = data.choices?.[0]?.message?.content || '无法分析文本内容。';

    const processedData = {
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''), // 截取前100字符用于显示
      analysis_type: analysis_type,
      question: question || null,
      result: analysisResult,
      usage: data.usage || null,
      timestamp: new Date().toISOString(),
      apiInfo: {
        source: 'DeepSeek API',
        model: 'deepseek-chat',
        capabilities: [
          '文本内容分析',
          '摘要生成',
          '情感分析',
          '关键词提取',
          '翻译服务',
          '问答系统',
          '语法检查',
          '创意写作'
        ],
        note: '这是通过 Vercel API 集成的 DeepSeek 文本分析服务'
      }
    };

    res.status(200).json(processedData);

  } catch (error) {
    console.error('❌ 文本分析 API 错误:', error);
    res.status(500).json({
      error: '文本分析服务调用失败',
      message: error.message,
      details: '这展示了为什么需要服务端 API - 文本分析服务调用可能失败，需要统一的错误处理'
    });
  }
}
