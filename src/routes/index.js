const express = require("express");
const router = express.Router();

const tournamentRoutes = require("../modules/tournaments/tournamentRoutes");

router.use("/tournaments", tournamentRoutes);

module.exports = router;