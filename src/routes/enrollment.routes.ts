import { Router } from "express";
import {
  enrollHandler,
  getMyEnrollmentsHandler,
  unenrollHandler,
} from "../controllers/enrollment.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/role.middleware.js";

const router = Router();

// POST /api/enrollments — students & instructors only (not admin)
router.post(
  "/",
  verifyToken,
  verifyRole("student"),
  enrollHandler
);

router.get(
  "/my",
  verifyToken,
  verifyRole("student"),
  getMyEnrollmentsHandler
);

router.delete(
  "/:id",
  verifyToken,
  verifyRole("student"),
  unenrollHandler
);

export default router;
