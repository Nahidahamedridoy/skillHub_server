import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import {
  createCourse,
  getCourses,
  getSingleCourse,
  updateCourse,
  deleteCourse,
} from "../services/course.service.js";

export async function createCourseHandler(req: Request, res: Response) {
  try {
    const instructor = req.user!;

    const course = await createCourse({
      ...req.body,
      instructorId: instructor.id,
      instructorName: instructor.name || instructor.email,
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getCoursesHandler(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = req.query.search as string;
    const title = req.query.title as string;
    const category = req.query.category as string;
    const level = req.query.level as string;
    const status = req.query.status as string;
    const instructorId = req.query.instructorId as string;

    const sortParam = req.query.sort as string;
    const priceParam = req.query.price as string;
    let sortByPrice: "asc" | "desc" | undefined;

    if (priceParam === "asc" || priceParam === "desc") {
      sortByPrice = priceParam;
    } else if (sortParam === "asc" || sortParam === "desc") {
      sortByPrice = sortParam;
    } else if (sortParam === "price") {
      sortByPrice = "asc";
    } else if (sortParam === "-price") {
      sortByPrice = "desc";
    }

    const result = await getCourses({
      page,
      limit,
      search,
      title,
      category,
      level,
      status,
      instructorId,
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

export async function getSingleCourseHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const course = await getSingleCourse(id);

    res.status(200).json({
      success: true,
      message: "Course retrieved successfully",
      data: course,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateCourseHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const instructor = req.user!;

    if (typeof id !== "string") {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const updatedCourse = await updateCourse(id, instructor.id, req.body);

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error: any) {
    if (error.message === "Course not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message === "Unauthorized") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this course",
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
    const instructor = req.user!;

    if (typeof id !== "string") {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    await deleteCourse(id, instructor.id);

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
    if (error.message === "Unauthorized") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this course",
      });
    }
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}



