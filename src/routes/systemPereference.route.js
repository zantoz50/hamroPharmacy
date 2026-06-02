"use strict";

const express = require("express");
const multer = require("multer");
const controller = require("../controllers/systemPreference.controller");

const router = express.Router();

// Multer setup for logo upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/logos/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: SystemPreferences
 *   description: Manage corporate system preferences
 */

router.get("/", controller.getPreferences);
router.put("/", controller.updatePreferences);

// Upload company logo
router.post("/logo", upload.single("logo"), controller.uploadLogo);

// NEW: sectors & categories
router.post("/sectors", controller.addSector);
router.post("/categories", controller.addCategory);
router.get("/sectors-categories", controller.getSectorsAndCategories);

module.exports = router;
