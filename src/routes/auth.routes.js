"use strict";

const express = require("express");
const { check } = require("express-validator");
const controller = require("../controllers/auth.controller");
const validateRequest = require("../middleware/validateRequest.middleware");

const { requireAuth } = require("../middleware/auth.middleware");
const tenantMiddleWare = require("../middleware/tenant.middleware");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration and login endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new tenant user
 *     description: Creates a new user account tied to a tenant (companyName → tenantId).
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       description: User registration data
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - companyName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: santosh@example.com
 *               username:
 *                 type: string
 *                 example: santoshUser
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "P@ssw0rd"
 *               firstName:
 *                 type: string
 *                 example: Santosh
 *               lastName:
 *                 type: string
 *                 example: Thapa
 *               companyName:
 *                 type: string
 *                 example: Epicurean Bistro
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Duplicate email/username
 *       500:
 *         description: Internal server error
 */
router.post(
  "/register",
  [
    check("password").isLength({ min: 6 }).withMessage("Password min length 6"),
    check("companyName").notEmpty().withMessage("Company name required"),
    check("subscriptionPlan")
      .isArray({ min: 1 })
      .withMessage("Subscription plan must be an array")
      .custom((plans) => {
        const allowed = ["restaurant", "cafeteria", "mart", "all"];
        return plans.every((p) => allowed.includes(p));
      })
      .withMessage("Invalid subscription plan(s)"),
  ],
  validateRequest,
  controller.register,
);

/**
 * @swagger
 * /activate-user:
 *   post:
 *     summary: Activate a user under a company
 *     description: Allows a user to register under an existing company using an activation link.
 *     tags: [Activation]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Activation token sent via email or SMS
 *     requestBody:
 *       required: true
 *       description: User signup data
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - role
 *               - sector
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "P@ssw0rd"
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               role:
 *                 type: string
 *                 enum: [Admin, Customer, Viewer]
 *                 example: Customer
 *               sector:
 *                 type: string
 *                 example: Finance
 *     responses:
 *       201:
 *         description: User activated successfully
 *       400:
 *         description: Invalid activation link
 *       409:
 *         description: Email already in use
 */
router.post(
  "/activate-user",
  [
    check("email").isEmail().withMessage("Valid email required"),
    check("password").isLength({ min: 6 }).withMessage("Password min length 6"),
    check("firstName").notEmpty().withMessage("First name required"),
    check("lastName").notEmpty().withMessage("Last name required"),
    check("role")
      .isIn(["admin", "customer", "employee"])
      .withMessage("Invalid role"),
  ],
  validateRequest,
  requireAuth,
  controller.activateUser,
);

router.get("/users", requireAuth, tenantMiddleWare, controller.getUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email or username
 *     tags: [Authentication]
 *     description: Authenticates a user by either email or username and returns a JWT token with tenantId.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: santosh@example.com
 *               username:
 *                 type: string
 *                 example: santoshUser
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "P@ssw0rd"
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       422:
 *         description: Validation error
 */
router.post(
  "/login",
  [
    check("password").exists().withMessage("Password required"),
    check("username")
      .exists()
      .withMessage("Email or username required")
      .isString()
      .withMessage("Identifier must be a string"),
  ],
  (req, res, next) => {
    if (!req.body.email && !req.body.username) {
      return res
        .status(400)
        .json({ message: "Either email or username is required" });
    }
    next();
  },
  validateRequest,
  controller.login,
);

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     summary: Verify JWT token
 *     description: Validates a JWT and returns decoded payload including tenantId.
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Token valid
 *       401:
 *         description: Invalid or expired token
 */
router.get("/verify", controller.verifyToken);

module.exports = router;
