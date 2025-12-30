import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { resetDaily } from "../middleware/resetDaily.js";

import {
  getDashboard,
  checkIn,
  checkOut,
  startBreak,
  endBreak,
  getBreakLogs,
  getMyLeads,
  getProfile,
  updateProfile
} from "../controllers/userController.js";

const router = express.Router();

/**
 * Middleware
 */
router.use(protect, resetDaily);

/* ================= DASHBOARD ================= */
router.get("/dashboard", getDashboard);

/* ================= CHECK-IN / CHECK-OUT ================= */
router.post("/checkin", checkIn);
router.post("/checkout", checkOut);

/* ================= BREAK ================= */
router.post("/break/start", startBreak);
router.post("/break/end", endBreak);
router.get("/break/logs", getBreakLogs);

/* ================= LEADS ================= */
router.get("/leads", getMyLeads);

/* ================= PROFILE ================= */
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

export default router;
