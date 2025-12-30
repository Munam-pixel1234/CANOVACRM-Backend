import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    employeeId: String,
    password: String,

    language: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["Admin", "Sales"],
      default: "Sales",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Inactive",
    },

    assignedLeads: { type: Number, default: 0 },
    closedLeads: { type: Number, default: 0 },

    checkInTime: Date,
    lastCheckout: Date,

    isOnBreak: {
      type: Boolean,
      default: false, // ✅ IMPORTANT
    },

    // ✅ REQUIRED FOR 12 AM RESET
    lastActiveDate: {
      type: String, // YYYY-MM-DD
    },

    breakLogs: [
      {
        date: String,
        start: Date,
        end: Date,
      },
    ],

    recentActivity: {
      type: [String],
      default: [],
    },

    phone: String,
    location: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
