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

## Task mới: chuyển nút tải APK xuống dưới nút 3 gạch

- [x] Chỉnh vị trí nút tải trên mobile/WebView nằm ngay dưới nút menu 3 gạch.
- [x] Ẩn nút tải khi menu đang mở để không đè danh sách tab.
- [x] Đồng bộ web local và push GitHub Pages.

## Task mới: làm web mượt hơn trên WebView/mobile

- [x] Tìm nguyên nhân gây cảm giác khựng: bundle icon lớn, animation/transition mobile, tự tính cước khi gõ.
- [x] Thay `js/lucide.js` bằng renderer icon nhỏ chỉ chứa icon đang dùng.
- [x] Giảm animation/scroll smooth trên mobile/WebView.
- [x] Throttle tự tính cước theo frame khi nhập trọng lượng.
- [x] Chạy test logic/syntax và publish GitHub Pages.

## Task mới: khóa layout nhập CBM khi bàn phím Android mở

- [x] So sánh ảnh app native và WebView: native giữ ô nhập sát trên bàn phím, WebView bị pan làm ô nhập tụt và kết quả bay lên.
- [x] Thêm `interactive-widget=resizes-content` cho viewport để Chrome/WebView ưu tiên resize vùng nội dung.
- [x] Dùng `visualViewport` khi ô CBM focus để khóa layout riêng cho màn CBM trên mobile.
- [x] Giữ vùng kết quả, 3 nút và ô nhập theo thứ tự native; ẩn nút menu/tải APK khi đang nhập để không đè nội dung.
- [x] Không đổi công thức CBM, công thức cước hoặc dữ liệu tính tiền.

## Task mới: cập nhật APK WebView tương thích bàn phím

- [x] Sửa APK WebView dùng `stateHidden|adjustResize` và bỏ window fullscreen flag gây Android bỏ qua resize.
- [x] Build lại `VinTransCBM-WebView-debug.apk` với icon hoa hướng dương và URL cố định.
- [x] Thay `downloads/VintransCBM.apk` trên web tĩnh bằng bản APK mới.

## Task mới: sửa lớp nổi trong app view

- [x] Ẩn nút tải APK khi trang chạy trong APK WebView để không đè giao diện.
- [x] Đẩy menu nổi lên sát góc trên hơn và chừa khoảng trên cho các tab không phải CBM.
- [x] Ẩn menu/tải khi đang focus input/select.
- [x] Nâng cụm nhập CBM cao hơn khi bàn phím mở trong WebView.
