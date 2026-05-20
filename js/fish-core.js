/**
 * Lõi tính tiền Bong Bóng Cá - đồng bộ với FishPricingCalculator.java.
 */

const FISH_KG_PER_PIECE = 16.4;
const FISH_UNIT_PRICE = 31000.0;
const FISH_FUEL_VAT_MULTIPLIER = 1.3878;

function toFishNumber(value) {
    if (typeof value === "string") return Number(value.replace(",", ".").trim());
    return Number(value);
}

function isValidFishPieces(value) {
    return Number.isFinite(value) && value > 0;
}

function calculateFishPrice(inputPieces) {
    const pieces = toFishNumber(inputPieces);
    if (!isValidFishPieces(pieces)) return null;

    const kg = pieces * FISH_KG_PER_PIECE;
    const basePrice = Math.round(kg * FISH_UNIT_PRICE);
    const totalPrice = Math.round(basePrice * FISH_FUEL_VAT_MULTIPLIER);
    return { pieces, kg, basePrice, totalPrice };
}

const FishCore = {
    FISH_KG_PER_PIECE,
    FISH_UNIT_PRICE,
    FISH_FUEL_VAT_MULTIPLIER,
    toFishNumber,
    isValidFishPieces,
    calculateFishPrice
};

if (typeof module !== "undefined" && module.exports) {
    module.exports = FishCore;
}

if (typeof window !== "undefined") {
    window.VinTransCBMFishCore = FishCore;
}
