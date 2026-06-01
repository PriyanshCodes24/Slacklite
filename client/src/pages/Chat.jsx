import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import api from "../services/api";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { formatDateLable } from "../utils/formatDateLable";
import { IoArrowBackOutline } from "react-icons/io5";
import { getInitials } from "../utils/getInitials";
import { LuPaperclip } from "react-icons/lu";
import { RxCross2 } from "react-icons/rx";
import { MessageBubble } from "../components/MessageBubble";
import { ReplyPreview } from "../components/ReplyPreview";
import { MessageInput } from "../components/MessageInput";
import { ImageModal } from "../components/ImageModal";

const Chat = () => {
  const { activeConversation } = useOutletContext();

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const chatContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  const userId =
    localStorage.getItem("userId") || localStorage.getItem("senderId");
  const { id: receiverId } = useParams();

  if (!userId || !receiverId) {
    return <div className="text-white">Set userId in localStorage</div>;
  }

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

  const adjustTextAreaHeight = () => {
    const textarea = inputRef.current;

    if (!textarea) return;

    textarea.style.height = "0px";
    textarea.style.height = Math.min(textarea.scrollHeight, 160) + "px";
  };

  // socket + fetchMessages
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

  // scrollToBottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // shortCuts
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
        if (previewImage) {
          setPreviewImage(null);
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
  }, [navigate, previewImage]);

  useEffect(() => {
    adjustTextAreaHeight();
  }, [message]);

  // showScrollButton
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
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="md:hidden text-gray-300 hover:text-white cursor-pointer text-xl"
          >
            <IoArrowBackOutline />
          </button>

          <div className="relative shrink-0">
            <div className="bg-blue-600 h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm">
              {getInitials(activeConversation?.user?.name)}
            </div>

            <span
              className={`absolute h-3 w-3 rounded-full right-0 bottom-0 border-2 border-gray-900 ${onlineUsers.includes(receiverId) ? "bg-green-400" : "bg-gray-500"}`}
            ></span>
          </div>
          <div className="">
            <h2 className="text-white text-lg font-semibold leading-tight">
              {activeConversation?.user?.name || "Chat"}
            </h2>

            <p className="text-xs text-gray-400">
              {onlineUsers.includes(receiverId) ? "Online" : "Offline"}
            </p>
          </div>
        </div>
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
                <MessageBubble
                  msg={msg}
                  isSameSender={isSameSender}
                  senderId={senderId}
                  userId={userId}
                  editingMessageId={editingMessageId}
                  editedText={editedText}
                  setEditedText={setEditedText}
                  setEditingMessageId={setEditingMessageId}
                  setPreviewImage={setPreviewImage}
                  setReplyingTo={setReplyingTo}
                  handleEditMessage={handleEditMessage}
                  deleteMessage={deleteMessage}
                />
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

      {selectedFile && (
        <div className="mb-2 bg-gray-800 p-2 rounded">
          <img
            src={URL.createObjectURL(selectedFile)}
            alt="preview"
            className="max-h-40 rounded"
          />

          <button
            onClick={() => setSelectedFile(null)}
            className="text-red-400 text-xs mt-2 cursor-pointer"
          >
            Remove
          </button>
        </div>
      )}

      {replyingTo && (
        <ReplyPreview replyingTo={replyingTo} setReplyingTo={setReplyingTo} />
      )}

      <MessageInput
        fileInputRef={fileInputRef}
        setSelectedFile={setSelectedFile}
        inputRef={inputRef}
        message={message}
        handleInputChange={handleInputChange}
        selectedFile={selectedFile}
        receiverId={receiverId}
        replyingTo={replyingTo}
        setChat={setChat}
        setMessage={setMessage}
        socketRef={socketRef}
        userId={userId}
        setReplyingTo={setReplyingTo}
      />
      {/* image modal */}
      {previewImage && (
        <ImageModal
          previewImage={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
};

export default Chat;
