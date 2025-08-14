"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import GradingPage from "@/components/pages/GradingPage";
import StudentClassManagement from "@/components/admin/StudentClassManagement";
import CourseManagement from "@/components/admin/course-management/CourseManagement";
import StudentProgressMonitoring from "@/components/admin/StudentProgressMonitoring";
import {
  BookOpen,
  GraduationCap,
  Users,
  BarChart3,
  Settings,
  Shield,
  Sparkles,
} from "lucide-react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("courses");

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200/20 to-purple-200/20 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-green-200/20 to-blue-200/20 blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="glass-card p-12 text-center max-w-md relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-card mb-6">
            <Shield className="w-8 h-8 text-[#082c3a]" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-[#082c3a]">
            Access Denied
          </h1>
          <p className="text-[#082c3a]/70 text-lg">
            Please sign in to access the admin dashboard.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: "courses",
      label: "Course Management",
      icon: BookOpen,
      component: <CourseManagement />,
    },
    {
      id: "grading",
      label: "Grading",
      icon: GraduationCap,
      component: <GradingPage />,
    },
    {
      id: "classes",
      label: "Student Classes",
      icon: Users,
      component: <StudentClassManagement />,
    },
    {
      id: "students",
      label: "Student Progress",
      icon: BarChart3,
      component: <StudentProgressMonitoring />,
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200/20 to-purple-200/20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-green-200/20 to-blue-200/20 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-yellow-200/10 to-pink-200/10 blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl glass-card">
                <Sparkles className="w-6 h-6 text-[#f8f5e9]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#f8f5e9]">
                  Admin Dashboard
                </h1>
                <p className="text-[#f8f5e9]/70 text-sm">
                  MasterMore Management System
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full glass-card flex items-center justify-center">
                  <Settings className="w-5 h-5 text-[#f8f5e9]" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#f8f5e9]">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-[#f8f5e9]/70">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="glass-card mx-6 lg:mx-8 mt-6 p-2 relative z-10">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-2xl transition-all duration-300 group ${
                  activeTab === tab.id
                    ? "glass-button text-[#f8f5e9]"
                    : "hover:bg-[#082c3a]/5 text-[#082c3a]"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    activeTab === tab.id ? "text-[#f8f5e9]" : "text-[#082c3a]"
                  }`}
                />
                <span className="font-medium whitespace-nowrap">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 relative z-10">
        <div className="glass-card p-8 min-h-[600px]">
          {tabs.find((tab) => tab.id === activeTab)?.component}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="glass-card p-6 text-center">
            <p className="text-[#082c3a]/60 text-sm">
              © 2024 MasterMore. All rights reserved. | Admin Dashboard v2.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
