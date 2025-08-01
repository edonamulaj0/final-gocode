"use client";

import { useState } from "react";

export default function AdminCourses() {
  const [courseData, setCourseData] = useState({
    name: "",
    description: "",
    icon: "",
    duration: "",
    lessons: 0,
    difficulty: "Beginner",
    order: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        alert("Course created successfully!");
        setCourseData({
          name: "",
          description: "",
          icon: "",
          duration: "",
          lessons: 0,
          difficulty: "Beginner",
          order: 1,
        });
      } else {
        alert("Failed to create course");
      }
    } catch (error) {
      console.error("Error creating course:", error);
      alert("Error creating course");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Add New Course
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow rounded-lg p-6 space-y-6"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Course Name
            </label>
            <input
              type="text"
              id="name"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={courseData.name}
              onChange={(e) =>
                setCourseData({ ...courseData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              required
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={courseData.description}
              onChange={(e) =>
                setCourseData({ ...courseData, description: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor="icon"
              className="block text-sm font-medium text-gray-700"
            >
              Icon (emoji)
            </label>
            <input
              type="text"
              id="icon"
              placeholder="🐍"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={courseData.icon}
              onChange={(e) =>
                setCourseData({ ...courseData, icon: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700"
              >
                Duration
              </label>
              <input
                type="text"
                id="duration"
                placeholder="8 weeks"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={courseData.duration}
                onChange={(e) =>
                  setCourseData({ ...courseData, duration: e.target.value })
                }
              />
            </div>

            <div>
              <label
                htmlFor="lessons"
                className="block text-sm font-medium text-gray-700"
              >
                Number of Lessons
              </label>
              <input
                type="number"
                id="lessons"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={courseData.lessons}
                onChange={(e) =>
                  setCourseData({
                    ...courseData,
                    lessons: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <label
                htmlFor="difficulty"
                className="block text-sm font-medium text-gray-700"
              >
                Difficulty
              </label>
              <select
                id="difficulty"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={courseData.difficulty}
                onChange={(e) =>
                  setCourseData({ ...courseData, difficulty: e.target.value })
                }
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="order"
              className="block text-sm font-medium text-gray-700"
            >
              Course Order
            </label>
            <input
              type="number"
              id="order"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={courseData.order}
              onChange={(e) =>
                setCourseData({
                  ...courseData,
                  order: parseInt(e.target.value),
                })
              }
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Course
          </button>
        </form>
      </div>
    </div>
  );
}
