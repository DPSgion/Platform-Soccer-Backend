const express = require("express");
const router = express.Router();

const tournamentRoutes = require("../modules/tournaments/tournamentRoutes");
const userRoutes = require("../modules/users/userRoutes");
const dashboardPublicRoutes = require("../modules/dashboardPublic/dashboardPublicRoute");
const teamRoutes = require("../modules/teams/teamRoutes");

router.use("/tournaments", tournamentRoutes);
router.use("/users", userRoutes);
router.use("/public", dashboardPublicRoutes);
router.use("/teams", teamRoutes);

module.exports = router;