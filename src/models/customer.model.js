const mongoose = require("mongoose");
const Counter = require("./counter.model");
const customerSchema = new mongoose.Schema(
  {
    customerId: { type: Number, unique: true }, // custom ID
    tenantId: {
      type: Number,
      ref: "Tenant",
      required: true,
    },
    companyName: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    role: { type: String, default: "customer" },
    creditBalance: { type: Number, default: 0 }, // NEW FIELD
  },
  { timestamps: true },
);
// Pre-save hook to auto-increment inventoryId
customerSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "customerId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    this.customerId = counter.seq;
  }
  next();
});
module.exports = mongoose.model("Customer", customerSchema);
