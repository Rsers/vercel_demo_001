// 天气查询 API - 演示版本（无需 API Key）
export default async function handler(req, res) {
  // 设置 CORS 头部
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 处理 OPTIONS 请求（预检请求）
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持 POST 请求' });
  }

  try {
    const { city, country = 'CN' } = req.body;

    if (!city) {
      return res.status(400).json({ error: '城市名称不能为空' });
    }

    // 演示模式：返回模拟的天气数据
    // 这展示了为什么需要 API - 真实天气数据无法在前端生成
    const weatherData = generateDemoWeatherData(city, country);
    
    res.status(200).json(weatherData);

  } catch (error) {
    console.error('天气 API 错误:', error);
    res.status(500).json({ 
      error: '服务器内部错误',
      message: error.message
    });
  }
}

// 生成演示天气数据
function generateDemoWeatherData(city, country) {
  // 模拟不同城市的天气数据
  const cityWeatherMap = {
    '北京': { temp: 15, weather: '多云', humidity: 45, wind: 3 },
    '上海': { temp: 18, weather: '晴朗', humidity: 60, wind: 4 },
    '深圳': { temp: 25, weather: '晴朗', humidity: 70, wind: 2 },
    '广州': { temp: 23, weather: '多云', humidity: 75, wind: 3 },
    '杭州': { temp: 16, weather: '小雨', humidity: 80, wind: 5 },
    '成都': { temp: 12, weather: '阴天', humidity: 65, wind: 2 },
    '西安': { temp: 10, weather: '晴朗', humidity: 40, wind: 4 },
    '武汉': { temp: 14, weather: '多云', humidity: 55, wind: 3 }
  };

  // 获取城市天气数据，如果没有则生成随机数据
  const cityData = cityWeatherMap[city] || {
    temp: Math.floor(Math.random() * 20) + 5,
    weather: ['晴朗', '多云', '小雨', '阴天'][Math.floor(Math.random() * 4)],
    humidity: Math.floor(Math.random() * 40) + 40,
    wind: Math.floor(Math.random() * 8) + 1
  };

  // 生成未来5天的预报
  const forecast = Array.from({ length: 5 }, (_, i) => {
    const baseTemp = cityData.temp;
    const variation = Math.floor(Math.random() * 10) - 5;
    return {
      dt: Date.now() / 1000 + (i * 86400),
      main: {
        temp_max: baseTemp + variation + 2,
        temp_min: baseTemp + variation - 3
      },
      weather: [{
        main: getWeatherMain(cityData.weather),
        description: cityData.weather
      }]
    };
  });

  return {
    location: {
      name: city,
      country: country,
      lat: 39.9042 + (Math.random() - 0.5) * 10,
      lon: 116.4074 + (Math.random() - 0.5) * 10
    },
    current: {
      main: {
        temp: cityData.temp,
        humidity: cityData.humidity,
        pressure: 1013 + Math.floor(Math.random() * 20) - 10
      },
      weather: [{
        main: getWeatherMain(cityData.weather),
        description: cityData.weather
      }],
      wind: {
        speed: cityData.wind
      },
      visibility: Math.floor(Math.random() * 5000) + 5000
    },
    forecast: {
      list: forecast
    },
    timestamp: new Date().toISOString(),
    demo: true,
    note: '这是演示数据。要获取真实天气数据，请设置 OPENWEATHER_API_KEY 环境变量'
  };
}

// 将中文天气描述转换为 OpenWeatherMap 格式
function getWeatherMain(weatherDesc) {
  const weatherMap = {
    '晴朗': 'Clear',
    '多云': 'Clouds', 
    '小雨': 'Rain',
    '阴天': 'Clouds'
  };
  return weatherMap[weatherDesc] || 'Clear';
}