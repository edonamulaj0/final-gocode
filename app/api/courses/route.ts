import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const courses = await prisma.course.findMany({
      where: {
        isUnlocked: true, // Only show unlocked courses to users
      },
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { lessons_rel: true },
        },
      },
    });

    let coursesWithProgress = courses;

    if (session?.user?.id) {
      const userProgress = await prisma.userProgress.findMany({
        where: { userId: session.user.id },
      });

      const enrollments = await prisma.courseEnrollment.findMany({
        where: { userId: session.user.id },
      });

      coursesWithProgress = courses.map((course) => {
        const progress = userProgress.find((p) => p.courseId === course.id);
        const enrollment = enrollments.find((e) => e.courseId === course.id);

        return {
          ...course,
          lessons: course._count.lessons_rel,
          progress: progress?.progress || 0,
          isEnrolled: !!enrollment,
          isCompleted: enrollment?.isCompleted || false,
        };
      });
    } else {
      coursesWithProgress = courses.map((course) => ({
        ...course,
        lessons: course._count.lessons_rel,
        progress: 0,
        isEnrolled: false,
        isCompleted: false,
      }));
    }

    return NextResponse.json(coursesWithProgress);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { courseId } = await request.json();

    // Debug logging
    console.log("Enrollment attempt:", {
      userId: session.user.id,
      courseId: courseId,
      userEmail: session.user.email,
    });

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      console.log("User not found:", session.user.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      console.log("Course not found:", courseId);
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      );
    }

    // Create enrollment
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId: session.user.id,
        courseId: courseId,
      },
    });

    // Create initial progress
    await prisma.userProgress.create({
      data: {
        userId: session.user.id,
        courseId: courseId,
        progress: 0,
      },
    });

    return NextResponse.json(enrollment);
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return NextResponse.json(
      { error: "Failed to enroll in course" },
      { status: 500 }
    );
  }
}
