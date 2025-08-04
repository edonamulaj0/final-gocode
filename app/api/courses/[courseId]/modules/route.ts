import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { courseId } = await params;

    // Fetch course with modules and lessons
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: session?.user?.id
              ? {
                  include: {
                    completions: {
                      where: { userId: session.user.id },
                    },
                  },
                  orderBy: { order: "asc" },
                }
              : {
                  orderBy: { order: "asc" },
                },
          },
          orderBy: { order: "asc" },
        },
        lessons: session?.user?.id
          ? {
              include: {
                completions: {
                  where: { userId: session.user.id },
                },
              },
              orderBy: { order: "asc" },
            }
          : {
              orderBy: { order: "asc" },
            },
        enrollments: session?.user?.id
          ? {
              where: { userId: session.user.id },
            }
          : false,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if user is enrolled
    const isEnrolled =
      session?.user?.id && course.enrollments
        ? course.enrollments.length > 0
        : false;

    // Process lessons to add isCompleted flag
    const processedLessons = course.lessons.map((lesson) => ({
      ...lesson,
      isCompleted:
        "completions" in lesson ? lesson.completions.length > 0 : false,
      completions: undefined,
    }));

    // Process modules and their lessons
    const processedModules = course.modules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) => ({
        ...lesson,
        isCompleted:
          "completions" in lesson ? lesson.completions.length > 0 : false,
        completions: undefined,
      })),
    }));

    const result = {
      ...course,
      isEnrolled,
      lessons: processedLessons,
      modules: processedModules,
      enrollments: undefined,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching course modules:", error);
    return NextResponse.json(
      { error: "Failed to fetch course modules" },
      { status: 500 }
    );
  }
}
