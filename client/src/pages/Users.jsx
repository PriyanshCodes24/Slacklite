import React, { useEffect, useId, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const Users = ({ conversations }) => {
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
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.user?.name || "Unknown"}</p>
                <p className="text-gray-400 text-sm truncate ">
                  {item.lastMessage || "No messages yet"}
                </p>
              </div>

              {item.unread > 0 && (
                <span className="bg-blue-600 rounded-full px-2 py-1 text-xs">
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
