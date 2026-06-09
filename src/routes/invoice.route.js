const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoice.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const tenantMiddleware = require("../middleware/tenant.middleware");

// router.use(requireAuth);
// router.use(tenantMiddleware);

router.post(
  "/invoices",
  requireAuth,
  tenantMiddleware,
  invoiceController.createInvoice,
);

// GET /invoices
router.get(
  "/invoices",
  requireAuth,
  tenantMiddleware,
  invoiceController.getInvoices,
);

module.exports = router;
