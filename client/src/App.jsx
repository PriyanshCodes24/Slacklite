import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import api from "./services/api";
import { MessageStatus } from "./components/MessageStatus";
import {
  Route,
  Routes,
  BrowserRouter as Router,
  Navigate,
} from "react-router-dom";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Users from "./pages/Users";
import ChatLayout from "./layouts/ChatLayout";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={token ? <ChatLayout /> : <Navigate to="/login" />}
        >
          <Route
            index
            element={
              <div className="text-white p-4 text-center">Select a user</div>
            }
          />
          <Route path="chat/:id" element={<Chat />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
