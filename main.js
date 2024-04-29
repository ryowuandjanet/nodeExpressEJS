require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const session = require("express-session")

const app = express()
const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.DB_URI)
    .then(() => {
        console.log('MongoDB 連接成功');
    })
    .catch((err) => {
        console.error('MongoDB 連接失敗:', err);
    });

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(
    session({
        secret: "my secret key", // 提供 secret 選項
        saveUninitialized: true,
        resave: false,
    })
);

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})

app.use(express.static("uploads"));

app.set('view engine', 'ejs');

app.use("", require("./routes/routes"));

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`)
})
