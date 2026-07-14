import { Request, Response } from "express";
import {
  getAdminCourses,
  approveCourse,
  rejectCourse,
  deleteCourse,
} from "../services/admin.service.js";

export async function getAdminCoursesHandler(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = req.query.search as string;
    const title = req.query.title as string;
    const category = req.query.category as string;
    const status = req.query.status as string;
    const level = req.query.level as string;

    const sortParam = req.query.sort as string;
    const priceParam = req.query.price as string;

    let sortByPrice: "asc" | "desc" | undefined;
    let sortByCreatedAt: "asc" | "desc" | undefined;

    if (priceParam === "asc" || priceParam === "desc") {
      sortByPrice = priceParam;
    } else if (sortParam === "price") {
      sortByPrice = "asc";
    } else if (sortParam === "-price") {
      sortByPrice = "desc";
    }

    if (sortParam === "createdAt") {
      sortByCreatedAt = "asc";
    } else if (sortParam === "-createdAt") {
      sortByCreatedAt = "desc";
    }

    const result = await getAdminCourses({
      page,
      limit,
      search,
      title,
      category,
      status,
      level,
      sortByCreatedAt,
      sortByPrice,
    });

    res.status(200).json({
      success: true,
      message: "Courses retrieved successfully",
      data: result.courses,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function approveCourseHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const updatedCourse = await approveCourse(id);

    res.status(200).json({
      success: true,
      message: "Course approved successfully",
      data: updatedCourse,
    });
  } catch (error: any) {
    if (error.message === "Course not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function rejectCourseHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    if (typeof id !== "string") {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const updatedCourse = await rejectCourse(id, feedback);

    res.status(200).json({
      success: true,
      message: "Course rejected successfully",
      data: updatedCourse,
    });
  } catch (error: any) {
    if (error.message === "Course not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deleteCourseHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    await deleteCourse(id);

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error: any) {
    if (error.message === "Course not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

