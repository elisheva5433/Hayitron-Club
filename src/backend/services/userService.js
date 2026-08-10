import fs from 'node:fs';
import path from 'node:path';
import { getDatabase } from '../db/database.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

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
    role: row.role || 'user',
  };
}

function sanitizeUser(row) {
  const user = mapUser(row);
  return user ? { ...user, password: undefined } : null;
}

export function getAllUsers() {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM users ORDER BY id').all();
  return rows.map((row) => sanitizeUser(row));
}

export function createAuditLog({ actorEmail, action, entityType, entityId = '', details = {} }) {
  const db = getDatabase();
  const detailsJson = JSON.stringify(details || {});
  const result = db.prepare(`
    INSERT INTO audit_logs (actorEmail, action, entityType, entityId, details)
    VALUES (?, ?, ?, ?, ?)
  `).run(actorEmail, action, entityType, String(entityId || ''), detailsJson);
  return db.prepare('SELECT * FROM audit_logs WHERE id = ?').get(result.lastInsertRowid);
}

export function getAuditLogs(limit = 100) {
  const db = getDatabase();
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 300);
  const rows = db.prepare('SELECT * FROM audit_logs ORDER BY createdAt DESC, id DESC LIMIT ?').all(safeLimit);
  return rows.map((row) => ({
    ...row,
    details: (() => {
      try {
        return row.details ? JSON.parse(row.details) : {};
      } catch {
        return {};
      }
    })(),
  }));
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

export function updateUserStatus(userId, status) {
  const db = getDatabase();
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, userId);
  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  return sanitizeUser(updated);
}

export function creditUser(userId, amount) {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

  if (!row) {
    const error = new Error('משתמש לא נמצא');
    error.statusCode = 404;
    throw error;
  }

  const nextBalance = Number(row.balance) + Number(amount || 0);
  db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(nextBalance, userId);
  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  return sanitizeUser(updated);
}

export function getAdminSummary() {
  const db = getDatabase();
  const userStats = db.prepare(`
    SELECT
      COUNT(*) AS totalUsers,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS activeUsers,
      SUM(balance) AS totalBalance
    FROM users
  `).get();
  const voteRows = db.prepare('SELECT optionId, count FROM votes ORDER BY count DESC').all();
  const banners = db.prepare('SELECT * FROM banners ORDER BY id DESC').all();
  const votingSetting = db.prepare('SELECT value FROM admin_settings WHERE key = ?').get('votingOpen');
  const broadcasts = db.prepare('SELECT * FROM broadcast_messages ORDER BY createdAt DESC LIMIT 5').all();
  const transactionVolume = db.prepare('SELECT COALESCE(SUM(amount), 0) AS total FROM transactions').get();
  const transactionsByCategory = db.prepare('SELECT category AS label, SUM(amount) AS total FROM transactions GROUP BY category ORDER BY total DESC').all();
  const transactionsByRegion = db.prepare('SELECT region AS label, SUM(amount) AS total FROM transactions GROUP BY region ORDER BY total DESC').all();
  const topBusinesses = db.prepare('SELECT businessName AS label, SUM(amount) AS total FROM transactions GROUP BY businessName ORDER BY total DESC LIMIT 5').all();
  const moderatedPosts = db.prepare('SELECT * FROM community_posts ORDER BY createdAt DESC LIMIT 20').all();
  const purchaseGroups = db.prepare('SELECT * FROM purchase_groups ORDER BY createdAt DESC').all();
  const surveys = db.prepare(`
    SELECT s.id, s.title, s.status, a.label, a.count
    FROM surveys s
    LEFT JOIN survey_answers a ON a.surveyId = s.id
    ORDER BY s.id DESC, a.count DESC
  `).all();

  const groupedSurveys = Object.values(surveys.reduce((acc, row) => {
    if (!acc[row.id]) {
      acc[row.id] = { id: row.id, title: row.title, status: row.status, answers: [] };
    }
    if (row.label) {
      acc[row.id].answers.push({ label: row.label, count: row.count });
    }
    return acc;
  }, {}));

  return {
    kpis: {
      totalUsers: Number(userStats.totalUsers || 0),
      activeUsers: Number(userStats.activeUsers || 0),
      issuedCards: Number(userStats.totalUsers || 0),
      activeCards: Number(userStats.activeUsers || 0),
      totalVolume: Number(transactionVolume.total || 0),
      totalBalance: Number(userStats.totalBalance || 0),
    },
    votes: voteRows,
    votingOpen: votingSetting?.value === '1',
    banners,
    broadcasts,
    charts: {
      categories: transactionsByCategory,
      regions: transactionsByRegion,
      businesses: topBusinesses,
    },
    posts: moderatedPosts,
    purchaseGroups,
    surveys: groupedSurveys,
  };
}

