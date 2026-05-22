import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import api from "../services/api";
import { MessageStatus } from "../components/MessageStatus";
import { useNavigate, useParams } from "react-router-dom";
import { formatTime } from "../utils/formatTime";
import { formatDateLable } from "../utils/formatDateLable";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const userId =
    localStorage.getItem("userId") || localStorage.getItem("senderId");
  const { id: receiverId } = useParams();

  if (!userId || !receiverId) {
    return <div className="text-white">Set userId in localStorage</div>;
  }

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

  useEffect(() => {
    const handleShortcut = (e) => {
      const isTyping =
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA" ||
        document.activeElement?.isContentEditable;

      if (e.key === "Escape") {
        if (isTyping) {
          inputRef.current?.blur();
          return;
        }
        navigate("/");
      }

      if (e.key === "/") {
        if (isTyping) {
          return;
        }
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [navigate]);

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
      socketRef.current.emit("send_message", {
        sender: userId,
        receiver: receiverId,
        content: message,
      });
    } catch (error) {
      console.log("Message failed: ", error);
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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

  const adjustTextAreaHeigh = () => {
    const textarea = inputRef.current;

    if (!textarea) return;

    textarea.style.height = "0px";
    textarea.style.height = Math.min(textarea.scrollHeight, 160) + "px";
  };

  useEffect(() => {
    adjustTextAreaHeigh();
  }, [message]);

  return (
    <div className="h-screen flex flex-col p-4 bg-gray-900">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-white text-xl font-semibold">{"Chat"}</h2>

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
        {chat.map((msg, i) => {
          const prevMsg = chat[i - 1];

          const currentDate = new Date(msg.createdAt).toDateString();

          const prevDate = prevMsg
            ? new Date(prevMsg.createdAt).toDateString()
            : null;

          const showDateSeparator = currentDate !== prevDate;

          const isSameSender =
            prevMsg &&
            (prevMsg.sender === msg.sender ||
              prevMsg.sender?._id === msg.sender?._id);

          const senderId =
            typeof msg.sender === "object" ? msg.sender._id : msg.sender;

          return (
            <React.Fragment key={i}>
              {showDateSeparator && (
                <div className="flex justify-center my-4">
                  <span className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
                    {formatDateLable(msg.createdAt)}
                  </span>
                </div>
              )}
              {/* message bubble */}
              <div
                key={i}
                className={`${isSameSender ? "mb-1" : "mb-4"}  ${msg.sender === userId ? "text-right" : "text-left"}`}
              >
                <div className="inline-block max-w-sm">
                  <div
                    className={`px-3 py-1 wrap-break-word whitespace-pre-wrap leading-relaxed
                    ${
                      senderId === userId
                        ? isSameSender
                          ? "rounded-2xl rounded-tr-md"
                          : "rounded-2xl"
                        : isSameSender
                          ? "rounded-2xl rounded-tl-md"
                          : "rounded-2xl"
                    }
                    ${
                      senderId === userId
                        ? "bg-blue-600 text-white"
                        : "bg-gray-600 text-white"
                    }`}
                  >
                    <p className="text-left">{msg.content}</p>

                    <div className="flex justify-end items-center mt-1 gap-1">
                      <span className="text-[10px] text-gray-400">
                        {formatTime(msg.createdAt)}
                      </span>

                      {senderId === userId && (
                        <div className="flex justify-end opacity-80">
                          <MessageStatus status={msg.status} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        {isTyping && (
          <div className="mb-2 text-left">
            <div className="inline-block bg-gray-600 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex mt-3 gap-2">
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleInputChange}
          placeholder="Type message..."
          className="flex-1 bg-gray-800 border border-gray-600 py-2 px-3 rounded text-white placeholder-gray-400 resize-none overflow-y-auto min-h-11 max-h-40 leading-normal"
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
