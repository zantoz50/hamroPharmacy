const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth.middleware");
const tenantMiddleware = require("../middleware/tenant.middleware");

const controller = require("../controllers/custom.controller");
// CREATE
router.post("/", requireAuth, tenantMiddleware, controller.addCustomer);

// READ ALL
router.get("/", requireAuth, tenantMiddleware, controller.getCustomers);

// READ ONE
router.get("/:id", requireAuth, tenantMiddleware, controller.getCustomerById);

// UPDATE
router.put("/:id", requireAuth, tenantMiddleware, controller.updateCustomer);

// DELETE
router.delete("/:id", requireAuth, tenantMiddleware, controller.deleteCustomer);

// customer.routes.js
router.get(
  "/:customerId/credits",
  requireAuth,
  tenantMiddleware,
  controller.getCustomerWithCredits,
);
router.get(
  "/:customerId/invoices",
  requireAuth,
  tenantMiddleware,
  controller.getCustomerInvoices,
);

module.exports = router;
