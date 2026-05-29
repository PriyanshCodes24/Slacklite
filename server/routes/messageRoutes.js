const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const {
  sendMessage,
  getMessages,
  getConversations,
  deleteMessage,
  editMessage,
} = require("../controllers/messageController");

router.post("/", protect, upload.single("media"), sendMessage);
router.get("/", protect, getMessages);
router.get("/conversations", protect, getConversations);
router.delete("/:id", protect, deleteMessage);
router.put("/:id", protect, editMessage);

module.exports = router;
