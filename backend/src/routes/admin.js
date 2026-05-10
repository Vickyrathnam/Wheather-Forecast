// Admin Routes
const express = require('express');
const router = express.Router();

router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalUsers: 12847,
      activeUsers: 3241,
      totalPredictions: 1247893,
      apiCallsToday: 58432,
      modelAccuracy: 97.3,
      uptime: process.uptime(),
      avgResponseTime: 142,
    }
  });
});

module.exports = router;
