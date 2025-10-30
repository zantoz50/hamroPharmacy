'use strict';

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const patientRoutes = require('./patient.routes');
const diseaseRoutes = require('./disease.routes');
const locationRoutes = require('./location.routes');

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/diseases', diseaseRoutes);
router.use('/locations', locationRoutes);

module.exports = router;
