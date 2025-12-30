import express from "express";
import {
  createEmployee,
  listEmployees,
  deleteEmployees,
  updateEmployee   
} from "../controllers/employeeController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, adminOnly, createEmployee);
router.get("/", protect, adminOnly, listEmployees);
router.put("/:id", protect, adminOnly, updateEmployee);
router.delete("/", protect, adminOnly, deleteEmployees);

export default router;
