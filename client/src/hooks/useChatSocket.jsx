import { useEffect } from "react";
import api from "../services/api";

export const useChatSocket = ({
  inputRef,
  socketRef,
  userId,
  setChat,
  receiverId,
  setIsTyping,
  setOnlineUsers,
  io
}) => {
  useEffect(() => {
    inputRef.current?.focus();
    socketRef.current = io("http://localhost:5000");

    socketRef.current.emit("join", userId);
    console.log("Joining room: ", userId);

    socketRef.current.emit("message_seen", {
      senderId: receiverId,
      receiverId: userId,
    });

    socketRef.current.on("receive_message", (data) => {
      if (data.sender !== userId) {
        setChat((prev) => [...prev, data]);

        socketRef.current.emit("message_delivered", {
          messageId: data._id,
        });

        socketRef.current.emit("message_seen", {
          senderId: receiverId,
          receiverId: userId,
        });
      }
    });

    socketRef.current.on("typing", ({ senderId }) => {
      if (userId !== senderId) {
        setIsTyping(true);
      }
    });
    socketRef.current.on("stop_typing", ({ senderId }) => {
      if (userId !== senderId) {
        setIsTyping(false);
      }
    });
    socketRef.current.on("online_users", (users) => {
      setOnlineUsers(users);
    });
    socketRef.current.on("message_status_update", ({ messageId, status }) => {
      setChat((prev) =>
        prev.map((msg) => (messageId === msg._id ? { ...msg, status } : msg)),
      );
    });
    socketRef.current.on("message_deleted", ({ messageId }) => {
      setChat((prev) => prev.filter((msg) => msg._id !== messageId));
    });
    socketRef.current.on("message_edited", (updatedMessage) => {
      setChat((prev) =>
        prev.map((msg) =>
          msg._id !== updatedMessage._id ? updatedMessage : msg,
        ),
      );
    });

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages?chatId=${receiverId}&type=dm`);
        const normalized = res.data.map((msg) => ({
          ...msg,
          sender: typeof msg.sender === "object" ? msg.sender._id : msg.sender,
        }));

        setChat(normalized);
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };
    fetchMessages();
    socketRef.current.on("message_seen", ({ senderId }) => {
      setChat((prev) =>
        prev.map((msg) =>
          msg.sender === userId && msg.receiver === receiverId
            ? { ...msg, status: "seen" }
            : msg,
        ),
      );
    });

    return () => {
      socketRef.current.off("receive_message");
      socketRef.current.off("typing");
      socketRef.current.off("stop_typing");
      socketRef.current.off("message_seen");
      socketRef.current.off("message_status_update");
      socketRef.current.disconnect();
    };
  }, [userId, receiverId]);
};
