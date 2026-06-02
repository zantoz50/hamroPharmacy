'use strict';

const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  try {
    // Mongoose validation
    if (err && err.name === 'ValidationError') {
      const details = Object.keys(err.errors).map((k) => ({ field: k, message: err.errors[k].message }));
      logger.warn('Validation error', { details });
      return res.status(400).json({ message: 'Validation failed', details });
    }

    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const details = err.details || undefined;

    if (status >= 500) logger.error(message, err);
    else logger.warn(message, err);

    res.status(status).json({ message, details });
  } catch (handlerErr) {
    logger.error('Error in errorHandler', handlerErr);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
