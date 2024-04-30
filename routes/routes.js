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
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
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
            message: '成功建立使用者!'
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


router.get("/edit/:id", async (req, res) => {
    try {
        let id = req.params.id;
        let user = await User.findById(id).exec();

        if (user == null) {
            return res.redirect("/");
        }

        res.render("edit_users", {
            title: "Edit User",
            user: user,
        });
    } catch (err) {
        console.error(err);
        res.redirect("/");
    }
});


// Update user route
router.post("/update/:id", upload, async (req, res) => {
    try {
        let id = req.params.id;
        let new_image = "";
        if (req.file) {
            new_image = req.file.filename;
            try {
                fs.unlinkSync("./uploads/" + req.body.old_image);
            } catch (err) {
                console.log(err);
            }
        } else {
            new_image = req.body.old_image;
        }

        const result = await User.findByIdAndUpdate(
            id,
            {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                image: new_image,
            },
            { new: true } // This option returns the updated document
        );

        if (!result) {
            return res.json({ message: "User not found", type: "danger" });
        }

        req.session.message = {
            type: "success",
            message: "User updated successfully!",
        };
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.json({ message: err.message, type: "danger" });
    }
});


// Delete user route
router.get('/delete/:id', async (req, res) => {
    try {
        let id = req.params.id;
        let user = await User.findById(id);

        if (!user) {
            return res.json({ message: "User not found" });
        }

        if (user.image !== '') {
            try {
                fs.unlinkSync('./uploads/' + user.image);
            } catch (err) {
                console.log(err);
            }
        }

        await user.deleteOne();

        req.session.message = {
            type: 'info',
            message: 'User deleted successfully!'
        };
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.json({ message: err.message });
    }
});

module.exports = router;
