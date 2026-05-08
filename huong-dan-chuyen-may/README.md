# HƯỚNG DẪN CHUYỂN DỰ ÁN SANG MÁY MỚI BẰNG GITHUB

Vì máy mới của bạn sẽ có cấu trúc ổ đĩa và tên người dùng (User) y hệt như máy hiện tại, quá trình chuyển đổi sẽ cực kỳ trơn tru và giữ lại được 100% dữ liệu, bao gồm cả lịch sử trò chuyện của Antigravity.

Hãy làm theo các bước dưới đây theo thứ tự nhé.

---

## PHẦN 1: TRÊN MÁY TÍNH HIỆN TẠI (MÁY CŨ)

### Bước 1: Đẩy Source Code Lên GitHub
1. Mở Terminal trong VS Code của bạn.
2. Đảm bảo bạn đã lưu tất cả các file và đẩy (Push) code mới nhất lên repository GitHub của bạn:
   ```bash
   git add .
   git commit -m "Backup de chuyen may"
   git push origin main
   ```

### Bước 2: Lưu Trữ Cấu Hình Môi Trường, Database và Dữ liệu Antigravity
Vì lý do bảo mật, GitHub sẽ bỏ qua (không đẩy lên) file cấu hình `.env` và file Database `dev.db`. Do đó, bạn cần copy chúng bằng tay cùng với dữ liệu của Antigravity ra USB hoặc Drive:

1. **Copy file cấu hình:** 
   `D:\Antigravity\.env`
2. **Copy file cơ sở dữ liệu:**
   `D:\Antigravity\prisma\dev.db` *(Nếu bạn muốn giữ lại dữ liệu tài khoản, booking hiện có).*
3. **Nén dữ liệu của Antigravity (để giữ lịch sử chat):**
   - Mở File Explorer và truy cập vào: `C:\Users\Administrator\.gemini\`
   - Click chuột phải vào thư mục `antigravity` và nén nó lại thành file `antigravity-data.zip`.

*=> Kết quả ở phần này: Bạn hãy chép file `.env`, file `dev.db` và file `antigravity-data.zip` vào USB (hoặc Google Drive, Zalo) để mang sang máy mới.*

---

## PHẦN 2: TRÊN MÁY TÍNH MỚI

*Đảm bảo máy mới đã cài đặt sẵn Node.js, Git và VS Code.*

### Bước 1: Clone Source Code Từ GitHub
1. Mở Terminal (Command Prompt hoặc PowerShell).
2. Chuyển vào ổ đĩa D:
   ```bash
   D:
   ```
3. Clone dự án từ GitHub về:
   ```bash
   git clone https://github.com/itvicimix/vicicheckin.git Antigravity
   ```
   *(Việc này sẽ tải code về và tạo ra thư mục `D:\Antigravity` y hệt như máy cũ).*

### Bước 2: Khôi phục Dữ liệu Antigravity và Cấu hình Môi trường
1. **Khôi phục Antigravity:** Truy cập `C:\Users\Administrator\` trên máy mới. Tạo thư mục `.gemini` (nếu chưa có). Sau đó copy file `antigravity-data.zip` vào `C:\Users\Administrator\.gemini\` và giải nén ra.
2. **Khôi phục cấu hình:** Copy file `.env` (từ USB) bỏ vào thư mục dự án: `D:\Antigravity\`
3. **Khôi phục Database:** Copy file `dev.db` (từ USB) bỏ vào thư mục: `D:\Antigravity\prisma\`

### Bước 3: Cài đặt và Khởi động Dự án
1. Mở **VS Code** và chọn `File > Open Folder...`, mở thư mục `D:\Antigravity`.
2. Mở Terminal trong VS Code (`Ctrl + ~` hoặc `Terminal > New Terminal`).
3. Chạy lần lượt các lệnh sau:

```bash
# 1. Cài đặt lại các gói thư viện
npm install

# 2. Khởi tạo kết nối tới Database (Prisma)
npx prisma generate

# 3. Khởi động server
npm run dev
```

4. Sau khi thấy dòng chữ báo server đã chạy ở `http://localhost:3000`, bạn có thể mở trình duyệt và làm việc tiếp như bình thường. Đồng thời, tôi (Antigravity) ở bên góc màn hình cũng đã sẵn sàng với toàn bộ trí nhớ cũ!
