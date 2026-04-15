const express = require("express");
const router = express.Router();

const userControllers = require("./userControllers");
const { authMiddleware } = require("../../middlewares/authMiddleware");
const upload = require("../../middlewares/upload");

router.get("/", authMiddleware(), userControllers.getUser);
router.put("/me", authMiddleware(), userControllers.updateUser);
router.post(
    "/me/avatar", 
    authMiddleware(), 
    upload.single("avatar"), 
    userControllers.updateAvatar
);

module.exports = router;