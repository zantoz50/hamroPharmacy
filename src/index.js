'use strict';

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../env.example') });

const logger = require('./utils/logger');
const connectDB = require('./config/db');
const app = require('./app');

// Connect to DB
connectDB().then(() => {
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
  });

  // Graceful shutdown on uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err && (err.stack || err));
    try {
      server.close(() => process.exit(1));
    } catch (e) {
      process.exit(1);
    }
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
    try {
      server.close(() => process.exit(1));
    } catch (e) {
      process.exit(1);
    }
  });

  // cleanup on SIGINT
  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });

  module.exports = server;
}).catch((err) => {
  logger.error('Failed to connect to DB during startup', err);
  process.exit(1);
});
