"use strict";

const express = require("express");
const { check } = require("express-validator");
const controller = require("../controllers/order.controller");
const validateRequest = require("../middleware/validateRequest.middleware");
const tenantMiddleware = require("../middleware/tenant.middleware");

const router = express.Router();

router.use(tenantMiddleware);
/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Manage tenant orders
 */

router.get("/", controller.getOrders);

router.post(
  "/",
  [
    check("items").isArray().withMessage("Items array required"),
    check("totalPrice").isNumeric().withMessage("Total price must be numeric"),
    check("deliveryType")
      .isIn(["dine-in", "takeaway", "delivery"])
      .withMessage("Valid delivery type required"),
  ],
  validateRequest,
  controller.createOrder,
);

router.put("/:id/status", controller.updateOrderStatus);

module.exports = router;
