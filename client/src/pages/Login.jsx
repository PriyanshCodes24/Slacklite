import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      console.log(res);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data._id);
      localStorage.setItem("receiverId", "69badb326202be4af13a6286");

      navigate("/chat");
    } catch (e) {
      console.error(e);
      alert("Login failed");
    }
  };
  return (
    <div className="h-screen bg-gray-900 flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="bg-gray-800 p-6 rounded w-80 shadow space-y-4"
      >
        <h2 className="text-xl text-center font-semibold">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          className="bg-gray-700 p-2 outline-none w-full rounded"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          className="bg-gray-700 p-2 outline-none w-full rounded"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded outline-none "
        >
          Login
        </button>
        <div className="text-center text-sm text-gray-400 hover:text-gray-300 transition">
          <Link to="/register" className="hover:underline underline-offset-4">
            Don't have an account? Register
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
