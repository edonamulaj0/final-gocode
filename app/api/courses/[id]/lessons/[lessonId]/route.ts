import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  try {
    const { id, lessonId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is enrolled in the course
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: id,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Not enrolled in this course" },
        { status: 403 }
      );
    }

    // Get the lesson
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: { id: true, name: true, icon: true },
        },
      },
    });

    if (!lesson || lesson.courseId !== id) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Check if user can access this lesson (previous lessons must be completed)
    if (lesson.order > 1) {
      const previousLessons = await prisma.lesson.findMany({
        where: {
          courseId: id,
          order: { lt: lesson.order },
        },
      });

      const completedLessons = await prisma.lessonCompletion.findMany({
        where: {
          userId: session.user.id,
          lessonId: { in: previousLessons.map((l) => l.id) },
        },
      });

      if (completedLessons.length < previousLessons.length) {
        return NextResponse.json(
          { error: "Previous lessons must be completed first" },
          { status: 403 }
        );
      }
    }

    // Check if lesson is completed
    const completion = await prisma.lessonCompletion.findUnique({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lesson.id,
        },
      },
    });

    // Get next and previous lessons
    const nextLesson = await prisma.lesson.findFirst({
      where: {
        courseId: id,
        order: lesson.order + 1,
      },
      select: { id: true, title: true },
    });

    const previousLesson = await prisma.lesson.findFirst({
      where: {
        courseId: id,
        order: lesson.order - 1,
      },
      select: { id: true, title: true },
    });

    const lessonData = {
      lesson: {
        ...lesson,
        isCompleted: !!completion,
      },
      course: lesson.course,
      nextLesson,
      previousLesson,
      canAccess: true,
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
