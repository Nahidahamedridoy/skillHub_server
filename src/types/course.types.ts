import { ObjectId } from "mongodb";

export interface Course {
  title: string;
  slug: string;
  thumbnail: string;
  shortDescription: string;
  description: string;

  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";

  price: number;
  duration: string;

  instructorId: ObjectId;
  instructorName: string;

  lessons: string[];
  requirements: string[];
  outcomes: string[];

  status: "pending" | "approved" | "rejected";

  totalStudents: number;
  averageRating: number;

  createdAt: Date;
  updatedAt: Date;
}