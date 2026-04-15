const express = require("express");
const router = express.Router();

const userControllers = require("./userControllers");
const { authMiddleware } = require("../../middlewares/authMiddleware");

router.get("/", authMiddleware(), userControllers.getUser);
router.put("/me", authMiddleware(), userControllers.updateUser);
router.post("/me/avatar", authMiddleware(), userControllers.updateAvatar);

module.exports = router;