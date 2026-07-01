"use strict";

const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Tenant = require("../models/tenant.model");
const jwtConfig = require("../config/jwt.config");
const logger = require("../utils/logger");
const {
  createTenantAdmin,
  ensureTenantSectorPreferences,
} = require("./tenant.controller");

// --- REGISTER ---
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const {
      email,
      username,
      password,
      firstName,
      lastName,
      role,
      companyName,
      subscriptionPlan,
    } = req.body;

    if (!companyName || !subscriptionPlan) {
      return res
        .status(400)
        .json({ message: "Company name and subscription plan are required." });
    }

    // --- Step 1: Ensure tenant ---
    let tenant = await Tenant.findOne({ companyName: companyName.trim() });
    if (!tenant) {
      tenant = new Tenant({
        companyName: companyName.trim(),
        subscriptionPlan,
      });
      await tenant.save();
    } else if (
      subscriptionPlan &&
      tenant.subscriptionPlan !== subscriptionPlan
    ) {
      tenant.subscriptionPlan = subscriptionPlan;
      await tenant.save();
    }

    // --- Step 2: Ensure SystemPreference ---
    try {
      await ensureTenantSectorPreferences(
        tenant.tenantId,
        tenant.companyName,
        tenant.subscriptionPlan,
      );
    } catch (err) {
      // rollback tenant if preference creation fails
      await Tenant.deleteOne({ tenantId: tenant.tenantId });
      return res
        .status(500)
        .json({ message: "Failed to create preferences", error: err.message });
    }

    // --- Step 3: Ensure unique user ---
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res
        .status(409)
        .json({ message: "Email or username already in use" });
    }

    const user = new User({
      email: email || null,
      username: username || null,
      password,
      firstName,
      lastName,
      role: role || "Corporate Executive",
      tenantId: tenant.tenantId,
      companyName: tenant.companyName,
      subscriptionPlan,
    });

    try {
      await user.save();
    } catch (err) {
      // rollback tenant + preference if user creation fails
      await Tenant.deleteOne({ tenantId: tenant.tenantId });
      await SystemPreference.deleteOne({ tenantId: tenant.tenantId });
      return res
        .status(500)
        .json({ message: "Failed to create user", error: err.message });
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role, tenantId: user.tenantId },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn },
    );

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyName: user.companyName,
        subscriptionPlan: user.subscriptionPlan,
        tenantId: user.tenantId,
      },
      token,
    });
  } catch (err) {
    logger.error("Register error", err);
    next(err);
  }
};

exports.activateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // remove "Bearer"
    const decoded = jwt.verify(token, jwtConfig.secret);

    const tenant = await Tenant.findOne({ tenantId: decoded.tenantId });
    if (!tenant) {
      return res.status(400).json({ message: "Invalid activation link" });
    }

    const { email, password, firstName, lastName, username, role, sector } =
      req.body;

    // Check if email already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      username,
      role, // Admin, employee, Viewer
      sector, // optional field
      tenantId: tenant.tenantId,
      companyName: tenant.companyName,
      subscriptionPlan: tenant.subscriptionPlan,
    });

    await user.save();

    res.status(201).json({ message: "User activated successfully", user });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Identifier and password are required" });
    }

    // Try to find user by email OR username
    const user = await User.findOne({
      $or: [
        { email: username.trim().toLowerCase() },
        { username: username.trim().toLowerCase() },
      ],
    });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role, tenantId: user.tenantId },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn },
    );

    res.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyName: user.companyName,
        subscriptionPlan: user.subscriptionPlan,
        tenantId: user.tenantId,
      },
      token,
    });
  } catch (err) {
    logger.error("Login error", err);
    next(err);
  }
};

// --- VERIFY TOKEN ---
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    const decoded = jwt.verify(token, jwtConfig.secret);
    res.json({ success: true, decoded });
  } catch (err) {
    logger.error("Token verification error", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.find({
      tenantId: req.tenantId, // numeric tenantId
    }).select("-password"); // exclude password

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
