const assert = require('assert');
const provinceChecker = require('../js/province-checker');

const data = {
  danhSach63TinhKhongDau: ['ha noi', 'tp ho chi minh'],
  tenTinhCoDau: ['Hà Nội', 'TP. Hồ Chí Minh'],
  danhSachDiBay: ['ha noi'],
  mienNam: ['ha noi'],
  mekong: [],
  mienDong: []
};

function testProvinceCheckerSanitizesHtmlInput() {
  const result = provinceChecker.check('<script>alert(1)</script>Hà Nội', data);

  assert.ok(result, 'phải trả kết quả');
  assert.ok(!result.input.includes('<'));
  assert.ok(!result.input.includes('>'));
  assert.ok(!result.input.includes('"'));
  assert.ok(!result.input.includes("'"));
}

function testProvinceCheckerMatchesWithoutAccents() {
  const result = provinceChecker.check('thanh pho ho chi minh', data);

  assert.ok(result.html.includes('TP. Hồ Chí Minh'));
  assert.ok(result.html.includes('Hàng Bộ'));
}

testProvinceCheckerSanitizesHtmlInput();
testProvinceCheckerMatchesWithoutAccents();

console.log('province-checker.test.js: 2 tests passed');
