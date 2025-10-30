'use strict';

const mongoose = require('mongoose');

const MedicalHistorySchema = new mongoose.Schema({
  source: { type: String },
  extracted_text: { type: String },
  date: { type: Date, default: Date.now },
  image_path: { type: String }
}, { _id: false });

const ImageSchema = new mongoose.Schema({
  filename: { type: String },
  path: { type: String },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const PatientSchema = new mongoose.Schema({
  patient_id: { type: String, required: true, unique: true, index: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  contact: {
    phone: { type: String },
    email: { type: String }
  },
  address: { type: String },
  location: { 
    type: mongoose.Schema.Types.Mixed, 
    ref: 'Location',
    validate: {
      validator: function(v) {
        return mongoose.Types.ObjectId.isValid(v) || typeof v === 'string';
      },
      message: 'Location must be either an ObjectId or a string'
    }
  },
  primary_disease: { 
    type: mongoose.Schema.Types.Mixed,
    ref: 'Disease',
    validate: {
      validator: function(v) {
        return mongoose.Types.ObjectId.isValid(v) || typeof v === 'string';
      },
      message: 'Disease must be either an ObjectId or a string'
    }
  },
  medical_history: [MedicalHistorySchema],
  images: [ImageSchema],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

PatientSchema.statics.search = async function search(filter = {}, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const query = this.find(filter);
  const [docs, total] = await Promise.all([
    query.sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
    this.countDocuments(filter).exec()
  ]);
  return { docs, total, page, limit };
};

module.exports = mongoose.model('Patient', PatientSchema);
