// Weather Cron Jobs - Periodic Updates
const cron = require('node-cron');
const { getGlobalWeather } = require('./weatherService');
const { broadcastAlert } = require('../sockets/weatherSocket');
const logger = require('../utils/logger');

const startWeatherCron = () => {
  // Refresh global weather data every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    try {
      logger.info('🔄 Refreshing global weather data...');
      await getGlobalWeather();
      logger.info('✅ Global weather data refreshed');
    } catch (error) {
      logger.error('Cron error:', error.message);
    }
  });

  // Simulate severe weather alerts every 30 minutes (in production, use real alert API)
  cron.schedule('*/30 * * * *', () => {
    const alerts = [
      { type: 'storm', severity: 'high', title: 'Severe Thunderstorm Warning', message: 'AI predicts severe storm formation in 2 hours.' },
      { type: 'heat', severity: 'moderate', title: 'Heat Advisory', message: 'Temperatures expected to reach dangerous levels.' },
    ];
    const shouldAlert = Math.random() > 0.7; // 30% chance
    if (shouldAlert) {
      const alert = alerts[Math.floor(Math.random() * alerts.length)];
      broadcastAlert({ ...alert, timestamp: new Date().toISOString(), id: Date.now().toString() });
    }
  });

  logger.info('⏰ Weather cron jobs started');
};

module.exports = { startWeatherCron };
