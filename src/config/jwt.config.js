'use strict';

module.exports = {
  secret: process.env.JWT_SECRET || 'change_me',
  expiresIn: process.env.JWT_EXPIRES || '1d',
  adminSeedEmail: process.env.ADMIN_EMAIL || '',
  adminSeedPassword: process.env.ADMIN_PASSWORD || ''
};
