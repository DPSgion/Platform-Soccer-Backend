const express = require("express");
const router = express.Router();

const tournamentRoutes = require("../modules/tournaments/tournamentRoutes");
const dashboardPublicRoutes = require("../modules/dashboardPublic/dashboardPublic.route");
router.use("/tournaments", tournamentRoutes);
router.use("/public", dashboardPublicRoutes);
module.exports = router;