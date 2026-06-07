"use strict";

const express = require("express");
const multer = require("multer");
const controller = require("../controllers/systemPreference.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const tenantMiddleware = require("../middleware/tenant.middleware");
const router = express.Router();

// Multer setup for logo upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/logos/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: SystemPreferences
 *   description: Manage corporate system preferences
 */

router.get("/", controller.getPreferences);
router.put("/", controller.updatePreferences);

// Upload company logo
router.post("/logo", upload.single("logo"), controller.uploadLogo);

/**
 * @swagger
 * /system-preferences/sectors:
 *   post:
 *     tags: [SystemPreferences]
 *     summary: Add a new sector Santosh Thapa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sectorId:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example : restaurant
 *               description:
 *                 type: string
 *                 example: restauratant sector
 *
 *     responses:
 *       200:
 *         description: Sector added successfully
 *   get:
 *     tags: [SystemPreferences]
 *     summary: Get all sectors
 *     responses:
 *       200:
 *         description: List of sectors
 *
 * /system-preferences/sectors/{sector}:
 *   put:
 *     tags: [SystemPreferences]
 *     summary: Update an existing sector
 *     parameters:
 *       - in: path
 *         name: sector
 *         required: true
 *         schema:
 *           type: string
 *         description: Existing sector name to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sectorId:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example : restaurant
 *               description:
 *                 type: string
 *                 example: restauratant sector
 *     responses:
 *       200:
 *         description: Sector updated successfully
 *
 * /system-preferences/categories:
 *   post:
 *     tags: [SystemPreferences]
 *     summary: Add a new category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 example: OTC
 *     responses:
 *       200:
 *         description: Category added successfully
 *   get:
 *     tags: [SystemPreferences]
 *     summary: Get all categories
 *     responses:
 *       200:
 *         description: List of categories
 *
 * /system-preferences/categories/{category}:
 *   put:
 *     tags: [SystemPreferences]
 *     summary: Update an existing category
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Existing category name to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newCategory:
 *                 type: string
 *                 example: Nutraceuticals
 *     responses:
 *       200:
 *         description: Category updated successfully
 *
 * /system-preferences/sectors-categories:
 *   get:
 *     tags: [SystemPreferences]
 *     summary: Get sectors and categories together
 *     responses:
 *       200:
 *         description: Sectors and categories returned successfully
 */
router.post("/sectors", controller.addSector);
router.get("/sectors", requireAuth, tenantMiddleware, controller.getSectors);
router.put("/sectors/:sector", controller.updateSector);
router.post(
  "/categories",
  requireAuth,
  tenantMiddleware,
  controller.addCategory,
);
router.get(
  "/categories",
  requireAuth,
  tenantMiddleware,
  controller.getCategories,
);
router.put(
  "/categories/:category",
  requireAuth,
  tenantMiddleware,
  controller.updateCategory,
);

router.get(
  "/sectors/:sectorId",
  requireAuth,
  tenantMiddleware,
  controller.getCategoriesBySectorId,
);

module.exports = router;
