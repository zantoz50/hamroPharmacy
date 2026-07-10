"use strict";

const RawMaterial = require("../models/rawMaterials.model");

// Create new raw material stock row
exports.createRawMaterial = async (req, res) => {
  try {
    const {
      name,
      sectorId,
      category,
      quantity,
      unit,
      costPerUnit,
      minQuantity,
      manufacturingSkuIndex,
      supplierName,
      supplierContact,
      sku,
    } = req.body;

    const rawMaterial = new RawMaterial({
      tenantId: req.tenantId, // multi-tenant isolation
      name,
      sectorId,
      category,
      quantity,
      unit,
      costPerUnit,
      minQuantity,
      manufacturingSkuIndex,
      supplierName,
      supplierContact,
      sku,
    });

    await rawMaterial.save();
    res
      .status(201)
      .json({ message: "Raw material created successfully", rawMaterial });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating raw material", error: error.message });
  }
};

// Get all raw materials for tenant
exports.getRawMaterials = async (req, res) => {
  try {
    const rawMaterials = await RawMaterial.find({ tenantId: req.tenantId });
    res.status(200).json(rawMaterials);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching raw materials", error: error.message });
  }
};

// Update raw material
exports.updateRawMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const rawMaterial = await RawMaterial.findOneAndUpdate(
      { rawMaterialId: id, tenantId: req.tenantId },
      updates,
      { new: true },
    );

    if (!rawMaterial) {
      return res.status(404).json({ message: "Raw material not found" });
    }

    res
      .status(200)
      .json({ message: "Raw material updated successfully", rawMaterial });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating raw material", error: error.message });
  }
};

// Delete raw material
exports.deleteRawMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const rawMaterial = await RawMaterial.findOneAndDelete({
      rawMaterialId: id,
      tenantId: req.tenantId,
    });

    if (!rawMaterial) {
      return res.status(404).json({ message: "Raw material not found" });
    }

    res.status(200).json({ message: "Raw material deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting raw material", error: error.message });
  }
};
