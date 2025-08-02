"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  ArrowLeft,
  CheckCircle,
  Lock,
  MoreHorizontal,
} from "lucide-react";

// Professional Loading Component
const LoadingSpinner = ({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <MoreHorizontal
        className={`${sizeClasses[size]} animate-pulse text-blue-600`}
      />
    </div>
  );
};

interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
  isCompleted?: boolean;
}

interface Module {
  id: string;
  name: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: string;
  duration: string;
  lessons: Lesson[]; // For backward compatibility
  modules: Module[]; // New module structure
  isEnrolled: boolean;
}

export default function CourseDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(
    null
  );

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!resolvedParams) return;

    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${resolvedParams.id}`);
        if (response.ok) {
          const courseData = await response.json();
          setCourse(courseData);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [resolvedParams, session]);

  // Set initial sidebar state based on screen size
  useEffect(() => {
    const checkScreenSize = () => {
      // Check if screen is lg (1024px) or larger - keep sidebar open on desktop
      const isDesktop = window.innerWidth >= 1024;
      setSidebarOpen(isDesktop);
    };

    // Set initial state
    checkScreenSize();

    // Listen for window resize events
    window.addEventListener("resize", checkScreenSize);

    // Cleanup event listener
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const refetchCourse = async () => {
    if (!resolvedParams) return;

    try {
      const response = await fetch(`/api/courses/${resolvedParams.id}`);
      if (response.ok) {
        const courseData = await response.json();
        setCourse(courseData);
      }
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  };

  const handleEnroll = async () => {
    if (!session || !resolvedParams) {
      router.push("/auth/signin");
      return;
    }

    setEnrolling(true);
    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId: resolvedParams.id }),
      });

      if (response.ok) {
        await refetchCourse(); // Refresh course data
        // Show success message
        alert("Successfully enrolled in the course!");
      } else {
        const errorData = await response.json();
        alert(`Failed to enroll in course: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error enrolling:", error);
      alert("Error enrolling in course. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Course Sidebar - Skeleton */}
        <div className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white shadow-lg z-40 lg:block">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-blue-400 mb-0">
                <Link href="/" className="hover:text-blue-300">
                  GoCode
                </Link>
              </h1>
            </div>
            <div className="flex items-center space-x-2 mt-8">
              <div className="w-8 h-8 bg-slate-700 rounded animate-pulse"></div>
              <div>
                <div className="w-24 h-4 bg-slate-700 rounded animate-pulse mb-1"></div>
                <div className="w-16 h-3 bg-slate-800 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 text-lg">Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  const getAllLessons = (course: Course) => {
    // Get all lessons from both direct course lessons and modules
    const directLessons = course.lessons || [];
    const moduleLessons =
      course.modules?.flatMap((module) => module.lessons) || [];
    return [...directLessons, ...moduleLessons];
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Course not found</div>
      </div>
    );
  }

  const allLessons = getAllLessons(course);
  const completedLessons = allLessons.filter(
    (lesson) => lesson.isCompleted
  ).length;
  const totalLessons = allLessons.length;
  const progressPercentage =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Course Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-slate-900 text-white shadow-lg transition-all duration-300 z-40 ${
          sidebarOpen ? "w-64" : "w-16"
        } lg:block ${sidebarOpen ? "" : "hidden lg:block"}`}
      >
        {/* Sidebar Header */}
        <div className="p-6">
          <div
            className={`flex items-center ${
              sidebarOpen ? "justify-between" : "justify-center"
            }`}
          >
            {sidebarOpen && (
              <h1 className="text-2xl font-bold text-blue-400 mb-0">
                <Link href="/" className="hover:text-blue-300">
                  GoCode
                </Link>
              </h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-800 text-white"
            >
              {sidebarOpen ? (
                <ArrowLeft className="w-5 h-5" />
              ) : (
                <BookOpen className="w-5 h-5" />
              )}
            </button>
          </div>
          {sidebarOpen && (
            <div className="flex items-center space-x-2 mt-8">
              <span className="text-xl">{course.icon}</span>
              <div>
                <h2 className="font-semibold text-white truncate text-sm">
                  {course.name}
                </h2>
                <p className="text-xs text-slate-300">Course Overview</p>
              </div>
            </div>
          )}
        </div>

        {/* Course Progress */}
        {sidebarOpen && (
          <div className="px-6 pb-4">
            <h3 className="font-semibold text-white mb-2">Course Progress</h3>
            <div className="mb-2">
              <div className="flex justify-between text-sm text-slate-300 mb-1">
                <span>
                  {completedLessons} of {totalLessons} lessons
                </span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Lessons List */}
        <div className="flex-1 overflow-y-auto">
          {sidebarOpen && (
            <div className="px-6 pb-6">
              <h3 className="font-semibold text-white mb-4">Lessons</h3>
              <div className="space-y-2">
                {course.lessons.map((lesson, index) => {
                  const isCompleted = lesson.isCompleted;
                  const isAccessible =
                    index === 0 || course.lessons[index - 1]?.isCompleted;

                  return (
                    <div key={lesson.id}>
                      {isAccessible ? (
                        <Link
                          href={`/courses/${course.id}/lessons/${lesson.id}`}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <div
                            className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                              isCompleted
                                ? "bg-green-500 text-white"
                                : "bg-slate-600 text-slate-300"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              lesson.order
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-300 truncate">
                              {lesson.title}
                            </p>
                            <p
                              className={`text-xs ${
                                isCompleted
                                  ? "text-green-400"
                                  : "text-slate-400"
                              }`}
                            >
                              {isCompleted ? "Completed" : "Not started"}
                            </p>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-600 text-slate-400">
                            <Lock className="w-3 h-3" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-400 truncate">
                              {lesson.title}
                            </p>
                            <p className="text-xs text-slate-500">Locked</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!sidebarOpen && (
            <div className="flex flex-col items-center pt-4">
              {course.lessons.map((lesson, index) => {
                const isCompleted = lesson.isCompleted;
                const isAccessible =
                  index === 0 || course.lessons[index - 1]?.isCompleted;

                return (
                  <div key={lesson.id} className="mb-2">
                    {isAccessible ? (
                      <Link
                        href={`/courses/${course.id}/lessons/${lesson.id}`}
                        className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-800 transition-colors"
                        title={lesson.title}
                      >
                        <div
                          className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                            isCompleted
                              ? "bg-green-500 text-white"
                              : "bg-slate-600 text-slate-300"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            lesson.order
                          )}
                        </div>
                      </Link>
                    ) : (
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800"
                        title={`${lesson.title} (Locked)`}
                      >
                        <Lock className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-16"
        } ml-0`}
      >
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <BookOpen className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-xl">{course.icon}</span>
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {course.name}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Course Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Link
                  href="/?page=courses"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Back to Courses
                </Link>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="text-4xl">{course.icon}</div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {course.name}
                  </h1>
                  <p className="text-gray-600 mt-2">{course.description}</p>
                  <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-3 text-sm text-gray-500">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {course.difficulty}
                    </span>
                    <span>{course.duration}</span>
                    <span>{totalLessons} lessons</span>
                  </div>
                </div>
              </div>

              {!course.isEnrolled ? (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 inline-flex items-center justify-center space-x-2"
                >
                  {enrolling && <LoadingSpinner size="sm" />}
                  <span>{enrolling ? "Enrolling..." : "Enroll Now"}</span>
                </button>
              ) : (
                <div className="text-center lg:text-right">
                  <div className="text-sm text-gray-600 mb-1">
                    Progress: {completedLessons}/{totalLessons} lessons
                  </div>
                  <div className="w-full lg:w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {Math.round(progressPercentage)}% complete
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {!course.isEnrolled ? (
            <div className="bg-white rounded-lg shadow p-6 lg:p-8 text-center">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                Enroll to Access Lessons
              </h2>
              <p className="text-gray-600 mb-6">
                Join this course to access all {totalLessons} lessons and start
                your learning journey.
              </p>
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400"
              >
                {enrolling ? "Enrolling..." : "Enroll Now"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">
                Course Content
              </h2>

              {/* Display modules if they exist, otherwise show direct lessons */}
              {course.modules && course.modules.length > 0 ? (
                <div className="space-y-8">
                  {course.modules.map((module, moduleIndex) => (
                    <div key={module.id} className="space-y-4">
                      {/* Module Header */}
                      <div className="border-b border-gray-200 pb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Module {module.order}: {module.name}
                        </h3>
                        {module.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {module.description}
                          </p>
                        )}
                      </div>

                      {/* Module Lessons */}
                      <div className="space-y-4">
                        {module.lessons.map((lesson, lessonIndex) => {
                          const prevModule =
                            moduleIndex > 0
                              ? course.modules[moduleIndex - 1]
                              : null;
                          const prevModuleCompleted = prevModule
                            ? prevModule.lessons.every((l) => l.isCompleted)
                            : true;
                          const prevLessonCompleted =
                            lessonIndex > 0
                              ? module.lessons[lessonIndex - 1].isCompleted
                              : true;

                          const canAccess =
                            (moduleIndex === 0 && lessonIndex === 0) ||
                            (lessonIndex === 0 && prevModuleCompleted) ||
                            (lessonIndex > 0 && prevLessonCompleted);

                          return (
                            <div
                              key={lesson.id}
                              className={`bg-white rounded-lg shadow p-4 lg:p-6 border-l-4 ml-4 ${
                                lesson.isCompleted
                                  ? "border-green-500"
                                  : canAccess
                                  ? "border-blue-500"
                                  : "border-gray-300"
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                                <div className="flex items-center space-x-4">
                                  <div
                                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                      lesson.isCompleted
                                        ? "bg-green-500 text-white"
                                        : canAccess
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-300 text-gray-600"
                                    }`}
                                  >
                                    {lesson.isCompleted ? "✓" : lesson.order}
                                  </div>

                                  <div>
                                    <h4
                                      className={`text-lg font-semibold ${
                                        canAccess
                                          ? "text-gray-900"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {lesson.title}
                                    </h4>
                                    <p
                                      className={`text-sm ${
                                        lesson.isCompleted
                                          ? "text-green-600"
                                          : canAccess
                                          ? "text-blue-600"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {lesson.isCompleted
                                        ? "Completed"
                                        : !canAccess
                                        ? "Locked - Complete previous lesson"
                                        : "Ready to start"}
                                    </p>
                                  </div>
                                </div>

                                {canAccess && (
                                  <Link
                                    href={`/courses/${course.id}/lessons/${lesson.id}`}
                                    className={`w-full sm:w-auto text-center px-4 py-2 rounded-lg font-medium ${
                                      lesson.isCompleted
                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                    }`}
                                  >
                                    {lesson.isCompleted
                                      ? "Review"
                                      : "Start Lesson"}
                                  </Link>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Fallback for courses without modules */
                <div className="space-y-4">
                  {course.lessons.map((lesson, index) => {
                    const isLocked =
                      index > 0 && !course.lessons[index - 1].isCompleted;
                    const canAccess =
                      index === 0 || course.lessons[index - 1].isCompleted;

                    return (
                      <div
                        key={lesson.id}
                        className={`bg-white rounded-lg shadow p-4 lg:p-6 border-l-4 ${
                          lesson.isCompleted
                            ? "border-green-500"
                            : canAccess
                            ? "border-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                lesson.isCompleted
                                  ? "bg-green-500 text-white"
                                  : canAccess
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-300 text-gray-600"
                              }`}
                            >
                              {lesson.isCompleted ? "✓" : lesson.order}
                            </div>

                            <div>
                              <h3
                                className={`text-lg font-semibold ${
                                  canAccess ? "text-gray-900" : "text-gray-500"
                                }`}
                              >
                                {lesson.title}
                              </h3>
                              <p
                                className={`text-sm ${
                                  lesson.isCompleted
                                    ? "text-green-600"
                                    : canAccess
                                    ? "text-blue-600"
                                    : "text-gray-500"
                                }`}
                              >
                                {lesson.isCompleted
                                  ? "Completed"
                                  : isLocked
                                  ? "Locked - Complete previous lesson"
                                  : "Ready to start"}
                              </p>
                            </div>
                          </div>

                          {canAccess && (
                            <Link
                              href={`/courses/${course.id}/lessons/${lesson.id}`}
                              className={`w-full sm:w-auto text-center px-4 py-2 rounded-lg font-medium ${
                                lesson.isCompleted
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              }`}
                            >
                              {lesson.isCompleted ? "Review" : "Start Lesson"}
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
