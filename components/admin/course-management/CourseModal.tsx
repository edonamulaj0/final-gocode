"use client";

import React from "react";

interface NewCourse {
  name: string;
  description: string;
  icon: string;
  duration: string;
  difficulty: string;
}

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseData: NewCourse;
  setCourseData: (data: NewCourse) => void;
  onSubmit: () => void;
  isEditing: boolean;
  loading?: boolean;
}

export default function CourseModal({
  isOpen,
  onClose,
  courseData,
  setCourseData,
  onSubmit,
  isEditing,
  loading = false,
}: CourseModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
	e.preventDefault();
	onSubmit();
  };

  return (
	<div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
	  <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
		<h3 className="text-lg font-medium mb-4">
		  {isEditing ? "Edit Course" : "Add New Course"}
		</h3>
		<form onSubmit={handleSubmit}>
		  <div className="space-y-4">
			<div>
			  <label className="block text-sm font-medium text-gray-700">
				Course Name
			  </label>
			  <input
				type="text"
				value={courseData.name}
				onChange={(e) =>
				  setCourseData({ ...courseData, name: e.target.value })
				}
				className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				placeholder="e.g., JavaScript Fundamentals"
				required
			  />
			</div>
			<div>
			  <label className="block text-sm font-medium text-gray-700">
				Description
			  </label>
			  <textarea
				value={courseData.description}
				onChange={(e) =>
				  setCourseData({ ...courseData, description: e.target.value })
				}
				className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				rows={3}
				placeholder="Brief description of the course..."
				required
			  />
			</div>
			<div className="grid grid-cols-2 gap-4">
			  <div>
				<label className="block text-sm font-medium text-gray-700">
				  Icon
				</label>
				<input
				  type="text"
				  value={courseData.icon}
				  onChange={(e) =>
					setCourseData({ ...courseData, icon: e.target.value })
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
				  value={courseData.duration}
				  onChange={(e) =>
					setCourseData({ ...courseData, duration: e.target.value })
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
				value={courseData.difficulty}
				onChange={(e) =>
				  setCourseData({ ...courseData, difficulty: e.target.value })
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
				type="button"
				onClick={onClose}
				className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
				disabled={loading}
			  >
				Cancel
			  </button>
			  <button
				type="submit"
				disabled={!courseData.name || loading}
				className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
			  >
				{loading ? "Saving..." : isEditing ? "Update" : "Create"} Course
			  </button>
			</div>
		  </div>
		</form>
	  </div>
	</div>
  );
}
