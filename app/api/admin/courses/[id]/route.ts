import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const courseData = await request.json();
    const courseId = resolvedParams.id;

    // Validate required fields
    if (!courseData.name || !courseData.description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    // Update the course
    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        name: courseData.name,
        description: courseData.description,
        icon: courseData.icon || "📚",
        duration: courseData.duration || "4 weeks",
        lessons: courseData.lessons || 0,
        difficulty: courseData.difficulty || "Beginner",
        order: courseData.order || 1,
        ...(courseData.isUnlocked !== undefined && {
          isUnlocked: courseData.isUnlocked,
        }),
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const courseId = resolvedParams.id;

    // Delete the course (this will cascade delete lessons due to schema)
    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const courseId = resolvedParams.id;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons_rel: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            lessons_rel: true,
            practices: true,
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}
