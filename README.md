# VinTransCBM - Web Version

## 📋 Giới thiệu

**VinTransCBM** là ứng dụng web tính toán CBM (Cubic Meter) và trọng lượng vận chuyển cho ngành logistics. Phiên bản web này đã được đồng bộ chức năng với Android app, bao gồm đầy đủ tính năng phân trang, tìm kiếm và quản lý lịch sử nâng cao.

## ✨ Tính năng chính

### 📊 Tính Toán CBM
- Nhập kích thước: **Dài × Rộng × Cao × Số kiện**
- Tự động tính toán:
  - ✨ **CBM** (Khối)
  - 🚛 **Kg Đường Bộ** (chia 4000)
  - 🚐 **Kg VIN-ECO** (giống Đường Bộ)
  - ✈️ **Kg CPN** (chia 6000)
  - 🚀 **Kg Hỏa Tốc** (giống CPN)
- Hỗ trợ nhiều lô hàng (groups)
- Quay lại từng bước hoặc xóa toàn bộ

### 📋 Lịch Sử Nâng Cao (Giống Android App)
- **Phân trang**: Hiển thị 25 mục/trang
- **Tìm kiếm theo ngày**: Format `dd/MM/yyyy`
- **Xóa linh hoạt**:
  - Xóa tất cả
  - Xóa theo tháng (chọn tháng cụ thể)
- **Format đẹp**: Hiển thị đầy đủ thông tin từng nhóm
- **Thống kê**: Hiển thị số mục và phạm vi trang hiện tại

### 📍 Kiểm Tra Tỉnh
- Nhập tên tỉnh để kiểm tra loại vận chuyển
- Kết quả: ✈️ **Hàng Bay** hoặc 🚛 **Hàng Bộ**
- Hỗ trợ 52 tỉnh thành Việt Nam
- Tự động loại bỏ dấu khi tìm kiếm

## 🚀 Cách sử dụng

### 1. Mở ứng dụng
```bash
# Chỉ cần mở file index.html trong trình duyệt
# Hoặc sử dụng Live Server
```

### 2. Tab Tính Toán
1. Nhập **Dài** → Enter
2. Nhập **Rộng** → Enter
3. Nhập **Cao** → Enter
4. Nhập **Số kiện** → Enter
5. Hệ thống tự động tính toán và lưu lịch sử

**Các nút điều khiển:**
- **Quay Lại**: Xóa giá trị vừa nhập
- **Biến Trước**: Xóa toàn bộ biến đang nhập hoặc xóa lô hàng cuối
- **Xóa Tất Cả**: Xóa toàn bộ lô hàng

### 3. Tab Lịch Sử
**Tìm kiếm:**
- Nhập ngày theo format: `20/11/2025`
- Nhấn Enter để tìm
- Hệ thống tự động chuyển đến trang chứa kết quả

**Phân trang:**
- Sử dụng nút **◀ Trước** và **Sau ▶**
- Xem thông tin trang hiện tại ở giữa

**Xóa lịch sử:**
1. Nhấn nút **Xóa Lịch Sử**
2. Chọn phương thức:
   - **1**: Xóa tất cả
   - **2**: Xóa theo tháng (chọn tháng từ danh sách)
   - **3**: Hủy

### 4. Tab Kiểm Tra Tỉnh
1. Nhập tên tỉnh (có hoặc không dấu)
2. Nhấn Enter
3. Xem kết quả: Hàng Bay hoặc Hàng Bộ

## 🎨 Giao diện

### Đặc điểm UI/UX
- ✅ **Mobile-first**: Responsive trên mọi thiết bị
- ✅ **Modern Design**: Gradient, shadows, animations
- ✅ **Dark Mode Ready**: Màu tối, dễ nhìn
- ✅ **Smooth Animations**: Fade in/out, slide transitions
- ✅ **Auto-hide Header**: Menu tự ẩn sau 3s không hoạt động
- ✅ **Touch-friendly**: Tối ưu cho mobile

