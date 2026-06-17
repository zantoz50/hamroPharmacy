"use strict";

const User = require("../models/user.model");
const Tenant = require("../models/tenant.model");
const SystemPreference = require("../models/systemPreference.model");
const { Sector } = require("../models/utilits.model");

// GET all tenants (distinct tenantId values)
const getTenants = async (req, res) => {
  try {
    const tenants = await User.distinct("tenantId");
    res.json({ tenants });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET users by tenantId
const getTenantUsers = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const users = await User.find({ tenantId });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE a new tenant admin user
const createTenantAdmin = async (req, res) => {
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
    await ensureTenantSectorPreferences(
      tenant.tenantId,
      tenant.companyName,
      subscriptionPlan,
    );

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

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const PLAN_SECTORS = {
  restaurant: ["Restaurant"],
  cafeteria: ["Cafeteria"],
  mart: ["Mart"],
  all: ["Restaurant", "Cafeteria", "Mart"],
};

function normalizePlan(plan) {
  if (!plan || typeof plan !== "string") return "all";
  return plan.trim().toLowerCase();
}

function buildSectorNamesForPlan(subscriptionPlan) {
  const planKey = normalizePlan(subscriptionPlan);
  return PLAN_SECTORS[planKey] || PLAN_SECTORS.all;
}

async function ensureTenantSectorPreferences(
  tenantId,
  companyName,
  subscriptionPlan,
) {
  const DEFAULT_SECTORS = [
    {
      sectorId: 1,
      name: "Restaurant",
      description: "Restaurant sector",
      isActive: true,
    },
    {
      sectorId: 2,
      name: "Cafeteria",
      description: "Cafeteria sector",
      isActive: true,
    },
    { sectorId: 3, name: "Mart", description: "Mart sector", isActive: true },
  ];

  // ✅ Ensure global sectors exist (insert or update)
  for (const def of DEFAULT_SECTORS) {
    await Sector.updateOne(
      { name: def.name }, // check by name
      { $setOnInsert: def }, // insert if missing
      { upsert: true },
    );
  }
  const sectorNames = buildSectorNamesForPlan(subscriptionPlan);

  // Fetch global sectors by name
  const globalSectors = await Sector.find({ name: { $in: sectorNames } });

  const prefSectors = globalSectors.map((sector) => ({
    sectorId: sector.sectorId,
    name: sector.name,
    description: sector.description,
    isActive: sector.isActive,
  }));

  const existingPrefs = await SystemPreference.findOne({ tenantId });

  if (!existingPrefs) {
    const prefs = new SystemPreference({
      tenantId,
      companyName,
      baseCurrency: "NPR",
      systemLanguage: "English",
      rewardMatrix: [
        { role: "Admin", multiplier: 2 },
        { role: "Customer", multiplier: 1 },
      ],
      sectorLoyaltySettings: [],
      activeOffers: [],
      promoCampaigns: [],
      loyaltyLedgers: [],
      sectors: prefSectors,
      categories: [],
    });
    await prefs.save();
  } else {
    await SystemPreference.updateOne(
      { tenantId },
      { $addToSet: { sectors: { $each: prefSectors } } },
    );
  }
}

module.exports = {
  getTenants,
  getTenantUsers,
  createTenantAdmin,
  ensureTenantSectorPreferences,
};
