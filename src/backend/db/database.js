import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function initializeDatabase(dbPath = path.join(__dirname, '..', '..', '..', 'data', 'hayitron.db')) {
  const resolvedPath = path.resolve(dbPath);
  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });

  const db = new DatabaseSync(resolvedPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      cardNumber TEXT,
      balance REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const existing = db.prepare('SELECT COUNT(*) AS count FROM users').get();
  if (existing.count === 0) {
    db.prepare(`
      INSERT INTO users (name, email, password, cardNumber, balance, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('נועה שגיא', 'noa@example.com', '123456', '4291 8830 1122 4457', 342, 'active');
  }

  return db;
}

const database = initializeDatabase();

export function getDatabase() {
  return database;
}

export function closeDatabase() {
  database.close();
}
