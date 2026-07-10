"use strict";

const mongoose = require("mongoose");
const Counter = require("./counter.model");

// models/rawMaterial.model.js
const RawMaterialSchema = new mongoose.Schema(
  {
    rawMaterialId: {
      type: Number,
      unique: true,
    },
    tenantId: {
      type: Number,
      required: true,
      index: true, // multi-tenant isolation
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sectorId: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    costPerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    sku: {
      type: String,
      default: "",
    },
    minQuantity: {
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
    supplierContact: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);
// Auto-increment invoiceId
RawMaterialSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "rawMaterialId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    this.rawMaterialId = counter.seq;
  }
  next();
});

module.exports = mongoose.model("RawMaterial", RawMaterialSchema);
