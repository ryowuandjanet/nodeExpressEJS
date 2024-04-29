const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("index",{ title: "首頁"});
})

router.get("/add", (req, res) => {
    res.render("add_users",{ title: "新增成員"});
})

module.exports = router;