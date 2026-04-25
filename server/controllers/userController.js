const User = require("../models/User");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "_id name email",
    );
    res.status(200).json({ msg: "Users fetched successfully", users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Could not fetch Users" });
  }
};

module.exports = { getAllUsers };
