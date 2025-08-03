"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface Submission {
  id: string;
  type: "project" | "module_exam" | "final_exam";
  itemTitle: string;
  maxPoints: number;
  user: {
    id: string;
    name: string;
    email: string;
    class: string;
  };
  submittedAt: string;
  score?: number;
  feedback?: string;
  // Project specific
  title?: string;
  description?: string;
  githubUrl?: string;
  deployUrl?: string;
  // Exam specific
  answers?: Array<{
    id: string;
    question: {
      id: string;
      question: string;
      type: string;
      points: number;
    };
    answer: string;
    points: number;
    feedback?: string;
  }>;
}

export default function GradingPage() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [grading, setGrading] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/grading?type=${filter}`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleGrade = async (
    submissionId: string,
    score: number,
    feedback: string,
    answerGrades?: Array<{ answerId: string; points: number; feedback: string }>
  ) => {
    setGrading(true);
    try {
      const response = await fetch("/api/admin/grading", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissionId,
          type: selectedSubmission?.type,
          score,
          feedback,
          answerGrades,
        }),
      });

      if (response.ok) {
        // Refresh submissions
        await fetchSubmissions();
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error("Error grading submission:", error);
    } finally {
      setGrading(false);
    }
  };

  if (!session?.user) {
    return <div className="p-6">Please sign in to access this page.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Grading Dashboard</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Submissions</option>
          <option value="projects">Projects</option>
          <option value="exams">Exams</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {submissions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No submissions need grading at this time.
            </div>
          ) : (
            submissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {submission.itemTitle}
                    </h3>
                    <p className="text-gray-600">
                      {submission.type === "project" ? "Project" : "Exam"} •{" "}
                      {submission.maxPoints} points
                    </p>
                    <p className="text-sm text-gray-500">
                      Submitted by {submission.user.name} (
                      {submission.user.class}) on{" "}
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSubmission(submission)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Grade
                  </button>
                </div>

                {submission.type === "project" && (
                  <div className="mt-4 space-y-2">
                    <p>
                      <strong>Title:</strong> {submission.title}
                    </p>
                    {submission.description && (
                      <p>
                        <strong>Description:</strong> {submission.description}
                      </p>
                    )}
                    {submission.githubUrl && (
                      <p>
                        <strong>GitHub:</strong>{" "}
                        <a
                          href={submission.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {submission.githubUrl}
                        </a>
                      </p>
                    )}
                    {submission.deployUrl && (
                      <p>
                        <strong>Live Demo:</strong>{" "}
                        <a
                          href={submission.deployUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {submission.deployUrl}
                        </a>
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Grading Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Grade Submission</h2>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <GradingForm
                submission={selectedSubmission}
                onSubmit={handleGrade}
                loading={grading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface GradingFormProps {
  submission: Submission;
  onSubmit: (
    submissionId: string,
    score: number,
    feedback: string,
    answerGrades?: Array<{ answerId: string; points: number; feedback: string }>
  ) => void;
  loading: boolean;
}

function GradingForm({ submission, onSubmit, loading }: GradingFormProps) {
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [answerGrades, setAnswerGrades] = useState<
    Array<{ answerId: string; points: number; feedback: string }>
  >([]);

  useEffect(() => {
    if (submission.type !== "project" && submission.answers) {
      setAnswerGrades(
        submission.answers.map((answer) => ({
          answerId: answer.id,
          points: answer.points,
          feedback: answer.feedback || "",
        }))
      );
    }
  }, [submission]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submission.type === "project") {
      onSubmit(submission.id, score, feedback);
    } else {
      const totalScore = answerGrades.reduce(
        (sum, grade) => sum + grade.points,
        0
      );
      onSubmit(submission.id, totalScore, feedback, answerGrades);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">{submission.itemTitle}</h3>
        <p className="text-gray-600">
          Student: {submission.user.name} ({submission.user.class})
        </p>
        <p className="text-gray-600">Max Points: {submission.maxPoints}</p>
      </div>

      {submission.type === "project" ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Score (out of {submission.maxPoints})
            </label>
            <input
              type="number"
              min="0"
              max={submission.maxPoints}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h4 className="font-semibold">Grade Individual Questions:</h4>
          {submission.answers?.map((answer, index) => (
            <div key={answer.id} className="border rounded-lg p-4">
              <h5 className="font-medium mb-2">
                Question {index + 1} ({answer.question.points} points)
              </h5>
              <p className="mb-2">{answer.question.question}</p>
              <p className="mb-2 text-gray-700">
                <strong>Answer:</strong> {answer.answer}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Points
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={answer.question.points}
                    value={answerGrades[index]?.points || 0}
                    onChange={(e) => {
                      const newGrades = [...answerGrades];
                      newGrades[index] = {
                        ...newGrades[index],
                        points: Number(e.target.value),
                      };
                      setAnswerGrades(newGrades);
                    }}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Feedback
                  </label>
                  <input
                    type="text"
                    value={answerGrades[index]?.feedback || ""}
                    onChange={(e) => {
                      const newGrades = [...answerGrades];
                      newGrades[index] = {
                        ...newGrades[index],
                        feedback: e.target.value,
                      };
                      setAnswerGrades(newGrades);
                    }}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Optional feedback for this question"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">
          Overall Feedback
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg h-24"
          placeholder="Provide feedback to the student..."
          required
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => setScore(0)}
          className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Grading..." : "Submit Grade"}
        </button>
      </div>
    </form>
  );
}
