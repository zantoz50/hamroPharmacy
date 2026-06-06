"use strict";
// controllers/systemPreference.controller.js
const SystemPreference = require("../models/systemPreference.model");
const { Sector, Category } = require("../models/utilits.model");
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

// Add a new sector
exports.addSector = async (req, res) => {
  try {
    const { name, description } = req.body;

    const sector = new Sector({
      tenantId: req.tenantId,
      name,
      description,
    });

    await sector.save();
    res.status(201).json({ message: "Sector created successfully", sector });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating sector", error: error.message });
  }
};

exports.getSectors = async (req, res) => {
  try {
    const sectors = await Sector.find({ tenantId: req.tenantId });
    res.status(200).json(sectors);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching sectors", error: error.message });
  }
};

exports.updateSector = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const item = await Sector.findOneAndUpdate(
      { sectorId: id, tenantId: req.tenantId },
      updates,
      { new: true },
    );

    if (!item) {
      return res.status(404).json({ message: "Sector not found" });
    }

    res
      .status(200)
      .json({ message: "Sector updated successfully", sectors: prefs.sectors });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating sector", error: error.message });
  }
};

// Add a new category
exports.addCategory = async (req, res) => {
  try {
    const { name, sector } = req.body;

    const category = new Category({
      tenantId: req.tenantId,
      name,
      sector,
    });

    await category.save();
    res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating category", error: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ tenantId: req.tenantId }).populate(
      "sector",
    );
    res.status(200).json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching categories", error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const item = await Category.findOneAndUpdate(
      { categoryId: id, tenantId: req.tenantId },
      updates,
      { new: true },
    );

    if (!item) {
      return res.status(404).json({ message: "Category item not found" });
    }
    res.status(200).json({
      message: "Category updated successfully",
      categories: prefs.categories,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating category", error: error.message });
  }
};

// Get all sectors and categories
exports.getSectorsAndCategories = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Find category by ID and tenant scope
    const category = await Category.findOne({
      _id: categoryId,
      tenantId: req.tenantId,
    }).populate("sector");

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      category: {
        id: category._id,
        name: category.name,
      },
      sector: category.sector
        ? {
            id: category.sector._id,
            name: category.sector.name,
            description: category.sector.description,
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching sector by category ID",
      error: error.message,
    });
  }
};
