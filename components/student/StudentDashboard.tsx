"use client";

import React from "react";

export default function StudentDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Course Progress Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">My Progress</h2>
          <p className="text-gray-600">Track your learning journey</p>
        </div>

        {/* Available Courses Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Available Courses</h2>
          <p className="text-gray-600">Discover new learning opportunities</p>
        </div>

        {/* Achievements Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Achievements</h2>
          <p className="text-gray-600">Your learning milestones</p>
        </div>
      </div>
    </div>
  );
}
