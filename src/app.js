const express = require("express");

const app = express();
const cors = require("cors");
const routes = require("./routes");
app.use(cors());
app.use(express.json());

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