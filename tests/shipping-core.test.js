const assert = require('assert');
const shippingCore = require('../js/shipping-core');

function find(results, serviceName) {
  return results.find((result) => result.name === serviceName);
}

function testVinTruckBasePrice() {
  const results = shippingCore.calculateShipping(0, false, 10);
  const truck = find(results, 'VIN-TRUCK (Đường Bộ)');

  assert.ok(truck, 'VIN-TRUCK phải có trong kết quả');
  assert.strictEqual(truck.basePrice, 50000);
  assert.strictEqual(truck.fuelAndVatFee, 19390);
  assert.strictEqual(truck.outerDistrictFee, 0);
  assert.strictEqual(truck.totalPrice, 69390);
}

function testVinEcoMinimum30kg() {
  const lowWeight = shippingCore.calculateShipping(0, false, 29.9);
  const disabledEco = find(lowWeight, 'VIN-ECO (Tiết Kiệm)');
  assert.strictEqual(disabledEco.isDisabled, true);
  assert.strictEqual(disabledEco.reason, 'Yêu cầu tối thiểu 30kg');

  const validWeight = shippingCore.calculateShipping(0, false, 30);
  const enabledEco = find(validWeight, 'VIN-ECO (Tiết Kiệm)');
  assert.strictEqual(enabledEco.isDisabled, false);
  assert.strictEqual(enabledEco.basePrice, 130000);
}

function testOuterDistrictSurcharge() {
  const inner = find(shippingCore.calculateShipping(0, false, 50), 'VIN-TRUCK (Đường Bộ)');
  const outer = find(shippingCore.calculateShipping(0, true, 50), 'VIN-TRUCK (Đường Bộ)');

  assert.strictEqual(shippingCore.calculateOuterCoefficient(true, 50), 1.3);
  assert.strictEqual(inner.outerDistrictFee, 0);
  assert.ok(outer.outerDistrictFee > 0);
  assert.ok(outer.totalPrice > inner.totalPrice);
}

function testTruckWeightBoundariesMatchAndroid() {
  const cases = [
    [1, 50000, 69390],
    [10, 50000, 69390],
    [10.1, 50290, 69792],
    [30, 108000, 149882],
    [50, 166000, 230375],
    [50.1, 158270, 219647],
    [100, 293000, 406625],
    [100.1, 293270, 407000],
    [300, 746000, 1035299],
    [500, 1128000, 1565438],
    [1000, 1733000, 2405057],
    [2000, 2438000, 3383456]
  ];

  cases.forEach(([weight, expectedBase, expectedTotal]) => {
    const truck = find(shippingCore.calculateShipping(0, false, weight), 'VIN-TRUCK (Đường Bộ)');
    assert.strictEqual(truck.basePrice, expectedBase, `truck base ${weight}kg`);
    assert.strictEqual(truck.totalPrice, expectedTotal, `truck total ${weight}kg`);
  });
}

function testExpressAndHoaTocBoundariesMatchAndroid() {
  const oneKg = shippingCore.calculateShipping(0, false, 1);
  assert.strictEqual(find(oneKg, 'VIN-EXPRESS (CPN)').basePrice, 24700);
  assert.strictEqual(find(oneKg, 'VIN-EXPRESS (CPN)').totalPrice, 34279);
  assert.strictEqual(find(oneKg, 'VIN-HOATOC (Hỏa Tốc)').basePrice, 50000);

  const twoKg = shippingCore.calculateShipping(0, false, 2);
  assert.strictEqual(find(twoKg, 'VIN-EXPRESS (CPN)').basePrice, 29000);
  assert.strictEqual(find(twoKg, 'VIN-EXPRESS (CPN)').totalPrice, 40246);
  assert.strictEqual(find(twoKg, 'VIN-HOATOC (Hỏa Tốc)').basePrice, 50000);

  const twoPointFiveKg = shippingCore.calculateShipping(0, false, 2.5);
  assert.strictEqual(find(twoPointFiveKg, 'VIN-EXPRESS (CPN)').basePrice, 31500);
  assert.strictEqual(find(twoPointFiveKg, 'VIN-HOATOC (Hỏa Tốc)').basePrice, 54000);
}

function testOuterCoefficientBoundaries() {
  assert.strictEqual(shippingCore.calculateOuterCoefficient(true, 100), 1.3);
  assert.strictEqual(shippingCore.calculateOuterCoefficient(true, 100.1), 1.2);
  assert.strictEqual(shippingCore.calculateOuterCoefficient(true, 200), 1.2);
  assert.strictEqual(shippingCore.calculateOuterCoefficient(true, 200.1), 1.1);
}

function testRejectsInvalidWeight() {
  [0, -1, NaN, Infinity].forEach((weight) => {
    assert.deepStrictEqual(shippingCore.calculateShipping(0, false, weight), [], `invalid weight ${weight}`);
  });
  assert.ok(shippingCore.calculateShipping(0, false, 100001).length > 0, 'large weight should match Android behavior');
}

function testRejectsInvalidZone() {
  assert.deepStrictEqual(shippingCore.calculateShipping(-1, false, 10), []);
  assert.deepStrictEqual(shippingCore.calculateShipping(9, false, 10), []);
  assert.deepStrictEqual(shippingCore.calculateShipping(NaN, false, 10), []);
}

function testActiveServicesHaveDeliveryTime() {
  const activeServices = shippingCore.calculateShipping(0, false, 30).filter((result) => !result.isDisabled);
  activeServices.forEach((result) => {
    assert.ok(result.deliveryTime && result.deliveryTime !== 'N/A', `${result.name} thiếu thời gian giao`);
  });
}

testVinTruckBasePrice();
testVinEcoMinimum30kg();
testOuterDistrictSurcharge();
testTruckWeightBoundariesMatchAndroid();
testExpressAndHoaTocBoundariesMatchAndroid();
testOuterCoefficientBoundaries();
testRejectsInvalidWeight();
testRejectsInvalidZone();
testActiveServicesHaveDeliveryTime();

console.log('shipping-core.test.js: 9 tests passed');
