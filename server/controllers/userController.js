const User = require("../models/User");

exports.getAllUsers = async (req, res) => {
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

exports.searchUsers = async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) return res.json([]);

    const users = await User.find({
      name: { $regex: query, $options: "i" },
      _id: { $ne: req.user._id },
    }).select("name email");

    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: "Search failed" });
  }
};

