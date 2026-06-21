# Hostel Management Web App (Frontend)

Trang giao diện ứng dụng quản lý nhà trọ được xây dựng trên Next.js 16 (App Router), TailwindCSS v4, TypeScript, và thư viện UI shadcn/ui. Giao diện được thiết kế hiện đại, tương thích hoàn toàn trên thiết bị di động.

---

## 📂 Cấu Trúc Thư Mục

```text
frontend/
├── public/              # File tĩnh (Logo, favicon, ảnh mặc định...)
├── src/
│   ├── app/             # Các trang (App Router)
│   │   ├── dashboard/   # Trang quản lý tổng quan & phân hệ con
│   │   │   ├── rooms/      # Phân hệ quản lý phòng trọ
│   │   │   ├── tenants/    # Phân hệ quản lý khách thuê (thông tin, CCCD)
│   │   │   ├── utilities/  # Phân hệ chốt chỉ số điện nước theo tháng
│   │   │   ├── payments/   # Phân hệ quản lý hóa đơn & trạng thái thanh toán
│   │   │   ├── layout.tsx  # Bố cục trang dashboard (Sidebar + Mobile Drawer)
│   │   │   └── page.tsx    # Giao diện dashboard tổng quan (Xem số liệu thống kê)
│   │   ├── login/       # Trang đăng nhập của quản trị viên
│   │   ├── globals.css  # CSS toàn cục & Cấu hình theme TailwindCSS
│   │   ├── layout.tsx   # Layout cấu hình root font (Inter) và Toast
│   │   └── page.tsx     # Route gốc (Tự động kiểm tra auth & điều hướng)
│   ├── components/      # Các component UI của hệ thống & shadcn/ui
│   ├── hooks/           # Custom hook (useAuth.ts quản lý phiên đăng nhập)
│   ├── lib/
│   │   ├── api.ts       # Axios Client, Interceptors đính kèm JWT và định nghĩa API
│   │   └── utils.ts     # Các hàm bổ trợ định dạng ngày, tiền tệ, trạng thái
├── .env.example         # File mẫu cấu hình biến môi trường
├── .env                 # File cấu hình biến môi trường chính thức (được gitignore)
├── components.json      # Cấu hình cài đặt shadcn/ui
├── next.config.ts       # Cấu hình Next.js (cho phép hiển thị ảnh CCCD tải lên từ Server)
├── package.json
└── tsconfig.json
```

---

## ⚙️ Cấu Môi Trường (.env)

Tạo file `.env` ở thư mục `frontend/` để kết nối tới Backend API và hiển thị ảnh tải lên:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_UPLOAD_URL=http://localhost:5000
```

---

## 🛠️ Hướng Dẫn Vận Hành

### 1. Cài đặt Dependencies:
```bash
pnpm install
```

### 2. Khởi chạy ở chế độ phát triển (Development):
```bash
pnpm dev
```
Trình duyệt sẽ tự động mở hoặc bạn truy cập thủ công địa chỉ `http://localhost:3000`.

### 3. Build ứng dụng cho môi trường production:
```bash
pnpm build
pnpm start
```

---

## ✨ Điểm Nổi Bật về Tính Năng & Giao Diện

- **Xác thực an toàn:** Sử dụng JWT tự động gia hạn phiên đăng nhập khi tải trang.
- **Thao tác mượt mà:** 100% chức năng CRUD (Thêm, Sửa, Xóa) sử dụng **Dialog (Modal)** của shadcn/ui. Không cần chuyển trang giúp tăng tốc độ thao tác của người quản lý.
- **Quản lý Điện Nước Trực Quan:** Cho phép chọn Tháng/Năm, ghi lại số điện và số nước. Khi ấn "Chốt số", hệ thống sẽ tự động tính ra lượng chênh lệch tiêu thụ so với kỳ trước để người dùng dễ theo dõi.
- **Tải ảnh CCCD:** Cho phép chọn ảnh thẻ từ máy tính/điện thoại và lưu trữ trực tiếp lên server để quản lý thông tin khách thuê an toàn.
- **Tương thích Mobile:** Thanh Sidebar tự động thu gọn thành Drawer ở màn hình nhỏ, bố cục danh sách phòng tự co giãn phù hợp thao tác bằng điện thoại.
