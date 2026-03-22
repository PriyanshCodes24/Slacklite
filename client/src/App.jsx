import { useEffect, useRef, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";
import api from "./services/api";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  // const userId = "69badb546202be4af13a628a";
  // const receiverId = "69badb326202be4af13a6286";
  const userId = localStorage.getItem("senderId");
  const receiverId = localStorage.getItem("receiverId");
  if (!userId || !receiverId) {
    return <div className="text-white">Set userId in localStorage</div>;
  }

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    socketRef.current.emit("join", userId);
    console.log("Joining room: ", userId);

    socketRef.current.on("receive_message", (data) => {
      if (data.sender !== userId) setChat((prev) => [...prev, data]);
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

    return () => {
      socketRef.current.off("receive_message");
      socketRef.current.off("typing");
      socketRef.current.off("stop_typing");
      socketRef.current.disconnect();
    };
  }, [userId, receiverId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      await api.post("/messages", {
        content: message,
        receiver: receiverId,
        chatType: "dm",
      });

      setChat((prev) => [...prev, { sender: userId, content: message }]);
      setMessage("");
    } catch (error) {
      console.log("Message failed: ", error);
    }
  };
  const handleEnter = (e) => {
    if (e.key === "Enter") sendMessage();
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
      <h2 className="text-white text-xl font-semibold mb-4">Chat</h2>

      <div className="flex-1 overflow-auto bg-gray-800 p-3 rounded shadow">
        {chat.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 ${msg.sender === userId ? "text-right" : "text-left"}`}
          >
            <span
              className={`inline-block px-3 py-1 rounded ${
                msg.sender === userId
                  ? "bg-blue-600 text-white"
                  : "bg-gray-600 text-white"
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      {isTyping && <div className="text-sm text-gray-400 mb-2">Typing...</div>}
      <div className="flex mt-3 gap-2">
        <input
          value={message}
          onChange={handleInputChange}
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
}

export default App;
