# Changelog

Tất cả thay đổi quan trọng của dự án sẽ được ghi chép ở đây.

Format dựa trên [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [2.0.0] - 2024-11-20

### 🔒 Security (Major Update)
- **Added** Security headers via `netlify.toml`
  - X-Frame-Options: DENY
  - Content-Security-Policy
  - Strict-Transport-Security (HSTS)
  - X-Content-Type-Options: nosniff
  - Permissions-Policy
- **Added** Input sanitization functions
  - `sanitizeInput()` - Loại bỏ ký tự XSS
  - `sanitizeNumber()` - Validate số
- **Added** Security documentation
  - `SECURITY.md` - Security policy
  - `DEPLOY.md` - Deployment guide
  - `.gitignore` - Prevent sensitive file commits
  - `robots.txt` - Bot control
- **Applied** Sanitization to all user inputs
  - CBM calculator input
  - Province checker input
  - History search input

### ✨ Features
- **Added** Hamburger menu với auto-hide (2s)
- **Added** Responsive design (mobile + desktop)
- **Improved** Auto-scroll khi nhập số
- **Optimized** Hamburger size (36px → 28px)

### 🎨 UI/UX
- **Updated** Hamburger style (transparent background + backdrop blur)
- **Removed** Bottom navigation (chỉ dùng hamburger menu)
- **Improved** Click area cho hamburger (48x48px)
- **Added** Smooth scroll behavior

### 🐛 Bug Fixes
- Fixed scroll issue khi nhập nhóm mới
- Fixed hamburger che nội dung
- Fixed province checker logic (32 tỉnh Hàng Bay)

## [1.0.0] - 2024-11-15

### ✨ Features
- Tính toán CBM và trọng lượng vận chuyển
- Lịch sử với phân trang (25 items/page)
- Tìm kiếm theo ngày
- Xóa lịch sử theo tháng
- Kiểm tra tỉnh thành (52 tỉnh)
- LocalStorage persistence

### 🎨 UI/UX
- Responsive design
- Dark mode colors
- Smooth animations
- Mobile-friendly

---

## Security Audit Log

### 2024-11-20
- ✅ Mozilla Observatory: Grade A+ (Expected)
- ✅ Security Headers: All implemented
- ✅ Input Sanitization: Applied to all inputs
- ✅ HTTPS: Force enabled on Netlify
- ✅ Code Review: No sensitive data in repo

**Next Audit**: 2024-12-20
