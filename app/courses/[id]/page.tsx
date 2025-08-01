"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, BookOpen, ArrowLeft, CheckCircle, Lock } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
  isCompleted?: boolean;
}

interface Course {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: string;
  duration: string;
  lessons: Lesson[];
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
      } else {
        alert("Failed to enroll in course");
      }
    } catch (error) {
      console.error("Error enrolling:", error);
      alert("Error enrolling in course");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Course not found</div>
      </div>
    );
  }

  const completedLessons = course.lessons.filter(
    (lesson) => lesson.isCompleted
  ).length;
  const totalLessons = course.lessons.length;
  const progressPercentage =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Course Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-slate-900 text-white shadow-lg border-r transition-all duration-300 z-40 ${
          sidebarOpen ? "w-80" : "w-16"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{course.icon}</span>
                <div>
                  <h2 className="font-semibold text-white truncate">
                    {course.name}
                  </h2>
                  <p className="text-sm text-slate-300">Course Overview</p>
                </div>
              </div>
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
        </div>

        {/* Navigation Links */}
        {sidebarOpen && (
          <div className="p-4 border-b border-slate-700">
            <Link
              href="/"
              className="flex items-center space-x-2 text-slate-300 hover:text-blue-400 mb-2"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
          </div>
        )}

        {/* Course Progress */}
        {sidebarOpen && (
          <div className="p-4 border-b border-slate-700">
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
            <div className="p-4">
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
            <div className="p-2">
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
          sidebarOpen ? "ml-80" : "ml-16"
        }`}
      >
        {/* Course Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-blue-600 hover:text-blue-800">
                  ← Back to Courses
                </Link>
              </div>
            </div>

            <div className="mt-4 flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{course.icon}</div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {course.name}
                  </h1>
                  <p className="text-gray-600 mt-2">{course.description}</p>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
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
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {enrolling ? "Enrolling..." : "Enroll Now"}
                </button>
              ) : (
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">
                    Progress: {completedLessons}/{totalLessons} lessons
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
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
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Enroll to Access Lessons
              </h2>
              <p className="text-gray-600 mb-6">
                Join this course to access all {totalLessons} lessons and start
                your learning journey.
              </p>
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400"
              >
                {enrolling ? "Enrolling..." : "Enroll Now"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Course Lessons
              </h2>

              {course.lessons.map((lesson, index) => {
                const isLocked =
                  index > 0 && !course.lessons[index - 1].isCompleted;
                const canAccess =
                  index === 0 || course.lessons[index - 1].isCompleted;

                return (
                  <div
                    key={lesson.id}
                    className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                      lesson.isCompleted
                        ? "border-green-500"
                        : canAccess
                        ? "border-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
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
                          className={`px-4 py-2 rounded-lg font-medium ${
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
      </div>
    </div>
  );
}
