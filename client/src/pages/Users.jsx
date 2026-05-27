import React, { useEffect, useId, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { formatTime } from "../utils/formatTime";
import { getInitials } from "../utils/getInitials";

const Users = ({ conversations, onlineUsers }) => {
  const navigate = useNavigate();
  const { id: activeUserId } = useParams();

  const handleSelectUser = (userId) => {
    navigate(`/chat/${userId}`);
  };
  return (
    <div className="bg-gray-900 h-full p-3 space-y-2">
      <h2 className="text-lg font-semibold mb-2">Chats</h2>

      {conversations.map((item) => {
        const isActive = item.user._id === activeUserId;
        return (
          <div
            key={item.user._id}
            className={`p-3 rounded cursor-pointer transition ${isActive ? "bg-gray-700" : "bg-gray-800 hover:bg-gray-700"}`}
            onClick={() => handleSelectUser(item.user._id)}
          >
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                {/* top row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {getInitials(item.user?.name)}
                      </div>

                      <span
                        className={`absolute bottom-0 ring-0 w-3 h-3 rounded-full border-2 border-gray-800 ${
                          onlineUsers.includes(item.user._id)
                            ? "bg-green-400"
                            : "bg-gray-500"
                        }`}
                      />
                    </div>
                    <p className="font-medium truncate">
                      {item.user?.name || "Unknown"}
                    </p>
                  </div>

                  {item.createdAt && (
                    <span className="text-xs text-gray-500 shrink-0 ml-2">
                      {formatTime(item.createdAt)}
                    </span>
                  )}
                </div>
                {/* last message */}
                <p className="text-gray-400 text-sm truncate ml-4">
                  {item.lastMessage || "No messages yet"}
                </p>
              </div>

              {/* unread badge */}
              {item.unread > 0 && (
                <span className="bg-blue-600 rounded-full px-2 py-1 text-xs ml-2 shrink-0">
                  {item.unread}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Users;
