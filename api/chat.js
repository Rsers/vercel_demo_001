// DeepSeek AI 聊天 API - 展示 Vercel API 集成功能
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
    const { message, model = 'deepseek-chat' } = req.body;

    if (!message) {
      return res.status(400).json({ error: '消息内容不能为空' });
    }

    console.log(`🤖 正在调用 DeepSeek API，模型: ${model}`);

    // 🚀 调用 DeepSeek API
    const DEEPSEEK_API_KEY = 'sk-74770ffee655466ca5e4d45d390964ba';
    const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

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
            content: '你是一个有用的AI助手，专门帮助用户解答问题。请用中文回答，回答要简洁明了。'
          },
          {
            role: 'user',
            content: message
          }
        ],
        stream: false,
        temperature: 0.7,
        max_tokens: 1000
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

    const processedData = {
      message: message,
      response: aiResponse,
      model: model,
      usage: data.usage || null,
      timestamp: new Date().toISOString(),
      apiInfo: {
        source: 'DeepSeek API',
        model: model,
        integration: 'Vercel Serverless Functions',
        note: '这是通过 Vercel API 集成的真实 AI 聊天服务'
      }
    };

    res.status(200).json(processedData);

  } catch (error) {
    console.error('❌ AI 聊天 API 错误:', error);
    res.status(500).json({
      error: 'AI 服务调用失败',
      message: error.message,
      details: '这展示了为什么需要服务端 API - AI 服务调用可能失败，需要统一的错误处理'
    });
  }
}
