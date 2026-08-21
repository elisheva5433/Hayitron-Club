import test from 'node:test';
import assert from 'node:assert/strict';
import { getCardBenefits, getCards } from '../src/backend/services/cardService.js';

test('card catalog includes the available membership tracks', () => {
  const cardIds = getCards().map((card) => card.id);

  assert.deepEqual(cardIds, ['basic', 'beit-naaman-men', 'beit-naaman-women', 'ben-bait']);
});

test('card benefits are returned from the card-benefit mapping', () => {
  const { card, benefits } = getCardBenefits('beit-naaman-men');

  assert.equal(card.title, 'בית נאמן לגברים');
  assert.ok(benefits.length > 0);
  assert.ok(benefits.every((benefit) => benefit.id && benefit.name));
});