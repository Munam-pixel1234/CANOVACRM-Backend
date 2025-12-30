import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).select("-password");
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { name, password } = req.body;

    const admin = await User.findById(req.user._id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (name) admin.name = name;
    if (password && password.length > 0) {
      admin.password = bcrypt.hashSync(password, 10);
    }

    await admin.save();

    res.json({ success: true, message: "Profile updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
