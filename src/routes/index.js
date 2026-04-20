const express = require("express");
const router = express.Router();

const tournamentRoutes = require("../modules/tournaments/tournamentRoutes");
const userRoutes = require("../modules/users/userRoutes");
const dashboardPublicRoutes = require("../modules/dashboardPublic/dashboardPublicRoute");
const teamRoutes = require("../modules/teams/teamRoutes");
const authRoutes = require("../modules/auth/authRoutes");
const matchRoutes = require("../modules/matches/matchRoutes");

router.use("/tournaments", tournamentRoutes);
router.use("/users", userRoutes);
router.use("/public", dashboardPublicRoutes);
router.use("/teams", teamRoutes);
router.use("/auth", authRoutes);
router.use("/matches", matchRoutes);

module.exports = router;