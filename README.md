# Dự án Click_Buy - Hệ thống bán hàng đa nền tảng

## 1. Giới thiệu

Đây là dự án bán hàng đa nền tảng gồm:
- **Mobile App (React Native + Expo):** Cho khách hàng mua sắm, đặt hàng, quản lý tài khoản.
- **Admin Dashboard (React + Vite):** Cho quản trị viên quản lý đơn hàng, người dùng, sản phẩm.
- **Backend API (Node.js + Express + MongoDB):** Xử lý logic, xác thực, lưu trữ dữ liệu.

---
## 2. Cấu trúc thư mục

```plaintext
.
├── admin-dashboard/         # Mã nguồn dashboard quản trị (React)
├── api/                    # Backend API (Node.js/Express)
├── assets/                 # Hình ảnh, fonts dùng chung cho app
├── components/             # Các component dùng chung cho app mobile
├── navigation/             # Điều hướng (navigation) cho app mobile
├── redux/                  # Redux reducers cho app mobile
├── screens/                # Các màn hình (views) của app mobile
├── [store.js](http://_vscodecontentref_/0)                # Cấu hình Redux store
├── [App.js](http://_vscodecontentref_/1)                  # Entry point của app mobile
├── [UserContext.js](http://_vscodecontentref_/2)          # Context quản lý trạng thái người dùng
├── [config.js](http://_vscodecontentref_/3)               # File cấu hình chung (API_URL, v.v.)
├── [package.json](http://_vscodecontentref_/4)            # Thông tin và dependencies của app mobile
├── README.md               # Tài liệu này
└── ...
3. Hướng dẫn cài đặt
    3.1. Cài đặt backend API
        cd api
        yarn install
        yarn start
    Sửa file api/index.js để cập nhật chuỗi kết nối MongoDB và cấu hình email nếu cần.
    3.2. Cài đặt admin-dashboard
        cd admin-dashboard
        npm install
        npm run dev
    Truy cập dashboard tại http://localhost:5173
    3.3. Cài đặt mobile app
        npm install
        npx expo start
    Quét QR code bằng Expo Go trên điện thoại hoặc chạy trên máy ảo.
4. Cấu hình kết nối API
    Trên máy ảo Android: Dùng http://10.0.2.2:8000
    Trên điện thoại thật: Dùng http://<IP_MAY_TINH>:8000 (ví dụ: http://192.168.0.239:8000)
    Sửa trong file config.js hoặc trực tiếp trong các file gọi API.
5. Một số lệnh hữu ích
    # Cài dependencies cho toàn bộ dự án
    npm install

    # Xóa cache Metro bundler (React Native)
    npx react-native start --reset-cache

    # Chạy lại backend
    cd api
    yarn start
6. Liên hệ & đóng góp
Nếu có vấn đề, vui lòng tạo issue hoặc liên hệ nhóm phát triển.
Đóng góp code, ý tưởng đều được hoan nghênh!
