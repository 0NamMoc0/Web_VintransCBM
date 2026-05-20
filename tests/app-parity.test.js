const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const shippingCore = require('../js/shipping-core');
const cbmCore = require('../js/cbm-core');
const fishCore = require('../js/fish-core');

const androidSourceDir = path.resolve(__dirname, '../../VinTransCBM/app/src/main/java/com/cbmvin/cbmapp');
const shippingManagerSource = fs.readFileSync(path.join(androidSourceDir, 'ShippingManager.java'), 'utf8');
const cbmCalculatorSource = fs.readFileSync(path.join(androidSourceDir, 'CbmCalculator.java'), 'utf8');
const fishCalculatorSource = fs.readFileSync(path.join(androidSourceDir, 'FishPricingCalculator.java'), 'utf8');

function loadProvinceData() {
  const context = { window: {} };
  const source = fs.readFileSync(path.resolve(__dirname, '../js/province-data.js'), 'utf8');
  vm.runInNewContext(source, context);
  return JSON.parse(JSON.stringify(context.window.VinTransCBMProvinceData));
}

function parseIntArray(raw) {
  return raw.split(',').map((item) => Number(item.trim()));
}

function parseStringArray(raw) {
  return [...raw.matchAll(/"([^"]*)"/g)].map((match) => match[1]);
}

function parseNumericPriceTable(tableName) {
  const regex = new RegExp(`${tableName}\\.put\\((Integer\\.MAX_VALUE|\\d+),\\s*new int\\[\\]\\{([^}]*)\\}\\);`, 'g');
  const table = {};
  let match;
  while ((match = regex.exec(shippingManagerSource))) {
    const key = match[1] === 'Integer.MAX_VALUE' ? 'max' : Number(match[1]);
    table[key] = parseIntArray(match[2]);
  }
  return table;
}

function parseStringPriceTable(tableName) {
  const regex = new RegExp(`${tableName}\\.put\\("([^"]+)",\\s*new int\\[\\]\\{([^}]*)\\}\\);`, 'g');
  const table = {};
  let match;
  while ((match = regex.exec(shippingManagerSource))) {
    table[match[1]] = parseIntArray(match[2]);
  }
  return table;
}

function parseDeliveryTimes() {
  const regex = /DELIVERY_TIMES\.put\("([^"]+)",\s*new String\[\]\{([^}]*)\}\);/g;
  const times = {};
  let match;
  while ((match = regex.exec(shippingManagerSource))) {
    times[match[1]] = parseStringArray(match[2]);
  }
  return times;
}

function parseAndroidProvinces() {
  const regex = /PROVINCE_DATA\.put\("([^"]+)",\s*new Province\((\d+),\s*"([^"]+)"\)\);/g;
  const provinces = {};
  let match;
  while ((match = regex.exec(shippingManagerSource))) {
    provinces[match[1]] = { vung: Number(match[2]), ten: match[3] };
  }
  return provinces;
}

function parseAndroidDistricts() {
  const regex = /list = new ArrayList<>\(\);([\s\S]*?)DISTRICT_DATA\.put\("([^"]+)", list\);/g;
  const districts = {};
  let match;
  while ((match = regex.exec(shippingManagerSource))) {
    districts[match[2]] = [...match[1].matchAll(/new District\("([^"]+)",\s*"([^"]+)"\)/g)]
      .map((districtMatch) => ({ ten: districtMatch[1], loai: districtMatch[2] }));
  }
  return districts;
}

function calculateBasePrice(table, weight, zone) {
  const price10kg = table[10][zone];
  if (weight <= 10) return price10kg;

  const extraWeight = weight - 10;
  let unitPrice;
  if (extraWeight <= 40) unitPrice = table[50][zone];
  else if (extraWeight <= 100) unitPrice = table[100][zone];
  else if (extraWeight <= 300) unitPrice = table[300][zone];
  else if (extraWeight <= 500) unitPrice = table[500][zone];
  else if (extraWeight <= 1000) unitPrice = table[1000][zone];
  else if (extraWeight <= 2000) unitPrice = table[2000][zone];
  else unitPrice = table.max[zone];

  return Math.round(price10kg + extraWeight * unitPrice);
}

