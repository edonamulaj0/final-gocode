"use client";

import { useState, useEffect } from "react";
import { StudentLevel, Student } from "@/types/student";

interface LevelConfig {
  value: StudentLevel;
  label: string;
  description: string;
}

export default function StudentClassManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newLevel, setNewLevel] = useState<StudentLevel>("B2");
  const [loading, setLoading] = useState(true);

  const levels: LevelConfig[] = [
    {
      value: "B2",
      label: "B2 - Beginner 2",
      description: "Basic modules (1-3)",
    },
    {
      value: "B3",
      label: "B3 - Beginner 3",
      description: "Extended modules (1-5)",
    },
    {
      value: "M1",
      label: "M1 - Intermediate 1",
      description: "Advanced modules (1-8)",
    },
    {
      value: "M2",
      label: "M2 - Intermediate 2",
      description: "All modules available",
    },
  ];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/admin/students");
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStudentLevel = async (studentId: string, level: StudentLevel) => {
    try {
      const response = await fetch(`/api/admin/students/${studentId}/level`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level }),
      });

      if (response.ok) {
        setStudents((prev) =>
          prev.map((student) =>
            student.id === studentId
              ? { ...student, currentLevel: level }
              : student
          )
        );
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error("Failed to update student level:", error);
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
        <div className="text-gray-500">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Student Class Management</h3>
        <div className="text-sm text-gray-500">
          Total Students: {students.length}
        </div>
      </div>

      {/* Level Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {levels.map((level) => (
          <div key={level.value} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{level.label}</h4>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(
                  level.value
                )}`}
              >
                {students.filter((s) => s.currentLevel === level.value).length}
              </span>
            </div>
            <p className="text-sm text-gray-600">{level.description}</p>
          </div>
        ))}
      </div>

      {/* Students Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Students</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrolled Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {student.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(
                        student.currentLevel
                      )}`}
                    >
                      {student.currentLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(student.enrolledAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setNewLevel(student.currentLevel);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 transition-colors"
                    >
                      Change Level
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Level Change Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">
              Change Level for {selectedStudent.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Level:{" "}
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getLevelColor(
                      selectedStudent.currentLevel
                    )}`}
                  >
                    {selectedStudent.currentLevel}
                  </span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Level
                </label>
                <select
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value as StudentLevel)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {levels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  {levels.find((l) => l.value === newLevel)?.description}
                </p>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    updateStudentLevel(selectedStudent.id, newLevel)
                  }
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Update Level
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
