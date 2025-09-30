// 地理位置 API - 必须依赖外部服务
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

  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: '缺少经纬度参数' });
    }

    // 使用免费的地理位置服务
    // 这里必须调用外部 API，无法在前端直接实现
    const geocodingUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${process.env.OPENWEATHER_API_KEY || 'demo_key'}`;

    if (process.env.OPENWEATHER_API_KEY === 'demo_key') {
      // 演示模式
      return res.status(200).json({
        location: {
          name: '演示城市',
          country: 'CN',
          state: '演示省份',
          lat: parseFloat(lat),
          lon: parseFloat(lon)
        },
        demo: true,
        timestamp: new Date().toISOString()
      });
    }

    const response = await fetch(geocodingUrl);
    
    if (!response.ok) {
      throw new Error('地理位置服务不可用');
    }

    const data = await response.json();
    
    if (data.length === 0) {
      return res.status(404).json({ error: '未找到该位置的信息' });
    }

    const location = data[0];
    
    res.status(200).json({
      location: {
        name: location.name,
        country: location.country,
        state: location.state,
        lat: location.lat,
        lon: location.lon
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('地理位置 API 错误:', error);
    res.status(500).json({ 
      error: '服务器内部错误',
      message: error.message
    });
  }
}
