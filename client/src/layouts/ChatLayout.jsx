import React, { useEffect, useRef, useState } from "react";
import Users from "../pages/Users";
import { data, Outlet, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { io } from "socket.io-client";

const ChatLayout = () => {
  const [conversations, setConversations] = useState([]);
  const userId = localStorage.getItem("userId");
  const { id: activeChatId } = useParams();
  const activeChatRef = useRef(null);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // search
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!search.trim) {
        setResults([]);
        return;
      }

      try {
        const res = await api.get(`/users/search?q=${search}`);
        setResults(res.data);
        console.log(res.data);
      } catch (error) {
        console.error(error);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  // socket
  useEffect(() => {
    const fetchConversations = async () => {
      const res = await api.get("/messages/conversations");
      setConversations(
        res.data.map((c) => ({
          ...c,
          unread: 0,
        })),
      );
    };
    fetchConversations();

    const socket = io("http://localhost:5000");
    socket.emit("join", userId);
    socket.on("receive_message", (data) => {
      updateSidebar(data);
    });
    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });
    return () => socket.disconnect();
  }, []);

  // chatRef
  useEffect(() => {
    activeChatRef.current = activeChatId;
  }, [activeChatId]);

  // setConversations
  useEffect(() => {
    if (!activeChatId) return;

    setConversations((prev) =>
      prev.map((c) =>
        c.user._id.toString() === activeChatId ? { ...c, unread: 0 } : c,
      ),
    );
  }, [activeChatId]);

  const handleUserClick = (user) => {
    const newUserId = user._id;

    setConversations((prev) => {
      const exists = prev.find((c) => c.user._id === newUserId);

      if (exists) return prev;

      return [
        {
          user: user,
          lastMessage: "",
          unread: 0,
          createdAt: new Date(),
        },
        ...prev,
      ];
    });

    setSearch("");
    setResults([]);
    navigate(`/chat/${newUserId}`);
  };

  const updateSidebar = (msg) => {
    if (!msg?.sender || !msg?.receiver) {
      console.warn("Invalid message skipped:", msg);
      return;
    }

    setConversations((prev) => {
      const senderId =
        typeof msg.sender === "object" ? msg.sender._id : msg.sender;
      const receiverId =
        typeof msg.receiver === "object" ? msg.receiver._id : msg.receiver;

      if (!senderId || !receiverId) {
        console.warn("Invalid IDs:", msg);
        return;
      }

      const otherUserId = senderId === userId ? receiverId : senderId;

      const existing = prev.find((c) => c.user._id === otherUserId);

      let updated;

      if (existing) {
        updated = prev.map((c) =>
          c.user._id === otherUserId
            ? {
                ...c,
                lastMessage: msg.content,

                unread:
                  otherUserId !== activeChatRef.current
                    ? (c.unread || 0) + 1
                    : 0,
              }
            : c,
        );
      } else {
        updated = [
          {
            user: { _id: otherUserId, name: "New User" },
            lastMessage: msg.content,
            unread: otherUserId !== activeChatRef.current ? 1 : 0,
          },
          ...prev,
        ];
      }

      const filtered = updated.filter((c) => c.user._id !== otherUserId);
      const target = updated.find((c) => c.user._id === otherUserId);
      return target ? [target, ...filtered] : updated;
    });
  };

  return (
    <div className="h-screen flex bg-gray-900">
      <div className="border-gray-700 border-r overflow-auto w-75 ">
        <div className="p-3 border-b border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-white font-semibold">
              {localStorage.getItem("userName") || "User"}
            </p>
            <p className="text-xs text-gray-400">Online</p>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
          >
            Logout
          </button>
        </div>
        <div className="p-2 border-b border-gray-700">
          <input
            type="text"
            placeholder="Search Users"
            className="w-full bg-gray-800 p-2 rounded outline-none"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />

          {results.length > 0 && (
            <div className="mt-2 bg-gray-800 rounded shadow">
              {results.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserClick(user)}
                  className="cursor-pointer p-2 hover:bg-gray-700"
                >
                  <p className="text-sm">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <Users conversations={conversations} onlineUsers={onlineUsers} />
      </div>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default ChatLayout;
