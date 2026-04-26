import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", {
        email,
        name: username,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data._id);

      navigate("/");
    } catch (e) {
      console.error(e);
      alert("Failed to register");
    }
  };
  return (
    <div className="h-screen bg-gray-900 flex items-center justify-center">
      <form
        onSubmit={handleRegister}
        className="bg-gray-800 p-6 rounded w-80 shadow space-y-4"
      >
        <h2 className="text-xl text-center font-semibold">Register</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-gray-700 p-2 outline-none w-full rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-gray-700 p-2 outline-none w-full rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-gray-700 p-2 outline-none w-full rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded outline-none "
        >
          Register
        </button>
        <div className="text-center text-sm text-gray-400 hover:text-gray-300 transition">
          <Link to="/login" className="hover:underline underline-offset-4">
            Don't have an account? Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
