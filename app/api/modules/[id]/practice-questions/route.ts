import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET practice questions for a module
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
    const canAccess = await checkModuleAccess(session.user.id, moduleId);
    if (!canAccess) {
      return NextResponse.json(
        { error: "Previous modules must be completed first" },
        { status: 403 }
      );
    }

    const practiceQuestions = await prisma.practiceQuestion.findMany({
      where: {
        moduleId,
      },
      include: {
        options: true,
        submissions: {
          where: {
            userId: session.user.id,
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(practiceQuestions);
  } catch (error) {
    console.error("Error fetching practice questions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new practice question (admin only)
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const resolvedParams = await params;
    const moduleId = resolvedParams.id;
    const body = await request.json();
    const { title, question, type, options, points = 10 } = body;

    // Get the next order number
    const lastQuestion = await prisma.practiceQuestion.findFirst({
      where: { moduleId },
      orderBy: { order: "desc" },
    });
    const nextOrder = (lastQuestion?.order || 0) + 1;

    const practiceQuestion = await prisma.practiceQuestion.create({
      data: {
        title,
        question,
        type,
        moduleId,
        order: nextOrder,
        points,
        options: {
          create: options.map(
            (option: { text: string; isCorrect: boolean; order: number }) => ({
              text: option.text,
              isCorrect: option.isCorrect,
              order: option.order,
            })
          ),
        },
      },
      include: {
        options: true,
      },
    });

    return NextResponse.json(practiceQuestion, { status: 201 });
  } catch (error) {
    console.error("Error creating practice question:", error);
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

  const currentModuleIndex = moduleData.course.modules.findIndex(
    (m) => m.id === moduleId
  );

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
