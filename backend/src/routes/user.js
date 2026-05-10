// User Routes
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.get('/profile', authenticate, (req, res) => {
  res.json({ success: true, user: req.user });
});

router.put('/preferences', authenticate, (req, res) => {
  const { units, theme, notifications } = req.body;
  res.json({ success: true, message: 'Preferences updated' });
});

router.get('/cities', authenticate, (req, res) => {
  res.json({ success: true, cities: req.user?.savedCities || [] });
});

router.post('/cities', authenticate, (req, res) => {
  const { city, lat, lon } = req.body;
  res.json({ success: true, message: 'City saved' });
});

module.exports = router;
