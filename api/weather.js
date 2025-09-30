// 天气查询 API - 必须依赖外部 API 才能实现
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

        // 这里必须使用外部 API，无法在前端实现
        // 使用 OpenWeatherMap API（免费版本）
        const API_KEY = process.env.OPENWEATHER_API_KEY || 'demo_key';

        // 如果使用演示模式，返回模拟数据
        if (API_KEY === 'demo_key') {
            return getDemoWeatherData(city, country);
        }

        // 获取当前天气
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${API_KEY}&units=metric&lang=zh_cn`;

        // 获取5天预报
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city},${country}&appid=${API_KEY}&units=metric&lang=zh_cn`;

        // 并行请求天气数据
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastUrl)
        ]);

        if (!currentResponse.ok) {
            const errorData = await currentResponse.json();
            return res.status(400).json({
                error: `获取天气数据失败: ${errorData.message}`,
                details: '请检查城市名称是否正确'
            });
        }

        const [currentData, forecastData] = await Promise.all([
            currentResponse.json(),
            forecastResponse.json()
        ]);

        // 处理并返回天气数据
        const weatherData = {
            location: {
                name: currentData.name,
                country: currentData.sys.country,
                lat: currentData.coord.lat,
                lon: currentData.coord.lon
            },
            current: currentData,
            forecast: forecastData,
            timestamp: new Date().toISOString()
        };

        res.status(200).json(weatherData);

    } catch (error) {
        console.error('天气 API 错误:', error);
        res.status(500).json({
            error: '服务器内部错误',
            message: error.message,
            details: '无法连接到天气服务'
        });
    }
}

// 演示模式数据（当没有真实 API Key 时）
function getDemoWeatherData(city, country) {
    const demoData = {
        location: {
            name: city,
            country: country,
            lat: 39.9042,
            lon: 116.4074
        },
        current: {
            main: {
                temp: Math.floor(Math.random() * 20) + 10, // 10-30度
                humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
                pressure: Math.floor(Math.random() * 50) + 1000 // 1000-1050 hPa
            },
            weather: [{
                main: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
                description: ['晴朗', '多云', '小雨'][Math.floor(Math.random() * 3)]
            }],
            wind: {
                speed: Math.floor(Math.random() * 10) + 2 // 2-12 m/s
            },
            visibility: Math.floor(Math.random() * 5000) + 5000 // 5-10 km
        },
        forecast: {
            list: Array.from({ length: 5 }, (_, i) => ({
                dt: Date.now() / 1000 + (i * 86400), // 未来5天
                main: {
                    temp_max: Math.floor(Math.random() * 15) + 15,
                    temp_min: Math.floor(Math.random() * 10) + 5
                },
                weather: [{
                    main: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
                    description: ['晴朗', '多云', '小雨'][Math.floor(Math.random() * 3)]
                }]
            }))
        },
        timestamp: new Date().toISOString(),
        demo: true
    };

    return res.status(200).json(demoData);
}
