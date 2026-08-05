import test from 'node:test';
import assert from 'node:assert/strict';
import { loginController, registerController } from '../src/backend/controllers/authController.js';

function createResponse() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.payload = data;
      return this;
    },
  };
}

test('registerController returns a demo token', () => {
  const email = `test-user-${Date.now()}@example.com`;
  const req = {
    body: {
      name: 'Test User',
      email,
      password: '123456',
      cardNumber: '1111 2222 3333 4444',
    },
  };
  const res = createResponse();

  registerController(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.payload.success, true);
  assert.equal(res.payload.token, 'demo-jwt-token');
});

test('loginController returns a demo token', () => {
  const req = {
    body: {
      email: 'noa@example.com',
      password: '123456',
    },
  };
  const res = createResponse();

  loginController(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.success, true);
  assert.equal(res.payload.token, 'demo-jwt-token');
});
