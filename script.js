document.addEventListener('DOMContentLoaded', () => {
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    const provinceData = window.VinTransCBMProvinceData;
    const provinceChecker = window.VinTransCBMProvinceChecker;
    const cbmCore = window.CbmCore;
    const shippingCore = window.ShippingCore;
    const ui = window.VinTransCBMUi;
    const { tenTinhCoDau, duLieuTinh, duLieuHuyen } = provinceData;

    const sidebarNavItems = $$('.nav-item'), bottomNavItems = $$('.bottom-nav-item'), tabContents = $$('.tab-content'), topTabNav = $('.top-tab-nav'), navMenuToggle = $('.nav-menu-toggle'), provinceInput = $('#province-input'), provinceSuggestions = $('#province-suggestions'), provinceResultDiv = $('#province-result'), btnClearProvince = $('#btn-clear-province'), shippingTinhSelect = $('#shipping-tinh-select'), shippingHuyenSelect = $('#shipping-huyen-select'), shippingWeightInput = $('#shipping-weight-input'), btnCalculateShipping = $('#btn-calculate-shipping'), btnResetShipping = $('#btn-reset-shipping'), shippingResultDiv = $('#shipping-result'), fishPiecesInput = $('#bbc-so-kien'), fishResultDiv = $('#bbc-result');
    const cbmResultDiv = $('#cbm-result'), cbmEntryForm = $('#cbm-entry-form'), cbmInput = $('#cbm-input'), btnUndoCbm = $('#btn-undo-cbm'), btnClearCbmInput = $('#btn-clear-cbm-input'), btnResetCbm = $('#btn-reset-cbm');
    const cbmStepLabels = ['Dài', 'Rộng', 'Cao', 'Kiện'];
    let cbmGroups = [];
    let cbmNextId = 1;
    let cbmBuffer = [];
    let cbmEditingId = null;
    let shippingAutoCalculateFrame = 0;

    const closeToolMenu = () => {
        if (!topTabNav || !navMenuToggle) return;
        topTabNav.classList.remove('menu-open');
        navMenuToggle.setAttribute('aria-expanded', 'false');
    };

    const toggleToolMenu = () => {
        if (!topTabNav || !navMenuToggle) return;
        const isOpen = topTabNav.classList.toggle('menu-open');
        navMenuToggle.setAttribute('aria-expanded', String(isOpen));
    };

    const switchTab = (tabName) => {
        tabContents.forEach(content => content.classList.remove('active'));
        const selectedTab = $(`#${tabName}`);
        if (selectedTab) selectedTab.classList.add('active');
        sidebarNavItems.forEach(item => item.classList.toggle('active', item.dataset.tab === tabName));
        bottomNavItems.forEach(item => item.classList.toggle('active', item.dataset.tab === tabName));
        closeToolMenu();
    };

    const loadSettings = () => {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('vinTransCBMTheme', 'dark');
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

    const refreshIcons = () => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    const updateCbmInputState = () => {
        if (!cbmInput) return;
        const currentLabel = cbmStepLabels[cbmBuffer.length] || cbmStepLabels[0];
        cbmInput.placeholder = 'Nhập số đo';
        cbmInput.setAttribute('aria-label', `Nhập ${currentLabel}`);
        cbmInput.dataset.step = currentLabel;
    };

    const clearCbmInputs = (cancelEdit = true) => {
        if (cbmInput) cbmInput.value = '';
        cbmBuffer = [];
        if (cancelEdit) cbmEditingId = null;
        renderCbm();
        if (cbmInput) cbmInput.focus();
    };

    const renderCbm = () => {
        const totals = cbmCore.calculateTotals(cbmGroups);
        cbmResultDiv.innerHTML = ui.renderCbmResult(cbmGroups, totals, cbmBuffer);
        updateCbmInputState();
        cbmResultDiv.scrollTop = cbmResultDiv.scrollHeight;
    };

    const renumberCbmGroups = () => {
        cbmGroups = cbmGroups.map((group, index) => ({ ...group, groupNumber: index + 1 }));
    };

    const buildGroupFromBuffer = () => cbmCore.calculateGroup({
        dai: cbmBuffer[0],
        rong: cbmBuffer[1],
        cao: cbmBuffer[2],
        soKien: cbmBuffer[3]
    });

    const commitCbmBuffer = () => {
        const existingIndex = cbmGroups.findIndex((group) => group.id === cbmEditingId);
        const existing = existingIndex >= 0 ? cbmGroups[existingIndex] : null;
        const id = existing?.id || String(cbmNextId++);
        const groupNumber = existing?.groupNumber || cbmGroups.length + 1;
        const group = buildGroupFromBuffer();

        if (!group) return false;

        const nextGroup = { ...group, id, groupNumber };
        if (existingIndex >= 0) cbmGroups[existingIndex] = nextGroup;
        else cbmGroups.push(nextGroup);

        renumberCbmGroups();
        cbmBuffer = [];
        cbmEditingId = null;
        renderCbm();
        return true;
    };

    const submitCbmValue = () => {
        if (!cbmInput) return;
        const value = cbmCore.toNumber(cbmInput.value);
        if (!cbmCore.isValidDimension(value)) {
            cbmInput.value = '';
            cbmInput.focus();
            return;
        }

        cbmBuffer.push(value);
        cbmInput.value = '';

        if (cbmBuffer.length === 4) commitCbmBuffer();
        else renderCbm();

        cbmInput.focus();
    };

    const editCbmGroup = (id) => {
        const group = cbmGroups.find((item) => item.id === id);
        if (!group) return;
        cbmEditingId = id;
        cbmBuffer = [group.dai, group.rong, group.cao];
        cbmInput.value = group.soKien;
        renderCbm();
        cbmInput.focus();
    };

    const undoCbm = () => {
        if (cbmInput?.value.trim()) {
            cbmInput.value = '';
            cbmInput.focus();
            return;
        }
        if (cbmBuffer.length > 0) {
            cbmInput.value = cbmBuffer.pop();
            renderCbm();
            cbmInput.focus();
            return;
        }
        const lastGroup = cbmGroups.pop();
        if (lastGroup) {
            cbmBuffer = [lastGroup.dai, lastGroup.rong, lastGroup.cao];
            cbmEditingId = null;
        }
        renumberCbmGroups();
        renderCbm();
        cbmInput.focus();
    };

    const clearCbmCurrent = () => {
        if (cbmInput?.value.trim() || cbmBuffer.length > 0 || cbmEditingId) {
            clearCbmInputs();
            return;
        }
        cbmGroups.pop();
        renumberCbmGroups();
        renderCbm();
        cbmInput.focus();
    };

    const resetCbm = () => {
        cbmGroups = [];
        cbmNextId = 1;
        cbmBuffer = [];
        clearCbmInputs();
    };

    const tinhToanCuocPhi = (showAlert = true) => {
        const provinceKey = shippingTinhSelect.value;
        const district = parseSelectedDistrict();
        const weight = parseFloat(shippingWeightInput.value);

        if (!provinceKey || !shippingHuyenSelect.value || !Number.isFinite(weight) || weight <= 0 || !shippingCore) {
            if (showAlert) alert('Vui lòng chọn tỉnh, huyện và nhập trọng lượng hợp lệ!');
            return false;
        }

        if (Number.isFinite(shippingCore.MAX_WEIGHT_KG) && weight > shippingCore.MAX_WEIGHT_KG) {
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
        if (shippingAutoCalculateFrame) cancelAnimationFrame(shippingAutoCalculateFrame);
        shippingAutoCalculateFrame = requestAnimationFrame(() => {
            shippingAutoCalculateFrame = 0;
            tinhToanCuocPhi(false);
        });
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
        if (!Number.isFinite(pieces) || pieces <= 0) return;
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

    switchTab('cbm-calculator');
    renderCbm();

    sidebarNavItems.forEach(item => item.addEventListener('click', () => switchTab(item.dataset.tab)));
    bottomNavItems.forEach(item => item.addEventListener('click', () => switchTab(item.dataset.tab)));
    if (navMenuToggle) navMenuToggle.addEventListener('click', (event) => { event.stopPropagation(); toggleToolMenu(); });
    if (topTabNav) topTabNav.addEventListener('click', (event) => event.stopPropagation());
    document.addEventListener('click', closeToolMenu);
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeToolMenu(); });

    cbmEntryForm.addEventListener('submit', (event) => { event.preventDefault(); submitCbmValue(); });
    btnUndoCbm.addEventListener('click', undoCbm);
    btnClearCbmInput.addEventListener('click', clearCbmCurrent);
    btnResetCbm.addEventListener('click', resetCbm);
    cbmResultDiv.addEventListener('click', (event) => {
        const editButton = event.target.closest('[data-cbm-edit]');
        if (editButton) editCbmGroup(editButton.dataset.cbmEdit);
    });

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
    refreshIcons();
});
