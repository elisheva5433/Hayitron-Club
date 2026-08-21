import express from 'express';
import { cardBenefitsController, listCardsController } from '../controllers/cardController.js';

const router = express.Router();

router.get('/', listCardsController);
router.get('/:cardId/benefits', cardBenefitsController);

export default router;