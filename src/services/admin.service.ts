import { ObjectId } from "mongodb";
import { coursesCollection } from "../models/course.model.js";

export interface GetAdminCoursesFilters {
  page?: number;
  limit?: number;
  search?: string;
  title?: string;
  category?: string;
  status?: string;
  level?: string;
  sortByCreatedAt?: "asc" | "desc";
  sortByPrice?: "asc" | "desc";
}

export async function getAdminCourses(filters: GetAdminCoursesFilters) {
  const {
    page = 1,
    limit = 10,
    search,
    title,
    category,
    status,
    level,
    sortByCreatedAt,
    sortByPrice,
  } = filters;

  const query: any = {};

  const searchVal = search || title;
  if (searchVal) {
    query.title = { $regex: searchVal, $options: "i" };
  }

  if (category) {
    query.category = category;
  }

  if (status) {
    query.status = status;
  }

  if (level) {
    query.level = level;
  }

  const sort: any = {};
  if (sortByPrice) {
    sort.price = sortByPrice === "desc" ? -1 : 1;
  } else if (sortByCreatedAt) {
    sort.createdAt = sortByCreatedAt === "desc" ? -1 : 1;
  } else {
    sort.createdAt = -1; // default sort
  }

  const pageNum = Math.max(1, page);
  const limitNum = Math.max(1, limit);
  const skip = (pageNum - 1) * limitNum;

  const total = await coursesCollection().countDocuments(query);
  const courses = await coursesCollection()
    .find(query)
    .sort(sort)
    .skip(skip)
    .limit(limitNum)
    .toArray();

  const totalPages = Math.ceil(total / limitNum);

  return {
    courses,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    },
  };
}

export async function approveCourse(id: string) {
  if (!ObjectId.isValid(id)) {
    throw new Error("Course not found");
  }

  const courseId = new ObjectId(id);
  const course = await coursesCollection().findOne({ _id: courseId });
  if (!course) {
    throw new Error("Course not found");
  }

  await coursesCollection().updateOne(
    { _id: courseId },
    {
      $set: {
        status: "approved",
        updatedAt: new Date(),
      },
      $unset: {
        feedback: "",
      },
    }
  );

  const updatedCourse = await coursesCollection().findOne({ _id: courseId });
  return updatedCourse;
}

export async function rejectCourse(id: string, feedback: string) {
  if (!ObjectId.isValid(id)) {
    throw new Error("Course not found");
  }

  if (!feedback || !feedback.trim()) {
    throw new Error("Feedback is required");
  }

  const courseId = new ObjectId(id);
  const course = await coursesCollection().findOne({ _id: courseId });
  if (!course) {
    throw new Error("Course not found");
  }

  await coursesCollection().updateOne(
    { _id: courseId },
    {
      $set: {
        status: "rejected",
        feedback: feedback.trim(),
        updatedAt: new Date(),
      },
    }
  );

  const updatedCourse = await coursesCollection().findOne({ _id: courseId });
  return updatedCourse;
}

export async function deleteCourse(id: string) {
  if (!ObjectId.isValid(id)) {
    throw new Error("Course not found");
  }

  const courseId = new ObjectId(id);
  const course = await coursesCollection().findOne({ _id: courseId });
  if (!course) {
    throw new Error("Course not found");
  }

  await coursesCollection().deleteOne({ _id: courseId });
}

export async function getAdminStats() {
  const totalCourses = await coursesCollection().countDocuments();
  const approvedCourses = await coursesCollection().countDocuments({ status: "approved" });
  const pendingCourses = await coursesCollection().countDocuments({ status: "pending" });
  const rejectedCourses = await coursesCollection().countDocuments({ status: "rejected" });
  
  // Aggregate total students from all courses
  const studentsResult = await coursesCollection().aggregate([
    { $group: { _id: null, totalStudents: { $sum: "$studentsCount" } } }
  ]).toArray();
  
  const totalStudents = studentsResult.length > 0 ? studentsResult[0].totalStudents : 0;

  return {
    totalCourses,
    approvedCourses,
    pendingCourses,
    rejectedCourses,
    totalStudents
  };
}
