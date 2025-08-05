// app/api/courses/[courseId]/lessons/[lessonId]/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { courseId, lessonId } = await params;

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
