const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

const {
  sendMessage,
  getMessages,
  getConversations,
} = require("../controllers/messageController");

router.post("/", protect, sendMessage);
router.get("/", protect, getMessages);
router.get("/conversations", protect, getConversations);

module.exports = router;
