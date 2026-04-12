const express = require("express");
const router = express.Router();


const tournamentRoutes = require("../modules/tournaments/tournamentRoutes");
const userRoutes = require("../modules/users/userRoutes");
const dashboardPublicRoutes = require("../modules/dashboardPublic/dashboardPublicRoute");
const teamRoutes = require("../modules/teams/teamRoutes");
const matchRoutes = require("../modules/matches/matchRoutes");
const authRoutes = require("../modules/auth/authRoutes");

router.use("/matches", matchRoutes);
router.use("/tournaments", tournamentRoutes);
router.use("/users", userRoutes);
router.use("/public", dashboardPublicRoutes);
router.use("/teams", teamRoutes);
router.use("/matches", matchRoutes);
router.use("/auth", authRoutes);


module.exports = router;