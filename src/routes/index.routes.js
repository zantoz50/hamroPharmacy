"use strict";

const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const tanentRoutes = require("./tanent.routes");
const inventoryRoutes = require("./inventory.routes");
const rawMaterialRoutes = require("./rawMaterials");
const orderRoutes = require("./order.routes");
const systemPreferenceRoutes = require("./systemPereference.route");
// const patientRoutes = require("./patient.routes");
// const diseaseRoutes = require("./disease.routes");
// const locationRoutes = require("./location.routes");

router.use("/auth", authRoutes);
router.use("/tanents", tanentRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/raw-materials", rawMaterialRoutes);
router.use("/orders", orderRoutes);
router.use("/system-preferences", systemPreferenceRoutes);
// router.use("/patient", patientRoutes);
// router.use("/disease", diseaseRoutes);
// router.use("/location", locationRoutes);

module.exports = router;
