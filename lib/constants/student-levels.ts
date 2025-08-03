export const STUDENT_LEVELS = {
  B2: "B2",
  B3: "B3",
  M1: "M1",
  M2: "M2",
} as const;

export type StudentLevel = keyof typeof STUDENT_LEVELS;

export const LEVEL_DESCRIPTIONS = {
  B2: "Beginner Level 2",
  B3: "Beginner Level 3",
  M1: "Intermediate Level 1",
  M2: "Intermediate Level 2",
} as const;

export const LEVEL_COLORS = {
  B2: "bg-green-100 text-green-800",
  B3: "bg-blue-100 text-blue-800",
  M1: "bg-purple-100 text-purple-800",
  M2: "bg-orange-100 text-orange-800",
} as const;

export const STUDENT_LEVELS_ARRAY: StudentLevel[] = ["B2", "B3", "M1", "M2"];
