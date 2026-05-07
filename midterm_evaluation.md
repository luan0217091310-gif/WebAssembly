# Đánh giá WebAssembly Midterm Project

## 1. Các tính năng yêu cầu trong PDF (Chủ đề 7 - WebAssembly for High Performance)
- **Cốt lõi**: Kết nối C/C++ với JavaScript, sử dụng browser execution sandbox, giảm tải tính toán nặng xuống Wasm.
- **Demo**: 
  - Biên dịch một thuật toán xử lý ảnh từ C++ sang Wasm.
  - Chạy thực thi trực tiếp trên trình duyệt.
  - So sánh tốc độ thực thi với phiên bản code bằng JavaScript thuần (Pure JS).
- **Yêu cầu chung**: 
  - Giao diện (UI/UX) theo chuẩn hiện đại.
  - Hệ thống áp dụng kiến trúc MVC hoặc Component-based.
  - Yêu cầu nộp file `README.md` có hướng dẫn cài đặt, thông tin database.

## 2. Các tính năng Web hiện tại đã làm được
- ✅ **Thuật toán xử lý ảnh**: Đã chuẩn bị file C++ (`image_processing.cpp`) chứa các vòng lặp xử lý ảnh (Đảo màu / Trắng Đen).
- ✅ **WebAssembly**: Đã biên dịch ra `image_processing.wasm` và file `image_processing.wat` để trình diễn.
- ✅ **Tính năng Benchmark (So sánh)**: Trang web cho phép tải ảnh lên, so sánh chính xác thời gian thực thi xử lý (Execution time) giữa JS và WASM, bao gồm cả biểu đồ.
- ✅ **Kiến trúc MVC**: Ứng dụng PHP tuân thủ chặt chẽ mô hình MVC (`app/controllers`, `app/models`, `app/views`).
- ✅ **Lưu dữ liệu lịch sử**: Tích hợp cơ sở dữ liệu MySQL (qua PDO) cho phép ghi nhận lịch sử hiệu suất của mỗi lần Benchmark (Làm việc trơn tru với cấu hình mặc định của XAMPP).
- ✅ **Giao diện**: File CSS đã được viết lại toàn bộ, loại bỏ các chi tiết thừa thãi, rườm rà. Giao diện hiện tại rất gọn gàng, độc quyền tự thiết kế (không giống các template trên mạng), hỗ trợ đầy đủ Dark Mode nhưng vẫn giữ sự thân thiện.
- ✅ **Tài liệu**: Tích hợp sẵn `database.sql`, `architecture.puml` và `README.md` đã đồng bộ chuẩn thông tin kết nối DB.

## 3. Bảng đối chiếu tiêu chí chấm điểm (Phần Source Code & Demo)

| Tiêu chí | Mô tả tiêu chí từ file PDF | Mức độ đáp ứng | Đánh giá chi tiết của Code hiện tại |
| :--- | :--- | :---: | :--- |
| **Scope & Complexity (3.0đ)** | Ứng dụng chạy thực tế, xử lý hoàn chỉnh các yêu cầu của chủ đề (Wasm vs JS). | **100%** | Web xử lý truyền nhận ArrayBuffer bộ nhớ chia sẻ. So sánh trực tiếp tốc độ. Áp dụng thêm MVC Backend để lưu log thay vì chỉ thuần Frontend. |
| **Modern UI/UX** | Giao diện thân thiện người dùng, chuẩn hiện đại. | **100%** | Giao diện được tối giản (Simple & Unique) theo yêu cầu cá nhân, có Toast Notifications, Chart bar và Mode Toggle. |
| **Code Architecture** | Project cấu trúc logic theo mô hình MVC / Component. | **100%** | Cấu trúc rành mạch qua router `public/index.php` định tuyến đến `app/controllers`. |
| **Missing Instructions Penalty** | Có `README.md`, setup instructions, credentials. | **100%** | Có `README.md` đầy đủ hướng dẫn, file `.sql` kèm theo không bị lỗi cấu hình DB name. |

---

### Các việc bạn cần hoàn thiện để đạt điểm tối đa (5.0 điểm Report + 2.0 điểm Video):
1. Đưa sơ đồ từ file `architecture.puml` (nếu cần) vào báo cáo Word/PDF.
2. Viết phần lý thuyết, phân tích so sánh giữa JS và Wasm, giải thích chi tiết quy trình đưa dữ liệu ảnh xuống tuyến Wasm trong mục báo cáo.
3. Quay video tối đa 15 phút trình bày kiến trúc và Demo ứng dụng.