function calculateStepPrice(table, weight, zone, baseKey) {
  const basePrice = table[baseKey][zone];
  if (weight <= 2) return basePrice;
  return basePrice + Math.ceil((weight - 2) / 0.5) * table.step[zone];
}

function calculateOuterCoefficient(isOuter, weight) {
  if (!isOuter) return 1.0;
  if (weight <= 100) return 1.3;
  if (weight <= 200) return 1.2;
  return 1.1;
}

function buildExpectedResult(name, basePrice, outerCoeff, deliveryTime) {
  const fuelVatPrice = Math.round(basePrice * 1.3878);
  const totalPrice = Math.round(fuelVatPrice * outerCoeff);
  return {
    name,
    basePrice,
    fuelAndVatFee: fuelVatPrice - basePrice,
    outerDistrictFee: totalPrice - fuelVatPrice,
    totalPrice,
    deliveryTime,
    isDisabled: false,
    reason: ''
  };
}

function expectedShipping(zone, isOuter, weight, tables) {
  if (!Number.isFinite(weight) || weight <= 0) return [];
  const outerCoeff = calculateOuterCoefficient(isOuter, weight);
  const results = [];

  results.push(buildExpectedResult(
    'VIN-TRUCK (Đường Bộ)',
    calculateBasePrice(tables.truck, weight, zone),
    outerCoeff,
    tables.deliveryTimes['VIN-TRUCK'][zone]
  ));

  if (weight >= 30) {
    results.push(buildExpectedResult(
      'VIN-ECO (Tiết Kiệm)',
      calculateBasePrice(tables.eco, weight, zone),
      outerCoeff,
      tables.deliveryTimes['VIN-ECO'][zone]
    ));
  } else {
    results.push({
      name: 'VIN-ECO (Tiết Kiệm)',
      basePrice: 0,
      fuelAndVatFee: 0,
      outerDistrictFee: 0,
      totalPrice: 0,
      deliveryTime: 'N/A',
      isDisabled: true,
      reason: 'Yêu cầu tối thiểu 30kg'
    });
  }

  const expressBase = weight <= 1
    ? tables.express['1'][zone]
    : calculateStepPrice(tables.express, weight, zone, '2');
  results.push(buildExpectedResult(
    'VIN-EXPRESS (CPN)',
    expressBase,
    outerCoeff,
    tables.deliveryTimes['VIN-EXPRESS'][zone]
  ));

  results.push(buildExpectedResult(
    'VIN-HOATOC (Hỏa Tốc)',
    calculateStepPrice(tables.hoatoc, weight, zone, '2'),
    outerCoeff,
    tables.deliveryTimes['VIN-HOATOC'][zone]
  ));

  return results;
}

function testCbmConstantsAndFormulasMatchAndroid() {
  const constants = Object.fromEntries([...cbmCalculatorSource.matchAll(/public static final double (DIVISOR_\w+) = ([0-9.]+);/g)]
    .map((match) => [match[1], Number(match[2])]));

  assert.strictEqual(cbmCore.DIVISOR_CBM, constants.DIVISOR_CBM);
  assert.strictEqual(cbmCore.DIVISOR_KG_CBM, constants.DIVISOR_KG_CBM);
  assert.strictEqual(cbmCore.DIVISOR_DUONG_BO, constants.DIVISOR_DUONG_BO);
  assert.strictEqual(cbmCore.DIVISOR_VIN_ECO, constants.DIVISOR_VIN_ECO);
  assert.strictEqual(cbmCore.DIVISOR_CPN, constants.DIVISOR_CPN);
  assert.strictEqual(cbmCore.DIVISOR_HOA_TOC, constants.DIVISOR_HOA_TOC);

  const groups = [
    { dai: 1, rong: 1, cao: 1, soKien: 1 },
    { dai: 40.5, rong: 30, cao: 20, soKien: 2 },
    { dai: 100, rong: 80, cao: 60, soKien: 12 },
    { dai: 250.25, rong: 120.5, cao: 90.75, soKien: 3.5 }
  ];
  const totals = cbmCore.calculateTotals(groups);

  const expected = groups.reduce((sum, group) => {
    sum.cbm += ((group.dai * group.rong * group.cao * group.soKien) / constants.DIVISOR_CBM) / constants.DIVISOR_KG_CBM;
    sum.kgDuongBo += ((group.dai * group.rong * group.cao) / constants.DIVISOR_DUONG_BO) * group.soKien;
    sum.kgVinEco += ((group.dai * group.rong * group.cao) / constants.DIVISOR_VIN_ECO) * group.soKien;
    sum.kgCpn += ((group.dai * group.rong * group.cao) / constants.DIVISOR_CPN) * group.soKien;
    sum.kgHoaToc += ((group.dai * group.rong * group.cao) / constants.DIVISOR_HOA_TOC) * group.soKien;
    sum.totalPieces += group.soKien;
    return sum;
  }, { cbm: 0, kgDuongBo: 0, kgVinEco: 0, kgCpn: 0, kgHoaToc: 0, totalPieces: 0 });

  Object.keys(expected).forEach((key) => {
    assert.ok(Math.abs(totals[key] - expected[key]) < 0.0000001, `${key}: expected ${expected[key]}, got ${totals[key]}`);
  });
}

