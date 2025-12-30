import User from "../models/User.js";
import Lead from "../models/Lead.js";

/* ================= HELPERS ================= */
const formatTime = (date) => {
  if (!date) return "--:--";
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const todayStr = () => new Date().toISOString().split("T")[0];

/* ================= DASHBOARD ================= */
export const getDashboard = async (req, res) => {
  try {
    const user = req.user;
    const lastBreak = user.breakLogs?.at(-1) || null;

    res.json({
      checkInTime: user.checkInTime ? formatTime(user.checkInTime) : "--:--",
      lastCheckout: user.lastCheckout ? formatTime(user.lastCheckout) : "--:--",

      // ✅ button state logic
      isCheckedIn: Boolean(user.checkInTime && user.lastCheckout === null),
      isOnBreak: Boolean(user.isOnBreak),

      breakStart: lastBreak?.start ? formatTime(lastBreak.start) : "--:--",
      breakEnd: lastBreak?.end ? formatTime(lastBreak.end) : "--:--",

      breakLogs: user.breakLogs?.slice(-4).reverse() || [],
      activities: user.recentActivity || [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= CHECK IN ================= */
export const checkIn = async (req, res) => {
  try {
    if (req.user.checkInTime && req.user.lastCheckout === null) {
      return res.status(400).json({ message: "Already checked in" });
    }

    const now = new Date();

    req.user.checkInTime = now;
    req.user.lastCheckout = null;
    req.user.isOnBreak = false;
    req.user.lastActiveDate = todayStr();

    // ✅ activity
    req.user.recentActivity.unshift("Checked in");
    req.user.recentActivity = req.user.recentActivity.slice(0, 7);

    await req.user.save();
    res.json({ success: true, time: formatTime(now) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= CHECK OUT ================= */
export const checkOut = async (req, res) => {
  try {
    if (!req.user.checkInTime || req.user.lastCheckout !== null) {
      return res.status(400).json({ message: "You are not checked in" });
    }

    const now = new Date();

    req.user.lastCheckout = now;
    req.user.isOnBreak = false;

    // end active break if any
    const last = req.user.breakLogs?.at(-1);
    if (last && !last.end) last.end = now;

    req.user.recentActivity.unshift("Checked out");
    req.user.recentActivity = req.user.recentActivity.slice(0, 7);

    await req.user.save();
    res.json({ success: true, time: formatTime(now) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= BREAK START ================= */
export const startBreak = async (req, res) => {
  try {
    if (!req.user.checkInTime || req.user.lastCheckout !== null) {
      return res.status(400).json({ message: "Check in first" });
    }

    if (req.user.isOnBreak) {
      return res.status(400).json({ message: "Already on break" });
    }

    const today = todayStr();
    const now = new Date();

    const alreadyTaken = req.user.breakLogs.some(
      (b) => b.date === today && b.start && b.end
    );

    if (alreadyTaken) {
      return res
        .status(400)
        .json({ message: "Only one break allowed per day" });
    }

    req.user.isOnBreak = true;
    req.user.breakLogs.push({ date: today, start: now, end: null });

    req.user.recentActivity.unshift("Break started");
    req.user.recentActivity = req.user.recentActivity.slice(0, 7);

    await req.user.save();
    res.json({ success: true, time: formatTime(now) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= BREAK END ================= */
export const endBreak = async (req, res) => {
  try {
    if (!req.user.isOnBreak) {
      return res.status(400).json({ message: "Not on break" });
    }

    const now = new Date();
    req.user.isOnBreak = false;

    const last = req.user.breakLogs?.at(-1);
    if (last && !last.end) last.end = now;

    req.user.recentActivity.unshift("Break ended");
    req.user.recentActivity = req.user.recentActivity.slice(0, 7);

    await req.user.save();
    res.json({ success: true, time: formatTime(now) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= BREAK LOGS ================= */
/* ================= BREAK LOGS ================= */
export const getBreakLogs = async (req, res) => {
  try {
    res.json(
      (req.user.breakLogs || [])
        .slice(-4)
        .reverse()
        .map((b) => ({
          // 📅 DATE ONLY (YYYY-MM-DD)
          date: b.start
            ? new Date(b.start).toISOString().split("T")[0]
            : "--",

          // 🕒 TIME ONLY (HH:MM)
          start: formatTime(b.start),
          end: formatTime(b.end),
        }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= MY LEADS ================= */
export const getMyLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ assignedTo: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= PROFILE ================= */
export const getProfile = async (req, res) => {
  res.json({
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone || "",
    location: req.user.location || "",
  });
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, location } = req.body;

    req.user.name = name;
    req.user.phone = phone;
    req.user.location = location;

    await req.user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
