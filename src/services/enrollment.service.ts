import { ObjectId } from "mongodb";
import { enrollmentsCollection } from "../models/enrollment.model.js";
import { coursesCollection } from "../models/course.model.js";

// ─── Enroll ───────────────────────────────────────────────────────────────────

export async function enroll(userId: string, courseId: string) {
  if (!ObjectId.isValid(courseId)) {
    throw new Error("Course not found");
  }

  const courseObjectId = new ObjectId(courseId);
  const userObjectId = new ObjectId(userId);

  // Verify course exists
  const course = await coursesCollection().findOne({ _id: courseObjectId });
  console.log(course ,"course");
  if (!course) {
    throw new Error("Course not found");
  }

  // Prevent enrolling in own course
  if (course.instructorId.toString() === userId) {
    throw new Error("You cannot enroll in your own course");
  }

  // Prevent duplicate enrollment
  const existing = await enrollmentsCollection().findOne({
    userId: userObjectId,
    courseId: courseObjectId,
  });
  if (existing) {
    throw new Error("Already enrolled in this course");
  }

  const now = new Date();
  const doc = {
    userId: userObjectId,
    courseId: courseObjectId,
    enrolledAt: now,
    progress: 0,
  };

  const result = await enrollmentsCollection().insertOne(doc);

  return {
    _id: result.insertedId,
    id: result.insertedId.toString(),
    ...doc,
  };
}

// ─── Get My Enrollments ───────────────────────────────────────────────────────

export async function getMyEnrollments(userId: string) {
  const userObjectId = new ObjectId(userId);

  const enrollments = await enrollmentsCollection()
    .find({ userId: userObjectId })
    .sort({ enrolledAt: -1 })
    .toArray();

  if (enrollments.length === 0) return [];

  // Batch-fetch courses
  const courseIds = enrollments.map((e) => e.courseId);
  const courses = await coursesCollection()
    .find({ _id: { $in: courseIds } })
    .toArray();

  const courseMap = new Map(courses.map((c) => [c._id.toString(), c]));

  return enrollments.map((e) => {
    const course = courseMap.get(e.courseId.toString());
    return {
      id: e._id!.toString(),
      enrolledAt: e.enrolledAt,
      progress: e.progress,
      course: course
        ? {
            id: course._id.toString(),
            title: course.title,
            instructor: course.instructor,
            imageUrl: course.imageUrl,
            category: course.category,
            duration: course.duration,
            level: course.level,
          }
        : null,
    };
  });
}

// ─── Check Enrollment ─────────────────────────────────────────────────────────

export async function checkEnrollment(userId: string, courseId: string) {
  if (!ObjectId.isValid(courseId)) return false;

  const existing = await enrollmentsCollection().findOne({
    userId: new ObjectId(userId),
    courseId: new ObjectId(courseId),
  });

  return !!existing;
}

// ─── Unenroll ─────────────────────────────────────────────────────────────────

export async function unenroll(enrollmentId: string, userId: string) {
  if (!ObjectId.isValid(enrollmentId)) {
    throw new Error("Enrollment not found");
  }

  const enrollment = await enrollmentsCollection().findOne({
    _id: new ObjectId(enrollmentId),
  });

  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  if (enrollment.userId.toString() !== userId) {
    throw new Error("Unauthorized");
  }

  await enrollmentsCollection().deleteOne({ _id: new ObjectId(enrollmentId) });
}
