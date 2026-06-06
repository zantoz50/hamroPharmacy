const mongoose = require("mongoose");
const Counter = require("./counter.model");

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceId: { type: Number, unique: true },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    tenantId: {
      type: Number,
      ref: "Tenant",
      required: true,
    },
    sectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sector",
      required: true,
    },
    invoiceDate: { type: Date, default: Date.now },
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
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

module.exports = mongoose.model("Invoice", InvoiceSchema);
