'use strict';

const mongoose = require('mongoose');

const DiseaseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String },
  icd10: { type: String },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Disease', DiseaseSchema);
