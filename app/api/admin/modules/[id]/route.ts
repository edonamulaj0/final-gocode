import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Type for module data
interface ModuleData {
  id: string;
  name: string;
  description?: string;
  order: number;
  courseId: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  lessons?: LessonData[];
  course?: {
    name: string;
    description: string;
    icon: string;
  };
}

interface LessonData {
  id: string;
  title: string;
  content: string;
  order: number;
  courseId: string | null;
  moduleId: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Type assertion to access module properties until Prisma client is properly generated
interface ExtendedPrismaClient {
  module: {
    findUnique: (args?: unknown) => Promise<ModuleData | null>;
    update: (args?: unknown) => Promise<ModuleData>;
    delete: (args?: unknown) => Promise<ModuleData>;
  };
  moduleCompletion: {
    findUnique: (args?: unknown) => Promise<unknown>;
  };
}

const extendedPrisma = prisma as typeof prisma & ExtendedPrismaClient;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    const moduleData = await extendedPrisma.module.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            name: true,
            description: true,
            icon: true,
          },
        },
        lessons: {
          orderBy: { order: "asc" },
        },
        practiceQuests: {
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            lessons: true,
            practiceQuests: true,
          },
        },
      },
    });

    if (!moduleData) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    let isEnrolled = false;
    let lessonsWithCompletion = moduleData.lessons;
    let moduleProgress = { completed: false };

    if (session?.user?.id) {
      // Check course enrollment
      const enrollment = await prisma.courseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: moduleData.course ? moduleData.course.name : "",
          },
        },
      });

      isEnrolled = !!enrollment;

      if (isEnrolled) {
        // Get lesson completions for this module
        const lessonCompletions = await prisma.lessonCompletion.findMany({
          where: {
            userId: session.user.id,
            lessonId: {
              in:
                moduleData.lessons?.map((lesson: LessonData) => lesson.id) ||
                [],
            },
          },
        });

        lessonsWithCompletion = moduleData.lessons?.map(
          (lesson: LessonData) => ({
            ...lesson,
            isCompleted: lessonCompletions.some(
              (comp) => comp.lessonId === lesson.id
            ),
          })
        );

        // Check module completion
        const moduleCompletion =
          await extendedPrisma.moduleCompletion.findUnique({
            where: {
              userId_moduleId: {
                userId: session.user.id,
                moduleId: id,
              },
            },
          });

        moduleProgress = {
          completed: !!moduleCompletion,
        };
      }
    }

    return NextResponse.json({
      ...moduleData,
      lessons: lessonsWithCompletion,
      isEnrolled,
      progress: moduleProgress,
    });
  } catch (error) {
    console.error("Error fetching module:", error);
    return NextResponse.json(
      { error: "Failed to fetch module" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.email !== "admin@example.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, order, isPublished } = body;

    const updatedModule = await extendedPrisma.module.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order }),
        ...(isPublished !== undefined && { isPublished }),
      },
      include: {
        course: {
          select: { name: true },
        },
        _count: {
          select: {
            lessons: true,
            practiceQuests: true,
          },
        },
      },
    });

    return NextResponse.json(updatedModule);
  } catch (error) {
    console.error("Error updating module:", error);
    return NextResponse.json(
      { error: "Failed to update module" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.email !== "admin@example.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await extendedPrisma.module.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Module deleted successfully" });
  } catch (error) {
    console.error("Error deleting module:", error);
    return NextResponse.json(
      { error: "Failed to delete module" },
      { status: 500 }
    );
  }
}
