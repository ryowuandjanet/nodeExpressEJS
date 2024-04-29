const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Ensure the "uploads" directory exists
const uploadDirectory = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory);
}

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

var upload = multer({
    storage: storage
}).single('image');

router.post("/add", upload, async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded.", type: "danger" });
    }
    
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename,
        });
        await user.save();
        req.session.message = {
            type: 'success',
            message: 'User added successfully!'
        };
        return res.redirect("/");
    } catch (error) {
        return res.status(500).json({ message: error.message, type: 'danger' });
    }
});

router.get("/", async (req, res) => {
    try {
        const users = await User.find();
        res.render("index", { title: "首頁", users: users });
    } catch (error) {
        res.status(500).json({ message: error.message, type: 'danger' });
    }
});

router.get("/add", (req, res) => {
    res.render("add_users", { title: "新增成員" });
});

module.exports = router;
