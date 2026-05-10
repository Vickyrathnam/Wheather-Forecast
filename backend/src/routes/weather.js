// Weather Routes
const express = require('express');
const router = express.Router();
const { getCurrentWeather, getForecast, getGlobalWeather, searchCities } = require('../services/weatherService');
const { authenticate } = require('../middleware/auth');

// GET /api/weather/current?city=London or ?lat=51.5&lon=-0.1
router.get('/current', async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    if (!city && (!lat || !lon)) {
      return res.status(400).json({ error: 'city or lat/lon required' });
    }
    const weather = await getCurrentWeather(city, lat ? parseFloat(lat) : null, lon ? parseFloat(lon) : null);
    res.json({ success: true, data: weather });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/weather/forecast?city=London
router.get('/forecast', async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    if (!city && (!lat || !lon)) {
      return res.status(400).json({ error: 'city or lat/lon required' });
    }
    const forecast = await getForecast(city, lat ? parseFloat(lat) : null, lon ? parseFloat(lon) : null);
    res.json({ success: true, data: forecast });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/weather/global
router.get('/global', async (req, res) => {
  try {
    const data = await getGlobalWeather();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/weather/search?q=Lon
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ success: true, data: [] });
    const cities = await searchCities(q);
    res.json({ success: true, data: cities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
