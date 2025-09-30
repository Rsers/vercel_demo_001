// DeepSeek OCR 文字识别 API
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
    const { image_url, language = 'auto' } = req.body;

    if (!image_url) {
      return res.status(400).json({ error: '图片 URL 不能为空' });
    }

    console.log(`📄 正在进行 OCR 文字识别: ${image_url}`);

    // 🚀 调用 DeepSeek API 进行 OCR
    const DEEPSEEK_API_KEY = 'sk-74770ffee655466ca5e4d45d390964ba';
    const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

    const languagePrompts = {
      auto: '请提取图片中的所有文字内容，保持原有的格式和布局。如果包含多种语言，请分别识别。',
      chinese: '请提取图片中的所有中文文字内容，保持原有的格式和布局。',
      english: '请提取图片中的所有英文文字内容，保持原有的格式和布局。',
      mixed: '请提取图片中的所有文字内容，包括中文、英文等，保持原有的格式和布局。'
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
            content: '你是一个专业的OCR文字识别专家，能够准确提取图片中的文字内容，保持原有的格式和布局。'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: languagePrompts[language]
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
        temperature: 0.1, // 低温度确保准确性
        max_tokens: 3000
      })
    });

    console.log(`📡 OCR API 响应状态: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OCR API 错误:', errorData);
      return res.status(400).json({
        error: `OCR 识别失败: ${errorData.error?.message || '未知错误'}`,
        details: '这展示了为什么需要服务端 API - OCR 识别需要 AI 服务支持'
      });
    }

    const data = await response.json();
    console.log(`✅ 成功完成 OCR 识别`);

    // 🔄 处理响应数据
    const ocrResult = data.choices?.[0]?.message?.content || '无法识别图片中的文字。';

    const processedData = {
      image_url: image_url,
      language: language,
      extracted_text: ocrResult,
      usage: data.usage || null,
      timestamp: new Date().toISOString(),
      apiInfo: {
        source: 'DeepSeek API',
        model: 'deepseek-chat',
        capability: 'OCR 文字识别',
        note: '这是通过 Vercel API 集成的 DeepSeek OCR 文字识别服务'
      }
    };

    res.status(200).json(processedData);

  } catch (error) {
    console.error('❌ OCR API 错误:', error);
    res.status(500).json({
      error: 'OCR 识别服务调用失败',
      message: error.message,
      details: '这展示了为什么需要服务端 API - OCR 服务调用可能失败，需要统一的错误处理'
    });
  }
}
