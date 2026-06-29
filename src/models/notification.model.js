const mongoose = require("mongoose");
const Counter = require("./counter.model");

const notificationSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true },
    eventType: { type: String, required: true }, // e.g. ORDER_CREATED, BILLING_COMPLETED
    tenantId: { type: Number, required: true },
    sectorId: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    data: { type: Object, required: true }, // flexible payload storage
    read: { type: Boolean, default: false }, // track if notification is read
  },
  { timestamps: true },
);

// Pre-save hook to auto-increment orderId
notificationSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "eventId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    this.eventId = counter.seq.toString();
  }
  next();
});

module.exports = mongoose.model("Notification", notificationSchema);
