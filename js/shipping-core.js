/**
 * Lõi tính cước vận chuyển - tách riêng để test
 * Đồng bộ 100% logic Android ShippingPricingCalculator.java
 */

const FUEL_VAT_MULTIPLIER = 1.3878;
const MAX_WEIGHT_KG = 100000;

const PRICE_TRUCK = {
    10: [50000, 70000, 90000, 100000, 110000, 120000, 125000, 140000, 180000],
    50: [2900, 3500, 4500, 4700, 4900, 5400, 5500, 5900, 9200],
    100: [2700, 3400, 4200, 4500, 4700, 5200, 5200, 5700, 9000],
    300: [2400, 3200, 3700, 4100, 4500, 5000, 5000, 5400, 8500],
    500: [2200, 2600, 3200, 3900, 4300, 4500, 4700, 5000, 8300],
    1000: [1700, 2400, 2800, 3700, 4000, 4200, 4300, 4700, 7500],
    2000: [1200, 1900, 2500, 3400, 3800, 3900, 4100, 4600, 6000],
    max: [1000, 1700, 2000, 3000, 3600, 3600, 4000, 4300, 5700]
};

const PRICE_ECO = {
    10: [66000, 100000, 109000, 170000, 180000, 180000, 180000, 190000, 200000],
    50: [3200, 4700, 7200, 7800, 8500, 10300, 16000, 17000, 19000],
    100: [3100, 4300, 6900, 7500, 8200, 10000, 15000, 16000, 18000],
    300: [3000, 3800, 5500, 6900, 7400, 8000, 14000, 15000, 16500],
    500: [2500, 3500, 4900, 6500, 6500, 7100, 12500, 13500, 15000],
    1000: [2100, 2900, 4000, 5600, 5900, 6500, 10000, 11000, 13000],
    2000: [1500, 2100, 2800, 3800, 5500, 6100, 8500, 10000, 12000],
    max: [1200, 1900, 2200, 3300, 5000, 5600, 7500, 8000, 10500]
};

const PRICE_EXPRESS = {
    "1": [24700, 40300, 45500, 48100, 52000, 57400, 61500, 63000, 73000],
    "2": [29000, 55900, 61100, 66300, 76700, 82600, 88500, 96000, 102000],
    "step": [2500, 3900, 5000, 8000, 10000, 12000, 12500, 13000, 14000]
};

const PRICE_HOATOC = {
    "2": [50000, 89700, 91000, 93600, 100100, 120000, 120000, 153000, 170000],
    "step": [4000, 5000, 6000, 10450, 10450, 13500, 13700, 13750, 17000]
};

const DELIVERY_TIMES = {
    "VIN-TRUCK": ["1-2 ngày", "1-2 ngày", "2-3 ngày", "3-3.5 ngày", "3-4.5 ngày", "4-5 ngày", "4-6 ngày", "4-6 ngày", "5-7 ngày"],
    "VIN-ECO": ["1-1.5 ngày", "1-1.5 ngày", "1-2 ngày", "2 ngày", "2-2.5 ngày", "2-2.5 ngày", "2-2.5 ngày", "2-3 ngày", "2-4 ngày"],
    "VIN-EXPRESS": ["24h", "24h", "24h", "36h", "36-48h", "36-48h", "36-48h", "36-48h", "72-80h"],
    "VIN-HOATOC": ["12-20h", "20h", "21h", "24h", "36h", "24h", "24h", "24h", "48-72h"]
};

function calculateOuterCoefficient(isOuter, weight) {
    if (!isOuter) return 1.0;
    if (weight <= 100) return 1.3;
    if (weight <= 200) return 1.2;
    return 1.1;
}

function calculateBasePrice(table, weight, zone) {
    const p10 = table[10][zone];
    if (weight <= 10) return p10;
    
    const ew = weight - 10;
    let up = 0;
    if (ew <= 40) up = table[50][zone];
    else if (ew <= 100) up = table[100][zone];
    else if (ew <= 300) up = table[300][zone];
    else if (ew <= 500) up = table[500][zone];
    else if (ew <= 1000) up = table[1000][zone];
    else if (ew <= 2000) up = table[2000][zone];
    else up = table.max[zone];
    
    return Math.round(p10 + ew * up);
}

function calculateStepPrice(table, weight, zone, baseKey) {
    const basePrice = table[baseKey][zone];
    if (weight <= 2) return basePrice;
    
    const overWeight = weight - 2;
    const steps = Math.ceil(overWeight / 0.5);
    return basePrice + steps * table.step[zone];
}

