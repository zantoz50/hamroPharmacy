'use strict';

const request = require('supertest');
const app = require('../src/app');
const setupTestDB = require('../src/tests/setupTestDB');

beforeAll(async () => {
  await setupTestDB.connect();
});

afterAll(async () => {
  await setupTestDB.closeDatabase();
});

describe('Auth', () => {
  it('registers user', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'test@example.com',
      password: 'pass123',
      firstName: 'A',
      lastName: 'B'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('logs in', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'test@example.com',
      password: 'pass123'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
