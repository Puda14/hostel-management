# Hostel Management API (Server)

Phần Backend cung cấp RESTful APIs quản lý toàn bộ nghiệp vụ nhà trọ, sử dụng Express.js và cơ sở dữ liệu MongoDB Atlas.

---

## 📂 Cấu Trúc Thư Mục

```text
server/
├── src/
│   ├── config/          # Cấu hình kết nối cơ sở dữ liệu (db.js)
│   ├── controllers/     # Controller xử lý logic nghiệp vụ
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── paymentController.js
│   │   ├── roomController.js
│   │   ├── tenantController.js
│   │   └── utilityController.js
│   ├── middleware/      # Các middleware (xác thực, tải tệp, xử lý lỗi)
│   │   ├── auth.js      # Middleware xác thực JWT
│   │   ├── errorHandler.js
│   │   └── upload.js    # Cấu hình Multer tải ảnh CCCD lên server
│   ├── models/          # Mongoose Schemas (User, Room, Tenant, Utility, Payment)
│   ├── routes/          # Danh sách API Endpoints tương ứng
│   ├── index.js         # Điểm khởi tạo server (Express app, middleware cấu hình)
│   └── seed.js          # Script sinh dữ liệu mẫu ban đầu
├── uploads/             # Thư mục lưu trữ ảnh tải lên cục bộ (CCCD...)
├── .env.example         # File mẫu cấu hình biến môi trường
├── .env                 # File cấu hình biến môi trường chính thức (được gitignore)
├── package.json
└── pnpm-lock.yaml
```

---

## ⚙️ Cấu Hình Môi Trường (.env)

Tạo file `.env` trong thư mục `server/` với nội dung cấu hình sau:

```env
PORT=5000
MONGODB_URI=mongodb+srv://pdathp14_db_user:hQKvZucCElc8SMWd@nha-tro-a-dat-cong-gia.u7heifw.mongodb.net
JWT_SECRET=supersecretjwtkeyforhostelmanagement123!
```

---

## 🛠️ Hướng Dẫn Vận Hành

### 1. Cài đặt Dependencies:
```bash
pnpm install
```

### 2. Seed dữ liệu khởi tạo:
Sinh tài khoản admin và tạo 8 phòng mặc định (từ Phòng 101 tới Phòng 204):
```bash
pnpm seed
```

### 3. Khởi chạy ở chế độ phát triển (Development):
```bash
pnpm dev
```
Nodemon sẽ tự động khởi động lại server khi phát hiện thay đổi trong mã nguồn.

### 4. Khởi chạy ở chế độ Production:
```bash
pnpm start
```

---

## 📡 Tài Liệu API Endpoints

Tất cả các API được bảo mật bằng cơ chế JWT Bearer Token, ngoại trừ API đăng nhập. Gửi kèm header: `Authorization: Bearer <your_jwt_token>`

### 🔑 Authentication (Xác thực)
*   `POST /api/auth/login` - Đăng nhập tài khoản admin.
    - Request: `{ "username": "adat123", "password": "quanlynhatroadat" }`
    - Response: Trả về mã `token` và thông tin `user`.

### 📊 Dashboard (Tổng quan)
*   `GET /api/dashboard` - Thống kê số lượng phòng, người ở, doanh thu và hóa đơn chưa thanh toán.

### 🚪 Rooms (Quản lý Phòng)
*   `GET /api/rooms` - Lấy danh sách toàn bộ phòng và người ở trong phòng.
*   `GET /api/rooms/:id` - Chi tiết phòng kèm danh sách thành viên chi tiết.
*   `POST /api/rooms` - Tạo phòng trọ mới.
*   `PUT /api/rooms/:id` - Cập nhật thông tin phòng (gán trưởng phòng, đổi tiền cọc...).
*   `DELETE /api/rooms/:id` - Xóa phòng trọ (chỉ xóa được khi phòng trống).

### 👥 Tenants (Quản lý Khách thuê)
*   `GET /api/tenants` - Danh sách khách thuê (hỗ trợ lọc theo phòng hoặc tìm kiếm theo tên/SĐT).
*   `GET /api/tenants/:id` - Chi tiết khách thuê.
*   `POST /api/tenants` - Thêm mới khách thuê (hỗ trợ upload ảnh CCCD bằng multipart/form-data).
*   `PUT /api/tenants/:id` - Cập nhật thông tin khách thuê.
*   `DELETE /api/tenants/:id` - Xóa khách thuê khỏi hệ thống.

### ⚡ Utilities (Quản lý Điện nước)
*   `GET /api/utilities` - Lấy danh sách số điện, nước theo tháng/năm.
*   `POST /api/utilities` - Chốt chỉ số điện/nước mới cho một phòng trong tháng cụ thể.
*   `PUT /api/utilities/:id/finalize` - Khóa sổ (chốt hóa đơn điện nước) -> Tính toán mức tiêu thụ điện nước.
*   `PUT /api/utilities/:id/unfinalize` - Mở khóa chỉ số để chỉnh sửa.

### 💵 Payments (Quản lý Hóa đơn)
*   `GET /api/payments` - Danh sách hóa đơn.
*   `POST /api/payments` - Tạo hóa đơn tháng cho một phòng.
*   `PUT /api/payments/:id/pay` - Đánh dấu hóa đơn đã thanh toán.
*   `PUT /api/payments/:id/unpay` - Hủy đánh dấu thanh toán (chuyển về trạng thái chưa thanh toán).
*   `DELETE /api/payments/:id` - Xóa hóa đơn.
