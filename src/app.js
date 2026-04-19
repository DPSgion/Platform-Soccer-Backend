const express = require("express");
const routes = require("./routes");
const pool = require("./dbConfig");

const app = express();
const { errorMiddleware } = require("./middlewares/errorMiddleware");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/test-db", async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM users');
        
        res.json({
            success: true,
            description: "Dữ liệu từ database của Hào",
            data: results
        });

    } catch (err) {
        console.error("Lỗi truy vấn DB:", err); 
        return res.status(500).json({
            success: false,
            error: err.message,
            host_checked: process.env.DB_HOST || "127.0.0.1"
        });
    }
});

app.get("/", (req, res) => {
    res.json({
        message: "Cupzone Backend Running"
    });
});

app.get("/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

app.get("/test", (req, res) => {
    res.send(`
        <h2>LOGIN TEST</h2>
        <form method="POST" action="/auth/login">
            <input name="email" value="test@gmail.com"/><br/>
            <input name="password" value="123456"/><br/>
            <button type="submit">Login</button>
        </form>
    `);
});

app.use("/uploads", express.static("uploads"));
app.use("/", routes);
app.use(errorMiddleware);

module.exports = app;
