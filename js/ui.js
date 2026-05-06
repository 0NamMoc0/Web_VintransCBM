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

        let html = `<div class="shipping-result-content"><div class="result-title">KẾT QUẢ TÍNH CƯỚC</div>`;
        html += `<div class="result-highlights"><div><span>Rẻ nhất</span><b>${cheapest.name}</b><strong>${formatMoney(cheapest.totalPrice)}</strong></div><div><span>Nhanh nhất</span><b>${fastest.name}</b><strong>${fastest.deliveryTime}</strong></div></div>`;
        html += `<div class="result-info"><div class="info-item"><span class="info-label">Tuyến đến</span><b class="info-value">${route.provinceName} - ${route.districtName}</b></div><div class="info-item"><span class="info-label">Loại tuyến</span><b class="info-value">${route.routeType}</b></div><div class="info-item"><span class="info-label">Trọng lượng</span><b class="info-value">${formatNumber(route.weight)} kg</b></div><div class="info-item"><span class="info-label">Hệ số ngoại tuyến</span><b class="info-value">x${outerCoeff}</b></div></div><div class="services-container">`;

        results.forEach((result) => {
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
        const kg = pieces * 16.4;
        const basePrice = kg * 31000;
        const total = basePrice * 1.3878;
        let html = "<b>LOẠI HÀNG:</b> Bong Bóng Cá<br/>";
        html += `SỐ KIỆN: <font color='#48D1CC'>${formatNumber(pieces)}</font> (${formatNumber(kg)} kg)<br/><br/>`;
        html += "<b>1. Cước chính (31.000 đ/kg):</b><br/>";
        html += `<font color='#909094'>${formatNumber(kg)} kg x 31.000 = </font><b>${formatMoney(basePrice)}</b><br/><br/>`;
        html += "<b>2. Phụ phí Nhiên liệu & VAT (x 1.3878):</b><br/>";
        html += `<font color='#909094'>${formatMoney(basePrice)} x 1.3878 = </font><b>${formatMoney(total)}</b><br/><br/>`;
        html += `<h2><font color='#FF4B55'>TỔNG: ${formatMoney(total)}</font></h2>`;
        return html;
    }

    return { formatMoney, formatNumber, renderShippingResult, renderFishResult, shippingEmptyMessage };
})();
