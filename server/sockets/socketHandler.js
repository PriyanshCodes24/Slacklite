const onlineUsers = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);

      onlineUsers.set(userId, socket.id);

      io.emit("online_users", Array.from(onlineUsers.keys()));

      console.log("User joined room:", userId);
    });

    socket.on("send_message", (data) => {
      const { receiverId } = data;

      io.to(receiverId).emit("receive_message", data);
    });

    socket.on("typing", ({ senderId, receiverId }) => {
      io.to(receiverId).emit("typing", { senderId });
    });
    socket.on("stop_typing", ({ senderId, receiverId }) => {
      io.to(receiverId).emit("stop_typing", { senderId });
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
