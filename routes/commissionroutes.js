const express = require("express");
const router = express.Router();
const commission = require("../controller/Commisson");

router.post("/calculatecommission", commission.calculateCommissionHandler);

module.exports = router;
