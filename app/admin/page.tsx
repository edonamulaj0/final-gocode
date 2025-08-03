"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import GradingPage from "@/components/pages/GradingPage";
import StudentClassManagement from "@/components/admin/StudentClassManagement";
import CourseManagement from "@/components/admin/course-management/CourseManagement";
import StudentProgressMonitoring from "@/components/admin/StudentProgressMonitoring";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("courses");

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>Please sign in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
              </div>
              <div className="ml-6 flex space-x-8">
                <button
                  onClick={() => setActiveTab("courses")}
                  className={`${
                    activeTab === "courses"
                      ? "border-indigo-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  Course Management
                </button>
                <button
                  onClick={() => setActiveTab("grading")}
                  className={`${
                    activeTab === "grading"
                      ? "border-indigo-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  Grading
                </button>
                <button
                  onClick={() => setActiveTab("classes")}
                  className={`${
                    activeTab === "classes"
                      ? "border-indigo-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  Student Classes
                </button>
                <button
                  onClick={() => setActiveTab("students")}
                  className={`${
                    activeTab === "students"
                      ? "border-indigo-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  Student Progress
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                Welcome, {session.user.name}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === "courses" && <CourseManagement />}
          {activeTab === "grading" && <GradingPage />}
          {activeTab === "classes" && <StudentClassManagement />}
          {activeTab === "students" && <StudentProgressMonitoring />}
        </div>
      </main>
    </div>
  );
}