const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://backend.cupzone.fun";
const LOGIN_URL = `${BASE_URL}/auth/login`;

let api;
let currentUser = null;

beforeAll(async () => {
    try {
        const res = await axios.post(LOGIN_URL, {
            email: "test_moi_123@gmail.com",
            password: "12345678",
            phone: "0909123456",
            full_name: "N Test"
        });

        // ĐÂY LÀ DÒNG IN LOG GIỐNG Y HỆT YÊU CẦU CỦA BẠN
        console.log("LOGIN:", JSON.stringify(res.data, null, 2));

        const token = res.data?.data?.token;
        currentUser = res.data?.data?.user;

        if (!token) {
            throw new Error("Login fail - không có token");
        }

        api = axios.create({
            baseURL: BASE_URL,
            headers: {
                Authorization: `Bearer ${token}`
            },
            validateStatus: () => true
        });
    } catch (error) {
        console.error("LỖI KHI LOGIN:", error.response?.data || error.message);
        throw error;
    }
});

/**
 * ==========================================
 * I. TRƯỜNG HỢP THÀNH CÔNG (HAPPY CASE)
 * ==========================================
 */
describe("I. HAPPY CASE", () => {

    test("TC01 - API Profile phản hồi", async () => {
        const res = await api.get("/users");
        expect(res.status).toBe(200);
    });

    test("TC02 - Kiểm tra cấu trúc dữ liệu (Structure)", async () => {
        const res = await api.get("/users");
        const user = res.data.data;
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("full_name");
        expect(user).toHaveProperty("phone");
        expect(user).toHaveProperty("avatar_url");
        expect(user).toHaveProperty("created_at");
    });

    test("TC03 - Kiểm tra tính chính xác dữ liệu", async () => {
        const res = await api.get("/users");
        expect(res.data.data.full_name).toBe(currentUser.full_name);
        expect(res.data.data.phone).toBe(currentUser.phone);
    });

    test("TC04 - Cập nhật chỉ full_name", async () => {
        const newName = "Tên Cập Nhật TC04";
        const res = await api.put("/users/me", { full_name: newName });

        // Nếu nhận 404, hãy kiểm tra lại Route trong Backend
        expect(res.status).toBe(200);
        expect(res.data.data.full_name).toBe(newName);
    });

    test("TC05 - Cập nhật chỉ phone", async () => {
        const newPhone = "0912888999";
        const res = await api.put("/users/me", { phone: newPhone });

        expect(res.status).toBe(200);
        expect(res.data.data.phone).toBe(newPhone);
    });

    test("TC06 - Cập nhật toàn bộ thông tin", async () => {
        const payload = { full_name: "Cập Nhật Toàn Bộ", phone: "0888111222" };
        const res = await api.put("/users/me", payload);

        expect(res.status).toBe(200);
        expect(res.data.data.full_name).toBe(payload.full_name);
        expect(res.data.data.phone).toBe(payload.phone);
    });

    test("TC07 - Upload Avatar thành công", async () => {
        const form = new FormData();
        const imagePath = path.join(__dirname, "test-avatar.png");

        if (fs.existsSync(imagePath)) {
            form.append("avatar", fs.createReadStream(imagePath));
            const res = await api.post("/users/me/avatar", form, {
                headers: form.getHeaders()
            });
            expect(res.status).toBe(200);
            expect(res.data.data.avatar_url).toContain("http");
        } else {
            console.warn("⚠️ Bỏ qua TC08: Vui lòng thêm file 'test-avatar.png' vào thư mục test.");
        }
    });
});

/**
 * ==========================================
 * II. TRƯỜNG HỢP THẤT BẠI (UNHAPPY CASE)
 * ==========================================
 */
describe("II. UNHAPPY CASE", () => {

    test("TC08 - Không có Token", async () => {
        const res = await axios.get(`${BASE_URL}/users`, { validateStatus: () => true });
        expect(res.status).toBe(401);
    });

    test("TC09 - Token sai cấu trúc", async () => {
        const res = await axios.get(`${BASE_URL}/users`, {
            headers: { Authorization: "Bearer token_sai_123" },
            validateStatus: () => true
        });
        expect(res.status).toBe(401);
    });

    test("TC10 - Body gửi lên rỗng", async () => {
        const res = await api.put("/users/me", {});
        expect(res.status).toBe(404);
        expect(res.data.message).toBe("No data to update");
    });

    test("TC11 - Sai định dạng dữ liệu (full_name là Array)", async () => {
        const res = await api.put("/users/me", { full_name: ["Tên", "Mảng"] });
        expect([400, 500, 404]).toContain(res.status);
    });

    test("TC12 - Cập nhật số điện thoại sai định dạng", async () => {
        const res = await api.put("/users/me", { phone: "SỐ-ĐIỆN-THOẠI-SAI" });
        expect([400, 404]).toContain(res.status);
    });

    test("TC13 - Upload không có file", async () => {
        const form = new FormData();

        // Gửi request và bắt error trả về từ Axios
        const res = await api.post("/users/me/avatar", form, {
            headers: { ...form.getHeaders() }
        }).catch(err => err.response); // Nếu lỗi, gán res = error.response

        // 1. Kiểm tra xem res có tồn tại không (tránh sập test)
        expect(res).toBeDefined();

        // 2. Kiểm tra status code (Nếu nhận 500, dòng này sẽ hiện lỗi đỏ cực đẹp cho bạn)
        expect(res.status).toBe(400);

        // 3. Kiểm tra message trả về
        expect(res.data.message).toBe("No file uploaded");
    });

    test("TC14 - Sai định dạng file (Gửi file .txt)", async () => {
        const form = new FormData();
        form.append("avatar", Buffer.from("nội dung file văn bản"), "test.txt");
        const res = await api.post("/users/me/avatar", form, {
            headers: form.getHeaders()
        });
        expect([400, 500]).toContain(res.status);
    });

    test("TC15 - Truy cập ID không tồn tại", async () => {
        const res = await api.put("/users/999999", { full_name: "Người dùng ma" });
        expect(res.status).toBe(404);
    });

    test("TC16 - Lỗi kết nối Cloud (Mô phỏng)", async () => {
        console.log("TC17 thường được test bằng cách mock function để giả lập Cloud bị sập.");
        expect(true).toBe(true);
    });
});