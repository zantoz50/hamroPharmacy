'use strict';

const morgan = require('morgan');
const logger = require('../utils/logger');

morgan.token('id', (req) => req.headers['x-request-id'] || '-');

const stream = {
  write: (message) => logger.info(message.trim())
};

module.exports = morgan(':id :remote-addr :method :url :status :res[content-length] - :response-time ms', { stream });
