"use client";

import React, { useState } from "react";
import CourseStats from "./CourseStats";
import { useCourseManagement } from "./useCourseManagement";
import ComprehensiveCourseManager from "./ComprehensiveCourseManager";
import ManualCourseManager from "./ManualCourseManager";

export default function CourseManagement() {
  const { courses, handleDeleteCourse, openAddModal, openEditModal } =
    useCourseManagement();

  const [view, setView] = useState<"overview" | "detailed" | "manual">(
    "overview"
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">Course Management</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setView("overview")}
            className={`px-4 py-2 rounded ${
              view === "overview"
                ? "bg-gray-200 text-black"
                : "bg-white text-black border border-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setView("manual")}
            className={`px-4 py-2 rounded ${
              view === "manual"
                ? "bg-gray-200 text-black"
                : "bg-white text-black border border-gray-300"
            }`}
          >
            Manual Management
          </button>
          <button
            onClick={() => setView("detailed")}
            className={`px-4 py-2 rounded ${
              view === "detailed"
                ? "bg-gray-200 text-black"
                : "bg-white text-black border border-gray-300"
            }`}
          >
            Advanced
          </button>
        </div>
      </div>

      {view === "overview" ? (
        <>
          <CourseStats courses={courses} />
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-black">
                Quick Course Overview
              </h3>
              <button
                onClick={openAddModal}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add New Course
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div key={course.id} className="border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">{course.icon}</span>
                    <h4 className="font-medium text-black">{course.name}</h4>
                  </div>
                  <p className="text-sm text-black mb-2">
                    {course.description}
                  </p>
                  <div className="flex justify-between text-xs text-black">
                    <span>{course.difficulty}</span>
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={() => openEditModal(course)}
                      className="text-xs bg-gray-100 text-black px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-xs bg-red-100 text-black px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : view === "manual" ? (
        <ManualCourseManager />
      ) : (
        <ComprehensiveCourseManager />
      )}
    </div>
  );
}
