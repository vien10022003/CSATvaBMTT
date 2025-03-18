# Môn học CSAT và BMTT

## Chạy Dự Án Cục Bộ

Để chạy dự án này trên máy của bạn, hãy làm theo các bước sau:

1. **Clone kho lưu trữ**: Sao chép kho lưu trữ này về máy của bạn:

   ```sh
   git clone https://github.com/mushfiqurniazzz/Login-System---Node--MySQL--React
   ```

2. **Di chuyển vào thư mục dự án**: Điều hướng vào thư mục dự án, thực hiện bước 3 cho cả frontend và backend:

   ```sh
   cd backend || frontend
   ```

3. **Cài đặt các gói phụ thuộc**: Cài đặt các gói cần thiết bằng npm hoặc yarn:

   ```sh
   npm install
   ```

   hoặc

   ```sh
   yarn install
   ```

4. **Thiết lập biến môi trường**: Tạo tệp `.env` trong thư mục backend của dự án và thêm các biến được đề cập trong `.env.sample`. của thư mục backend, và sửa các trường JWT_SECRET (tùy ý), DB_DATABASE (theo cơ sở dữ liệu trong máy), DB_PASSWORD, .....

5. **Khởi động máy chủ phát triển**: Vào thư mục backend, chạy lệnh sau để khởi động máy chủ backend:

   ```sh
   npm start
   ```
   Vào thư mục frontend, chạy lệnh sau để khởi động máy chủ frontend:
   ```sh
   yarn dev
   ```

6. **Truy cập ứng dụng**: Mở trình duyệt web và truy cập:
   - Backend: `http://localhost:3000`
   - Frontend: `http://localhost:5173`
   
   Ứng dụng sẽ kết nối với cơ sở dữ liệu MySQL bằng thông tin xác thực được chỉ định trong tệp `.env`.

