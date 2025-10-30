'use strict';

const request = require('supertest');
const app = require('../src/app');
const setupTestDB = require('../src/tests/setupTestDB');

let token;
let patientId;

beforeAll(async () => {
  await setupTestDB.connect();
  // register and login user
  await request(app).post('/api/v1/auth/register').send({
    email: 'user1@example.com',
    password: 'password1',
    firstName: 'User',
    lastName: 'One'
  });
  const res = await request(app).post('/api/v1/auth/login').send({
    email: 'user1@example.com',
    password: 'password1'
  });
  token = res.body.token;
});

afterAll(async () => {
  await setupTestDB.closeDatabase();
});

describe('Patient CRUD', () => {
  it('creates a patient', async () => {
    const res = await request(app).post('/api/v1/patients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        patient_id: 'P-001',
        firstName: 'John',
        lastName: 'Doe',
        dob: '1980-01-01',
        gender: 'male'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.patient.patient_id).toBe('P-001');
    patientId = res.body.patient._id || res.body.patient.id;
  });

  it('lists patients', async () => {
    const res = await request(app).get('/api/v1/patients')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.docs.length).toBeGreaterThanOrEqual(1);
  });
});
