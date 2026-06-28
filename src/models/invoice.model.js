const mongoose = require("mongoose");
const Counter = require("./counter.model");

const masterInvoiceSchema = new mongoose.Schema(
  {
    masterInvoiceId: { type: Number, unique: true },
    tenantId: { type: Number, ref: "Tenant", required: true },
    orderId: { type: Number, required: true },
    customerName: { type: String },
    customerId: { type: Number, ref: "Customer" },
    // Multiple sectors supported
    sectorIds: [{ type: Number, ref: "Sector" }],
    sectorNames: [{ type: String }],
    invoiceDate: { type: Date, default: Date.now },
    totalAmount: { type: Number, required: true },
    paymentType: {
      type: String,
      enum: ["cash", "credit", "qr"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid", "partial"],
      default: "unpaid",
    },
    tableNo: { type: String },
    childInvoices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Invoice" }],
    summary: {
      subtotal: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      preRedemptionTotal: { type: Number, default: 0 },
      pointsBalanceAvailable: { type: Number, default: 0 },
      redeemedPoints: { type: Number, default: 0 },
      redemptionDiscount: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      prospectivePointsEarned: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

// Auto-increment invoiceId
masterInvoiceSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "masterInvoiceId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    this.masterInvoiceId = counter.seq;
  }
  next();
});
const MasterInvoice = mongoose.model("MasterInvoice", masterInvoiceSchema);

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceId: { type: Number, unique: true },
    masterInvoiceId: { type: Number, required: true },
    orderId: { type: Number, required: true },
    tenantId: { type: Number, required: true },
    sectorId: { type: Number, required: true },
    customerId: { type: Number, ref: "Customer" },
    customerName: { type: String, ref: "Customer" },
    deliveryType: {
      type: String,
      enum: ["dine-in", "takeaway", "delivery"],
      required: true,
    },
    invoiceDate: { type: Date, default: Date.now },
    totalAmount: { type: Number, required: true },
    paymentType: {
      type: String,
      enum: ["cash", "credit", "qr"],
      default: "cash",
    },
    creditAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    preRedemptionTotal: { type: Number, default: 0 },
    pointsBalanceAvailable: { type: Number, default: 0 },
    redeemedPoints: { type: Number, default: 0 },
    redemptionDiscount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    prospectivePointsEarned: { type: Number, default: 0 },
    // Items grouped under one invoice
    items: [
      {
        inventoryId: { type: Number, required: true },
        sectorId: { type: Number, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        sku: { type: String },
        originalPrice: { type: Number, required: true },
        stock: { type: Number },
        unitPoints: { type: Number },
        totalPrice: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true },
);
// Auto-increment invoiceId
InvoiceSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "invoiceId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    this.invoiceId = counter.seq;
  }
  next();
});

// module.exports = mongoose.model("Invoice", InvoiceSchema);

const Invoice = mongoose.model("Invoice", InvoiceSchema);
module.exports = { MasterInvoice, Invoice };
