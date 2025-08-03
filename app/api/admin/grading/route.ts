import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Types for submissions
interface ProjectSubmissionWithDetails {
  id: string;
  submittedAt: Date;
  status: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    class: string | null;
  };
  project: {
    id: string;
    title: string;
    points: number;
  };
}

interface ExamSubmissionWithDetails {
  id: string;
  submittedAt: Date;
  gradedAt: Date | null;
  totalPoints: number;
  user: {
    id: string;
    name: string | null;
    email: string;
    class: string | null;
  };
  exam: {
    id: string;
    title: string;
  };
  answers: Array<{
    question: {
      id: string;
      question: string;
      type: string;
      points: number;
    };
  }>;
}

// GET all submissions that need grading
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "all"; // all, projects, exams, coding_questions

    const submissions: Array<{
      id: string;
      type: string;
      itemTitle: string;
      maxPoints: number;
      [key: string]: unknown;
    }> = [];

    if (type === "all" || type === "projects") {
      // Get project submissions that need grading
      const projectSubmissions = await prisma.projectSubmission.findMany({
        where: {
          OR: [{ status: "submitted" }, { status: "revision_needed" }],
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, class: true },
          },
          project: {
            select: { id: true, title: true, points: true },
          },
        },
        orderBy: { submittedAt: "asc" },
      });

      submissions.push(
        ...projectSubmissions.map((sub: ProjectSubmissionWithDetails) => ({
          ...sub,
          type: "project",
          itemTitle: sub.project.title,
          maxPoints: sub.project.points,
        }))
      );
    }

    if (type === "all" || type === "exams") {
      // Get module exam submissions that need grading (essays/coding questions)
      const moduleExamSubmissions = await prisma.moduleExamSubmission.findMany({
        where: {
          gradedAt: null,
          exam: {
            questions: {
              some: {
                type: {
                  in: ["essay", "coding"],
                },
              },
            },
          },
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, class: true },
          },
          exam: {
            select: { id: true, title: true },
          },
          answers: {
            include: {
              question: {
                select: { id: true, question: true, type: true, points: true },
              },
            },
          },
        },
        orderBy: { submittedAt: "asc" },
      });

      submissions.push(
        ...moduleExamSubmissions.map((sub: ExamSubmissionWithDetails) => ({
          ...sub,
          type: "module_exam",
          itemTitle: sub.exam.title,
          maxPoints: sub.totalPoints,
        }))
      );

      // Get final exam submissions that need grading
      const finalExamSubmissions = await prisma.finalExamSubmission.findMany({
        where: {
          gradedAt: null,
          exam: {
            questions: {
              some: {
                type: {
                  in: ["essay", "coding"],
                },
              },
            },
          },
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, class: true },
          },
          exam: {
            select: { id: true, title: true },
          },
          answers: {
            include: {
              question: {
                select: { id: true, question: true, type: true, points: true },
              },
            },
          },
        },
        orderBy: { submittedAt: "asc" },
      });

      submissions.push(
        ...finalExamSubmissions.map((sub: ExamSubmissionWithDetails) => ({
          ...sub,
          type: "final_exam",
          itemTitle: sub.exam.title,
          maxPoints: sub.totalPoints,
        }))
      );
    }

    return NextResponse.json({
      submissions,
      total: submissions.length,
    });
  } catch (error) {
    console.error("Error fetching submissions for grading:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST grade a submission
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      submissionId,
      type,
      feedback,
      answerGrades, // For exam questions: [{ answerId, points, feedback }]
    } = body;
    let { score } = body;

    if (type === "project") {
      const submission = await prisma.projectSubmission.findUnique({
        where: { id: submissionId },
        include: { project: true },
      });

      if (!submission) {
        return NextResponse.json(
          { error: "Submission not found" },
          { status: 404 }
        );
      }

      const passed = score >= submission.project.points * 0.6; // 60% to pass

      await prisma.projectSubmission.update({
        where: { id: submissionId },
        data: {
          score,
          feedback,
          gradedAt: new Date(),
          gradedBy: session.user.id,
          status: "graded",
        },
      });

      // Create grade record
      await prisma.grade.create({
        data: {
          userId: submission.userId,
          itemType: "project",
          itemId: submission.projectId,
          score,
          maxScore: submission.project.points,
          percentage: (score / submission.project.points) * 100,
          passed,
          gradedBy: session.user.id,
          feedback,
        },
      });
    } else if (type === "module_exam" || type === "final_exam") {
      // Handle exam submissions separately to avoid union type issues
      let submission: {
        userId: string;
        examId: string;
        totalPoints: number;
        exam: { passingScore: number };
      } | null;
      
      if (type === "module_exam") {
        submission = await prisma.moduleExamSubmission.findUnique({
          where: { id: submissionId },
          include: {
            exam: true,
            answers: true,
          },
        });
      } else {
        submission = await prisma.finalExamSubmission.findUnique({
          where: { id: submissionId },
          include: {
            exam: true,
            answers: true,
          },
        });
      }

      if (!submission) {
        return NextResponse.json(
          { error: "Submission not found" },
          { status: 404 }
        );
      }

      // Update individual answer grades if provided
      if (answerGrades && answerGrades.length > 0) {
        for (const answerGrade of answerGrades) {
          if (type === "module_exam") {
            await prisma.examAnswer.update({
              where: { id: answerGrade.answerId },
              data: {
                points: answerGrade.points,
                feedback: answerGrade.feedback,
              },
            });
          } else {
            await prisma.finalExamAnswer.update({
              where: { id: answerGrade.answerId },
              data: {
                points: answerGrade.points,
                feedback: answerGrade.feedback,
              },
            });
          }
        }

        // Recalculate total score
        const updatedAnswers = type === "module_exam"
          ? await prisma.examAnswer.findMany({ where: { submissionId } })
          : await prisma.finalExamAnswer.findMany({ where: { submissionId } });
        const totalScore = updatedAnswers.reduce(
          (sum: number, answer: { points: number }) => sum + answer.points,
          0
        );
        score = totalScore;
      }

      const passed =
        (score / submission.totalPoints) * 100 >= submission.exam.passingScore;

      if (type === "module_exam") {
        await prisma.moduleExamSubmission.update({
          where: { id: submissionId },
          data: {
            score,
            passed,
            feedback,
            gradedAt: new Date(),
            gradedBy: session.user.id,
          },
        });
      } else {
        await prisma.finalExamSubmission.update({
          where: { id: submissionId },
          data: {
            score,
            passed,
            feedback,
            gradedAt: new Date(),
            gradedBy: session.user.id,
          },
        });
      }

      // Create grade record
      await prisma.grade.create({
        data: {
          userId: submission.userId,
          itemType: type,
          itemId: submission.examId,
          score,
          maxScore: submission.totalPoints,
          percentage: (score / submission.totalPoints) * 100,
          passed,
          gradedBy: session.user.id,
          feedback,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error grading submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
