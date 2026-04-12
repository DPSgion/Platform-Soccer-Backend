const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();

const routes = require("./routes");
const config = require("./dbConfig");
const connection = mysql.createConnection(config);

app.use(cors());
app.use(express.json());

app.get("/test-db", (req, res) => {
    connection.query('SELECT * FROM users', (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
        res.json({
            success: true,
            description: "Dữ liệu từ database của Hào",
            data: results
        });
    });
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
