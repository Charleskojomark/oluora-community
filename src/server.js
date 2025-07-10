require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');
const cron = require('node-cron');
const xUpdateService = require('./services/xUpdateService');

const PORT = process.env.PORT || 3000;

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
});

// Schedule X updates fetching every 10 minutes
cron.schedule('*/10 * * * *', async () => {
  try {
    logger.info('Fetching X updates...');
    await xUpdateService.fetchAndStoreUpdates();
    logger.info('X updates fetched successfully');
  } catch (error) {
    logger.error('Error fetching X updates:', error);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

module.exports = server;