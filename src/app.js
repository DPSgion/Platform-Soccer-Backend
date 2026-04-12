require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();

const routes = require("./routes");
const db = require("./dbConfig");

app.use(cors());
app.use(express.json());

app.get("/test-db", async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM users');
        
        res.json({
            success: true,
            description: "Dữ liệu từ database của Hào",
            data: results
        });
    } catch (err) {
        console.error("Lỗi truy vấn DB:", err);
        res.status(500).json({
            success: false,
            error: "Không thể kết nối hoặc truy vấn dữ liệu."
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

app.use("/", routes);

module.exports = app;
