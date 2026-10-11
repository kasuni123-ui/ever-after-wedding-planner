import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'test-secret-that-is-not-used-outside-this-isolated-suite';
process.env.SESSION_NAME = 'ever-after.test.sid';
const require = createRequire(import.meta.url);
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');

let mongo, app, agent;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  app = require('../app');
});
afterAll(async () => { await mongoose.disconnect(); await mongo.stop(); });
beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
  agent = request.agent(app);
});

describe('Ever After API security and core flows', () => {
  it('reports health without revealing configuration', async () => {
    const response = await agent.get('/api/health').expect(200);
    expect(response.body).toEqual({ status: 'ok', service: 'ever-after-api' });
    expect(JSON.stringify(response.body)).not.toContain('mongodb');
  });

  it('requires a CSRF token for state-changing requests', async () => {
    await agent.post('/api/enquiries').send({ name: 'Alex Couple', email: 'alex@example.com', message: 'We are planning a wedding.' }).expect(403);
  });

  it('creates a couple account and prevents access to admin functions', async () => {
    const token = (await agent.get('/api/auth/csrf').expect(200)).body.csrfToken;
    const created = await agent.post('/api/auth/register').set('X-CSRF-Token', token).send({ name: 'Alex Couple', email: 'ALEX@example.com', password: 'a-long-and-unique-passphrase' }).expect(201);
    expect(created.body.user.role).toBe('couple');
    expect(created.body.user.email).toBe('alex@example.com');
    await agent.get('/api/admin/bookings').expect(403);
  });

  it('accepts a valid public enquiry and returns a friendly acknowledgement', async () => {
    const token = (await agent.get('/api/auth/csrf').expect(200)).body.csrfToken;
    const response = await agent.post('/api/enquiries').set('X-CSRF-Token', token).send({ name: 'Morgan Lee', email: 'morgan@example.com', message: 'We would love to hear about your planning collections.' }).expect(201);
    expect(response.body.message).toMatch(/Thank you/);
  });
});
