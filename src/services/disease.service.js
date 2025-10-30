'use strict';

const Disease = require('../models/disease.model');

/**
 * Create a new disease
 * @param {Object} diseaseBody
 * @returns {Promise<Disease>}
 */
const createDisease = async (diseaseBody) => {
  return Disease.create(diseaseBody);
};

/**
 * Get disease by id
 * @param {string} id
 * @returns {Promise<Disease>}
 */
const getDiseaseById = async (id) => {
  return Disease.findById(id);
};

/**
 * Get all diseases with optional filters
 * @param {Object} filter
 * @returns {Promise<Disease[]>}
 */
const getDiseases = async (filter = {}) => {
  return Disease.find(filter);
};

/**
 * Update disease by id
 * @param {string} id
 * @param {Object} updateBody
 * @returns {Promise<Disease>}
 */
const updateDiseaseById = async (id, updateBody) => {
  const disease = await getDiseaseById(id);
  if (!disease) {
    throw new Error('Disease not found');
  }
  Object.assign(disease, updateBody);
  await disease.save();
  return disease;
};

/**
 * Delete disease by id
 * @param {string} id
 * @returns {Promise<Disease>}
 */
const deleteDisease = async (id) => {
  const disease = await getDiseaseById(id);
  if (!disease) {
    throw new Error('Disease not found');
  }
  await disease.remove();
  return disease;
};

module.exports = {
  createDisease,
  getDiseaseById,
  getDiseases,
  updateDiseaseById,
  deleteDisease
};