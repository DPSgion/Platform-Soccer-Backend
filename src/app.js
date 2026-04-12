const express = require("express");
const mysql = require("mysql2");
const app = express();
const cors = require("cors");
const routes = require("./routes");
const config = require("./dbConfig");
const connection = mysql.createConnection(config);
app.use(cors());
app.use(express.json());

connection.connect(err => {
    if (err) {
        console.error('Lỗi kết nối Local DB: ' + err.message);
        return;
    }
    console.log('Ngon! Đã kết nối thành công tới: ' + config.database);

    connection.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error('Lỗi truy vấn: ' + err.message);
        } else {
            console.log('Dữ liệu từ database của Hào nè:');
            console.table(results);
        }
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