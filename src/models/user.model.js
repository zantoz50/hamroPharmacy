'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  firstName: { type: String },
  lastName: { type: String }
}, { timestamps: true });

UserSchema.pre('save', async function preSave(next) {
  try {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

UserSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.statics.seedAdmin = async function seedAdmin(email, password) {
  if (!email || !password) throw new Error('Email and password required to seed admin');
  const existing = await this.findOne({ email });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      existing.password = password;
      await existing.save();
    }
    return existing;
  }
  const admin = new this({ email, password, role: 'admin', firstName: 'Admin' });
  await admin.save();
  return admin;
};

module.exports = mongoose.model('User', UserSchema);
