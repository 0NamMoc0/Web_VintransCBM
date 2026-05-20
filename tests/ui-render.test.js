const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadUi() {
  const context = {
    window: {
      VinTransCBMFishCore: {
        calculateFishPrice(pieces) {
          if (!Number.isFinite(pieces) || pieces <= 0) return null;
          return {
            pieces,
            kg: pieces * 10,
            basePrice: Math.round(pieces * 10 * 31000),
            totalPrice: Math.round(Math.round(pieces * 10 * 31000) * 1.3878)
          };
        }
      }
    }
  };

  const source = fs.readFileSync(path.resolve(__dirname, '../js/ui.js'), 'utf8');
  vm.runInNewContext(source, context);
  return context.window.VinTransCBMUi;
}

function testEmptyMessagesKeepStyledWrappers() {
  const ui = loadUi();

  assert.ok(ui.shippingEmptyMessage().includes('class="result-message"'));
  assert.ok(ui.fishEmptyMessage().includes('class="bbc-result-empty"'));
}

function testInvalidFishInputShowsUiMessage() {
  const ui = loadUi();

  assert.ok(ui.renderFishResult(Number.NaN).includes('Số kiện không hợp lệ'));
  assert.ok(ui.renderFishResult(0).includes('Số kiện không hợp lệ'));
}

function testScriptClearsStaleRenderedStates() {
  const script = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8');
  const staleShippingGuards = script.match(/shippingResultDiv\.innerHTML = ui\.shippingEmptyMessage\(\);/g) || [];

  assert.ok(staleShippingGuards.length >= 4, 'invalid shipping states must clear stale price results');
  assert.ok(script.includes('fishResultDiv.innerHTML = ui.renderFishResult(pieces);'));
  assert.ok(script.includes('fishResultDiv.innerHTML = ui.fishEmptyMessage();'));
}

testEmptyMessagesKeepStyledWrappers();
testInvalidFishInputShowsUiMessage();
testScriptClearsStaleRenderedStates();

console.log('ui-render.test.js: 3 tests passed');
