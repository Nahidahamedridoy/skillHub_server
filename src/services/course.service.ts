import { ObjectId } from "mongodb";
import { coursesCollection } from "../models/course.model.js";
import { Course } from "../types/course.types.js";

export async function createCourse(input: Partial<Course> & { instructorId: string; instructorName: string }) {
  const { instructorId, instructorName, ...rest } = input;

  if (!rest.title || !rest.category || !rest.price || !rest.imageUrl || !rest.duration) {
    throw new Error("Missing required fields: title, category, price, imageUrl, duration");
  }

  const now = new Date();

  const course: Omit<Course, "_id" | "id"> = {
    title: rest.title,
    instructor: instructorName,
    category: rest.category,
    rating: rest.rating || 0,
    reviewsCount: rest.reviewsCount || 0,
    price: rest.price,
    originalPrice: rest.originalPrice,
    imageUrl: rest.imageUrl,
    badge: rest.badge,
    lessonsCount: rest.lessonsCount || 0,
    duration: rest.duration,
    status: "approved",
    
    description: rest.description,
    descriptionParagraphs: rest.descriptionParagraphs || [],
    studentsCount: rest.studentsCount || 0,
    language: rest.language || "English (US)",
    lastUpdated: rest.lastUpdated || now.toLocaleString('default', { month: 'long', year: 'numeric' }),
    level: rest.level || "Beginner",
    highlights: rest.highlights || [],
    certificate: rest.certificate ?? true,
    instructorDetails: rest.instructorDetails,
    curriculum: rest.curriculum || [],
    reviews: rest.reviews || [],

    instructorId: new ObjectId(instructorId),
    createdAt: now,
    updatedAt: now,
  };

  const result = await coursesCollection().insertOne(course);
  
  const createdCourse = {
    _id: result.insertedId,
    id: result.insertedId.toString(),
    ...course,
  };

  return createdCourse;
}

export interface GetCoursesFilters {
  page?: number;
  limit?: number;
  search?: string;
  title?: string;
  category?: string;
  level?: string;
  instructorId?: string;
  status?: string;
  sortByPrice?: "asc" | "desc";
}

export async function getCourses(filters: GetCoursesFilters) {
  const { page = 1, limit = 10, search, title, category, level, instructorId, status, sortByPrice } = filters;

  const query: any = {};

  if (status) {
    query.status = status;
  } else if (!instructorId) {
    query.status = "approved";
  }

  if (instructorId && ObjectId.isValid(instructorId)) {
    query.instructorId = new ObjectId(instructorId);
  }

  const searchVal = search || title;
  if (searchVal) {
    query.title = { $regex: searchVal, $options: "i" };
  }

  if (category) {
    query.category = category;
  }

  if (level) {
    query.level = level;
  }

  const sort: any = {};
  if (sortByPrice) {
    // Note: since price is a string like "$94.99", sorting in mongo won't be perfect.
    // If needed, we could strip '$' and sort. For now, just sort by the string value.
    sort.price = sortByPrice === "desc" ? -1 : 1;
  } else {
    sort.createdAt = -1; // default sort
  }

  const pageNum = Math.max(1, page);
  const limitNum = Math.max(1, limit);
  const skip = (pageNum - 1) * limitNum;

  const total = await coursesCollection().countDocuments(query);
  const rawCourses = await coursesCollection()
    .find(query)
    .sort(sort)
    .skip(skip)
    .limit(limitNum)
    .toArray();

  const courses = rawCourses.map(c => ({
    ...c,
    id: c._id.toString()
  }));

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

export async function getSingleCourse(id: string) {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid course id");
  }

  // We don't filter by 'approved' here so instructors can preview their pending courses
  const course = await coursesCollection().findOne({
    _id: new ObjectId(id)
  });

  if (!course) {
    throw new Error("Course not found");
  }

  return {
    ...course,
    id: course._id.toString()
  };
}

export async function updateCourse(id: string, instructorId: string, input: Partial<Course>) {
  if (!ObjectId.isValid(id)) {
    throw new Error("Course not found");
  }

  const courseId = new ObjectId(id);
  const course = await coursesCollection().findOne({ _id: courseId });

  if (!course) {
    throw new Error("Course not found");
  }

  if (course.instructorId.toString() !== instructorId) {
    throw new Error("Unauthorized");
  }

  const updateData: any = { ...input };
  
  // Prevent overwriting critical fields
  delete updateData._id;
  delete updateData.id;
  delete updateData.instructorId;
  delete updateData.createdAt;

  updateData.updatedAt = new Date();

  await coursesCollection().updateOne(
    { _id: courseId },
    { $set: updateData }
  );

  const updatedCourse = await coursesCollection().findOne({ _id: courseId });
  return {
    ...updatedCourse,
    id: updatedCourse?._id.toString()
  };
}

export async function deleteCourse(id: string, instructorId: string) {
  if (!ObjectId.isValid(id)) {
    throw new Error("Course not found");
  }

  const courseId = new ObjectId(id);
  const course = await coursesCollection().findOne({ _id: courseId });

  if (!course) {
    throw new Error("Course not found");
  }

  if (course.instructorId.toString() !== instructorId) {
    throw new Error("Unauthorized");
  }

  await coursesCollection().deleteOne({ _id: courseId });
}
