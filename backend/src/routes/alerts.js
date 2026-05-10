// Alerts Routes
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: '1', type: 'storm', severity: 'high', title: 'Severe Thunderstorm Warning', message: 'Severe thunderstorm expected in your area in 2 hours.', region: 'North East', timestamp: new Date().toISOString(), active: true },
      { id: '2', type: 'heat', severity: 'moderate', title: 'Heat Advisory', message: 'Temperatures expected to reach 40°C. Stay hydrated.', region: 'Central', timestamp: new Date(Date.now() - 3600000).toISOString(), active: true },
      { id: '3', type: 'rain', severity: 'low', title: 'Heavy Rain Alert', message: 'Heavy rainfall expected over the next 24 hours.', region: 'Coastal', timestamp: new Date(Date.now() - 7200000).toISOString(), active: false },
    ]
  });
});

module.exports = router;
