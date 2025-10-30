'use strict';

const mongoose = require('mongoose');
const Location = require('../models/location.model');
const Disease = require('../models/disease.model');

/**
 * Handles mixed type references (ObjectId or string)
 * @param {string|ObjectId} value 
 * @param {string} type - 'location' or 'disease'
 * @returns {Promise<Object>} - Returns existing or new document
 */
async function handleMixedReference(value, type) {
  if (!value) return null;

  // If it's already an ObjectId, just return the reference
  if (mongoose.Types.ObjectId.isValid(value)) {
    return value;
  }

  // If it's a string, try to find or create
  if (typeof value === 'string') {
    const Model = type === 'location' ? Location : Disease;
    
    // Try to find existing document by name
    let doc = await Model.findOne({ name: value });
    
    // If not found, create new
    if (!doc) {
      doc = await Model.create({ name: value });
    }
    
    return doc._id;
  }

  return null;
}

module.exports = {
  handleMixedReference
};