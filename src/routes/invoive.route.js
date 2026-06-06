const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoice.controller");

// POST /invoices
router.post("/invoices", invoiceController.createInvoice);

// GET /invoices
router.get("/invoices", invoiceController.getInvoices);

module.exports = router;
