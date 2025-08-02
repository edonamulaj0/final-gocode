"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Database,
  RefreshCw,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  FileText,
  Layers,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  class: string;
  createdAt: string;
  enrollments: Array<{
    course: { name: string };
  }>;
}

interface Course {
  id: string;
  name: string;
  description: string;
  icon: string;
  duration: string;
  lessons: number;
  difficulty: string;
  order: number;
  isUnlocked: boolean;
  _count: {
    lessons_rel: number;
    practices: number;
    enrollments: number;
  };
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
  courseId: string;
  moduleId?: string;
  isPublished: boolean;
  course: {
    name: string;
  };
}

interface Module {
  id: string;
  name: string;
  description?: string;
  order: number;
  courseId: string;
  isPublished: boolean;
  course: {
    name: string;
  };
  _count: {
    lessons: number;
    practiceQuests: number;
  };
}

interface Enrollment {
  id: string;
  enrolledAt: string;
  user: {
    name: string;
    email: string;
  };
  course: {
    name: string;
  };
}

interface DatabaseData {
  users: User[];
  courses: Course[];
  lessons: Lesson[];
  modules: Module[];
  enrollments: Enrollment[];
  stats: {
    totalUsers: number;
    totalCourses: number;
    totalLessons: number;
    totalModules: number;
    totalEnrollments: number;
  };
}

type ViewMode =
  | "overview"
  | "courses"
  | "lessons"
  | "modules"
  | "users"
  | "addCourse"
  | "editCourse"
  | "addModule"
  | "editModule"
  | "manageLessons";

