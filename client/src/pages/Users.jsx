import React, { useEffect, useId, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const { id: activeUserId } = useParams();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get("/messages/conversations");
        setUsers(res.data);
      } catch (error) {
        console.error("Failed to fetch Users: " + error);
      }
    };
    fetchMessages();
  }, []);

  const handleSelectUser = (userId) => {
    navigate(`/chat/${userId}`);
  };
  return (
    <div className="bg-gray-900 h-full p-3 space-y-2">
      <h2 className="text-lg font-semibold mb-2">Chats</h2>

      {users.map((item) => {
        const isActive = item.user._id === activeUserId;
        return (
          <div
            key={item.user._id}
            className={`p-3 rounded cursor-pointer transition ${isActive ? "bg-gray-700" : "bg-gray-800 hover:bg-gray-700"}`}
            onClick={() => handleSelectUser(item.user._id)}
          >
            <p className="font-medium">{item.user.name}</p>
            <p className="text-gray-400 text-sm truncate ">
              {item.lastMessage || "No messages yet"}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default Users;
