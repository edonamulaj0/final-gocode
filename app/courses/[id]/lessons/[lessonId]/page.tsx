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
  courseId: string;
  isCompleted?: boolean;
}

interface Course {
  id: string;
  name: string;
  icon: string;
  lessons: Lesson[];
}

interface LessonData {
  lesson: Lesson;
  course: Course;
  nextLesson?: { id: string; title: string };
  previousLesson?: { id: string; title: string };
  canAccess: boolean;
}

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resolvedParams, setResolvedParams] = useState<{
    id: string;
    lessonId: string;
  } | null>(null);

  // Resolve params first
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!session || !resolvedParams) {
      if (!session) {
        router.push("/auth/signin");
      }
      return;
    }

    const fetchLessonAndCourse = async () => {
      try {
        // Fetch lesson data
        const lessonResponse = await fetch(
          `/api/courses/${resolvedParams.id}/lessons/${resolvedParams.lessonId}`
        );
        if (lessonResponse.ok) {
          const lessonData = await lessonResponse.json();
          setLessonData(lessonData);
        } else if (lessonResponse.status === 403) {
          // Lesson is locked
          router.push(`/courses/${resolvedParams.id}`);
          return;
        }

        // Fetch course data for sidebar
        const courseResponse = await fetch(`/api/courses/${resolvedParams.id}`);
        if (courseResponse.ok) {
          const courseData = await courseResponse.json();
          setAllLessons(courseData.lessons || []);
        }
      } catch (error) {
        console.error("Error fetching lesson:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonAndCourse();
  }, [resolvedParams, session, router]);

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

  const markAsComplete = async () => {
    if (!lessonData?.lesson || lessonData.lesson.isCompleted || !resolvedParams)
      return;

    setCompleting(true);
    try {
      const response = await fetch(
        `/api/courses/${resolvedParams.id}/lessons/${resolvedParams.lessonId}/complete`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        // Update the current lesson state
        setLessonData((prev) =>
          prev
            ? {
                ...prev,
                lesson: { ...prev.lesson, isCompleted: true },
              }
            : null
        );

        // Refresh the sidebar lessons to show updated completion status
        const courseResponse = await fetch(`/api/courses/${resolvedParams.id}`);
        if (courseResponse.ok) {
          const courseData = await courseResponse.json();
          setAllLessons(courseData.lessons || []);
        }

        // Signal to the course page that it needs to refresh its data
        sessionStorage.setItem(`course-${resolvedParams.id}-refresh`, "true");
      }
    } catch (error) {
      console.error("Error marking lesson as complete:", error);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar Skeleton */}
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

          <div className="px-6 pb-4">
            <div className="w-32 h-4 bg-slate-700 rounded animate-pulse"></div>
          </div>

          <div className="px-6 pb-6">
            <div className="w-16 h-4 bg-slate-700 rounded animate-pulse mb-4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-full h-12 bg-slate-800 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 text-lg">Loading lesson...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Lesson not found
          </h2>
          <Link
            href={`/courses/${resolvedParams?.id || ""}`}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to course
          </Link>
        </div>
      </div>
    );
  }

  const { lesson, course, nextLesson, previousLesson } = lessonData;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
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
          {sidebarOpen && lessonData && (
            <div className="flex items-center space-x-2 mt-8">
              <span className="text-xl">{lessonData.course.icon}</span>
              <div>
                <h2 className="font-semibold text-white truncate text-sm">
                  {lessonData.course.name}
                </h2>
                <p className="text-xs text-slate-300">Course Progress</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        {sidebarOpen && (
          <div className="px-6 pb-4">
            {lessonData && (
              <Link
                href={`/courses/${lessonData.course.id}`}
                className="flex items-center space-x-2 text-slate-300 hover:text-blue-400"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Course</span>
              </Link>
            )}
          </div>
        )}

        {/* Lessons List */}
        <div className="flex-1 overflow-y-auto">
          {sidebarOpen && lessonData && (
            <div className="px-6 pb-6">
              <h3 className="font-semibold text-white mb-4">Lessons</h3>
              <div className="space-y-2">
                {allLessons.map((lessonItem, index) => {
                  const isCurrentLesson =
                    lessonItem.id === lessonData.lesson.id;
                  const isCompleted = lessonItem.isCompleted;
                  const isAccessible =
                    index === 0 || allLessons[index - 1]?.isCompleted;

                  return (
                    <div key={lessonItem.id}>
                      {isAccessible ? (
                        <Link
                          href={`/courses/${lessonData.course.id}/lessons/${lessonItem.id}`}
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                            isCurrentLesson
                              ? "bg-blue-600 border border-blue-500"
                              : "hover:bg-slate-800"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                              isCompleted
                                ? "bg-green-500 text-white"
                                : isCurrentLesson
                                ? "bg-blue-500 text-white"
                                : "bg-slate-600 text-slate-300"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              lessonItem.order
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium truncate ${
                                isCurrentLesson
                                  ? "text-white"
                                  : "text-slate-300"
                              }`}
                            >
                              {lessonItem.title}
                            </p>
                            <p
                              className={`text-xs ${
                                isCompleted
                                  ? "text-green-400"
                                  : isCurrentLesson
                                  ? "text-blue-300"
                                  : "text-slate-400"
                              }`}
                            >
                              {isCompleted
                                ? "Completed"
                                : isCurrentLesson
                                ? "Current"
                                : "Not started"}
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
                              {lessonItem.title}
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

          {!sidebarOpen && lessonData && (
            <div className="flex flex-col items-center pt-4">
              {allLessons.map((lessonItem, index) => {
                const isCurrentLesson = lessonItem.id === lessonData.lesson.id;
                const isCompleted = lessonItem.isCompleted;
                const isAccessible =
                  index === 0 || allLessons[index - 1]?.isCompleted;

                return (
                  <div key={lessonItem.id} className="mb-2">
                    {isAccessible ? (
                      <Link
                        href={`/courses/${lessonData.course.id}/lessons/${lessonItem.id}`}
                        className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                          isCurrentLesson
                            ? "bg-blue-600 border border-blue-500"
                            : "hover:bg-slate-800"
                        }`}
                        title={lessonItem.title}
                      >
                        <div
                          className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                            isCompleted
                              ? "bg-green-500 text-white"
                              : isCurrentLesson
                              ? "bg-blue-500 text-white"
                              : "bg-slate-600 text-slate-300"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            lessonItem.order
                          )}
                        </div>
                      </Link>
                    ) : (
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800"
                        title={`${lessonItem.title} (Locked)`}
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
              {lessonData && (
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{course.icon}</span>
                  <h1 className="text-lg font-semibold text-gray-900 truncate">
                    {lesson.title}
                  </h1>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            {/* Back to Course Navigation */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Link
                  href={`/courses/${course.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Back to Course
                </Link>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <h1 className="text-lg lg:text-xl font-semibold text-gray-900">
                  {lesson.title}
                </h1>
              </div>

              <div className="flex items-center space-x-3">
                {lesson.isCompleted && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    ✓ Completed
                  </span>
                )}

                {!lesson.isCompleted && (
                  <button
                    onClick={markAsComplete}
                    disabled={completing}
                    className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-green-400 inline-flex items-center justify-center space-x-2"
                  >
                    {completing && <LoadingSpinner size="sm" />}
                    <span>
                      {completing ? "Marking Complete..." : "Mark as Complete"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 lg:p-8">
              {/* Lesson Header */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl">{course.icon}</span>
                  <span className="text-sm text-gray-500 font-medium">
                    Lesson {lesson.order}
                  </span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  {lesson.title}
                </h1>
              </div>

              {/* Lesson Content */}
              <div className="prose max-w-none">
                <div
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: lesson.content.replace(/\n/g, "<br>"),
                  }}
                />
              </div>

              {/* Completion Section */}
              {!lesson.isCompleted && (
                <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Ready to continue?
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Mark this lesson as complete to unlock the next lesson and
                    track your progress.
                  </p>
                  <button
                    onClick={markAsComplete}
                    disabled={completing}
                    className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {completing
                      ? "Marking Complete..."
                      : "Mark Lesson as Complete"}
                  </button>
                </div>
              )}

              {lesson.isCompleted && (
                <div className="mt-12 p-6 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    🎉 Lesson Complete!
                  </h3>
                  <p className="text-green-700 mb-4">
                    Great job! You&apos;ve successfully completed this lesson.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              {previousLesson ? (
                <Link
                  href={`/courses/${course.id}/lessons/${previousLesson.id}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 w-full sm:w-auto text-center"
                >
                  ← Previous: {previousLesson.title}
                </Link>
              ) : (
                <div></div>
              )}
            </div>

            <div>
              {nextLesson && lesson.isCompleted ? (
                <Link
                  href={`/courses/${course.id}/lessons/${nextLesson.id}`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto text-center"
                >
                  Next: {nextLesson.title} →
                </Link>
              ) : nextLesson && !lesson.isCompleted ? (
                <button
                  disabled
                  className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed w-full sm:w-auto text-center"
                >
                  Complete this lesson to continue →
                </button>
              ) : (
                <Link
                  href={`/courses/${course.id}`}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full sm:w-auto text-center"
                >
                  Back to Course →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
