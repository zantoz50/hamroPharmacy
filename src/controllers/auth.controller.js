"use strict";

const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Tenant = require("../models/tanent.model");
const jwtConfig = require("../config/jwt.config");
const logger = require("../utils/logger");
const { createTenantAdmin } = require("./tanant.controller");
// --- REGISTER ---
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const {
      email,
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

    // If registering an admin, reuse tenant controller logic
    if (role && role.toLowerCase() === "admin") {
      return createTenantAdmin(req, res);
    }

    // Check if tenant exists
    let tenant = await Tenant.findOne({ companyName: companyName.trim() });
    if (!tenant) {
      // Create new tenant
      tenant = new Tenant({
        companyName: companyName.trim(),
        subscriptionPlan,
      });
      await tenant.save();
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const tenantId = companyName.trim();

    const user = new User({
      email,
      password, // hashed in model pre-save hook
      firstName,
      lastName,
      role: role || "Corporate Executive",
      tenantId: tenant._id,
      companyName: tenant.companyName,
      subscriptionPlan,
    });

    await user.save();

    // Create Audit Log for corporate activation
    // const newLog = new AuditLog({
    //   timestamp: new Date().toISOString(),
    //   sector: subscriptionPlan === "all" ? "global" : subscriptionPlan,
    //   userId: user.email,
    //   role: user.role,
    //   action: "SUBSCRIBED_ACCOUNT_CREATED",
    //   details: `Registered account ${user.email} for ${companyName} with '${subscriptionPlan.toUpperCase()}' license plan.`,
    //   tenantId: user.companyName,
    // });
    // await newLog.save();

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role, tenantId: user.tenantId },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn },
    );

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
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

// --- LOGIN ---
// exports.login = async (req, res, next) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(422).json({ errors: errors.array() });
//     }

//     const { email, username, password } = req.body;
//     if (!password || (!email && !username)) {
//       return res
//         .status(400)
//         .json({ message: "Email or username and password are required" });
//     }

//     // Find user by email OR username
//     const user = await User.findOne({
//       $or: [
//         email ? { email: email.trim().toLowerCase() } : null,
//         username ? { username: username.trim().toLowerCase() } : null,
//       ].filter(Boolean),
//     });

//     if (!user) return res.status(401).json({ message: "Invalid credentials" });

//     const match = await user.comparePassword(password);
//     if (!match) return res.status(401).json({ message: "Invalid credentials" });

//     const token = jwt.sign(
//       { id: user._id.toString(), role: user.role, tenantId: user.tenantId },
//       jwtConfig.secret,
//       { expiresIn: jwtConfig.expiresIn },
//     );

//     res.json({
//       user: {
//         id: user._id,
//         email: user.email,
//         username: user.username,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         role: user.role,
//         companyName: user.companyName,
//         subscriptionPlan: user.subscriptionPlan,
//         tenantId: user.tenantId,
//       },
//       token,
//     });
//   } catch (err) {
//     logger.error("Login error", err);
//     next(err);
//   }
// };

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Treat "email" field as a generic identifier
    const { email: identifier, password } = req.body;
    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "Identifier and password are required" });
    }

    // Try to find user by email OR username
    const user = await User.findOne({
      $or: [
        { email: identifier.trim().toLowerCase() },
        { username: identifier.trim().toLowerCase() },
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

// // --- REGISTER ---
// exports.register = async (req, res, next) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(422).json({ errors: errors.array() });
//     }

//     const { email, password, firstName, lastName, role, companyName } =
//       req.body;

//     if (!companyName) {
//       return res
//         .status(400)
//         .json({ message: "Company name (tenantId) is required" });
//     }

//     const exists = await User.findOne({ email });
//     if (exists) {
//       return res.status(409).json({ message: "Email already in use" });
//     }

//     const tenantId = companyName.trim();

//     const user = new User({
//       email,
//       password, // hashed in model pre-save hook
//       firstName,
//       lastName,
//       role: role || "user",
//       tenantId,
//       companyName: tenantId,
//     });

//     await user.save();

//     const token = jwt.sign(
//       { id: user._id.toString(), role: user.role, tenantId: user.tenantId },
//       jwtConfig.secret,
//       { expiresIn: jwtConfig.expiresIn },
//     );

//     res.status(201).json({
//       user: {
//         id: user._id,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         role: user.role,
//         tenantId: user.tenantId,
//       },
//       token,
//     });
//   } catch (err) {
//     logger.error("Register error", err);
//     next(err);
//   }
// };

// // --- LOGIN ---
// exports.login = async (req, res, next) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(422).json({ errors: errors.array() });
//     }

//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(401).json({ message: "Invalid credentials" });

//     const match = await user.comparePassword(password);
//     if (!match) return res.status(401).json({ message: "Invalid credentials" });

//     const token = jwt.sign(
//       { id: user._id.toString(), role: user.role, tenantId: user.tenantId },
//       jwtConfig.secret,
//       { expiresIn: jwtConfig.expiresIn },
//     );

//     res.json({
//       user: {
//         id: user._id,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         role: user.role,
//         tenantId: user.tenantId,
//       },
//       token,
//     });
//   } catch (err) {
//     logger.error("Login error", err);
//     next(err);
//   }
// };

// // --- VERIFY TOKEN ---
// exports.verifyToken = async (req, res, next) => {
//   try {
//     const authHeader = req.headers["authorization"];
//     if (!authHeader) {
//       return res.status(401).json({ message: "Authorization header missing" });
//     }

//     const token = authHeader.split(" ")[1];
//     if (!token) {
//       return res.status(401).json({ message: "Token missing" });
//     }

//     const decoded = jwt.verify(token, jwtConfig.secret);
//     res.json({ success: true, decoded });
//   } catch (err) {
//     logger.error("Token verification error", err);
//     res.status(401).json({ message: "Invalid or expired token" });
//   }
// };
