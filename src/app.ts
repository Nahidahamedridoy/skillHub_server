import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import courseRoutes from "./routes/course.routes.js";

import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.send("SkillHub Server Running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);

export default app;