"use strict";

const RawMaterial = require("../models/rawMaterials.model");

// GET Raw Materials
// exports.getRawMaterials = async (req, res) => {
//   const mats = await RawMaterial.find({ tenantId: req.tenantId, active: true });
//   res.json(mats);
// };

// // ADD Raw Material
// exports.addRawMaterial = async (req, res) => {
//   const { name, sector, category, quantity, unit, costPerUnit } = req.body;
//   const newMat = new RawMaterial({
//     name,
//     sector,
//     category,
//     quantity,
//     unit,
//     costPerUnit,
//     tenantId: req.tenantId,
//     active: true,
//   });
//   await newMat.save();
//   res.status(201).json(newMat);
// };

// // UPDATE Raw Material
// exports.updateRawMaterial = async (req, res) => {
//   const { id } = req.params;
//   const updated = await RawMaterial.findOneAndUpdate(
//     { _id: id, tenantId: req.tenantId },
//     req.body,
//     { new: true },
//   );
//   if (!updated)
//     return res.status(404).json({ error: "Raw material not found" });
//   res.json(updated);
// };

// Create new raw material stock row
exports.createRawMaterial = async (req, res) => {
  try {
    const {
      ingredientName,
      targetSector,
      inventoryCategory,
      initialQuantity,
      stockingUnit,
      costPerUnit,
      lowAlertThreshold,
      manufacturingSkuIndex,
      supplierName,
      supplierContract,
    } = req.body;

    const rawMaterial = new RawMaterial({
      tenantId: req.tenantId, // multi-tenant isolation
      ingredientName,
      targetSector,
      inventoryCategory,
      initialQuantity,
      stockingUnit,
      costPerUnit,
      lowAlertThreshold,
      manufacturingSkuIndex,
      supplierName,
      supplierContract,
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
      { _id: id, tenantId: req.tenantId },
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
      _id: id,
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
