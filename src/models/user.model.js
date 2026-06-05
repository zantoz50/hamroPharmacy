// 'use strict';

// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const SALT_ROUNDS = 10;

// const UserSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true, lowercase: true, index: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ['admin', 'user'], default: 'user' },
//   firstName: { type: String },
//   lastName: { type: String }
// }, { timestamps: true });

// UserSchema.pre('save', async function preSave(next) {
//   try {
//     if (!this.isModified('password')) return next();
//     const salt = await bcrypt.genSalt(SALT_ROUNDS);
//     this.password = await bcrypt.hash(this.password, salt);
//     return next();
//   } catch (err) {
//     return next(err);
//   }
// });

// UserSchema.methods.comparePassword = function comparePassword(candidate) {
//   return bcrypt.compare(candidate, this.password);
// };

// UserSchema.statics.seedAdmin = async function seedAdmin(email, password) {
//   if (!email || !password) throw new Error('Email and password required to seed admin');
//   const existing = await this.findOne({ email });
//   if (existing) {
//     if (existing.role !== 'admin') {
//       existing.role = 'admin';
//       existing.password = password;
//       await existing.save();
//     }
//     return existing;
//   }
//   const admin = new this({ email, password, role: 'admin', firstName: 'Admin' });
//   await admin.save();
//   return admin;
// };

// module.exports = mongoose.model('User', UserSchema);
"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
      sparse: true, // allows either email or username to be unique
      index: true,
    },
    username: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
      sparse: true,
      index: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "customer", "employee"],
      default: "user",
    },
    firstName: { type: String },
    lastName: { type: String },
    sector: { type: String },
    // Tenant-based fields
    companyName: { type: String, required: true }, // e.g. "Omni Consortium"
    // tenantId: { type: String, required: true, index: true }, // unique tenant identifier
    tenantId: {
      type: Number,

      required: true,
    },

    // New field for subscription plan
    subscriptionPlan: { type: String, required: true }, // e.g. "restaurant", "cafeteria", "mart", "all"
  },
  { timestamps: true },
);

// --- Password Hashing ---
UserSchema.pre("save", async function preSave(next) {
  try {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// --- Compare Password ---
UserSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// --- Seed Admin for Tenant ---
UserSchema.statics.seedAdmin = async function seedAdmin(
  identifier,
  password,
  companyName,
  subscriptionPlan = "all",
) {
  if (!identifier || !password || !companyName) {
    throw new Error(
      "Identifier, password, and companyName required to seed admin",
    );
  }

  const tenantId = companyName.trim();
  let existing = await this.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });

  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      existing.password = password;
      existing.tenantId = tenantId;
      existing.companyName = companyName;
      existing.subscriptionPlan = subscriptionPlan;
      await existing.save();
    }
    return existing;
  }

  const admin = new this({
    email: identifier.includes("@") ? identifier : undefined,
    username: !identifier.includes("@") ? identifier : undefined,
    password,
    role: "admin",
    firstName: "Admin",
    companyName,
    tenantId,
    subscriptionPlan,
  });

  await admin.save();
  return admin;
};

module.exports = mongoose.model("User", UserSchema);
