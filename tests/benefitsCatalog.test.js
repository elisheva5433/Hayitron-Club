import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePartnerKey } from '../src/utils/benefitsCatalog.js';
import { BENEFITS_BUSINESSES } from '../src/data/benefitsData.js';

test('normalizePartnerKey collapses same-brand branch variants into one canonical key', () => {
  assert.equal(normalizePartnerKey('אקסוס - בני ברק'), 'אקסוס');
  assert.equal(normalizePartnerKey('אקסוס בני ברק'), 'אקסוס');
  assert.equal(normalizePartnerKey('אקסוס יחזקאל'), 'אקסוס');
  assert.equal(normalizePartnerKey('אקסוס רב שפע'), 'אקסוס');
  assert.equal(normalizePartnerKey('בזאר שטראוס - ביתר'), 'בזאר שטראוס');
  assert.equal(normalizePartnerKey('בזאר שטראוס קניון רמות ביגוד'), 'בזאר שטראוס');
});

test('restaurant category is normalized and the six food businesses remain in the מזון bucket', () => {
  const foodNames = BENEFITS_BUSINESSES.filter((biz) => biz.cat === 'מזון').map((biz) => biz.name).sort();
  const expectedNames = [
    'מעיין אלפיים',
    'מחסני קרעסטיר',
    'משביר לעמו',
    'נטו חיסכון',
    'שפע ברכת השם',
    'צרכניית אחיעזר',
  ].sort();

  assert.deepEqual(foodNames, expectedNames);
  assert.equal(BENEFITS_BUSINESSES.some((biz) => biz.cat === 'מסעדנות'), false);
  assert.ok(BENEFITS_BUSINESSES.some((biz) => biz.cat === 'אוכל ומסעדנות'));
});
