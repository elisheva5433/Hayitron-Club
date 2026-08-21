import { getCardBenefits, getCards } from '../services/cardService.js';

export function listCardsController(req, res) {
  res.json({ cards: getCards() });
}

export function cardBenefitsController(req, res) {
  try {
    res.json(getCardBenefits(req.params.cardId));
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'שגיאה בטעינת ההטבות' });
  }
}