const express = require("express");
const mysql = require("mysql2/promise"); 
const cors = require("cors");
const routes = require("./routes");
const config = require("./dbConfig");

const app = express();

const pool = mysql.createPool(config);

app.use(cors());
app.use(express.json());

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
            host_checked: config.host 
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