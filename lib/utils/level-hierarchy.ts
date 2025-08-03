import { StudentLevel } from "@/lib/constants/student-levels";

export const LEVEL_HIERARCHY: Record<StudentLevel, number> = {
  B2: 0,
  B3: 1,
  M1: 2,
  M2: 3,
};

/**
 * Check if a student at the given level can access content requiring the target level
 */
export function canAccessLevel(
  studentLevel: StudentLevel,
  requiredLevel: StudentLevel
): boolean {
  return LEVEL_HIERARCHY[studentLevel] >= LEVEL_HIERARCHY[requiredLevel];
}

/**
 * Get all levels that a student can access (their level and below)
 */
export function getAccessibleLevels(
  studentLevel: StudentLevel
): StudentLevel[] {
  const studentLevelIndex = LEVEL_HIERARCHY[studentLevel];
  return Object.entries(LEVEL_HIERARCHY)
    .filter(([_, index]) => index <= studentLevelIndex)
    .map(([level, _]) => level as StudentLevel)
    .sort((a, b) => LEVEL_HIERARCHY[a] - LEVEL_HIERARCHY[b]);
}

/**
 * Get the next level for a student
 */
export function getNextLevel(currentLevel: StudentLevel): StudentLevel | null {
  const levels: StudentLevel[] = ["B2", "B3", "M1", "M2"];
  const currentIndex = levels.indexOf(currentLevel);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
}

/**
 * Get the previous level for a student
 */
export function getPreviousLevel(
  currentLevel: StudentLevel
): StudentLevel | null {
  const levels: StudentLevel[] = ["B2", "B3", "M1", "M2"];
  const currentIndex = levels.indexOf(currentLevel);
  return currentIndex > 0 ? levels[currentIndex - 1] : null;
}
