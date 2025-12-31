import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

router.post("/create-admin", async (req, res) => {
  const email = "admin@gmail.com";
  const plainPassword = "admin@gmail.com";

  // remove old admin if exists
  await User.deleteMany({ email });

  const admin = await User.create({
    name: "Admin",
    email,
    role: "Admin",
    language: "english",
    status: "Active",
    password: bcrypt.hashSync(plainPassword, 10),
  });

  res.json({
    success: true,
    message: "Admin created successfully",
    email,
    password: plainPassword,
  });
});

export default router;   // ✅ THIS LINE FIXES YOUR ERROR
