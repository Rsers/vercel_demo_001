// 使用免费 API 的天气查询 - 无需 API Key
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

    console.log(`🌐 正在调用免费天气 API 获取 ${city} 的天气数据...`);

    // 🚀 使用免费的 wttr.in API（无需 API Key）
    const weatherUrl = `https://wttr.in/${encodeURIComponent(city)}?format=j1&lang=zh`;
    
    console.log(`📡 调用 API: ${weatherUrl}`);
    
    const response = await fetch(weatherUrl, {
      headers: {
        'User-Agent': 'Vercel-Demo-App/1.0'
      }
    });

    console.log(`📊 API 响应状态: ${response.status}`);

    if (!response.ok) {
      throw new Error(`天气 API 调用失败: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ 成功从 wttr.in 获取数据`);

    // 🔄 处理数据格式
    const current = data.current_condition?.[0];
    const location = data.nearest_area?.[0];
    
    if (!current) {
      throw new Error('无法获取天气数据');
    }

    // 📊 生成未来几天的预报
    const forecast = data.weather?.slice(0, 5).map((day, index) => ({
      dt: Date.now() / 1000 + (index * 86400),
      main: {
        temp_max: parseInt(day.maxtempC),
        temp_min: parseInt(day.mintempC)
      },
      weather: [{
        main: getWeatherMain(day.hourly?.[0]?.weatherDesc?.[0]?.value || 'Clear'),
        description: day.hourly?.[0]?.weatherDesc?.[0]?.value || '晴朗'
      }]
    })) || [];

    const processedData = {
      location: {
        name: location?.areaName?.[0]?.value || city,
        country: location?.country?.[0]?.value || country,
        lat: parseFloat(location?.latitude) || 39.9042,
        lon: parseFloat(location?.longitude) || 116.4074
      },
      current: {
        main: {
          temp: parseInt(current.temp_C),
          humidity: parseInt(current.humidity),
          pressure: parseInt(current.pressure)
        },
        weather: [{
          main: getWeatherMain(current.weatherDesc?.[0]?.value || 'Clear'),
          description: current.weatherDesc?.[0]?.value || '晴朗'
        }],
        wind: {
          speed: parseInt(current.windspeedKmph)
        },
        visibility: parseInt(current.visibility)
      },
      forecast: {
        list: forecast
      },
      timestamp: new Date().toISOString(),
      apiInfo: {
        source: 'wttr.in (免费 API)',
        weatherAPI: '真实数据',
        forecastAPI: '真实数据',
        aggregation: '服务端数据聚合完成',
        note: '这是从免费外部 API 获取的真实天气数据，无需 API Key'
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

// 将中文天气描述转换为 OpenWeatherMap 格式
function getWeatherMain(weatherDesc) {
  const weatherMap = {
    '晴朗': 'Clear',
    '多云': 'Clouds', 
    '小雨': 'Rain',
    '阴天': 'Clouds',
    'Clear': 'Clear',
    'Partly cloudy': 'Clouds',
    'Cloudy': 'Clouds',
    'Light rain': 'Rain',
    'Heavy rain': 'Rain'
  };
  return weatherMap[weatherDesc] || 'Clear';
}
