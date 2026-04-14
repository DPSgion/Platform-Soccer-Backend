const express = require("express");
const router = express.Router();

const controller = require("./authController");
const { registerValidator, normalizeRegisterInput } = require("./authValidator");

router.post(
	"/register",
	normalizeRegisterInput,
	registerValidator,
	controller.register
);

module.exports = router;