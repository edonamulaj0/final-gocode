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

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;

    // Fetch course with enrollment status for the current user
    const course = await prisma.course.findUnique({
      where: { id: courseId },
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
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Process direct lessons
    const processedLessons = course.lessons.map((lesson) => ({
      ...lesson,
      isCompleted: lesson.completions.length > 0,
      completions: undefined,
    }));

    // Process modules and their lessons
    const processedModules = course.modules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) => ({
        ...lesson,
        isCompleted: lesson.completions.length > 0,
        completions: undefined,
      })),
    }));

    // Combine all lessons for progress calculation
    const allLessons = [
      ...processedLessons,
      ...processedModules.flatMap(module => module.lessons)
    ];

    return NextResponse.json({
      ...course,
      lessons: processedLessons,
      modules: processedModules,
      allLessons: allLessons, // Add this for easier access in frontend
      isEnrolled: course.enrollments.length > 0,
      enrollments: undefined,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Debug logging
    console.log("Session user ID:", session.user.id);
    console.log("Course ID:", courseId);
    console.log("User ID type:", typeof session.user.id);
    console.log("Course ID type:", typeof courseId);

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      console.error("User not found in database:", session.user.id);
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      console.error("Course not found:", courseId);
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if already enrolled
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

    console.log(
      "Creating enrollment for user:",
      session.user.id,
      "course:",
      courseId
    );

    // Create enrollment
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId: session.user.id,
        courseId: courseId,
      },
    });

    // Create initial user progress
    await prisma.userProgress.create({
      data: {
        userId: session.user.id,
        courseId: courseId,
        progress: 0,
      },
    });

    return NextResponse.json(
      {
        message: "Successfully enrolled in course",
        enrollment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error enrolling in course:", error);
    console.error("Error type:", typeof error);
    console.error("Error constructor:", error?.constructor?.name);

    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      // Check for Prisma errors
      if ("code" in error) {
        console.error("Prisma error code:", error.code);

        if (error.code === "P2003") {
          console.error(
            "Foreign key constraint failed. Details:",
            "meta" in error ? error.meta : "No meta available"
          );
          return NextResponse.json(
            {
              error:
                "Database constraint violation - user or course may not exist",
              details:
                process.env.NODE_ENV === "development" && "meta" in error
                  ? error.meta
                  : undefined,
            },
            { status: 400 }
          );
        }

        // Handle other Prisma errors
        if (error.code === "P2002") {
          return NextResponse.json(
            { error: "A record with this data already exists" },
            { status: 409 }
          );
        }
      }

      // Return the actual error message in development
      return NextResponse.json(
        {
          error: "Failed to enroll in course",
          details:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to enroll in course" },
      { status: 500 }
    );
  }
}
