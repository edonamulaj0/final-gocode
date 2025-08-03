"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { StudentLevel, Student } from "@/types/student";

interface StudentProgress {
  studentId: string;
  student: Student;
  courseProgress: CourseProgress[];
  overallCompletion: number;
  currentStreak: number;
  totalTimeSpent: number;
}

interface CourseProgress {
  courseId: string;
  courseName: string;
  completedModules: number;
  totalAccessibleModules: number;
  completionPercentage: number;
  lastAccessed: Date;
  grades: ModuleGrade[];
}

interface ModuleGrade {
  moduleId: string;
  moduleName: string;
  grade: number;
  maxGrade: number;
  completedAt: Date;
}

interface LevelStats {
  level: StudentLevel;
  studentCount: number;
  averageCompletion: number;
  topPerformers: Student[];
}

// Add interfaces for API response types
interface ApiStudentProgress {
  studentId: string;
  student: {
    id: string;
    name: string;
    email: string;
    currentLevel: StudentLevel;
    enrolledAt: string; // API returns ISO string
  };
  courseProgress: ApiCourseProgress[];
  overallCompletion: number;
  currentStreak: number;
  totalTimeSpent: number;
}

interface ApiCourseProgress {
  courseId: string;
  courseName: string;
  completedModules: number;
  totalAccessibleModules: number;
  completionPercentage: number;
  lastAccessed: string; // API returns ISO string
  grades: ApiModuleGrade[];
}

interface ApiModuleGrade {
  moduleId: string;
  moduleName: string;
  grade: number;
  maxGrade: number;
  completedAt: string; // API returns ISO string
}

