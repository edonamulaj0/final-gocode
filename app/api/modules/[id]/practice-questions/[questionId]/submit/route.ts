import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// POST submit answer to practice question
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionId } = await params;
    const body = await request.json();
    const { answer } = body;

    // Get the practice question with options
    const question = await prisma.practiceQuestion.findUnique({
      where: { id: questionId },
      include: {
        options: true,
        module: {
          include: {
            course: {
              include: {
                enrollments: {
                  where: { userId: session.user.id },
                },
              },
            },
          },
        },
      },
    });

    if (!question || !question.module.course.enrollments.length) {
      return NextResponse.json(
        { error: "Question not found or not enrolled" },
        { status: 404 }
      );
    }

    // Check if user can access this module
    const canAccess = await checkModuleAccess(
      session.user.id,
      question.moduleId
    );
    if (!canAccess) {
      return NextResponse.json(
        { error: "Previous modules must be completed first" },
        { status: 403 }
      );
    }

    // Check if already submitted
    const existingSubmission =
      await prisma.practiceQuestionSubmission.findUnique({
        where: {
          userId_questionId: {
            userId: session.user.id,
            questionId,
          },
        },
      });

    if (existingSubmission) {
      return NextResponse.json({ error: "Already submitted" }, { status: 400 });
    }

    // Determine if answer is correct and calculate points
    let isCorrect = false;
    let points = 0;

    if (question.type === "multiple_choice") {
      const selectedOption = question.options.find(
        (opt: { id: string; isCorrect: boolean }) => opt.id === answer
      );
      isCorrect = selectedOption?.isCorrect || false;
    } else if (question.type === "true_false") {
      const correctOption = question.options.find(
        (opt: { isCorrect: boolean; text: string }) => opt.isCorrect
      );
      isCorrect = answer === correctOption?.text;
    } else if (question.type === "coding") {
      // For coding questions, manual grading would be required
      // For now, we'll set it as submitted but not graded
      isCorrect = false; // Will be graded by admin
    }

    if (isCorrect) {
      points = question.points;
    }

    // Create submission
    const submission = await prisma.practiceQuestionSubmission.create({
      data: {
        userId: session.user.id,
        questionId,
        answer,
        isCorrect,
        points,
      },
    });

    // Create grade record
    await prisma.grade.create({
      data: {
        userId: session.user.id,
        moduleId: question.moduleId,
        itemType: "practice_question",
        itemId: questionId,
        score: points,
        maxScore: question.points,
        percentage: (points / question.points) * 100,
        passed: isCorrect,
      },
    });

    // Check if all practice questions in module are completed
    await checkAndCompleteModule(session.user.id, question.moduleId);

    return NextResponse.json({
      submission,
      isCorrect,
      points,
      correctAnswer: question.options.find(
        (opt: { isCorrect: boolean }) => opt.isCorrect
      ),
    });
  } catch (error) {
    console.error("Error submitting practice question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ...existing code...

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

async function checkAndCompleteModule(userId: string, moduleId: string) {
  // Get all required items for module completion
  const moduleData = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      lessons: true,
      practiceQuestions: true,
      moduleExams: true,
    },
  });

  if (!moduleData) return;

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

  // Check module exam submissions (must be passed)
  const examSubmissions = await prisma.moduleExamSubmission.findMany({
    where: {
      userId,
      exam: {
        moduleId,
      },
      passed: true,
    },
  });

  // Check if all requirements are met
  const allLessonsCompleted =
    lessonCompletions.length === moduleData.lessons.length;
  const allPracticeQuestionsCompleted =
    practiceSubmissions.length === moduleData.practiceQuestions.length;
  const allExamsPassed =
    examSubmissions.length === moduleData.moduleExams.length;

  if (allLessonsCompleted && allPracticeQuestionsCompleted && allExamsPassed) {
    // Mark module as completed
    await prisma.moduleCompletion.upsert({
      where: {
        userId_moduleId: {
          userId,
          moduleId,
        },
      },
      update: {},
      create: {
        userId,
        moduleId,
      },
    });
  }
}
