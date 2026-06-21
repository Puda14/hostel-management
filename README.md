# Hostel Management System (Quản Lý Nhà Trọ A Đạt)

Hệ thống quản lý nhà trọ bao gồm hai phần chính: **Server (Backend API)** và **Frontend (Web Application)**. Dự án được phát triển nhằm tối ưu hóa việc quản lý phòng trọ, danh sách khách thuê, chốt chỉ số điện nước định kỳ và theo dõi hóa đơn thanh toán hàng tháng.

---

## 🏗️ Kiến Trúc Dự Án

Thư mục dự án được tổ chức như sau:
*   [server/](file:///c:/Users/DatPhung/Desktop/hostel-management/server) - Backend API sử dụng Node.js, Express và MongoDB Atlas.
*   [frontend/](file:///c:/Users/DatPhung/Desktop/hostel-management/frontend) - Giao diện Web sử dụng Next.js (App Router), TailwindCSS v4 và shadcn/ui.

---

## 🛠️ Công Nghệ Sử Dụng

### Server (Backend)
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** MongoDB Atlas (sử dụng Mongoose ODM)
- **Authentication:** JWT (JSON Web Token) & bcryptjs
- **File Upload:** Multer (lưu ảnh CCCD vào thư mục cục bộ)
- **Security:** Helmet, CORS, Express Rate Limit

### Frontend (User Interface)
- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** TailwindCSS v4, shadcn/ui, Lucide Icons
- **HTTP Client:** Axios (cấu hình interceptor quản lý JWT tự động)
- **Notifications:** Sonner (Toast notifications)

---

## 🗝️ Tài Khoản Đăng Nhập Mặc Định

Hệ thống sử dụng cơ chế tài khoản quản trị duy nhất cố định (không hỗ trợ đăng ký tự do):
- **Tên đăng nhập:** `adat123`
- **Mật khẩu:** `quanlynhatroadat`

---

## ⚡ Hướng Dẫn Chạy Dự Án Nhanh

### Bước 1: Khởi động Server (Backend)

1. Mở terminal tại thư mục `/server`.
2. Tạo file cấu hình môi trường `.env` từ file ví dụ:
   ```bash
   cp .env.example .env
   ```
   *(File `.env` đã được cấu hình mặc định liên kết tới database MongoDB Atlas của dự án).*
3. Cài đặt các gói thư viện phụ thuộc:
   ```bash
   pnpm install
   ```
4. Chạy lệnh seed dữ liệu mẫu (chỉ cần chạy một lần duy nhất để tạo tài khoản admin và sinh dữ liệu các phòng ban đầu):
   ```bash
   pnpm seed
   ```
5. Chạy server ở chế độ phát triển (development):
   ```bash
   pnpm dev
   ```
   *Server sẽ chạy tại địa chỉ: `http://localhost:5000`*

### Bước 2: Khởi động Frontend (UI)

1. Mở terminal thứ hai tại thư mục `/frontend`.
2. Tạo file cấu hình môi trường `.env` từ file ví dụ:
   ```bash
   cp .env.example .env
   ```
   *(Đã được cấu hình mặc định trỏ API URL về `http://localhost:5000/api`)*
3. Cài đặt các gói thư viện phụ thuộc:
   ```bash
   pnpm install
   ```
4. Chạy ứng dụng Next.js ở chế độ phát triển:
   ```bash
   pnpm dev
   ```
   *Giao diện web sẽ hoạt động tại địa chỉ: `http://localhost:3000`*

---

## 📖 Hướng Dẫn Chi Tiết Cho Từng Phần
Để biết chi tiết về cấu trúc mã nguồn, API Endpoints, và các tính năng chi tiết, hãy tham khảo các file hướng dẫn riêng biệt:
- Xem chi tiết tại [Server README](file:///c:/Users/DatPhung/Desktop/hostel-management/server/README.md)
- Xem chi tiết tại [Frontend README](file:///c:/Users/DatPhung/Desktop/hostel-management/frontend/README.md)
