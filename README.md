# TomQ Bridal Atelier 💍

Dự án website thời trang cưới cao cấp TomQ Bridal tích hợp tính năng Thử đồ AI, Quản lý sản phẩm (Áo cưới cô dâu & Vest chú rể), Blog SEO và Hệ thống Quản trị (Admin CMS).

---

## 🛠️ Công nghệ sử dụng

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: SQLite tích hợp sẵn (`node:sqlite` - Node.js >= 22.5, không cần cài server DB ngoài)
- **Editor**: TipTap Rich Text Editor (hỗ trợ SEO heading, chèn ảnh inline)
- **State Management**: Zustand
- **Xác thực**: JWT + Bcryptjs (Cookie-based auth cho trang Quản trị)

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### 1. Yêu cầu môi trường
- Node.js >= 22.5 (khuyến nghị Node 22+)
- npm >= 10

### 2. Cài đặt thư viện
```bash
npm install
```

### 3. Khởi tạo cơ sở dữ liệu mẫu (Seed Data)
```bash
npm run seed
```
> Script sẽ tự động tạo database tại `data/app.db` cùng các dữ liệu mẫu: Danh mục, Chất liệu, Kiểu dáng, Màu sắc, Size, Sản phẩm, Blog, Đơn hàng và Lịch hẹn mẫu.

### 4. Chạy môi trường phát triển (Development)
```bash
npm run dev
```
Truy cập ứng dụng tại: [http://localhost:3000](http://localhost:3000)

### 5. Build kiểm tra sản phẩm (Production Build)
```bash
npm run build
npm start
```

---

## 🔐 Thông tin đăng nhập Quản trị (Admin CMS)

- **URL quản trị**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Tài khoản mặc định**: `owner@tomqbridal.com`
- **Mật khẩu mặc định**: `ChangeMe123!`

*(Bạn có thể cấu hình lại trong file `.env` qua các biến `ADMIN_DEFAULT_EMAIL` và `ADMIN_DEFAULT_PASSWORD`).*

---

## ⚙️ Cấu hình biến môi trường (.env)

Xem file [.env.example](file:///e:/TomQ-Bridal-2/.env.example):
- `DATABASE_PATH`: Đường dẫn file SQLite (mặc định `./data/app.db`)
- `JWT_SECRET`: Khóa bí mật ký JWT
- `AI_TRYON_PROVIDER`: Nhà cung cấp dịch vụ thử đồ AI (`mock`, `openai`, hoặc `gemini`)
- `OPENAI_API_KEY` / `GEMINI_API_KEY`: API key khi kích hoạt thử đồ thật