import { getDatabase } from '../db/database.js';

function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    cardNumber: row.cardNumber,
    balance: row.balance,
    status: row.status,
  };
}

export function getAllUsers() {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM users ORDER BY id').all();
  return rows.map((row) => ({ ...mapUser(row), password: undefined }));
}

export function findUserByEmail(email) {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  return mapUser(row);
}

export function registerUser({ name, email, password, cardNumber }) {
  const db = getDatabase();
  const existing = db.prepare('SELECT 1 FROM users WHERE email = ?').get(email);

  if (existing) {
    const error = new Error('משתמש כבר קיים');
    error.statusCode = 400;
    throw error;
  }

  const result = db.prepare(`
    INSERT INTO users (name, email, password, cardNumber, balance, status)
    VALUES (?, ?, ?, ?, 0, 'active')
  `).run(name, email, password, cardNumber || '0000 0000 0000 0000');

  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  return mapUser(row);
}

export function loginUser(email, password) {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password);

  if (!row) {
    const error = new Error('פרטי התחברות לא תקינים');
    error.statusCode = 401;
    throw error;
  }

  return mapUser(row);
}

export function topupUser(email, amount) {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!row) {
    const error = new Error('משתמש לא נמצא');
    error.statusCode = 404;
    throw error;
  }

  const nextBalance = Number(row.balance) + Number(amount || 0);
  db.prepare('UPDATE users SET balance = ? WHERE email = ?').run(nextBalance, email);

  const updated = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  return mapUser(updated);
}
