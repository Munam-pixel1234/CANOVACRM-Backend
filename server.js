import cors from "cors";

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
