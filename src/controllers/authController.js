import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "USER NOT FOUND" });
    }

    const match = bcrypt.compareSync(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "PASSWORD MISMATCH" });
    }

    user.lastLoginAt = new Date();
    user.status = "Active";
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= LOGOUT ================= */
export const logout = async (req, res) => {
  try {
    req.user.status = "Inactive";
    await req.user.save();

    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
