import React from "react";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { Course } from "../../types/course";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";
import { Play, Lock, CheckCircle, Clock, BookOpen, Star } from "lucide-react";

interface CoursesPageProps {
  courses: Course[];
  loading: boolean;
  error: string | null;
  session: Session | null;
  fetchCourses: () => void;
  enrollInCourse: (
    courseId: string
  ) => Promise<{ success: boolean; error?: string }>;
  setCurrentPage: (page: string) => void;
}

const CoursesPage = ({
  courses,
  loading,
  error,
  session,
  fetchCourses,
  enrollInCourse,
  setCurrentPage,
}: CoursesPageProps) => {
  const router = useRouter();

  return (
    <div>
      {/* Courses Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 invisible">
              <span className="text-blue-600 hover:text-blue-800 font-medium">
                ← Back to Courses
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-4xl">📚</div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Programming Courses
              </h1>
              <p className="text-gray-600 mt-2">
                Master programming languages step by step. Complete each course
                to unlock the next one.
              </p>
              <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-3 text-sm text-gray-500">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {courses.length} Courses Available
                </span>
                <span>Beginner to Advanced</span>
                <span>Self-paced Learning</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 overflow-x-hidden">
        {loading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchCourses} />
        ) : (
          <div className="space-y-6">
            {courses.map((course, index) => {
              const isUnlocked = index === 0 || courses[index - 1]?.isCompleted;
              const progress = course.progress || 0;
              return (
                <div
                  key={course.id}
                  className={`bg-white rounded-xl shadow-md p-4 md:p-8 border-2 ${
                    isUnlocked
                      ? "border-slate-200"
                      : "border-slate-100 opacity-60"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6 flex-1">
                      <div className="text-4xl md:text-6xl self-center md:self-start">
                        {course.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-center md:justify-start space-x-3 mb-3">
                          <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                            {course.name}
                          </h2>
                          {!isUnlocked && (
                            <Lock className="text-slate-900" size={20} />
                          )}
                          {course.isCompleted && (
                            <CheckCircle className="text-green-500" size={20} />
                          )}
                        </div>
                        <p className="text-slate-600 mb-4 text-center md:text-left">
                          {course.description}
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 md:gap-6 text-sm text-slate-500 mb-4">
                          <div className="flex items-center space-x-2">
                            <Clock size={16} />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <BookOpen size={16} />
                            <span>{course.lessons} lessons</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Star size={16} />
                            <span>{course.difficulty}</span>
                          </div>
                        </div>
                        {session && progress > 0 && (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-slate-600 mb-1">
                              <span>Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      disabled={!isUnlocked || !session}
                      onClick={async () => {
                        if (!session) {
                          setCurrentPage("signin");
                          return;
                        }
                        if (!course.isEnrolled) {
                          const result = await enrollInCourse(course.id);
                          if (result.success) {
                            // Navigate to course after successful enrollment
                            router.push(`/courses/${course.id}`);
                          } else {
                            alert(`Failed to enroll: ${result.error}`);
                          }
                        } else {
                          router.push(`/courses/${course.id}`);
                        }
                      }}
                      className={`flex items-center justify-center space-x-2 px-4 md:px-6 py-3 rounded-lg font-semibold transition-colors mt-4 md:mt-0 w-full md:w-auto ${
                        isUnlocked && session
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <Play size={18} />
                      <span>
                        {!session
                          ? "Login Required"
                          : !course.isEnrolled
                          ? "Enroll"
                          : progress > 0
                          ? "Continue"
                          : "Start Course"}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
