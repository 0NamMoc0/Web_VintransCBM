# Việc cần làm

## Yêu cầu gốc

- Mang toàn bộ logic tính CBM từ app APK VinTransCBM sang bản web.
- Chỉnh giao diện web để tương thích với hướng giao diện app hiện tại.

## Phạm vi

- Web: `/data/data/com.termux/files/home/tao_app/Web_VintransCBM-main`.
- Nguồn logic app: `/data/data/com.termux/files/home/tao_app/VinTransCBM/app/src/main/java/com/cbmvin/cbmapp/CbmCalculator.java` và phần render CBM trong `MainActivity.java`.

## Task

- [x] Đọc cấu trúc web và logic CBM app.
- [x] Thêm module tính CBM cho web, đồng bộ hệ số và tổng.
- [x] Thêm UI tab CBM riêng, nhập Dài/Rộng/Cao/Kiện, thêm/xóa/sửa cơ bản, tổng dọc như app.
- [x] Chỉnh style web theo hướng graphite, đồng bộ tab/nút/panel với app.
- [x] Thêm test CBM và chạy toàn bộ test web.
- [x] Kiểm tra render web bằng dev server hoặc cách mở tĩnh phù hợp.
- [x] Cập nhật tài liệu/kho kinh nghiệm nếu có bài học dùng lại.
- [x] Đổi giao diện nhập CBM web sang đúng kiểu app: kết quả trên, 3 nút thao tác, một ô nhập tuần tự Dài/Rộng/Cao/Kiện.
- [x] Đưa thanh chọn tab chính lên trên, tinh chỉnh giao diện web tĩnh theo bài học Kho kinh nghiệm/Awesome UX.
- [x] Audit lại logic CBM và tính cước giữa app Android và web tĩnh, đối chiếu công thức/bảng giá và chạy test chéo vì liên quan tiền thật.

## Task mới: thay thế GitHub bằng bản web mới

- [x] Kiểm tra lần cuối logic CBM, cước, Bong Bóng Cá, tỉnh/huyện bằng test web và parity test với app Android.
- [x] Kiểm tra syntax các file JS lõi và smoke web tĩnh trên cổng hiện tại.
- [x] Chuẩn bị cây git sạch, không đưa `logs/`, runtime hoặc file tạm lên GitHub.
- [x] Push bản web mới lên repo `0NamMoc0/Web_VintransCBM` để thay thế dự án cũ.
- [x] Xác minh remote GitHub và URL GitHub Pages sau khi push.

## Task mới: sửa layout CBM khi bàn phím mở

- [x] Tìm nguyên nhân vùng kết quả CBM bị kéo quá cao trong WebView mobile.
- [x] Sửa CSS/layout để kết quả co theo nội dung, ô nhập và nút không bị ép sát bàn phím.
- [x] Kiểm thử HTTP/CSS responsive, syntax JS và toàn bộ test logic.
- [ ] Publish bản sửa lên GitHub Pages nếu kiểm thử đạt.
