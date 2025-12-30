import express from "express";
import {
  getLeads,
  createLead,
  updateLead,
  uploadCSV,
  getAssignedLeads,
} from "../controllers/leadController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Get leads assigned to logged-in user
router.get("/user/leads", protect, getAssignedLeads);


// Get all leads
router.get("/", protect, getLeads);

// Create single lead
router.post("/", protect, adminOnly, createLead);

// Update lead
router.put("/:id", protect, updateLead);

// ✅ CSV upload (THIS IS REQUIRED)
router.post(
  "/upload",
  protect,
  adminOnly,
  upload.single("file"),
  uploadCSV
);

export default router;
