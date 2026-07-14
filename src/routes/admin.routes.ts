import { Router } from "express";
import {
  getAdminCoursesHandler,
  approveCourseHandler,
  rejectCourseHandler,
  deleteCourseHandler,
} from "../controllers/admin.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/role.middleware.js";

const router = Router();

router.get(
  "/courses",
  verifyToken,
  verifyRole("admin"),
  getAdminCoursesHandler
);

router.patch(
  "/courses/:id/approve",
  verifyToken,
  verifyRole("admin"),
  approveCourseHandler
);

router.patch(
  "/courses/:id/reject",
  verifyToken,
  verifyRole("admin"),
  rejectCourseHandler
);

router.delete(
  "/courses/:id",
  verifyToken,
  verifyRole("admin"),
  deleteCourseHandler
);

export default router;
