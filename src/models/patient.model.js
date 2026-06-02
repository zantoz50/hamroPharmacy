"use strict";
// Patient.counter = require("./counter.model");
const mongoose = require("mongoose");
const Counter = require("./counter.model.js"); // <- ensure this path is correct relative to this file

const MedicalHistorySchema = new mongoose.Schema({
  source: { type: String },
  extracted_text: { type: String },
  date: { type: Date, default: Date.now },
  image_path: { type: String },
});

const ImageSchema = new mongoose.Schema({
  filename: { type: String },
  path: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

const PatientSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true }, // auto-incremented
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: Date }, // date of birth
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    contact: {
      phone: { type: String },
      email: { type: String },
    },
    address: { type: String },
    location: {
      type: mongoose.Schema.Types.Mixed,
      ref: "Location",
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v) || typeof v === "string";
        },
        message: "Location must be either an ObjectId or a string",
      },
    },
    primary_disease: {
      type: mongoose.Schema.Types.Mixed,
      ref: "Disease",
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v) || typeof v === "string";
        },
        message: "Disease must be either an ObjectId or a string",
      },
    },
    medical_history: [MedicalHistorySchema],
    images: [ImageSchema],
    // owner: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   required: true,
    // },
  },
  { timestamps: true, _id: false },
);
// Pre-validate: assign auto-increment id before validation runs
PatientSchema.pre("save", async function (next) {
  try {
    if (this.isNew && (this.id === undefined || this.id === null)) {
      // Counter must be required correctly above
      // const counter = await Counter.findOneAndUpdate(
      //   { _id: "id" },
      //   { $inc: { seq: 1 } },
      //   { new: true, upsert: true, setDefaultsOnInsert: true },
      // ).exec();
      // if (!counter) {
      //   return next(new Error("Unable to get counter for id"));
      // }

      const counter = await Counter.findOneAndUpdate(
        { _id: "patients_sequence" }, // Identifies this specific sequence securely
        { $inc: { seq: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      ).exec();

      if (!counter || typeof counter.seq !== "number") {
        return next(
          new Error("Database sequence generation failed inside hook."),
        );
      }
      this.id = counter.seq;
    }
    next();
  } catch (err) {
    next(err);
  }
});

// dob validator ensures it's a valid Date (ISO)
PatientSchema.path("dob").validate(function (value) {
  if (value === undefined || value === null || value === "") return true;
  return value instanceof Date && !isNaN(value.getTime());
}, "dob must be ISO8601 date");

PatientSchema.statics.search = async function search(
  filter = {},
  { page = 1, limit = 20 } = {},
) {
  const skip = (page - 1) * limit;
  const query = this.find(filter);
  const [docs, total] = await Promise.all([
    query.sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
    this.countDocuments(filter).exec(),
  ]);
  return { docs, total, page, limit };
};

module.exports = mongoose.model("Patient", PatientSchema);
