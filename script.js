document.addEventListener('DOMContentLoaded', () => {
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    const provinceData = window.VinTransCBMProvinceData;
    const provinceChecker = window.VinTransCBMProvinceChecker;
    const shippingCore = window.ShippingCore;
    const ui = window.VinTransCBMUi;
    const { tenTinhCoDau, duLieuTinh, duLieuHuyen } = provinceData;

    const sidebarNavItems = $$('.nav-item'), bottomNavItems = $$('.bottom-nav-item'), tabContents = $$('.tab-content'), provinceInput = $('#province-input'), provinceSuggestions = $('#province-suggestions'), provinceResultDiv = $('#province-result'), btnClearProvince = $('#btn-clear-province'), themeToggle = $('#theme-toggle'), hamburgerMenu = $('#hamburger-menu'), slideMenu = $('#slide-menu'), menuOverlay = $('#menu-overlay'), closeMenuBtn = $('#close-menu'), slideMenuItems = $$('.slide-menu-item'), shippingTinhSelect = $('#shipping-tinh-select'), shippingHuyenSelect = $('#shipping-huyen-select'), shippingWeightInput = $('#shipping-weight-input'), btnCalculateShipping = $('#btn-calculate-shipping'), btnResetShipping = $('#btn-reset-shipping'), shippingResultDiv = $('#shipping-result'), fishPiecesInput = $('#bbc-so-kien'), fishResultDiv = $('#bbc-result');

    const switchTab = (tabName) => {
        tabContents.forEach(content => content.classList.remove('active'));
        const selectedTab = $(`#${tabName}`);
        if (selectedTab) selectedTab.classList.add('active');
        sidebarNavItems.forEach(item => item.classList.toggle('active', item.dataset.tab === tabName));
        bottomNavItems.forEach(item => item.classList.toggle('active', item.dataset.tab === tabName));
        slideMenuItems.forEach(item => item.classList.toggle('active', item.dataset.tab === tabName));
    };

    const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('vinTransCBMTheme', newTheme);
    };

    const loadSettings = () => {
        const savedTheme = localStorage.getItem('vinTransCBMTheme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    };

    const hienThiKetQuaTinh = (result) => {
        const now = new Date(), timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }), message = provinceResultDiv.querySelector('.province-message');
        if (message) message.remove();
        const item = document.createElement('div');
        item.className = `province-item ${result.resultClass || ''}`;
        item.innerHTML = `<span class="time">[${timeStr}]</span> <span class="name">${result.input}</span> <span class="arrow">→</span> <span class="result">${result.html}</span>`;
        const header = provinceResultDiv.querySelector('.province-header');
        provinceResultDiv.insertBefore(item, header.nextSibling);
        provinceInput.value = '';
        provinceResultDiv.scrollTop = 0;
    };

    const checkProvince = () => {
        const result = provinceChecker.check(provinceInput.value, provinceData);
        if (!result) return;
        hienThiKetQuaTinh(result);
    };

    const parseSelectedDistrict = () => {
        try {
            return JSON.parse(shippingHuyenSelect.value);
        } catch (error) {
            return null;
        }
    };

    const tinhToanCuocPhi = (showAlert = true) => {
        const provinceKey = shippingTinhSelect.value;
        const district = parseSelectedDistrict();
        const weight = parseFloat(shippingWeightInput.value);

        if (!provinceKey || !shippingHuyenSelect.value || !Number.isFinite(weight) || weight <= 0 || !shippingCore) {
            if (showAlert) alert('Vui lòng chọn tỉnh, huyện và nhập trọng lượng hợp lệ!');
            return false;
        }

        if (shippingCore.MAX_WEIGHT_KG && weight > shippingCore.MAX_WEIGHT_KG) {
            if (showAlert) alert(`Trọng lượng không được vượt quá ${shippingCore.MAX_WEIGHT_KG}kg!`);
            return false;
        }

        const province = duLieuTinh[provinceKey];
        if (!province || !district || typeof district.ten !== 'string' || (district.loai !== 'noi' && district.loai !== 'ngoai')) {
            if (showAlert) alert('Dữ liệu tuyến không hợp lệ!');
            return false;
        }

        const isOuter = district.loai === 'ngoai';
        const outerCoeff = shippingCore.calculateOuterCoefficient(isOuter, weight);
        const results = shippingCore.calculateShipping(province.vung, isOuter, weight);
        if (!results.length) {
            if (showAlert) alert('Không thể tính cước với dữ liệu hiện tại!');
            return false;
        }

        shippingResultDiv.innerHTML = ui.renderShippingResult({
            provinceName: province.ten,
            districtName: district.ten,
            routeType: isOuter ? 'Ngoại tuyến' : 'Nội tuyến',
            weight
        }, results, outerCoeff);
        return true;
    };

    const tryAutoCalculate = () => {
        tinhToanCuocPhi(false);
    };

    const capNhatDropdownHuyen = () => {
        const provinceKey = shippingTinhSelect.value;
        shippingHuyenSelect.innerHTML = '<option value="">-- Chọn Quận/Huyện --</option>';
        if (!provinceKey) {
            shippingHuyenSelect.disabled = true;
            return;
        }

        shippingHuyenSelect.disabled = false;
        const districts = duLieuHuyen[provinceKey] || [
            { ten: 'Nội Thành (Mặc định)', loai: 'noi' },
            { ten: 'Ngoại Thành (Mặc định)', loai: 'ngoai' }
        ];
        districts.forEach((district) => {
            const option = document.createElement('option');
            option.value = JSON.stringify(district);
            option.textContent = district.ten;
            shippingHuyenSelect.appendChild(option);
        });
    };

    const tinhBongBongCa = () => {
        const pieces = parseFloat(fishPiecesInput.value);
        if (!Number.isFinite(pieces) || pieces <= 0 || pieces > 100000) return;
        fishResultDiv.innerHTML = ui.renderFishResult(pieces);
    };

    loadSettings();

    Object.keys(duLieuTinh).sort((a, b) => a.localeCompare(b, 'vi')).forEach((provinceKey) => {
        const option = document.createElement('option');
        option.value = provinceKey;
        option.textContent = duLieuTinh[provinceKey].ten;
        shippingTinhSelect.appendChild(option);
    });

    tenTinhCoDau.forEach((provinceName) => {
        const option = document.createElement('option');
        option.value = provinceName;
        provinceSuggestions.appendChild(option);
    });

    switchTab('shipping-calculator');

    hamburgerMenu.addEventListener('click', () => { slideMenu.classList.add('open'); menuOverlay.classList.add('visible'); });
    closeMenuBtn.addEventListener('click', () => { slideMenu.classList.remove('open'); menuOverlay.classList.remove('visible'); });
    menuOverlay.addEventListener('click', () => { slideMenu.classList.remove('open'); menuOverlay.classList.remove('visible'); });
    slideMenuItems.forEach(item => item.addEventListener('click', () => { switchTab(item.dataset.tab); slideMenu.classList.remove('open'); menuOverlay.classList.remove('visible'); }));
    sidebarNavItems.forEach(item => item.addEventListener('click', () => switchTab(item.dataset.tab)));
    bottomNavItems.forEach(item => item.addEventListener('click', () => switchTab(item.dataset.tab)));
    themeToggle.addEventListener('click', toggleTheme);

    provinceInput.addEventListener('keyup', (event) => { if (event.key === 'Enter') checkProvince(); });
    btnClearProvince.addEventListener('click', () => { provinceResultDiv.innerHTML = '<div class="province-header">KIỂM TRA TỈNH THÀNH</div><div class="province-message">Nhập tên tỉnh để kiểm tra loại vận chuyển.</div>'; });

    shippingTinhSelect.addEventListener('change', () => { capNhatDropdownHuyen(); tryAutoCalculate(); });
    shippingHuyenSelect.addEventListener('change', tryAutoCalculate);
    shippingWeightInput.addEventListener('input', tryAutoCalculate);
    shippingWeightInput.addEventListener('keyup', (event) => { if (event.key === 'Enter') tinhToanCuocPhi(true); });
    btnCalculateShipping.addEventListener('click', () => tinhToanCuocPhi(true));
    btnResetShipping.addEventListener('click', () => {
        shippingTinhSelect.value = '';
        capNhatDropdownHuyen();
        shippingWeightInput.value = '';
        shippingResultDiv.innerHTML = ui.shippingEmptyMessage();
    });

    $$('.sub-tab-btn').forEach(btn => { btn.addEventListener('click', () => { $$('.sub-tab-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); $$('.sub-tab-content').forEach(c => c.classList.remove('active')); $(`#sub-tab-${btn.dataset.subTab}`).classList.add('active'); }); });
    $('#btn-tinh-bbc').addEventListener('click', tinhBongBongCa);
    $('#btn-reset-bbc').addEventListener('click', () => { fishPiecesInput.value = ''; fishResultDiv.innerHTML = 'Nhập số kiện và nhấn "TÍNH TIỀN"'; });
    if (typeof lucide !== 'undefined') lucide.createIcons();
});
