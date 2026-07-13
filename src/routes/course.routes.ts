import { Router } from "express";
import {
  createCourseHandler,
  getCoursesHandler,
  getSingleCourseHandler,
  updateCourseHandler,
} from "../controllers/course.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/role.middleware.js";

const router = Router();

router.post(
  "/",
  verifyToken,
  verifyRole("instructor"),
  createCourseHandler
);

router.get("/", getCoursesHandler);
router.get("/:id", getSingleCourseHandler);

router.patch(
  "/:id",
  verifyToken, // যদি টোকেন ভেরিফাই করতে চান
  verifyRole("instructor"), // যদি শুধু ইন্সট্রাক্টর আপডেট করতে পারে
  updateCourseHandler
);

export default router;