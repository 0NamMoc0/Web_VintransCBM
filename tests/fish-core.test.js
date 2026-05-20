const assert = require('assert');
const fishCore = require('../js/fish-core');

function testFishPricingRoundsMoney() {
  const result = fishCore.calculateFishPrice(1);

  assert.strictEqual(result.pieces, 1);
  assert.strictEqual(result.kg, 16.4);
  assert.strictEqual(result.basePrice, 508400);
  assert.strictEqual(result.totalPrice, 705558);
}

function testFishPricingRejectsInvalidPieces() {
  [0, -1, NaN, Infinity, 'abc'].forEach((pieces) => {
    assert.strictEqual(fishCore.calculateFishPrice(pieces), null, `invalid pieces ${pieces}`);
  });
}

testFishPricingRoundsMoney();
testFishPricingRejectsInvalidPieces();

console.log('fish-core.test.js: 2 tests passed');
