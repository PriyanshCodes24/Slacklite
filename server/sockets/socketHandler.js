const Message = require("../models/Message");

const onlineUsers = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);

      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);

      io.emit("online_users", Array.from(onlineUsers.keys()));

      console.log("User joined room:", userId);
    });

    // socket.on("send_message", (data) => {
    //   const { receiverId } = data;

    //   io.to(receiverId).emit("receive_message", data);
    // });

    socket.on("typing", ({ senderId, receiverId }) => {
      io.to(receiverId).emit("typing", { senderId });
    });
    socket.on("stop_typing", ({ senderId, receiverId }) => {
      io.to(receiverId).emit("stop_typing", { senderId });
    });

    socket.on("message_delivered", async ({ messageId }) => {
      try {
        const message = await Message.findByIdAndUpdate(
          messageId,
          {
            status: "delivered",
          },
          { returnDocument: "after" },
        );

        if (!message) return;

        io.to(message.sender.toString()).emit("message_status_update", {
          messageId,
          status: "delivered",
        });
      } catch (err) {
        console.error("Error updating delivered: ", err);
      }
    });
    socket.on("message_seen", async ({ senderId, receiverId }) => {
      try {
        if (!senderId || !receiverId) return;
        await Message.updateMany(
          {
            sender: senderId,
            receiver: receiverId,
            status: { $ne: "seen" },
          },
          { status: "seen" },
        );

        io.to(senderId).emit("message_seen", {
          senderId,
        });
      } catch (err) {
        console.error("Error updating seen: ", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      for (let [userId, sockId] of onlineUsers.entries()) {
        if (sockId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }

      io.emit("online_users", Array.from(onlineUsers.keys()));
    });
  });
};
