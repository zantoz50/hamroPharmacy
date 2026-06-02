'use strict';

const Patient = require('../models/patient.model');
const { handleMixedReference } = require('../utils/reference.util');

exports.createPatient = async (data) => {
  const existing = await Patient.findOne({ patient_id: data.patient_id });
  if (existing) throw Object.assign(new Error('patient_id must be unique'), { status: 409 });

  // Handle location and disease references
  if (data.location) {
    data.location = await handleMixedReference(data.location, 'location');
  }
  if (data.primary_disease) {
    data.primary_disease = await handleMixedReference(data.primary_disease, 'disease');
  }

  const patient = new Patient(data);
  await patient.save();
  return patient;
};

exports.findPatientById = (id, options = {}) => {
  let q = Patient.findById(id);
  if (options.populate) q = q.populate(options.populate);
  return q.exec();
};

exports.updatePatient = async (id, updates) => {
  const patient = await Patient.findById(id);
  if (!patient) throw Object.assign(new Error('Patient not found'), { status: 404 });

  // Handle location and disease references
  if (updates.location) {
    updates.location = await handleMixedReference(updates.location, 'location');
  }
  if (updates.primary_disease) {
    updates.primary_disease = await handleMixedReference(updates.primary_disease, 'disease');
  }

  Object.assign(patient, updates);
  await patient.save();
  return patient;
};

exports.deletePatient = async (id) => {
  const patient = await Patient.findById(id);
  if (!patient) throw Object.assign(new Error('Patient not found'), { status: 404 });
  await Patient.deleteOne({ _id: id });
  return true;
};

exports.listPatients = async (filter, { page = 1, limit = 20 } = {}) => {
  return Patient.search(filter, { page, limit });
};
