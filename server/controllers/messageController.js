const Message = require("../models/Message");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

exports.sendMessage = async (req, res) => {
  const { content, receiver, channelId, chatType, replyTo } = req.body;

  let mediaUrl = null;
  let messageType = "text";

  if (req.file) {
    const uploaded = await uploadToCloudinary(req.file.buffer);

    mediaUrl = uploaded.secure_url;
    messageType = "media";
  }

  const message = await Message.create({
    sender: req.user._id,
    content,
    receiver,
    channelId,
    chatType,
    status: "sent",
    replyTo,
    mediaUrl,
    messageType,
  });

  await message.populate("sender", "name email");

  await message.populate({
    path: "replyTo",
    select: "sender content",
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
      .populate({ path: "replyTo", select: "content sender" })
      .sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (e) {
    console.error("Send message error", e);
    res.status(500).json({ msg: "Failed to send message" });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      chatType: "dm",
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name")
      .populate("receiver", "name");

    const conversations = {};

    messages.forEach((msg) => {
      const otherUser =
        msg.sender._id.toString() === userId.toString()
          ? msg.receiver
          : msg.sender;

      const key = otherUser._id.toString();

      if (!conversations[key]) {
        conversations[key] = {
          user: otherUser,
          lastMessage:
            msg.messageType === "text" ? msg.content : `[${msg.messageType}]`,
          createdAt: msg.createdAt,
          unread: 0,
        };
      }
      if (
        msg.receiver?._id?.toString() === userId.toString() &&
        msg.sender?._id?.toString() === key &&
        msg.status !== "seen"
      ) {
        conversations[key].unread++;
      }
    });
    res.json(Object.values(conversations));
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to fetch conversations" });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        msg: "Message not found",
      });
    }
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        msg: "Unauthorized",
      });
    }

    await message.deleteOne();

    const io = req.app.get("io");

    io.to(message.receiver.toString()).emit("message_deleted", {
      messageId: message._id,
    });

    res.json({
      msg: "Message deleted",
      messageId: message._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Delete failed",
    });
  }
};
exports.editMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        msg: "Message not found",
      });
    }
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        msg: "Unauthorized",
      });
    }

    const { content } = req.body;

    message.content = content;
    message.edited = true;

    await message.save();

    await message.populate("sender", "name email");

    await message.populate({
      path: "replyTo",
      select: "content sender",
    });

    const io = req.app.get("io");

    io.to(message.receiver.toString()).emit("message_edited", message);

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Edit failed",
    });
  }
};
