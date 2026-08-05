import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { initializeDatabase } from '../src/backend/db/database.js';

test('initializeDatabase creates the users table', () => {
  const dbPath = path.join(os.tmpdir(), `hayitron-test-${Date.now()}.db`);
  const db = initializeDatabase(dbPath);

  const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
  assert.ok(row, 'expected users table to exist');

  db.close();
});
