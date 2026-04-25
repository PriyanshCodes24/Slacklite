const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { getAllUsers } = require("../controllers/userController");

const router = express.Router();

router.get("/all", protect, getAllUsers);

module.exports = router;
