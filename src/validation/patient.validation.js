'use strict';

const { check, query } = require('express-validator');

exports.createPatientValidators = [
  check('patient_id').notEmpty().withMessage('patient_id required'),
  check('firstName').notEmpty().withMessage('firstName required'),
  check('lastName').notEmpty().withMessage('lastName required'),
  check('dob').isISO8601().withMessage('dob must be ISO8601 date'),
  check('gender').isIn(['male','female','other']).withMessage('gender invalid'),
  check('location').optional().custom(value => {
    return mongoose.Types.ObjectId.isValid(value) || typeof value === 'string';
  }).withMessage('location must be either an ObjectId or a string'),
  check('primary_disease').optional().custom(value => {
    return mongoose.Types.ObjectId.isValid(value) || typeof value === 'string';
  }).withMessage('primary_disease must be either an ObjectId or a string')
];

exports.updatePatientValidators = [
  check('firstName').optional().notEmpty(),
  check('lastName').optional().notEmpty(),
  check('dob').optional().isISO8601(),
  check('gender').optional().isIn(['male','female','other'])
];

exports.paginationValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
];
