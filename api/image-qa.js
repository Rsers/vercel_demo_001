// DeepSeek 图片问答 API
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
    const { image_url, question } = req.body;

    if (!image_url) {
      return res.status(400).json({ error: '图片 URL 不能为空' });
    }

    if (!question) {
      return res.status(400).json({ error: '问题不能为空' });
    }

    console.log(`❓ 正在回答关于图片的问题: ${question}`);

    // 🚀 调用 DeepSeek API 进行图片问答
    const DEEPSEEK_API_KEY = 'sk-74770ffee655466ca5e4d45d390964ba';
    const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

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
            content: '你是一个专业的图片问答专家，能够根据图片内容准确回答问题。请基于图片内容提供详细、准确的回答。'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: question
              },
              {
                type: 'image_url',
                image_url: {
                  url: image_url
                }
              }
            ]
          }
        ],
        stream: false,
        temperature: 0.5,
        max_tokens: 1500
      })
    });

    console.log(`📡 图片问答 API 响应状态: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('图片问答 API 错误:', errorData);
      return res.status(400).json({
        error: `图片问答失败: ${errorData.error?.message || '未知错误'}`,
        details: '这展示了为什么需要服务端 API - 图片问答需要 AI 服务支持'
      });
    }

    const data = await response.json();
    console.log(`✅ 成功回答图片问题`);

    // 🔄 处理响应数据
    const answer = data.choices?.[0]?.message?.content || '无法回答关于这张图片的问题。';

    const processedData = {
      image_url: image_url,
      question: question,
      answer: answer,
      usage: data.usage || null,
      timestamp: new Date().toISOString(),
      apiInfo: {
        source: 'DeepSeek API',
        model: 'deepseek-chat',
        capability: '图片问答',
        note: '这是通过 Vercel API 集成的 DeepSeek 图片问答服务'
      }
    };

    res.status(200).json(processedData);

  } catch (error) {
    console.error('❌ 图片问答 API 错误:', error);
    res.status(500).json({
      error: '图片问答服务调用失败',
      message: error.message,
      details: '这展示了为什么需要服务端 API - 图片问答服务调用可能失败，需要统一的错误处理'
    });
  }
}
