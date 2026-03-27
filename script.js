document.addEventListener('DOMContentLoaded', () => {
    // --- UTILS ---
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);
    const df = (num) => {
        if (Math.round(num) === num) return num.toString();
        const fixed = num.toFixed(3);
        return parseFloat(fixed).toString();
    };

    // --- STATE ---
    let history = JSON.parse(localStorage.getItem('vinTransCBMHistory')) || [];
    let completedGroups = JSON.parse(localStorage.getItem('vinTransCBMGroups')) || [];
    let cbmCurrentIndex = 1;
    let cbmBuffer = [0, 0, 0, 0];
    let cbmCurrentGroup = completedGroups.length + 1;
    
    // --- HISTORY PAGINATION STATE ---
    let currentPage = 1;
    let itemsPerPage = 25;
    let totalPages = 1;

    // --- SHIPPING CALCULATOR DATA ---
    // Bảng phân vùng: 36 tỉnh thành (dùng index 0-8 cho array giá cước)
    const duLieuTinh = {
        "TP.HCM": { vung: 0, vungHienThi: "Nội Tỉnh", ten: "TP. Hồ Chí Minh" },
        "Bình Dương": { vung: 1, vungHienThi: "Vùng 1", ten: "Bình Dương" },
        "Đồng Nai": { vung: 1, vungHienThi: "Vùng 1", ten: "Đồng Nai" },
        "Long An": { vung: 1, vungHienThi: "Vùng 1", ten: "Long An" },
        "Bà Rịa - Vũng Tàu": { vung: 2, vungHienThi: "Vùng 2", ten: "Bà Rịa - Vũng Tàu" },
        "Bình Phước": { vung: 2, vungHienThi: "Vùng 2", ten: "Bình Phước" },
        "Tây Ninh": { vung: 2, vungHienThi: "Vùng 2", ten: "Tây Ninh" },
        "Bình Thuận": { vung: 2, vungHienThi: "Vùng 2", ten: "Bình Thuận" },
        "Tiền Giang": { vung: 2, vungHienThi: "Vùng 2", ten: "Tiền Giang" },
        "Bến Tre": { vung: 2, vungHienThi: "Vùng 2", ten: "Bến Tre" },
        "Vĩnh Long": { vung: 2, vungHienThi: "Vùng 2", ten: "Vĩnh Long" },
        "Cần Thơ": { vung: 2, vungHienThi: "Vùng 2", ten: "Cần Thơ" },
        "Đồng Tháp": { vung: 2, vungHienThi: "Vùng 2", ten: "Đồng Tháp" },
        "Trà Vinh": { vung: 2, vungHienThi: "Vùng 2", ten: "Trà Vinh" },
        "An Giang": { vung: 3, vungHienThi: "Vùng 3", ten: "An Giang" },
        "Kiên Giang": { vung: 3, vungHienThi: "Vùng 3", ten: "Kiên Giang" },
        "Hậu Giang": { vung: 3, vungHienThi: "Vùng 3", ten: "Hậu Giang" },
        "Cà Mau": { vung: 3, vungHienThi: "Vùng 3", ten: "Cà Mau" },
        "Sóc Trăng": { vung: 3, vungHienThi: "Vùng 3", ten: "Sóc Trăng" },
        "Bạc Liêu": { vung: 3, vungHienThi: "Vùng 3", ten: "Bạc Liêu" },
        "Ninh Thuận": { vung: 3, vungHienThi: "Vùng 3", ten: "Ninh Thuận" },
        "Khánh Hòa": { vung: 4, vungHienThi: "Vùng 4", ten: "Khánh Hòa" },
        "Bình Định": { vung: 4, vungHienThi: "Vùng 4", ten: "Bình Định" },
        "Phú Yên": { vung: 4, vungHienThi: "Vùng 4", ten: "Phú Yên" },
        "Lâm Đồng": { vung: 4, vungHienThi: "Vùng 4", ten: "Lâm Đồng" },
        "Đắk Nông": { vung: 4, vungHienThi: "Vùng 4", ten: "Đắk Nông" },
        "Đắk Lắk": { vung: 4, vungHienThi: "Vùng 4", ten: "Đắk Lắk" },
        "Kon Tum": { vung: 5, vungHienThi: "Vùng 5", ten: "Kon Tum" },
        "Gia Lai": { vung: 5, vungHienThi: "Vùng 5", ten: "Gia Lai" },
        "Huế": { vung: 5, vungHienThi: "Vùng 5", ten: "Huế" },
        "Quảng Ngãi": { vung: 5, vungHienThi: "Vùng 5", ten: "Quảng Ngãi" },
        "Đà Nẵng": { vung: 5, vungHienThi: "Vùng 5", ten: "Đà Nẵng" },
        "Quảng Nam": { vung: 5, vungHienThi: "Vùng 5", ten: "Quảng Nam" },
        "Nghệ An": { vung: 6, vungHienThi: "Vùng 6", ten: "Nghệ An" },
        "Hà Tĩnh": { vung: 6, vungHienThi: "Vùng 6", ten: "Hà Tĩnh" },
        "Quảng Bình": { vung: 6, vungHienThi: "Vùng 6", ten: "Quảng Bình" },
        "Quảng Trị": { vung: 6, vungHienThi: "Vùng 6", ten: "Quảng Trị" },
        "Hà Nội": { vung: 7, vungHienThi: "Vùng 7", ten: "Hà Nội" },
        "Bắc Ninh": { vung: 7, vungHienThi: "Vùng 7", ten: "Bắc Ninh" },
        "Vĩnh Phúc": { vung: 7, vungHienThi: "Vùng 7", ten: "Vĩnh Phúc" },
        "Thái Bình": { vung: 7, vungHienThi: "Vùng 7", ten: "Thái Bình" },
        "Hưng Yên": { vung: 7, vungHienThi: "Vùng 7", ten: "Hưng Yên" },
        "Ninh Bình": { vung: 7, vungHienThi: "Vùng 7", ten: "Ninh Bình" },
        "Hải Phòng": { vung: 7, vungHienThi: "Vùng 7", ten: "Hải Phòng" },
        "Hải Dương": { vung: 7, vungHienThi: "Vùng 7", ten: "Hải Dương" },
        "Hòa Bình": { vung: 7, vungHienThi: "Vùng 7", ten: "Hòa Bình" },
        "Nam Định": { vung: 7, vungHienThi: "Vùng 7", ten: "Nam Định" },
        "Thái Nguyên": { vung: 7, vungHienThi: "Vùng 7", ten: "Thái Nguyên" },
        "Bắc Giang": { vung: 7, vungHienThi: "Vùng 7", ten: "Bắc Giang" },
        "Hà Nam": { vung: 7, vungHienThi: "Vùng 7", ten: "Hà Nam" },
        "Thanh Hóa": { vung: 7, vungHienThi: "Vùng 7", ten: "Thanh Hóa" },
        "Quảng Ninh": { vung: 8, vungHienThi: "Vùng 8", ten: "Quảng Ninh" },
        "Bắc Kạn": { vung: 8, vungHienThi: "Vùng 8", ten: "Bắc Kạn" },
        "Lạng Sơn": { vung: 8, vungHienThi: "Vùng 8", ten: "Lạng Sơn" },
        "Cao Bằng": { vung: 8, vungHienThi: "Vùng 8", ten: "Cao Bằng" },
        "Điện Biên": { vung: 8, vungHienThi: "Vùng 8", ten: "Điện Biên" },
        "Sơn La": { vung: 8, vungHienThi: "Vùng 8", ten: "Sơn La" },
        "Yên Bái": { vung: 8, vungHienThi: "Vùng 8", ten: "Yên Bái" },
        "Lai Châu": { vung: 8, vungHienThi: "Vùng 8", ten: "Lai Châu" },
        "Tuyên Quang": { vung: 8, vungHienThi: "Vùng 8", ten: "Tuyên Quang" },
        "Hà Giang": { vung: 8, vungHienThi: "Vùng 8", ten: "Hà Giang" },
        "Lào Cai": { vung: 8, vungHienThi: "Vùng 8", ten: "Lào Cai" },
        "Phú Thọ": { vung: 8, vungHienThi: "Vùng 8", ten: "Phú Thọ" }
    };

    // Danh sách huyện theo tỉnh (noi = nội tuyến, ngoai = ngoại tuyến)
    const duLieuHuyen = {
        "TP.HCM": [
            { ten: "Quận 1", loai: "noi" }, { ten: "Quận 2", loai: "noi" }, { ten: "Quận 3", loai: "noi" },
            { ten: "Quận 4", loai: "noi" }, { ten: "Quận 5", loai: "noi" }, { ten: "Quận 6", loai: "noi" },
            { ten: "Quận 7", loai: "noi" }, { ten: "Quận 8", loai: "noi" }, { ten: "Quận 9", loai: "noi" },
            { ten: "Quận 10", loai: "noi" }, { ten: "Quận 11", loai: "noi" }, { ten: "Quận 12", loai: "noi" },
            { ten: "Quận Bình Tân", loai: "noi" }, { ten: "Quận Bình Thạnh", loai: "noi" },
            { ten: "Quận Gò Vấp", loai: "noi" }, { ten: "Quận Phú Nhuận", loai: "noi" },
            { ten: "Quận Tân Bình", loai: "noi" }, { ten: "Quận Tân Phú", loai: "noi" },
            { ten: "Quận Thủ Đức", loai: "noi" }, { ten: "Huyện Bình Chánh", loai: "noi" },
            { ten: "Huyện Cần Giờ", loai: "ngoai" }, { ten: "Huyện Củ Chi", loai: "ngoai" },
            { ten: "Huyện Hóc Môn", loai: "ngoai" }, { ten: "Huyện Nhà Bè", loai: "ngoai" }
        ],
        "Bắc Kạn": [
            { ten: "TX Bắc Kạn", loai: "noi" },
            { ten: "Huyện Ba Bể", loai: "ngoai" }, { ten: "Huyện Bạch Thông", loai: "ngoai" },
            { ten: "Huyện Chợ Đồn", loai: "ngoai" }, { ten: "Huyện Chợ Mới", loai: "ngoai" },
            { ten: "Huyện Na Rì", loai: "ngoai" }, { ten: "Huyện Ngân Sơn", loai: "ngoai" },
            { ten: "Huyện Pác Nặm", loai: "ngoai" }
        ],
        "Bắc Giang": [
            { ten: "TP Bắc Giang", loai: "noi" },
            { ten: "Huyện Hiệp Hòa", loai: "ngoai" }, { ten: "Huyện Lạng Giang", loai: "ngoai" },
            { ten: "Huyện Lục Nam", loai: "ngoai" }, { ten: "Huyện Lục Ngạn", loai: "ngoai" },
            { ten: "Huyện Sơn Động", loai: "ngoai" }, { ten: "Huyện Tân Yên", loai: "ngoai" },
            { ten: "Huyện Việt Yên", loai: "ngoai" }, { ten: "Huyện Yên Dũng", loai: "ngoai" },
            { ten: "Huyện Yên Thế", loai: "ngoai" }
        ],
        "Cao Bằng": [
            { ten: "TP Cao Bằng", loai: "noi" },
            { ten: "Huyện Bảo Lạc", loai: "ngoai" }, { ten: "Huyện Bảo Lâm", loai: "ngoai" },
            { ten: "Huyện Hạ Lang", loai: "ngoai" }, { ten: "Huyện Hà Quảng", loai: "ngoai" },
            { ten: "Huyện Hòa An", loai: "ngoai" }, { ten: "Huyện Nguyên Bình", loai: "ngoai" },
            { ten: "Huyện Phục Hòa", loai: "ngoai" }, { ten: "Huyện Quảng Uyên", loai: "ngoai" },
            { ten: "Huyện Thạch An", loai: "ngoai" }, { ten: "Huyện Thông Nông", loai: "ngoai" },
            { ten: "Huyện Trà Lĩnh", loai: "ngoai" }, { ten: "Huyện Trùng Khánh", loai: "ngoai" }
        ],
        "Hà Giang": [
            { ten: "TP Hà Giang", loai: "noi" },
            { ten: "Huyện Bắc Mê", loai: "ngoai" }, { ten: "Huyện Bắc Quang", loai: "ngoai" },
            { ten: "Huyện Đồng Văn", loai: "ngoai" }, { ten: "Huyện Hoàng Su Phì", loai: "ngoai" },
            { ten: "Huyện Mèo Vạc", loai: "ngoai" }, { ten: "Huyện Quản Bạ", loai: "ngoai" },
            { ten: "Huyện Quang Bình", loai: "ngoai" }, { ten: "Huyện Vị Xuyên", loai: "ngoai" },
            { ten: "Huyện Xín Mần", loai: "ngoai" }, { ten: "Huyện Yên Minh", loai: "ngoai" }
        ],
        "Lạng Sơn": [
            { ten: "TP Lạng Sơn", loai: "noi" },
            { ten: "Huyện Bắc Sơn", loai: "ngoai" }, { ten: "Huyện Bình Gia", loai: "ngoai" },
            { ten: "Huyện Cao Lộc", loai: "ngoai" }, { ten: "Huyện Chi Lăng", loai: "ngoai" },
            { ten: "Huyện Đình Lập", loai: "ngoai" }, { ten: "Huyện Hữu Lũng", loai: "ngoai" },
            { ten: "Huyện Lộc Bình", loai: "ngoai" }, { ten: "Huyện Tràng Định", loai: "ngoai" },
            { ten: "Huyện Văn Lãng", loai: "ngoai" }, { ten: "Huyện Văn Quan", loai: "ngoai" }
        ],
        "Thái Nguyên": [
            { ten: "TP Thái Nguyên", loai: "noi" }, { ten: "TX Sông Công", loai: "ngoai" },
            { ten: "Huyện Đại Từ", loai: "ngoai" }, { ten: "Huyện Định Hóa", loai: "ngoai" },
            { ten: "Huyện Đồng Hỷ", loai: "ngoai" }, { ten: "Huyện Phổ Yên", loai: "ngoai" },
            { ten: "Huyện Phú Bình", loai: "ngoai" }, { ten: "Huyện Phú Lương", loai: "ngoai" },
            { ten: "Huyện Võ Nhai", loai: "ngoai" }
        ],
        "Bắc Ninh": [
            { ten: "TP Bắc Ninh", loai: "noi" }, { ten: "TX Từ Sơn", loai: "noi" },
            { ten: "Huyện Gia Bình", loai: "ngoai" }, { ten: "Huyện Lương Tài", loai: "ngoai" },
            { ten: "Huyện Quế Võ", loai: "ngoai" }, { ten: "Huyện Thuận Thành", loai: "ngoai" },
            { ten: "Huyện Tiên Du", loai: "ngoai" }, { ten: "Huyện Yên Phong", loai: "ngoai" }
        ],
        "Hà Nam": [
            { ten: "TP Phủ Lý", loai: "noi" },
            { ten: "Huyện Bình Lục", loai: "ngoai" }, { ten: "Huyện Duy Tiên", loai: "ngoai" },
            { ten: "Huyện Kim Bảng", loai: "ngoai" }, { ten: "Huyện Lý Nhân", loai: "ngoai" },
            { ten: "Huyện Thanh Liêm", loai: "ngoai" }
        ],
        "Hà Nội": [
            { ten: "Quận Ba Đình", loai: "noi" }, { ten: "Quận Cầu Giấy", loai: "noi" },
            { ten: "Quận Đống Đa", loai: "noi" }, { ten: "Quận Hà Đông", loai: "noi" },
            { ten: "Quận Hai Bà Trưng", loai: "noi" }, { ten: "Quận Hoàn Kiếm", loai: "noi" },
            { ten: "Quận Hoàng Mai", loai: "noi" }, { ten: "Quận Long Biên", loai: "noi" },
            { ten: "Quận Tây Hồ", loai: "noi" }, { ten: "Quận Thanh Xuân", loai: "noi" },
            { ten: "Quận Thanh Trì", loai: "noi" }, { ten: "Quận Từ Liêm Bắc", loai: "noi" },
            { ten: "Quận Từ Liêm Nam", loai: "noi" }, { ten: "TX Sơn Tây", loai: "ngoai" },
            { ten: "Huyện Ba Vì", loai: "ngoai" }, { ten: "Huyện Chương Mỹ", loai: "ngoai" },
            { ten: "Huyện Đan Phượng", loai: "ngoai" }, { ten: "Huyện Đông Anh", loai: "ngoai" },
            { ten: "Huyện Gia Lâm", loai: "ngoai" }, { ten: "Huyện Hoài Đức", loai: "ngoai" },
            { ten: "Huyện Mê Linh", loai: "ngoai" }, { ten: "Huyện Mỹ Đức", loai: "ngoai" },
            { ten: "Huyện Phú Xuyên", loai: "ngoai" }, { ten: "Huyện Phúc Thọ", loai: "ngoai" },
            { ten: "Huyện Quốc Oai", loai: "ngoai" }, { ten: "Huyện Sóc Sơn", loai: "ngoai" },
            { ten: "Huyện Thạch Thất", loai: "ngoai" }, { ten: "Huyện Thanh Oai", loai: "ngoai" },
            { ten: "Huyện Thường Tín", loai: "ngoai" }, { ten: "Huyện Ứng Hòa", loai: "ngoai" }
        ],
        "Hải Dương": [
            { ten: "TP Hải Dương", loai: "noi" }, { ten: "TX Chí Linh", loai: "ngoai" },
            { ten: "Huyện Bình Giang", loai: "ngoai" }, { ten: "Huyện Cẩm Giàng", loai: "ngoai" },
            { ten: "Huyện Gia Lộc", loai: "ngoai" }, { ten: "Huyện Kim Thành", loai: "ngoai" },
            { ten: "Huyện Kinh Môn", loai: "ngoai" }, { ten: "Huyện Nam Sách", loai: "ngoai" },
            { ten: "Huyện Ninh Giang", loai: "ngoai" }, { ten: "Huyện Thanh Hà", loai: "ngoai" },
            { ten: "Huyện Thanh Miện", loai: "ngoai" }, { ten: "Huyện Tứ Kỳ", loai: "ngoai" }
        ],
        "Hải Phòng": [
            { ten: "Quận Đồ Sơn", loai: "noi" }, { ten: "Quận Dương Kinh", loai: "noi" },
            { ten: "Quận Hải An", loai: "noi" }, { ten: "Quận Hồng Bàng", loai: "noi" },
            { ten: "Quận Kiến An", loai: "noi" }, { ten: "Quận Lê Chân", loai: "noi" },
            { ten: "Quận Ngô Quyền", loai: "noi" },
            { ten: "Huyện An Dương", loai: "ngoai" }, { ten: "Huyện An Lão", loai: "ngoai" },
            { ten: "Huyện Bạch Long Vĩ", loai: "ngoai" }, { ten: "Huyện Cát Hải", loai: "ngoai" },
            { ten: "Huyện Kiến Thụy", loai: "ngoai" }, { ten: "Huyện Thủy Nguyên", loai: "ngoai" },
            { ten: "Huyện Tiên Lãng", loai: "ngoai" }, { ten: "Huyện Vĩnh Bảo", loai: "ngoai" }
        ],
        "Hòa Bình": [
            { ten: "TP Hòa Bình", loai: "noi" },
            { ten: "Huyện Cao Phong", loai: "ngoai" }, { ten: "Huyện Đà Bắc", loai: "ngoai" },
            { ten: "Huyện Kim Bôi", loai: "ngoai" }, { ten: "Huyện Kỳ Sơn", loai: "ngoai" },
            { ten: "Huyện Lạc Sơn", loai: "ngoai" }, { ten: "Huyện Lạc Thủy", loai: "ngoai" },
            { ten: "Huyện Lương Sơn", loai: "ngoai" }, { ten: "Huyện Mai Châu", loai: "ngoai" },
            { ten: "Huyện Tân Lạc", loai: "ngoai" }, { ten: "Huyện Yên Thủy", loai: "ngoai" }
        ],
        "Kon Tum": [
            { ten: "TP Kon Tum", loai: "noi" },
            { ten: "Huyện Đắk Glei", loai: "ngoai" }, { ten: "Huyện Đắk Hà", loai: "ngoai" },
            { ten: "Huyện Đắk Tô", loai: "ngoai" }, { ten: "Huyện Kon Plông", loai: "ngoai" },
            { ten: "Huyện Kon Rẫy", loai: "ngoai" }, { ten: "Huyện Ngọc Hồi", loai: "ngoai" },
            { ten: "Huyện Sa Thầy", loai: "ngoai" }, { ten: "Huyện Tu Mơ Rông", loai: "ngoai" }
        ],
        "Quảng Nam": [
            { ten: "TP Hội An", loai: "noi" }, { ten: "TP Tam Kỳ", loai: "noi" },
            { ten: "Huyện Bắc Trà My", loai: "ngoai" }, { ten: "Huyện Đại Lộc", loai: "ngoai" },
            { ten: "Huyện Điện Bàn", loai: "ngoai" }, { ten: "Huyện Đông Giang", loai: "ngoai" },
            { ten: "Huyện Duy Xuyên", loai: "ngoai" }, { ten: "Huyện Hiệp Đức", loai: "ngoai" },
            { ten: "Huyện Nam Giang", loai: "ngoai" }, { ten: "Huyện Nam Trà My", loai: "ngoai" },
            { ten: "Huyện Nông Sơn", loai: "ngoai" }, { ten: "Huyện Núi Thành", loai: "ngoai" },
            { ten: "Huyện Phú Ninh", loai: "ngoai" }, { ten: "Huyện Phước Sơn", loai: "ngoai" },
            { ten: "Huyện Quế Sơn", loai: "ngoai" }, { ten: "Huyện Tây Giang", loai: "ngoai" },
            { ten: "Huyện Thăng Bình", loai: "ngoai" }, { ten: "Huyện Tiên Phước", loai: "ngoai" }
        ],
        "Quảng Ngãi": [
            { ten: "TP Quảng Ngãi", loai: "noi" },
            { ten: "Huyện Ba Tơ", loai: "ngoai" }, { ten: "Huyện Bình Sơn", loai: "ngoai" },
            { ten: "Huyện Đức Phổ", loai: "ngoai" }, { ten: "Huyện Lý Sơn", loai: "ngoai" },
            { ten: "Huyện Minh Long", loai: "ngoai" }, { ten: "Huyện Mộ Đức", loai: "ngoai" },
            { ten: "Huyện Nghĩa Hành", loai: "ngoai" }, { ten: "Huyện Sơn Hà", loai: "ngoai" },
            { ten: "Huyện Sơn Tây", loai: "ngoai" }, { ten: "Huyện Sơn Tịnh", loai: "ngoai" },
            { ten: "Huyện Tây Trà", loai: "ngoai" }, { ten: "Huyện Trà Bồng", loai: "ngoai" },
            { ten: "Huyện Tư Nghĩa", loai: "ngoai" }
        ],
        "Quảng Trị": [
            { ten: "TP Đông Hà", loai: "ngoai" }, { ten: "TX Quảng Trị", loai: "ngoai" },
            { ten: "Huyện Triệu Phong", loai: "noi" }, { ten: "Huyện Cam Lộ", loai: "ngoai" },
            { ten: "Huyện Cồn Cỏ", loai: "ngoai" }, { ten: "Huyện Đakrông", loai: "ngoai" },
            { ten: "Huyện Gio Linh", loai: "ngoai" }, { ten: "Huyện Hải Lăng", loai: "ngoai" },
            { ten: "Huyện Hướng Hóa", loai: "ngoai" }, { ten: "Huyện Vĩnh Linh", loai: "ngoai" }
        ],
        "Bình Định": [
            { ten: "TP Quy Nhơn", loai: "noi" }, { ten: "Huyện Tuy Phước", loai: "noi" },
            { ten: "Huyện An Lão", loai: "ngoai" }, { ten: "Huyện An Nhơn", loai: "ngoai" },
            { ten: "Huyện Hoài Ân", loai: "ngoai" }, { ten: "Huyện Hoài Nhơn", loai: "ngoai" },
            { ten: "Huyện Phù Cát", loai: "ngoai" }, { ten: "Huyện Phù Mỹ", loai: "ngoai" },
            { ten: "Huyện Tây Sơn", loai: "ngoai" }, { ten: "Huyện Vân Canh", loai: "ngoai" },
            { ten: "Huyện Vĩnh Thạnh", loai: "ngoai" }
        ],
        "Ninh Bình": [
            { ten: "TP Ninh Bình", loai: "noi" }, { ten: "TX Tam Điệp", loai: "ngoai" },
            { ten: "Huyện Gia Viễn", loai: "ngoai" }, { ten: "Huyện Hoa Lư", loai: "ngoai" },
            { ten: "Huyện Kim Sơn", loai: "ngoai" }, { ten: "Huyện Nho Quan", loai: "ngoai" },
            { ten: "Huyện Yên Khánh", loai: "ngoai" }, { ten: "Huyện Yên Mô", loai: "ngoai" }
        ],
        "Quảng Bình": [
            { ten: "TP Đồng Hới", loai: "noi" },
            { ten: "Huyện Bố Trạch", loai: "ngoai" }, { ten: "Huyện Lệ Thủy", loai: "ngoai" },
            { ten: "Huyện Minh Hóa", loai: "ngoai" }, { ten: "Huyện Quảng Ninh", loai: "ngoai" },
            { ten: "Huyện Quảng Trạch", loai: "ngoai" }, { ten: "Huyện Tuyên Hóa", loai: "ngoai" }
        ],
        "Thanh Hóa": [
            { ten: "TP Thanh Hóa", loai: "noi" }, { ten: "TX Bỉm Sơn", loai: "ngoai" },
            { ten: "TX Sầm Sơn", loai: "ngoai" },
            { ten: "Huyện Bá Thước", loai: "ngoai" }, { ten: "Huyện Cẩm Thủy", loai: "ngoai" },
            { ten: "Huyện Đông Sơn", loai: "ngoai" }, { ten: "Huyện Hà Trung", loai: "ngoai" },
            { ten: "Huyện Hậu Lộc", loai: "ngoai" }, { ten: "Huyện Hoằng Hóa", loai: "ngoai" },
            { ten: "Huyện Lang Chánh", loai: "ngoai" }, { ten: "Huyện Mường Lát", loai: "ngoai" },
            { ten: "Huyện Nga Sơn", loai: "ngoai" }, { ten: "Huyện Ngọc Lặc", loai: "ngoai" },
            { ten: "Huyện Như Thanh", loai: "ngoai" }, { ten: "Huyện Như Xuân", loai: "ngoai" },
            { ten: "Huyện Nông Cống", loai: "ngoai" }, { ten: "Huyện Quan Hóa", loai: "ngoai" },
            { ten: "Huyện Quan Sơn", loai: "ngoai" }, { ten: "Huyện Quảng Xương", loai: "ngoai" },
            { ten: "Huyện Thạch Thành", loai: "ngoai" }, { ten: "Huyện Thiệu Hóa", loai: "ngoai" },
            { ten: "Huyện Thọ Xuân", loai: "ngoai" }, { ten: "Huyện Thường Xuân", loai: "ngoai" },
            { ten: "Huyện Tĩnh Gia", loai: "ngoai" }, { ten: "Huyện Triệu Sơn", loai: "ngoai" },
            { ten: "Huyện Vĩnh Lộc", loai: "ngoai" }, { ten: "Huyện Yên Định", loai: "ngoai" }
        ],
        "Đà Nẵng": [
            { ten: "Quận Cẩm Lệ", loai: "noi" }, { ten: "Quận Hải Châu", loai: "noi" },
            { ten: "Quận Liên Chiểu", loai: "noi" }, { ten: "Quận Ngũ Hành Sơn", loai: "noi" },
            { ten: "Quận Sơn Trà", loai: "noi" }, { ten: "Quận Thanh Khê", loai: "noi" },
            { ten: "Huyện Hòa Vang", loai: "ngoai" }
        ],
        "Huế": [
            { ten: "TP Huế", loai: "noi" }, { ten: "TX Hương Thủy", loai: "ngoai" },
            { ten: "TX Hương Trà", loai: "ngoai" },
            { ten: "Huyện A Lưới", loai: "ngoai" }, { ten: "Huyện Phong Điền", loai: "ngoai" },
            { ten: "Huyện Phú Lộc", loai: "ngoai" }, { ten: "Huyện Phú Vang", loai: "ngoai" },
            { ten: "Huyện Quảng Điền", loai: "ngoai" }
        ],
        "Phú Yên": [
            { ten: "TP Tuy Hòa", loai: "noi" }, { ten: "TX Sông Cầu", loai: "ngoai" },
            { ten: "Huyện Đồng Xuân", loai: "ngoai" }, { ten: "Huyện Đông Hòa", loai: "ngoai" },
            { ten: "Huyện Phú Hòa", loai: "ngoai" }, { ten: "Huyện Sơn Hòa", loai: "ngoai" },
            { ten: "Huyện Sông Hinh", loai: "ngoai" }, { ten: "Huyện Tây Hòa", loai: "ngoai" },
            { ten: "Huyện Tuy An", loai: "ngoai" }
        ],
        "Bến Tre": [
            { ten: "TP Bến Tre", loai: "noi" },
            { ten: "Huyện Ba Tri", loai: "ngoai" }, { ten: "Huyện Bình Đại", loai: "ngoai" },
            { ten: "Huyện Châu Thành", loai: "ngoai" }, { ten: "Huyện Chợ Lách", loai: "ngoai" },
            { ten: "Huyện Giồng Trôm", loai: "ngoai" }, { ten: "Huyện Mỏ Cày Bắc", loai: "ngoai" },
            { ten: "Huyện Mỏ Cày Nam", loai: "ngoai" }, { ten: "Huyện Thạnh Phú", loai: "ngoai" }
        ],
        "Bình Dương": [
            { ten: "TP Thủ Dầu Một", loai: "noi" }, { ten: "TX Dĩ An", loai: "noi" },
            { ten: "TX Thuận An", loai: "noi" },
            { ten: "Huyện Bến Cát", loai: "ngoai" }, { ten: "Huyện Dầu Tiếng", loai: "ngoai" },
            { ten: "Huyện Phú Giáo", loai: "ngoai" }, { ten: "Huyện Tân Uyên", loai: "ngoai" }
        ],
        "Bình Phước": [
            { ten: "TX Đồng Xoài", loai: "noi" }, { ten: "TX Bình Long", loai: "ngoai" },
            { ten: "TX Phước Long", loai: "ngoai" },
            { ten: "Huyện Bù Đăng", loai: "ngoai" }, { ten: "Huyện Bù Đốp", loai: "ngoai" },
            { ten: "Huyện Bù Gia Mập", loai: "ngoai" }, { ten: "Huyện Chơn Thành", loai: "ngoai" },
            { ten: "Huyện Đồng Phú", loai: "ngoai" }, { ten: "Huyện Hớn Quản", loai: "ngoai" },
            { ten: "Huyện Lộc Ninh", loai: "ngoai" }
        ],
        "Đắk Nông": [
            { ten: "TX Gia Nghĩa", loai: "noi" },
            { ten: "Huyện Cư Jút", loai: "ngoai" }, { ten: "Huyện Đắk Song", loai: "ngoai" },
            { ten: "Huyện Đắk Glong", loai: "ngoai" }, { ten: "Huyện Đắk Mil", loai: "ngoai" },
            { ten: "Huyện Đắk Rlấp", loai: "ngoai" }, { ten: "Huyện Krông Nô", loai: "ngoai" },
            { ten: "Huyện Tuy Đức", loai: "ngoai" }
        ],
        "Đồng Nai": [
            { ten: "TP Biên Hòa", loai: "noi" },
            { ten: "Huyện Cẩm Mỹ", loai: "ngoai" }, { ten: "Huyện Định Quán", loai: "ngoai" },
            { ten: "Huyện Long Khánh", loai: "ngoai" }, { ten: "Huyện Long Thành", loai: "ngoai" },
            { ten: "Huyện Nhơn Trạch", loai: "ngoai" }, { ten: "Huyện Tân Phú", loai: "ngoai" },
            { ten: "Huyện Thống Nhất", loai: "ngoai" }, { ten: "Huyện Trảng Bom", loai: "ngoai" },
            { ten: "Huyện Vĩnh Cửu", loai: "ngoai" }, { ten: "Huyện Xuân Lộc", loai: "ngoai" }
        ],
        "Đồng Tháp": [
            { ten: "TP Cao Lãnh", loai: "noi" }, { ten: "TX Hồng Ngự", loai: "ngoai" },
            { ten: "TX Sa Đéc", loai: "ngoai" },
            { ten: "Huyện Châu Thành", loai: "ngoai" }, { ten: "Huyện Hồng Ngự", loai: "ngoai" },
            { ten: "Huyện Lai Vung", loai: "ngoai" }, { ten: "Huyện Lấp Vò", loai: "ngoai" },
            { ten: "Huyện Tam Nông", loai: "ngoai" }, { ten: "Huyện Tân Hồng", loai: "ngoai" },
            { ten: "Huyện Thanh Bình", loai: "ngoai" }, { ten: "Huyện Tháp Mười", loai: "ngoai" }
        ],
        "Hậu Giang": [
            { ten: "TP Vị Thanh", loai: "noi" }, { ten: "TX Ngã Bảy", loai: "ngoai" },
            { ten: "Huyện Châu Thành", loai: "ngoai" }, { ten: "Huyện Châu Thành A", loai: "ngoai" },
            { ten: "Huyện Long Mỹ", loai: "ngoai" }, { ten: "Huyện Phụng Hiệp", loai: "ngoai" },
            { ten: "Huyện Vị Thủy", loai: "ngoai" }
        ],
        "Kiên Giang": [
            { ten: "TP Rạch Giá", loai: "noi" }, { ten: "TX Hà Tiên", loai: "ngoai" },
            { ten: "Huyện An Biên", loai: "ngoai" }, { ten: "Huyện An Minh", loai: "ngoai" },
            { ten: "Huyện Châu Thành", loai: "ngoai" }, { ten: "Huyện Giang Thành", loai: "ngoai" },
            { ten: "Huyện Giồng Riềng", loai: "ngoai" }, { ten: "Huyện Gò Quao", loai: "ngoai" },
            { ten: "Huyện Hòn Đất", loai: "ngoai" }, { ten: "Huyện Kiên Hải", loai: "ngoai" },
            { ten: "Huyện Kiên Lương", loai: "ngoai" }, { ten: "Huyện Phú Quốc", loai: "ngoai" },
            { ten: "Huyện Tân Hiệp", loai: "ngoai" }, { ten: "Huyện U Minh Thượng", loai: "ngoai" },
            { ten: "Huyện Vĩnh Thuận", loai: "ngoai" }
        ],
        "Sóc Trăng": [
            { ten: "TP Sóc Trăng", loai: "noi" }, { ten: "TX Vĩnh Châu", loai: "ngoai" },
            { ten: "Huyện Châu Thành", loai: "ngoai" }, { ten: "Huyện Cù Lao Dung", loai: "ngoai" },
            { ten: "Huyện Kế Sách", loai: "ngoai" }, { ten: "Huyện Long Phú", loai: "ngoai" },
            { ten: "Huyện Mỹ Tú", loai: "ngoai" }, { ten: "Huyện Mỹ Xuyên", loai: "ngoai" },
            { ten: "Huyện Ngã Năm", loai: "ngoai" }, { ten: "Huyện Thạnh Trị", loai: "ngoai" },
            { ten: "Huyện Trần Đề", loai: "ngoai" }
        ],
        "Trà Vinh": [
            { ten: "TP Trà Vinh", loai: "noi" },
            { ten: "Huyện Càng Long", loai: "ngoai" }, { ten: "Huyện Cầu Kè", loai: "ngoai" },
            { ten: "Huyện Cầu Ngang", loai: "ngoai" }, { ten: "Huyện Châu Thành", loai: "ngoai" },
            { ten: "Huyện Duyên Hải", loai: "ngoai" }, { ten: "Huyện Tiểu Cần", loai: "ngoai" },
            { ten: "Huyện Trà Cú", loai: "ngoai" }
        ],
        "Vĩnh Long": [
            { ten: "TP Vĩnh Long", loai: "noi" },
            { ten: "Huyện Bình Minh", loai: "ngoai" }, { ten: "Huyện Bình Tân", loai: "ngoai" },
            { ten: "Huyện Long Hồ", loai: "ngoai" }, { ten: "Huyện Mang Thít", loai: "ngoai" },
            { ten: "Huyện Tam Bình", loai: "ngoai" }, { ten: "Huyện Trà Ôn", loai: "ngoai" },
            { ten: "Huyện Vũng Liêm", loai: "ngoai" }
        ],
        "Bình Thuận": [
            { ten: "TP Phan Thiết", loai: "noi" }, { ten: "TX La Gi", loai: "noi" },
            { ten: "Huyện Bác Ái", loai: "ngoai" }, { ten: "Huyện Đức Linh", loai: "ngoai" },
            { ten: "Huyện Hàm Tân", loai: "ngoai" }, { ten: "Huyện Hàm Thuận Bắc", loai: "ngoai" },
            { ten: "Huyện Hàm Thuận Nam", loai: "ngoai" }, { ten: "Huyện Phú Quý", loai: "ngoai" },
            { ten: "Huyện Tánh Linh", loai: "ngoai" }, { ten: "Huyện Tuy Phong", loai: "ngoai" }
        ],
        "Long An": [
            { ten: "Huyện Bến Lức", loai: "ngoai" }, { ten: "Huyện Cần Đước", loai: "ngoai" },
            { ten: "Huyện Cần Giuộc", loai: "ngoai" }, { ten: "Huyện Châu Thành", loai: "ngoai" },
            { ten: "Huyện Đức Hòa", loai: "ngoai" }, { ten: "Huyện Đức Huệ", loai: "ngoai" }
        ],
        "Bà Rịa - Vũng Tàu": [
            { ten: "TP Vũng Tàu", loai: "noi" }, { ten: "TP Bà Rịa", loai: "noi" },
            { ten: "Huyện Châu Đức", loai: "ngoai" }, { ten: "Huyện Côn Đảo", loai: "ngoai" },
            { ten: "Huyện Đất Đỏ", loai: "ngoai" }, { ten: "Huyện Long Điền", loai: "ngoai" },
            { ten: "Huyện Tân Thành", loai: "ngoai" }, { ten: "Huyện Xuyên Mộc", loai: "ngoai" }
        ],
        "Tây Ninh": [
            { ten: "TP Tây Ninh", loai: "noi" },
            { ten: "Huyện Bến Cầu", loai: "ngoai" }, { ten: "Huyện Châu Thành", loai: "ngoai" },
            { ten: "Huyện Dương Minh Châu", loai: "ngoai" }, { ten: "Huyện Gò Dầu", loai: "ngoai" },
            { ten: "Huyện Hòa Thành", loai: "ngoai" }, { ten: "Huyện Tân Biên", loai: "ngoai" },
            { ten: "Huyện Tân Châu", loai: "ngoai" }, { ten: "Huyện Trảng Bàng", loai: "ngoai" }
        ],
        "Tiền Giang": [
            { ten: "TP Mỹ Tho", loai: "noi" }, { ten: "TX Gò Công", loai: "noi" },
            { ten: "Huyện Cai Lậy", loai: "ngoai" }, { ten: "Huyện Châu Thành", loai: "ngoai" },
            { ten: "Huyện Chợ Gạo", loai: "ngoai" }, { ten: "Huyện Gò Công Đông", loai: "ngoai" },
            { ten: "Huyện Gò Công Tây", loai: "ngoai" }, { ten: "Huyện Tân Phú Đông", loai: "ngoai" },
            { ten: "Huyện Tân Phước", loai: "ngoai" }
        ],
        "Cần Thơ": [
            { ten: "Quận Bình Thủy", loai: "noi" }, { ten: "Quận Cái Răng", loai: "noi" },
            { ten: "Quận Ninh Kiều", loai: "noi" }, { ten: "Quận Ô Môn", loai: "noi" },
            { ten: "Quận Thốt Nốt", loai: "noi" },
            { ten: "Huyện Cờ Đỏ", loai: "ngoai" }, { ten: "Huyện Phong Điền", loai: "ngoai" },
            { ten: "Huyện Thới Lai", loai: "ngoai" }, { ten: "Huyện Vĩnh Thạnh", loai: "ngoai" }
        ],
        "An Giang": [
            { ten: "TP Long Xuyên", loai: "noi" }, { ten: "TP Châu Đốc", loai: "noi" },
            { ten: "Huyện An Phú", loai: "ngoai" }, { ten: "Huyện Châu Phú", loai: "ngoai" },
            { ten: "Huyện Châu Thành", loai: "ngoai" }, { ten: "Huyện Chợ Mới", loai: "ngoai" },
            { ten: "Huyện Phú Tân", loai: "ngoai" }, { ten: "Huyện Thoại Sơn", loai: "ngoai" },
            { ten: "Huyện Tịnh Biên", loai: "ngoai" }, { ten: "Huyện Tri Tôn", loai: "ngoai" }
        ],
        "Cà Mau": [
            { ten: "TP Cà Mau", loai: "noi" },
            { ten: "Huyện Cái Nước", loai: "ngoai" }, { ten: "Huyện Đầm Dơi", loai: "ngoai" },
            { ten: "Huyện Năm Căn", loai: "ngoai" }, { ten: "Huyện Ngọc Hiển", loai: "ngoai" },
            { ten: "Huyện Phú Tân", loai: "ngoai" }, { ten: "Huyện Thới Bình", loai: "ngoai" },
            { ten: "Huyện Trần Văn Thời", loai: "ngoai" }, { ten: "Huyện U Minh", loai: "ngoai" }
        ],
        "Bạc Liêu": [
            { ten: "TP Bạc Liêu", loai: "noi" },
            { ten: "Huyện Đông Hải", loai: "ngoai" }, { ten: "Huyện Giá Rai", loai: "ngoai" },
            { ten: "Huyện Hòa Bình", loai: "ngoai" }, { ten: "Huyện Hồng Dân", loai: "ngoai" },
            { ten: "Huyện Phước Long", loai: "ngoai" }, { ten: "Huyện Vĩnh Lợi", loai: "ngoai" }
        ],
        "Ninh Thuận": [
            { ten: "TP Phan Rang-Tháp Chàm", loai: "noi" },
            { ten: "Huyện Bác Ái", loai: "ngoai" }, { ten: "Huyện Ninh Hải", loai: "ngoai" },
            { ten: "Huyện Ninh Phước", loai: "ngoai" }, { ten: "Huyện Ninh Sơn", loai: "ngoai" },
            { ten: "Huyện Thuận Bắc", loai: "ngoai" }, { ten: "Huyện Thuận Nam", loai: "ngoai" }
        ],
        "Khánh Hòa": [
            { ten: "TP Nha Trang", loai: "noi" }, { ten: "TP Cam Ranh", loai: "noi" },
            { ten: "Huyện Cam Lâm", loai: "ngoai" }, { ten: "Huyện Diên Khánh", loai: "ngoai" },
            { ten: "Huyện Khánh Sơn", loai: "ngoai" }, { ten: "Huyện Khánh Vĩnh", loai: "ngoai" },
            { ten: "Huyện Ninh Hòa", loai: "ngoai" }, { ten: "Huyện Trường Sa", loai: "ngoai" },
            { ten: "Huyện Vạn Ninh", loai: "ngoai" }
        ],
        "Lâm Đồng": [
            { ten: "TP Đà Lạt", loai: "noi" }, { ten: "TP Bảo Lộc", loai: "noi" },
            { ten: "Huyện Bảo Lâm", loai: "ngoai" }, { ten: "Huyện Cát Tiên", loai: "ngoai" },
            { ten: "Huyện Đạ Huoai", loai: "ngoai" }, { ten: "Huyện Đạ Tẻh", loai: "ngoai" },
            { ten: "Huyện Đam Rông", loai: "ngoai" }, { ten: "Huyện Di Linh", loai: "ngoai" },
            { ten: "Huyện Đơn Dương", loai: "ngoai" }, { ten: "Huyện Đức Trọng", loai: "ngoai" },
            { ten: "Huyện Lạc Dương", loai: "ngoai" }, { ten: "Huyện Lâm Hà", loai: "ngoai" }
        ],
        "Đắk Lắk": [
            { ten: "TP Buôn Ma Thuột", loai: "noi" },
            { ten: "Huyện Buôn Đôn", loai: "ngoai" }, { ten: "Huyện Cư Kuin", loai: "ngoai" },
            { ten: "Huyện Cư M'gar", loai: "ngoai" }, { ten: "Huyện Ea H'leo", loai: "ngoai" },
            { ten: "Huyện Ea Kar", loai: "ngoai" }, { ten: "Huyện Ea Súp", loai: "ngoai" },
            { ten: "Huyện Krông Ana", loai: "ngoai" }, { ten: "Huyện Krông Bông", loai: "ngoai" },
            { ten: "Huyện Krông Búk", loai: "ngoai" }, { ten: "Huyện Krông Năng", loai: "ngoai" },
            { ten: "Huyện Krông Pắc", loai: "ngoai" }, { ten: "Huyện Lắk", loai: "ngoai" },
            { ten: "Huyện M'Đrắk", loai: "ngoai" }
        ],
        "Gia Lai": [
            { ten: "TP Pleiku", loai: "noi" }, { ten: "TX An Khê", loai: "noi" },
            { ten: "Huyện Chư Păh", loai: "ngoai" }, { ten: "Huyện Chư Prông", loai: "ngoai" },
            { ten: "Huyện Chư Pưh", loai: "ngoai" }, { ten: "Huyện Chư Sê", loai: "ngoai" },
            { ten: "Huyện Đăk Đoa", loai: "ngoai" }, { ten: "Huyện Đăk Pơ", loai: "ngoai" },
            { ten: "Huyện Đức Cơ", loai: "ngoai" }, { ten: "Huyện Ia Grai", loai: "ngoai" },
            { ten: "Huyện Ia Pa", loai: "ngoai" }, { ten: "Huyện Kbang", loai: "ngoai" },
            { ten: "Huyện Kông Chro", loai: "ngoai" }, { ten: "Huyện Krông Pa", loai: "ngoai" },
            { ten: "Huyện Mang Yang", loai: "ngoai" }, { ten: "Huyện Phú Thiện", loai: "ngoai" }
        ],
        "Nghệ An": [
            { ten: "TP Vinh", loai: "noi" }, { ten: "TX Cửa Lò", loai: "noi" },
            { ten: "TX Thái Hòa", loai: "ngoai" },
            { ten: "Huyện Anh Sơn", loai: "ngoai" }, { ten: "Huyện Con Cuông", loai: "ngoai" },
            { ten: "Huyện Diễn Châu", loai: "ngoai" }, { ten: "Huyện Đô Lương", loai: "ngoai" },
            { ten: "Huyện Hưng Nguyên", loai: "ngoai" }, { ten: "Huyện Kỳ Sơn", loai: "ngoai" },
            { ten: "Huyện Nam Đàn", loai: "ngoai" }, { ten: "Huyện Nghi Lộc", loai: "ngoai" },
            { ten: "Huyện Nghĩa Đàn", loai: "ngoai" }, { ten: "Huyện Quế Phong", loai: "ngoai" },
            { ten: "Huyện Quỳ Châu", loai: "ngoai" }, { ten: "Huyện Quỳ Hợp", loai: "ngoai" },
            { ten: "Huyện Quỳnh Lưu", loai: "ngoai" }, { ten: "Huyện Tân Kỳ", loai: "ngoai" },
            { ten: "Huyện Thanh Chương", loai: "ngoai" }, { ten: "Huyện Tương Dương", loai: "ngoai" },
            { ten: "Huyện Yên Thành", loai: "ngoai" }
        ],
        "Hà Tĩnh": [
            { ten: "TP Hà Tĩnh", loai: "noi" }, { ten: "TX Hồng Lĩnh", loai: "noi" },
            { ten: "Huyện Cẩm Xuyên", loai: "ngoai" }, { ten: "Huyện Can Lộc", loai: "ngoai" },
            { ten: "Huyện Đức Thọ", loai: "ngoai" }, { ten: "Huyện Hương Khê", loai: "ngoai" },
            { ten: "Huyện Hương Sơn", loai: "ngoai" }, { ten: "Huyện Kỳ Anh", loai: "ngoai" },
            { ten: "Huyện Lộc Hà", loai: "ngoai" }, { ten: "Huyện Nghi Xuân", loai: "ngoai" },
            { ten: "Huyện Thạch Hà", loai: "ngoai" }, { ten: "Huyện Vũ Quang", loai: "ngoai" }
        ],
        "Quảng Ninh": [
            { ten: "TP Hạ Long", loai: "noi" }, { ten: "TP Móng Cái", loai: "noi" },
            { ten: "TP Cẩm Phả", loai: "noi" }, { ten: "TP Uông Bí", loai: "noi" },
            { ten: "Huyện Bình Liêu", loai: "ngoai" }, { ten: "Huyện Ba Chẽ", loai: "ngoai" },
            { ten: "Huyện Cô Tô", loai: "ngoai" }, { ten: "Huyện Đầm Hà", loai: "ngoai" },
            { ten: "Huyện Đông Triều", loai: "ngoai" }, { ten: "Huyện Hải Hà", loai: "ngoai" },
            { ten: "Huyện Hoành Bồ", loai: "ngoai" }, { ten: "Huyện Tiên Yên", loai: "ngoai" },
            { ten: "Huyện Vân Đồn", loai: "ngoai" }
        ],
        "Điện Biên": [
            { ten: "TP Điện Biên Phủ", loai: "noi" },
            { ten: "Huyện Điện Biên", loai: "ngoai" }, { ten: "Huyện Điện Biên Đông", loai: "ngoai" },
            { ten: "Huyện Mường Ảng", loai: "ngoai" }, { ten: "Huyện Mường Chà", loai: "ngoai" },
            { ten: "Huyện Mường Lay", loai: "ngoai" }, { ten: "Huyện Mường Nhé", loai: "ngoai" },
            { ten: "Huyện Nậm Pồ", loai: "ngoai" }, { ten: "Huyện Tủa Chùa", loai: "ngoai" },
            { ten: "Huyện Tuần Giáo", loai: "ngoai" }
        ],
        "Sơn La": [
            { ten: "TP Sơn La", loai: "noi" },
            { ten: "Huyện Bắc Yên", loai: "ngoai" }, { ten: "Huyện Mai Sơn", loai: "ngoai" },
            { ten: "Huyện Mộc Châu", loai: "ngoai" }, { ten: "Huyện Mường La", loai: "ngoai" },
            { ten: "Huyện Phù Yên", loai: "ngoai" }, { ten: "Huyện Quỳnh Nhai", loai: "ngoai" },
            { ten: "Huyện Sông Mã", loai: "ngoai" }, { ten: "Huyện Sốp Cộp", loai: "ngoai" },
            { ten: "Huyện Thuận Châu", loai: "ngoai" }, { ten: "Huyện Vân Hồ", loai: "ngoai" },
            { ten: "Huyện Yên Châu", loai: "ngoai" }
        ],
        "Yên Bái": [
            { ten: "TP Yên Bái", loai: "noi" },
            { ten: "Huyện Lục Yên", loai: "ngoai" }, { ten: "Huyện Mù Cang Chải", loai: "ngoai" },
            { ten: "Huyện Trạm Tấu", loai: "ngoai" }, { ten: "Huyện Trấn Yên", loai: "ngoai" },
            { ten: "Huyện Văn Chấn", loai: "ngoai" }, { ten: "Huyện Văn Yên", loai: "ngoai" },
            { ten: "Huyện Yên Bình", loai: "ngoai" }
        ],
        "Lai Châu": [
            { ten: "TP Lai Châu", loai: "noi" },
            { ten: "Huyện Mường Tè", loai: "ngoai" }, { ten: "Huyện Nậm Nhùn", loai: "ngoai" },
            { ten: "Huyện Phong Thổ", loai: "ngoai" }, { ten: "Huyện Sìn Hồ", loai: "ngoai" },
            { ten: "Huyện Tam Đường", loai: "ngoai" }, { ten: "Huyện Tân Uyên", loai: "ngoai" },
            { ten: "Huyện Than Uyên", loai: "ngoai" }
        ],
        "Tuyên Quang": [
            { ten: "TP Tuyên Quang", loai: "noi" },
            { ten: "Huyện Chiêm Hóa", loai: "ngoai" }, { ten: "Huyện Hàm Yên", loai: "ngoai" },
            { ten: "Huyện Lâm Bình", loai: "ngoai" }, { ten: "Huyện Na Hang", loai: "ngoai" },
            { ten: "Huyện Sơn Dương", loai: "ngoai" }, { ten: "Huyện Yên Sơn", loai: "ngoai" }
        ],
        "Lào Cai": [
            { ten: "TP Lào Cai", loai: "noi" },
            { ten: "Huyện Bắc Hà", loai: "ngoai" }, { ten: "Huyện Bảo Thắng", loai: "ngoai" },
            { ten: "Huyện Bảo Yên", loai: "ngoai" }, { ten: "Huyện Bát Xát", loai: "ngoai" },
            { ten: "Huyện Mường Khương", loai: "ngoai" }, { ten: "Huyện Sa Pa", loai: "ngoai" },
            { ten: "Huyện Si Ma Cai", loai: "ngoai" }, { ten: "Huyện Văn Bàn", loai: "ngoai" }
        ],
        "Phú Thọ": [
            { ten: "TP Việt Trì", loai: "noi" },
            { ten: "Huyện Cẩm Khê", loai: "ngoai" }, { ten: "Huyện Đoan Hùng", loai: "ngoai" },
            { ten: "Huyện Hạ Hòa", loai: "ngoai" }, { ten: "Huyện Lâm Thao", loai: "ngoai" },
            { ten: "Huyện Phù Ninh", loai: "ngoai" }, { ten: "Huyện Tam Nông", loai: "ngoai" },
            { ten: "Huyện Tân Sơn", loai: "ngoai" }, { ten: "Huyện Thanh Ba", loai: "ngoai" },
            { ten: "Huyện Thanh Sơn", loai: "ngoai" }, { ten: "Huyện Thanh Thủy", loai: "ngoai" },
            { ten: "Huyện Yên Lập", loai: "ngoai" }
        ],
        "Vĩnh Phúc": [
            { ten: "TP Vĩnh Yên", loai: "noi" }, { ten: "TP Phúc Yên", loai: "noi" },
            { ten: "Huyện Bình Xuyên", loai: "ngoai" }, { ten: "Huyện Lập Thạch", loai: "ngoai" },
            { ten: "Huyện Sông Lô", loai: "ngoai" }, { ten: "Huyện Tam Dương", loai: "ngoai" },
            { ten: "Huyện Tam Đảo", loai: "ngoai" }, { ten: "Huyện Vĩnh Tường", loai: "ngoai" },
            { ten: "Huyện Yên Lạc", loai: "ngoai" }
        ],
        "Thái Bình": [
            { ten: "TP Thái Bình", loai: "noi" },
            { ten: "Huyện Đông Hưng", loai: "ngoai" }, { ten: "Huyện Hưng Hà", loai: "ngoai" },
            { ten: "Huyện Kiến Xương", loai: "ngoai" }, { ten: "Huyện Quỳnh Phụ", loai: "ngoai" },
            { ten: "Huyện Thái Thụy", loai: "ngoai" }, { ten: "Huyện Tiền Hải", loai: "ngoai" },
            { ten: "Huyện Vũ Thư", loai: "ngoai" }
        ],
        "Hưng Yên": [
            { ten: "TP Hưng Yên", loai: "noi" },
            { ten: "Huyện Ân Thi", loai: "ngoai" }, { ten: "Huyện Khoái Châu", loai: "ngoai" },
            { ten: "Huyện Kim Động", loai: "ngoai" }, { ten: "Huyện Mỹ Hào", loai: "ngoai" },
            { ten: "Huyện Phù Cừ", loai: "ngoai" }, { ten: "Huyện Tiên Lữ", loai: "ngoai" },
            { ten: "Huyện Văn Giang", loai: "ngoai" }, { ten: "Huyện Văn Lâm", loai: "ngoai" },
            { ten: "Huyện Yên Mỹ", loai: "ngoai" }
        ],
        "Nam Định": [
            { ten: "TP Nam Định", loai: "noi" },
            { ten: "Huyện Giao Thủy", loai: "ngoai" }, { ten: "Huyện Hải Hậu", loai: "ngoai" },
            { ten: "Huyện Mỹ Lộc", loai: "ngoai" }, { ten: "Huyện Nam Trực", loai: "ngoai" },
            { ten: "Huyện Nghĩa Hưng", loai: "ngoai" }, { ten: "Huyện Trực Ninh", loai: "ngoai" },
            { ten: "Huyện Vụ Bản", loai: "ngoai" }, { ten: "Huyện Xuân Trường", loai: "ngoai" },
            { ten: "Huyện Ý Yên", loai: "ngoai" }
        ]
    };

    // Bảng giá VIN-TRUCK (Đường Bộ) - đơn vị: VNĐ
    const bangGiaVinTruck = {
        10: [50000, 70000, 90000, 100000, 110000, 120000, 125000, 140000, 180000], // ≤10kg
        50: [2900, 3500, 4500, 4700, 4900, 5400, 5500, 5900, 9200],   // >10-50kg (mỗi kg)
        100: [2700, 3400, 4200, 4500, 4700, 5200, 5200, 5700, 9000],  // >50-100kg (mỗi kg)
        300: [2400, 3200, 3700, 4100, 4500, 5000, 5000, 5400, 8500],  // >100-300kg
        500: [2200, 2600, 3200, 3900, 4300, 4500, 4700, 5000, 8300],  // >300-500kg
        1000: [1700, 2400, 2800, 3700, 4000, 4200, 4300, 4700, 7500], // >500-1000kg
        2000: [1200, 1900, 2500, 3400, 3800, 3900, 4100, 4600, 6000], // >1000-2000kg
        max: [1000, 1700, 2000, 3000, 3600, 3600, 4000, 4300, 5700]   // >2000kg
    };

    // Bảng giá VIN-ECO (Tiết Kiệm) - tối thiểu 30kg
    const bangGiaVinEco = {
        10: [66000, 100000, 109000, 170000, 180000, 180000, 180000, 190000, 200000],
        50: [3200, 4700, 7200, 7800, 8500, 10300, 16000, 17000, 19000],
        100: [3100, 4300, 6900, 7500, 8200, 10000, 15000, 16000, 18000],
        300: [3000, 3800, 5500, 6900, 7400, 8000, 14000, 15000, 16500],
        500: [2500, 3500, 4900, 6500, 6500, 7100, 12500, 13500, 15000],
        1000: [2100, 2900, 4000, 5600, 5900, 6500, 10000, 11000, 13000],
        2000: [1500, 2100, 2800, 3800, 5500, 6100, 8500, 10000, 12000],
        max: [1200, 1900, 2200, 3300, 5000, 5600, 7500, 8000, 10500]
    };

    // Bảng giá VIN-EXPRESS (Chuyển Phát Nhanh)
    const bangGiaVinExpress = {
        1: [24700, 40300, 45500, 48100, 52000, 57400, 61500, 63000, 73000],   // ≤1kg
        2: [29000, 55900, 61100, 66300, 76700, 82600, 88500, 96000, 102000], // ≤2kg
        step: [2500, 3900, 5000, 8000, 10000, 12000, 12500, 13000, 14000]   // mỗi 0.5kg tiếp
    };

    // Bảng giá VIN-SUPPER EXPRESS (Hỏa Tốc)
    const bangGiaVinHoaToc = {
        2: [50000, 89700, 91000, 93600, 100100, 120000, 120000, 153000, 170000], // ≤2kg
        step: [4000, 5000, 6000, 10450, 10450, 13500, 13700, 13750, 17000]      // mỗi 0.5kg tiếp
    };

    // Thời gian giao hàng (dịch vụ x vùng)
    const thoiGianGiaoHang = {
        "VIN-TRUCK": ["1-2 ngày", "1-2 ngày", "2-3 ngày", "3-3.5 ngày", "3-4.5 ngày", "4-5 ngày", "4-6 ngày", "4-6 ngày", "5-7 ngày"],
        "VIN-ECO": ["1-1.5 ngày", "1-1.5 ngày", "1-2 ngày", "2 ngày", "2-2.5 ngày", "2-2.5 ngày", "2-2.5 ngày", "2-3 ngày", "2-4 ngày"],
        "VIN-EXPRESS": ["24h", "24h", "24h", "36h", "36-48h", "36-48h", "36-48h", "36-48h", "72-80h"],
        "VIN-HOATOC": ["12-20h", "20h", "21h", "24h", "36h", "24h", "24h", "24h", "48-72h"]
    };

    // --- DOM ELEMENTS ---
    const sidebarNavItems = $$('.nav-item');
    const bottomNavItems = $$('.bottom-nav-item');
    const tabContents = $$('.tab-content');
    const cbmInput = $('#cbm-input');
    const btnBack1 = $('#btn-back1');
    const btnBack2 = $('#btn-back2');
    const btnReset = $('#btn-reset');
    const groupsDisplay = $('#groups-display');
    const mainContent = $('#cbm-main-content');
    const historyListDiv = $('#history-list');
    const clearHistoryBtn = $('#clear-history-button');
    const searchHistoryInput = $('#search-history-input');
    const clearSearchBtn = $('#clear-search-button');
    const prevPageBtn = $('#prev-page-button');
    const nextPageBtn = $('#next-page-button');
    const pageInfoSpan = $('#page-info');
    // Province Checker DOM elements
    const provinceInput = $('#province-input');
    const provinceResultDiv = $('#province-result');
    const btnClearProvince = $('#btn-clear-province');
    // Hamburger menu DOM elements
    const hamburgerMenu = $('#hamburger-menu');
    const slideMenu = $('#slide-menu');
    const menuOverlay = $('#menu-overlay');
    const closeMenuBtn = $('#close-menu');
    const slideMenuItems = $$('.slide-menu-item');
    // Shipping Calculator DOM elements
    const shippingTinhSelect = $('#shipping-tinh-select');
    const shippingHuyenSelect = $('#shipping-huyen-select');
    const shippingWeightInput = $('#shipping-weight-input');
    const btnCalculateShipping = $('#btn-calculate-shipping');
    const btnResetShipping = $('#btn-reset-shipping');
    const shippingResultDiv = $('#shipping-result');

    // --- PROVINCE CHECKER STATE ---
    // Danh sách 32 tỉnh HÀNG BAY (từ Android app)
    const hangBayProvinces = [
        "ha noi", "son la", "quang binh", "cao bang", "quang tri", "hue",
        "da nang", "quang nam", "quang ngai", "ha giang", "bac kan", "tuyen quang",
        "lao cai", "dien bien", "lai chau", "thai binh", "ha nam", "nam dinh",
        "ninh binh", "thanh hoa", "yen bai", "hoa binh", "thai nguyen", "lang son",
        "quang ninh", "bac giang", "phu tho", "vinh phuc", "bac ninh", "hai duong",
        "hai phong", "hung yen"
    ];
    
    // Danh sách đầy đủ 63 tỉnh thành Việt Nam (để check "Không tìm thấy")
    const allProvinces = [
        "ha noi", "ho chi minh", "da nang", "hai phong", "can tho",
        "an giang", "ba ria vung tau", "bac giang", "bac kan", "bac lieu", "bac ninh",
        "ben tre", "binh dinh", "binh duong", "binh phuoc", "binh thuan",
        "ca mau", "cao bang", "dak lak", "dak nong", "dien bien", "dong nai", "dong thap",
        "gia lai", "ha giang", "ha nam", "ha tinh", "hai duong", "hau giang", "hoa binh", "hung yen",
        "khanh hoa", "kien giang", "kon tum", "lai chau", "lam dong", "lang son", "lao cai",
        "long an", "nam dinh", "nghe an", "ninh binh", "ninh thuan",
        "phu tho", "phu yen", "quang binh", "quang nam", "quang ngai", "quang ninh", "quang tri",
        "soc trang", "son la", "tay ninh", "thai binh", "thai nguyen", "thanh hoa",
        "thua thien hue", "tien giang", "tra vinh", "tuyen quang",
        "vinh long", "vinh phuc", "yen bai"
    ];

    // --- HAMBURGER MENU STATE ---
    let hideMenuTimer;
    const MENU_HIDE_DELAY = 2000; // 2 seconds

    // --- FUNCTIONS ---
    
    // --- SECURITY FUNCTIONS ---
    // Sanitize input để ngăn XSS
    const sanitizeInput = (str) => {
        if (typeof str !== 'string') return '';
        return str
            .replace(/[<>\"']/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .trim();
    };
    
    const sanitizeNumber = (str) => {
        if (typeof str !== 'string') return '';
        return str.replace(/[^0-9.,]/g, '');
    };
    
    // --- THEME & SETTINGS FUNCTIONS ---
    const loadSettings = () => {
        const savedTheme = localStorage.getItem('vinTransCBMTheme') || 'light';
        const savedSize = localStorage.getItem('vinTransCBMSize') || 'medium';
        const savedAnimations = localStorage.getItem('vinTransCBMAnimations') !== 'false';
        const savedTabSize = localStorage.getItem('vinTransCBMTabSize') || 'medium';
        
        applyTheme(savedTheme);
        applySize(savedSize);
        applyAnimations(savedAnimations);
        applyTabFontSize(savedTabSize);
        
        // Update UI states
        updateThemeButtons(savedTheme);
        updateSizeButtons(savedSize);
        updateTabFontSizeButtons(savedTabSize);
        document.getElementById('animations-toggle').checked = savedAnimations;
    };
    
    const saveSettings = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const currentSize = document.documentElement.getAttribute('data-size') || 'medium';
        const currentAnimations = !document.body.classList.contains('no-animations');
        const currentTabSize = localStorage.getItem('vinTransCBMTabSize') || 'medium';
        
        localStorage.setItem('vinTransCBMTheme', currentTheme);
        localStorage.setItem('vinTransCBMSize', currentSize);
        localStorage.setItem('vinTransCBMAnimations', currentAnimations.toString());
        localStorage.setItem('vinTransCBMTabSize', currentTabSize);
    };
    
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
    };
    
    const applySize = (size) => {
        document.documentElement.setAttribute('data-size', size);
    };
    
    const applyAnimations = (enabled) => {
        if (enabled) {
            document.body.classList.remove('no-animations');
        } else {
            document.body.classList.add('no-animations');
        }
    };
    
    const updateThemeButtons = (theme) => {
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
        });
    };
    
    const updateSizeButtons = (size) => {
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-size') === size);
        });
    };
    
    const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        applyTheme(newTheme);
        updateThemeButtons(newTheme);
        saveSettings();
    };
    
    const applyTabFontSize = (size) => {
        console.log('Applying tab font size:', size);
        document.documentElement.setAttribute('data-tab-size', size);
        console.log('Current data-tab-size:', document.documentElement.getAttribute('data-tab-size'));
    };
    
    const updateTabFontSizeButtons = (size) => {
        document.querySelectorAll('.font-size-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-size') === size);
        });
    };
    
    const resetSettings = () => {
        if (confirm('Khôi phục tất cả cài đặt về mặc định?')) {
            localStorage.removeItem('vinTransCBMTheme');
            localStorage.removeItem('vinTransCBMSize');
            localStorage.removeItem('vinTransCBMAnimations');
            localStorage.removeItem('vinTransCBMTabSize');
            loadSettings();
        }
    };
    
    // --- HAMBURGER MENU FUNCTIONS ---
    const startHideTimer = () => {
        clearTimeout(hideMenuTimer);
        hideMenuTimer = setTimeout(() => {
            if (hamburgerMenu && !slideMenu.classList.contains('open')) {
                hamburgerMenu.classList.add('hidden');
            }
        }, MENU_HIDE_DELAY);
    };

    const showHamburger = () => {
        if (hamburgerMenu) {
            hamburgerMenu.classList.remove('hidden');
            startHideTimer();
        }
    };

    const openSlideMenu = () => {
        if (slideMenu && menuOverlay) {
            slideMenu.classList.add('open');
            menuOverlay.classList.add('visible');
            clearTimeout(hideMenuTimer);
            // Keep hamburger visible when menu is open
            if (hamburgerMenu) {
                hamburgerMenu.classList.remove('hidden');
            }
        }
    };

    const closeSlideMenu = () => {
        if (slideMenu && menuOverlay) {
            slideMenu.classList.remove('open');
            menuOverlay.classList.remove('visible');
            // Start hide timer after closing menu
            startHideTimer();
        }
    };

    const handleSlideMenuItemClick = (tabName) => {
        switchTab(tabName);
        closeSlideMenu();
    };

    // --- HISTORY FUNCTIONS ---
    const formatHistoryEntry = (entry) => {
        if (typeof entry === 'string') return entry; // Legacy format
        
        if (entry.type === 'cbm') {
            const { timestamp, groupNumber, inputs, calculatedOutputs } = entry;
            const { v1, v2, v3, v4 } = inputs;
            const { cbm, kgDuongBo, kgVinEco, kgCpn, kgHoaToc } = calculatedOutputs;
            
            return `📦 [${timestamp}] Kiện ${groupNumber}:\n` +
                   `Dài: ${df(v1)}, Rộng: ${df(v2)}, Cao: ${df(v3)}, Số kiện: ${df(v4)}\n` +
                   `✨ CBM = ${df(cbm)}\n` +
                   `🚛 Kg (ĐƯỜNG BỘ) = ${df(kgDuongBo)}\n` +
                   `🚐 Kg (VIN-ECO) = ${df(kgVinEco)}\n` +
                   `✈️ Kg (CPN) = ${df(kgCpn)}\n` +
                   `🚀 Kg (HỎA TỐC) = ${df(kgHoaToc)}`;
        } else if (entry.type === 'province') {
            return `🏙️ [${entry.timestamp}] Kiểm tra tỉnh: ${entry.province} → ${entry.result}`;
        } else if (entry.type === 'shipping') {
            const { timestamp, data } = entry;
            const { tinh, huyen, vung, tuyen, trongLuong, danhSachDichVu } = data;
            
            let result = `💰 [${timestamp}] Tính cước phí:\n`;
            result += `📍 ${huyen}, ${tinh} (${vung} - ${tuyen})\n`;
            result += `⚖️ Trọng lượng: ${trongLuong} kg\n`;
            result += `\n📊 Bảng giá:\n`;
            
            danhSachDichVu.forEach(dichVu => {
                if (dichVu.disabled) {
                    result += `${dichVu.icon} ${dichVu.ten}: Không áp dụng (${dichVu.lyDo})\n`;
                } else {
                    result += `${dichVu.icon} ${dichVu.ten}: ${dichVu.tongCuoc.toLocaleString('vi-VN')} đ (${dichVu.thoiGian})\n`;
                }
            });
            
            return result.trim();
        }
        return JSON.stringify(entry);
    };
    
    const renderHistory = () => {
        if (history.length === 0) {
            historyListDiv.innerHTML = '<p>📋 LỊCH SỬ TÍNH TOÁN:\n\nChưa có dữ liệu tính toán nào.</p>';
            pageInfoSpan.textContent = 'Trang 1/1';
            prevPageBtn.disabled = true;
            nextPageBtn.disabled = true;
            return;
        }
        
        // Tính toán phân trang
        totalPages = Math.ceil(history.length / itemsPerPage) || 1;
        if (currentPage > totalPages) currentPage = totalPages;
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, history.length);
        
        let html = `<div class="history-header">📋 LỊCH SỬ TÍNH TOÁN</div>`;
        html += `<div class="history-stats">📊 Hiển thị ${startIndex + 1}-${endIndex} trên tổng ${history.length} mục</div>`;
        
        // Hiển thị các mục trong trang hiện tại
        for (let i = startIndex; i < endIndex; i++) {
            const formattedEntry = formatHistoryEntry(history[i]);
            html += `<div class="history-item">${formattedEntry.replace(/\n/g, '<br>')}</div>`;
        }
        
        historyListDiv.innerHTML = html;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        
        // Cập nhật thông tin trang
        pageInfoSpan.textContent = `Trang ${currentPage}/${totalPages}`;
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;
        
        // Cuộn lên đầu
        historyListDiv.scrollTop = 0;
    };

    const switchTab = (tabName) => {
        // Hide all tabs
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Show selected tab
        const selectedTab = $(`#${tabName}`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Update sidebar nav items
        sidebarNavItems.forEach(item => {
            item.classList.toggle('active', item.dataset.tab === tabName);
        });
        
        // Update bottom nav items
        bottomNavItems.forEach(item => {
            item.classList.toggle('active', item.dataset.tab === tabName);
        });
        
        // Update slide menu items
        slideMenuItems.forEach(item => {
            item.classList.toggle('active', item.dataset.tab === tabName);
        });
    };

    
    // --- CBM Calculator ---
    const renderCBM = (isNewGroup = false) => {
        let groupHtml = '';
        let totalCbm = 0, totalKgDuongBo = 0, totalKgVinEco = 0, totalKgCpn = 0, totalKgHoaToc = 0, totalPieces = 0;

        completedGroups.forEach((group, index) => {
            const [v1, v2, v3, v4] = group.nums;
            
            const cbm = ((v1 * v2 * v3 * v4) / 3000.0) / 333.0;
            const kgDuongBo = ((v1 * v2 * v3) / 4000.0) * v4;
            const kgVinEco = kgDuongBo;
            const kgCpn = ((v1 * v2 * v3) / 6000.0) * v4;
            const kgHoaToc = kgCpn;

            totalCbm += cbm;
            totalKgDuongBo += kgDuongBo;
            totalKgVinEco += kgVinEco;
            totalKgCpn += kgCpn;
            totalKgHoaToc += kgHoaToc;
            totalPieces += v4;
            
            const isLast = isNewGroup && index === completedGroups.length - 1;

            groupHtml += `
                <div class="group-item${isLast ? ' new-item' : ''}" data-group-index="${index}">
                    <p class="group-title">☀️ Kiện ${group.groupNumber}:</p>
                    <p>Dài: <span class="value">${df(v1)}</span></p>
                    <p>Rộng: <span class="value">${df(v2)}</span></p>
                    <p>Cao: <span class="value">${df(v3)}</span></p>
                    <p>Số kiện: <span class="value">${df(v4)}</span></p>
                    <hr>
                    <p>✨ CBM kiện ${group.groupNumber} = ${df(cbm)}, Tổng: ${df(totalCbm)}, Số Kiện: ${df(totalPieces)}</p>
                    <p>🚛 Kg kiện ${group.groupNumber} (ĐƯỜNG BỘ) = ${df(kgDuongBo)}, Tổng: ${df(totalKgDuongBo)}</p>
                    <p>🚐 Kg kiện ${group.groupNumber} (VIN-ECO) = ${df(kgVinEco)}, Tổng: ${df(totalKgVinEco)}</p>
                    <p>✈️ Kg kiện ${group.groupNumber} (CPN) = ${df(kgCpn)}, Tổng: ${df(totalKgCpn)}</p>
                    <p>🚀 Kg kiện ${group.groupNumber} (HỎA TỐC) = ${df(kgHoaToc)}, Tổng: ${df(totalKgHoaToc)}</p>
                </div>`;
        });
        
        const labels = ["Dài", "Rộng", "Cao", "Số kiện"];
        if (cbmCurrentIndex > 1) {
            let currentInputHtml = '';
            for(let i=0; i < cbmCurrentIndex - 1; i++) {
                currentInputHtml += `${labels[i]}: <span class="value">${df(cbmBuffer[i])}</span>, `;
            }
            groupHtml += `<div class="group-item current-input"><strong>☀️ Kiện ${cbmCurrentGroup} (đang nhập):</strong><br>${currentInputHtml.slice(0, -2)}</div>`;
        }
        
        groupsDisplay.innerHTML = groupHtml || '<p class="empty-message">Chưa có lô hàng nào.</p>';
        if (typeof lucide !== 'undefined') lucide.createIcons();

        // Auto-scroll to show current input after every render (Mobile & PC)
        setTimeout(() => {
            if (mainContent) {
                // Smooth scroll to bottom
                mainContent.scrollTo({
                    top: mainContent.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }, 50);
    };
    
    const handleCBMInput = () => {
        const rawValue = sanitizeNumber(cbmInput.value);
        if (!rawValue) return;
        const value = parseFloat(rawValue);
        if (isNaN(value) || value <= 0) {
            cbmInput.style.animation = 'shake 0.5s';
            setTimeout(()=> cbmInput.style.animation = '', 500);
            cbmInput.value = "";
            return;
        }

        cbmBuffer[cbmCurrentIndex - 1] = value;
        cbmCurrentIndex++;

        if (cbmCurrentIndex > 4) {
            const newGroup = { groupNumber: cbmCurrentGroup, nums: [...cbmBuffer] };
            completedGroups.push(newGroup);
            saveGroupToHistory(newGroup);
            
            cbmCurrentGroup++;
            cbmBuffer = [0, 0, 0, 0];
            cbmCurrentIndex = 1;
            renderCBM(true);
        } else {
            saveState();
            renderCBM();
        }
        
        cbmInput.value = "";
        cbmInput.focus();
    };

    const saveState = () => {
        localStorage.setItem('vinTransCBMHistory', JSON.stringify(history));
        localStorage.setItem('vinTransCBMGroups', JSON.stringify(completedGroups));
    };
    
    const addToHistory = (entry) => {
        history.push(entry);
        saveState();
    };
    
    const saveGroupToHistory = (group) => {
        const [v1, v2, v3, v4] = group.nums;
        const cbm = ((v1 * v2 * v3 * v4) / 3000.0) / 333.0;
        const kgDuongBo = ((v1 * v2 * v3) / 4000.0) * v4;
        const kgVinEco = kgDuongBo;
        const kgCpn = ((v1 * v2 * v3) / 6000.0) * v4;
        const kgHoaToc = kgCpn;

        const historyEntry = {
            type: 'cbm',
            timestamp: new Date().toLocaleString('vi-VN'),
            groupNumber: group.groupNumber,
            inputs: { v1, v2, v3, v4 },
            calculatedOutputs: { cbm, kgDuongBo, kgVinEco, kgCpn, kgHoaToc }
        };
        addToHistory(historyEntry);
    };

    const handleBack1 = () => {
        if (cbmCurrentIndex > 1) {
            cbmCurrentIndex--;
            cbmBuffer[cbmCurrentIndex - 1] = 0;
            renderCBM();
            saveState();
        }
    };
    
    const handleBack2 = () => {
         if (cbmCurrentIndex > 1) {
            cbmBuffer = [0, 0, 0, 0];
            cbmCurrentIndex = 1;
            renderCBM();
            saveState();
        } else if (completedGroups.length > 0) {
            const lastGroupEl = $(`[data-group-index="${completedGroups.length - 1}"]`);
            if (lastGroupEl) {
                 if (confirm("Xóa lô hàng cuối cùng?")) {
                    lastGroupEl.style.animation = 'fadeOutUp 0.4s ease-out forwards';
                    setTimeout(() => {
                        completedGroups.pop();
                        cbmCurrentGroup--;
                        saveState();
                        renderCBM();
                    }, 400);
                }
            }
        }
    };

    const handleReset = () => {
        if (confirm("Bạn có chắc muốn xóa tất cả các lô hàng?")) {
            groupsDisplay.style.animation = 'fadeOutUp 0.5s ease-out forwards';
            setTimeout(() => {
                completedGroups = [];
                cbmBuffer = [0, 0, 0, 0];
                cbmCurrentIndex = 1;
                cbmCurrentGroup = 1;
                saveState();
                renderCBM();
                groupsDisplay.style.animation = 'fadeIn 0.5s ease-in';
                 setTimeout(()=> groupsDisplay.style.animation = '', 500);
            }, 500);
        }
    };

    // --- PROVINCE CHECKER FUNCTIONS ---
    const removeAccents = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
    };

    const checkProvince = () => {
        const sanitizedInput = sanitizeInput(provinceInput.value);
        const inputProvince = removeAccents(sanitizedInput.toLowerCase()).trim();
        const originalName = sanitizedInput.trim();

        if (inputProvince === "") {
            return;
        }

        let resultText = '';
        let resultClass = '';

        // Kiểm tra xem tỉnh có trong danh sách 63 tỉnh không
        if (!allProvinces.includes(inputProvince)) {
            // Không có trong danh sách → Không tìm thấy
            resultText = '❓ Không tìm thấy';
            resultClass = '';
        } else if (hangBayProvinces.includes(inputProvince)) {
            // Có trong danh sách 32 tỉnh Hàng Bay
            resultText = '✈️ Hàng Bay';
            resultClass = 'hang-bay';
        } else {
            // Có trong 63 tỉnh nhưng không phải Hàng Bay → Hàng Bộ
            resultText = '🚛 Hàng Bộ';
            resultClass = 'hang-bo';
        }

        // Get current time
        const now = new Date();
        const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

        // Remove message if exists
        const message = provinceResultDiv.querySelector('.province-message');
        if (message) {
            message.remove();
        }

        // Create new item
        const item = document.createElement('div');
        item.className = `province-item ${resultClass}`;
        item.innerHTML = `
            <span class="time">[${timeStr}]</span>
            <span class="name">${originalName}</span>
            <span class="arrow">→</span>
            <span class="result">${resultText}</span>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();

        // Insert after header
        const header = provinceResultDiv.querySelector('.province-header');
        if (header && header.nextSibling) {
            provinceResultDiv.insertBefore(item, header.nextSibling);
        } else {
            provinceResultDiv.appendChild(item);
        }

        // Scroll to top to see new item
        provinceResultDiv.scrollTop = 0;

        // Add to history
        const historyEntry = {
            type: 'province',
            timestamp: now.toLocaleString('vi-VN'),
            province: originalName,
            result: resultText
        };
        addToHistory(historyEntry);

        // Clear input
        provinceInput.value = '';
    };

    const clearProvinceResults = () => {
        // Keep header, remove all items
        const header = provinceResultDiv.querySelector('.province-header');
        provinceResultDiv.innerHTML = '';
        if (header) {
            provinceResultDiv.appendChild(header);
        }
        // Add message back
        const message = document.createElement('div');
        message.className = 'province-message';
        message.textContent = 'Nhập tên tỉnh để kiểm tra loại vận chuyển.';
        provinceResultDiv.appendChild(message);
    };

    // --- SHIPPING CALCULATOR FUNCTIONS ---
    
    // Khởi tạo dropdown tỉnh
    const khoiTaoDropdownTinh = () => {
        if (!shippingTinhSelect) return;
        
        const danhSachTinh = Object.keys(duLieuTinh).sort((a, b) => {
            return duLieuTinh[a].ten.localeCompare(duLieuTinh[b].ten, 'vi');
        });
        
        danhSachTinh.forEach(maTinh => {
            const option = document.createElement('option');
            option.value = maTinh;
            option.textContent = duLieuTinh[maTinh].ten;
            shippingTinhSelect.appendChild(option);
        });
    };
    
    // Cập nhật dropdown huyện khi chọn tỉnh
    const capNhatDropdownHuyen = () => {
        if (!shippingTinhSelect || !shippingHuyenSelect) return;
        
        const tinhDaChon = shippingTinhSelect.value;
        
        // Reset dropdown huyện
        shippingHuyenSelect.innerHTML = '<option value="">-- Chọn Quận/Huyện --</option>';
        
        if (!tinhDaChon || !duLieuHuyen[tinhDaChon]) {
            shippingHuyenSelect.disabled = true;
            return;
        }
        
        shippingHuyenSelect.disabled = false;
        
        // Thêm các huyện
        duLieuHuyen[tinhDaChon].forEach(huyen => {
            const option = document.createElement('option');
            option.value = JSON.stringify(huyen); // Lưu cả object để lấy loại tuyến
            option.textContent = huyen.ten;
            shippingHuyenSelect.appendChild(option);
        });
    };
    
    // Tính giá cho VIN-TRUCK và VIN-ECO theo quy định mới (2025)
    // Quy tắc: Xác định khung giá dựa trên SỐ KG CÒN LẠI (W_dư = kg - 10)
    // Trả về object chứa thông tin chi tiết để hiển thị quy trình tính toán
    const tinhGiaTheoBangMoi = (bangGia, kg, vung) => {
        // Giá 10kg đầu tiên
        const gia10kgDau = bangGia[10][vung];
        
        // Nếu ≤ 10kg, chỉ trả về giá 10kg đầu
        if (kg <= 10) {
            return {
                giaGoc: gia10kgDau,
                gia10kgDau: gia10kgDau,
                wDu: 0,
                donGiaKhung: 0,
                khungGiaTen: '≤ 10kg',
                tienPhanDu: 0
            };
        }
        
        // Tính số kg còn lại (W_dư)
        const wDu = kg - 10;
        
        // Xác định khung giá dựa trên W_dư (KHÔNG phải tổng kg)
        // Lưu ý: "Trên 10-50kg" = 11-50kg, "Trên 50-100kg" = 51-100kg
        let donGiaKhung = 0;
        let khungGiaTen = '';
        
        if (wDu <= 40) { // 0 < W_dư ≤ 40 → khung "Trên 10 - 50 kg" (11-50kg)
            donGiaKhung = bangGia[50][vung];
            khungGiaTen = 'Trên 10 - 50 kg (11-50kg)';
        } else if (wDu <= 100) { // 40 < W_dư ≤ 100 → khung "Trên 50 - 100 kg" (51-100kg)
            donGiaKhung = bangGia[100][vung];
            khungGiaTen = 'Trên 50 - 100 kg (51-100kg)';
        } else if (wDu <= 300) { // 100 < W_dư ≤ 300 → khung "Trên 100 - 300 kg" (101-300kg)
            donGiaKhung = bangGia[300][vung];
            khungGiaTen = 'Trên 100 - 300 kg (101-300kg)';
        } else if (wDu <= 500) { // 300 < W_dư ≤ 500 → khung "Trên 300 - 500 kg" (301-500kg)
            donGiaKhung = bangGia[500][vung];
            khungGiaTen = 'Trên 300 - 500 kg (301-500kg)';
        } else if (wDu <= 1000) { // 500 < W_dư ≤ 1000 → khung "Trên 500 - 1000 kg" (501-1000kg)
            donGiaKhung = bangGia[1000][vung];
            khungGiaTen = 'Trên 500 - 1000 kg (501-1000kg)';
        } else if (wDu <= 2000) { // 1000 < W_dư ≤ 2000 → khung "Trên 1000 - 2000 kg" (1001-2000kg)
            donGiaKhung = bangGia[2000][vung];
            khungGiaTen = 'Trên 1000 - 2000 kg (1001-2000kg)';
        } else { // W_dư > 2000 → khung "Trên 2000 kg" (2001kg trở lên)
            donGiaKhung = bangGia.max[vung];
            khungGiaTen = 'Trên 2000 kg (2001kg+)';
        }
        
        // Tính tiền phần dư: W_dư × ĐG_khung
        const tienPhanDu = wDu * donGiaKhung;
        
        // Tính giá gốc: P_10 + W_dư × ĐG_khung
        const giaGoc = gia10kgDau + tienPhanDu;
        
        return {
            giaGoc: Math.round(giaGoc),
            gia10kgDau: gia10kgDau,
            wDu: wDu,
            donGiaKhung: donGiaKhung,
            khungGiaTen: khungGiaTen,
            tienPhanDu: Math.round(tienPhanDu)
        };
    };
    
    // Format số tiền (helper function)
    const formatTien = (soTien) => {
        return soTien.toLocaleString('vi-VN') + ' đ';
    };
    
    // Tính giá chi tiết cho VIN-EXPRESS
    const tinhGiaChiTietExpress = (kg, vung) => {
        const bangGia = bangGiaVinExpress;
        let giaCoBan = 0;
        let chiTiet = {
            giaCoBan: 0,
            buoc1: '',
            buoc2: '',
            kgVuot: 0,
            soBuoc: 0,
            tienBuoc: 0
        };
        
        if (kg <= 1) {
            giaCoBan = bangGia[1][vung];
            chiTiet.buoc1 = `≤ 1kg: ${formatTien(bangGia[1][vung])}`;
            chiTiet.buoc2 = '';
        } else if (kg <= 2) {
            giaCoBan = bangGia[2][vung];
            chiTiet.buoc1 = `≤ 2kg: ${formatTien(bangGia[2][vung])}`;
            chiTiet.buoc2 = '';
        } else {
            giaCoBan = bangGia[2][vung];
            const kgVuot = kg - 2;
            const soBuoc = Math.ceil(kgVuot / 0.5);
            const tienBuoc = soBuoc * bangGia.step[vung];
            giaCoBan += tienBuoc;
            
            chiTiet.buoc1 = `≤ 2kg: ${formatTien(bangGia[2][vung])}`;
            chiTiet.kgVuot = kgVuot;
            chiTiet.soBuoc = soBuoc;
            chiTiet.tienBuoc = tienBuoc;
            chiTiet.buoc2 = `Phần vượt: ${kgVuot.toFixed(1)} kg ÷ 0.5 = ${soBuoc} bước × ${formatTien(bangGia.step[vung])} = ${formatTien(tienBuoc)}`;
        }
        
        chiTiet.giaCoBan = Math.round(giaCoBan);
        return chiTiet;
    };
    
    // Tính giá chi tiết cho VIN-HOATOC
    const tinhGiaChiTietHoaToc = (kg, vung) => {
        const bangGia = bangGiaVinHoaToc;
        let giaCoBan = 0;
        let chiTiet = {
            giaCoBan: 0,
            buoc1: '',
            buoc2: '',
            kgVuot: 0,
            soBuoc: 0,
            tienBuoc: 0
        };
        
        if (kg <= 2) {
            giaCoBan = bangGia[2][vung];
            chiTiet.buoc1 = `≤ 2kg: ${formatTien(bangGia[2][vung])}`;
            chiTiet.buoc2 = '';
        } else {
            giaCoBan = bangGia[2][vung];
            const kgVuot = kg - 2;
            const soBuoc = Math.ceil(kgVuot / 0.5);
            const tienBuoc = soBuoc * bangGia.step[vung];
            giaCoBan += tienBuoc;
            
            chiTiet.buoc1 = `≤ 2kg: ${formatTien(bangGia[2][vung])}`;
            chiTiet.kgVuot = kgVuot;
            chiTiet.soBuoc = soBuoc;
            chiTiet.tienBuoc = tienBuoc;
            chiTiet.buoc2 = `Phần vượt: ${kgVuot.toFixed(1)} kg ÷ 0.5 = ${soBuoc} bước × ${formatTien(bangGia.step[vung])} = ${formatTien(tienBuoc)}`;
        }
        
        chiTiet.giaCoBan = Math.round(giaCoBan);
        return chiTiet;
    };
    
    // Tính giá cho EXPRESS và HỎA TỐC (giữ nguyên logic cũ)
    const tinhGiaTheoBang = (bangGia, kg, vung) => {
        let giaCoBan = 0;
        
        // Xử lý riêng cho EXPRESS và HỎA TỐC (tính theo 0.5kg)
        if (bangGia === bangGiaVinExpress) {
            if (kg <= 1) {
                giaCoBan = bangGia[1][vung];
            } else if (kg <= 2) {
                giaCoBan = bangGia[2][vung];
            } else {
                giaCoBan = bangGia[2][vung];
                const kgVuot = kg - 2;
                const soBuoc = Math.ceil(kgVuot / 0.5);
                giaCoBan += soBuoc * bangGia.step[vung];
            }
            return giaCoBan;
        }
        
        if (bangGia === bangGiaVinHoaToc) {
            if (kg <= 2) {
                giaCoBan = bangGia[2][vung];
            } else {
                giaCoBan = bangGia[2][vung];
                const kgVuot = kg - 2;
                const soBuoc = Math.ceil(kgVuot / 0.5);
                giaCoBan += soBuoc * bangGia.step[vung];
            }
            return giaCoBan;
        }
        
        // VIN-TRUCK và VIN-ECO sử dụng hàm mới
        return tinhGiaTheoBangMoi(bangGia, kg, vung);
    };
    
    // Tính phụ phí ngoại tuyến - dựa trên TỔNG SỐ KG GỐC (không trừ 10 hay trừ 2)
    const tinhPhuPhiNgoaiTuyen = (giaCoBan, tongKgGoc, loaiTuyen) => {
        if (loaiTuyen === 'noi') return 0;
        
        // Dựa trên tổng kg gốc (không trừ 10 hay trừ 2)
        if (tongKgGoc <= 100) {
            return Math.round(giaCoBan * 0.3); // ≤100kg: +30% (nhân 1.3)
        } else if (tongKgGoc <= 200) {
            return Math.round(giaCoBan * 0.2); // 101-200kg: +20% (nhân 1.2)
        } else {
            return Math.round(giaCoBan * 0.1); // ≥201kg: +10% (nhân 1.1)
        }
    };
    
    // Hàm tính toán chính
    const tinhToanCuocPhi = () => {
        // Validate input
        if (!shippingTinhSelect || !shippingHuyenSelect || !shippingWeightInput) return;
        
        const tinhDaChon = shippingTinhSelect.value;
        const huyenJson = shippingHuyenSelect.value;
        const kgInput = parseFloat(shippingWeightInput.value);
        
        // Kiểm tra dữ liệu đầu vào
        if (!tinhDaChon) {
            alert('⚠️ Vui lòng chọn Tỉnh/Thành phố!');
            shippingTinhSelect.focus();
            return;
        }
        
        if (!huyenJson) {
            alert('⚠️ Vui lòng chọn Quận/Huyện!');
            shippingHuyenSelect.focus();
            return;
        }
        
        if (!kgInput || kgInput <= 0) {
            alert('⚠️ Vui lòng nhập trọng lượng hợp lệ (> 0 kg)!');
            shippingWeightInput.focus();
            return;
        }
        
        // Parse dữ liệu
        const huyen = JSON.parse(huyenJson);
        const vung = duLieuTinh[tinhDaChon].vung;
        const loaiTuyen = huyen.loai;
        
        // Tính toán cho 4 dịch vụ
        const danhSachKetQua = [];
        
        // Lưu thông tin chi tiết quy trình tính toán (cho VIN-TRUCK và VIN-ECO)
        let chiTietQuyTrinh = null;
        
        // 1. VIN-TRUCK (Áp dụng quy định mới 2025)
        const chiTietTruck = tinhGiaTheoBangMoi(bangGiaVinTruck, kgInput, vung);
        const giaGocTruck = chiTietTruck.giaGoc;
        // Nhân hệ số 1.3878 (nhiên liệu & VAT) trước - BẮT BUỘC cho tất cả dịch vụ
        const sauNhiLieuVATTruck = Math.round(giaGocTruck * 1.3878);
        // Nhân hệ số ngoại tuyến sau (nếu ngoại tuyến) - dựa trên TỔNG KG GỐC
        let heSoNgoaiTuyenTruck = 1;
        if (loaiTuyen === 'ngoai') {
            if (kgInput <= 100) {
                heSoNgoaiTuyenTruck = 1.3; // ≤100kg: +30%
            } else if (kgInput <= 200) {
                heSoNgoaiTuyenTruck = 1.2; // 101-200kg: +20%
            } else {
                heSoNgoaiTuyenTruck = 1.1; // ≥201kg: +10%
            }
        }
        const tongTruck = Math.round(sauNhiLieuVATTruck * heSoNgoaiTuyenTruck);
        const phuPhiXangVATTruck = sauNhiLieuVATTruck - giaGocTruck;
        const phuPhiNgoaiTuyenTruck = loaiTuyen === 'ngoai' ? tongTruck - sauNhiLieuVATTruck : 0;
        
        // Lưu chi tiết quy trình tính toán (dùng cho VIN-TRUCK làm mẫu)
        chiTietQuyTrinh = {
            gia10kgDau: chiTietTruck.gia10kgDau,
            wDu: chiTietTruck.wDu,
            donGiaKhung: chiTietTruck.donGiaKhung,
            khungGiaTen: chiTietTruck.khungGiaTen || '≤ 10kg',
            tienPhanDu: chiTietTruck.tienPhanDu,
            giaGoc: giaGocTruck,
            sauNhiLieuVAT: sauNhiLieuVATTruck,
            tongCuoc: tongTruck
        };
        
        danhSachKetQua.push({
            ten: "VIN-TRUCK (Đường Bộ)",
            icon: '<i data-lucide="truck"></i>',
            giaCoBan: giaGocTruck,
            phuPhiNgoaiTuyen: phuPhiNgoaiTuyenTruck,
            phuPhiXangVAT: phuPhiXangVATTruck,
            tongCuoc: tongTruck,
            thoiGian: thoiGianGiaoHang["VIN-TRUCK"][vung],
            disabled: false,
            chiTietQuyTrinh: chiTietQuyTrinh,
            loaiDichVu: 'truck'
        });
        
        // 2. VIN-ECO (Áp dụng quy định mới 2025, hiển thị nhưng disabled nếu < 30kg)
        if (kgInput >= 30) {
            const chiTietEco = tinhGiaTheoBangMoi(bangGiaVinEco, kgInput, vung);
            const giaGocEco = chiTietEco.giaGoc;
            // Nhân hệ số 1.3878 (nhiên liệu & VAT) trước - BẮT BUỘC cho tất cả dịch vụ
            const sauNhiLieuVATEco = Math.round(giaGocEco * 1.3878);
            // Nhân hệ số ngoại tuyến sau (nếu ngoại tuyến) - dựa trên TỔNG KG GỐC
            let heSoNgoaiTuyenEco = 1;
            if (loaiTuyen === 'ngoai') {
                if (kgInput <= 100) {
                    heSoNgoaiTuyenEco = 1.3; // ≤100kg: +30%
                } else if (kgInput <= 200) {
                    heSoNgoaiTuyenEco = 1.2; // 101-200kg: +20%
                } else {
                    heSoNgoaiTuyenEco = 1.1; // ≥201kg: +10%
                }
            }
            const tongEco = Math.round(sauNhiLieuVATEco * heSoNgoaiTuyenEco);
            const phuPhiXangVATEco = sauNhiLieuVATEco - giaGocEco;
            const phuPhiNgoaiTuyenEco = loaiTuyen === 'ngoai' ? tongEco - sauNhiLieuVATEco : 0;
            
            const chiTietQuyTrinhEco = {
                gia10kgDau: chiTietEco.gia10kgDau,
                wDu: chiTietEco.wDu,
                donGiaKhung: chiTietEco.donGiaKhung,
                khungGiaTen: chiTietEco.khungGiaTen || '≤ 10kg',
                tienPhanDu: chiTietEco.tienPhanDu,
                giaGoc: giaGocEco,
                sauNhiLieuVAT: sauNhiLieuVATEco,
                tongCuoc: tongEco
            };
            
            danhSachKetQua.push({
                ten: "VIN-ECO (Tiết Kiệm)",
                icon: '<i data-lucide="bus"></i>',
                giaCoBan: giaGocEco,
                phuPhiNgoaiTuyen: phuPhiNgoaiTuyenEco,
                phuPhiXangVAT: phuPhiXangVATEco,
                tongCuoc: tongEco,
                thoiGian: thoiGianGiaoHang["VIN-ECO"][vung],
                disabled: false,
                chiTietQuyTrinh: chiTietQuyTrinhEco,
                loaiDichVu: 'eco'
            });
        } else {
            // Hiển thị card bị vô hiệu hóa
            danhSachKetQua.push({
                ten: "VIN-ECO (Tiết Kiệm)",
                icon: '<i data-lucide="bus"></i>',
                giaCoBan: 0,
                phuPhiNgoaiTuyen: 0,
                phuPhiXangVAT: 0,
                tongCuoc: 0,
                thoiGian: "N/A",
                disabled: true,
                lyDo: "Yêu cầu tối thiểu 30kg"
            });
        }
        
        // 3. VIN-EXPRESS
        const chiTietExpress = tinhGiaChiTietExpress(kgInput, vung);
        const giaGocExpress = chiTietExpress.giaCoBan;
        // Nhân hệ số 1.3878 (nhiên liệu & VAT) trước - BẮT BUỘC cho tất cả dịch vụ
        const sauNhiLieuVATExpress = Math.round(giaGocExpress * 1.3878);
        // Nhân hệ số ngoại tuyến sau (nếu ngoại tuyến) - dựa trên TỔNG KG GỐC
        let heSoNgoaiTuyenExpress = 1;
        if (loaiTuyen === 'ngoai') {
            if (kgInput <= 100) {
                heSoNgoaiTuyenExpress = 1.3; // ≤100kg: +30%
            } else if (kgInput <= 200) {
                heSoNgoaiTuyenExpress = 1.2; // 101-200kg: +20%
            } else {
                heSoNgoaiTuyenExpress = 1.1; // ≥201kg: +10%
            }
        }
        const tongExpress = Math.round(sauNhiLieuVATExpress * heSoNgoaiTuyenExpress);
        const phuPhiXangVATExpress = sauNhiLieuVATExpress - giaGocExpress;
        const phuPhiNgoaiTuyenExpress = loaiTuyen === 'ngoai' ? tongExpress - sauNhiLieuVATExpress : 0;
        
        const chiTietQuyTrinhExpress = {
            ...chiTietExpress,
            giaCoBan: giaGocExpress,
            phuPhiNgoaiTuyen: phuPhiNgoaiTuyenExpress,
            sauNhiLieuVAT: sauNhiLieuVATExpress,
            phuPhiXangVAT: phuPhiXangVATExpress,
            tongCuoc: tongExpress
        };
        
        danhSachKetQua.push({
            ten: "VIN-EXPRESS (Chuyển Phát Nhanh)",
            icon: '<i data-lucide="plane"></i>',
            giaCoBan: giaGocExpress,
            phuPhiNgoaiTuyen: phuPhiNgoaiTuyenExpress,
            phuPhiXangVAT: phuPhiXangVATExpress,
            tongCuoc: tongExpress,
            thoiGian: thoiGianGiaoHang["VIN-EXPRESS"][vung],
            disabled: false,
            chiTietQuyTrinh: chiTietQuyTrinhExpress,
            loaiDichVu: 'express'
        });
        
        // 4. VIN-HOATOC
        const chiTietHoaToc = tinhGiaChiTietHoaToc(kgInput, vung);
        const giaGocHoaToc = chiTietHoaToc.giaCoBan;
        // Nhân hệ số 1.3878 (nhiên liệu & VAT) trước - BẮT BUỘC cho tất cả dịch vụ
        const sauNhiLieuVATHoaToc = Math.round(giaGocHoaToc * 1.3878);
        // Nhân hệ số ngoại tuyến sau (nếu ngoại tuyến) - dựa trên TỔNG KG GỐC
        let heSoNgoaiTuyenHoaToc = 1;
        if (loaiTuyen === 'ngoai') {
            if (kgInput <= 100) {
                heSoNgoaiTuyenHoaToc = 1.3; // ≤100kg: +30%
            } else if (kgInput <= 200) {
                heSoNgoaiTuyenHoaToc = 1.2; // 101-200kg: +20%
            } else {
                heSoNgoaiTuyenHoaToc = 1.1; // ≥201kg: +10%
            }
        }
        const tongHoaToc = Math.round(sauNhiLieuVATHoaToc * heSoNgoaiTuyenHoaToc);
        const phuPhiXangVATHoaToc = sauNhiLieuVATHoaToc - giaGocHoaToc;
        const phuPhiNgoaiTuyenHoaToc = loaiTuyen === 'ngoai' ? tongHoaToc - sauNhiLieuVATHoaToc : 0;
        
        const chiTietQuyTrinhHoaToc = {
            ...chiTietHoaToc,
            giaCoBan: giaGocHoaToc,
            phuPhiNgoaiTuyen: phuPhiNgoaiTuyenHoaToc,
            sauNhiLieuVAT: sauNhiLieuVATHoaToc,
            phuPhiXangVAT: phuPhiXangVATHoaToc,
            tongCuoc: tongHoaToc
        };
        
        danhSachKetQua.push({
            ten: "VIN-HOATOC (Hỏa Tốc)",
            icon: '<i data-lucide="zap"></i>',
            giaCoBan: giaGocHoaToc,
            phuPhiNgoaiTuyen: phuPhiNgoaiTuyenHoaToc,
            phuPhiXangVAT: phuPhiXangVATHoaToc,
            tongCuoc: tongHoaToc,
            thoiGian: thoiGianGiaoHang["VIN-HOATOC"][vung],
            disabled: false,
            chiTietQuyTrinh: chiTietQuyTrinhHoaToc,
            loaiDichVu: 'hoatoc'
        });
        
        // Tạo object kết quả đầy đủ
        const ketQua = {
            tinh: duLieuTinh[tinhDaChon].ten,
            huyen: huyen.ten,
            vung: duLieuTinh[tinhDaChon].vungHienThi, // Hiển thị vùng đúng (Nội Tỉnh, Vùng 1-8)
            vungGoc: vung, // Giữ vùng gốc (index 0-8) để tính toán
            tuyen: loaiTuyen === 'noi' ? 'Nội tuyến' : 'Ngoại tuyến',
            trongLuong: kgInput,
            danhSachDichVu: danhSachKetQua,
            chiTietQuyTrinh: chiTietQuyTrinh // Thông tin chi tiết quy trình tính toán
        };
        
        // Hiển thị kết quả
        hienThiKetQuaCuocPhi(ketQua);
        
        // Lưu vào lịch sử
        luuLichSuCuocPhi(ketQua);
    };
    
    // Hiển thị kết quả
    const hienThiKetQuaCuocPhi = (ketQua) => {
        if (!shippingResultDiv) return;
        
        let html = '';
        
        // Header thông tin chung
        html += `
            <div class="result-header">
                <div class="result-title">💰 KẾT QUẢ TÍNH CƯỚC PHÍ</div>
                <div class="result-info">
                    <div class="info-item">
                        <span class="info-label">📍 Điểm đến:</span>
                        <span class="info-value">${ketQua.huyen}, ${ketQua.tinh}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">🗺️ Vùng:</span>
                        <span class="info-value">${ketQua.vung} - ${ketQua.tuyen}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">⚖️ Trọng lượng:</span>
                        <span class="info-value">${ketQua.trongLuong} kg</span>
                    </div>
                </div>
            </div>
        `;
        
        // Hàm helper để render quy trình tính toán cho từng dịch vụ
        const renderQuyTrinhTinhToan = (dichVu, ketQua) => {
            if (!dichVu.chiTietQuyTrinh || dichVu.disabled) return '';
            
            const ct = dichVu.chiTietQuyTrinh;
            let html = '';
            
            if (dichVu.loaiDichVu === 'truck' || dichVu.loaiDichVu === 'eco') {
                // VIN-TRUCK và VIN-ECO
                if (ketQua.trongLuong > 10) {
                    html = `
                        <div class="process-steps">
                            <div class="process-step">
                                <div class="step-number">1</div>
                                <div class="step-content">
                                    <div class="step-label">Xác định vùng và tuyến:</div>
                                    <div class="step-value">${ketQua.huyen}, ${ketQua.tinh} → <strong>${ketQua.vung}</strong> - <strong>${ketQua.tuyen}</strong></div>
                                </div>
                            </div>
                            <div class="process-step">
                                <div class="step-number">2</div>
                                <div class="step-content">
                                    <div class="step-label">Trừ 10kg đầu tiên:</div>
                                    <div class="step-value">Tổng trọng lượng: <strong>${ketQua.trongLuong} kg</strong> - 10 kg = <strong>${ct.wDu} kg</strong> (số kg còn lại)</div>
                                </div>
                            </div>
                            <div class="process-step">
                                <div class="step-number">3</div>
                                <div class="step-content">
                                    <div class="step-label">Giá 10kg đầu tiên:</div>
                                    <div class="step-value"><strong>${formatTien(ct.gia10kgDau)}</strong> (theo bảng giá ${ketQua.vung})</div>
                                </div>
                            </div>
                            <div class="process-step">
                                <div class="step-number">4</div>
                                <div class="step-content">
                                    <div class="step-label">Xác định khung giá cho ${ct.wDu} kg còn lại:</div>
                                    <div class="step-value">Khung: <strong>${ct.khungGiaTen}</strong> → Đơn giá: <strong>${formatTien(ct.donGiaKhung)}/kg</strong></div>
                                </div>
                            </div>
                            <div class="process-step">
                                <div class="step-number">5</div>
                                <div class="step-content">
                                    <div class="step-label">Tính tiền phần dư:</div>
                                    <div class="step-value">${ct.wDu} kg × ${formatTien(ct.donGiaKhung)} = <strong>${formatTien(ct.tienPhanDu)}</strong></div>
                                </div>
                            </div>
                            <div class="process-step">
                                <div class="step-number">6</div>
                                <div class="step-content">
                                    <div class="step-label">Tính giá gốc:</div>
                                    <div class="step-value">${formatTien(ct.gia10kgDau)} + ${formatTien(ct.tienPhanDu)} = <strong>${formatTien(ct.giaGoc)}</strong></div>
                                </div>
                            </div>
                            <div class="process-step">
                                <div class="step-number">7</div>
                                <div class="step-content">
                                    <div class="step-label">Nhân hệ số nhiên liệu & VAT (× 1.3878):</div>
                                    <div class="step-value">${formatTien(ct.giaGoc)} × 1.3878 = <strong>${formatTien(ct.sauNhiLieuVAT)}</strong></div>
                                </div>
                            </div>
                            ${ketQua.tuyen === 'Ngoại tuyến' ? (() => {
                                // Xác định hệ số ngoại tuyến dựa trên tổng kg gốc
                                let heSoNgoaiTuyen = 1;
                                let heSoNgoaiTuyenText = '';
                                if (ketQua.trongLuong <= 100) {
                                    heSoNgoaiTuyen = 1.3;
                                    heSoNgoaiTuyenText = '1.3 (≤100kg: +30%)';
                                } else if (ketQua.trongLuong <= 200) {
                                    heSoNgoaiTuyen = 1.2;
                                    heSoNgoaiTuyenText = '1.2 (101-200kg: +20%)';
                                } else {
                                    heSoNgoaiTuyen = 1.1;
                                    heSoNgoaiTuyenText = '1.1 (≥201kg: +10%)';
                                }
                                return `
                            <div class="process-step">
                                <div class="step-number">8</div>
                                <div class="step-content">
                                    <div class="step-label">Nhân hệ số ngoại tuyến (× ${heSoNgoaiTuyenText}):</div>
                                    <div class="step-value">Tổng kg gốc: <strong>${ketQua.trongLuong} kg</strong> → ${formatTien(ct.sauNhiLieuVAT)} × ${heSoNgoaiTuyen} = <strong>${formatTien(ct.tongCuoc)}</strong></div>
                                </div>
                            </div>
                            `;
                            })() : `
                            <div class="process-step">
                                <div class="step-number">8</div>
                                <div class="step-content">
                                    <div class="step-label">Nội tuyến (không nhân hệ số ngoại tuyến):</div>
                                    <div class="step-value">Tổng cước = <strong>${formatTien(ct.tongCuoc)}</strong></div>
                                </div>
                            </div>
                            `}
                        </div>
                    `;
                } else {
                    html = `
                        <div class="process-steps">
                            <div class="process-step">
                                <div class="step-number">1</div>
                                <div class="step-content">
                                    <div class="step-label">Xác định vùng và tuyến:</div>
                                    <div class="step-value">${ketQua.huyen}, ${ketQua.tinh} → <strong>${ketQua.vung}</strong> - <strong>${ketQua.tuyen}</strong></div>
                                </div>
                            </div>
                            <div class="process-step">
                                <div class="step-number">2</div>
                                <div class="step-content">
                                    <div class="step-label">Trọng lượng ≤ 10kg:</div>
                                    <div class="step-value">Áp dụng giá trọn gói 10kg đầu: <strong>${formatTien(ct.gia10kgDau)}</strong></div>
                                </div>
                            </div>
                            <div class="process-step">
                                <div class="step-number">3</div>
                                <div class="step-content">
                                    <div class="step-label">Nhân hệ số nhiên liệu & VAT (× 1.3878):</div>
                                    <div class="step-value">${formatTien(ct.gia10kgDau)} × 1.3878 = <strong>${formatTien(ct.sauNhiLieuVAT)}</strong></div>
                                </div>
                            </div>
                            ${ketQua.tuyen === 'Ngoại tuyến' ? (() => {
                                // Xác định hệ số ngoại tuyến dựa trên tổng kg gốc
                                let heSoNgoaiTuyen = 1;
                                let heSoNgoaiTuyenText = '';
                                if (ketQua.trongLuong <= 100) {
                                    heSoNgoaiTuyen = 1.3;
                                    heSoNgoaiTuyenText = '1.3 (≤100kg: +30%)';
                                } else if (ketQua.trongLuong <= 200) {
                                    heSoNgoaiTuyen = 1.2;
                                    heSoNgoaiTuyenText = '1.2 (101-200kg: +20%)';
                                } else {
                                    heSoNgoaiTuyen = 1.1;
                                    heSoNgoaiTuyenText = '1.1 (≥201kg: +10%)';
                                }
                                return `
                            <div class="process-step">
                                <div class="step-number">4</div>
                                <div class="step-content">
                                    <div class="step-label">Nhân hệ số ngoại tuyến (× ${heSoNgoaiTuyenText}):</div>
                                    <div class="step-value">Tổng kg gốc: <strong>${ketQua.trongLuong} kg</strong> → ${formatTien(ct.sauNhiLieuVAT)} × ${heSoNgoaiTuyen} = <strong>${formatTien(ct.tongCuoc)}</strong></div>
                                </div>
                            </div>
                            `;
                            })() : `
                            <div class="process-step">
                                <div class="step-number">4</div>
                                <div class="step-content">
                                    <div class="step-label">Nội tuyến (không nhân hệ số ngoại tuyến):</div>
                                    <div class="step-value">Tổng cước = <strong>${formatTien(ct.tongCuoc)}</strong></div>
                                </div>
                            </div>
                            `}
                        </div>
                    `;
                }
            } else if (dichVu.loaiDichVu === 'express' || dichVu.loaiDichVu === 'hoatoc') {
                // VIN-EXPRESS và VIN-HOATOC
                // Xác định hệ số ngoại tuyến dựa trên tổng kg gốc
                let heSoNgoaiTuyen = 1;
                let heSoNgoaiTuyenText = '';
                if (ketQua.tuyen === 'Ngoại tuyến') {
                    if (ketQua.trongLuong <= 100) {
                        heSoNgoaiTuyen = 1.3;
                        heSoNgoaiTuyenText = '1.3 (≤100kg: +30%)';
                    } else if (ketQua.trongLuong <= 200) {
                        heSoNgoaiTuyen = 1.2;
                        heSoNgoaiTuyenText = '1.2 (101-200kg: +20%)';
                    } else {
                        heSoNgoaiTuyen = 1.1;
                        heSoNgoaiTuyenText = '1.1 (≥201kg: +10%)';
                    }
                }
                
                html = `
                    <div class="process-steps">
                        <div class="process-step">
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <div class="step-label">Xác định vùng và tuyến:</div>
                                <div class="step-value">${ketQua.huyen}, ${ketQua.tinh} → <strong>${ketQua.vung}</strong> - <strong>${ketQua.tuyen}</strong></div>
                            </div>
                        </div>
                        <div class="process-step">
                            <div class="step-number">2</div>
                            <div class="step-content">
                                <div class="step-label">Tính giá cơ sở:</div>
                                <div class="step-value">${ct.buoc1}</div>
                            </div>
                        </div>
                        ${ct.buoc2 ? `
                        <div class="process-step">
                            <div class="step-number">3</div>
                            <div class="step-content">
                                <div class="step-label">Tính phần vượt:</div>
                                <div class="step-value">${ct.buoc2}</div>
                            </div>
                        </div>
                        <div class="process-step">
                            <div class="step-number">4</div>
                            <div class="step-content">
                                <div class="step-label">Tổng giá cơ sở:</div>
                                <div class="step-value"><strong>${formatTien(ct.giaCoBan)}</strong></div>
                            </div>
                        </div>
                        <div class="process-step">
                            <div class="step-number">5</div>
                            <div class="step-content">
                                <div class="step-label">Nhân hệ số nhiên liệu & VAT (× 1.3878):</div>
                                <div class="step-value">${formatTien(ct.giaCoBan)} × 1.3878 = <strong>${formatTien(ct.sauNhiLieuVAT)}</strong></div>
                            </div>
                        </div>
                        ${ketQua.tuyen === 'Ngoại tuyến' ? `
                        <div class="process-step">
                            <div class="step-number">6</div>
                            <div class="step-content">
                                <div class="step-label">Nhân hệ số ngoại tuyến (× ${heSoNgoaiTuyenText}):</div>
                                <div class="step-value">Tổng kg gốc: <strong>${ketQua.trongLuong} kg</strong> → ${formatTien(ct.sauNhiLieuVAT)} × ${heSoNgoaiTuyen} = <strong>${formatTien(ct.tongCuoc)}</strong></div>
                            </div>
                        </div>
                        ` : `
                        <div class="process-step">
                            <div class="step-number">6</div>
                            <div class="step-content">
                                <div class="step-label">Nội tuyến (không nhân hệ số ngoại tuyến):</div>
                                <div class="step-value">Tổng cước = <strong>${formatTien(ct.tongCuoc)}</strong></div>
                            </div>
                        </div>
                        `}
                        ` : `
                        <div class="process-step">
                            <div class="step-number">3</div>
                            <div class="step-content">
                                <div class="step-label">Giá cơ sở:</div>
                                <div class="step-value"><strong>${formatTien(ct.giaCoBan)}</strong></div>
                            </div>
                        </div>
                        <div class="process-step">
                            <div class="step-number">4</div>
                            <div class="step-content">
                                <div class="step-label">Nhân hệ số nhiên liệu & VAT (× 1.3878):</div>
                                <div class="step-value">${formatTien(ct.giaCoBan)} × 1.3878 = <strong>${formatTien(ct.sauNhiLieuVAT)}</strong></div>
                            </div>
                        </div>
                        ${ketQua.tuyen === 'Ngoại tuyến' ? `
                        <div class="process-step">
                            <div class="step-number">5</div>
                            <div class="step-content">
                                <div class="step-label">Nhân hệ số ngoại tuyến (× ${heSoNgoaiTuyenText}):</div>
                                <div class="step-value">Tổng kg gốc: <strong>${ketQua.trongLuong} kg</strong> → ${formatTien(ct.sauNhiLieuVAT)} × ${heSoNgoaiTuyen} = <strong>${formatTien(ct.tongCuoc)}</strong></div>
                            </div>
                        </div>
                        ` : `
                        <div class="process-step">
                            <div class="step-number">5</div>
                            <div class="step-content">
                                <div class="step-label">Nội tuyến (không nhân hệ số ngoại tuyến):</div>
                                <div class="step-value">Tổng cước = <strong>${formatTien(ct.tongCuoc)}</strong></div>
                            </div>
                        </div>
                        `}
                        `}
                    </div>
                `;
            }
            
            return html || '';
        };
        
        // Quy trình sẽ hiển thị khi click vào service card (không hiển thị tự động)
        
        // Chi tiết từng dịch vụ
        html += '<div class="services-container">';
        
        ketQua.danhSachDichVu.forEach((dichVu, index) => {
            const isDisabled = dichVu.disabled === true;
            const hasQuyTrinh = !isDisabled && dichVu.chiTietQuyTrinh;
            html += `
                <div class="service-card ${isDisabled ? 'service-disabled' : ''} ${hasQuyTrinh ? 'service-clickable' : ''}" 
                     data-service-index="${index}" 
                     style="animation-delay: ${index * 0.1}s">
                    <div class="service-header">
                        <span class="service-icon">${dichVu.icon}</span>
                        <span class="service-name">${dichVu.ten}</span>
                        ${hasQuyTrinh ? '<span class="toggle-icon">▼</span>' : ''}
                    </div>
                    <div class="service-body">
                        ${isDisabled ? `
                        <div class="service-disabled-notice">
                            <div class="disabled-icon">🚫</div>
                            <div class="disabled-text">Không áp dụng</div>
                            <div class="disabled-reason">${dichVu.lyDo}</div>
                        </div>
                        ` : `
                        <div class="price-breakdown">
                            <div class="breakdown-title">💵 CHI TIẾT GIÁ:</div>
                            <div class="breakdown-item">
                                <span class="breakdown-label">• Giá cơ sở:</span>
                                <span class="breakdown-value">${formatTien(dichVu.giaCoBan)}</span>
                            </div>
                            ${dichVu.phuPhiNgoaiTuyen > 0 ? `
                            <div class="breakdown-item surcharge">
                                <span class="breakdown-label">• Phụ phí vùng xa:</span>
                                <span class="breakdown-value">+${formatTien(dichVu.phuPhiNgoaiTuyen)}</span>
                            </div>` : ''}
                            <div class="breakdown-item">
                                <span class="breakdown-label">• Phụ phí xăng dầu & VAT (+20%):</span>
                                <span class="breakdown-value">+${formatTien(dichVu.phuPhiXangVAT)}</span>
                            </div>
                            <div class="breakdown-separator"></div>
                            <div class="breakdown-item total">
                                <span class="breakdown-label">• TỔNG CƯỚC:</span>
                                <span class="breakdown-value">${formatTien(dichVu.tongCuoc)}</span>
                            </div>
                        </div>
                        <div class="service-time">
                            <span class="time-icon">⏱️</span>
                            <span class="time-text">Thời gian: ${dichVu.thoiGian}</span>
                        </div>
                        ${hasQuyTrinh ? `
                        <div class="process-toggle-hint">
                            <span class="hint-icon">👆</span>
                            <span class="hint-text">Nhấp vào đây để xem quy trình tính toán chi tiết</span>
                        </div>
                        ` : ''}
                        `}
                    </div>
                    ${hasQuyTrinh ? `
                    <div class="calculation-process-detail" style="display: none;">
                        <div class="process-title">📋 QUY TRÌNH TÍNH TOÁN CHI TIẾT - ${dichVu.ten}</div>
                        ${renderQuyTrinhTinhToan(dichVu, ketQua)}
                    </div>
                    ` : ''}
                </div>
            `;
        });
        
        html += '</div>';
        
        // Bảng so sánh
        html += `
            <div class="comparison-section">
                <div class="comparison-title">📊 BẢNG SO SÁNH DỊCH VỤ</div>
                <div class="comparison-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Dịch vụ</th>
                                <th>Tổng cước</th>
                                <th>Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        ketQua.danhSachDichVu.forEach(dichVu => {
            const isDisabled = dichVu.disabled === true;
            // Tên đầy đủ cho bảng so sánh: Tiếng Anh - Tiếng Việt
            let tenHienThi = dichVu.ten;
            if (dichVu.ten.includes("VIN-TRUCK")) tenHienThi = "VIN-TRUCK - Đường Bộ";
            else if (dichVu.ten.includes("VIN-ECO")) tenHienThi = "VIN-ECO - Tiết Kiệm";
            else if (dichVu.ten.includes("VIN-EXPRESS")) tenHienThi = "VIN-EXPRESS - Nhanh";
            else if (dichVu.ten.includes("VIN-HOATOC")) tenHienThi = "VIN-HOATOC - Hỏa Tốc";
            
            html += `
                <tr class="${isDisabled ? 'row-disabled' : ''}">
                    <td><span class="table-icon">${dichVu.icon}</span> ${tenHienThi}</td>
                    <td class="price-cell">${isDisabled ? 'Không áp dụng' : formatTien(dichVu.tongCuoc)}</td>
                    <td>${isDisabled ? dichVu.lyDo : dichVu.thoiGian}</td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        shippingResultDiv.innerHTML = html;
        shippingResultDiv.scrollTop = 0;
        
        // Khởi tạo Lucide icons sau khi render HTML động
        if (typeof lucide !== 'undefined') lucide.createIcons();
        
        // Thêm event listener cho các service card có thể click
        const serviceCards = shippingResultDiv.querySelectorAll('.service-clickable');
        serviceCards.forEach(card => {
            card.addEventListener('click', function(e) {
                // Không toggle nếu click vào các phần tử con (button, input, etc.)
                if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
                
                const detailDiv = this.querySelector('.calculation-process-detail');
                const toggleIcon = this.querySelector('.toggle-icon');
                
                if (detailDiv) {
                    const isHidden = detailDiv.style.display === 'none';
                    detailDiv.style.display = isHidden ? 'block' : 'none';
                    if (toggleIcon) {
                        toggleIcon.textContent = isHidden ? '▲' : '▼';
                    }
                    this.classList.toggle('process-expanded', isHidden);
                }
            });
        });
    };
    
    // Lưu vào lịch sử
    const luuLichSuCuocPhi = (ketQua) => {
        const historyEntry = {
            type: 'shipping',
            timestamp: new Date().toLocaleString('vi-VN'),
            data: ketQua
        };
        addToHistory(historyEntry);
    };
    
    // Reset form
    const resetFormCuocPhi = () => {
        if (shippingTinhSelect) shippingTinhSelect.value = '';
        if (shippingHuyenSelect) {
            shippingHuyenSelect.innerHTML = '<option value="">-- Vui lòng chọn Tỉnh trước --</option>';
            shippingHuyenSelect.disabled = true;
        }
        if (shippingWeightInput) shippingWeightInput.value = '';
        if (shippingResultDiv) {
            shippingResultDiv.innerHTML = '<div class="result-message">📦 Vui lòng điền đầy đủ thông tin và nhấn "Tính Cước Phí" để xem kết quả.</div>';
        }
        if (shippingTinhSelect) shippingTinhSelect.focus();
    };
    
    // Khởi tạo Shipping Calculator
    const khoiTaoCuocPhi = () => {
        khoiTaoDropdownTinh();
        
        if (shippingTinhSelect) {
            shippingTinhSelect.addEventListener('change', capNhatDropdownHuyen);
        }
        
        if (btnCalculateShipping) {
            btnCalculateShipping.addEventListener('click', tinhToanCuocPhi);
        }
        
        if (btnResetShipping) {
            btnResetShipping.addEventListener('click', resetFormCuocPhi);
        }
        
        // Cho phép Enter để tính toán
        if (shippingWeightInput) {
            shippingWeightInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') tinhToanCuocPhi();
            });
        }
        
        // Xử lý scroll để ẩn/hiện form
        const shippingForm = $('.shipping-form');
        const shippingCalculatorTab = $('#shipping-calculator');
        const shippingResultDiv = $('#shipping-result');
        
        if (shippingForm && shippingCalculatorTab && shippingResultDiv) {
            let lastScrollTop = 0;
            const scrollThresholdHide = 100; // Ngưỡng scroll để ẩn form (px)
            const scrollThresholdShow = 30; // Ngưỡng scroll để hiện form (px) - nhỏ hơn để tránh flickering
            let isHidden = false;
            let scrollTimeout = null;
            let rafId = null;
            
            const handleShippingScroll = () => {
                // Chỉ xử lý khi tab shipping-calculator đang active
                if (!shippingCalculatorTab.classList.contains('active')) {
                    return;
                }
                
                // Hủy requestAnimationFrame trước đó nếu có
                if (rafId) {
                    cancelAnimationFrame(rafId);
                }
                
                // Sử dụng requestAnimationFrame để tối ưu performance
                rafId = requestAnimationFrame(() => {
                    // Lấy scroll position từ container hoặc window
                    let currentScrollTop = 0;
                    const tabScrollTop = shippingCalculatorTab.scrollTop;
                    const resultScrollTop = shippingResultDiv.scrollTop;
                    const windowScrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    
                    // Ưu tiên scroll của result div, sau đó là tab, cuối cùng là window
                    if (resultScrollTop > 0) {
                        currentScrollTop = resultScrollTop;
                    } else if (tabScrollTop > 0) {
                        currentScrollTop = tabScrollTop;
                    } else {
                        currentScrollTop = windowScrollTop;
                    }
                    
                    // Kiểm tra nếu có kết quả (không phải message mặc định)
                    const hasResults = shippingResultDiv.querySelector('.result-header') !== null;
                    
                    if (!hasResults) {
                        // Nếu chưa có kết quả, luôn hiện form
                        if (isHidden) {
                            shippingForm.classList.remove('hidden-on-scroll');
                            isHidden = false;
                        }
                        lastScrollTop = currentScrollTop;
                        return;
                    }
                    
                    // Tính toán hướng scroll
                    const scrollDelta = currentScrollTop - lastScrollTop;
                    
                    // Chỉ xử lý nếu scroll đủ lớn (tránh giật khi scroll nhỏ)
                    if (Math.abs(scrollDelta) > 3) {
                        if (scrollDelta > 0) {
                            // Cuộn xuống
                            if (currentScrollTop > scrollThresholdHide && !isHidden) {
                                shippingForm.classList.add('hidden-on-scroll');
                                isHidden = true;
                            }
                        } else {
                            // Cuộn lên
                            if (currentScrollTop <= scrollThresholdShow && isHidden) {
                                shippingForm.classList.remove('hidden-on-scroll');
                                isHidden = false;
                            }
                        }
                        
                        lastScrollTop = currentScrollTop;
                    }
                });
            };
            
            // Lắng nghe scroll trên shipping-result (kết quả) - chỉ một listener
            shippingResultDiv.addEventListener('scroll', handleShippingScroll, { passive: true });
            
            // Hiện lại form khi tab được kích hoạt
            const observer = new MutationObserver(() => {
                if (shippingCalculatorTab.classList.contains('active')) {
                    // Reset scroll state khi tab được kích hoạt
                    shippingForm.classList.remove('hidden-on-scroll');
                    isHidden = false;
                    lastScrollTop = 0;
                }
            });
            
            observer.observe(shippingCalculatorTab, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
    };

    // --- EVENT LISTENERS ---
    // Hamburger menu - Click to open menu
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            openSlideMenu();
        });
    }
    
    // Click anywhere on screen to show hamburger and restart timer
    document.addEventListener('click', (e) => {
        if (hamburgerMenu && !slideMenu.classList.contains('open')) {
            showHamburger();
        }
    });
    
    // Touch/move events to show hamburger
    document.addEventListener('touchstart', () => {
        if (hamburgerMenu && !slideMenu.classList.contains('open')) {
            showHamburger();
        }
    });
    
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', closeSlideMenu);
    }
    if (menuOverlay) {
        menuOverlay.addEventListener('click', closeSlideMenu);
    }
    slideMenuItems.forEach(item => {
        item.addEventListener('click', () => handleSlideMenuItemClick(item.dataset.tab));
    });
    
    // Sidebar navigation
    sidebarNavItems.forEach(item => {
        item.addEventListener('click', () => switchTab(item.dataset.tab));
    });
    
    // Bottom navigation
    bottomNavItems.forEach(item => {
        item.addEventListener('click', () => switchTab(item.dataset.tab));
    });
    cbmInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') handleCBMInput(); });
    btnBack1.addEventListener('click', handleBack1);
    btnBack2.addEventListener('click', handleBack2);
    btnReset.addEventListener('click', handleReset);
    
    // --- HISTORY EVENT LISTENERS ---
    clearHistoryBtn.addEventListener('click', () => {
        showClearHistoryOptions();
    });
    
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderHistory();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderHistory();
        }
    });
    
    searchHistoryInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            searchByDate();
        }
    });
    
    clearSearchBtn.addEventListener('click', () => {
        searchHistoryInput.value = '';
        currentPage = 1;
        renderHistory();
    });
    
    provinceInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') checkProvince(); });
    btnClearProvince.addEventListener('click', clearProvinceResults);
    
    // --- HISTORY HELPER FUNCTIONS ---
    const showClearHistoryOptions = () => {
        const options = ['Xóa tất cả', 'Xóa theo tháng', 'Hủy'];
        const choice = prompt('Chọn phương thức xóa:\n1. Xóa tất cả\n2. Xóa theo tháng\n3. Hủy\n\nNhập số (1-3):');
        
        if (choice === '1') {
            if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử tính toán?')) {
                history = [];
                completedGroups = [];
                currentPage = 1;
                saveState();
                renderHistory();
                alert('Đã xóa toàn bộ lịch sử');
            }
        } else if (choice === '2') {
            showMonthSelectionDialog();
        }
    };
    
    const showMonthSelectionDialog = () => {
        if (history.length === 0) {
            alert('Lịch sử trống');
            return;
        }
        
        const months = getMonthsFromHistory();
        if (months.length === 0) {
            alert('Không tìm thấy tháng nào');
            return;
        }
        
        let monthList = 'Chọn tháng để xóa:\n';
        months.forEach((month, index) => {
            monthList += `${index + 1}. ${month}\n`;
        });
        monthList += `${months.length + 1}. Hủy\n\nNhập số:`;
        
        const choice = prompt(monthList);
        const choiceIndex = parseInt(choice) - 1;
        
        if (choiceIndex >= 0 && choiceIndex < months.length) {
            const selectedMonth = months[choiceIndex];
            if (confirm(`Bạn có chắc chắn muốn xóa toàn bộ lịch sử của tháng ${selectedMonth}?`)) {
                deleteMonthHistory(selectedMonth);
            }
        }
    };
    
    const getMonthsFromHistory = () => {
        const months = new Set();
        history.forEach(entry => {
            let timestamp = '';
            if (typeof entry === 'string') {
                const match = entry.match(/\[(\d{1,2}\/\d{1,2}\/\d{4})/); 
                if (match) timestamp = match[1];
            } else if (entry.timestamp) {
                timestamp = entry.timestamp;
            }
            
            if (timestamp) {
                try {
                    const parts = timestamp.split(/[\/\s:,]/);
                    if (parts.length >= 3) {
                        const monthYear = `${parts[1]}/${parts[2]}`; // MM/YYYY
                        months.add(monthYear);
                    }
                } catch (e) {}
            }
        });
        return Array.from(months).sort();
    };
    
    const deleteMonthHistory = (monthYear) => {
        history = history.filter(entry => {
            let timestamp = '';
            if (typeof entry === 'string') {
                const match = entry.match(/\[(\d{1,2}\/\d{1,2}\/\d{4})/); 
                if (match) timestamp = match[1];
            } else if (entry.timestamp) {
                timestamp = entry.timestamp;
            }
            
            if (timestamp) {
                try {
                    const parts = timestamp.split(/[\/\s:,]/);
                    if (parts.length >= 3) {
                        const entryMonthYear = `${parts[1]}/${parts[2]}`;
                        return entryMonthYear !== monthYear;
                    }
                } catch (e) {}
            }
            return true;
        });
        
        currentPage = 1;
        saveState();
        renderHistory();
        alert(`Đã xóa lịch sử tháng ${monthYear}`);
    };
    
    const searchByDate = () => {
        const searchDate = sanitizeInput(searchHistoryInput.value).trim();
        if (!searchDate) {
            alert('Vui lòng nhập ngày tìm kiếm (dd/MM/yyyy)');
            return;
        }
        
        if (history.length === 0) {
            alert('Lịch sử trống');
            return;
        }
        
        // Tìm vị trí đầu tiên chứa ngày
        let foundIndex = -1;
        for (let i = 0; i < history.length; i++) {
            const formattedEntry = formatHistoryEntry(history[i]);
            if (formattedEntry.includes(`[${searchDate}`)) {
                foundIndex = i;
                break;
            }
        }
        
        if (foundIndex !== -1) {
            const targetPage = Math.floor(foundIndex / itemsPerPage) + 1;
            currentPage = targetPage;
            renderHistory();
            alert(`Đã tìm thấy kiện ngày ${searchDate} (trang ${targetPage})`);
        } else {
            alert(`Không tìm thấy kiện nào vào ngày ${searchDate}`);
        }
    };

    // --- SETTINGS EVENT LISTENERS ---
    // Theme toggle button
    const themeToggle = $('#theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Theme buttons in settings
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            applyTheme(theme);
            updateThemeButtons(theme);
            saveSettings();
        });
    });
    
    // Size buttons
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const size = btn.getAttribute('data-size');
            applySize(size);
            updateSizeButtons(size);
            saveSettings();
        });
    });
    
    // Tab font size buttons
    document.querySelectorAll('.font-size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const size = btn.getAttribute('data-size');
            applyTabFontSize(size);
            updateTabFontSizeButtons(size);
            localStorage.setItem('vinTransCBMTabSize', size);
        });
    });
    
    // Animations toggle
    const animationsToggle = $('#animations-toggle');
    if (animationsToggle) {
        animationsToggle.addEventListener('change', () => {
            applyAnimations(animationsToggle.checked);
            saveSettings();
        });
    }
    
    // Reset settings button
    const resetSettingsBtn = $('#reset-settings-btn');
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', resetSettings);
    }
    
    // --- HÀNG BONG BÓNG CÁ ---
    // Hằng số cho hàng Bong Bóng Cá
    const BBC_KG_MOT_KIEN = 16.4;      // kg quy đổi mỗi kiện
    const BBC_DON_GIA = 31000;          // đ/kg
    const BBC_HE_SO_PHU_PHI = 1.285;   // hệ số phụ phí
    const BBC_HE_SO_VAT = 1.08;        // hệ số VAT

    // Hàm định dạng số tiền
    const formatTienBBC = (so) => {
        return Math.round(so).toLocaleString('vi-VN') + ' đ';
    };

    // Hàm tính và hiển thị kết quả Bong Bóng Cá
    const tinhBongBongCa = () => {
        const bbcSoKienInput = $('#bbc-so-kien');
        const bbcResultDiv = $('#bbc-result');
        if (!bbcSoKienInput || !bbcResultDiv) return;

        const soKienRaw = sanitizeNumber(bbcSoKienInput.value);
        const soKien = parseFloat(soKienRaw);

        // Validate
        if (!soKienRaw || isNaN(soKien) || soKien <= 0) {
            bbcResultDiv.innerHTML = '<div class="bbc-error"><i data-lucide="alert-circle"></i> Vui lòng nhập số kiện hợp lệ (lớn hơn 0).</div>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }

        // Tính từng bước
        const soKgQuyDoi = soKien * BBC_KG_MOT_KIEN;
        const tienTruocHeSo = soKgQuyDoi * BBC_DON_GIA;
        const tienSauPhuPhi = tienTruocHeSo * BBC_HE_SO_PHU_PHI;
        const tongTien = tienSauPhuPhi * BBC_HE_SO_VAT;

        const html = `
            <div class="bbc-result-content">
                <div class="bbc-result-title">
                    <i data-lucide="check-circle"></i>
                    KẾT QUẢ TÍNH TIỀN
                </div>

                <div class="bbc-summary-box">
                    <div class="bbc-summary-label">Số kiện hàng</div>
                    <div class="bbc-summary-value highlight">${soKien.toLocaleString('vi-VN')} kiện</div>
                </div>

                <div class="bbc-steps">
                    <div class="bbc-step">
                        <div class="bbc-step-num">1</div>
                        <div class="bbc-step-body">
                            <div class="bbc-step-label">Tính kg quy đổi:</div>
                            <div class="bbc-step-formula">${soKien.toLocaleString('vi-VN')} kiện × ${BBC_KG_MOT_KIEN} kg/kiện</div>
                            <div class="bbc-step-result">= <strong>${soKgQuyDoi.toLocaleString('vi-VN')} kg</strong></div>
                        </div>
                    </div>
                    <div class="bbc-step">
                        <div class="bbc-step-num">2</div>
                        <div class="bbc-step-body">
                            <div class="bbc-step-label">Tính tiền gốc:</div>
                            <div class="bbc-step-formula">${soKgQuyDoi.toLocaleString('vi-VN')} kg × ${BBC_DON_GIA.toLocaleString('vi-VN')} đ/kg</div>
                            <div class="bbc-step-result">= <strong>${formatTienBBC(tienTruocHeSo)}</strong></div>
                        </div>
                    </div>
                    <div class="bbc-step">
                        <div class="bbc-step-num">3</div>
                        <div class="bbc-step-body">
                            <div class="bbc-step-label">Nhân hệ số phụ phí (× ${BBC_HE_SO_PHU_PHI}):</div>
                            <div class="bbc-step-formula">${formatTienBBC(tienTruocHeSo)} × ${BBC_HE_SO_PHU_PHI}</div>
                            <div class="bbc-step-result">= <strong>${formatTienBBC(tienSauPhuPhi)}</strong></div>
                        </div>
                    </div>
                    <div class="bbc-step">
                        <div class="bbc-step-num">4</div>
                        <div class="bbc-step-body">
                            <div class="bbc-step-label">Nhân hệ số VAT (× ${BBC_HE_SO_VAT}):</div>
                            <div class="bbc-step-formula">${formatTienBBC(tienSauPhuPhi)} × ${BBC_HE_SO_VAT}</div>
                            <div class="bbc-step-result">= <strong>${formatTienBBC(tongTien)}</strong></div>
                        </div>
                    </div>
                </div>

                <div class="bbc-total-box">
                    <div class="bbc-total-label">💰 TỔNG TIỀN CẦN THANH TOÁN</div>
                    <div class="bbc-total-value">${formatTienBBC(tongTien)}</div>
                    <div class="bbc-total-note">= (${soKgQuyDoi.toLocaleString('vi-VN')} kg × ${BBC_DON_GIA.toLocaleString('vi-VN')}) × ${BBC_HE_SO_PHU_PHI} × ${BBC_HE_SO_VAT}</div>
                </div>
            </div>
        `;

        bbcResultDiv.innerHTML = html;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        bbcResultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    // Reset form Bong Bóng Cá
    const resetBongBongCa = () => {
        const bbcSoKienInput = $('#bbc-so-kien');
        const bbcResultDiv = $('#bbc-result');
        if (bbcSoKienInput) bbcSoKienInput.value = '';
        if (bbcResultDiv) {
            bbcResultDiv.innerHTML = `
                <div class="bbc-result-empty">
                    <i data-lucide="fish"></i>
                    <p>Nhập số kiện và nhấn "Tính Tiền" để xem kết quả</p>
                </div>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
        if (bbcSoKienInput) bbcSoKienInput.focus();
    };

    // Khởi tạo nút sub-tab navigation
    const khoiTaoSubTab = () => {
        const subTabBtns = document.querySelectorAll('.sub-tab-btn');
        const subTabContents = document.querySelectorAll('.sub-tab-content');

        subTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetSubTab = btn.dataset.subTab;

                // Cập nhật trạng thái nút
                subTabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Cập nhật nội dung hiển thị
                subTabContents.forEach(content => content.classList.remove('active'));
                const targetContent = $(`#sub-tab-${targetSubTab}`);
                if (targetContent) targetContent.classList.add('active');

                if (typeof lucide !== 'undefined') lucide.createIcons();
            });
        });

        // Gắn nút Tính Tiền Bong Bóng Cá
        const btnTinhBBC = $('#btn-tinh-bbc');
        const btnResetBBC = $('#btn-reset-bbc');
        const bbcSoKienInput = $('#bbc-so-kien');

        if (btnTinhBBC) btnTinhBBC.addEventListener('click', tinhBongBongCa);
        if (btnResetBBC) btnResetBBC.addEventListener('click', resetBongBongCa);
        if (bbcSoKienInput) {
            bbcSoKienInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') tinhBongBongCa();
            });
        }
    };

    // --- INIT ---
    loadSettings(); // Load theme and settings first
    renderCBM();
    renderHistory();
    khoiTaoCuocPhi(); // Khởi tạo Shipping Calculator
    khoiTaoSubTab();  // Khởi tạo Sub-tab và Bong Bóng Cá

    // Khởi tạo tất cả Lucide icons trong HTML tĩnh
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Start with hamburger hidden
    if (hamburgerMenu) {
        hamburgerMenu.classList.add('hidden');
    }

    cbmInput.focus();
});
