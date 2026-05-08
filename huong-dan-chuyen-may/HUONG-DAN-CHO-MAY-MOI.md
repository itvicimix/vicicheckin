# HƯỚNG DẪN CÀI ĐẶT TRÊN MÁY TÍNH MỚI

*Đảm bảo máy tính mới đã cài đặt sẵn Node.js, Git và VS Code.*

## BƯỚC 1: TẢI SOURCE CODE TỪ GITHUB
1. Mở Terminal (Command Prompt hoặc PowerShell).
2. Chuyển vào ổ đĩa D:
   ```bash
   D:
   ```
3. Tải code từ GitHub về:
   ```bash
   git clone https://github.com/itvicimix/vicicheckin.git Antigravity
   ```
*(Thao tác này sẽ tạo ra thư mục `D:\Antigravity` y hệt như máy cũ).*

---

## BƯỚC 2: KHÔI PHỤC DỮ LIỆU TỪ FILE BACKUP
Ở máy cũ, bạn đã mang theo file nén **`Backup-Cho-May-Moi.zip`**. Hãy giải nén file này ra. Bên trong bạn sẽ thấy:
- File `.env` (Cấu hình hệ thống)
- File `dev.db` (Dữ liệu database SQLite)
- Thư mục `antigravity` (Dữ liệu trí nhớ và lịch sử trò chuyện của AI)

Hãy copy chúng về đúng vị trí như sau:

1. **Khôi phục cấu hình:** Copy file `.env` bỏ trực tiếp vào thư mục dự án `D:\Antigravity\`.
2. **Khôi phục Database:** Copy file `dev.db` bỏ vào thư mục `D:\Antigravity\prisma\`. *(Lưu ý: Chép đúng vào bên trong thư mục prisma)*
3. **Khôi phục trí nhớ của AI:** 
   - Truy cập đường dẫn `C:\Users\Administrator\` trên máy tính mới. 
   - Tạo một thư mục mới tên là `.gemini` (nếu chưa có). 
   - Copy thư mục `antigravity` bỏ vào trong thư mục `.gemini` vừa tạo. 
   *(Đường dẫn chuẩn sau khi copy là: `C:\Users\Administrator\.gemini\antigravity`)*

---

## BƯỚC 3: CÀI ĐẶT & CHẠY DỰ ÁN
1. Mở **VS Code** và chọn `File > Open Folder...`, mở thư mục `D:\Antigravity`.
2. Mở Terminal trong VS Code (`Ctrl + ~` hoặc `Terminal > New Terminal`).
3. Chạy lần lượt 3 lệnh sau:

```bash
# 1. Cài đặt lại các gói thư viện
npm install

# 2. Khởi tạo kết nối Database (Prisma)
npx prisma generate

# 3. Khởi động Server
npm run dev
```

**Hoàn tất!** Bạn có thể truy cập `http://localhost:3000` để bắt đầu làm việc. Đồng thời, tôi (Antigravity) cũng đã được đồng bộ toàn bộ trí nhớ cũ, sẵn sàng hỗ trợ bạn trên máy mới!
