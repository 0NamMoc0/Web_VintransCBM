# VinTransCBM Web

VinTransCBM Web là bản web tĩnh, chạy trực tiếp bằng HTML/CSS/JavaScript. Bản này giữ các tính năng chính cần dùng trên web:

- Tính CBM, kg quy đổi và tổng số kiện theo app Android.
- Tính cước vận chuyển.
- Tính tiền hàng Bong Bóng Cá.
- Kiểm tra tỉnh đi hàng bay hay hàng bộ.

## Cấu trúc

```text
Web_VintransCBM-main/
├── index.html
├── script.js
├── style-new.css
├── settings.css
├── js/
│   ├── cbm-core.js
│   ├── lucide.js
│   ├── province-data.js
│   ├── province-checker.js
│   ├── shipping-core.js
│   └── ui.js
├── tests/
│   ├── cbm-core.test.js
│   ├── shipping-core.test.js
│   └── province-checker.test.js
└── package.json
```

## Tính CBM

Logic CBM được đồng bộ từ `VinTransCBM/app/src/main/java/com/cbmvin/cbmapp/CbmCalculator.java`.

Công thức:

```text
CBM = ((Dài x Rộng x Cao x Số kiện) / 3000) / 333
Bộ = (Dài x Rộng x Cao / 4000) x Số kiện
Vin-Eco = (Dài x Rộng x Cao / 4000) x Số kiện
CPN = (Dài x Rộng x Cao / 6000) x Số kiện
Hỏa Tốc = (Dài x Rộng x Cao / 6000) x Số kiện
```

Kết quả tổng giữ kiểu dọc như app: `CBM`, từng dòng kg, rồi `Tổng ... kiện`.

## Tính Cước Vận Chuyển

Người dùng chọn tỉnh, chọn quận/huyện, nhập trọng lượng. Web tự tính khi đủ dữ liệu; nút `TÍNH CƯỚC` vẫn giữ để tính lại thủ công.

Kết quả gồm 4 dịch vụ:

- `VIN-TRUCK (Đường Bộ)`.
- `VIN-ECO (Tiết Kiệm)`, chỉ áp dụng từ 30kg.
- `VIN-EXPRESS (CPN)`.
- `VIN-HOATOC (Hỏa Tốc)`.

Kết quả có thẻ `Rẻ nhất` và `Nhanh nhất` ở đầu, sau đó mỗi dịch vụ hiển thị cước chính, phụ phí `1.3878`, phí ngoại tuyến nếu có và tổng cước.

## Phụ Phí Ngoại Tuyến

Nếu quận/huyện là ngoại tuyến:

- Trọng lượng đến 100kg: nhân `1.3`.
- Trọng lượng trên 100kg đến 200kg: nhân `1.2`.
- Trọng lượng trên 200kg: nhân `1.1`.

Nếu là nội tuyến, hệ số là `1.0`.

## Bong Bóng Cá

Công thức:

```text
Số kg = Số kiện x 16.4
Cước chính = Số kg x 31.000
Tổng = Cước chính x 1.3878
```

Tiền hiển thị được làm tròn về VND sau khi tính cước chính và sau khi nhân phụ phí, đồng bộ với app Android.

## Kiểm Tra Tỉnh

Nhập tên tỉnh có dấu hoặc không dấu, có autocomplete gợi ý tỉnh, nhấn Enter. Web trả kết quả:

- `Hàng Bay` nếu tỉnh thuộc danh sách bay.
- `Hàng Bộ` nếu không thuộc danh sách bay.

## Chạy Web

Mở trực tiếp file:

```text
index.html
```

Không cần build, không cần internet để dùng logic tính toán. Font Google và icon đã có fallback; `js/lucide.js` được lưu local.

## Test

Chạy test lõi tính cước:

```bash
npm test
```

Bộ test hiện kiểm tra:

- `VIN-TRUCK` ở mốc 10kg.
- `VIN-ECO` tối thiểu 30kg.
- Các mốc cân nặng dễ sai: `10`, `10.1`, `50`, `50.1`, `100`, `100.1`, `300`, `500`, `1000`, `2000`.
- `VIN-EXPRESS`, `VIN-HOATOC` ở các mốc `1kg`, `2kg`, `2.5kg`.
- Phụ phí ngoại tuyến ở mốc `100`, `100.1`, `200`, `200.1`.
- Input xấu: `0`, số âm, `NaN`, `Infinity`.
- Kiểm tra tỉnh có sanitize HTML/script.
- Bong Bóng Cá: kg/kiện, cước chính, tổng sau phụ phí `1.3878`.
- Parity app/web: đọc công thức, bảng giá, thời gian giao, tỉnh/huyện từ mã Java Android rồi so với web trên nhiều vùng và mốc cân.

## Ghi Chú Đồng Bộ App

Logic cước đã được tách vào `js/shipping-core.js` để dễ so sánh với app Android `VinTransCBM`. Khi cập nhật bảng giá trong app, cần cập nhật module này và chạy lại `npm test`.

## Module Đã Tách

Các phần đã tách:

- `js/province-data.js`: dữ liệu tỉnh, huyện, vùng giá.
- `js/province-checker.js`: normalize, sanitize và kiểm tra tỉnh.
- `js/cbm-core.js`: công thức CBM/kg quy đổi đồng bộ app Android.
- `js/shipping-core.js`: công thức cước duy nhất.
- `js/ui.js`: render kết quả cước và Bong Bóng Cá.

## Bảo Vệ Tránh Tính Sai Cước

Cần giữ các lớp bảo vệ sau:

- `js/shipping-core.js` là nguồn tính cước duy nhất; UI không tự tính lại công thức riêng.
- Test bắt buộc cho các mốc nhạy cảm: `VIN-TRUCK`, `VIN-ECO` tối thiểu 30kg, hệ số ngoại tuyến `1.3`, `1.2`, `1.1`.
- Kiểm tra dữ liệu đầu vào: tỉnh phải có vùng giá, huyện phải có loại `noi` hoặc `ngoai`, trọng lượng phải là số hữu hạn và lớn hơn 0.
- Hiển thị rõ công thức thành phần: cước chính, phụ phí `1.3878`, phí ngoại tuyến và tổng cước để người dùng tự đối soát.
- Khi cập nhật bảng giá, phải chạy `npm test` và so lại một vài case mẫu với app Android.
- Khi cập nhật công thức Bong Bóng Cá hoặc giới hạn trọng lượng, phải cập nhật đồng thời app Android và web, sau đó chạy parity test.
- Không dùng `eval`, không nhận công thức từ người dùng, không lưu dữ liệu nhạy cảm trong localStorage.
