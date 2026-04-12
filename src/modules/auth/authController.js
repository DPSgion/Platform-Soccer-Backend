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
        return "KHÔNG KẾT NỐI ĐƯỢC MYSQL.";
    }
    if (err.code === "ER_ACCESS_DENIED_ERROR") {
        return "SAI DB_USER HOẶC DB_PASSWORD.";
    }
    if (err.code === "ER_BAD_DB_ERROR") {
        return "DATABASE KHÔNG TỒN TẠI.";
    }
    return err.message || "LỖI CƠ SỞ DỮ LIỆU.";
}

// REGISTER
exports.register = async (req, res) => {
    const { email, password } = req.body || {};

    try {
        if (!email || !email.includes("@")) {
            return res.status(400).json({
                message: "EMAIL KHÔNG HỢP LỆ."
            });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({
                message: "MẬT KHẨU PHẢI >= 6 KÝ TỰ."
            });
        }

        return res.status(201).json({
            message: "ĐĂNG KÝ THÀNH CÔNG (FAKE)",
            user: { id: 1, email }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "LỖI MÁY CHỦ." });
    }
};

// LOGIN
exports.login = async (req, res) => {
    const { email, password } = req.body || {};

    try {
        if (email !== "test@gmail.com" || password !== "123456") {
            return res.status(401).json({
                message: "EMAIL HOẶC MẬT KHẨU KHÔNG ĐÚNG."
            });
        }

        return res.json({
            message: "ĐĂNG NHẬP THÀNH CÔNG (FAKE)",
            token: "fake-jwt-token",
            user: {
                id: 1,
                email: "test@gmail.com"
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "LỖI MÁY CHỦ." });
    }
};