"use strict";

const express = require("express");
const { check } = require("express-validator");
const rawMaterialController = require("../controllers/rawMaterials.controller");
const validateRequest = require("../middleware/validateRequest.middleware");
const { requireAuth } = require("../middleware/auth.middleware");
const tenantMiddleware = require("../middleware/tenant.middleware");

const router = express.Router();

// /**
//  * @swagger
//  * tags:
//  *   name: Raw Materials
//  *   description: Manage tenant raw materials
//  */

// router.get("/", controller.getRawMaterials);

// router.post(
//   "/",
//   [
//     check("name").notEmpty().withMessage("Material name required"),
//     check("sector")
//       .isIn(["restaurant", "cafeteria", "mart"])
//       .withMessage("Valid sector required"),
//     check("category").notEmpty().withMessage("Category required"),
//     check("quantity").isNumeric().withMessage("Quantity must be numeric"),
//     check("unit").notEmpty().withMessage("Unit required"),
//     check("costPerUnit")
//       .isNumeric()
//       .withMessage("Cost per unit must be numeric"),
//   ],
//   validateRequest,
//   controller.addRawMaterial,
// );

// router.put("/:id", controller.updateRawMaterial);

/**
 * @swagger
 * tags:
 *   name: RawMaterials
 *   description: API for managing raw materials
 */

/**
 * @swagger
 * /api/raw-materials:
 *   post:
 *     summary: Create a new raw material stock row
 *     tags: [RawMaterials]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RawMaterial'
 *     responses:
 *       201:
 *         description: Raw material created successfully
 */
router.post(
  "/",
  requireAuth,
  tenantMiddleware,
  rawMaterialController.createRawMaterial,
);

/**
 * @swagger
 * /api/raw-materials:
 *   get:
 *     summary: Get all raw materials for tenant
 *     tags: [RawMaterials]
 *     responses:
 *       200:
 *         description: List of raw materials
 */
router.get(
  "/",
  requireAuth,
  tenantMiddleware,
  rawMaterialController.getRawMaterials,
);

/**
 * @swagger
 * /api/raw-materials/{id}:
 *   put:
 *     summary: Update a raw material
 *     tags: [RawMaterials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RawMaterial'
 *     responses:
 *       200:
 *         description: Raw material updated successfully
 */
router.put(
  "/:id",
  requireAuth,
  tenantMiddleware,
  rawMaterialController.updateRawMaterial,
);

/**
 * @swagger
 * /api/raw-materials/{id}:
 *   delete:
 *     summary: Delete a raw material
 *     tags: [RawMaterials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Raw material deleted successfully
 */
router.delete(
  "/:id",
  requireAuth,
  tenantMiddleware,
  rawMaterialController.deleteRawMaterial,
);

/**
 * @swagger
 * /api/raw-materials/stats:
 *   get:
 *     summary: Get dashboard stats (stock rows, alerts, investment)
 *     tags: [RawMaterials]
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get("/stats", requireAuth, tenantMiddleware, async (req, res) => {
  try {
    const rawMaterials = await require("../models/rawMaterial.model").find({
      tenantId: req.tenantId,
    });

    const totalRows = rawMaterials.length;
    const lowAlerts = rawMaterials.filter(
      (r) => r.initialQuantity <= r.lowAlertThreshold,
    ).length;
    const totalInvestment = rawMaterials.reduce(
      (sum, r) => sum + r.initialQuantity * r.costPerUnit,
      0,
    );

    res.status(200).json({
      currentStockRows: totalRows,
      lowLimitWarnAlerts: lowAlerts,
      rawInventoryInvestment: totalInvestment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching stats", error: error.message });
  }
});

module.exports = router;
