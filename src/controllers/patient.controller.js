"use strict";

const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs/promises");

const Patient = require("../models/patient.model");
const Disease = require("../models/disease.model");
const Location = require("../models/location.model");
const ocrUtil = require("../utils/ocr.util");
const fileUtil = require("../utils/file.util");
const logger = require("../utils/logger");

/**
 * @swagger
 * tags: [Patient]
 */

exports.createPatient = async (req, res, next) => {
  try {
    const {
      patient_id,
      firstName,
      lastName,
      dob,
      gender,
      contact,
      address,
      primary_disease,
      location,
    } = req.body;
    const existing = await Patient.findOne({ patient_id });
    if (existing)
      return res.status(409).json({ message: "patient_id must be unique" });

    const patient = new Patient({
      patient_id,
      firstName,
      lastName,
      dob,
      gender,
      contact,
      address,
      primary_disease,
      location,
      owner: req.user.id,
    });

    await patient.save();
    res.status(201).json({ patient });
  } catch (err) {
    logger.error("Error creating patient", err);
    next(err);
  }
};

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

    await Patient.deleteOne({ _id: patient._id });

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
