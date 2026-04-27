# Platform-Soccer-Backend
HƯỚNG DẪN TEST BACKEND 
Mục tiêu hướng dẫn: 
- Chạy project trên máy local 
- Chạy test tự động (Jest)
- Cách lấy Token
- Chạy load test (k6)
- Kiểm tra lỗi trước khi push code 

TRƯỜNG HỢP CHƯA CÓ PROJECT:
1. Clone project:
- Mở terminal (Git Bash / CMD):
    + Gõ: git clone https://github.com/DPSgion/Platform-Soccer-Backend.git
- Vào project:
    + Gõ: cd Platform-Soccer-Backend
- Mở VS Code:
    + Gõ: code . 

TRƯỜNG HỢP ĐÃ CÓ PROJECT 
1. Lấy code nhánh Tester:
    + Gõ: git branch -a  
    → Tìm: remotes/origin/feat/swagger-tester  
    + Gõ: git checkout -b feat/swagger-tester origin/feat/swagger-tester 
    + Kiểm tra file : dir

2. Cài thư viện trong VS Code: 
    + Gõ: npm install
    ⚠️ Lưu ý: Cần có file .env để chạy project (nếu chưa có thì tạo)

3. Chạy server:
    + Gõ: npm run dev 
    + Hoặc: npm start 
    + Khi chạy thành công sẽ thấy: Server running on port 3000

4. Chạy test tự động (Jest): 
    + Sau khi hiện dòng thành công ở trên, nếu gặp lỗi PowerShell, chọn mũi tên nhỏ cạnh dấu + → chọn Command Prompt
    + Chạy test, gõ: npx jest api-test/<ten-file>.test.js 
    + ví dụ : npx jest api-test/teams.test.js 
    + Có thể chạy tất cả test: npm test
    ⚠️ Lưu ý:  file auth.test.js cài thêm npm install zod

5. Lấy Token (Dùng Postman):
- Gọi API login:
    + POST /auth/login
    -> https://backend.cupzone.fun/auth/login
- Nhập body ví dụ: 
    {
    "email": "test123@gmail.com",
    "password": "123456"
    }
- Nhấn Send → copy token trong response để test
6. Chạy load test (k6): 
- Tải k6:
    + Gõ: choco install k6
- Chạy test:
    + Gõ: k6 run -e TOKEN=TOKEN_CUA_BAN k6/team-load-test.js

7. Cách đọc kết quả test:
- Jest:
    PASS → API hoạt động đúng
    FAIL → API có lỗi
- k6:
    Thông số	            Ý nghĩa
    checks_succeeded	    % test pass
    http_req_failed	        % request lỗi

Quy trình:
1. Code endpoint
2. Chạy Jest test
3. Fix lỗi nếu fail
4. (Optional) chạy k6
5. Push code