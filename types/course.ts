export interface Course {
  id: string;
  name: string;
  description: string;
  icon: string;
  duration: string;
  lessons: number;
  difficulty: string;
  order: number;
  progress?: number;
  isEnrolled?: boolean;
  isCompleted?: boolean;
}
