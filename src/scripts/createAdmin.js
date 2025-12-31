import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    console.log("⏳ Connecting to DB...");
    await mongoose.connect(process.env.MONGO_URI);

    const email = "admin@gmail.com";
    const password = "admin@gmail.com";

    const existing = await User.findOne({ email });

    if (existing) {
      existing.role = "Admin";
      existing.language = "english"; // ✅ REQUIRED
      existing.status = "Active";    // ✅ IMPORTANT
      existing.password = bcrypt.hashSync(password, 10);
      await existing.save();

      console.log("✅ Admin already existed — role & fields fixed");
    } else {
      await User.create({
        name: "Admin",
        email,
        role: "Admin",
        language: "english", // ✅ REQUIRED
        status: "Active",    // ✅ IMPORTANT
        password: bcrypt.hashSync(password, 10),
      });

      console.log("✅ Admin user created successfully");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create admin:", error.message);
    process.exit(1);
  }
};

createAdmin();
