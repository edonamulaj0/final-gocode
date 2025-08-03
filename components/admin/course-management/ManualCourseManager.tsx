"use client";

import React, { useState, useEffect } from "react";

interface Course {
  id: string;
  name: string;
  description: string;
  icon: string;
  duration: string;
  difficulty: string;
}

interface Module {
  id: string;
  name: string;
  description: string;
  courseId: string;
  order: number;
}

interface Lesson {
  id: string;
  title: string; // API returns 'title', not 'name'
  content: string;
  type: string;
  moduleId: string;
  order: number;
}


export default function ManualCourseManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Form states
  const [courseForm, setCourseForm] = useState({
    name: "",
    description: "",
    icon: "📚",
    duration: "4 weeks",
    difficulty: "Beginner",
  });

  const [moduleForm, setModuleForm] = useState({
    name: "",
    description: "",
  });

  const [lessonForm, setLessonForm] = useState({
    name: "",
    content: "",
    type: "theory",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchModules(selectedCourseId);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (selectedModuleId) {
      fetchLessons(selectedModuleId);
    }
  }, [selectedModuleId]);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/admin/courses");
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchModules = async (courseId: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`);
      if (response.ok) {
        const data = await response.json();
        setModules(data);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  const fetchLessons = async (moduleId: string) => {
    try {
      const response = await fetch(`/api/admin/modules/${moduleId}/lessons`);
      if (response.ok) {
        const data = await response.json();
        setLessons(data);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setLessons([]);
    }
  };

  // Course operations
  const createCourse = async () => {
    if (!courseForm.name.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseForm),
      });
      if (response.ok) {
        setCourseForm({
          name: "",
          description: "",
          icon: "📚",
          duration: "4 weeks",
          difficulty: "Beginner",
        });
        fetchCourses();
        alert("Course created successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating course:", error);
      alert("Error creating course");
    }
    setLoading(false);
  };

  const deleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchCourses();
        if (selectedCourseId === courseId) {
          setSelectedCourseId("");
          setModules([]);
          setLessons([]);
        }
        alert("Course deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Error deleting course");
    }
  };

  // Module operations
  const createModule = async () => {
    if (!moduleForm.name.trim() || !selectedCourseId) return;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/courses/${selectedCourseId}/modules`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(moduleForm),
        }
      );
      if (response.ok) {
        setModuleForm({ name: "", description: "" });
        fetchModules(selectedCourseId);
        alert("Module created successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating module:", error);
      alert("Error creating module");
    }
    setLoading(false);
  };

  const deleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module?")) return;
    try {
      const response = await fetch(`/api/admin/modules/${moduleId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchModules(selectedCourseId);
        if (selectedModuleId === moduleId) {
          setSelectedModuleId("");
          setLessons([]);
        }
        alert("Module deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting module:", error);
      alert("Error deleting module");
    }
  };

  // Lesson operations
  const createLesson = async () => {
    if (!lessonForm.name.trim() || !selectedModuleId) {
      alert("Please fill in lesson name and select a module");
      return;
    }

    setLoading(true);
    try {
      console.log("Creating lesson with data:", lessonForm);
      console.log("Selected module ID:", selectedModuleId);

      const response = await fetch(
        `/api/admin/modules/${selectedModuleId}/lessons`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(lessonForm),
        }
      );

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log("Created lesson:", result);
        setLessonForm({ name: "", content: "", type: "theory" });
        fetchLessons(selectedModuleId);
        alert("Lesson created successfully!");
      } else {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        alert(
          `Error: ${errorData.error || errorData.details || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error creating lesson:", error);
      alert(
        `Error creating lesson: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
    setLoading(false);
  };

  const deleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchLessons(selectedModuleId);
        alert("Lesson deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
      alert("Error deleting lesson");
    }
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-black">
        Manual Course Management
      </h1>

      {/* Course Management */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-black">Courses</h2>

        {/* Create Course Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <input
            type="text"
            placeholder="Course Name"
            value={courseForm.name}
            onChange={(e) =>
              setCourseForm({ ...courseForm, name: e.target.value })
            }
            className="border rounded px-3 py-2 text-black"
          />
          <input
            type="text"
            placeholder="Description"
            value={courseForm.description}
            onChange={(e) =>
              setCourseForm({ ...courseForm, description: e.target.value })
            }
            className="border rounded px-3 py-2 text-black"
          />
          <input
            type="text"
            placeholder="Icon (emoji)"
            value={courseForm.icon}
            onChange={(e) =>
              setCourseForm({ ...courseForm, icon: e.target.value })
            }
            className="border rounded px-3 py-2 text-black"
          />
          <select
            value={courseForm.difficulty}
            onChange={(e) =>
              setCourseForm({ ...courseForm, difficulty: e.target.value })
            }
            className="border rounded px-3 py-2 text-black"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <button
            onClick={createCourse}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Add Course
          </button>
        </div>

        {/* Course List */}
        <div className="space-y-2">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`p-3 border rounded flex items-center justify-between ${
                selectedCourseId === course.id
                  ? "bg-blue-50 border-blue-300"
                  : ""
              }`}
            >
              <div
                className="flex items-center cursor-pointer flex-1"
                onClick={() => setSelectedCourseId(course.id)}
              >
                <span className="mr-3 text-2xl">{course.icon}</span>
                <div>
                  <div className="font-medium text-black">{course.name}</div>
                  <div className="text-sm text-gray-600">
                    {course.description}
                  </div>
                </div>
              </div>
              <button
                onClick={() => deleteCourse(course.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Module Management */}
      {selectedCourseId && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-black">
            Modules for: {courses.find((c) => c.id === selectedCourseId)?.name}
          </h2>

          {/* Create Module Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Module Name"
              value={moduleForm.name}
              onChange={(e) =>
                setModuleForm({ ...moduleForm, name: e.target.value })
              }
              className="border rounded px-3 py-2 text-black"
            />
            <input
              type="text"
              placeholder="Module Description"
              value={moduleForm.description}
              onChange={(e) =>
                setModuleForm({ ...moduleForm, description: e.target.value })
              }
              className="border rounded px-3 py-2 text-black"
            />
            <button
              onClick={createModule}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              Add Module
            </button>
          </div>

          {/* Module List */}
          <div className="space-y-2">
            {modules.map((module) => (
              <div
                key={module.id}
                className={`p-3 border rounded flex items-center justify-between ${
                  selectedModuleId === module.id
                    ? "bg-green-50 border-green-300"
                    : ""
                }`}
              >
                <div
                  className="flex items-center cursor-pointer flex-1"
                  onClick={() => setSelectedModuleId(module.id)}
                >
                  <div>
                    <div className="font-medium text-black">{module.name}</div>
                    <div className="text-sm text-gray-600">
                      {module.description}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteModule(module.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lesson Management */}
      {selectedModuleId && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-black">
            Lessons for: {modules.find((m) => m.id === selectedModuleId)?.name}
          </h2>

          {/* Create Lesson Form */}
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Lesson Name"
                value={lessonForm.name}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, name: e.target.value })
                }
                className="border rounded px-3 py-2 text-black"
              />
              <select
                value={lessonForm.type}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, type: e.target.value })
                }
                className="border rounded px-3 py-2 text-black"
              >
                <option value="theory">Theory</option>
                <option value="practice">Practice</option>
                <option value="exercise">Exercise</option>
                <option value="project">Project</option>
              </select>
              <button
                onClick={createLesson}
                disabled={loading}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
              >
                Add Lesson
              </button>
            </div>
            <textarea
              placeholder="Lesson Content"
              value={lessonForm.content}
              onChange={(e) =>
                setLessonForm({ ...lessonForm, content: e.target.value })
              }
              className="w-full border rounded px-3 py-2 text-black"
              rows={4}
            />
          </div>

          {/* Lesson List */}
          <div className="space-y-2">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="p-3 border rounded">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-black">{lesson.title}</div>{" "}
                    {/* Changed from lesson.name */}
                    <div className="text-sm text-gray-600 mb-2">
                      Type: {lesson.type}
                    </div>
                    <div className="text-sm text-black bg-gray-50 p-2 rounded">
                      {lesson.content || "No content"}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteLesson(lesson.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 ml-4"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
