import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

/* =========================
   GLOBAL MIDDLEWARES
========================= */
app.use(express.json());
app.use(cookieParser());

/*
  ✅ CORS FIX (IMPORTANT)
  - Allow browser requests from anywhere
  - JWT is sent via Authorization header
  - NO cookies required
*/
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* =========================
   ROUTES
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
