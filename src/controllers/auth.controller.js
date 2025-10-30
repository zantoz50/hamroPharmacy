"use strict";

const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const jwtConfig = require("../config/jwt.config");
const logger = require("../utils/logger");

/**
 * @swagger
 * tags: [Auth]
 */

exports.register = async (req, res, next) => {
  try {
    // validation handled by middleware; ensure no duplicate
    const { email, password, firstName, lastName, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already in use" });
    }
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: role || "user",
    });
    await user.save();

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );
    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    logger.error("Register error", err);
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );
    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    logger.error("Login error", err);
    next(err);
  }
};
