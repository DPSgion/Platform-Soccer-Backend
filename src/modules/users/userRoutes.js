const express = require("express");
const router = express.Router();

const userControllers = require("./userControllers");

router.get("/", userControllers.getUser);
router.put("/me", userControllers.updateUser);
router.post("/me/avatar", userControllers.updateAvatar);

module.exports = router;