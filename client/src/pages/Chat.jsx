import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";

import { useChatShortcuts } from "../hooks/useChatShortcuts";
import { ReplyPreview } from "../components/ReplyPreview";
import { MessageInput } from "../components/MessageInput";
import { ImageModal } from "../components/ImageModal";
import { useChatSocket } from "../hooks/useChatSocket";
import { useChatScroll } from "../hooks/useChatScroll";
import { ChatHeader } from "../components/ChatHeader";
import { ImageUploadPreview } from "../components/ImageUploadPreview";
import { ChatContainer } from "../components/ChatContainer";

const Chat = () => {
  const { activeConversation } = useOutletContext();

  const [chat, setChat] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const socketRef = useRef(null);
  const inputRef = useRef(null);

  const navigate = useNavigate();

  const userId =
    localStorage.getItem("userId") || localStorage.getItem("senderId");
  const { id: receiverId } = useParams();

  if (!userId || !receiverId) {
    return <div className="text-white">Set userId in localStorage</div>;
  }

  useChatShortcuts({
    inputRef,
    previewImage,
    navigate,
    setPreviewImage,
  });

  useChatSocket({
    inputRef,
    socketRef,
    userId,
    setChat,
    receiverId,
    setIsTyping,
    setOnlineUsers,
  });

  return (
    <div className="h-screen flex flex-col p-4 bg-gray-900">
      <ChatHeader
        navigate={navigate}
        activeConversation={activeConversation}
        onlineUsers={onlineUsers}
        receiverId={receiverId}
      />

      <ChatContainer
        chat={chat}
        isTyping={isTyping}
        userId={userId}
        setPreviewImage={setPreviewImage}
        setReplyingTo={setReplyingTo}
        setChat={setChat}
      />

      {selectedFile && (
        <ImageUploadPreview
          selectedFile={selectedFile}
          onRemove={() => setSelectedFile(null)}
        />
      )}

      {replyingTo && (
        <ReplyPreview replyingTo={replyingTo} setReplyingTo={setReplyingTo} />
      )}

      <MessageInput
        setSelectedFile={setSelectedFile}
        inputRef={inputRef}
        selectedFile={selectedFile}
        receiverId={receiverId}
        replyingTo={replyingTo}
        setChat={setChat}
        socketRef={socketRef}
        userId={userId}
        setReplyingTo={setReplyingTo}
      />
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
