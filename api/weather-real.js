// 真实的天气查询 API - 调用 OpenWeatherMap API
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
    const { city, country = 'CN' } = req.body;

    if (!city) {
      return res.status(400).json({ error: '城市名称不能为空' });
    }

    // 🚀 这里展示 API 的核心价值：调用真实的外部 API
    const API_KEY = '9362cfa70a5991f30b8e79afb1ca9ec4';
    
    console.log(`🌐 正在调用 OpenWeatherMap API 获取 ${city} 的天气数据...`);

    // 1. 调用当前天气 API
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},${country}&appid=${API_KEY}&units=metric&lang=zh_cn`;
    
    // 2. 调用5天预报 API
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)},${country}&appid=${API_KEY}&units=metric&lang=zh_cn`;

    // 并行调用多个外部 API（展示 API 聚合能力）
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl)
    ]);

    console.log(`📡 API 调用状态 - 当前天气: ${currentResponse.status}, 预报: ${forecastResponse.status}`);

    if (!currentResponse.ok) {
      const errorData = await currentResponse.json();
      return res.status(400).json({ 
        error: `获取天气数据失败: ${errorData.message}`,
        details: '外部 API 调用失败，这展示了为什么需要服务端错误处理'
      });
    }

    // 解析外部 API 返回的数据
    const [currentData, forecastData] = await Promise.all([
      currentResponse.json(),
      forecastResponse.json()
    ]);

    console.log(`✅ 成功从 OpenWeatherMap 获取数据`);

    // 🔄 服务端数据处理和聚合（展示 API 的计算能力）
    const processedData = {
      location: {
        name: currentData.name,
        country: currentData.sys.country,
        lat: currentData.coord.lat,
        lon: currentData.coord.lon
      },
      current: currentData,
      forecast: forecastData,
      timestamp: new Date().toISOString(),
      apiInfo: {
        source: 'OpenWeatherMap API',
        weatherAPI: '真实数据',
        forecastAPI: '真实数据',
        aggregation: '服务端数据聚合完成',
        note: '这是从外部 API 获取的真实天气数据'
      }
    };

    res.status(200).json(processedData);

  } catch (error) {
    console.error('❌ 天气 API 错误:', error);
    res.status(500).json({ 
      error: '外部 API 调用失败',
      message: error.message,
      details: '这展示了为什么需要服务端 API - 外部服务调用可能失败，需要统一的错误处理'
    });
  }
}
