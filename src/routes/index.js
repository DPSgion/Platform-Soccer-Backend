const express = require("express");
const router = express.Router();


const tournamentRoutes = require("../modules/tournaments/tournamentRoutes");
const userRoutes = require("../modules/users/userRoutes");
const matchRoutes = require("../modules/matches/matchRoutes");


router.use("/matches", matchRoutes);
router.use("/tournaments", tournamentRoutes);
router.use("/users", userRoutes);

module.exports = router;