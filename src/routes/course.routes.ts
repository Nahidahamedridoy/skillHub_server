import { Router } from "express";
import {
  createCourseHandler,
  getCoursesHandler,
  getSingleCourseHandler,
  updateCourseHandler,
  deleteCourseHandler,
  getMyCoursesHandler,
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

router.get(
  "/my",
  verifyToken,
  verifyRole("instructor"),
  getMyCoursesHandler
);

router.get("/:id", getSingleCourseHandler);

router.patch(
  "/:id",
  verifyToken,
  verifyRole("instructor"),
  updateCourseHandler
);

router.delete(
  "/:id",
  verifyToken,
  verifyRole("instructor"),
  deleteCourseHandler
);

export default router;