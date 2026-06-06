"use strict";

const mongoose = require("mongoose");

// models/rawMaterial.model.js
const RawMaterialSchema = new mongoose.Schema(
  {
    tenantId: {
      type: Number,
      required: true,
      index: true, // multi-tenant isolation
    },
    ingredientName: {
      type: String,
      required: true,
      trim: true,
    },
    targetSector: {
      type: String,
      required: true,
      trim: true,
    },
    inventoryCategory: {
      type: String,
      required: true,
      trim: true,
    },
    initialQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    stockingUnit: {
      type: String,
      required: true,
      trim: true,
    },
    costPerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    lowAlertThreshold: {
      type: Number,
      required: true,
      min: 0,
    },
    manufacturingSkuIndex: {
      type: String,
      default: null, // optional auto-generated
      trim: true,
    },
    supplierName: {
      type: String,
      trim: true,
    },
    supplierContract: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("RawMaterial", RawMaterialSchema);
