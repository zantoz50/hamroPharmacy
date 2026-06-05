// routes/category.routes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/category.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const tenantMiddleware = require("../middleware/tenant.middleware");

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management under sectors
 */

router.post("/", requireAuth, tenantMiddleware, controller.createCategory);
router.get("/", requireAuth, tenantMiddleware, controller.getCategories);
router.put("/:id", requireAuth, tenantMiddleware, controller.updateCategory);
router.delete("/:id", requireAuth, tenantMiddleware, controller.deleteCategory);

module.exports = router;
