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
      idNumber: '123456789',
      address: 'רחוב הבדיקה 1, ירושלים',
      phone: '050-1234567',
      cardName: 'משתמש בדיקה',
    },
  };
  const res = createResponse();

  registerController(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.payload.success, true);
  assert.equal(res.payload.token, 'demo-jwt-token');
  assert.equal(res.payload.user.idNumber, '123456789');
  assert.equal(res.payload.user.address, 'רחוב הבדיקה 1, ירושלים');
  assert.equal(res.payload.user.phone, '050-1234567');
  assert.equal(res.payload.user.cardName, 'משתמש בדיקה');
});

test('loginController returns a demo token', () => {
  const req = {
    body: {
      cardNumber: '4291-8830-1122-4457',
    },
  };
  const res = createResponse();

  loginController(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.success, true);
  assert.equal(res.payload.token, 'demo-jwt-token');
});

test('loginController identifies the administrator by card number', () => {
  const req = {
    body: {
      cardNumber: '4291 0000 0000 0001',
    },
  };
  const res = createResponse();

  loginController(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.user.role, 'admin');
});
