import { GoReply } from "react-icons/go";
import { MessageStatus } from "./MessageStatus";
import { MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import { formatTime } from "../utils/formatTime";

export const MessageBubble = ({
  isSameSender,
  senderId,
  userId,
  editingMessageId,
  editedText,
  msg,
  setEditedText,
  setEditingMessageId,
  setReplyingTo,
  handleEditMessage,
  setPreviewImage,
  deleteMessage,
}) => (
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
          <div className="text-left">
            {msg.replyTo && (
              <div className="mb-2 px-2 py-1 border-l-2 border-blue-400 bg-black/10 rounded text-sm">
                <p className="truncate text-gray-300">{msg.replyTo.content}</p>
              </div>
            )}

            {msg.messageType === "media" && msg.mediaUrl && (
              <img
                src={msg.mediaUrl}
                alt="uploaded"
                onClick={() => setPreviewImage(msg.mediaUrl)}
                className="max-w-xs max-h-80 object-cover rounded-lg mb-2 cursor-pointer hover:opacity-90 transition"
              />
            )}

            {msg.content && (
              <div>
                {msg.content}
                {msg?.edited && (
                  <span className="text-[10px] text-gray-300 ml-2">
                    (edited)
                  </span>
                )}
              </div>
            )}

            {!msg.content && msg.edited && (
              <span className="text-[10px] text-gray-300 ml-2">(edited)</span>
            )}
          </div>
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
);
