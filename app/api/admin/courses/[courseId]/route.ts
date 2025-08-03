import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> } // Match filename
) {
  try {
    const { courseId } = await params; // Use courseId

    const course = await prisma.course.findUnique({
      where: { id: courseId }, // Map to id for Prisma
      include: {
        lessons: { orderBy: { order: "asc" } },
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: { orderBy: { order: "asc" } },
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
      {
        error: "Failed to fetch course",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const body = await request.json();

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        name: body.name,
        description: body.description,
        icon: body.icon,
        duration: body.duration,
        difficulty: body.difficulty,
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      {
        error: "Failed to update course",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      {
        error: "Failed to delete course",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
