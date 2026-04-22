const Message = require("../models/Message");

exports.sendMessage = async (req, res) => {
  const { content, receiver, channelId, chatType } = req.body;

  const message = await Message.create({
    sender: req.user._id,
    content,
    receiver,
    channelId,
    chatType,
    status: "sent",
  });

  const io = req.app.get("io");

  io.to(receiver.toString()).emit("receive_message", message);

  res.status(201).json(message);
};

exports.getMessages = async (req, res) => {
  try {
    const { chatId, type } = req.query;

    let query = {};

    if (type === "dm") {
      query = {
        chatType: "dm",
        $or: [
          { sender: req.user._id, receiver: chatId },
          { sender: chatId, receiver: req.user._id },
        ],
      };
    } else {
      query = {
        chatType: "channel",
        channelId: chatId,
      };
    }

    const messages = await Message.find(query)
      .populate("sender", "name email")
      .sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (e) {
    console.error("Send message error", e);
    res.status(500).json({ msg: "Failed to send message" });
  }
};
