import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import courseRoutes from "./routes/course.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      process.env.CLIENT_URL,
    ].filter(Boolean) as string[],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.send("SkillHub Server Running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/enrollments", enrollmentRoutes);

export default app;