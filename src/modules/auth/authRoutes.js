const express = require("express");
const router = express.Router();

const controller = require("./authController");
const {
	normalizeRegisterInput,
	registerValidator,
	normalizeLoginInput,
	loginValidator
} = require("./authValidator");

router.post(
	"/register",
	normalizeRegisterInput,
	registerValidator,
	controller.register
);

router.post(
	"/login",
	normalizeLoginInput,
	loginValidator,
	controller.login
);

module.exports = router;