export function setVotingWindow(isOpen) {
  const db = getDatabase();
  db.prepare('INSERT INTO admin_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .run('votingOpen', isOpen ? '1' : '0');
  return { votingOpen: isOpen };
}

export function getBanners() {
  const db = getDatabase();
  return db.prepare('SELECT * FROM banners ORDER BY id DESC').all();
}

export function createBanner({ title, placement, imagePath = '', imageBase64 = '' }) {
  const db = getDatabase();
  let resolvedImagePath = imagePath;

  if (imageBase64) {
    const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
    fs.mkdirSync(uploadsDir, { recursive: true });
    const matches = imageBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (matches) {
      const mimeType = matches[1];
      const base64Data = matches[2];
      const extension = mimeType.split('/')[1].replace('jpeg', 'jpg');
      const fileName = `banner-${Date.now()}.${extension}`;
      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
      resolvedImagePath = `/uploads/${fileName}`;
    }
  }

  const result = db.prepare('INSERT INTO banners (title, placement, imagePath, status) VALUES (?, ?, ?, ?)').run(title, placement, resolvedImagePath, 'draft');
  return db.prepare('SELECT * FROM banners WHERE id = ?').get(result.lastInsertRowid);
}

export function updateBannerStatus(bannerId, status) {
  const db = getDatabase();
  db.prepare('UPDATE banners SET status = ? WHERE id = ?').run(status, bannerId);
  return db.prepare('SELECT * FROM banners WHERE id = ?').get(bannerId);
}

export function createBroadcast({ subject, body }) {
  const db = getDatabase();
  const recipients = db.prepare('SELECT COUNT(*) AS count FROM users WHERE status = ?').get('active');
  const result = db.prepare('INSERT INTO broadcast_messages (subject, body, recipients) VALUES (?, ?, ?)')
    .run(subject, body, Number(recipients.count || 0));
  return db.prepare('SELECT * FROM broadcast_messages WHERE id = ?').get(result.lastInsertRowid);
}

export function getBroadcastRecipients() {
  const db = getDatabase();
  return db.prepare('SELECT email FROM users WHERE status = ?').all('active').map((row) => row.email);
}

export function sanitizeBroadcastRecipients(recipients) {
  const seen = new Set();
  const accepted = [];
  const invalid = [];

  for (const value of recipients || []) {
    const email = String(value || '').trim().toLowerCase();
    if (!email) {
      continue;
    }
    if (!EMAIL_REGEX.test(email)) {
      invalid.push(email);
      continue;
    }
    if (seen.has(email)) {
      continue;
    }
    seen.add(email);
    accepted.push(email);
  }

  return { accepted, invalid };
}

export function getPurchaseGroups() {
  const db = getDatabase();
  return db.prepare('SELECT * FROM purchase_groups ORDER BY createdAt DESC').all();
}

export function createPurchaseGroup({ title, category, region, supplier = '', closesAt = '', inventory = 0, targetPrice }) {
  const db = getDatabase();
  const result = db.prepare(`
    INSERT INTO purchase_groups (title, category, region, supplier, closesAt, inventory, targetPrice, participants, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'planning')
  `).run(title, category, region, supplier, closesAt, inventory, Number(targetPrice || 0));
  return db.prepare('SELECT * FROM purchase_groups WHERE id = ?').get(result.lastInsertRowid);
}

export function updatePurchaseGroup(groupId, payload) {
  const db = getDatabase();
  const current = db.prepare('SELECT * FROM purchase_groups WHERE id = ?').get(groupId);
  if (!current) {
    const error = new Error('קבוצת רכישה לא נמצאה');
    error.statusCode = 404;
    throw error;
  }

  const next = {
    title: payload.title ?? current.title,
    category: payload.category ?? current.category,
    region: payload.region ?? current.region,
    supplier: payload.supplier ?? current.supplier,
    closesAt: payload.closesAt ?? current.closesAt,
    inventory: payload.inventory ?? current.inventory,
    targetPrice: payload.targetPrice ?? current.targetPrice,
    participants: payload.participants ?? current.participants,
    status: payload.status ?? current.status,
  };

  db.prepare(`
    UPDATE purchase_groups
    SET title = ?, category = ?, region = ?, supplier = ?, closesAt = ?, inventory = ?, targetPrice = ?, participants = ?, status = ?
    WHERE id = ?
  `).run(next.title, next.category, next.region, next.supplier, next.closesAt, Number(next.inventory), Number(next.targetPrice), Number(next.participants), next.status, groupId);

  return db.prepare('SELECT * FROM purchase_groups WHERE id = ?').get(groupId);
}

export function getCommunityPosts() {
  const db = getDatabase();
  return db.prepare('SELECT * FROM community_posts WHERE status != ? ORDER BY createdAt DESC').all('hidden');
}

export function createCommunityPost({ author, text }) {
  const db = getDatabase();
  const result = db.prepare('INSERT INTO community_posts (author, text, status) VALUES (?, ?, ?)').run(author, text, 'visible');
  return db.prepare('SELECT * FROM community_posts WHERE id = ?').get(result.lastInsertRowid);
}

export function updateCommunityPostStatus(postId, status) {
  const db = getDatabase();
  db.prepare('UPDATE community_posts SET status = ? WHERE id = ?').run(status, postId);
  return db.prepare('SELECT * FROM community_posts WHERE id = ?').get(postId);
}
