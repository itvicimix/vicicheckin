# Booking Multi-tenant SaaS

Nền tảng Web App Booking Đa khách thuê (Multi-tenant) dành cho hệ thống các tiệm Nail, Head Spa.
Dự án sử dụng **Next.js**, **Tailwind CSS**, **Firebase**, và **Playwright** cho E2E Testing.

## Yêu cầu hệ thống

- Node.js (phiên bản 18.x trở lên)
- NPM hoặc Yarn

## Hướng dẫn cài đặt

**1. Clone dự án và cài đặt thư viện**

```bash
# Cài đặt các thư viện cần thiết
npm install
```

**2. Cài đặt trình duyệt cho Playwright (Dùng cho test tự động)**

```bash
npx playwright install
```

**3. Cấu hình biến môi trường**

Tạo file `.env.local` ở thư mục gốc và thêm các thông tin sau (sẽ được cấp sau khi setup Firebase/Twilio):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

## Hướng dẫn chạy dự án

**1. Môi trường Development**

```bash
npm run dev
```
Trang web sẽ chạy tại `http://localhost:3000`.
- Giao diện khách hàng: `http://localhost:3000/[ten-tiem]`
- Giao diện Chủ tiệm: `http://localhost:3000/admin`
- Giao diện Super Admin: `http://localhost:3000/super-admin`

**2. Build cho Production**

```bash
npm run build
npm run start
```

## Hướng dẫn chạy Automated E2E Testing (Playwright)

Kịch bản test tự động sẽ giả lập một thiết bị di động (Mobile view), chạy qua toàn bộ 7 bước đặt lịch (từ việc chọn dịch vụ đến khi hoàn tất), tự động chụp ảnh toàn màn hình và quay video.

**1. Chạy test và xem kết quả**

```bash
# Chạy tất cả các bài test
npx playwright test

# Chạy test có giao diện trực quan (UI Mode)
npx playwright test --ui
```

**2. Xem Video và Screenshot**

Sau khi test hoàn tất, nếu có cấu hình quay video và chụp ảnh, các file kết quả sẽ nằm trong thư mục `test-results/`.
Bạn có thể xem báo cáo HTML bằng lệnh:

```bash
npx playwright show-report
```

---
*Được phát triển với phong cách thiết kế hiện đại, tốc độ cao và tối ưu UI/UX.*
"# vicicheckin" 
