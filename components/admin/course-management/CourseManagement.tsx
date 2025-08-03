"use client";

import React from "react";
import CourseList from "./CourseList";
import CourseStats from "./CourseStats";
import CourseModal from "./CourseModal";
import { useCourseManagement } from "./useCourseManagement";

export default function CourseManagement() {
  const {
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
  } = useCourseManagement();

  return (
    <div className="space-y-6">
      <CourseStats courses={courses} />

      <CourseList
        courses={courses}
        onEditCourse={openEditModal}
        onDeleteCourse={handleDeleteCourse}
        onAddCourse={openAddModal}
        loading={loading}
      />

      <CourseModal
        isOpen={showModal}
        onClose={closeModal}
        courseData={courseData}
        setCourseData={setCourseData}
        onSubmit={handleSubmit}
        isEditing={!!editingCourse}
        loading={submitting}
      />
    </div>
  );
}
