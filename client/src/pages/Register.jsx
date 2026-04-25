import React from "react";
import { Link } from "react-router-dom";

const Register = () => {
  return (
    <div className="h-screen bg-gray-900 flex items-center justify-center">
      <form className="bg-gray-800 p-6 rounded w-80 shadow space-y-4">
        <h2 className="text-xl text-center font-semibold">Register</h2>
        <input
          type="text"
          placeholder="Username"
          className="bg-gray-700 p-2 outline-none w-full rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="bg-gray-700 p-2 outline-none w-full rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="bg-gray-700 p-2 outline-none w-full rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded outline-none "
        >
          Login
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
