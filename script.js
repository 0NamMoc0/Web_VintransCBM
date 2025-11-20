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
    
    // --- HAMBURGER MENU FUNCTIONS ---
    const toggleHamburgerVisibility = () => {
        if (hamburgerMenu && !slideMenu.classList.contains('open')) {
            hamburgerMenu.classList.toggle('hidden');
        }
    };

    const openSlideMenu = () => {
        if (slideMenu && menuOverlay) {
            slideMenu.classList.add('open');
            menuOverlay.classList.add('visible');
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
            // Hide hamburger after closing menu
            if (hamburgerMenu) {
                hamburgerMenu.classList.add('hidden');
            }
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
            
            return `📦 [${timestamp}] Nhóm ${groupNumber}:\n` +
                   `Dài: ${df(v1)}, Rộng: ${df(v2)}, Cao: ${df(v3)}, Số kiện: ${df(v4)}\n` +
                   `✨ CBM = ${df(cbm)}\n` +
                   `🚛 Kg (ĐƯỜNG BỘ) = ${df(kgDuongBo)}\n` +
                   `🚐 Kg (VIN-ECO) = ${df(kgVinEco)}\n` +
                   `✈️ Kg (CPN) = ${df(kgCpn)}\n` +
                   `🚀 Kg (HỎA TỐC) = ${df(kgHoaToc)}`;
        } else if (entry.type === 'province') {
            return `🏙️ [${entry.timestamp}] Kiểm tra tỉnh: ${entry.province} → ${entry.result}`;
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
                    <p class="group-title">☀️ Nhóm ${group.groupNumber}:</p>
                    <p>Dài: <span class="value">${df(v1)}</span></p>
                    <p>Rộng: <span class="value">${df(v2)}</span></p>
                    <p>Cao: <span class="value">${df(v3)}</span></p>
                    <p>Số kiện: <span class="value">${df(v4)}</span></p>
                    <hr>
                    <p>✨ CBM nhóm ${group.groupNumber} = ${df(cbm)}, Tổng: ${df(totalCbm)}, Số Kiện: ${df(totalPieces)}</p>
                    <p>🚛 Kg nhóm ${group.groupNumber} (ĐƯỜNG BỘ) = ${df(kgDuongBo)}, Tổng: ${df(totalKgDuongBo)}</p>
                    <p>🚐 Kg nhóm ${group.groupNumber} (VIN-ECO) = ${df(kgVinEco)}, Tổng: ${df(totalKgVinEco)}</p>
                    <p>✈️ Kg nhóm ${group.groupNumber} (CPN) = ${df(kgCpn)}, Tổng: ${df(totalKgCpn)}</p>
                    <p>🚀 Kg nhóm ${group.groupNumber} (HỎA TỐC) = ${df(kgHoaToc)}, Tổng: ${df(totalKgHoaToc)}</p>
                </div>`;
        });
        
        const labels = ["Dài", "Rộng", "Cao", "Số kiện"];
        if (cbmCurrentIndex > 1) {
            let currentInputHtml = '';
            for(let i=0; i < cbmCurrentIndex - 1; i++) {
                currentInputHtml += `${labels[i]}: <span class="value">${df(cbmBuffer[i])}</span>, `;
            }
            groupHtml += `<div class="group-item current-input"><strong>☀️ Nhóm ${cbmCurrentGroup} (đang nhập):</strong><br>${currentInputHtml.slice(0, -2)}</div>`;
        }
        
        groupsDisplay.innerHTML = groupHtml || '<p class="empty-message">Chưa có lô hàng nào.</p>';

        if (isNewGroup) {
            mainContent.scrollTop = mainContent.scrollHeight;
        }
    };
    
    const handleCBMInput = () => {
        const rawValue = cbmInput.value;
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
        const inputProvince = removeAccents(provinceInput.value.toLowerCase()).trim();
        const originalName = provinceInput.value.trim();

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

    // --- EVENT LISTENERS ---
    // Hamburger menu - Click to toggle visibility and open menu
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            if (hamburgerMenu.classList.contains('hidden')) {
                // If hidden, show it first
                hamburgerMenu.classList.remove('hidden');
            } else {
                // If visible, open the menu
                openSlideMenu();
            }
        });
    }
    
    // Click anywhere on screen to show hamburger (but not open menu)
    document.addEventListener('click', (e) => {
        // Only show hamburger if it's hidden and menu is not open
        if (hamburgerMenu && hamburgerMenu.classList.contains('hidden') && !slideMenu.classList.contains('open')) {
            hamburgerMenu.classList.remove('hidden');
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
        const searchDate = searchHistoryInput.value.trim();
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
            alert(`Đã tìm thấy nhóm ngày ${searchDate} (trang ${targetPage})`);
        } else {
            alert(`Không tìm thấy nhóm nào vào ngày ${searchDate}`);
        }
    };

    // --- INIT ---
    renderCBM();
    renderHistory();
    
    // Start with hamburger hidden
    if (hamburgerMenu) {
        hamburgerMenu.classList.add('hidden');
    }
    
    cbmInput.focus();
});
