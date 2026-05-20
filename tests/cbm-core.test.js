const assert = require('assert');
const cbmCore = require('../js/cbm-core');

function closeTo(actual, expected, label) {
  assert.ok(Math.abs(actual - expected) < 0.0000001, `${label}: expected ${expected}, got ${actual}`);
}

function testGroupCalculationsMatchAndroid() {
  const group = cbmCore.calculateGroup({ dai: 40, rong: 30, cao: 20, soKien: 1 }, 1, 'a');

  assert.ok(group, 'group hợp lệ phải tính được');
  closeTo(group.cbm, ((40 * 30 * 20 * 1) / 3000) / 333, 'cbm');
  closeTo(group.kgDuongBo, 6, 'kg đường bộ');
  closeTo(group.kgVinEco, 6, 'kg Vin-Eco');
  closeTo(group.kgCpn, 4, 'kg CPN');
  closeTo(group.kgHoaToc, 4, 'kg hỏa tốc');
  assert.strictEqual(group.soKien, 1);
}

function testTotalsMatchAndroid() {
  const groups = [
    cbmCore.calculateGroup({ dai: 40, rong: 30, cao: 20, soKien: 1 }, 1, 'a'),
    cbmCore.calculateGroup({ dai: 50, rong: 40, cao: 30, soKien: 2 }, 2, 'b')
  ];
  const totals = cbmCore.calculateTotals(groups);

  closeTo(totals.cbm, cbmCore.calculateCbm(40, 30, 20, 1) + cbmCore.calculateCbm(50, 40, 30, 2), 'total cbm');
  closeTo(totals.kgDuongBo, 36, 'total đường bộ');
  closeTo(totals.kgVinEco, 36, 'total Vin-Eco');
  closeTo(totals.kgCpn, 24, 'total CPN');
  closeTo(totals.kgHoaToc, 24, 'total hỏa tốc');
  closeTo(totals.totalPieces, 3, 'total kiện');
}

function testRejectsInvalidGroups() {
  assert.strictEqual(cbmCore.calculateGroup({ dai: 0, rong: 30, cao: 20, soKien: 1 }), null);
  assert.strictEqual(cbmCore.calculateGroup({ dai: 40, rong: -1, cao: 20, soKien: 1 }), null);
  assert.strictEqual(cbmCore.calculateGroup({ dai: 40, rong: 30, cao: Infinity, soKien: 1 }), null);
  assert.strictEqual(cbmCore.calculateGroup({ dai: 40, rong: 30, cao: 20, soKien: 'abc' }), null);
}

function testCommaInput() {
  const group = cbmCore.calculateGroup({ dai: '40,5', rong: '30', cao: '20', soKien: '2' });
  assert.ok(group);
  closeTo(group.dai, 40.5, 'comma input');
}

testGroupCalculationsMatchAndroid();
testTotalsMatchAndroid();
testRejectsInvalidGroups();
testCommaInput();

console.log('cbm-core.test.js: 4 tests passed');