### Font & Colors
- **Font**: Be Vietnam Pro (Google Fonts)
- **Primary**: `#1877f2` (Blue)
- **Success**: `#42b72a` (Green)
- **Danger**: `#fa383e` (Red)
- **Background**: `#f0f2f5` (Light Gray)

## 💾 Lưu trữ dữ liệu

- **LocalStorage**: `vinTransCBMHistory`, `vinTransCBMGroups`
- **Dữ liệu**: JSON format với timestamp
- **Tự động lưu**: Mỗi khi thêm hoặc xóa

## 📱 Tương thích

### Trình duyệt
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox
- ✅ Safari (iOS & macOS)
- ✅ Samsung Internet

### Thiết bị
- ✅ Desktop (Windows, macOS, Linux)
- ✅ Mobile (Android, iOS)
- ✅ Tablet

## 🔧 Công thức tính toán

```javascript
CBM = (Dài × Rộng × Cao × Số kiện) ÷ 3000 ÷ 333
Kg Đường Bộ = (Dài × Rộng × Cao) ÷ 4000 × Số kiện
Kg VIN-ECO = Kg Đường Bộ
Kg CPN = (Dài × Rộng × Cao) ÷ 6000 × Số kiện
Kg Hỏa Tốc = Kg CPN
```

## 📂 Cấu trúc dự án

```
web_vintranscbmv2/
├── index.html          # Giao diện chính
├── script.js           # Logic & tính toán
├── style.css           # Styling & animations
├── package.json        # NPM config (optional)
├── README.md           # Tài liệu này
└── VinTransCBM-3.0/    # Android app source
```

## 🆕 Thay đổi mới (v2.0)

### Đã cập nhật
1. ✅ **Lịch sử phân trang** - Giống Android app
2. ✅ **Tìm kiếm theo ngày** - Nhanh chóng tìm lô hàng
3. ✅ **Xóa theo tháng** - Quản lý linh hoạt
4. ✅ **Format lịch sử đẹp hơn** - Hiển thị đầy đủ thông tin
5. ✅ **Responsive cải thiện** - Mobile-friendly hơn
6. ✅ **UI/UX tối ưu** - Hover effects, transitions

### So sánh với Android
| Tính năng | Web v2.0 | Android v3.0 |
|-----------|----------|--------------|
| Tính CBM | ✅ | ✅ |
| Lịch sử phân trang | ✅ 25/trang | ✅ 25/trang |
| Tìm kiếm ngày | ✅ | ✅ |
| Xóa theo tháng | ✅ | ✅ |
| Kiểm tra tỉnh | ✅ | ✅ |
| Máy tính | ❌ | ✅ |
| Lưu file | LocalStorage | Downloads folder |

## 🐛 Lưu ý

### Làm việc Offline
- ✅ Hoàn toàn offline, không cần internet
- ✅ Dữ liệu lưu trên máy local

### Xóa dữ liệu
- Xóa LocalStorage: `localStorage.clear()`
- Hoặc dùng DevTools → Application → LocalStorage

### Backup dữ liệu
```javascript
// Export
const backup = localStorage.getItem('vinTransCBMHistory');
console.log(backup);

// Import
localStorage.setItem('vinTransCBMHistory', backup);
```

## 👨‍💻 Phát triển

### Yêu cầu
- Trình duyệt hiện đại (ES6+ support)
- Không cần build tools
- Không cần dependencies

### Run
```bash
# Mở trực tiếp
open index.html

# Hoặc dùng Live Server (VS Code)
# Right-click → Open with Live Server
```

## 📞 Hỗ trợ

- **Version**: 2.0
- **Platform**: Web (HTML/CSS/JS)
- **License**: Private

---

**🎉 Chúc bạn sử dụng VinTransCBM hiệu quả! 🚚📦**
