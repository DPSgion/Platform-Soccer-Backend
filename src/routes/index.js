const express = require("express");
const router = express.Router();

const tournamentRoutes = require("../modules/tournaments/tournamentRoutes");
const userRoutes = require("../modules/users/userRoutes");

router.use("/tournaments", tournamentRoutes);
router.use("/users", userRoutes);

module.exports = router;