// Socket.IO - Real-time Weather Engine
const { Server } = require('socket.io');
const { getCurrentWeather } = require('../services/weatherService');
const { generateAIPrediction } = require('../services/aiPredictionService');
const logger = require('../utils/logger');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    logger.info(`🔌 Client connected: ${socket.id}`);

    // Client subscribes to weather updates for a location
    socket.on('subscribe:weather', async ({ city, lat, lon }) => {
      try {
        logger.info(`📡 Weather subscription: ${city} (${lat}, ${lon})`);
        socket.join(`weather:${lat?.toFixed(1)}_${lon?.toFixed(1)}`);
        
        // Send immediate data
        const [weather, prediction] = await Promise.allSettled([
          getCurrentWeather(city, lat, lon),
          generateAIPrediction(city, lat, lon),
        ]);

        if (weather.status === 'fulfilled') {
          socket.emit('weather:update', { success: true, data: weather.value });
        }
        if (prediction.status === 'fulfilled') {
          socket.emit('ai:prediction', { success: true, data: prediction.value });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Client requests AI analysis
    socket.on('request:ai', async ({ city, lat, lon }) => {
      try {
        const prediction = await generateAIPrediction(city, lat, lon);
        socket.emit('ai:prediction', { success: true, data: prediction });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Simulate live radar updates
    socket.on('subscribe:radar', ({ lat, lon }) => {
      socket.join(`radar:${lat?.toFixed(0)}_${lon?.toFixed(0)}`);
      socket.emit('radar:update', {
        timestamp: Date.now(),
        intensity: Math.random() * 100,
        type: 'precipitation',
      });
    });

    socket.on('disconnect', () => {
      logger.info(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  logger.info('✅ Socket.IO initialized');
  return io;
};

// Broadcast weather updates to all subscribed clients
const broadcastWeatherUpdate = async (lat, lon, data) => {
  if (!io) return;
  const room = `weather:${lat.toFixed(1)}_${lon.toFixed(1)}`;
  io.to(room).emit('weather:update', { success: true, data, timestamp: Date.now() });
};

// Broadcast severe weather alert
const broadcastAlert = (alert) => {
  if (!io) return;
  io.emit('weather:alert', alert);
  logger.warn(`⚠️ Alert broadcast: ${alert.type} - ${alert.title}`);
};

const getIO = () => io;

module.exports = { initializeSocket, broadcastWeatherUpdate, broadcastAlert, getIO };
