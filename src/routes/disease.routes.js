'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validateRequest.middleware');
const diseaseService = require('../services/disease.service');
const router = express.Router();

/**
 * @swagger
 * /api/diseases:
 *   post:
 *     summary: Create a new disease
 *     tags: [Diseases]
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
 *               code:
 *                 type: string
 *               icd10:
 *                 type: string
 *               description:
 *                 type: string
 */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const disease = await diseaseService.createDisease(req.body);
    res.status(201).json(disease);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/diseases:
 *   get:
 *     summary: Get all diseases
 *     tags: [Diseases]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const diseases = await diseaseService.getDiseases(req.query);
    res.json(diseases);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/diseases/{id}:
 *   get:
 *     summary: Get a disease by id
 *     tags: [Diseases]
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
    const disease = await diseaseService.getDiseaseById(req.params.id);
    if (!disease) {
      return res.status(404).json({ message: 'Disease not found' });
    }
    res.json(disease);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/diseases/{id}:
 *   put:
 *     summary: Update a disease
 *     tags: [Diseases]
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
    const disease = await diseaseService.updateDiseaseById(req.params.id, req.body);
    res.json(disease);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/diseases/{id}:
 *   delete:
 *     summary: Delete a disease
 *     tags: [Diseases]
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
    await diseaseService.deleteDisease(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;