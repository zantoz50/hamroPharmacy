"use strict";

const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const tanentRoutes = require("./tanent.routes");
const inventoryRoutes = require("./inventory.routes");
const rawMaterialRoutes = require("./rawMaterials");
const orderRoutes = require("./order.routes");
const systemPreferenceRoutes = require("./systemPereference.route");
const utilityRoutes = require("./utility.routes");
const invoiceRoutes = require("./invoice.route");
const customerRoutes = require("./customer.routes");
const notificationRoutes = require("./notification.routes");

router.use("/auth", authRoutes);
router.use("/tanents", tanentRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/raw-materials", rawMaterialRoutes);
router.use("/orders", orderRoutes);
router.use("/system-preferences", systemPreferenceRoutes);
router.use("/utilities", utilityRoutes);
router.use("/customers", customerRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/notifications", notificationRoutes);

module.exports = router;
