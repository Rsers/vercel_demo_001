// 数据聚合 API - 展示 API 的核心价值
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

    // 这里展示 API 的核心价值：数据聚合和处理
    // 1. 获取天气数据
    const weatherData = await getWeatherData(city, country);
    
    // 2. 获取城市信息
    const cityInfo = await getCityInfo(city, country);
    
    // 3. 获取空气质量数据（模拟）
    const airQuality = await getAirQualityData(city);
    
    // 4. 获取生活指数（模拟）
    const lifeIndex = await getLifeIndexData(weatherData);

    // 5. 数据聚合和分析
    const aggregatedData = {
      city: cityInfo,
      weather: weatherData,
      airQuality: airQuality,
      lifeIndex: lifeIndex,
      recommendations: generateRecommendations(weatherData, airQuality),
      timestamp: new Date().toISOString()
    };

    res.status(200).json(aggregatedData);

  } catch (error) {
    console.error('数据聚合 API 错误:', error);
    res.status(500).json({ 
      error: '服务器内部错误',
      message: error.message
    });
  }
}

// 获取天气数据
async function getWeatherData(city, country) {
  // 模拟调用天气 API
  return {
    temperature: Math.floor(Math.random() * 20) + 10,
    humidity: Math.floor(Math.random() * 40) + 40,
    windSpeed: Math.floor(Math.random() * 10) + 2,
    weather: ['晴朗', '多云', '小雨'][Math.floor(Math.random() * 3)]
  };
}

// 获取城市信息
async function getCityInfo(city, country) {
  // 模拟调用城市信息 API
  return {
    name: city,
    country: country,
    population: Math.floor(Math.random() * 10000000) + 1000000,
    timezone: 'Asia/Shanghai',
    currency: 'CNY'
  };
}

// 获取空气质量数据
async function getAirQualityData(city) {
  // 模拟空气质量数据
  const aqi = Math.floor(Math.random() * 200) + 50;
  let level = '良好';
  if (aqi > 150) level = '轻度污染';
  if (aqi > 200) level = '中度污染';
  if (aqi > 300) level = '重度污染';

  return {
    aqi: aqi,
    level: level,
    pm25: Math.floor(Math.random() * 100) + 20,
    pm10: Math.floor(Math.random() * 150) + 30,
    co: (Math.random() * 5 + 1).toFixed(1),
    no2: Math.floor(Math.random() * 50) + 10
  };
}

// 获取生活指数
async function getLifeIndexData(weatherData) {
  return {
    uv: Math.floor(Math.random() * 10) + 1,
    comfort: Math.floor(Math.random() * 10) + 1,
    carWash: Math.floor(Math.random() * 10) + 1,
    sport: Math.floor(Math.random() * 10) + 1,
    travel: Math.floor(Math.random() * 10) + 1
  };
}

// 生成建议
function generateRecommendations(weather, airQuality) {
  const recommendations = [];
  
  if (weather.temperature > 30) {
    recommendations.push('天气炎热，建议多喝水，避免长时间户外活动');
  }
  
  if (weather.humidity > 80) {
    recommendations.push('湿度较高，注意防潮');
  }
  
  if (airQuality.aqi > 150) {
    recommendations.push('空气质量不佳，建议减少户外活动，佩戴口罩');
  }
  
  if (weather.windSpeed > 8) {
    recommendations.push('风力较大，注意安全');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('天气条件良好，适合户外活动');
  }
  
  return recommendations;
}
