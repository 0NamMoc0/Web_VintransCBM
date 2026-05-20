window.VinTransCBMUi = (() => {
    function formatMoney(amount) {
        return Math.round(amount).toLocaleString("vi-VN") + " đ";
    }

    function formatNumber(value) {
        return Number(value).toLocaleString("vi-VN");
    }

    function shippingEmptyMessage() {
        return '<div class="result-message">Vui lòng chọn tỉnh, huyện và nhập trọng lượng để xem kết quả.</div>';
    }

    function cbmEmptyMessage() {
        return '<div class="cbm-empty">CBM 0 · Kiện 0</div>';
    }

    function parseFastestHours(deliveryTime) {
        if (!deliveryTime || deliveryTime === "N/A") return Number.MAX_SAFE_INTEGER;
        if (deliveryTime.includes("h")) return Number(deliveryTime.match(/\d+/)?.[0] || Number.MAX_SAFE_INTEGER);
        if (deliveryTime.includes("ngày")) return Number(deliveryTime.match(/\d+(\.\d+)?/)?.[0] || Number.MAX_SAFE_INTEGER) * 24;
        return Number.MAX_SAFE_INTEGER;
    }

    function getActiveResults(results) {
        return results.filter((result) => !result.isDisabled);
    }

    function renderShippingResult(route, results, outerCoeff) {
        const activeResults = getActiveResults(results);
        const cheapest = activeResults.reduce((best, result) => result.totalPrice < best.totalPrice ? result : best, activeResults[0]);
        const fastest = activeResults.reduce((best, result) => parseFastestHours(result.deliveryTime) < parseFastestHours(best.deliveryTime) ? result : best, activeResults[0]);
        const displayResults = results.slice().sort((a, b) => Number(a.isDisabled) - Number(b.isDisabled));

        let html = `<div class="shipping-result-content"><div class="result-title">KẾT QUẢ TÍNH CƯỚC</div>`;
        html += `<div class="result-highlights"><div><span>Rẻ nhất</span><b>${cheapest.name}</b><strong>${formatMoney(cheapest.totalPrice)}</strong></div><div><span>Nhanh nhất</span><b>${fastest.name}</b><strong>${fastest.deliveryTime}</strong></div></div>`;
        html += `<div class="result-info"><div class="info-item"><span class="info-label">Tuyến đến</span><b class="info-value">${route.provinceName} - ${route.districtName}</b></div><div class="info-item"><span class="info-label">Loại tuyến</span><b class="info-value">${route.routeType}</b></div><div class="info-item"><span class="info-label">Trọng lượng</span><b class="info-value">${formatNumber(route.weight)} kg</b></div><div class="info-item"><span class="info-label">Hệ số ngoại tuyến</span><b class="info-value">x${outerCoeff}</b></div></div><div class="services-container">`;

        displayResults.forEach((result) => {
            html += `<div class="service-card ${result.isDisabled ? "service-disabled" : ""}"><div class="service-header"><div class="service-name">${result.name}</div></div>`;
            if (result.isDisabled) {
                html += `<div class="service-disabled-notice"><div class="disabled-text">Không áp dụng</div><div class="disabled-reason">${result.reason}</div></div>`;
            } else {
                html += `<div class="price-breakdown"><div class="breakdown-item"><span class="breakdown-label">Thời gian</span><span class="breakdown-value">${result.deliveryTime}</span></div><div class="breakdown-item"><span class="breakdown-label">Cước chính</span><span class="breakdown-value">${formatMoney(result.basePrice)}</span></div><div class="breakdown-item"><span class="breakdown-label">Phụ phí 1.3878</span><span class="breakdown-value">${formatMoney(result.fuelAndVatFee)}</span></div>`;
                if (result.outerDistrictFee > 0) html += `<div class="breakdown-item surcharge"><span class="breakdown-label">Phí ngoại tuyến x${outerCoeff}</span><span class="breakdown-value">${formatMoney(result.outerDistrictFee)}</span></div>`;
                html += `<div class="breakdown-separator"></div><div class="breakdown-item total"><span class="breakdown-label">Tổng cước</span><span class="breakdown-value">${formatMoney(result.totalPrice)}</span></div></div>`;
            }
            html += "</div>";
        });

        return html + "</div></div>";
    }

    function renderFishResult(pieces) {
        const fish = window.VinTransCBMFishCore.calculateFishPrice(pieces);
        if (!fish) return '<div class="result-message">Số kiện không hợp lệ.</div>';
        let html = "<b>LOẠI HÀNG:</b> Bong Bóng Cá<br/>";
        html += `SỐ KIỆN: <font color='#48D1CC'>${formatNumber(fish.pieces)}</font> (${formatNumber(fish.kg)} kg)<br/><br/>`;
        html += "<b>1. Cước chính (31.000 đ/kg):</b><br/>";
        html += `<font color='#909094'>${formatNumber(fish.kg)} kg x 31.000 = </font><b>${formatMoney(fish.basePrice)}</b><br/><br/>`;
        html += "<b>2. Phụ phí Nhiên liệu & VAT (x 1.3878):</b><br/>";
        html += `<font color='#909094'>${formatMoney(fish.basePrice)} x 1.3878 = </font><b>${formatMoney(fish.totalPrice)}</b><br/><br/>`;
        html += `<h2><font color='#FF4B55'>TỔNG: ${formatMoney(fish.totalPrice)}</font></h2>`;
        return html;
    }

    function renderCbmResult(groups, totals, buffer = []) {
        if (!groups.length && !buffer.length) return cbmEmptyMessage();

        const summaryRows = [
            ["CBM", formatNumber(totals.cbm), "success"],
            ["Bộ", `${formatNumber(totals.kgDuongBo)} kg`, ""],
            ["Vin-Eco", `${formatNumber(totals.kgVinEco)} kg`, ""],
            ["CPN", `${formatNumber(totals.kgCpn)} kg`, ""],
            ["Hỏa Tốc", `${formatNumber(totals.kgHoaToc)} kg`, ""],
            ["Tổng", `${formatNumber(totals.totalPieces)} kiện`, ""]
        ];

        let html = '<div class="cbm-result-content">';

        if (groups.length) {
            html += '<div class="cbm-list">';
            groups.forEach((group) => {
                html += `<article class="cbm-item" data-cbm-id="${group.id}">`;
                html += `<button class="cbm-item-head" type="button" data-cbm-edit="${group.id}">Kiện ${formatNumber(group.groupNumber)} · sửa</button>`;
                html += `<div class="cbm-dimensions">${formatNumber(group.dai)} × ${formatNumber(group.rong)} × ${formatNumber(group.cao)} · ${formatNumber(group.soKien)} kiện</div>`;
                html += `<div class="cbm-item-cbm"><span>CBM</span><strong>${formatNumber(group.cbm)}</strong></div>`;
                html += '</article>';
            });
            html += '</div>';
        }

        if (buffer.length) {
            const labels = ['Dài:', 'Rộng:', 'Cao:', 'Kiện:'];
            html += '<div class="cbm-buffer"><div class="cbm-buffer-title">Đã nhập</div><div class="cbm-buffer-values">';
            buffer.forEach((value, index) => {
                html += `<span><b>${labels[index]}</b> ${formatNumber(value)}</span>`;
            });
            html += '</div></div>';
        }

        if (groups.length) {
            html += '<div class="cbm-summary">';
            summaryRows.forEach(([label, value, tone]) => {
                html += `<div class="cbm-summary-row ${tone}"><span>${label}</span><strong>${value}</strong></div>`;
            });
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    return { formatMoney, formatNumber, renderShippingResult, renderFishResult, renderCbmResult, cbmEmptyMessage, shippingEmptyMessage };
})();
