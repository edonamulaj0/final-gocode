import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all courses with enrollment status for the current user
    const courses = await prisma.course.findMany({
      include: {
        lessons: {
          include: {
            completions: {
              where: { userId: session.user.id },
            },
          },
          orderBy: { order: "asc" },
        },
        modules: {
          include: {
            lessons: {
              include: {
                completions: {
                  where: { userId: session.user.id },
                },
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        enrollments: {
          where: { userId: session.user.id },
        },
        progress: {
          where: { userId: session.user.id },
        },
        _count: {
          select: {
            lessons: true,
            enrollments: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    // Process courses to add enrollment status and progress
    const processedCourses = courses.map((course) => {
      // Calculate total lessons (including module lessons)
      const directLessons = course.lessons || [];
      const moduleLessons =
        course.modules?.flatMap((module) => module.lessons || []) || [];
      const allLessons = [...directLessons, ...moduleLessons];

      // Calculate completed lessons
      const completedLessons = allLessons.filter(
        (lesson) => lesson.completions && lesson.completions.length > 0
      );

      const totalLessons = allLessons.length;
      const completedCount = completedLessons.length;
      const progressPercentage =
        totalLessons > 0
          ? Math.round((completedCount / totalLessons) * 100)
          : 0;

      return {
        id: course.id,
        name: course.name,
        description: course.description,
        icon: course.icon,
        duration: course.duration,
        difficulty: course.difficulty,
        order: course.order,
        isUnlocked: course.isUnlocked,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        isEnrolled: course.enrollments.length > 0,
        progress: course.progress[0]?.progress || progressPercentage,
        totalLessons,
        completedLessons: completedCount,
        totalEnrollments: course._count.enrollments,
        canStart: course.isUnlocked || course.enrollments.length > 0,
      };
    });

    return NextResponse.json(processedCourses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // This endpoint could be used for bulk operations or other course-related actions
    // For now, return method not allowed since individual course enrollment
    // should go through /api/courses/[courseId]
    return NextResponse.json(
      { error: "Use /api/courses/[courseId] for individual course operations" },
      { status: 405 }
    );
  } catch (error) {
    console.error("Error in courses POST:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
