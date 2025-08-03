import React from "react";
import { Course } from "../../types/course";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";
import {
  Target,
  Code,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Clock,
  BookOpen,
} from "lucide-react";

interface HomePageProps {
  courses: Course[];
  loading: boolean;
  error: string | null;
  changePage: (page: string) => void;
  fetchCourses: () => void;
}

const HomePage = ({
  courses,
  loading,
  error,
  changePage,
  fetchCourses,
}: HomePageProps) => (
  <div className="space-y-8">
    {/* Home Header */}
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Master Programming with{" "}
              <span className="text-blue-600">GoCode</span>
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              Progressive learning platform designed for students. Unlock
              courses step by step, practice with real problems, and track your
              journey to becoming a skilled developer.
            </p>
            <div className="flex flex-wrap items-center gap-3 lg:gap-6 mb-6 text-sm text-gray-500">
              <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg">
                Progressive Learning
              </span>
              <span>Student-Focused</span>
              <span>Interactive Platform</span>
            </div>
            <div>
              <button
                onClick={() => changePage("courses")}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center space-x-3"
              >
                <span>Start Learning</span>
                <ArrowRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* About Section */}
    <section className="mx-4 md:mx-8 overflow-x-hidden">
      <div className="bg-slate-50 rounded-2xl p-6 md:p-12 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 text-center">
          Why Choose GoCode?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="text-blue-600" size={32} />
            </div>
            <h3 className="text-xl text-slate-600 font-semibold mb-3">
              Progressive Learning
            </h3>
            <p className="text-slate-600">
              Unlock courses sequentially to build strong foundations before
              advancing.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Code className="text-blue-600" size={32} />
            </div>
            <h3 className="text-xl text-slate-600  font-semibold mb-3">
              Hands-on Practice
            </h3>
            <p className="text-slate-600">
              Reinforce learning with practical coding challenges and projects.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="text-blue-600" size={32} />
            </div>
            <h3 className="text-xl text-slate-600 font-semibold mb-3">
              Track Progress
            </h3>
            <p className="text-slate-600">
              Monitor your learning journey with detailed progress analytics.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Courses Preview */}
    <section className="px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 text-center">
          Our Courses
        </h2>
        {loading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchCourses} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-md p-6 border border-slate-200"
              >
                <div className="text-4xl mb-4">{course.icon}</div>
                <h3 className="text-xl text-slate-600 font-semibold mb-2">
                  {course.name}
                </h3>
                <p className="text-slate-600 text-sm mb-4">
                  {course.description.substring(0, 80)}...
                </p>
                <div className="space-y-2 text-sm text-slate-500">
                  <div className="flex items-center space-x-2">
                    <Clock size={14} />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen size={14} />
                    <span>{course.lessons} lessons</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>

    {/* Pricing */}
    <section className="mx-4 md:mx-8 overflow-x-hidden mb-16">
      <div className="bg-slate-800 text-white rounded-2xl p-6 md:p-12 text-center max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Simple, Student-Friendly Pricing
        </h2>
        <p className="text-slate-300 mb-8">
          Full access to all courses and features
        </p>
        <div className="bg-slate-700 rounded-xl p-6 md:p-8 max-w-md mx-auto">
          <div className="text-3xl md:text-4xl font-bold mb-2">
            $29<span className="text-lg">/month</span>
          </div>
          <p className="text-slate-300 mb-6">Per student</p>
          <ul className="space-y-3 text-left mb-8">
            <li className="flex items-center space-x-2">
              <CheckCircle size={16} className="text-green-400" />
              <span>Access to all courses</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle size={16} className="text-green-400" />
              <span>Unlimited practice problems</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle size={16} className="text-green-400" />
              <span>Progress tracking</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle size={16} className="text-green-400" />
              <span>Student dashboard</span>
            </li>
          </ul>
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </section>
  </div>
);

export default HomePage;
