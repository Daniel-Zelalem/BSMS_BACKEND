const express = require("express");
const router = express.Router();

const MessageController = require("../controller/MessageController");

router.post("/PostMessages", MessageController.PostMessages);

module.exports = router;
