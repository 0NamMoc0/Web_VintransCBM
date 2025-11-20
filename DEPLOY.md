# 🚀 Hướng dẫn Deploy lên Netlify

## Bước 1: Chuẩn bị GitHub Repository

### 1.1 Tạo repo mới (nếu chưa có)
```bash
# Trong thư mục dự án
git init
git add .
git commit -m "Initial commit with security features"
```

### 1.2 Push lên GitHub
```bash
# Tạo repo private trên GitHub
# Sau đó:
git remote add origin https://github.com/username/vintranscbm-web.git
git branch -M main
git push -u origin main
```

## Bước 2: Kết nối Netlify

### 2.1 Đăng nhập Netlify
1. Truy cập: https://app.netlify.com
2. Đăng nhập bằng GitHub account
3. Authorize Netlify access

### 2.2 Import Project
1. Click **"Add new site"** → **"Import an existing project"**
2. Chọn **GitHub**
3. Authorize Netlify (nếu chưa)
4. Chọn repository: `vintranscbm-web`

### 2.3 Build Settings
```
Build command: (leave empty)
Publish directory: .
```

Vì đây là static site, không cần build command.

### 2.4 Deploy
Click **"Deploy site"**

## Bước 3: Cấu hình Security

### 3.1 Force HTTPS
1. Site settings → Domain management → HTTPS
2. Enable **"Force HTTPS"**
3. Enable **"HSTS"**

### 3.2 Kiểm tra Headers
1. Deploy xong, truy cập URL
2. Mở DevTools → Network → Chọn document
3. Kiểm tra Response Headers:
   - ✅ `X-Frame-Options: DENY`
   - ✅ `Content-Security-Policy: ...`
   - ✅ `Strict-Transport-Security: ...`

## Bước 4: Custom Domain (Tùy chọn)

### 4.1 Thêm domain
1. Site settings → Domain management
2. Click **"Add custom domain"**
3. Nhập domain của bạn

### 4.2 Configure DNS
```
Type: A Record
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: yoursitename.netlify.app
```

## Bước 5: Environment Variables (Nếu cần)

### 5.1 Thêm API Keys
1. Site settings → Build & deploy → Environment
2. Click **"Edit variables"**
3. Thêm key-value pairs:
   ```
   API_KEY=your-secret-key
   ```

### 5.2 Access trong code
```javascript
// KHÔNG làm vậy này - API keys phải ở server-side
// Static site không nên dùng sensitive API keys
```

## Bước 6: Deploy Updates

### 6.1 Tự động deploy (Recommended)
```bash
# Mỗi khi push code mới lên GitHub
git add .
git commit -m "Update features"
git push origin main

# Netlify tự động rebuild và deploy
```

### 6.2 Manual deploy
1. Netlify Dashboard → Deploys
2. Click **"Trigger deploy"**
3. Chọn **"Deploy site"**

## Bước 7: Monitoring & Security

### 7.1 Check Deploy Status
- Deploys tab: Xem history và logs
- Functions tab: Nếu có serverless functions
- Analytics: Traffic và performance

### 7.2 Security Scan
```bash
# Scan với Mozilla Observatory
https://observatory.mozilla.org

# Nhập URL Netlify của bạn
# Đảm bảo grade A+ hoặc A
```

### 7.3 Lighthouse Audit
```
Chrome DevTools → Lighthouse
Chọn: Performance, Accessibility, Best Practices, SEO
Run audit
```

## Bước 8: Rollback (Nếu cần)

### 8.1 Rollback deploy
1. Deploys tab
2. Tìm deploy cũ hoạt động tốt
3. Click **"Publish deploy"**

### 8.2 Lock deploy
1. Chọn deploy muốn lock
2. Click **"Lock deploy"**

## ⚠️ Security Checklist

Trước khi public URL, kiểm tra:

- [ ] ✅ HTTPS enabled
- [ ] ✅ Force HTTPS active
- [ ] ✅ Security headers present
- [ ] ✅ No API keys in code
- [ ] ✅ `.gitignore` configured
- [ ] ✅ Repository is private
- [ ] ✅ Branch protection enabled
- [ ] ✅ 2FA enabled on GitHub
- [ ] ✅ Mozilla Observatory grade A+
- [ ] ✅ Lighthouse score > 90

## 🎉 Done!

URL sẽ có dạng:
- Default: `https://random-name-123.netlify.app`
- Custom: `https://yourdomain.com` (nếu có)

### Chia sẻ URL
```
https://vintranscbm.netlify.app
```

### Update DNS (nếu dùng custom domain)
Đợi 24-48h để DNS propagate toàn cầu.

---

**Mọi thắc mắc, xem [Netlify Docs](https://docs.netlify.com)** 📚
