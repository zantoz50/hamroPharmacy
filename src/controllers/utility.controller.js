// controllers/category.controller.js
const Category = require("../models/utilits.model");

exports.createCategory = async (req, res) => {
  try {
    const { name, sector } = req.body;
    const category = new Category({
      name,
      sector,
      tenantId: req.tenantId,
    });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ tenantId: req.tenantId }).populate(
      "sector",
    );
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true },
    );
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.tenantId,
    });
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
