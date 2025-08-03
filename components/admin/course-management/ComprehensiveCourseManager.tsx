"use client";

import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

interface Course {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
  duration: string;
  difficulty: string;
  modules: Module[];
}

interface Module {
  id: string;
  name: string;
  description: string;
  order: number;
  courseId: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  name: string;
  content: string;
  order: number;
  moduleId: string;
  type: string;
}

interface EditData {
  id?: string;
  name?: string;
  description?: string;
  icon?: string;
  duration?: string;
  difficulty?: string;
  courseId?: string;
  moduleId?: string;
  content?: string;
  type?: string;
}

export default function ComprehensiveCourseManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState<
    "course" | "module" | "lesson" | null
  >(null);
  const [editData, setEditData] = useState<EditData>({});

  useEffect(() => {
    fetchCoursesWithContent();
  }, []);

  const fetchCoursesWithContent = async () => {
    try {
      const response = await fetch("/api/admin/courses/detailed");
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === "COURSE") {
      const newCourses = Array.from(courses);
      const [reorderedCourse] = newCourses.splice(source.index, 1);
      newCourses.splice(destination.index, 0, reorderedCourse);

      const updatedCourses = newCourses.map((course, index) => ({
        ...course,
        order: index + 1,
      }));

      setCourses(updatedCourses);
      await updateCourseOrder(updatedCourses);
    } else if (type === "MODULE" && selectedCourse) {
      const newModules = Array.from(selectedCourse.modules);
      const [reorderedModule] = newModules.splice(source.index, 1);
      newModules.splice(destination.index, 0, reorderedModule);

      const updatedModules = newModules.map((moduleItem, index) => ({
        ...moduleItem,
        order: index + 1,
      }));

      const updatedCourse = { ...selectedCourse, modules: updatedModules };
      setSelectedCourse(updatedCourse);
      setCourses(
        courses.map((c) => (c.id === updatedCourse.id ? updatedCourse : c))
      );
      await updateModuleOrder(selectedCourse.id, updatedModules);
    } else if (type === "LESSON" && selectedModule) {
      const newLessons = Array.from(selectedModule.lessons);
      const [reorderedLesson] = newLessons.splice(source.index, 1);
      newLessons.splice(destination.index, 0, reorderedLesson);

      const updatedLessons = newLessons.map((lesson, index) => ({
        ...lesson,
        order: index + 1,
      }));

      const updatedModule = { ...selectedModule, lessons: updatedLessons };
      setSelectedModule(updatedModule);
      await updateLessonOrder(selectedModule.id, updatedLessons);
    }
  };

  const updateCourseOrder = async (coursesData: Course[]) => {
    try {
      await fetch("/api/admin/courses/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courses: coursesData.map((c) => ({ id: c.id, order: c.order })),
        }),
      });
    } catch (error) {
      console.error("Error updating course order:", error);
    }
  };

  const updateModuleOrder = async (courseId: string, modulesData: Module[]) => {
    try {
      await fetch(`/api/admin/courses/${courseId}/modules/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modules: modulesData.map((m) => ({ id: m.id, order: m.order })),
        }),
      });
    } catch (error) {
      console.error("Error updating module order:", error);
    }
  };

  const updateLessonOrder = async (moduleId: string, lessonsData: Lesson[]) => {
    try {
      await fetch(`/api/admin/modules/${moduleId}/lessons/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessons: lessonsData.map((l) => ({ id: l.id, order: l.order })),
        }),
      });
    } catch (error) {
      console.error("Error updating lesson order:", error);
    }
  };

  const handleSave = async () => {
    try {
      if (editMode === "course") {
        const url = editData.id
          ? `/api/admin/courses/${editData.id}`
          : `/api/admin/courses`;

        const response = await fetch(url, {
          method: editData.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editData),
        });

        if (response.ok) {
          await fetchCoursesWithContent();
        } else {
          const errorData = await response.json();
          console.error("Error saving course:", errorData);
          alert(`Error saving course: ${errorData.error || "Unknown error"}`);
        }
      } else if (editMode === "module" && selectedCourse) {
        const url = editData.id
          ? `/api/admin/modules/${editData.id}`
          : `/api/admin/courses/${selectedCourse.id}/modules`;

        const response = await fetch(url, {
          method: editData.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editData),
        });

        if (response.ok) {
          await fetchCoursesWithContent();
          // Update selected course after refresh
          const refreshedCourses = await fetch(
            "/api/admin/courses/detailed"
          ).then((res) => res.json());
          const refreshedCourse = refreshedCourses.find(
            (c: Course) => c.id === selectedCourse.id
          );
          if (refreshedCourse) {
            setSelectedCourse(refreshedCourse);
          }
        } else {
          const errorData = await response.json();
          console.error("Error saving module:", errorData);
          alert(`Error saving module: ${errorData.error || "Unknown error"}`);
        }
      } else if (editMode === "lesson" && selectedModule) {
        const url = editData.id
          ? `/api/admin/lessons/${editData.id}`
          : `/api/admin/modules/${selectedModule.id}/lessons`;

        const response = await fetch(url, {
          method: editData.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editData),
        });

        if (response.ok) {
          await fetchCoursesWithContent();
          // Update selected course and module after refresh
          if (selectedCourse) {
            const refreshedCourses = await fetch(
              "/api/admin/courses/detailed"
            ).then((res) => res.json());
            const refreshedCourse = refreshedCourses.find(
              (c: Course) => c.id === selectedCourse.id
            );
            if (refreshedCourse) {
              setSelectedCourse(refreshedCourse);
              const refreshedModule = refreshedCourse.modules.find(
                (m: Module) => m.id === selectedModule.id
              );
              if (refreshedModule) {
                setSelectedModule(refreshedModule);
              }
            }
          }
        } else {
          const errorData = await response.json();
          console.error("Error saving lesson:", errorData);
          alert(`Error saving lesson: ${errorData.error || "Unknown error"}`);
        }
      }
      setEditMode(null);
      setEditData({});
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error saving. Please try again.");
    }
  };

  const handleDelete = async (
    type: "course" | "module" | "lesson",
    id: string
  ) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      let url = "";
      if (type === "course") url = `/api/admin/courses/${id}`;
      else if (type === "module") url = `/api/admin/modules/${id}`;
      else if (type === "lesson") url = `/api/admin/lessons/${id}`;

      const response = await fetch(url, { method: "DELETE" });
      if (response.ok) {
        await fetchCoursesWithContent();
        if (type === "course" && selectedCourse?.id === id) {
          setSelectedCourse(null);
          setSelectedModule(null);
        }
        if (type === "module" && selectedModule?.id === id) {
          setSelectedModule(null);
        }
      } else {
        const errorData = await response.json();
        console.error(`Error deleting ${type}:`, errorData);
        alert(`Error deleting ${type}: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      alert(`Error deleting ${type}. Please try again.`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-black">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courses Panel */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-black">Courses</h3>
            <button
              onClick={() => {
                setEditMode("course");
                setEditData({
                  name: "",
                  description: "",
                  icon: "📚",
                  duration: "4 weeks",
                  difficulty: "Beginner",
                });
              }}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              Add Course
            </button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="courses" type="COURSE">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {courses.map((course, index) => (
                    <Draggable
                      key={course.id}
                      draggableId={course.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-3 border rounded cursor-pointer ${
                            selectedCourse?.id === course.id
                              ? "bg-blue-50 border-blue-300"
                              : "bg-white"
                          } ${snapshot.isDragging ? "shadow-lg" : ""}`}
                          onClick={() => setSelectedCourse(course)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="mr-2">{course.icon}</span>
                              <div>
                                <div className="font-medium text-black">
                                  {course.name}
                                </div>
                                <div className="text-xs text-black">
                                  {course.modules?.length || 0} modules
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditMode("course");
                                  setEditData(course);
                                }}
                                className="text-xs bg-gray-100 text-black px-2 py-1 rounded"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete("course", course.id);
                                }}
                                className="text-xs bg-red-100 text-black px-2 py-1 rounded"
                              >
                                Del
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Modules Panel */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-black">
              Modules {selectedCourse && `- ${selectedCourse.name}`}
            </h3>
            {selectedCourse && (
              <button
                onClick={() => {
                  setEditMode("module");
                  setEditData({
                    name: "",
                    description: "",
                    courseId: selectedCourse.id,
                  });
                }}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Add Module
              </button>
            )}
          </div>

          {selectedCourse ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="modules" type="MODULE">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {selectedCourse.modules?.map((moduleItem, index) => (
                      <Draggable
                        key={moduleItem.id}
                        draggableId={moduleItem.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 border rounded cursor-pointer ${
                              selectedModule?.id === moduleItem.id
                                ? "bg-green-50 border-green-300"
                                : "bg-white"
                            } ${snapshot.isDragging ? "shadow-lg" : ""}`}
                            onClick={() => setSelectedModule(moduleItem)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-black">
                                  {moduleItem.name}
                                </div>
                                <div className="text-xs text-black">
                                  {moduleItem.lessons?.length || 0} lessons
                                </div>
                              </div>
                              <div className="flex space-x-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditMode("module");
                                    setEditData(moduleItem);
                                  }}
                                  className="text-xs bg-gray-100 text-black px-2 py-1 rounded"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete("module", moduleItem.id);
                                  }}
                                  className="text-xs bg-red-100 text-black px-2 py-1 rounded"
                                >
                                  Del
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    )) || []}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="text-center text-black py-8">
              Select a course to view modules
            </div>
          )}
        </div>

        {/* Lessons Panel */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-black">
              Lessons {selectedModule && `- ${selectedModule.name}`}
            </h3>
            {selectedModule && (
              <button
                onClick={() => {
                  setEditMode("lesson");
                  setEditData({
                    name: "",
                    content: "",
                    type: "theory",
                    moduleId: selectedModule.id,
                  });
                }}
                className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
              >
                Add Lesson
              </button>
            )}
          </div>

          {selectedModule ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="lessons" type="LESSON">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {selectedModule.lessons?.map((lesson, index) => (
                      <Draggable
                        key={lesson.id}
                        draggableId={lesson.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 border rounded ${
                              snapshot.isDragging ? "shadow-lg" : ""
                            } bg-white`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-black">
                                  {lesson.name}
                                </div>
                                <div className="text-xs text-black">
                                  {lesson.type}
                                </div>
                              </div>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => {
                                    setEditMode("lesson");
                                    setEditData(lesson);
                                  }}
                                  className="text-xs bg-gray-100 text-black px-2 py-1 rounded"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete("lesson", lesson.id)
                                  }
                                  className="text-xs bg-red-100 text-black px-2 py-1 rounded"
                                >
                                  Del
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    )) || []}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="text-center text-black py-8">
              Select a module to view lessons
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editMode && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-medium mb-4 text-black">
              {editData.id ? "Edit" : "Add"}{" "}
              {editMode.charAt(0).toUpperCase() + editMode.slice(1)}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black">
                  Name
                </label>
                <input
                  type="text"
                  value={editData.name || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black">
                  Description
                </label>
                <textarea
                  value={editData.description || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black border px-3 py-2"
                />
              </div>

              {editMode === "course" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black">
                        Icon
                      </label>
                      <input
                        type="text"
                        value={editData.icon || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, icon: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black border px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={editData.duration || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, duration: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black border px-3 py-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black">
                      Difficulty
                    </label>
                    <select
                      value={editData.difficulty || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, difficulty: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black border px-3 py-2"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </>
              )}

              {editMode === "lesson" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-black">
                      Type
                    </label>
                    <select
                      value={editData.type || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, type: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black border px-3 py-2"
                    >
                      <option value="theory">Theory</option>
                      <option value="practice">Practice</option>
                      <option value="exercise">Exercise</option>
                      <option value="project">Project</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black">
                      Content
                    </label>
                    <textarea
                      value={editData.content || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, content: e.target.value })
                      }
                      rows={6}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black border px-3 py-2"
                      placeholder="Lesson content..."
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => {
                  setEditMode(null);
                  setEditData({});
                }}
                className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
