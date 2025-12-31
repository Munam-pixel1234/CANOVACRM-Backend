import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import tempAdmin from "./routes/tempAdmin.js";



const app = express();
app.use("/api/temp", tempAdmin);

/* =========================
   MIDDLEWARES (FIXED)
========================= */
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://canova-admin-frontend.vercel.app",
      "https://canova-user-frontend.vercel.app",
    ],
    credentials: true,
  })
);

/* =========================
   ROUTES (NO CHANGE)
========================= */
app.get("/", (req, res) => {
  res.send("Sales CRM API Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/user", userRoutes);

export default app;
