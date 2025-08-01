import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

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
        practices: {
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { lessons_rel: true, practices: true },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

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
        // Get lesson completions
        const completions = await prisma.lessonCompletion.findMany({
          where: {
            userId: session.user.id,
            lesson: {
              courseId: course.id,
            },
          },
        });

        const completionMap = new Map(
          completions.map((c) => [c.lessonId, true])
        );

        lessonsWithCompletion = course.lessons_rel.map((lesson) => ({
          ...lesson,
          isCompleted: completionMap.has(lesson.id),
        }));
      }
    }

    const courseData = {
      ...course,
      lessons: lessonsWithCompletion,
      practiceQuests: course.practices,
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
