'use strict';

const express = require('express');
const { check } = require('express-validator');
const controller = require('../controllers/auth.controller');
const validateRequest = require('../middleware/validateRequest.middleware');

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
 *     summary: Register a new user
 *     description: Creates a new user account with first name, last name, email, and password.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       description: User registration data
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: santosh@example.com
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
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 65f6b23c9f9c2f1d2e8d3f4a
 *                     email:
 *                       type: string
 *                       example: santosh@example.com
 *                     firstName:
 *                       type: string
 *                       example: Santosh
 *                     lastName:
 *                       type: string
 *                       example: Thapa
 *       400:
 *         description: Validation error (missing fields or invalid email)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: Valid email required
 *       500:
 *         description: Internal server error
 */
router.post('/register',
  [
    check('email').isEmail().withMessage('Valid email required'),
    check('password').isLength({ min: 6 }).withMessage('Password min length 6'),
    check('firstName').notEmpty().withMessage('firstName required'),
    check('lastName').notEmpty().withMessage('lastName required')
  ],
  validateRequest,
  controller.register
);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Get all users
 *     description: Returns a list of all users
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/login',
  [
    check('email').isEmail().withMessage('Valid email required'),
    check('password').exists().withMessage('Password required')
  ],
  validateRequest,
  controller.login
);

module.exports = router;
