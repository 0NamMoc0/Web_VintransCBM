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

## Task mới: quay về layout CBM ban đầu

- [x] Hoàn tác phần sửa `keyboard fit` vừa thêm cho màn CBM WebView.
- [x] Giữ nguyên logic tính CBM, tính cước và URL WebView cố định.
- [x] Chạy lại test logic, syntax JS và publish lên GitHub Pages.

## Task mới: làm màn CBM giống app native trong ảnh mẫu

- [x] Ẩn thanh tab lớn trên mobile/WebView, thay bằng menu nhỏ góc phải như app native.
- [x] Giữ chuyển tab qua menu nhỏ để vẫn vào được `CBM`, `CƯỚC PHÍ`, `KIỂM TRA`.
- [x] Giữ vùng kết quả CBM cao, nút thao tác và ô nhập theo bố cục app native.
- [x] Chạy test logic, syntax, HTTP smoke và publish lên GitHub Pages.

## Task mới: thêm APK WebView tải về

- [x] Build APK WebView với tên app `VintransCBM`.
- [x] Đưa APK vào `downloads/VintransCBM.apk` trong web tĩnh.
- [x] Thêm nút tải APK rất nhỏ ở góc dưới bên phải.
- [x] Chạy test web tĩnh, kiểm tra href tải và push GitHub Pages.

## Task mới: cập nhật APK WebView có icon hoa hướng dương

- [x] Build lại APK WebView có icon launcher hoa hướng dương.
- [x] Thay `downloads/VintransCBM.apk` bằng bản APK mới.
- [x] Push lên GitHub Pages để nút tải nhận bản mới.
