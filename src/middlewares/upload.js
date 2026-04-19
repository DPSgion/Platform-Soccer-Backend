const multer = require("multer");

// Chuyển sang memoryStorage để lấy Buffer đẩy lên Oracle Cloud
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Invalid file type. Only JPEG, PNG and GIF are allowed."), false);
    }
};

// Giới hạn 5MB để bảo vệ RAM server
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;