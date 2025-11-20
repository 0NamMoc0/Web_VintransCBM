# 🔒 Security Policy

## Báo cáo lỗ hổng bảo mật

Nếu bạn phát hiện lỗ hổng bảo mật, vui lòng KHÔNG tạo public issue.

**Thay vào đó:**
- Gửi email riêng tư cho maintainer
- Mô tả chi tiết lỗ hổng
- Cung cấp steps to reproduce (nếu có)

## Các biện pháp bảo mật đã triển khai

### ✅ Security Headers
- **X-Frame-Options**: DENY - Ngăn clickjacking
- **Content-Security-Policy**: Hạn chế nguồn resources - Ngăn XSS
- **Strict-Transport-Security**: HTTPS only
- **X-Content-Type-Options**: nosniff - Ngăn MIME sniffing
- **Permissions-Policy**: Tắt các API không cần thiết

### ✅ Input Sanitization
- Tất cả user inputs được sanitize
- Loại bỏ ký tự đặc biệt nguy hiểm (`<>'"`)
- Ngăn chặn JavaScript injection
- Validate số trước khi parse

### ✅ Data Storage
- LocalStorage chỉ lưu dữ liệu không nhạy cảm
- Không lưu passwords, API keys, credit cards
- Chỉ lưu CBM calculations và history

### ✅ HTTPS
- Force HTTPS trên Netlify
- Automatic SSL/TLS certificates
- HSTS enabled

### ✅ Repository Security
- Private GitHub repository
- `.gitignore` ngăn commit sensitive files
- No API keys in code
- Environment variables trên Netlify (nếu cần)

## Best Practices cho Users

1. **Không nhập thông tin nhạy cảm** vào app
2. **Clear browser cache** thường xuyên
3. **Sử dụng HTTPS** (tự động redirect)
4. **Cập nhật browser** lên phiên bản mới nhất

## Security Checklist

- [x] HTTPS enabled
- [x] Security headers configured
- [x] Input sanitization implemented
- [x] No sensitive data in localStorage
- [x] .gitignore configured
- [x] robots.txt configured
- [x] CSP policy active
- [x] XSS protection enabled

## Phiên bản bảo mật

- **Current version**: 1.0.0
- **Last security audit**: 2024-11-20
- **Next audit scheduled**: 2024-12-20

## Liên hệ

Mọi thắc mắc về bảo mật, vui lòng liên hệ qua GitHub Issues (cho non-security questions) hoặc email riêng tư (cho security vulnerabilities).
