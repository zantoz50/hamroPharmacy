"use strict";

const { check } = require("express-validator");

exports.registerValidators = [
  // check("email").isEmail().withMessage("Valid email required"),
  // check("password").isLength({ min: 6 }).withMessage("Password min length 6"),
  // check("firstName").notEmpty().withMessage("firstName required"),
  // check("lastName").notEmpty().withMessage("lastName required"),

  check("email")
    .notEmpty()
    .withMessage("Email or username required")
    .isString()
    .withMessage("Identifier must be a string"),
  check("password").isLength({ min: 6 }).withMessage("Password min length 6"),
  check("firstName").notEmpty().withMessage("firstName required"),
  check("lastName").notEmpty().withMessage("lastName required"),
];

exports.loginValidators = [
  // check('email').isEmail().withMessage('Valid email required'),
  check("email")
    .notEmpty()
    .withMessage("Email or username required")
    .isString()
    .withMessage("Identifier must be a string"),
  check("password").exists().withMessage("Password required"),
];
