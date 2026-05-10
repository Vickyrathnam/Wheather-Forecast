// Weather Service - OpenWeatherMap Integration
const axios = require('axios');
const logger = require('../utils/logger');

const OWM_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const OWM_GEO_URL = 'https://api.openweathermap.org/geo/1.0';
const API_KEY = process.env.OPENWEATHER_API_KEY;

// In-memory cache (use Redis in production)
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const getCached = (key) => {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

/**
 * Get current weather for a city
 */
const getCurrentWeather = async (city, lat, lon) => {
  const cacheKey = `current_${lat || city}_${lon || ''}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const params = lat && lon
      ? { lat, lon, appid: API_KEY, units: 'metric' }
      : { q: city, appid: API_KEY, units: 'metric' };

    const [currentRes, airRes] = await Promise.all([
      axios.get(`${OWM_BASE_URL}/weather`, { params }),
      axios.get(`${OWM_BASE_URL}/air_pollution`, {
        params: {
          lat: lat || (await geocodeCity(city)).lat,
          lon: lon || (await geocodeCity(city)).lon,
          appid: API_KEY,
        },
      }).catch(() => null),
    ]);

    const data = currentRes.data;
    const aqi = airRes?.data?.list?.[0]?.main?.aqi || 1;
    const components = airRes?.data?.list?.[0]?.components || {};

    const result = {
      city: data.name,
      country: data.sys.country,
      lat: data.coord.lat,
      lon: data.coord.lon,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      tempMin: Math.round(data.main.temp_min),
      tempMax: Math.round(data.main.temp_max),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      visibility: data.visibility / 1000, // km
      windSpeed: Math.round(data.wind.speed * 3.6), // km/h
      windDeg: data.wind.deg,
      windGust: data.wind.gust ? Math.round(data.wind.gust * 3.6) : null,
      cloudiness: data.clouds.all,
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      sunrise: data.sys.sunrise * 1000,
      sunset: data.sys.sunset * 1000,
      timezone: data.timezone,
      aqi,
      aqiCategory: getAQICategory(aqi),
      pm25: components.pm2_5 || 0,
      pm10: components.pm10 || 0,
      o3: components.o3 || 0,
      no2: components.no2 || 0,
      uvIndex: null, // requires separate API call
      timestamp: new Date().toISOString(),
    };

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    logger.error('Weather fetch error:', error.message);
    throw new Error(`Failed to fetch weather: ${error.message}`);
  }
};

/**
 * Get 5-day forecast (3-hour intervals)
 */
const getForecast = async (city, lat, lon) => {
  const cacheKey = `forecast_${lat || city}_${lon || ''}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const params = lat && lon
      ? { lat, lon, appid: API_KEY, units: 'metric', cnt: 40 }
      : { q: city, appid: API_KEY, units: 'metric', cnt: 40 };

    const res = await axios.get(`${OWM_BASE_URL}/forecast`, { params });
    
    // Group by day
    const dailyMap = {};
    res.data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyMap[date]) {
        dailyMap[date] = {
          date: item.dt * 1000,
          temps: [],
          conditions: [],
          humidity: [],
          windSpeed: [],
          precipitation: 0,
          icon: item.weather[0].icon,
          description: item.weather[0].description,
          condition: item.weather[0].main,
        };
      }
      dailyMap[date].temps.push(item.main.temp);
      dailyMap[date].conditions.push(item.weather[0].main);
      dailyMap[date].humidity.push(item.main.humidity);
      dailyMap[date].windSpeed.push(item.wind.speed * 3.6);
      if (item.rain?.['3h']) dailyMap[date].precipitation += item.rain['3h'];
      if (item.snow?.['3h']) dailyMap[date].precipitation += item.snow['3h'];
    });

    const daily = Object.values(dailyMap).slice(0, 7).map(day => ({
      date: day.date,
      tempMax: Math.round(Math.max(...day.temps)),
      tempMin: Math.round(Math.min(...day.temps)),
      tempAvg: Math.round(day.temps.reduce((a, b) => a + b, 0) / day.temps.length),
      humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      windSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length),
      precipitation: Math.round(day.precipitation * 10) / 10,
      condition: getMostCommon(day.conditions),
      description: day.description,
      icon: day.icon,
      rainProbability: Math.min(100, Math.round(day.precipitation * 20)),
    }));

    const hourly = res.data.list.slice(0, 24).map(item => ({
      time: item.dt * 1000,
      temp: Math.round(item.main.temp),
      feelsLike: Math.round(item.main.feels_like),
      humidity: item.main.humidity,
      windSpeed: Math.round(item.wind.speed * 3.6),
      condition: item.weather[0].main,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      pop: Math.round((item.pop || 0) * 100),
      precipitation: item.rain?.['3h'] || item.snow?.['3h'] || 0,
    }));

    const result = { daily, hourly, timestamp: new Date().toISOString() };
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    logger.error('Forecast fetch error:', error.message);
    throw new Error(`Failed to fetch forecast: ${error.message}`);
  }
};

