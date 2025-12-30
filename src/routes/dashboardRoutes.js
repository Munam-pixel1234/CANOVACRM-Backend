import express from "express";
import { getDashboard } from "../controllers/dashboardController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Dashboard KPIs + activity feed
 * Admin only
 */
router.get("/", protect, adminOnly, getDashboard);

export default router;
