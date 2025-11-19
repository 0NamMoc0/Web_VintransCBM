document.addEventListener('DOMContentLoaded', () => {
    // --- UTILS ---
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);
    const df = (num) => {
        // Custom formatter to behave like the original app's DecimalFormat("#.###")
        if (Math.round(num) === num) return num.toString();
        const fixed = num.toFixed(3);
        return parseFloat(fixed).toString(); // Removes trailing zeros
    };


    // --- STATE ---
    let history = JSON.parse(localStorage.getItem('vinTransCBMHistory')) || [];
    let completedGroups = JSON.parse(localStorage.getItem('vinTransCBMGroups')) || [];
    
    // CBM Calculator State
    let cbmCurrentIndex = 1;
    let cbmBuffer = [0, 0, 0, 0];
    let cbmCurrentGroup = completedGroups.length + 1;

    // --- DOM ELEMENTS ---
    const tabButtons = $$('.tab-button');
    const tabContents = $$('.tab-content');
    const cbmInput = $('#cbm-input');
    const btnBack1 = $('#btn-back1');
    const btnBack2 = $('#btn-back2');
    const btnReset = $('#btn-reset');
    const groupsDisplay = $('#groups-display');
    const totalsDisplay = $('#totals-display'); // This will be hidden, totals are in groupsDisplay now
    const mainContent = $('#cbm-main-content');
    const historyListDiv = $('#history-list');
    const clearHistoryBtn = $('#clear-history-button');

    // --- FUNCTIONS ---

    const saveState = () => {
        localStorage.setItem('vinTransCBMHistory', JSON.stringify(history));
        localStorage.setItem('vinTransCBMGroups', JSON.stringify(completedGroups));
    };

    const addToHistory = (entry, skipSave = false) => {
        const timestamp = new Date().toLocaleString('vi-VN');
        history.unshift(`[${timestamp}] ${entry}`);
        if (!skipSave) {
            saveState();
        }
        renderHistory();
    };

    const renderHistory = () => {
        if (history.length === 0) {
            historyListDiv.innerHTML = '<p>Chưa có lịch sử.</p>';
            return;
        }
        historyListDiv.innerHTML = history.map(item => `<p>${item.replace(/\n/g, '<br>')}</p>`).join('');
    };

    const switchTab = (tabName) => {
        tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
        tabContents.forEach(content => content.style.display = content.id === tabName ? 'flex' : 'none');
    };
    
    // --- CBM Calculator ---
    const renderCBM = () => {
        let groupHtml = '';
        let totalCbm = 0, totalKgDuongBo = 0, totalKgVinEco = 0, totalKgCpn = 0, totalKgHoaToc = 0, totalPieces = 0;

        completedGroups.forEach(group => {
            const [v1, v2, v3, v4] = group.nums;
            
            const cbm = ((v1 * v2 * v3 * v4) / 3000.0) / 333.0;
            const kgDuongBo = ((v1 * v2 * v3) / 4000.0) * v4;
            const kgVinEco = ((v1 * v2 * v3) / 4000.0) * v4; // Same as DuongBo
            const kgCpn = ((v1 * v2 * v3) / 6000.0) * v4;
            const kgHoaToc = ((v1 * v2 * v3) / 6000.0) * v4; // Same as CPN

            totalCbm += cbm;
            totalKgDuongBo += kgDuongBo;
            totalKgVinEco += kgVinEco;
            totalKgCpn += kgCpn;
            totalKgHoaToc += kgHoaToc;
            totalPieces += v4;

            groupHtml += `
                <div class="group-item">
                    <p class="group-title">☀️ Nhóm ${group.groupNumber}:</p>
                    <p>Dài: <span class="value">${df(v1)}</span></p>
                    <p>Rộng: <span class="value">${df(v2)}</span></p>
                    <p>Cao: <span class="value">${df(v3)}</span></p>
                    <p>Số kiện: <span class="value">${df(v4)}</span></p>
                    <p>✨ CBM nhóm ${group.groupNumber} = ${df(cbm)}, Tổng: ${df(totalCbm)}, Số Kiện: ${df(totalPieces)}</p>
                    <p>🚛 Kg nhóm ${group.groupNumber} (ĐƯỜNG BỘ) = ${df(kgDuongBo)}, Tổng: ${df(totalKgDuongBo)}</p>
                    <p>🚐 Kg nhóm ${group.groupNumber} (VIN-ECO) = ${df(kgVinEco)}, Tổng: ${df(totalKgVinEco)}</p>
                    <p>✈️ Kg nhóm ${group.groupNumber} (CPN) = ${df(kgCpn)}, Tổng: ${df(totalKgCpn)}</p>
                    <p>🚀 Kg nhóm ${group.groupNumber} (HỎA TỐC) = ${df(kgHoaToc)}, Tổng: ${df(totalKgHoaToc)}</p>
                </div>
                <hr>`;
        });
        
        // Display current input buffer
        const labels = ["Dài", "Rộng", "Cao", "Số kiện"];
        if (cbmCurrentIndex > 1) {
            groupHtml += `<div class="group-item current-input"><strong>☀️ Nhóm ${cbmCurrentGroup} (đang nhập):</strong><br>`;
            for(let i=0; i < cbmCurrentIndex - 1; i++) {
                groupHtml += `${labels[i]}: ${df(cbmBuffer[i])}<br>`;
            }
            groupHtml += `</div>`;
        }
        
        groupsDisplay.innerHTML = groupHtml;
        totalsDisplay.style.display = 'none'; // We no longer use the separate totals display

        mainContent.scrollTop = mainContent.scrollHeight;
    };
    
    const handleCBMInput = () => {
        const rawValue = cbmInput.value;
        if (!rawValue) return;
        const value = parseFloat(rawValue);
        if (isNaN(value) || value <= 0) {
            alert("Vui lòng nhập một số dương.");
            cbmInput.value = "";
            return;
        }

        cbmBuffer[cbmCurrentIndex - 1] = value;
        cbmCurrentIndex++;

        if (cbmCurrentIndex > 4) {
            const newGroup = { groupNumber: cbmCurrentGroup, nums: [...cbmBuffer] };
            completedGroups.push(newGroup);
            saveGroupToHistory(newGroup); // Also saves state
            
            cbmCurrentGroup++;
            cbmBuffer = [0, 0, 0, 0];
            cbmCurrentIndex = 1;
        } else {
            saveState();
        }
        
        cbmInput.value = "";
        cbmInput.focus();
        renderCBM();
    };

    const saveGroupToHistory = (group) => {
        const [v1, v2, v3, v4] = group.nums;
        const cbm = ((v1 * v2 * v3 * v4) / 3000.0) / 333.0;
        let historyEntry = `📦 Nhóm ${group.groupNumber}: Dài: ${df(v1)}, Rộng: ${df(v2)}, Cao:. ${df(v3)}, Số kiện: ${df(v4)} (Kết quả CBM: ${df(cbm)})`;
        addToHistory(historyEntry, true); // Batch save
        saveState();
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
            if (confirm("Xóa lô hàng cuối cùng?")) {
                completedGroups.pop();
                cbmCurrentGroup--;
                addToHistory("TÍNH CBM: Đã xóa lô hàng cuối cùng."); // Also saves
                renderCBM();
            }
        }
    };

    const handleReset = () => {
        if (confirm("Bạn có chắc muốn xóa tất cả các lô hàng?")) {
            completedGroups = [];
            cbmBuffer = [0, 0, 0, 0];
            cbmCurrentIndex = 1;
            cbmCurrentGroup = 1;
            addToHistory("TÍNH CBM: Đã xóa tất cả các lô hàng."); // Also saves
            renderCBM();
        }
    };

    // --- EVENT LISTENERS ---
    tabButtons.forEach(button => button.addEventListener('click', () => switchTab(button.dataset.tab)));
    cbmInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') handleCBMInput(); });
    btnBack1.addEventListener('click', handleBack1);
    btnBack2.addEventListener('click', handleBack2);
    btnReset.addEventListener('click', handleReset);
    clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử và các lô hàng đã tính?')) {
            history = [];
            completedGroups = [];
            saveState();
            renderHistory();
            handleReset(); // Also reset CBM state
        }
    });

    // --- INITIALIZATION ---
    renderHistory();
    renderCBM();
    switchTab('cbm-calculator');
    cbmInput.focus();
});
