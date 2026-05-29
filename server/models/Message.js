const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    chatType: {
      type: String,
      enum: ["dm", "channel"],
      default: "dm",
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.chatType === "dm";
      },
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: function () {
        return this.chatType === "channel";
      },
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
    edited: {
      type: Boolean,
      default: false,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    messageType: {
      type: String,
      enum: ["text", "media"],
      default: "text",
    },
    mediaUrl: String,
  },
  { timestamps: true },
);

messageSchema.index({ sender: 1, receiver: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
