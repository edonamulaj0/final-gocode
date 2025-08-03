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
  modules?: Module[];
  projects?: Project[];
  finalExams?: FinalExam[];
}

export interface Module {
  id: string;
  name: string;
  description?: string;
  order: number;
  courseId: string;
  isPublished: boolean;
  lessons: Lesson[];
  practiceQuestions: PracticeQuestion[];
  moduleExams: ModuleExam[];
  isCompleted?: boolean;
  canAccess?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
  moduleId?: string;
  isPublished: boolean;
  isCompleted?: boolean;
  canAccess?: boolean;
}

export interface PracticeQuestion {
  id: string;
  title: string;
  question: string;
  type: "multiple_choice" | "true_false" | "coding";
  moduleId: string;
  order: number;
  points: number;
  options?: QuestionOption[];
  userSubmission?: PracticeQuestionSubmission;
  isCompleted?: boolean;
  canAccess?: boolean;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface PracticeQuestionSubmission {
  id: string;
  userId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  points: number;
  submittedAt: Date;
}

export interface ModuleExam {
  id: string;
  title: string;
  description?: string;
  moduleId: string;
  passingScore: number;
  timeLimit?: number;
  isPublished: boolean;
  questions: ExamQuestion[];
  userSubmission?: ModuleExamSubmission;
  isCompleted?: boolean;
  canAccess?: boolean;
}

export interface ExamQuestion {
  id: string;
  question: string;
  type: "multiple_choice" | "true_false" | "coding" | "essay";
  points: number;
  order: number;
  options?: ExamQuestionOption[];
}

export interface ExamQuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface ModuleExamSubmission {
  id: string;
  userId: string;
  examId: string;
  score: number;
  totalPoints: number;
  passed: boolean;
  submittedAt: Date;
  gradedAt?: Date;
  gradedBy?: string;
  feedback?: string;
  answers: ExamAnswer[];
}

export interface ExamAnswer {
  id: string;
  submissionId: string;
  questionId: string;
  answer: string;
  points: number;
  feedback?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  requirements: string;
  courseId: string;
  order: number;
  points: number;
  dueDate?: Date;
  isPublished: boolean;
  userSubmission?: ProjectSubmission;
  isCompleted?: boolean;
  canAccess?: boolean;
}

export interface ProjectSubmission {
  id: string;
  userId: string;
  projectId: string;
  title: string;
  description?: string;
  githubUrl?: string;
  deployUrl?: string;
  submittedAt: Date;
  gradedAt?: Date;
  gradedBy?: string;
  score?: number;
  feedback?: string;
  status: "submitted" | "graded" | "revision_needed";
}

export interface FinalExam {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  passingScore: number;
  timeLimit?: number;
  isPublished: boolean;
  questions: FinalExamQuestion[];
  userSubmission?: FinalExamSubmission;
  isCompleted?: boolean;
  canAccess?: boolean;
}

export interface FinalExamQuestion {
  id: string;
  question: string;
  type: "multiple_choice" | "true_false" | "coding" | "essay";
  points: number;
  order: number;
  options?: FinalExamQuestionOption[];
}

export interface FinalExamQuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface FinalExamSubmission {
  id: string;
  userId: string;
  examId: string;
  score: number;
  totalPoints: number;
  passed: boolean;
  submittedAt: Date;
  gradedAt?: Date;
  gradedBy?: string;
  feedback?: string;
  answers: FinalExamAnswer[];
}

export interface FinalExamAnswer {
  id: string;
  submissionId: string;
  questionId: string;
  answer: string;
  points: number;
  feedback?: string;
}

export interface Grade {
  id: string;
  userId: string;
  courseId?: string;
  moduleId?: string;
  itemType:
    | "lesson"
    | "practice_question"
    | "module_exam"
    | "project"
    | "final_exam";
  itemId: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  gradedAt: Date;
  gradedBy?: string;
  feedback?: string;
}

export interface CourseProgress {
  course: Course;
  overallProgress: number;
  moduleProgress: {
    moduleId: string;
    name: string;
    completed: boolean;
    lessonsCompleted: number;
    totalLessons: number;
    practiceQuestionsCompleted: number;
    totalPracticeQuestions: number;
    examPassed: boolean;
    canAccess: boolean;
  }[];
  projectsCompleted: number;
  totalProjects: number;
  finalExamPassed: boolean;
  canAccessFinalExam: boolean;
  averageGrade: number;
}
