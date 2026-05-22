const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { getAllUsers, searchUsers } = require("../controllers/userController");

const router = express.Router();

router.get("/all", protect, getAllUsers);
router.get("/search", protect, searchUsers);

module.exports = router;
    