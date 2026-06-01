"use strict";

const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs/promises");
const { requireAuth } = require("../middleware/auth.middleware");
const Patient = require("../models/patient.model");
const Counter = require("../models/counter.model");
const Disease = require("../models/disease.model");
const Location = require("../models/location.model");
const ocrUtil = require("../utils/ocr.util");
const fileUtil = require("../utils/file.util");
const logger = require("../utils/logger");

/**
 * @swagger
 * tags: [Patient]
 */

// Helper: get next sequence for a named counter
async function getNextSequence(name) {
  const updated = await Counter.findOneAndUpdate(
    { id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return updated.seq;
}

// Convert fields that are date-like in incoming data to Date (ISO) objects.
// Accepts strings or timestamps, returns Date or undefined.
function parseDateToISO(value) {
  if (value === undefined || value === null || value === "") return undefined;
  // If it's already a Date
  if (value instanceof Date) return value;
  // Try to parse string or number
  const d = new Date(value);
  if (isNaN(d.getTime())) return undefined;
  return d;
}

exports.createPatient = async (req, res) => {
  try {
    const body = req.body || {};

    // 1. Structure the incoming frontend payload to match your exact PatientSchema fields
    const data = {
      _id: new mongoose.Types.ObjectId(), // FORCE Mongoose to have a valid _id immediately
      firstName: String(body.firstName).trim(),
      lastName: String(body.lastName).trim(),
      gender: body.gender,
      address: body.address ? String(body.address).trim() : undefined,

      // Maps your flat frontend phone/email keys into your sub-object schema
      contact: {
        phone: body.phone ? String(body.phone).trim() : undefined,
        email: body.email ? String(body.email).trim() : undefined,
      },

      location: body.location,
      primary_disease: body.primary_disease || body.diseases, // handles either name variation
      medical_history: body.medicalHistory ? [body.medicalHistory] : [],
      images: body.images || [],
    };

    // 2. Safely parse incoming birth date field ("dateOfBirth" mapped to schema "dob")
    try {
      const incomingDate = body.dob || body.dateOfBirth;
      if (incomingDate) {
        const dob = parseDateToISO(incomingDate);
        if (dob) data.dob = dob;
      }
    } catch (dateErr) {
      console.error("Date parsing utility failed:", dateErr);
      return res.status(400).json({ error: "Invalid date format provided" });
    }

    // 3. DO NOT call getNextSequence here. Your schema's pre("validate") hook
    // does this automatically behind the scenes using Counter collection.
    const patient = new Patient(data);
    const saved = await patient.save();

    // 4. Send clean response back to client
    const out = saved.toObject({ getters: true });

    if (out.dob) out.dob = new Date(out.dob).toISOString();
    if (out.createdAt) out.createdAt = new Date(out.createdAt).toISOString();
    if (out.updatedAt) out.updatedAt = new Date(out.updatedAt).toISOString();

    return res.status(201).json(out);
  } catch (err) {
    console.error("createPatient error stack trace:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    if (err.name === "MongoServerError" && err.code === 11000) {
      return res
        .status(409)
        .json({ error: "Duplicate id or unique field conflict" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get list (with pagination)
async function getPatients(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(
      1,
      Math.min(100, parseInt(req.query.limit, 10) || 20),
    );
    const filter = {};

    // optional search by name or phone
    if (req.query.q) {
      const escaped = String(req.query.q).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );
      const re = new RegExp(escaped, "i");
      filter.$or = [
        { firstName: re },
        { lastName: re },
        { phone: re },
        { address: re },
      ];
    }

    const [items, total] = await Promise.all([
      Patient.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      Patient.countDocuments(filter).exec(),
    ]);

    // convert dates to ISO strings
    const mapped = items.map((it) => {
      if (it.dob) it.dob = new Date(it.dob).toISOString();
      if (it.registrationDate)
        it.registrationDate = new Date(it.registrationDate).toISOString();
      if (it.createdAt) it.createdAt = new Date(it.createdAt).toISOString();
      if (it.updatedAt) it.updatedAt = new Date(it.updatedAt).toISOString();
      return it;
    });

    return res.json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      items: mapped,
    });
  } catch (err) {
    console.error("getPatients error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

exports.listPatients = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search;
    const disease = req.query.disease;

    const filter = {};
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { "contact.phone": regex },
        { "contact.email": regex },
        { patient_id: regex },
      ];
    }
    if (disease) filter.primary_disease = disease;

    const result = await Patient.search(filter, { page, limit });
    res.json(result);
  } catch (err) {
    logger.error("Error listing patients", err);
    next(err);
  }
};

exports.getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate("primary_disease")
      .populate("location")
      .exec();
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json({ patient });
  } catch (err) {
    logger.error("Error getting patient", err);
    next(err);
  }
};

exports.updatePatient = async (req, res, next) => {
  try {
    const allowed = [
      "firstName",
      "lastName",
      "dob",
      "gender",
      "contact",
      "address",
      "primary_disease",
      "location",
    ];
    const updates = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // ownership check already done by middleware requireOwnerOrAdmin
    Object.assign(patient, updates);
    patient.updatedAt = new Date();
    await patient.save();
    res.json({ patient });
  } catch (err) {
    logger.error("Error updating patient", err);
    next(err);
  }
};

exports.deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    await Patient.deleteOne({ _id: patient.id });

    // delete uploads folder for patient
    const dir = path.join(process.cwd(), "uploads", "patients", req.params.id);
    await fileUtil.removeFolderRecursive(dir).catch((e) => {
      // log and continue
      logger.warn("Failed to delete patient uploads", e);
    });

    res.status(204).send();
  } catch (err) {
    logger.error("Error deleting patient", err);
    next(err);
  }
};

exports.uploadPatientImage = async (req, res, next) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Image file is required" });

    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const filePath = req.file.path;
    const ocrText = await ocrUtil.extractText(filePath);
    const mh = {
      source: "ocr",
      extracted_text: ocrText || "",
      image_path: filePath,
      date: new Date(),
    };
    patient.medical_history.push(mh);
    patient.images.push({ filename: req.file.filename, path: filePath });
    await patient.save();

    res.json({ ocrText, patient });
  } catch (err) {
    logger.error("Error uploading patient image", err);
    next(err);
  }
};
