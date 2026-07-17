import { ObjectId } from "mongodb";

export interface Enrollment {
  _id?: ObjectId;
  id?: string;
  userId: ObjectId;
  courseId: ObjectId;
  enrolledAt: Date;
  progress: number; // 0–100
}
