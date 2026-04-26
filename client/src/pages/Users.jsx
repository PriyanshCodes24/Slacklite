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
        const res = await api.get("/users/all");
        setUsers(res.data.users);
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

      {users.map((user) => {
        const isActive = user._id === activeUserId;
        return (
          <div
            key={user._id}
            className={`p-3 rounded cursor-pointer transition ${isActive ? "bg-gray-700" : "bg-gray-800 hover:bg-gray-700"}`}
            onClick={() => handleSelectUser(user._id)}
          >
            <p className="font-medium">{user.name}</p>
            <p className="text-gray-400 text-sm overflow-hidden">
              {user.email}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default Users;
