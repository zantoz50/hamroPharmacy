'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validateRequest.middleware');
const locationService = require('../services/location.service');
const router = express.Router();

/**
 * @swagger
 * /api/locations:
 *   post:
 *     summary: Create a new location
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               coordinates:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const location = await locationService.createLocation(req.body);
    res.status(201).json(location);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: Get all locations
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const locations = await locationService.getLocations(req.query);
    res.json(locations);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/locations/{id}:
 *   get:
 *     summary: Get a location by id
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const location = await locationService.getLocationById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json(location);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/locations/{id}:
 *   put:
 *     summary: Update a location
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const location = await locationService.updateLocationById(req.params.id, req.body);
    res.json(location);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/locations/{id}:
 *   delete:
 *     summary: Delete a location
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    await locationService.deleteLocation(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;