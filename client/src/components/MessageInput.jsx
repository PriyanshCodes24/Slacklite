import { LuPaperclip } from "react-icons/lu";
import api from "../services/api";

export const MessageInput = ({
  fileInputRef,
  setSelectedFile,
  inputRef,
  message,
  handleInputChange,
  selectedFile,
  replyingTo,
  setChat,
  setMessage,
  socketRef,
  userId,
  receiverId,
  setReplyingTo,
}) => {
  const handleEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  const sendMessage = async () => {
    if (!message.trim() && !selectedFile) return;

    try {
      const formData = new FormData();

      formData.append("content", message);
      formData.append("receiver", receiverId);
      formData.append("chatType", "dm");

      if (replyingTo?._id) {
        formData.append("replyTo", replyingTo._id);
      }

      if (selectedFile) {
        formData.append("media", selectedFile);
      }

      const res = await api.post("/messages", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
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
  return (
    <div className="flex mt-3 gap-2">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => {
          setSelectedFile(e.target.files[0]);
        }}
      />
      <textarea
        ref={inputRef}
        value={message}
        onChange={handleInputChange}
        placeholder="Type message..."
        className="flex-1 bg-gray-800 border border-gray-600 py-2 px-3 rounded text-white placeholder-gray-400 resize-none overflow-y-auto min-h-11 max-h-40 leading-normal"
        onKeyDown={handleEnter}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="bg-gray-800 hover:bg-gray-600 cursor-pointer px-3 rouded"
      >
        <LuPaperclip />
      </button>
      <button
        className="bg-blue-600 hover:bg-blue-700 px-4 rounded cursor-pointer text-white"
        onClick={sendMessage}
      >
        send
      </button>
    </div>
  );
};
