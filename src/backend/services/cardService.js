import { getDatabase } from '../db/database.js';

function parseBenefit(row) {
  try {
    return JSON.parse(row.detailsJson);
  } catch {
    return {
      id: row.id,
      name: row.businessName,
      cat: row.category,
      region: row.region,
      perk: row.perk,
      benefitText: row.benefitText,
      logo: row.logo,
    };
  }
}

export function getCards() {
  const db = getDatabase();
  return db.prepare('SELECT * FROM cards ORDER BY CASE id WHEN ? THEN 1 WHEN ? THEN 2 WHEN ? THEN 3 ELSE 4 END')
    .all('basic', 'beit-naaman-men', 'beit-naaman-women');
}

export function getCardBenefits(cardId) {
  const db = getDatabase();
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(cardId);
  if (!card) {
    const error = new Error('הכרטיס לא נמצא');
    error.statusCode = 404;
    throw error;
  }

  const rows = db.prepare(`
    SELECT benefits.*
    FROM card_benefits
    JOIN benefits ON benefits.id = card_benefits.benefitId
    WHERE card_benefits.cardId = ?
    ORDER BY benefits.businessName
  `).all(cardId);

  return { card, benefits: rows.map(parseBenefit) };
}

export function validateCardId(cardId) {
  const db = getDatabase();
  return Boolean(db.prepare('SELECT 1 FROM cards WHERE id = ?').get(cardId));
}

export function assignUserCard(userId, cardId) {
  const db = getDatabase();
  db.prepare('INSERT OR IGNORE INTO user_cards (userId, cardId) VALUES (?, ?)').run(userId, cardId);
}