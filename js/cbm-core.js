/**
 * Lõi tính CBM - đồng bộ từ CbmCalculator.java của app Android.
 */

const DIVISOR_CBM = 3000.0;
const DIVISOR_KG_CBM = 333.0;
const DIVISOR_DUONG_BO = 4000.0;
const DIVISOR_VIN_ECO = 4000.0;
const DIVISOR_CPN = 6000.0;
const DIVISOR_HOA_TOC = 6000.0;

function toNumber(value) {
    if (typeof value === "string") return Number(value.replace(",", ".").trim());
    return Number(value);
}

function isValidDimension(value) {
    return Number.isFinite(value) && value > 0;
}

function normalizeGroup(input) {
    return {
        dai: toNumber(input?.dai),
        rong: toNumber(input?.rong),
        cao: toNumber(input?.cao),
        soKien: toNumber(input?.soKien)
    };
}

function isValidGroup(group) {
    if (!group) return false;
    return isValidDimension(group.dai)
        && isValidDimension(group.rong)
        && isValidDimension(group.cao)
        && isValidDimension(group.soKien);
}

function calculateCbm(dai, rong, cao, soKien) {
    return ((dai * rong * cao * soKien) / DIVISOR_CBM) / DIVISOR_KG_CBM;
}

function calculateKgDuongBo(dai, rong, cao, soKien) {
    return ((dai * rong * cao) / DIVISOR_DUONG_BO) * soKien;
}

function calculateKgVinEco(dai, rong, cao, soKien) {
    return ((dai * rong * cao) / DIVISOR_VIN_ECO) * soKien;
}

function calculateKgCpn(dai, rong, cao, soKien) {
    return ((dai * rong * cao) / DIVISOR_CPN) * soKien;
}

function calculateKgHoaToc(dai, rong, cao, soKien) {
    return ((dai * rong * cao) / DIVISOR_HOA_TOC) * soKien;
}

function calculateGroup(input, groupNumber = 1, id = String(groupNumber)) {
    const normalized = normalizeGroup(input);
    if (!isValidGroup(normalized)) return null;

    const { dai, rong, cao, soKien } = normalized;
    return {
        id,
        groupNumber,
        dai,
        rong,
        cao,
        soKien,
        cbm: calculateCbm(dai, rong, cao, soKien),
        kgDuongBo: calculateKgDuongBo(dai, rong, cao, soKien),
        kgVinEco: calculateKgVinEco(dai, rong, cao, soKien),
        kgCpn: calculateKgCpn(dai, rong, cao, soKien),
        kgHoaToc: calculateKgHoaToc(dai, rong, cao, soKien)
    };
}

function calculateTotals(groups) {
    return groups.reduce((totals, group) => {
        if (!isValidGroup(group)) return totals;
        totals.cbm += calculateCbm(group.dai, group.rong, group.cao, group.soKien);
        totals.kgDuongBo += calculateKgDuongBo(group.dai, group.rong, group.cao, group.soKien);
        totals.kgVinEco += calculateKgVinEco(group.dai, group.rong, group.cao, group.soKien);
        totals.kgCpn += calculateKgCpn(group.dai, group.rong, group.cao, group.soKien);
        totals.kgHoaToc += calculateKgHoaToc(group.dai, group.rong, group.cao, group.soKien);
        totals.totalPieces += group.soKien;
        return totals;
    }, {
        cbm: 0,
        kgDuongBo: 0,
        kgVinEco: 0,
        kgCpn: 0,
        kgHoaToc: 0,
        totalPieces: 0
    });
}

const CbmCore = {
    DIVISOR_CBM,
    DIVISOR_KG_CBM,
    DIVISOR_DUONG_BO,
    DIVISOR_VIN_ECO,
    DIVISOR_CPN,
    DIVISOR_HOA_TOC,
    toNumber,
    isValidDimension,
    normalizeGroup,
    isValidGroup,
    calculateCbm,
    calculateKgDuongBo,
    calculateKgVinEco,
    calculateKgCpn,
    calculateKgHoaToc,
    calculateGroup,
    calculateTotals
};

if (typeof module !== "undefined" && module.exports) {
    module.exports = CbmCore;
}

if (typeof window !== "undefined") {
    window.CbmCore = CbmCore;
}
