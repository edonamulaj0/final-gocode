import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Type assertion to access module properties until Prisma client is properly generated
interface ExtendedPrismaClient {
  module: {
    findMany: (args?: unknown) => Promise<unknown[]>;
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

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        lessons_rel: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Fetch modules separately
    const modules = await extendedPrisma.module.findMany({
      where: { courseId: id },
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    let isEnrolled = false;
    let lessonsWithCompletion = course.lessons_rel;

    if (session?.user?.id) {
      // Check enrollment
      const enrollment = await prisma.courseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: course.id,
          },
        },
      });

      isEnrolled = !!enrollment;

      if (isEnrolled) {
        // Get lesson completions for direct course lessons only
        const directLessonCompletions = await prisma.lessonCompletion.findMany({
          where: {
            userId: session.user.id,
            lesson: {
              courseId: course.id,
            },
          },
        });

        const completionMap = new Map(
          directLessonCompletions.map((c) => [c.lessonId, true])
        );

        // Update direct course lessons with completion status
        lessonsWithCompletion = course.lessons_rel.map((lesson) => ({
          ...lesson,
          isCompleted: completionMap.has(lesson.id),
        }));
      }
    }

    const courseData = {
      ...course,
      lessons: lessonsWithCompletion,
      modules: modules, // Include the actual modules data
      isEnrolled,
    };

    return NextResponse.json(courseData);
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}
