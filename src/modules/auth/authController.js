const authService = require("./authService");

function isDbError(err) {
    return (
        err.code === "ECONNREFUSED" ||
        err.code === "ENOTFOUND" ||
        err.code === "ER_ACCESS_DENIED_ERROR" ||
        err.code === "ER_BAD_DB_ERROR" ||
        err.code === "PROTOCOL_CONNECTION_LOST"
    );
}

function dbErrorMessage(err) {
    if (err.code === "ECONNREFUSED") {
        return "Không kết nối được MySQL (ECONNREFUSED). Kiểm tra DB_HOST/DB_PORT hoặc bật USE_MEMORY_AUTH=true để test Postman không cần DB.";
    }
    if (err.code === "ER_ACCESS_DENIED_ERROR") {
        return "Sai DB_USER hoặc DB_PASSWORD.";
    }
    if (err.code === "ER_BAD_DB_ERROR") {
        return "Database không tồn tại. Tạo DB (DB_NAME) hoặc dùng USE_MEMORY_AUTH=true.";
    }
    return err.message || "Lỗi cơ sở dữ liệu.";
}

exports.register = async (req, res) => {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    try {
        const result = await authService.register(body);
        return res.status(201).json(result);
    } catch (err) {
        if (err.code === "INVALID_EMAIL") {
            return res.status(400).json({ message: "Email không hợp lệ." });
        }
        if (err.code === "INVALID_PASSWORD") {
            return res.status(400).json({
                message: "Mật khẩu phải có ít nhất 6 ký tự."
            });
        }
        if (err.code === "EMAIL_EXISTS") {
            return res.status(409).json({ message: "Email đã được đăng ký." });
        }
        if (isDbError(err)) {
            console.error(err);
            return res.status(503).json({
                message: dbErrorMessage(err),
                code: err.code
            });
        }
        console.error(err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

exports.login = async (req, res) => {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    try {
        const result = await authService.login(body);
        return res.json(result);
    } catch (err) {
        if (err.code === "INVALID_CREDENTIALS") {
            return res.status(401).json({
                message: "Email hoặc mật khẩu không đúng."
            });
        }
        if (isDbError(err)) {
            console.error(err);
            return res.status(503).json({
                message: dbErrorMessage(err),
                code: err.code
            });
        }
        console.error(err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};
