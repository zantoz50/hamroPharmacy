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
router.get("/", requireAuth, tenantMiddleware, invoiceController.getInvoices);
router.post(
  "/master-invoices",
  requireAuth,
  tenantMiddleware,
  invoiceController.createMasterInvoice,
);

router.put(
  "/child-invoices/:id",
  requireAuth,
  tenantMiddleware,
  invoiceController.updateChildInvoice,
);

router.get(
  "/master",
  requireAuth,
  tenantMiddleware,
  invoiceController.getMasterInvoice,
);

router.put(
  "/master/update-invoice",
  requireAuth,
  tenantMiddleware,
  invoiceController.updateMasterInvoice,
);
module.exports = router;
