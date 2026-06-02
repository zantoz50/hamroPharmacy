"use strict";

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { check, query } = require("express-validator");

const controller = require("../controllers/patient.controller");
const auth = require("../middleware/auth.middleware");
const validateRequest = require("../middleware/validateRequest.middleware");

const router = express.Router();

// Configure multer storage dynamic per patient id
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const patientId = req.params.id || req.body.patient_id || "unknown";
    const dest = path.join(process.cwd(), "uploads", "patients", patientId);
    try {
      await fs.promises.mkdir(dest, { recursive: true });
      cb(null, dest);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const name = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, name);
  },
});
const upload = multer({ storage });

// Create patient
router.post(
  "/create",
  auth.requireAuth,
  [
    // check("patient_id").notEmpty().withMessage("patient_id required"),
    check("firstName").notEmpty().withMessage("firstName required"),
    check("lastName").notEmpty().withMessage("lastName required"),
    // check("dob").isISO8601().toDate().withMessage("dob must be ISO8601 date"),
    check("gender")
      .isIn(["male", "female", "other"])
      .withMessage("gender invalid"),
  ],
  validateRequest,
  controller.createPatient
);

// List patients
router.get(
  "/all",
  auth.requireAuth,
  [
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
    query("search").optional().isString(),
    query("disease").optional().isMongoId(),
  ],
  validateRequest,
  controller.listPatients
);

// Get patient
router.get("/:id", auth.requireAuth, controller.getPatient);

// Update patient
router.put(
  "/:id",
  auth.requireAuth,
  auth.requireOwnerOrAdmin,
  [
    check("firstName").optional().notEmpty(),
    check("lastName").optional().notEmpty(),
    check("dob").optional().isISO8601().toDate(),
    check("gender").optional().isIn(["male", "female", "other"]),
  ],
  validateRequest,
  controller.updatePatient
);

// Delete patient
router.delete(
  "/:id",
  auth.requireAuth,
  auth.requireAdmin,
  controller.deletePatient
);

// Upload image
router.post(
  "/:id/images",
  auth.requireAuth,
  upload.single("image"),
  controller.uploadPatientImage
);

module.exports = router;
