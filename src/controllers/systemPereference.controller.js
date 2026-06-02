"use strict";
// controllers/systemPreference.controller.js
const SystemPreference = require("../models/systemPreference.model");

// Get system preferences
exports.getPreferences = async (req, res) => {
  try {
    const prefs = await SystemPreference.findOne({ tenantId: req.tenantId });
    res.status(200).json(prefs || {});
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching preferences", error: error.message });
  }
};

// Update system preferences
exports.updatePreferences = async (req, res) => {
  try {
    const updates = req.body;
    const prefs = await SystemPreference.findOneAndUpdate(
      { tenantId: req.tenantId },
      updates,
      { new: true, upsert: true },
    );
    res
      .status(200)
      .json({ message: "Preferences updated successfully", prefs });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating preferences", error: error.message });
  }
};

// Upload company logo
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Logo file required" });
    }

    const logoPath = `/uploads/logos/${req.file.filename}`;

    const prefs = await SystemPreference.findOneAndUpdate(
      { tenantId: req.tenantId },
      { logoUrl: logoPath },
      { new: true, upsert: true },
    );

    res.status(200).json({
      message: "Logo uploaded successfully",
      logoUrl: logoPath,
      prefs,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error uploading logo", error: error.message });
  }
};
