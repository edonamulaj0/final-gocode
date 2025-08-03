import React from "react";
import { Session } from "next-auth";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
} from "lucide-react";

interface AssignmentsPageProps {
  loading: boolean;
  error: string | null;
  session: Session | null;
  fetchCourses: () => void;
}

// Mock assignments data - this will be replaced with real data later
const mockAssignments = [
  {
    id: "1",
    title: "Python Basics Quiz",
    course: "Python Programming",
    courseIcon: "🐍",
    dueDate: "2025-08-10",
    status: "pending",
    type: "quiz",
    points: 25,
    description:
      "Complete the fundamentals quiz covering variables, data types, and basic operations.",
  },
  {
    id: "2",
    title: "JavaScript Function Project",
    course: "JavaScript Essentials",
    courseIcon: "📜",
    dueDate: "2025-08-08",
    status: "submitted",
    type: "project",
    points: 50,
    description:
      "Build a calculator application using JavaScript functions and DOM manipulation.",
  },
  {
    id: "3",
    title: "HTML Structure Assignment",
    course: "Web Development",
    courseIcon: "🌐",
    dueDate: "2025-08-15",
    status: "pending",
    type: "assignment",
    points: 30,
    description:
      "Create a semantic HTML structure for a blog layout with proper accessibility features.",
  },
  {
    id: "4",
    title: "Algorithm Challenge",
    course: "Data Structures",
    courseIcon: "🔢",
    dueDate: "2025-08-05",
    status: "overdue",
    type: "challenge",
    points: 40,
    description:
      "Implement sorting algorithms and analyze their time complexity.",
  },
];

const AssignmentsPage = ({
  loading,
  error,
  session,
  fetchCourses,
}: AssignmentsPageProps) => {
  if (!session) {
    return (
      <div className="text-center py-20 px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
          Access Denied
        </h1>
        <p className="text-slate-600 mb-8">
          Please log in to view your assignments.
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "submitted":
        return "text-blue-600 bg-blue-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "overdue":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "submitted":
        return <CheckCircle size={16} />;
      case "overdue":
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "quiz":
        return "📝";
      case "project":
        return "💻";
      case "assignment":
        return "📄";
      case "challenge":
        return "🏆";
      default:
        return "📋";
    }
  };

  return (
    <div>
      {/* Assignments Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">📋</div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Assignments & Projects
              </h1>
              <p className="text-gray-600 mt-2">
                Complete your assignments and track your progress across all
                enrolled courses.
              </p>
              <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-3 text-sm text-gray-500">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {mockAssignments.length} Total Assignments
                </span>
                <span>
                  {mockAssignments.filter((a) => a.status === "pending").length}{" "}
                  Pending
                </span>
                <span>
                  {
                    mockAssignments.filter((a) => a.status === "submitted")
                      .length
                  }{" "}
                  Submitted
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 overflow-x-hidden">
        {loading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchCourses} />
        ) : (
          <div className="space-y-6">
            {/* Assignment Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-md p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {mockAssignments.length}
                </div>
                <p className="text-slate-600 text-sm">Total</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-2">
                  {mockAssignments.filter((a) => a.status === "pending").length}
                </div>
                <p className="text-slate-600 text-sm">Pending</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {
                    mockAssignments.filter((a) => a.status === "submitted")
                      .length
                  }
                </div>
                <p className="text-slate-600 text-sm">Submitted</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 text-center">
                <div className="text-2xl font-bold text-red-600 mb-2">
                  {mockAssignments.filter((a) => a.status === "overdue").length}
                </div>
                <p className="text-slate-600 text-sm">Overdue</p>
              </div>
            </div>

            {/* Assignments List */}
            <div className="space-y-4">
              {mockAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="bg-white rounded-xl shadow-md p-4 md:p-6 border-2 border-slate-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6 flex-1">
                      <div className="text-4xl md:text-5xl self-center md:self-start">
                        {getTypeIcon(assignment.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-center md:justify-start space-x-3 mb-3">
                          <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                            {assignment.title}
                          </h2>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(
                              assignment.status
                            )}`}
                          >
                            {getStatusIcon(assignment.status)}
                            <span className="capitalize">
                              {assignment.status}
                            </span>
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-2xl">
                            {assignment.courseIcon}
                          </span>
                          <span className="text-slate-600 font-medium">
                            {assignment.course}
                          </span>
                        </div>

                        <p className="text-slate-600 mb-4 text-center md:text-left">
                          {assignment.description}
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 md:gap-6 text-sm text-slate-500 mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar size={16} />
                            <span>
                              Due:{" "}
                              {new Date(
                                assignment.dueDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FileText size={16} />
                            <span>{assignment.points} points</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User size={16} />
                            <span className="capitalize">
                              {assignment.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      className={`flex items-center justify-center space-x-2 px-4 md:px-6 py-3 rounded-lg font-semibold transition-colors mt-4 md:mt-0 w-full md:w-auto ${
                        assignment.status === "submitted"
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : assignment.status === "overdue"
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      <FileText size={18} />
                      <span>
                        {assignment.status === "submitted"
                          ? "View Submission"
                          : assignment.status === "overdue"
                          ? "Submit Late"
                          : "Start Assignment"}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {mockAssignments.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">
                  No assignments yet
                </h3>
                <p className="text-slate-500">
                  Assignments will appear here once you enroll in courses.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentsPage;
