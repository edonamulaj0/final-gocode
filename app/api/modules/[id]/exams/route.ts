import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET module exams for a specific module
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const moduleId = resolvedParams.id;

    // Check if user can access this module
    const moduleData = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        course: {
          include: {
            enrollments: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    });

    if (!moduleData || !moduleData.course.enrollments.length) {
      return NextResponse.json(
        { error: "Module not found or not enrolled" },
        { status: 404 }
      );
    }

    // Check if user can access this module (previous modules completed)
    const canAccess = await checkModuleAccess(session.user.id, moduleId);
    if (!canAccess) {
      return NextResponse.json(
        { error: "Previous modules must be completed first" },
        { status: 403 }
      );
    }

    // Check if all lessons and practice questions are completed before allowing exam access
    const canTakeExam = await checkExamEligibility(session.user.id, moduleId);
    if (!canTakeExam) {
      return NextResponse.json(
        { error: "Complete all lessons and practice questions first" },
        { status: 403 }
      );
    }

    const moduleExams = await prisma.moduleExam.findMany({
      where: { moduleId },
      include: {
        questions: {
          include: {
            options: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        submissions: {
          where: { userId: session.user.id },
        },
      },
    });

    // Map exams with user submission data (hide correct answers until submitted)
    const examsWithSubmissions = moduleExams.map((exam) => ({
      ...exam,
      userSubmission: exam.submissions[0] || null,
      isCompleted: exam.submissions.length > 0,
      canTake: exam.submissions.length === 0, // Can only take once
      questions: exam.questions.map((question) => ({
        ...question,
        options: question.options.map((option) => ({
          ...option,
          isCorrect: undefined, // Hide correct answers
        })),
      })),
    }));

    return NextResponse.json(examsWithSubmissions);
  } catch (error) {
    console.error("Error fetching module exams:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new module exam (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const moduleId = resolvedParams.id;
    const body = await request.json();
    const {
      title,
      description,
      passingScore = 70,
      timeLimit,
      questions = [],
    } = body;

    const moduleExam = await prisma.moduleExam.create({
      data: {
        title,
        description,
        moduleId,
        passingScore,
        timeLimit,
        questions: {
          create: questions.map((q: { question: string; type: string; points?: number; options?: Array<{ text: string; isCorrect: boolean }> }, index: number) => ({
            question: q.question,
            type: q.type,
            points: q.points || 1,
            order: index + 1,
            options: {
              create:
                q.options?.map((option: { text: string; isCorrect: boolean }, optIndex: number) => ({
                  text: option.text,
                  isCorrect: option.isCorrect,
                  order: optIndex + 1,
                })) || [],
            },
          })),
        },
      },
      include: {
        questions: {
          include: {
            options: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(moduleExam, { status: 201 });
  } catch (error) {
    console.error("Error creating module exam:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function checkModuleAccess(
  userId: string,
  moduleId: string
): Promise<boolean> {
  const moduleData = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!moduleData) return false;

  // Find the current module's position
  const currentModuleIndex = moduleData.course.modules.findIndex(
    (m) => m.id === moduleId
  );

  // Check if all previous modules are completed
  for (let i = 0; i < currentModuleIndex; i++) {
    const previousModule = moduleData.course.modules[i];
    const completion = await prisma.moduleCompletion.findUnique({
      where: {
        userId_moduleId: {
          userId,
          moduleId: previousModule.id,
        },
      },
    });

    if (!completion) return false;
  }

  return true;
}

async function checkExamEligibility(
  userId: string,
  moduleId: string
): Promise<boolean> {
  // Get all lessons and practice questions for the module
  const moduleData = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      lessons: true,
      practiceQuestions: true,
    },
  });

  if (!moduleData) return false;

  // Check lesson completions
  const lessonCompletions = await prisma.lessonCompletion.findMany({
    where: {
      userId,
      lesson: {
        moduleId,
      },
    },
  });

  // Check practice question submissions
  const practiceSubmissions = await prisma.practiceQuestionSubmission.findMany({
    where: {
      userId,
      question: {
        moduleId,
      },
    },
  });

  const allLessonsCompleted =
    lessonCompletions.length === moduleData.lessons.length;
  const allPracticeQuestionsCompleted =
    practiceSubmissions.length === moduleData.practiceQuestions.length;

  return allLessonsCompleted && allPracticeQuestionsCompleted;
}
