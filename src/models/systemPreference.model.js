// models/systemPreference.model.js
const mongoose = require("mongoose");

const rewardMatrixSchema = new mongoose.Schema({
  role: { type: String, required: true },
  multiplier: { type: Number, required: true, min: 0 },
});

const sectorLoyaltySchema = new mongoose.Schema({
  sector: { type: String, required: true },
  earnWeight: { type: Number, required: true, min: 0 },
});

const activeOfferSchema = new mongoose.Schema({
  description: { type: String, required: true },
  discountPercent: { type: Number, required: true, min: 0, max: 100 },
});

const loyaltyLedgerSchema = new mongoose.Schema({
  memberName: { type: String, required: true },
  points: { type: Number, required: true, min: 0 },
});

const systemPreferenceSchema = new mongoose.Schema(
  {
    tenantId: {
      type: Number,
      required: true,
      index: true,
    },
    companyName: { type: String, required: true },
    logoUrl: { type: String, default: null }, // uploaded file path or URL
    systemLanguage: { type: String, default: "US English" },
    baseCurrency: { type: String, default: "INR" },

    rewardMatrix: [rewardMatrixSchema],
    sectorLoyaltySettings: [sectorLoyaltySchema],
    activeOffers: [activeOfferSchema],
    promoCampaigns: [
      {
        code: { type: String, required: true },
        discountPercent: { type: Number, required: true },
        description: { type: String },
      },
    ],
    loyaltyLedgers: [loyaltyLedgerSchema],
    sectors: [{ type: String, trim: true }],
    categories: [{ type: String, trim: true }],
    tableOptions: [
      {
        type: { type: String, required: true }, // e.g. "VIP", "Loobey", "Standard"
        count: { type: Number, default: 0 }, // how many tables of this type
        description: { type: String }, // optional notes
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("SystemPreference", systemPreferenceSchema);
