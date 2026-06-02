"use strict";

const express = require("express");
const { check } = require("express-validator");
const controller = require("../controllers/tanant.controller");
const validateRequest = require("../middleware/validateRequest.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tenants
 *   description: Tenant management endpoints
 */

router.get("/", controller.getTenants);

router.get("/:tenantId/users", controller.getTenantUsers);

router.post(
  "/admin",
  [
    check("companyName").notEmpty().withMessage("Company name required"),
    check("password").isLength({ min: 6 }).withMessage("Password min length 6"),
    check("email").optional().isEmail().withMessage("Valid email required"),
    check("username").optional().notEmpty().withMessage("Username required"),
  ],
  validateRequest,
  controller.createTenantAdmin,
);

module.exports = router;