export default function StudentProgressMonitoring() {
  const [progressData, setProgressData] = useState<StudentProgress[]>([]);
  const [levelStats, setLevelStats] = useState<LevelStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<StudentLevel | "ALL">(
    "ALL"
  );
  const [selectedStudent, setSelectedStudent] =
    useState<StudentProgress | null>(null);
  const [timeFilter, setTimeFilter] = useState<"week" | "month" | "all">(
    "month"
  );

  // Memoize levels array to prevent unnecessary re-renders
  const levels = useMemo<StudentLevel[]>(() => ["B2", "B3", "M1", "M2"], []);

  const fetchProgressData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        level: selectedLevel === "ALL" ? "" : selectedLevel,
        timeFilter,
      });

      const response = await fetch(`/api/admin/student-progress?${params}`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch progress data: ${response.statusText}`
        );
      }

      const data: ApiStudentProgress[] = await response.json();

      // Transform the data to ensure Date objects are properly created
      const transformedData: StudentProgress[] = data.map(
        (item: ApiStudentProgress) => ({
          ...item,
          student: {
            ...item.student,
            enrolledAt: new Date(item.student.enrolledAt),
          },
          courseProgress: item.courseProgress.map(
            (course: ApiCourseProgress) => ({
              ...course,
              lastAccessed: new Date(course.lastAccessed),
              grades: course.grades.map((grade: ApiModuleGrade) => ({
                ...grade,
                completedAt: new Date(grade.completedAt),
              })),
            })
          ),
        })
      );

      setProgressData(transformedData);
    } catch (err) {
      console.error("Error fetching progress data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [selectedLevel, timeFilter]);

  const calculateLevelStats = useCallback(() => {
    const stats: LevelStats[] = levels.map((level) => {
      const levelStudents = progressData.filter(
        (p) => p.student.currentLevel === level
      );
      const averageCompletion =
        levelStudents.length > 0
          ? levelStudents.reduce((sum, p) => sum + p.overallCompletion, 0) /
            levelStudents.length
          : 0;
      const topPerformers = levelStudents
        .sort((a, b) => b.overallCompletion - a.overallCompletion)
        .slice(0, 3)
        .map((p) => p.student);

      return {
        level,
        studentCount: levelStudents.length,
        averageCompletion,
        topPerformers,
      };
    });
    setLevelStats(stats);
  }, [progressData, levels]);

  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  useEffect(() => {
    calculateLevelStats();
  }, [calculateLevelStats]);

  const getFilteredProgress = useCallback(() => {
    if (selectedLevel === "ALL") return progressData;
    return progressData.filter((p) => p.student.currentLevel === selectedLevel);
  }, [progressData, selectedLevel]);

  const getLevelColor = useCallback((level: StudentLevel): string => {
    const colors: Record<StudentLevel, string> = {
      B2: "bg-green-100 text-green-800",
      B3: "bg-blue-100 text-blue-800",
      M1: "bg-purple-100 text-purple-800",
      M2: "bg-orange-100 text-orange-800",
    };
    return colors[level];
  }, []);

  const getProgressColor = useCallback((percentage: number): string => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  }, []);

  // ...existing code... (rest of the component remains the same)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error Loading Data
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => fetchProgressData()}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ...rest of your existing JSX... */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Student Progress Monitoring</h3>
        <div className="flex space-x-4">
          <select
            value={selectedLevel}
            onChange={(e) =>
              setSelectedLevel(e.target.value as StudentLevel | "ALL")
            }
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="ALL">All Levels</option>
            {levels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <select
            value={timeFilter}
            onChange={(e) =>
              setTimeFilter(e.target.value as "week" | "month" | "all")
            }
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Level Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {levelStats.map((stat) => (
          <div key={stat.level} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium">{stat.level} Students</h4>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${getLevelColor(
                  stat.level
                )}`}
              >
                {stat.studentCount}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Avg. Completion:</span>
                <span className="font-medium">
                  {stat.averageCompletion.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getProgressColor(
                    stat.averageCompletion
                  )}`}
                  style={{ width: `${stat.averageCompletion}%` }}
                ></div>
              </div>
              {stat.topPerformers.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-1">Top Performers:</p>
                  {stat.topPerformers.map((student) => (
                    <div key={student.id} className="text-xs text-gray-800">
                      {student.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Student Progress Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-medium">Individual Student Progress</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Overall Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Current Streak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Time Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredProgress().map((progress) => (
                <tr key={progress.studentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {progress.student.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {progress.student.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(
                        progress.student.currentLevel
                      )}`}
                    >
                      {progress.student.currentLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(
                            progress.overallCompletion
                          )}`}
                          style={{ width: `${progress.overallCompletion}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {progress.overallCompletion}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {progress.currentStreak} days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {progress.totalTimeSpent}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedStudent(progress)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                Progress Details: {selectedStudent.student.name}
              </h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Student Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-600">Current Level</div>
                  <div
                    className={`inline-block px-2 py-1 text-sm font-semibold rounded-full mt-1 ${getLevelColor(
                      selectedStudent.student.currentLevel
                    )}`}
                  >
                    {selectedStudent.student.currentLevel}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-600">Overall Progress</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {selectedStudent.overallCompletion}%
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-600">Current Streak</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {selectedStudent.currentStreak} days
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-600">Time Spent</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {selectedStudent.totalTimeSpent}h
                  </div>
                </div>
              </div>

              {/* Course Progress */}
              <div>
                <h4 className="text-md font-medium mb-3">Course Progress</h4>
                <div className="space-y-4">
                  {selectedStudent.courseProgress.map((course) => (
                    <div
                      key={course.courseId}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="font-medium">{course.courseName}</h5>
                        <span className="text-sm text-gray-600">
                          {course.completedModules}/
                          {course.totalAccessibleModules} modules
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(
                            course.completionPercentage
                          )}`}
                          style={{ width: `${course.completionPercentage}%` }}
                        ></div>
                      </div>

                      {/* Grades */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {course.grades.map((grade) => (
                          <div
                            key={grade.moduleId}
                            className="bg-gray-50 p-2 rounded text-sm"
                          >
                            <div className="font-medium">
                              {grade.moduleName}
                            </div>
                            <div className="text-gray-600">
                              Grade: {grade.grade}/{grade.maxGrade} (
                              {((grade.grade / grade.maxGrade) * 100).toFixed(
                                1
                              )}
                              %)
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(grade.completedAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
