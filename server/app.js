const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const conntectDB = require("./config/db");

const app = express();

conntectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;
