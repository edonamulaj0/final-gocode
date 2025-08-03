"use client";

import { useState, useEffect } from "react";

interface Course {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
  duration: string;
  difficulty: string;
  lessons: number;
  createdAt: Date;
  updatedAt: Date;
}

interface NewCourse {
  name: string;
  description: string;
  icon: string;
  duration: string;
  difficulty: string;
}

export function useCourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseData, setCourseData] = useState<NewCourse>({
    name: "",
    description: "",
    icon: "📚",
    duration: "4 weeks",
    difficulty: "Beginner",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/admin/courses");
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        console.error("Failed to fetch courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async () => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        const course = await response.json();
        setCourses([...courses, course]);
        resetForm();
        setShowModal(false);
      } else {
        const errorData = await response.json();
        alert(`Failed to create course: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error creating course:", error);
      alert("Error creating course");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCourse = async () => {
    if (!editingCourse) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/courses/${editingCourse.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        const updatedCourse = await response.json();
        setCourses(
          courses.map((c) => (c.id === editingCourse.id ? updatedCourse : c))
        );
        resetForm();
        setShowModal(false);
      } else {
        alert("Failed to update course");
      }
    } catch (error) {
      console.error("Error updating course:", error);
      alert("Error updating course");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCourses(courses.filter((c) => c.id !== courseId));
      } else {
        alert("Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Error deleting course");
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setCourseData({
      name: course.name,
      description: course.description,
      icon: course.icon,
      duration: course.duration,
      difficulty: course.difficulty,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCourse(null);
    resetForm();
  };

  const resetForm = () => {
    setCourseData({
      name: "",
      description: "",
      icon: "📚",
      duration: "4 weeks",
      difficulty: "Beginner",
    });
  };

  const handleSubmit = () => {
    if (editingCourse) {
      handleEditCourse();
    } else {
      handleAddCourse();
    }
  };

  return {
    courses,
    loading,
    showModal,
    editingCourse,
    courseData,
    submitting,
    setCourseData,
    handleDeleteCourse,
    openAddModal,
    openEditModal,
    closeModal,
    handleSubmit,
  };
}
