'use strict';

const Location = require('../models/location.model');

/**
 * Create a new location
 * @param {Object} locationBody
 * @returns {Promise<Location>}
 */
const createLocation = async (locationBody) => {
  return Location.create(locationBody);
};

/**
 * Get location by id
 * @param {string} id
 * @returns {Promise<Location>}
 */
const getLocationById = async (id) => {
  return Location.findById(id);
};

/**
 * Get all locations with optional filters
 * @param {Object} filter
 * @returns {Promise<Location[]>}
 */
const getLocations = async (filter = {}) => {
  return Location.find(filter);
};

/**
 * Update location by id
 * @param {string} id
 * @param {Object} updateBody
 * @returns {Promise<Location>}
 */
const updateLocationById = async (id, updateBody) => {
  const location = await getLocationById(id);
  if (!location) {
    throw new Error('Location not found');
  }
  Object.assign(location, updateBody);
  await location.save();
  return location;
};

/**
 * Delete location by id
 * @param {string} id
 * @returns {Promise<Location>}
 */
const deleteLocation = async (id) => {
  const location = await getLocationById(id);
  if (!location) {
    throw new Error('Location not found');
  }
  await location.remove();
  return location;
};

module.exports = {
  createLocation,
  getLocationById,
  getLocations,
  updateLocationById,
  deleteLocation
};