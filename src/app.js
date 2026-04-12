const express = require("express");

const app = express();

const routes = require("./routes");

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

app.use(express.urlencoded({ extended: true }));
app.use("/", routes);

module.exports = app;