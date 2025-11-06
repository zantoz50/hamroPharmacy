"use strict";

const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const patientRoutes = require("./patient.routes");
const diseaseRoutes = require("./disease.routes");
const locationRoutes = require("./location.routes");

router.use("/auth", authRoutes);
router.use("/patient", patientRoutes);
router.use("/disease", diseaseRoutes);
router.use("/location", locationRoutes);

module.exports = router;
