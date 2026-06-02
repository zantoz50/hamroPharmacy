"use strict";

const Inventory = require("../models/inventory.model");

// Dashboard stats
exports.getInventoryStats = async (req, res) => {
  try {
    const items = await Inventory.find({ tenantId: req.tenantId });

    const assetStockCount = items.reduce((sum, i) => sum + i.stock, 0);
    const totalRetailWorth = items.reduce(
      (sum, i) => sum + i.price * i.stock,
      0,
    );
    const costCapitalInvestment = items.reduce(
      (sum, i) => sum + i.vendorCost * i.stock,
      0,
    );

    const projectedMarkupMargin =
      costCapitalInvestment > 0
        ? ((totalRetailWorth - costCapitalInvestment) / costCapitalInvestment) *
          100
        : 0;

    res.status(200).json({
      assetStockCount,
      totalRetailWorth,
      costCapitalInvestment,
      projectedMarkupMargin,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching inventory stats",
      error: error.message,
    });
  }
};

// Get all inventory items
exports.getInventory = async (req, res) => {
  try {
    const items = await Inventory.find({ tenantId: req.tenantId });
    res.status(200).json(items);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching inventory", error: error.message });
  }
};

// Add new inventory item
exports.addInventory = async (req, res) => {
  try {
    const { name, sector, category, price, stock, skuIdentifier } = req.body;

    const item = new Inventory({
      tenantId: req.tenantId,
      name,
      sector,
      category,
      price: Number(price), // ensure numeric
      stock: Number(stock), // ensure numeric
      skuIdentifier,
    });

    await item.save();
    res
      .status(201)
      .json({ message: "Inventory item added successfully", item });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding inventory item", error: error.message });
  }
};

// Update inventory item
exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const item = await Inventory.findOneAndUpdate(
      { _id: id, tenantId: req.tenantId },
      updates,
      { new: true },
    );

    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    res
      .status(200)
      .json({ message: "Inventory item updated successfully", item });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating inventory item", error: error.message });
  }
};

// Delete inventory item
exports.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Inventory.findOneAndDelete({
      _id: id,
      tenantId: req.tenantId,
    });

    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    res.status(200).json({ message: "Inventory item deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting inventory item", error: error.message });
  }
};
