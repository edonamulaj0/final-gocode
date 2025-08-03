import React from "react";
import { Session } from "next-auth";
import { signIn } from "next-auth/react";
import { Course } from "../../types/course";
import { User, CheckCircle } from "lucide-react";

interface DashboardPageProps {
  courses: Course[];
  session: Session | null;
}

const DashboardPage = ({ courses, session }: DashboardPageProps) => {
  if (!session) {
    return (
      <div className="text-center py-20 px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
          Access Denied
        </h1>
        <p className="text-slate-600 mb-8">
          Please log in to view your dashboard.
        </p>
        <button
          onClick={() => signIn()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Log In
        </button>
      </div>
    );
  }

  const enrolledCourses = courses.filter((course) => course.isEnrolled);
  const totalProgress =
    enrolledCourses.length > 0
      ? enrolledCourses.reduce(
          (sum, course) => sum + (course.progress || 0),
          0
        ) / enrolledCourses.length
      : 0;
  const completedCourses = courses.filter(
    (course) => course.isCompleted
  ).length;

  return (
    <div>
      {/* Dashboard Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-4xl">
              <User size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Welcome back, {session.user?.name}!
              </h1>
              <p className="text-gray-600 text-lg mb-6">
                Track your learning progress and continue your programming
                journey.
              </p>
              <div className="flex flex-wrap items-center gap-3 lg:gap-6 text-sm text-gray-500">
                <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg">
                  Class {session.user?.class}
                </span>
                <span>{Math.round(totalProgress)}% Overall Progress</span>
                <span>{completedCourses} Courses Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 overflow-x-hidden">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">
              {Math.round(totalProgress)}%
            </div>
            <p className="text-slate-600 text-sm md:text-base">
              Overall Progress
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">
              {completedCourses}
            </div>
            <p className="text-slate-600 text-sm md:text-base">
              Completed Courses
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-2">
              {enrolledCourses.length}
            </div>
            <p className="text-slate-600 text-sm md:text-base">
              Enrolled Courses
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-2">
              {courses.length - enrolledCourses.length}
            </div>
            <p className="text-slate-600 text-sm md:text-base">
              Available Courses
            </p>
          </div>
        </div>

        {/* Course Progress */}
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-6">
            Course Progress
          </h3>
          <div className="space-y-6">
            {enrolledCourses.map((course) => {
              const progress = course.progress || 0;
              return (
                <div key={course.id} className="flex items-center space-x-4">
                  <div className="text-xl md:text-2xl">{course.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-slate-800 text-sm md:text-base">
                        {course.name}
                      </h4>
                      {course.isCompleted && (
                        <CheckCircle className="text-green-500" size={16} />
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-slate-200 rounded-full h-2 md:h-3">
                        <div
                          className="bg-blue-600 h-2 md:h-3 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs md:text-sm font-medium text-slate-600 w-8 md:w-12">
                        {progress}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {enrolledCourses.length === 0 && (
              <p className="text-slate-500 text-center py-8">
                No enrolled courses yet. Start by enrolling in a course!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