export default function AdminDatabase() {
  const { data: session } = useSession();
  const [data, setData] = useState<DatabaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const [courseModules, setCourseModules] = useState<{
    [courseId: string]: Module[];
  }>({});
  const [moduleStructure, setModuleStructure] = useState<{
    [courseId: string]: { [moduleId: string]: Lesson[] };
  }>({});

  const [courseData, setCourseData] = useState({
    name: "",
    description: "",
    icon: "",
    duration: "",
    lessons: 0,
    difficulty: "Beginner",
    order: 1,
    isUnlocked: false,
  });

  const [lessonData, setLessonData] = useState({
    title: "",
    content: "",
    order: 1,
    moduleId: "",
    isPublished: true,
  });

  const [moduleData, setModuleData] = useState({
    name: "",
    description: "",
    order: 1,
    courseId: "",
    isPublished: true,
  });

  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/database");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (courseId: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/lessons`);
      if (response.ok) {
        const data = await response.json();
        setLessons(data);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  const fetchModules = async (courseId?: string) => {
    try {
      const url = courseId
        ? `/api/admin/modules?courseId=${courseId}`
        : "/api/admin/modules";
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setModules(data);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  const fetchCourseStructure = async (courseId: string) => {
    try {
      // Fetch modules for the course
      const modulesResponse = await fetch(
        `/api/admin/modules?courseId=${courseId}`
      );
      if (modulesResponse.ok) {
        const moduleData = await modulesResponse.json();
        setCourseModules((prev) => ({ ...prev, [courseId]: moduleData }));

        // For each module, fetch its lessons
        const moduleStructureData: { [moduleId: string]: Lesson[] } = {};

        for (const moduleItem of moduleData) {
          try {
            const lessonsResponse = await fetch(
              `/api/admin/courses/${courseId}/lessons`
            );
            if (lessonsResponse.ok) {
              const allLessons = await lessonsResponse.json();
              // Filter lessons that belong to this module
              const moduleLessons = allLessons.filter(
                (lesson: Lesson) => lesson.moduleId === moduleItem.id
              );
              moduleStructureData[moduleItem.id] = moduleLessons;
            }
          } catch (error) {
            console.error(
              `Error fetching lessons for module ${moduleItem.id}:`,
              error
            );
          }
        }

        setModuleStructure((prev) => ({
          ...prev,
          [courseId]: moduleStructureData,
        }));
      }
    } catch (error) {
      console.error("Error fetching course structure:", error);
    }
  };

  const toggleModuleExpansion = (moduleId: string) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (viewMode === "modules") {
      fetchModules();
    }
  }, [viewMode]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
          isUnlocked: false,
        });
        await fetchData();
        setViewMode("courses");
      } else {
        alert("Failed to create course");
      }
    } catch (error) {
      console.error("Error creating course:", error);
      alert("Error creating course");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/courses/${selectedCourse.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        alert("Course updated successfully!");
        await fetchData();
        setViewMode("courses");
      } else {
        alert("Failed to update course");
      }
    } catch (error) {
      console.error("Error updating course:", error);
      alert("Error updating course");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this course? This will also delete all lessons."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Course deleted successfully!");
        await fetchData();
      } else {
        alert("Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Error deleting course");
    }
  };

  const handleToggleCourseUnlock = async (
    courseId: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isUnlocked: !currentStatus }),
      });

      if (response.ok) {
        alert(`Course ${!currentStatus ? "unlocked" : "locked"} successfully!`);
        await fetchData();
      } else {
        alert("Failed to update course unlock status");
      }
    } catch (error) {
      console.error("Error updating course unlock status:", error);
      alert("Error updating course unlock status");
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/courses/${selectedCourse.id}/lessons`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(lessonData),
        }
      );

      if (response.ok) {
        alert("Lesson created successfully!");
        setLessonData({
          title: "",
          content: "",
          order: lessons.length + 1,
          moduleId: "",
          isPublished: true,
        });
        await fetchLessons(selectedCourse.id);
        await fetchData();
      } else {
        alert("Failed to create lesson");
      }
    } catch (error) {
      console.error("Error creating lesson:", error);
      alert("Error creating lesson");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson || !selectedCourse) return;
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/courses/${selectedCourse.id}/lessons/${editingLesson.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(lessonData),
        }
      );

      if (response.ok) {
        alert("Lesson updated successfully!");
        setEditingLesson(null);
        setLessonData({
          title: "",
          content: "",
          order: lessons.length + 1,
          moduleId: "",
          isPublished: true,
        });
        await fetchLessons(selectedCourse.id);
        await fetchData();
      } else {
        alert("Failed to update lesson");
      }
    } catch (error) {
      console.error("Error updating lesson:", error);
      alert("Error updating lesson");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) {
      return;
    }

    if (!selectedCourse) return;

    try {
      const response = await fetch(
        `/api/admin/courses/${selectedCourse.id}/lessons/${lessonId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Lesson deleted successfully!");
        await fetchLessons(selectedCourse.id);
        await fetchData();
      } else {
        alert("Failed to delete lesson");
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
      alert("Error deleting lesson");
    }
  };

  // Module management functions
  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/modules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(moduleData),
      });

      if (response.ok) {
        alert("Module created successfully!");
        setModuleData({
          name: "",
          description: "",
          order: 1,
          courseId: "",
          isPublished: true,
        });
        await fetchData();
        await fetchModules();
        setViewMode("modules");
      } else {
        alert("Failed to create module");
      }
    } catch (error) {
      console.error("Error creating module:", error);
      alert("Error creating module");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/modules/${selectedModule.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(moduleData),
      });

      if (response.ok) {
        alert("Module updated successfully!");
        await fetchData();
        await fetchModules();
        setViewMode("modules");
      } else {
        alert("Failed to update module");
      }
    } catch (error) {
      console.error("Error updating module:", error);
      alert("Error updating module");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/modules/${moduleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Module deleted successfully!");
        await fetchData();
        await fetchModules();
      } else {
        alert("Failed to delete module");
      }
    } catch (error) {
      console.error("Error deleting module:", error);
      alert("Error deleting module");
    }
  };

  const startEditModule = (module: Module) => {
    setSelectedModule(module);
    setModuleData({
      name: module.name,
      description: module.description || "",
      order: module.order,
      courseId: module.courseId,
      isPublished: module.isPublished,
    });
    setViewMode("editModule");
  };

  const startEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setCourseData({
      name: course.name,
      description: course.description,
      icon: course.icon,
      duration: course.duration,
      lessons: course.lessons,
      difficulty: course.difficulty,
      order: course.order,
      isUnlocked: course.isUnlocked,
    });
    setViewMode("editCourse");
  };

  const startManageLessons = (course: Course) => {
    setSelectedCourse(course);
    fetchLessons(course.id);
    fetchCourseStructure(course.id); // Load modules for the dropdown
    setViewMode("manageLessons");
  };

  const startEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonData({
      title: lesson.title,
      content: lesson.content,
      order: lesson.order,
      moduleId: lesson.moduleId || "",
      isPublished: lesson.isPublished,
    });
  };

  const cancelEditLesson = () => {
    setEditingLesson(null);
    setLessonData({
      title: "",
      content: "",
      order: lessons.length + 1,
      moduleId: "",
      isPublished: true,
    });
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-black">Access Denied</h3>
          <p className="mt-1 text-sm text-black">
            You need to be signed in to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">
            {viewMode === "overview" && "Admin Dashboard"}
            {viewMode === "courses" && "Manage Courses"}
            {viewMode === "modules" && "Manage Modules"}
            {viewMode === "lessons" && "Manage Lessons"}
            {viewMode === "users" && "Manage Users"}
            {viewMode === "addCourse" && "Add New Course"}
            {viewMode === "editCourse" && "Edit Course"}
            {viewMode === "addModule" && "Add New Module"}
            {viewMode === "editModule" && "Edit Module"}
            {viewMode === "manageLessons" &&
              `Manage Lessons - ${selectedCourse?.name}`}
          </h1>

          <div className="flex space-x-2">
            {viewMode !== "overview" && (
              <button
                onClick={() => setViewMode("overview")}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Dashboard
              </button>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Navigation */}
        {viewMode === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <button
              onClick={() => setViewMode("overview")}
              className={`p-4 rounded-lg border-2 transition-colors ${
                viewMode === "overview"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <span className="block text-sm font-medium">Overview</span>
            </button>

            <button
              onClick={() => setViewMode("courses")}
              className="p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-gray-300 transition-colors"
            >
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <span className="block text-sm font-medium">Courses</span>
            </button>

            <button
              onClick={() => setViewMode("modules")}
              className="p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-gray-300 transition-colors"
            >
              <Layers className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
              <span className="block text-sm font-medium">Modules</span>
            </button>

            <button
              onClick={() => setViewMode("lessons")}
              className="p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-gray-300 transition-colors"
            >
              <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <span className="block text-sm font-medium">Lessons</span>
            </button>

            <button
              onClick={() => setViewMode("users")}
              className="p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-gray-300 transition-colors"
            >
              <Users className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <span className="block text-sm font-medium">Users</span>
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-black">Error</h3>
                <div className="mt-2 text-sm text-black">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Overview */}
        {viewMode === "overview" && data && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-black truncate">
                          Total Users
                        </dt>
                        <dd className="text-lg font-medium text-black">
                          {data.stats.totalUsers}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BookOpen className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-black truncate">
                          Total Courses
                        </dt>
                        <dd className="text-lg font-medium text-black">
                          {data.stats.totalCourses}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Layers className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-black truncate">
                          Total Modules
                        </dt>
                        <dd className="text-lg font-medium text-black">
                          {data.stats.totalModules}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-black truncate">
                          Total Lessons
                        </dt>
                        <dd className="text-lg font-medium text-black">
                          {data.stats.totalLessons}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Database className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-black truncate">
                          Total Enrollments
                        </dt>
                        <dd className="text-lg font-medium text-black">
                          {data.stats.totalEnrollments}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-black mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setViewMode("addCourse")}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Course
                  </button>
                  <button
                    onClick={() => setViewMode("courses")}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-50"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Manage Courses
                  </button>
                  <button
                    onClick={() => setViewMode("modules")}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-50"
                  >
                    <Layers className="h-4 w-4 mr-2" />
                    Manage Modules
                  </button>
                  <button
                    onClick={() => setViewMode("lessons")}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-50"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Manage Lessons
                  </button>
                  <button
                    onClick={() => setViewMode("users")}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-50"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View Users
                  </button>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-black mb-4">
                  Recent Courses
                </h3>
                <div className="space-y-3">
                  {data.courses.slice(0, 3).map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{course.icon}</span>
                        <span className="text-sm font-medium text-black">
                          {course.name}
                        </span>
                      </div>
                      <span className="text-xs text-black">
                        {course._count.lessons_rel} lessons
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-black mb-4">
                  Recent Users
                </h3>
                <div className="space-y-3">
                  {data.users.slice(0, 3).map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <span className="text-sm font-medium text-black">
                          {user.name}
                        </span>
                        <div className="text-xs text-black">{user.class}</div>
                      </div>
                      <span className="text-xs text-black">
                        {user.enrollments.length} enrolled
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Courses View - With Module Hierarchy */}
        {viewMode === "courses" && data && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => setViewMode("addCourse")}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Add New Course
              </button>
            </div>

            <div className="grid gap-6">
              {data.courses.map((course) => (
                <div key={course.id} className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{course.icon}</span>
                        <h3 className="text-xl font-semibold text-black">
                          {course.name}
                        </h3>
                        <span className="bg-blue-100 text-black text-xs px-2 py-1 rounded-full">
                          {course.difficulty}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            course.isUnlocked
                              ? "bg-green-100 text-black"
                              : "bg-red-100 text-black"
                          }`}
                        >
                          {course.isUnlocked ? "Unlocked" : "Locked"}
                        </span>
                      </div>
                      <p className="text-black mb-3">{course.description}</p>
                      <div className="flex space-x-4 text-sm text-black">
                        <span>Duration: {course.duration}</span>
                        <span>Lessons: {course._count.lessons_rel}</span>
                        <span>Enrollments: {course._count.enrollments}</span>
                        <span>Order: {course.order}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() =>
                          handleToggleCourseUnlock(course.id, course.isUnlocked)
                        }
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          course.isUnlocked
                            ? "bg-orange-500 text-white hover:bg-orange-600"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {course.isUnlocked ? "Lock" : "Unlock"}
                      </button>
                      <button
                        onClick={() => startEditCourse(course)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors"
                      >
                        <Edit className="h-3 w-3 inline mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          fetchCourseStructure(course.id);
                        }}
                        className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors"
                      >
                        <Layers className="h-3 w-3 inline mr-1" />
                        Load Structure
                      </button>
                      <button
                        onClick={() => startManageLessons(course)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        <FileText className="h-3 w-3 inline mr-1" />
                        Lessons
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="h-3 w-3 inline mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Modules Section */}
                  {courseModules[course.id] && (
                    <div className="border-t pt-4">
                      <h4 className="text-lg font-medium text-black mb-3">
                        Modules ({courseModules[course.id]?.length || 0})
                      </h4>
                      <div className="space-y-3">
                        {courseModules[course.id]
                          ?.sort((a, b) => a.order - b.order)
                          .map((moduleItem) => (
                            <div
                              key={moduleItem.id}
                              className="border border-gray-200 rounded-lg overflow-hidden"
                            >
                              {/* Module Header */}
                              <div
                                className="bg-gray-50 p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() =>
                                  toggleModuleExpansion(moduleItem.id)
                                }
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    {expandedModules.has(moduleItem.id) ? (
                                      <ChevronDown className="h-4 w-4 text-gray-600" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-gray-600" />
                                    )}
                                    <span className="font-medium text-black">
                                      {moduleItem.order}. {moduleItem.name}
                                    </span>
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${
                                        moduleItem.isPublished
                                          ? "bg-green-100 text-black"
                                          : "bg-red-100 text-black"
                                      }`}
                                    >
                                      {moduleItem.isPublished
                                        ? "Published"
                                        : "Draft"}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <span>
                                      {moduleStructure[course.id]?.[
                                        moduleItem.id
                                      ]?.length || 0}{" "}
                                      lessons
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        startEditModule(moduleItem);
                                      }}
                                      className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600 transition-colors"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteModule(moduleItem.id);
                                      }}
                                      className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Module Content - Lessons */}
                              {expandedModules.has(moduleItem.id) && (
                                <div className="p-3 bg-white">
                                  {moduleItem.description && (
                                    <p className="text-sm text-gray-600 mb-3">
                                      {moduleItem.description}
                                    </p>
                                  )}

                                  <div className="space-y-2">
                                    {moduleStructure[course.id]?.[moduleItem.id]
                                      ?.length === 0 ? (
                                      <p className="text-sm text-gray-500 italic">
                                        No lessons in this module yet.
                                      </p>
                                    ) : (
                                      moduleStructure[course.id]?.[
                                        moduleItem.id
                                      ]
                                        ?.sort((a, b) => a.order - b.order)
                                        .map((lesson) => (
                                          <div
                                            key={lesson.id}
                                            className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                                          >
                                            <div className="flex items-center space-x-2">
                                              <span className="text-sm font-medium text-black">
                                                {lesson.order}. {lesson.title}
                                              </span>
                                              {!lesson.isPublished && (
                                                <span className="bg-red-100 text-black text-xs px-2 py-1 rounded-full">
                                                  Draft
                                                </span>
                                              )}
                                            </div>
                                            <div className="flex space-x-1">
                                              <button
                                                onClick={() => {
                                                  setSelectedCourse(course);
                                                  fetchLessons(course.id);
                                                  setViewMode("manageLessons");
                                                }}
                                                className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                                              >
                                                <Edit className="h-3 w-3" />
                                              </button>
                                            </div>
                                          </div>
                                        ))
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>

                      {/* Add Module Button */}
                      <button
                        onClick={() => {
                          setModuleData({
                            name: "",
                            description: "",
                            order: (courseModules[course.id]?.length || 0) + 1,
                            courseId: course.id,
                            isPublished: true,
                          });
                          setViewMode("addModule");
                        }}
                        className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700 transition-colors"
                      >
                        <Plus className="h-3 w-3 inline mr-1" />
                        Add Module to {course.name}
                      </button>
                    </div>
                  )}

                  {/* Show structure button if not loaded */}
                  {!courseModules[course.id] && (
                    <div className="border-t pt-4">
                      <button
                        onClick={() => fetchCourseStructure(course.id)}
                        className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded hover:bg-indigo-200 transition-colors"
                      >
                        <Layers className="h-4 w-4 inline mr-2" />
                        View Course Structure (Modules & Lessons)
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modules View */}
        {viewMode === "modules" && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => setViewMode("addModule")}
                className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Add New Module
              </button>
            </div>

            <div className="grid gap-6">
              {(data?.modules || modules).length === 0 ? (
                <div className="bg-white shadow rounded-lg p-6">
                  <p className="text-black">
                    No modules found. Create your first module above.
                  </p>
                </div>
              ) : (
                (data?.modules || modules).map((module) => (
                  <div
                    key={module.id}
                    className="bg-white shadow rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-black">
                            {module.name}
                          </h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              module.isPublished
                                ? "bg-green-100 text-black"
                                : "bg-red-100 text-black"
                            }`}
                          >
                            {module.isPublished ? "Published" : "Draft"}
                          </span>
                        </div>
                        <p className="text-black mb-3">
                          {module.description || "No description"}
                        </p>
                        <div className="flex space-x-4 text-sm text-black">
                          <span>Course: {module.course.name}</span>
                          <span>Lessons: {module._count?.lessons || 0}</span>
                          <span>
                            Practice Quests:{" "}
                            {module._count?.practiceQuests || 0}
                          </span>
                          <span>Order: {module.order}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => startEditModule(module)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors"
                        >
                          <Edit className="h-3 w-3 inline mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteModule(module.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="h-3 w-3 inline mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Lessons View */}
        {viewMode === "lessons" && data && (
          <div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-black mb-4">
                All Lessons ({data.lessons.length})
              </h3>
              <div className="space-y-4">
                {data.lessons.length === 0 ? (
                  <p className="text-black">No lessons found.</p>
                ) : (
                  data.lessons
                    .sort((a, b) => a.order - b.order)
                    .map((lesson) => (
                      <div key={lesson.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-black">
                                {lesson.order}. {lesson.title}
                              </h4>
                              {!lesson.isPublished && (
                                <span className="bg-red-100 text-black text-xs px-2 py-1 rounded-full">
                                  Draft
                                </span>
                              )}
                            </div>
                            <p className="text-black text-sm mb-2">
                              Course: {lesson.course.name}
                            </p>
                            <p className="text-black text-sm">
                              {lesson.content.length > 100
                                ? lesson.content.substring(0, 100) + "..."
                                : lesson.content}
                            </p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => {
                                const course = data.courses.find(
                                  (c) => c.id === lesson.courseId
                                );
                                if (course) {
                                  setSelectedCourse(course);
                                  fetchLessons(course.id);
                                  setViewMode("manageLessons");
                                }
                              }}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                            >
                              <Edit className="h-3 w-3 inline mr-1" />
                              Manage
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users View */}
        {viewMode === "users" && data && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-black">
                Users ({data.users.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Enrollments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-black">
                            {user.name}
                          </div>
                          <div className="text-sm text-black">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-black">
                          {user.class}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {user.enrollments.length} courses
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Course Form */}
        {(viewMode === "addCourse" || viewMode === "editCourse") && (
          <form
            onSubmit={
              viewMode === "addCourse" ? handleCreateCourse : handleUpdateCourse
            }
            className="bg-white shadow rounded-lg p-6 space-y-6"
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-black"
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
                className="block text-sm font-medium text-black"
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
                className="block text-sm font-medium text-black"
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
                  className="block text-sm font-medium text-black"
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
                  className="block text-sm font-medium text-black"
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
                  className="block text-sm font-medium text-black"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="order"
                  className="block text-sm font-medium text-black"
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

              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  id="isUnlocked"
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  checked={courseData.isUnlocked}
                  onChange={(e) =>
                    setCourseData({
                      ...courseData,
                      isUnlocked: e.target.checked,
                    })
                  }
                />
                <label htmlFor="isUnlocked" className="ml-2 text-sm text-black">
                  Unlock Course (Students can access immediately)
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : viewMode === "addCourse"
                ? "Create Course"
                : "Update Course"}
            </button>
          </form>
        )}

        {/* Add/Edit Module Form */}
        {(viewMode === "addModule" || viewMode === "editModule") && (
          <form
            onSubmit={
              viewMode === "addModule" ? handleCreateModule : handleUpdateModule
            }
            className="bg-white shadow rounded-lg p-6 space-y-6"
          >
            <div>
              <label
                htmlFor="moduleName"
                className="block text-sm font-medium text-black"
              >
                Module Name
              </label>
              <input
                type="text"
                id="moduleName"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={moduleData.name}
                onChange={(e) =>
                  setModuleData({ ...moduleData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label
                htmlFor="moduleDescription"
                className="block text-sm font-medium text-black"
              >
                Description
              </label>
              <textarea
                id="moduleDescription"
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={moduleData.description}
                onChange={(e) =>
                  setModuleData({ ...moduleData, description: e.target.value })
                }
              />
            </div>

            <div>
              <label
                htmlFor="moduleCourse"
                className="block text-sm font-medium text-black"
              >
                Course
              </label>
              <select
                id="moduleCourse"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={moduleData.courseId}
                onChange={(e) =>
                  setModuleData({ ...moduleData, courseId: e.target.value })
                }
              >
                <option value="">Select a course...</option>
                {data?.courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="moduleOrder"
                  className="block text-sm font-medium text-black"
                >
                  Module Order
                </label>
                <input
                  type="number"
                  id="moduleOrder"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={moduleData.order}
                  onChange={(e) =>
                    setModuleData({
                      ...moduleData,
                      order: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  id="moduleIsPublished"
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  checked={moduleData.isPublished}
                  onChange={(e) =>
                    setModuleData({
                      ...moduleData,
                      isPublished: e.target.checked,
                    })
                  }
                />
                <label
                  htmlFor="moduleIsPublished"
                  className="ml-2 text-sm text-black"
                >
                  Published (Module is visible to students)
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : viewMode === "addModule"
                ? "Create Module"
                : "Update Module"}
            </button>
          </form>
        )}

        {/* Manage Lessons View */}
        {viewMode === "manageLessons" && (
          <div className="space-y-8">
            {/* Add/Edit Lesson Form */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-black mb-4">
                {editingLesson ? "Edit Lesson" : "Add New Lesson"}
              </h3>
              <form
                onSubmit={
                  editingLesson ? handleUpdateLesson : handleCreateLesson
                }
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-black"
                  >
                    Lesson Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={lessonData.title}
                    onChange={(e) =>
                      setLessonData({ ...lessonData, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium text-black"
                  >
                    Content (Markdown/JSON)
                  </label>
                  <textarea
                    id="content"
                    required
                    rows={8}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                    value={lessonData.content}
                    onChange={(e) =>
                      setLessonData({ ...lessonData, content: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="moduleSelect"
                    className="block text-sm font-medium text-black"
                  >
                    Module
                  </label>
                  <select
                    id="moduleSelect"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={lessonData.moduleId}
                    onChange={(e) =>
                      setLessonData({ ...lessonData, moduleId: e.target.value })
                    }
                  >
                    <option value="">Select a module...</option>
                    {(courseModules[selectedCourse?.id || ""] || [])
                      .sort((a, b) => a.order - b.order)
                      .map((moduleItem) => (
                        <option key={moduleItem.id} value={moduleItem.id}>
                          {moduleItem.order}. {moduleItem.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="order"
                      className="block text-sm font-medium text-black"
                    >
                      Lesson Order
                    </label>
                    <input
                      type="number"
                      id="order"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      value={lessonData.order}
                      onChange={(e) =>
                        setLessonData({
                          ...lessonData,
                          order: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublished"
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      checked={lessonData.isPublished}
                      onChange={(e) =>
                        setLessonData({
                          ...lessonData,
                          isPublished: e.target.checked,
                        })
                      }
                    />
                    <label
                      htmlFor="isPublished"
                      className="ml-2 text-sm text-black"
                    >
                      Published
                    </label>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading
                      ? "Saving..."
                      : editingLesson
                      ? "Update Lesson"
                      : "Create Lesson"}
                  </button>
                  {editingLesson && (
                    <button
                      type="button"
                      onClick={cancelEditLesson}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Lessons List */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-black mb-4">
                Existing Lessons ({lessons.length})
              </h3>
              <div className="space-y-4">
                {lessons.length === 0 ? (
                  <p className="text-black">
                    No lessons found. Create your first lesson above.
                  </p>
                ) : (
                  lessons
                    .sort((a, b) => a.order - b.order)
                    .map((lesson) => (
                      <div key={lesson.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-black">
                                {lesson.order}. {lesson.title}
                              </h4>
                              {!lesson.isPublished && (
                                <span className="bg-red-100 text-black text-xs px-2 py-1 rounded-full">
                                  Draft
                                </span>
                              )}
                            </div>
                            <p className="text-black text-sm">
                              {lesson.content.length > 100
                                ? lesson.content.substring(0, 100) + "..."
                                : lesson.content}
                            </p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => startEditLesson(lesson)}
                              className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors"
                            >
                              <Edit className="h-3 w-3 inline mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                            >
                              <Trash2 className="h-3 w-3 inline mr-1" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
