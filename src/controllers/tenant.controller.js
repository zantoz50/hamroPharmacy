"use strict";

const User = require("../models/user.model");
const Tenant = require("../models/tanent.model");

// GET all tenants (distinct tenantId values)
exports.getTenants = async (req, res) => {
  try {
    const tenants = await User.distinct("tenantId");
    res.json({ tenants });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET users by tenantId
exports.getTenantUsers = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const users = await User.find({ tenantId });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE a new tenant admin user
exports.createTenantAdmin = async (req, res) => {
  try {
    const {
      email,
      username,
      password,
      companyName,
      subscriptionPlan = "all",
    } = req.body;

    if (!companyName) {
      return res
        .status(400)
        .json({ error: "Company name (tenantId) is required" });
    }

    const tenantName = companyName.trim();
    let tenant = await Tenant.findOne({ companyName: tenantName });
    if (!tenant) {
      tenant = new Tenant({ companyName: tenantName, subscriptionPlan });
      await tenant.save();
    }

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res
        .status(409)
        .json({ error: "Email or username already in use" });
    }

    const admin = new User({
      email,
      username,
      password,
      role: "admin",
      companyName: tenant.companyName,
      tenantId: tenant.tenantId,
      subscriptionPlan,
      firstName: "Admin",
    });

    await admin.save();

    res.status(201).json({
      success: true,
      user: {
        id: admin._id,
        email: admin.email,
        username: admin.username,
        companyName: admin.companyName,
        tenantId: admin.tenantId,
        role: admin.role,
        subscriptionPlan: admin.subscriptionPlan,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
