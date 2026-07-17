import { Request, Response } from "express";
import {
  enroll,
  getMyEnrollments,
  unenroll,
} from "../services/enrollment.service.js";

// ─── POST /api/enrollments ────────────────────────────────────────────────────

export async function enrollHandler(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { courseId } = req.body;

    if (!courseId || typeof courseId !== "string") {
      return res.status(400).json({
        success: false,
        message: "courseId is required",
      });
    }

    const enrollment = await enroll(userId, courseId);

    return res.status(201).json({
      success: true,
      message: "Enrolled successfully",
      data: enrollment,
    });
  } catch (error: any) {
    const message: string = error?.message ?? "Enrollment failed";

    if (message === "Course not found") {
      return res.status(404).json({ success: false, message });
    }
    if (
      message === "Already enrolled in this course" ||
      message === "You cannot enroll in your own course"
    ) {
      return res.status(409).json({ success: false, message });
    }

    return res.status(400).json({ success: false, message });
  }
}

// ─── GET /api/enrollments/my ──────────────────────────────────────────────────

export async function getMyEnrollmentsHandler(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const enrollments = await getMyEnrollments(userId);

    return res.status(200).json({
      success: true,
      message: "Enrollments retrieved successfully",
      data: enrollments,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error?.message ?? "Failed to retrieve enrollments",
    });
  }
}

// ─── DELETE /api/enrollments/:id ─────────────────────────────────────────────

export async function unenrollHandler(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    await unenroll(id, userId);

    return res.status(200).json({
      success: true,
      message: "Unenrolled successfully",
    });
  } catch (error: any) {
    const message: string = error?.message ?? "Unenroll failed";

    if (message === "Enrollment not found") {
      return res.status(404).json({ success: false, message });
    }
    if (message === "Unauthorized") {
      return res.status(403).json({ success: false, message });
    }

    return res.status(400).json({ success: false, message });
  }
}
