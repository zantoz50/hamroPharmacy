"use strict";

const express = require("express");
const { check } = require("express-validator");
const controller = require("../controllers/auth.controller");
const validateRequest = require("../middleware/validateRequest.middleware");

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
  ],
  validateRequest,
  controller.register,
);

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
    // Either email or username must be provided
    // check("email").optional().isEmail().withMessage("Valid email required"),
    check("email")
      .notEmpty()
      .withMessage("Email or username required")
      .isString()
      .withMessage("Identifier must be a string"),
    check("username").optional().notEmpty().withMessage("Username required"),
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
