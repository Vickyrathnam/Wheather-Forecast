// Weather Forecast Backend - Main Entry Point
require('dotenv').config();
const app = require('./app');
const http = require('http');
const { initializeSocket } = require('./sockets/weatherSocket');
const { startWeatherCron } = require('./services/weatherCron');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Start weather cron jobs
startWeatherCron();

server.listen(PORT, () => {
  logger.info(`🚀 Weather Forecast Backend running on port ${PORT}`);
  logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📡 WebSocket server initialized`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

module.exports = server;
