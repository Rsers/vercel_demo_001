// DeepSeek 文件分析 API - 支持文件上传和文字提取
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
    const { file_url, analysis_type = 'text_extraction', question } = req.body;

    if (!file_url) {
      return res.status(400).json({ error: '文件 URL 不能为空' });
    }

    console.log(`📄 正在分析文件: ${file_url}`);
    console.log(`📝 分析类型: ${analysis_type}`);

    // 🚀 调用 DeepSeek API 进行文件分析
    const DEEPSEEK_API_KEY = 'sk-74770ffee655466ca5e4d45d390964ba';
    const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

    // 根据分析类型生成不同的提示词
    const prompts = {
      text_extraction: '请提取这个文件中的所有文字内容，保持原有的格式和结构。',
      content_analysis: '请分析这个文件的内容，包括主要信息、结构、重点等。',
      summary: '请为这个文件生成一个简洁的摘要。',
      qa: question || '请回答关于这个文件内容的任何问题。',
      translation: '请将这个文件的内容翻译成中文。'
    };

    const systemPrompts = {
      text_extraction: '你是一个专业的文字提取专家，能够准确提取文件中的文字内容。',
      content_analysis: '你是一个专业的文档分析师，能够深入分析文件内容。',
      summary: '你是一个专业的摘要生成专家，能够生成简洁准确的摘要。',
      qa: '你是一个专业的文档问答专家，能够根据文件内容回答问题。',
      translation: '你是一个专业的翻译专家，能够准确翻译文件内容。'
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
            content: [
              {
                type: 'text',
                text: prompts[analysis_type]
              },
              {
                type: 'file',
                file: {
                  url: file_url
                }
              }
            ]
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
        details: '这展示了为什么需要服务端 API - 文件分析需要 AI 服务支持'
      });
    }

    const data = await response.json();
    console.log(`✅ 成功分析文件`);

    // 🔄 处理响应数据
    const analysisResult = data.choices?.[0]?.message?.content || '无法分析文件内容。';

    const processedData = {
      file_url: file_url,
      analysis_type: analysis_type,
      question: question || null,
      result: analysisResult,
      usage: data.usage || null,
      timestamp: new Date().toISOString(),
      apiInfo: {
        source: 'DeepSeek API',
        model: 'deepseek-chat',
        capabilities: [
          '文件上传和分析',
          '文字提取和识别',
          '内容分析和摘要',
          '文档问答'
        ],
        note: '这是通过 Vercel API 集成的 DeepSeek 文件分析服务'
      }
    };

    res.status(200).json(processedData);

  } catch (error) {
    console.error('❌ 文件分析 API 错误:', error);
    res.status(500).json({
      error: '文件分析服务调用失败',
      message: error.message,
      details: '这展示了为什么需要服务端 API - 文件分析服务调用可能失败，需要统一的错误处理'
    });
  }
}
