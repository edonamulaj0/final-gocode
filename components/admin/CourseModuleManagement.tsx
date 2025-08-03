"use client";

import { useState, useEffect } from "react";
import { StudentLevel } from "@/types/student";

// Define interfaces that match your actual database schema
interface Course {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
  duration: string;
  lessons: string;
  difficulty: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Module {
  id: string;
  courseId: string;
  name: string;
  description: string;
  order: number;
  requiredLevel?: StudentLevel;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  course?: {
    id: string;
    name: string;
  };
}

interface NewModuleForm {
  name: string;
  description: string;
  courseId: string;
  requiredLevel: StudentLevel;
  order: number;
}

interface NewCourseForm {
  name: string;
  description: string;
  icon: string;
  duration: string;
  difficulty: string;
}

export default function CourseModuleManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [showAddModule, setShowAddModule] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourse, setNewCourse] = useState<NewCourseForm>({
    name: "",
    description: "",
    icon: "📚",
    duration: "4 weeks",
    difficulty: "Beginner",
  });
  const [newModule, setNewModule] = useState<NewModuleForm>({
    name: "",
    description: "",
    courseId: "",
    requiredLevel: "B2",
    order: 1,
  });
  const [loading, setLoading] = useState(true);

  const levels: StudentLevel[] = ["B2", "B3", "M1", "M2"];

  useEffect(() => {
    fetchCourses();
    fetchModules();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/admin/courses");
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch("/api/admin/modules");
      if (response.ok) {
        const data = await response.json();
        setModules(data);
      }
    } catch (error) {
      console.error("Failed to fetch modules:", error);
    }
  };

  const getModulesByLevel = (courseId: string, level: StudentLevel) => {
    const courseModules = modules.filter((m) => m.courseId === courseId);
    const levelHierarchy: Record<StudentLevel, number> = {
      B2: 0,
      B3: 1,
      M1: 2,
      M2: 3,
    };
    const currentLevelIndex = levelHierarchy[level];

    return courseModules
      .filter((courseModule) => {
        // If module doesn't have requiredLevel, show it for all levels
        if (!courseModule.requiredLevel) return true;

        const moduleLevel = levelHierarchy[courseModule.requiredLevel];
        return moduleLevel <= currentLevelIndex;
      })
      .sort((a, b) => a.order - b.order);
  };

  const handleAddCourse = async () => {
    try {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourse),
      });

      if (response.ok) {
        const course = await response.json();
        setCourses((prev) => [...prev, course]);
        setNewCourse({
          name: "",
          description: "",
          icon: "📚",
          duration: "4 weeks",
          difficulty: "Beginner",
        });
        setShowAddCourse(false);
      }
    } catch (error) {
      console.error("Failed to add course:", error);
    }
  };

  const handleAddModule = async () => {
    try {
      const response = await fetch("/api/admin/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newModule),
      });

      if (response.ok) {
        const moduleData = await response.json();
        setModules((prev) => [...prev, moduleData]);
        setNewModule({
          name: "",
          description: "",
          courseId: "",
          requiredLevel: "B2",
          order: 1,
        });
        setShowAddModule(false);
      }
    } catch (error) {
      console.error("Failed to add module:", error);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module?")) return;

    try {
      const response = await fetch(`/api/admin/modules/${moduleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setModules((prev) => prev.filter((m) => m.id !== moduleId));
      }
    } catch (error) {
      console.error("Failed to delete module:", error);
    }
  };

  const getLevelColor = (level: StudentLevel): string => {
    const colors: Record<StudentLevel, string> = {
      B2: "bg-green-100 text-green-800",
      B3: "bg-blue-100 text-blue-800",
      M1: "bg-purple-100 text-purple-800",
      M2: "bg-orange-100 text-orange-800",
    };
    return colors[level];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Course & Module Management</h3>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddCourse(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Add Course
          </button>
          <button
            onClick={() => setShowAddModule(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Add Module
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📚</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📖</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Modules</p>
              <p className="text-2xl font-bold text-gray-900">
                {modules.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🎯</div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Level-Restricted Modules
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {modules.filter((m) => m.requiredLevel).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Selection */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Course to Manage Modules
        </label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Select a course...</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.icon} {course.name} ({course.difficulty} -{" "}
              {course.duration})
            </option>
          ))}
        </select>
      </div>

      {/* Module Access Matrix by Level */}
      {selectedCourse && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-medium">
              Module Access by Student Level:{" "}
              {courses.find((c) => c.id === selectedCourse)?.name}
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              Students can access modules at their level and below
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 p-6">
            {levels.map((level) => (
              <div key={level} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900">
                    {level} Students
                  </h5>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getLevelColor(
                      level
                    )}`}
                  >
                    {getModulesByLevel(selectedCourse, level).length} accessible
                  </span>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {getModulesByLevel(selectedCourse, level).length === 0 ? (
                    <div className="text-sm text-gray-500 italic">
                      No modules accessible
                    </div>
                  ) : (
                    getModulesByLevel(selectedCourse, level).map(
                      (courseModule) => (
                        <div
                          key={courseModule.id}
                          className={`p-3 rounded border text-sm ${
                            courseModule.requiredLevel === level
                              ? "bg-blue-50 border-blue-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium">
                                {courseModule.name}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                Order: {courseModule.order}
                                {courseModule.requiredLevel &&
                                  ` | Required: ${courseModule.requiredLevel}`}
                                {!courseModule.requiredLevel &&
                                  " | No level restriction"}
                              </div>
                              {courseModule.description && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {courseModule.description}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() =>
                                handleDeleteModule(courseModule.id)
                              }
                              className="ml-2 text-red-600 hover:text-red-800 text-xs transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Courses Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-medium">All Courses</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Modules
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{course.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {course.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {course.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.difficulty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {modules.filter((m) => m.courseId === course.id).length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.order}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Modules Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-medium">All Modules</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Module Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Required Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {modules.map((courseModule) => (
                <tr key={courseModule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {courseModule.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {courseModule.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {courses.find((c) => c.id === courseModule.courseId)?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {courseModule.requiredLevel ? (
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(
                          courseModule.requiredLevel
                        )}`}
                      >
                        {courseModule.requiredLevel}
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        No restriction
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {courseModule.order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        courseModule.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {courseModule.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteModule(courseModule.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Course Modal */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Add New Course</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Course Name
                </label>
                <input
                  type="text"
                  value={newCourse.name}
                  onChange={(e) =>
                    setNewCourse((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="e.g., JavaScript Fundamentals"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) =>
                    setNewCourse((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Brief description of the course..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Icon
                  </label>
                  <input
                    type="text"
                    value={newCourse.icon}
                    onChange={(e) =>
                      setNewCourse((prev) => ({
                        ...prev,
                        icon: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="📚"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={newCourse.duration}
                    onChange={(e) =>
                      setNewCourse((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="4 weeks"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Difficulty
                </label>
                <select
                  value={newCourse.difficulty}
                  onChange={(e) =>
                    setNewCourse((prev) => ({
                      ...prev,
                      difficulty: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAddCourse(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCourse}
                  disabled={!newCourse.name}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Module Modal */}
      {showAddModule && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Add New Module</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Course
                </label>
                <select
                  value={newModule.courseId}
                  onChange={(e) =>
                    setNewModule((prev) => ({
                      ...prev,
                      courseId: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.icon} {course.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Module Name
                </label>
                <input
                  type="text"
                  value={newModule.name}
                  onChange={(e) =>
                    setNewModule((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="e.g., Variables and Data Types"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={newModule.description}
                  onChange={(e) =>
                    setNewModule((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={3}
                  placeholder="What will students learn in this module?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Required Level
                  </label>
                  <select
                    value={newModule.requiredLevel}
                    onChange={(e) =>
                      setNewModule((prev) => ({
                        ...prev,
                        requiredLevel: e.target.value as StudentLevel,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {levels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newModule.order}
                    onChange={(e) =>
                      setNewModule((prev) => ({
                        ...prev,
                        order: parseInt(e.target.value) || 1,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Students at {newModule.requiredLevel}{" "}
                  level and above will be able to access this module.
                </p>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAddModule(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddModule}
                  disabled={!newModule.name || !newModule.courseId}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Module
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
