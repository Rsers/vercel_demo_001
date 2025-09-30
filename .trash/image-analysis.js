// DeepSeek 综合图片分析 API - 多模态理解功能
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
        const { image_url, question, analysis_type = 'general', language = 'auto' } = req.body;

        if (!image_url) {
            return res.status(400).json({ error: '图片 URL 不能为空' });
        }

        console.log(`🖼️ 正在分析图片: ${image_url}`);
        console.log(`📝 分析类型: ${analysis_type}`);

        // 🚀 调用 DeepSeek API 进行图片分析
        const DEEPSEEK_API_KEY = 'sk-74770ffee655466ca5e4d45d390964ba';
        const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

        // 根据分析类型生成不同的提示词
        const prompts = {
            general: '请详细分析这张图片的内容，包括主要对象、场景、颜色、构图等。',
            ocr: getOCRPrompt(language),
            qa: question || '请回答关于这张图片的任何问题。',
            description: '请用简洁的语言描述这张图片的主要内容。',
            technical: '请从技术角度分析这张图片，包括拍摄角度、光线、构图技巧等。'
        };

        const systemPrompts = {
            general: '你是一个专业的图片分析师，能够详细分析图片内容。',
            ocr: '你是一个专业的OCR文字识别专家，能够准确提取图片中的文字内容，保持原有的格式和布局。',
            qa: '你是一个图片问答专家，能够根据图片内容准确回答问题。请基于图片内容提供详细、准确的回答。',
            description: '你是一个图片描述专家，能够简洁准确地描述图片内容。',
            technical: '你是一个摄影技术专家，能够从技术角度分析图片。'
        };

        // 构建消息内容
        let userContent;
        if (analysis_type === 'qa' && question) {
            userContent = [
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
            ];
        } else {
            userContent = [
                {
                    type: 'text',
                    text: prompts[analysis_type]
                },
                {
                    type: 'image_url',
                    image_url: {
                        url: image_url
                    }
                }
            ];
        }

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
                        content: userContent
                    }
                ],
                stream: false,
                temperature: analysis_type === 'ocr' ? 0.1 : 0.3, // OCR 使用低温度确保准确性
                max_tokens: analysis_type === 'ocr' ? 3000 : 2000
            })
        });

        console.log(`📡 DeepSeek API 响应状态: ${response.status}`);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('DeepSeek API 错误:', errorData);
            return res.status(400).json({
                error: `图片分析失败: ${errorData.error?.message || '未知错误'}`,
                details: '这展示了为什么需要服务端 API - 图片分析需要 AI 服务支持'
            });
        }

        const data = await response.json();
        console.log(`✅ 成功分析图片`);

        // 🔄 处理响应数据
        const analysisResult = data.choices?.[0]?.message?.content || '无法分析图片内容。';

        // 根据分析类型返回不同的数据结构
        let processedData;
        switch (analysis_type) {
            case 'ocr':
                processedData = {
                    image_url: image_url,
                    analysis_type: analysis_type,
                    language: language,
                    extracted_text: analysisResult,
                    usage: data.usage || null,
                    timestamp: new Date().toISOString(),
                    apiInfo: {
                        source: 'DeepSeek API',
                        model: 'deepseek-chat',
                        capability: 'OCR 文字识别',
                        note: '这是通过 Vercel API 集成的 DeepSeek OCR 文字识别服务'
                    }
                };
                break;
            case 'qa':
                processedData = {
                    image_url: image_url,
                    analysis_type: analysis_type,
                    question: question,
                    answer: analysisResult,
                    usage: data.usage || null,
                    timestamp: new Date().toISOString(),
                    apiInfo: {
                        source: 'DeepSeek API',
                        model: 'deepseek-chat',
                        capability: '图片问答',
                        note: '这是通过 Vercel API 集成的 DeepSeek 图片问答服务'
                    }
                };
                break;
            default:
                processedData = {
                    image_url: image_url,
                    analysis_type: analysis_type,
                    question: question || null,
                    result: analysisResult,
                    usage: data.usage || null,
                    timestamp: new Date().toISOString(),
                    apiInfo: {
                        source: 'DeepSeek API',
                        model: 'deepseek-chat',
                        capabilities: [
                            '图片内容分析',
                            'OCR 文字识别',
                            '图片问答',
                            '多模态理解'
                        ],
                        note: '这是通过 Vercel API 集成的 DeepSeek 多模态图片分析服务'
                    }
                };
        }

        res.status(200).json(processedData);

    } catch (error) {
        console.error('❌ 图片分析 API 错误:', error);
        res.status(500).json({
            error: '图片分析服务调用失败',
            message: error.message,
            details: '这展示了为什么需要服务端 API - 图片分析服务调用可能失败，需要统一的错误处理'
        });
    }
}

// OCR 语言提示词生成函数
function getOCRPrompt(language) {
    const languagePrompts = {
        auto: '请提取图片中的所有文字内容，保持原有的格式和布局。如果包含多种语言，请分别识别。',
        chinese: '请提取图片中的所有中文文字内容，保持原有的格式和布局。',
        english: '请提取图片中的所有英文文字内容，保持原有的格式和布局。',
        mixed: '请提取图片中的所有文字内容，包括中文、英文等，保持原有的格式和布局。'
    };
    return languagePrompts[language] || languagePrompts.auto;
}
