const multer = require("multer");
const path = require("path");
const fs = require("fs");
const avatarsDir = path.join(__dirname, "../src/uploads/avatars");

if (!fs.existsSync(avatarsDir)) {
    fs.mkdirSync(avatarsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, avatarsDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => { 
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Invalid file type. Only JPEG, PNG and GIF are allowed."), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;