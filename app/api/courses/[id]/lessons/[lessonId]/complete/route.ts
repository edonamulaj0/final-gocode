import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(
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

    // Verify the lesson exists and belongs to the course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson || lesson.courseId !== id) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Check if already completed
    const existingCompletion = await prisma.lessonCompletion.findUnique({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lessonId,
        },
      },
    });

    if (existingCompletion) {
      return NextResponse.json(
        { message: "Lesson already completed" },
        { status: 200 }
      );
    }

    // Mark lesson as complete
    const completion = await prisma.lessonCompletion.create({
      data: {
        userId: session.user.id,
        lessonId: lessonId,
      },
    });

    // Update overall course progress
    const totalLessons = await prisma.lesson.count({
      where: { courseId: id },
    });

    const completedLessons = await prisma.lessonCompletion.count({
      where: {
        userId: session.user.id,
        lesson: { courseId: id },
      },
    });

    const progressPercentage = Math.round(
      (completedLessons / totalLessons) * 100
    );

    // Update user progress
    await prisma.userProgress.upsert({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: id,
        },
      },
      update: {
        progress: progressPercentage,
      },
      create: {
        userId: session.user.id,
        courseId: id,
        progress: progressPercentage,
      },
    });

    // Check if course is now complete
    if (progressPercentage === 100) {
      await prisma.courseEnrollment.update({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: id,
          },
        },
        data: {
          isCompleted: true,
          completedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      completion,
      progress: progressPercentage,
      isCompleted: progressPercentage === 100,
    });
  } catch (error) {
    console.error("Error marking lesson as complete:", error);
    return NextResponse.json(
      { error: "Failed to mark lesson as complete" },
      { status: 500 }
    );
  }
}
