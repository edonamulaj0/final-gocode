import { StudentLevel } from "@/lib/constants/student-levels";

export type { StudentLevel };

export interface Student {
  id: string;
  name: string;
  email: string;
  currentLevel: StudentLevel;
  enrolledAt: Date;
  enrolledCourses?: number;
  completedLessons?: number;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
  duration: string;
  lessons: number;
  difficulty: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: string;
  courseId: string;
  name: string;
  description: string;
  order: number;
  requiredLevel?: StudentLevel;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  course?: {
    id: string;
    name: string;
  };
}

export interface ModuleContent {
  lessons: string[];
  exercises: string[];
  assessments: string[];
  resources: string[];
}

export interface StudentClassAccess {
  id: string;
  studentId: string;
  level: StudentLevel;
  assignedAt: Date;
  completedAt?: Date;
}
