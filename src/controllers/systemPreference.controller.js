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
    const { name, description, isActive } = req.body;

    const sector = new Sector({
      tenantId: req.tenantId,
      name,
      description,
      isActive,
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
      .json({ message: "Sector updated successfully", sectors: item });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating sector", error: error.message });
  }
};

// Add a new category
exports.addCategory = async (req, res) => {
  try {
    const { name, sectorId, isActive } = req.body;

    const category = new Category({
      tenantId: req.tenantId,
      name,
      sectorId,
      isActive,
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
    const categories = await Category.find({ tenantId: req.tenantId });
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching categories",
      error: error.message,
    });
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

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Category.findOneAndDelete({
      categoryId: id,
      tenantId: req.tenantId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Category deleted successfully",
      category: deleted,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting category",
      error: error.message,
    });
  }
};
// Get all Categories by Sector
exports.getCategoriesBySectorId = async (req, res) => {
  try {
    const { sectorId } = req.params;

    // Find categories for this tenant under the given sector
    const categories = await Category.find({
      tenantId: req.tenantId,
      sector: sectorId, // sector must be ObjectId ref in Category schema
    });

    if (!categories || categories.length === 0) {
      return res
        .status(404)
        .json({ message: "No categories found for this sector" });
    }

    // Return only the categories list
    res.status(200).json(
      categories.map((cat) => ({
        id: cat._id,
        name: cat.name,
      })),
    );
  } catch (error) {
    res.status(500).json({
      message: "Error fetching categories by sector",
      error: error.message,
    });
  }
};
