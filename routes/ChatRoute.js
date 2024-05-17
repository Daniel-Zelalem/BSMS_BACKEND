const express = require("express");
const router = express.Router();

const ChatController = require("../controller/ChatController");

router.get("/getChatDetails/:chatId", ChatController.getChatDetails);
router.post("/createNewChat", ChatController.createNewChat);
router.post("/updateSeenMessages/:chatId", ChatController.updateSeenMessages);
router.post("/updateGroupChatInfo/:chatId", ChatController.updateGroupChatInfo);

module.exports = router;
