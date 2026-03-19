import { useEffect, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";
import api from "./services/api";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const userId = "69badb546202be4af13a628a";
  const receiverId = "69badb326202be4af13a6286";

  useEffect(() => {
    const socket = io("http://localhost:6000");

    socket.emit("join", userId);

    socket.on("receive_message", (data) => {
      if (data.sender !== userId) setChat((prev) => [...prev, data]);
    });

    return () => socket.disconnect();
  }, []);

  const sendMessage = async () => {
    if (!message) return;

    try {
      await api.post("/messages", {
        content: message,
        receiver: receiverId,
        chatType: "dm",
      });

      setChat((prev) => [...prev, { sender: userId, content: message }]);
      setMessage("");
    } catch (error) {
      console.log("Message failed: ", error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Chat</h2>

      <div style={{ border: "1px solid black", height: 300, overflow: "auto" }}>
        {chat.map((msg, i) => (
          <div key={i}>
            <b>{msg.sender === userId ? "Me" : "Other"}:</b> {msg.content}
          </div>
        ))}
      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type message..."
      />
      <button onClick={sendMessage}>send</button>
    </div>
  );
}

export default App;
