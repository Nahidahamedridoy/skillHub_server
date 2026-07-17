import { ObjectId } from "mongodb";

export interface CourseInstructor {
  name: string;
  title?: string;
  avatar?: string;
  bio?: string;
  experienceYears?: number;
  totalStudents?: number;
  coursesCount?: number;
  avgRating?: number;
  socials?: { linkedin?: string; github?: string; website?: string; };
}

export interface CurriculumLesson {
  title: string;
  duration: string;
  isPreviewable?: boolean;
}

export interface CurriculumModule {
  id: string;
  title: string;
  duration: string;
  lessons: CurriculumLesson[];
}

export interface CourseReview {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Course {
  _id?: ObjectId;
  id?: string;
  title: string;
  instructor: string;        
  category: string;
  rating: number;
  reviewsCount: number;
  price: string;
  originalPrice?: string;
  imageUrl: string;
  badge?: string;
  lessonsCount: number;
  duration: string;
  status: "pending" | "approved" | "rejected";
  
  description?: string;                  
  descriptionParagraphs?: string[];      
  studentsCount?: number;
  language?: string;
  lastUpdated?: string;
  level?: string;
  highlights?: string[];                 
  certificate?: boolean;
  instructorDetails?: CourseInstructor;  
  curriculum?: CurriculumModule[];       
  reviews?: CourseReview[];              

  instructorId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}