/**
 * Get weather for multiple global cities (for world map)
 */
const getGlobalWeather = async () => {
  const cities = [
    { name: 'New York', lat: 40.71, lon: -74.01 },
    { name: 'London', lat: 51.51, lon: -0.13 },
    { name: 'Tokyo', lat: 35.69, lon: 139.69 },
    { name: 'Dubai', lat: 25.20, lon: 55.27 },
    { name: 'Sydney', lat: -33.87, lon: 151.21 },
    { name: 'Paris', lat: 48.85, lon: 2.35 },
    { name: 'Mumbai', lat: 19.08, lon: 72.88 },
    { name: 'São Paulo', lat: -23.55, lon: -46.63 },
    { name: 'Cairo', lat: 30.04, lon: 31.24 },
    { name: 'Moscow', lat: 55.75, lon: 37.62 },
    { name: 'Beijing', lat: 39.91, lon: 116.39 },
    { name: 'Los Angeles', lat: 34.05, lon: -118.24 },
    { name: 'Chicago', lat: 41.88, lon: -87.63 },
    { name: 'Toronto', lat: 43.65, lon: -79.38 },
    { name: 'Berlin', lat: 52.52, lon: 13.40 },
    { name: 'Singapore', lat: 1.35, lon: 103.82 },
    { name: 'Bangkok', lat: 13.75, lon: 100.50 },
    { name: 'Istanbul', lat: 41.01, lon: 28.97 },
    { name: 'Mexico City', lat: 19.43, lon: -99.13 },
    { name: 'Lagos', lat: 6.52, lon: 3.38 },
  ];

  const cacheKey = 'global_weather';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const results = await Promise.allSettled(
      cities.map(city => getCurrentWeather(null, city.lat, city.lon).then(w => ({
        ...w,
        city: city.name,
        lat: city.lat,
        lon: city.lon,
      })))
    );

    const data = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);

    setCache(cacheKey, data);
    return data;
  } catch (error) {
    logger.error('Global weather error:', error.message);
    return [];
  }
};

/**
 * Geocode a city name to lat/lon
 */
const geocodeCity = async (city) => {
  const res = await axios.get(`${OWM_GEO_URL}/direct`, {
    params: { q: city, limit: 1, appid: API_KEY },
  });
  if (!res.data.length) throw new Error(`City not found: ${city}`);
  return { lat: res.data[0].lat, lon: res.data[0].lon };
};

/**
 * Search cities by name
 */
const searchCities = async (query) => {
  try {
    const res = await axios.get(`${OWM_GEO_URL}/direct`, {
      params: { q: query, limit: 5, appid: API_KEY },
    });
    return res.data.map(c => ({
      name: c.name,
      country: c.country,
      state: c.state,
      lat: c.lat,
      lon: c.lon,
    }));
  } catch (error) {
    return [];
  }
};

// Helpers
const getAQICategory = (aqi) => {
  const categories = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
  return categories[aqi - 1] || 'Unknown';
};

const getMostCommon = (arr) => {
  const counts = arr.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
};

module.exports = {
  getCurrentWeather,
  getForecast,
  getGlobalWeather,
  geocodeCity,
  searchCities,
};