function calculateShipping(zone, isOuter, weight) {
    const isInvalidZone = !Number.isInteger(zone) || zone < 0 || zone >= PRICE_TRUCK[10].length;
    if (isInvalidZone || isNaN(weight) || !isFinite(weight) || weight <= 0 || weight > MAX_WEIGHT_KG) {
        return [];
    }
    
    const outerCoeff = calculateOuterCoefficient(isOuter, weight);
    const results = [];
    
    // VIN-TRUCK
    const baseTruck = calculateBasePrice(PRICE_TRUCK, weight, zone);
    const fuelVatTruck = Math.round(baseTruck * FUEL_VAT_MULTIPLIER);
    const totalTruck = Math.round(fuelVatTruck * outerCoeff);
    results.push({
        name: "VIN-TRUCK (Đường Bộ)",
        basePrice: baseTruck,
        fuelAndVatFee: fuelVatTruck - baseTruck,
        outerDistrictFee: totalTruck - fuelVatTruck,
        totalPrice: totalTruck,
        deliveryTime: DELIVERY_TIMES["VIN-TRUCK"][zone],
        isDisabled: false,
        reason: ""
    });
    
    // VIN-ECO
    if (weight >= 30) {
        const baseEco = calculateBasePrice(PRICE_ECO, weight, zone);
        const fuelVatEco = Math.round(baseEco * FUEL_VAT_MULTIPLIER);
        const totalEco = Math.round(fuelVatEco * outerCoeff);
        results.push({
            name: "VIN-ECO (Tiết Kiệm)",
            basePrice: baseEco,
            fuelAndVatFee: fuelVatEco - baseEco,
            outerDistrictFee: totalEco - fuelVatEco,
            totalPrice: totalEco,
            deliveryTime: DELIVERY_TIMES["VIN-ECO"][zone],
            isDisabled: false,
            reason: ""
        });
    } else {
        results.push({
            name: "VIN-ECO (Tiết Kiệm)",
            basePrice: 0,
            fuelAndVatFee: 0,
            outerDistrictFee: 0,
            totalPrice: 0,
            deliveryTime: "N/A",
            isDisabled: true,
            reason: "Yêu cầu tối thiểu 30kg"
        });
    }
    
    // VIN-EXPRESS
    let baseExpress;
    if (weight <= 1) {
        baseExpress = PRICE_EXPRESS["1"][zone];
    } else {
        baseExpress = calculateStepPrice(PRICE_EXPRESS, weight, zone, "2");
    }
    const fuelVatExpress = Math.round(baseExpress * FUEL_VAT_MULTIPLIER);
    const totalExpress = Math.round(fuelVatExpress * outerCoeff);
    results.push({
        name: "VIN-EXPRESS (CPN)",
        basePrice: baseExpress,
        fuelAndVatFee: fuelVatExpress - baseExpress,
        outerDistrictFee: totalExpress - fuelVatExpress,
        totalPrice: totalExpress,
        deliveryTime: DELIVERY_TIMES["VIN-EXPRESS"][zone],
        isDisabled: false,
        reason: ""
    });
    
    // VIN-HOATOC
    const baseHoaToc = calculateStepPrice(PRICE_HOATOC, weight, zone, "2");
    const fuelVatHoaToc = Math.round(baseHoaToc * FUEL_VAT_MULTIPLIER);
    const totalHoaToc = Math.round(fuelVatHoaToc * outerCoeff);
    results.push({
        name: "VIN-HOATOC (Hỏa Tốc)",
        basePrice: baseHoaToc,
        fuelAndVatFee: fuelVatHoaToc - baseHoaToc,
        outerDistrictFee: totalHoaToc - fuelVatHoaToc,
        totalPrice: totalHoaToc,
        deliveryTime: DELIVERY_TIMES["VIN-HOATOC"][zone],
        isDisabled: false,
        reason: ""
    });
    
    return results;
}

// Export cho Node.js test
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateShipping,
        calculateOuterCoefficient,
        calculateBasePrice,
        calculateStepPrice,
        FUEL_VAT_MULTIPLIER,
        MAX_WEIGHT_KG
    };
}

// Export cho browser
if (typeof window !== 'undefined') {
    window.ShippingCore = {
        calculateShipping,
        calculateOuterCoefficient,
        calculateBasePrice,
        calculateStepPrice,
        FUEL_VAT_MULTIPLIER,
        MAX_WEIGHT_KG
    };
}
