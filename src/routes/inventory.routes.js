"use strict";

const express = require("express");
const { check } = require("express-validator");
const controller = require("../controllers/inventory.controller");
const validateRequest = require("../middleware/validateRequest.middleware");
const { requireAuth } = require("../middleware/auth.middleware");
const tenantMiddleware = require("../middleware/tenant.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Manage tenant inventory items
 */

router.get("/", controller.getInventory);

router.post(
  "/",
  requireAuth,
  tenantMiddleware,
  [
    check("name").notEmpty().withMessage("Item name required"),
    check("sector")
      .isIn(["restaurant", "cafeteria", "mart"])
      .withMessage("Valid sector required"),
    check("category").notEmpty().withMessage("Category required"),
    check("price").isNumeric().withMessage("Price must be numeric"),
    check("stock").isNumeric().withMessage("Stock must be numeric"),
  ],
  validateRequest,
  controller.addInventory,
);

router.put("/:id", controller.updateInventory);
router.delete("/:id", controller.deleteInventory);

/**
 * @swagger
 * /api/inventory/stats:
 *   get:
 *     summary: Get inventory dashboard statistics
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: Inventory stats including stock count, worth, investment, margin
 */
router.get("/stats", controller.getInventoryStats);

module.exports = router;
