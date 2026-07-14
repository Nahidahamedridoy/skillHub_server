import { ObjectId } from "mongodb";
import { coursesCollection } from "../models/course.model.js";
import { Course } from "../types/course.types.js";

interface CreateCourseInput {
  title: string;
  thumbnail: string;
  shortDescription: string;
  description: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  price: number;
  duration: string;
  lessons?: string[];
  requirements?: string[];
  outcomes?: string[];
  instructorId: string;
  instructorName: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createCourse(input: CreateCourseInput) {
  const {
    title,
    thumbnail,
    shortDescription,
    description,
    category,
    level,
    price,
    duration,
    lessons = [],
    requirements = [],
    outcomes = [],
    instructorId,
    instructorName,
  } = input;

  // Validate required fields
  if (
    !title ||
    !thumbnail ||
    !shortDescription ||
    !description ||
    !category ||
    !level ||
    price === undefined ||
    price === null ||
    !duration
  ) {
    throw new Error("All required fields must be provided");
  }

  if (typeof price !== "number" || price < 0) {
    throw new Error("Price must be a non-negative number");
  }

  const validLevels = ["Beginner", "Intermediate", "Advanced"];
  if (!validLevels.includes(level)) {
    throw new Error("Level must be one of: Beginner, Intermediate, Advanced");
  }

  // Generate unique slug
  let slug = generateSlug(title);
  let isUnique = false;
  let counter = 0;

  while (!isUnique) {
    const existing = await coursesCollection().findOne({ slug });
    if (!existing) {
      isUnique = true;
    } else {
      counter++;
      slug = `${generateSlug(title)}-${counter}`;
    }
  }

  const now = new Date();

  const course: Course = {
    title,
    slug,
    thumbnail,
    shortDescription,
    description,
    category,
    level,
    price,
    duration,
    lessons,
    requirements,
    outcomes,
    instructorId: new ObjectId(instructorId),
    instructorName,
    status: "pending",
    totalStudents: 0,
    averageRating: 0,
    createdAt: now,
    updatedAt: now,
  };

  const result = await coursesCollection().insertOne(course);

  return {
    _id: result.insertedId,
    ...course,
  };
}

export interface GetCoursesFilters {
  page?: number;
  limit?: number;
  search?: string;
  title?: string;
  category?: string;
  level?: string;
  sortByPrice?: "asc" | "desc";
}

export async function getCourses(filters: GetCoursesFilters) {
  const { page = 1, limit = 10, search, title, category, level, sortByPrice } = filters;

  const query: any = { status: "approved" };

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
    sort.price = sortByPrice === "desc" ? -1 : 1;
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

export async function getSingleCourse(id: string) {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid course id");
  }

  const course = await coursesCollection().findOne({
    _id: new ObjectId(id),
    status: "approved",
  });

  if (!course) {
    throw new Error("Course not found");
  }

  return course;
}

export interface UpdateCourseInput {
  title?: string;
  thumbnail?: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  level?: "Beginner" | "Intermediate" | "Advanced";
  price?: number;
  duration?: string;
  lessons?: string[];
  requirements?: string[];
  outcomes?: string[];
}

export async function updateCourse(id: string, instructorId: string, input: UpdateCourseInput) {
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

  const updateData: any = {};

  if (input.title !== undefined) {
    if (!input.title.trim()) {
      throw new Error("Title cannot be empty");
    }
    updateData.title = input.title;

    if (input.title !== course.title) {
      let slug = generateSlug(input.title);
      let isUnique = false;
      let counter = 0;

      while (!isUnique) {
        const existing = await coursesCollection().findOne({
          slug,
          _id: { $ne: courseId },
        });
        if (!existing) {
          isUnique = true;
        } else {
          counter++;
          slug = `${generateSlug(input.title)}-${counter}`;
        }
      }
      updateData.slug = slug;
    }
  }

  if (input.thumbnail !== undefined) {
    if (!input.thumbnail.trim()) {
      throw new Error("Thumbnail cannot be empty");
    }
    updateData.thumbnail = input.thumbnail;
  }

  if (input.shortDescription !== undefined) {
    if (!input.shortDescription.trim()) {
      throw new Error("Short description cannot be empty");
    }
    updateData.shortDescription = input.shortDescription;
  }

  if (input.description !== undefined) {
    if (!input.description.trim()) {
      throw new Error("Description cannot be empty");
    }
    updateData.description = input.description;
  }

  if (input.category !== undefined) {
    if (!input.category.trim()) {
      throw new Error("Category cannot be empty");
    }
    updateData.category = input.category;
  }

  if (input.level !== undefined) {
    const validLevels = ["Beginner", "Intermediate", "Advanced"];
    if (!validLevels.includes(input.level)) {
      throw new Error("Level must be one of: Beginner, Intermediate, Advanced");
    }
    updateData.level = input.level;
  }

  if (input.price !== undefined) {
    if (typeof input.price !== "number" || input.price < 0) {
      throw new Error("Price must be a non-negative number");
    }
    updateData.price = input.price;
  }

  if (input.duration !== undefined) {
    if (!input.duration.trim()) {
      throw new Error("Duration cannot be empty");
    }
    updateData.duration = input.duration;
  }

  if (input.lessons !== undefined) {
    if (!Array.isArray(input.lessons)) {
      throw new Error("Lessons must be an array");
    }
    updateData.lessons = input.lessons;
  }

  if (input.requirements !== undefined) {
    if (!Array.isArray(input.requirements)) {
      throw new Error("Requirements must be an array");
    }
    updateData.requirements = input.requirements;
  }

  if (input.outcomes !== undefined) {
    if (!Array.isArray(input.outcomes)) {
      throw new Error("Outcomes must be an array");
    }
    updateData.outcomes = input.outcomes;
  }

  // Always update updatedAt
  updateData.updatedAt = new Date();

  await coursesCollection().updateOne(
    { _id: courseId },
    { $set: updateData }
  );

  const updatedCourse = await coursesCollection().findOne({ _id: courseId });
  return updatedCourse;
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

