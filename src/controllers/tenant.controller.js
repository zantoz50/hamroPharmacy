"use strict";

const User = require("../models/user.model");
const Tenant = require("../models/tanent.model");
const SystemPreference = require("../models/systemPreference.model");
const { Sector } = require("../models/utilits.model");

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

    // Auto‑create sectors from subscription plan
    const sectorNames = subscriptionPlan.split(","); // e.g. "restaurant,cafeteria"
    const sectors = await Promise.all(
      sectorNames.map(async (name, index) => {
        const capitalizedName = capitalizeFirst(name);

        let sector = await Sector.findOne({
          tenantId: tenant.tenantId,
          name: capitalizedName,
        });

        if (!sector) {
          sector = new Sector({
            sectorId: index + 1,
            name: capitalizedName,
            description: `${capitalizedName} sector`,
            tenantId: tenant.tenantId,
          });
          await sector.save();
        }

        await SystemPreference.updateOne(
          { tenantId: tenant.tenantId },
          {
            $addToSet: {
              sectors: {
                sectorId: index + 1,
                name: capitalizedName,
                description: `${capitalizedName} sector`,
                isActive: true,
              },
            },
          },
        );

        return sector;
      }),
    );

    const existingPrefs = await SystemPreference.findOne({
      tenantId: tenant.tenantId,
    });
    if (!existingPrefs) {
      const prefs = new SystemPreference({
        tenantId: tenant.tenantId,
        companyName: tenant.companyName,
        baseCurrency: "INR",
        systemLanguage: "English",
        rewardMatrix: [
          { role: "Admin", multiplier: 2 },
          { role: "Customer", multiplier: 1 },
        ],
        sectorLoyaltySettings: [],
        activeOffers: [],
        promoCampaigns: [],
        loyaltyLedgers: [],
        sectors: sectorNames.map((name, index) => ({
          sectorId: index + 1,
          name: capitalizeFirst(name),
          description: `${capitalizeFirst(name)} sector`,
          isActive: true,
        })), // ✅ now works
        categories: [],
      });
      await prefs.save();
    }

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
