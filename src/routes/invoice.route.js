const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoice.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const tenantMiddleware = require("../middleware/tenant.middleware");

router.post(
  "/",
  requireAuth,
  tenantMiddleware,
  invoiceController.createInvoice,
);

// GET /invoices
router.get("/users", tenantMiddleware, invoiceController.getInvoices);

module.exports = router;
