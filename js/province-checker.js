const VinTransCBMProvinceChecker = (() => {
    function normalize(text) {
        if (!text) return "";
        return text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase()
            .replace(/tp\./g, "tp")
            .replace(/tp /g, "tp")
            .replace(/thanh pho /g, "")
            .replace(/tinh /g, "")
            .trim();
    }

    function sanitize(text) {
        if (typeof text !== "string") return "";
        return text.replace(/[<>"']/g, "").trim().slice(0, 80);
    }

    function check(input, data) {
        const safeInput = sanitize(input);
        if (!safeInput) return null;

        const normalizedInput = normalize(safeInput);
        let foundIndex = -1;
        for (let index = 0; index < data.danhSach63TinhKhongDau.length; index++) {
            const provinceName = data.danhSach63TinhKhongDau[index];
            if (
                normalizedInput === provinceName ||
                (normalizedInput.length > 3 && provinceName.includes(normalizedInput)) ||
                (normalizedInput.length > 3 && normalizedInput.includes(provinceName))
            ) {
                foundIndex = index;
                break;
            }
        }

        if (foundIndex === -1) {
            return {
                input: safeInput,
                resultClass: "",
                html: "<font color='#CF6679'>Không rõ tỉnh thành</font>"
            };
        }

        const provinceKey = data.danhSach63TinhKhongDau[foundIndex];
        const displayName = data.tenTinhCoDau[foundIndex];
        let center = "";
        if (data.mienNam.includes(provinceKey)) center = " - <font color='#B0B0B0'>Trung Tâm Miền Nam</font>";
        else if (data.mekong.includes(provinceKey)) center = " - <font color='#B0B0B0'>Trung Tâm Mekong</font>";
        else if (data.mienDong.includes(provinceKey)) center = " - <font color='#B0B0B0'>Trung Tâm Miền Đông</font>";

        const isAir = data.danhSachDiBay.includes(provinceKey);
        return {
            input: safeInput,
            resultClass: isAir ? "hang-bay" : "hang-bo",
            html: isAir
                ? `<b>${displayName}</b>: <font color='#03DAC6'>Hàng Bay</font>${center}`
                : `<b>${displayName}</b>: <font color='#FF9800'>Hàng Bộ</font>${center}`
        };
    }

    return { check, normalize, sanitize };
})();

if (typeof module !== "undefined" && module.exports) {
    module.exports = VinTransCBMProvinceChecker;
}

if (typeof window !== "undefined") {
    window.VinTransCBMProvinceChecker = VinTransCBMProvinceChecker;
}
