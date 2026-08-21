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

test('member_votes allows one monthly selection per member', () => {
  const dbPath = path.join(os.tmpdir(), `hayitron-votes-test-${Date.now()}.db`);
  const db = initializeDatabase(dbPath);

  db.prepare(`
    INSERT INTO users (name, email, password, cardNumber, balance, status, role)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('Vote Test', 'vote-test@example.com', 'test-password', '4291 0000 0000 0002', 0, 'active', 'user');

  db.prepare(`
    INSERT INTO member_votes (month, userEmail, optionId)
    VALUES (?, ?, ?)
    ON CONFLICT(month, userEmail) DO UPDATE SET optionId = excluded.optionId
  `).run('2026-08', 'vote-test@example.com', 'stroller');
  db.prepare(`
    INSERT INTO member_votes (month, userEmail, optionId)
    VALUES (?, ?, ?)
    ON CONFLICT(month, userEmail) DO UPDATE SET optionId = excluded.optionId
  `).run('2026-08', 'vote-test@example.com', 'freezer');

  const rows = db.prepare('SELECT optionId FROM member_votes WHERE month = ? AND userEmail = ?').all('2026-08', 'vote-test@example.com');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].optionId, 'freezer');

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
