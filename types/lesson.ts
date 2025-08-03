export interface Lesson {
  id: string;
  title: string;
  content: string;
  type: "video" | "text" | "quiz" | "assignment";
  duration: number;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  lessons: Lesson[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  enrollmentCount: number;
}

export interface DragItem {
  id: string;
  index: number;
  type: string;
}
