import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: courseId, lessonId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is enrolled in the course
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Not enrolled in course" },
        { status: 403 }
      );
    }

    // Fetch lesson data
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        completions: {
          where: { userId: session.user.id },
        },
        course: true,
        module: true,
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Check if lesson belongs to the course (either directly or through module)
    const belongsToCourse =
      lesson.courseId === courseId || lesson.module?.courseId === courseId;

    if (!belongsToCourse) {
      return NextResponse.json(
        { error: "Lesson not found in this course" },
        { status: 404 }
      );
    }

    // Get all lessons in the course to check access
    const allLessons = await prisma.lesson.findMany({
      where: {
        OR: [{ courseId: courseId }, { module: { courseId: courseId } }],
      },
      include: {
        completions: {
          where: { userId: session.user.id },
        },
      },
      orderBy: { order: "asc" },
    });

    // Check if lesson is accessible (first lesson or previous lesson completed)
    const currentLessonIndex = allLessons.findIndex((l) => l.id === lessonId);
    const isAccessible =
      currentLessonIndex === 0 ||
      (currentLessonIndex > 0 &&
        allLessons[currentLessonIndex - 1].completions.length > 0);

    if (!isAccessible) {
      return NextResponse.json(
        {
          error: "Lesson is locked. Complete previous lessons first.",
        },
        { status: 403 }
      );
    }

    // Return lesson data
    const lessonData = {
      lesson: {
        ...lesson,
        isCompleted: lesson.completions.length > 0,
        completions: undefined, // Remove this from response but keep course and module
      },
      nextLesson:
        currentLessonIndex < allLessons.length - 1
          ? allLessons[currentLessonIndex + 1]
          : null,
      previousLesson:
        currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null,
    };

    return NextResponse.json(lessonData);
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: courseId, lessonId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mark lesson as completed
    const completion = await prisma.lessonCompletion.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lessonId,
        },
      },
      update: {
        completedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        lessonId: lessonId,
      },
    });

    // Update course progress
    const totalLessons = await prisma.lesson.count({
      where: {
        OR: [{ courseId: courseId }, { module: { courseId: courseId } }],
      },
    });

    const completedLessons = await prisma.lessonCompletion.count({
      where: {
        userId: session.user.id,
        lesson: {
          OR: [{ courseId: courseId }, { module: { courseId: courseId } }],
        },
      },
    });

    const progressPercentage = Math.round(
      (completedLessons / totalLessons) * 100
    );

    await prisma.userProgress.upsert({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId,
        },
      },
      update: {
        progress: progressPercentage,
      },
      create: {
        userId: session.user.id,
        courseId: courseId,
        progress: progressPercentage,
      },
    });

    return NextResponse.json({
      message: "Lesson marked as completed",
      completion,
      progress: progressPercentage,
    });
  } catch (error) {
    console.error("Error completing lesson:", error);
    return NextResponse.json(
      { error: "Failed to complete lesson" },
      { status: 500 }
    );
  }
}
