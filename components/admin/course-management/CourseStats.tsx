"use client";

import React from "react";

interface Course {
  id: string;
  difficulty: string;
}

interface CourseStatsProps {
  courses: Course[];
}

export default function CourseStats({ courses }: CourseStatsProps) {
  const totalCourses = courses.length;
  const beginnerCourses = courses.filter(
    (c) => c.difficulty === "Beginner"
  ).length;
  const intermediateCourses = courses.filter(
    (c) => c.difficulty === "Intermediate"
  ).length;
  const advancedCourses = courses.filter(
    (c) => c.difficulty === "Advanced"
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="text-3xl mr-4">📚</div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Courses</p>
            <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="text-3xl mr-4">🎯</div>
          <div>
            <p className="text-sm font-medium text-gray-600">Beginner</p>
            <p className="text-2xl font-bold text-gray-900">
              {beginnerCourses}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="text-3xl mr-4">📈</div>
          <div>
            <p className="text-sm font-medium text-gray-600">Intermediate</p>
            <p className="text-2xl font-bold text-gray-900">
              {intermediateCourses}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="text-3xl mr-4">🚀</div>
          <div>
            <p className="text-sm font-medium text-gray-600">Advanced</p>
            <p className="text-2xl font-bold text-gray-900">
              {advancedCourses}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
