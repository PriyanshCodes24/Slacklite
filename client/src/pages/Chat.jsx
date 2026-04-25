import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import api from "../services/api";
import { MessageStatus } from "../components/MessageStatus";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  const userId = localStorage.getItem("senderId");
  const receiverId = localStorage.getItem("receiverId");
  if (!userId || !receiverId) {
    return <div className="text-white">Set userId in localStorage</div>;
  }

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    socketRef.current.emit("join", userId);
    console.log("Joining room: ", userId);

    socketRef.current.on("message_seen", (data) => {
      console.log("🔥 SEEN EVENT RECEIVED:", data);
    });

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      const res = await api.post("/messages", {
        content: message,
        receiver: receiverId,
        chatType: "dm",
      });

      setChat((prev) => [...prev, res.data]);
      setMessage("");
    } catch (error) {
      console.log("Message failed: ", error);
    }
  };
  const handleEnter = (e) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
      } else {
        e.preventDefault();
        sendMessage();
      }
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);

    socketRef.current.emit("typing", {
      senderId: userId,
      receiverId,
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("stop_typing", {
        senderId: userId,
        receiverId,
      });
    }, 1200);
  };

  return (
    <div className="h-screen flex flex-col p-4 bg-gray-900">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-white text-xl font-semibold">Chat</h2>

        <span className="flex items-center gap-2 text-sm">
          <span
            className={`w-2 h-2 rounded-full ${
              onlineUsers.includes(receiverId) ? "bg-green-400" : "bg-gray-500"
            }`}
          />
          {onlineUsers.includes(receiverId) ? "Online" : "Offline"}
        </span>
      </div>

      <div className="flex-1 overflow-auto bg-gray-800 p-3 rounded shadow">
        {chat.map((msg, i) => (
          <div
            key={i}
            className={`mb-2  ${msg.sender === userId ? "text-right" : "text-left"}`}
          >
            <div className="inline-block max-w-[70%]">
              <div
                className={`px-3 py-1 rounded wrap-break-word whitespace-pre-wrap leading-relaxed ${
                  msg.sender === userId
                    ? "bg-blue-600 text-white"
                    : "bg-gray-600 text-white"
                }`}
              >
                {msg.content}
              </div>

              {msg.sender === userId && (
                <div className="flex justify-end mt-1 pr-1 opacity-80">
                  <MessageStatus status={msg.status} />
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      {isTyping && <div className="text-sm text-gray-400 mb-2">Typing...</div>}
      <div className="flex mt-3 gap-2">
        <textarea
          value={message}
          onChange={handleInputChange}
          rows={1}
          placeholder="Type message..."
          className="flex-1 bg-gray-800 border border-gray-600 p-2 rounded text-white placeholder-gray-400"
          onKeyDown={handleEnter}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 px-4 rounded cursor-pointer text-white"
          onClick={sendMessage}
        >
          send
        </button>
      </div>
    </div>
  );
};

export default Chat;
