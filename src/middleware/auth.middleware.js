"use strict";

const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Patient = require("../models/patient.model");
const jwtConfig = require("../config/jwt.config");

exports.requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match)
      return res.status(401).json({ message: "Authorization token required" });
    const token = match[1];
    const payload = jwt.verify(token, jwtConfig.secret);
    if (!payload || !payload.id)
      return res.status(401).json({ message: "Invalid token" });
    const user = await User.findById(payload.id).select("+password").exec();
    if (!user) return res.status(401).json({ message: "User not found" });
    // Attach tenantId from token payload if present, fallback to user's tenantId
    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      tenantId: (payload && payload.tenantId) || user.tenantId,
    };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return res.status(401).json({ message: "Token expired" });
    next(err);
  }
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin role required" });
  next();
};

exports.requireOwnerOrAdmin = async (req, res, next) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });
    const patient = await Patient.findById(req.params.id)
      .select("owner")
      .lean()
      .exec();
    if (!patient)
      return res.status(404).json({ message: "Resource not found" });
    const ownerId = patient.owner ? patient.owner.toString() : null;
    if (req.user.role === "admin" || (ownerId && ownerId === req.user.id)) {
      return next();
    }
    return res.status(403).json({ message: "Owner or admin required" });
  } catch (err) {
    next(err);
  }
};
