import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_EMAIL = 'admin@hayitron.co.il';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'HayitronAdm!2026';
const LEGACY_ADMIN_PASSWORDS = new Set(['admin1234']);

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
      role TEXT NOT NULL DEFAULT 'user',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT NOT NULL,
      optionId TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      UNIQUE(month, optionId)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      placement TEXT NOT NULL,
      imagePath TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS broadcast_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      recipients INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actorEmail TEXT NOT NULL,
      action TEXT NOT NULL,
      entityType TEXT NOT NULL,
      entityId TEXT,
      details TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userEmail TEXT NOT NULL,
      businessName TEXT NOT NULL,
      category TEXT NOT NULL,
      region TEXT NOT NULL,
      amount REAL NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS community_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author TEXT NOT NULL,
      text TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'visible',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS surveys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS survey_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      surveyId INTEGER NOT NULL,
      label TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (surveyId) REFERENCES surveys(id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS purchase_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      region TEXT NOT NULL,
      supplier TEXT,
      closesAt TEXT,
      inventory INTEGER NOT NULL DEFAULT 0,
      targetPrice REAL NOT NULL,
      participants INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'open',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // add role column to existing DBs that predate this column
  try { db.exec(`ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'`); } catch {}
  try { db.exec(`ALTER TABLE banners ADD COLUMN imagePath TEXT`); } catch {}
  try { db.exec(`ALTER TABLE purchase_groups ADD COLUMN supplier TEXT`); } catch {}
  try { db.exec(`ALTER TABLE purchase_groups ADD COLUMN closesAt TEXT`); } catch {}
  try { db.exec(`ALTER TABLE purchase_groups ADD COLUMN inventory INTEGER NOT NULL DEFAULT 0`); } catch {}

  // ensure admin user exists with correct role
  const adminUser = db.prepare('SELECT id, password FROM users WHERE email = ?').get(ADMIN_EMAIL);
  const adminExists = Boolean(adminUser);
  if (!adminExists) {
    db.prepare(`INSERT INTO users (name, email, password, cardNumber, balance, status, role) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run('מנהל מערכת', ADMIN_EMAIL, ADMIN_PASSWORD, '', 0, 'active', 'admin');
  } else {
    db.prepare(`UPDATE users SET role = 'admin' WHERE email = ?`).run(ADMIN_EMAIL);
    if (LEGACY_ADMIN_PASSWORDS.has(String(adminUser.password || ''))) {
      db.prepare('UPDATE users SET password = ? WHERE email = ?').run(ADMIN_PASSWORD, ADMIN_EMAIL);
    }
  }

  const existing = db.prepare('SELECT COUNT(*) AS count FROM users').get();
  if (existing.count === 0) {
    db.prepare(`
      INSERT INTO users (name, email, password, cardNumber, balance, status, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('נועה שגיא', 'noa@example.com', '123456', '4291 8830 1122 4457', 342, 'active', 'user');

    // seed admin user
    db.prepare(`
      INSERT INTO users (name, email, password, cardNumber, balance, status, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('מנהל מערכת', ADMIN_EMAIL, ADMIN_PASSWORD, '', 0, 'active', 'admin');
  }

  const votingWindow = db.prepare('SELECT 1 FROM admin_settings WHERE key = ?').get('votingOpen');
  if (!votingWindow) {
    db.prepare('INSERT INTO admin_settings (key, value) VALUES (?, ?)').run('votingOpen', '1');
  }

  const bannerCount = db.prepare('SELECT COUNT(*) AS count FROM banners').get();
  if (bannerCount.count === 0) {
    db.prepare('INSERT INTO banners (title, placement, imagePath, status) VALUES (?, ?, ?, ?)').run('באנר חזרה לבית הספר', 'עמוד הבית', '', 'active');
    db.prepare('INSERT INTO banners (title, placement, imagePath, status) VALUES (?, ?, ?, ?)').run('קמפיין עסקים חדשים', 'עמוד הטבות', '', 'draft');
  }

  const txCount = db.prepare('SELECT COUNT(*) AS count FROM transactions').get();
  if (txCount.count === 0) {
    const seedTransactions = [
      ['noa@example.com', 'פיצה פון', 'מסעדנות', 'גוש דן', 186],
      ['noa@example.com', 'מיני ישראל', 'פנאי ותיירות', 'ירושלים והסביבה', 95],
      ['h346566@gmail.com', 'חנות מצעים וכלי בית - חלום שלי', 'בית וגינה', 'גוש דן', 420],
      ['yb343@gmail.com', 'רפטינג נהר הירדן', 'פנאי ותיירות', 'חיפה והצפון', 330],
      ['p0554014248@gmail.com', 'קונדיטוריית קצבורג', 'מסעדנות', 'ירושלים והסביבה', 270],
      ['admin@hayitron.co.il', 'ג׳אסט מיט', 'מסעדנות', 'גוש דן', 155],
    ];
    const insertTransaction = db.prepare('INSERT INTO transactions (userEmail, businessName, category, region, amount) VALUES (?, ?, ?, ?, ?)');
    for (const transaction of seedTransactions) {
      insertTransaction.run(...transaction);
    }
  }

  const postCount = db.prepare('SELECT COUNT(*) AS count FROM community_posts').get();
  if (postCount.count === 0) {
    const insertPost = db.prepare('INSERT INTO community_posts (author, text, status) VALUES (?, ?, ?)');
    insertPost.run('מיכל א.', 'מישהו יכול להמליץ על מוצר לחודש הבא? הייתי שמחה לראות מכונת כביסה בקבוצת הרכישה הבאה.', 'visible');
    insertPost.run('אורי ב.', 'קניתי את המקרר מקבוצת הרכישה הקודמת — שירות מעולה וההנחה הייתה משמעותית. ממליץ בחום!', 'visible');
    insertPost.run('דנה כ.', 'האם אפשר להוסיף למועדון גם בתי עסק לטיפוח חיות מחמד? יש לי כמה המלצות טובות באזור השרון.', 'visible');
  }

  const surveyCount = db.prepare('SELECT COUNT(*) AS count FROM surveys').get();
  if (surveyCount.count === 0) {
    const surveyResult = db.prepare('INSERT INTO surveys (title, status) VALUES (?, ?)').run('שביעות רצון מחוויית המועדון', 'active');
    const surveyId = Number(surveyResult.lastInsertRowid);
    const insertAnswer = db.prepare('INSERT INTO survey_answers (surveyId, label, count) VALUES (?, ?, ?)');
    insertAnswer.run(surveyId, 'מרוצה מאוד', 61);
    insertAnswer.run(surveyId, 'מרוצה', 29);
    insertAnswer.run(surveyId, 'ניטרלי', 7);
    insertAnswer.run(surveyId, 'טעון שיפור', 3);
  }

  const groupCount = db.prepare('SELECT COUNT(*) AS count FROM purchase_groups').get();
  if (groupCount.count === 0) {
    const insertGroup = db.prepare('INSERT INTO purchase_groups (title, category, region, supplier, closesAt, inventory, targetPrice, participants, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    insertGroup.run('מכונת כביסה משפחתית', 'בית וגינה', 'גוש דן', 'Electro Sale', '2026-09-01', 60, 1890, 42, 'open');
    insertGroup.run('טוסטר אובן מקצועי', 'בית וגינה', 'ירושלים והסביבה', 'Kitchen Pro', '2026-08-20', 25, 690, 18, 'planning');
    insertGroup.run('חבילת ציוד חזרה לבית ספר', 'חינוך', 'כל הארץ', 'Edu Market', '2026-08-15', 120, 240, 86, 'closed');
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
