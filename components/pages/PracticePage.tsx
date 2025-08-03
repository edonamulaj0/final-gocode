import React, { useState } from "react";
import { Session } from "next-auth";
import { Course } from "../../types/course";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";
import {
  Play,
  Lock,
  CheckCircle,
  Clock,
  BookOpen,
  Star,
  UserPlus,
} from "lucide-react";

interface PracticePageProps {
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

const PracticePage = ({
  courses,
  loading,
  error,
  session,
  fetchCourses,
  enrollInCourse,
  setCurrentPage,
}: PracticePageProps) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const practiceProblems = {
    easy: [
      "Basic Calculator",
      "String Manipulation",
      "List Operations",
      "Simple Loops",
    ],
    medium: [
      "File I/O Operations",
      "Dictionary Management",
      "Class Implementation",
    ],
    hard: ["Advanced OOP", "Decorators & Generators", "Threading"],
  };

  if (selectedCourse) {
    return (
      <div>
        {/* Practice Problems Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Back to Practice
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-4xl">{selectedCourse.icon}</div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {selectedCourse.name} Practice
                </h1>
                <p className="text-gray-600 mt-2">
                  Strengthen your {selectedCourse.name} skills with hands-on
                  coding challenges.
                </p>
                <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-3 text-sm text-gray-500">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Practice Mode
                  </span>
                  <span>Easy to Hard</span>
                  <span>Interactive Challenges</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Practice Problems Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 overflow-x-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["easy", "medium", "hard"].map((difficulty) => (
              <div
                key={difficulty}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className={`text-xl font-bold capitalize ${
                      difficulty === "easy"
                        ? "text-blue-600"
                        : difficulty === "medium"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {difficulty}
                  </h3>
                </div>
                <div className="space-y-3">
                  {practiceProblems[
                    difficulty as keyof typeof practiceProblems
                  ].map((problem, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <span className="text-slate-700">{problem}</span>
                      <button className="text-blue-600 hover:text-blue-700">
                        <Play size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Practice Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 invisible">
              <span className="text-blue-600 hover:text-blue-800 font-medium">
                ← Back to Practice
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-4xl">🚀</div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Practice Problems
              </h1>
              <p className="text-gray-600 mt-2">
                Sharpen your skills with hands-on coding challenges.
              </p>
              <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-3 text-sm text-gray-500">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Interactive Challenges
                </span>
                <span>Multiple Difficulty Levels</span>
                <span>Real-world Problems</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Practice Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 overflow-x-hidden">
        {loading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchCourses} />
        ) : (
          <div className="space-y-6">
            {courses.map((course, index) => {
              const isUnlocked = course.isEnrolled || index === 0;
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
                        {session && course.isEnrolled && (
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
                    <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0 w-full md:w-auto">
                      {!course.isEnrolled && session ? (
                        <button
                          onClick={async () => {
                            const result = await enrollInCourse(course.id);
                            if (!result.success) {
                              alert(`Failed to enroll: ${result.error}`);
                            }
                          }}
                          className="flex items-center justify-center space-x-2 px-4 md:px-6 py-3 rounded-lg font-semibold transition-colors bg-green-600 text-white hover:bg-green-700"
                        >
                          <UserPlus size={18} />
                          <span>Enroll in Course</span>
                        </button>
                      ) : null}
                      <button
                        disabled={!isUnlocked}
                        onClick={async () => {
                          if (!session) {
                            // Navigate to sign-in page instead of showing alert
                            setCurrentPage("signin");
                            return;
                          }
                          if (!course.isEnrolled) {
                            // Enroll the user and then open practice
                            const result = await enrollInCourse(course.id);
                            if (result.success) {
                              // After successful enrollment, the course data will be refreshed
                              // and they can access practice problems
                              setSelectedCourse(course);
                            } else {
                              alert(`Failed to enroll: ${result.error}`);
                            }
                            return;
                          }
                          setSelectedCourse(course);
                        }}
                        className={`flex items-center justify-center space-x-2 px-4 md:px-6 py-3 rounded-lg font-semibold transition-colors ${
                          isUnlocked && session
                            ? course.isEnrolled
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-green-600 text-white hover:bg-green-700"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        <Play size={18} />
                        <span>
                          {!session
                            ? "Login to Practice"
                            : !course.isEnrolled
                            ? "Enroll & Practice"
                            : "Practice Problems"}
                        </span>
                      </button>
                    </div>
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

export default PracticePage;
