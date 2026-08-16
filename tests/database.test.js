import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { initializeDatabase } from '../src/backend/db/database.js';
import { BENEFITS_BUSINESSES } from '../src/data/benefitsData.js';

test('initializeDatabase creates the users table', () => {
  const dbPath = path.join(os.tmpdir(), `hayitron-test-${Date.now()}.db`);
  const db = initializeDatabase(dbPath);

  const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
  assert.ok(row, 'expected users table to exist');

  db.close();
});

test('business branches do not contain placeholder values', () => {
  const invalidBranches = BENEFITS_BUSINESSES.flatMap((business) => {
    const branches = Array.isArray(business.branches) ? business.branches : [];
    return branches.filter((branch) => {
      const city = String(branch?.city ?? '').trim();
      const address = String(branch?.address ?? '').trim();
      return city === 'לא זמין' || address === 'לא זמין';
    });
  });

  assert.deepEqual(invalidBranches, [], 'found businesses with placeholder branches');
});
