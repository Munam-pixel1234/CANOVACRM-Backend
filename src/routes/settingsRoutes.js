import express from "express";
import {
  getAdminProfile,
  updateAdminProfile
} from "../controllers/settingsController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Default Admin settings
 */
router.get("/", protect, adminOnly, getAdminProfile);
router.put("/", protect, adminOnly, updateAdminProfile);

export default router;
