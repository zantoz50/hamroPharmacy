'use strict';

const User = require('../models/user.model');
const jwtConfig = require('../config/jwt.config');
const logger = require('../utils/logger');

exports.createUser = async ({ email, password, firstName, lastName, role }) => {
  const exists = await User.findOne({ email });
  if (exists) throw Object.assign(new Error('Email already in use'), { status: 409 });
  const user = new User({ email, password, firstName, lastName, role: role || 'user' });
  await user.save();
  return user;
};

exports.findByEmail = (email) => User.findOne({ email });

exports.findById = (id) => User.findById(id);

exports.seedAdminFromEnv = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    logger.info('No admin credentials found in env; skipping admin seed');
    return null;
  }
  logger.info('Seeding admin user from env');
  return User.seedAdmin(email, password);
};
