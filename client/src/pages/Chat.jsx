import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import api from "../services/api";
import { MessageStatus } from "../components/MessageStatus";
import { useNavigate, useParams } from "react-router-dom";
import { formatTime } from "../utils/formatTime";
import { formatDateLable } from "../utils/formatDateLable";
import { FaTrash } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { GoReply } from "react-icons/go";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  const chatContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  const navigate = useNavigate();

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
    socketRef.current.on("message_deleted", ({ messageId }) => {
      setChat((prev) => prev.filter((msg) => msg._id !== messageId));
    });
    socketRef.current.on("message_edited", (updatedMessage) => {
      setChat((prev) =>
        prev.map((msg) => (msg._id !== messageId ? updatedMessage : msg)),
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
        replyTo: replyingTo?._id,
      });

      setChat((prev) => [...prev, res.data]);
      setMessage("");
      socketRef.current.emit("send_message", {
        sender: userId,
        receiver: receiverId,
        content: message,
      });

      setReplyingTo(null);
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

  useEffect(() => {
    const container = chatContainerRef.current;

    if (!container) return;

    const handleScroll = () => {
      const threshold = 100;

      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;

      setShowScrollButton(!isNearBottom);
    };
    container.addEventListener("scroll", handleScroll);

    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const deleteMessage = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);

      setChat((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditMessage = async (messageId) => {
    try {
      const res = await api.put(`/messages/${messageId}`, {
        content: editedText,
      });

      setChat((prev) =>
        prev.map((msg) => (msg._id === messageId ? res.data : msg)),
      );

      setEditingMessageId(null);
      setEditedText("");
    } catch (error) {
      console.log(error);
    }
  };

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

      {/* chat container */}
      <div className="flex-1 relative min-h-0">
        <div
          ref={chatContainerRef}
          className="h-full overflow-y-auto bg-gray-800 p-3 rounded shadow "
        >
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
                  className={`${isSameSender ? "mb-1" : "mb-4"} group ${senderId === userId ? "text-right" : "text-left"}`}
                >
                  <div className="inline-block max-w-sm relative">
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
                      {editingMessageId === msg._id ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="resize-none outline-none bg-transparent text-white"
                            autoFocus
                          />

                          <div className="flex justify-end gap-2 text-xs">
                            <button
                              className="text-gray-300  hover:text-white cursor-pointer"
                              onClick={() => {
                                setEditingMessageId(null);
                                setEditedText("");
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              className="text-blue-300  hover:text-blue-200 cursor-pointer"
                              onClick={() => {
                                handleEditMessage(msg._id);
                              }}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-left">
                          {msg.replyTo && (
                            <div className="mb-2 px-2 py-1 border-l-2 border-blue-400 bg-black/10 rounded text-sm">
                              <p className="truncate text-gray-300">
                                {msg.replyTo.content}
                              </p>
                            </div>
                          )}
                          {msg.content}
                          {msg?.edited && (
                            <span className="text-[10px] text-gray-300 ml-2">
                              (edited)
                            </span>
                          )}
                        </p>
                      )}

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
                    <button
                      onClick={() => setReplyingTo(msg)}
                      className={`absolute ${senderId === userId ? "-left-24" : "left-26"} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-400 cursor-pointer`}
                    >
                      <GoReply />
                    </button>
                    {senderId === userId && (
                      <>
                        <button
                          onClick={() => {
                            setEditingMessageId(msg._id);
                            setEditedText(msg.content);
                          }}
                          className="absolute -left-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-400 cursor-pointer transition-opacity"
                        >
                          <MdEdit />
                        </button>
                        <button
                          onClick={() => deleteMessage(msg._id)}
                          className="absolute -left-8 top-1/2 -translate-y-1/2
                        opacity-0 group-hover:opacity-100
                        transition-opacity text-gray-400 hover:text-red-400 cursor-pointer"
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
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
        {
          <button
            onClick={scrollToBottom}
            className={`absolute bottom-4 bg-blue-600 hover:bg-blue-700 text-white left-1/2 -translate-x-1/2 text-sm px-4 py-2 rounded-full shadow-lg cursor-pointer transition-all duration-300 
              ${showScrollButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
              `}
          >
            ↓
          </button>
        }
      </div>
      {replyingTo && (
        <div className="bg-gray-800 border border-gray-700 rounded p-2 mb-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-blue-400">Replying to</p>

              <p className="text-sm text-gray-300 truncate max-w-xs">
                {replyingTo?.content}
              </p>
            </div>

            <button
              onClick={() => setReplyingTo(null)}
              className="text-gray-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
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
