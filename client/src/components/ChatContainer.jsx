import React, { useState } from "react";
import { formatDateLable } from "../utils/formatDateLable";
import { MessageBubble } from "./MessageBubble";
import { useChatScroll } from "../hooks/useChatScroll";
import { FaChevronDown } from "react-icons/fa";

export const ChatContainer = ({
  chat,
  isTyping,
  userId,
  setPreviewImage,
  setReplyingTo,
  setChat,
  editingMessageId,
  setEditingMessageId,
  editedText,
  setEditedText,
}) => {
  const {
    showScrollButton,
    chatContainerRef,
    bottomRef,
    scrollToBottom,
    newMessageCount,
  } = useChatScroll(chat);
  return (
    <div className="flex-1 relative min-h-0">
      {/* message list */}
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
                setChat={setChat}
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
          className={`absolute bottom-4 backdrop-blur-sm bg-blue-600 hover:bg-blue-700  left-1/2 -translate-x-1/2 text-sm px-4 py-2 rounded-full shadow-lg cursor-pointer transition-all duration-300 flex items-center gap-2
                ${showScrollButton ? "opacity-95 hover:opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
                `}
        >
          <FaChevronDown className="text-xs" />

          {newMessageCount > 0 && (
            <span className="text-sm font-medium">
              {newMessageCount > 9 ? "9+" : newMessageCount} New Message
              {newMessageCount > 1 ? "s" : ""}
            </span>
          )}
        </button>
      }
    </div>
  );
};
