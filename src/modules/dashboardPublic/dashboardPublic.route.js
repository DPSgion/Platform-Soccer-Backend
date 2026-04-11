const express = require("express");
const router = express.Router();
const controller = require("./dashboardPublic.controller");

router.get("/tournament", controller.getTournaments);

module.exports = router;
