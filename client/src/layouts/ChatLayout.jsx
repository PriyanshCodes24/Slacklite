import React from "react";
import Users from "../pages/Users";
import { Outlet } from "react-router-dom";

const ChatLayout = () => {
  return (
    <div className="h-screen flex bg-gray-900">
      <div className="border-gray-700 border-r overflow-auto w-1/4">
        <Users />
      </div>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default ChatLayout;