function testProvinceAndDistrictDataMatchAndroid() {
  const webData = loadProvinceData();

  assert.deepStrictEqual(webData.duLieuTinh, parseAndroidProvinces());
  assert.deepStrictEqual(webData.duLieuHuyen, parseAndroidDistricts());
}

function testShippingPricesMatchAndroidTables() {
  const tables = {
    truck: parseNumericPriceTable('PRICE_TRUCK'),
    eco: parseNumericPriceTable('PRICE_ECO'),
    express: parseStringPriceTable('PRICE_EXPRESS'),
    hoatoc: parseStringPriceTable('PRICE_HOATOC'),
    deliveryTimes: parseDeliveryTimes()
  };
  const weights = [0, -1, NaN, Infinity, 0.1, 1, 2, 2.1, 2.5, 10, 10.1, 30, 50, 50.1, 100, 100.1, 200, 200.1, 300, 500, 1000, 2000, 2000.1, 100000, 100000.1];

  for (let zone = 0; zone < 9; zone += 1) {
    for (const isOuter of [false, true]) {
      for (const weight of weights) {
        assert.deepStrictEqual(
          shippingCore.calculateShipping(zone, isOuter, weight),
          expectedShipping(zone, isOuter, weight, tables),
          `zone=${zone} outer=${isOuter} weight=${weight}`
        );
      }
    }
  }
}

function testFishPricingMatchesAndroidCore() {
  const constants = Object.fromEntries([...fishCalculatorSource.matchAll(/public static final double ([_A-Z]+) = ([0-9.]+);/g)]
    .map((match) => [match[1], Number(match[2])]));
  const piecesList = [0, -1, NaN, Infinity, 1, 2, 2.5, 100000.1];

  assert.strictEqual(fishCore.FISH_KG_PER_PIECE, constants.KG_PER_PIECE);
  assert.strictEqual(fishCore.FISH_UNIT_PRICE, constants.UNIT_PRICE);
  assert.strictEqual(fishCore.FISH_FUEL_VAT_MULTIPLIER, constants.FUEL_VAT_MULTIPLIER);

  piecesList.forEach((pieces) => {
    const expected = Number.isFinite(pieces) && pieces > 0
      ? {
          pieces,
          kg: pieces * constants.KG_PER_PIECE,
          basePrice: Math.round(pieces * constants.KG_PER_PIECE * constants.UNIT_PRICE),
          totalPrice: Math.round(Math.round(pieces * constants.KG_PER_PIECE * constants.UNIT_PRICE) * constants.FUEL_VAT_MULTIPLIER)
        }
      : null;
    assert.deepStrictEqual(fishCore.calculateFishPrice(pieces), expected, `fish pieces=${pieces}`);
  });
}

testCbmConstantsAndFormulasMatchAndroid();
testProvinceAndDistrictDataMatchAndroid();
testShippingPricesMatchAndroidTables();
testFishPricingMatchesAndroidCore();

console.log('app-parity.test.js: 4 tests passed');
