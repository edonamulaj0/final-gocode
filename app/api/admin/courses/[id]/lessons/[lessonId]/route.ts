import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
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
    const lessonData = await request.json();
    const lessonId = resolvedParams.lessonId;

    // Validate required fields
    if (!lessonData.title || !lessonData.content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Update the lesson
    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: lessonData.title,
        content: lessonData.content,
        order: lessonData.order || 1,
        isPublished: lessonData.isPublished ?? true,
      },
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Error updating lesson:", error);
    return NextResponse.json(
      { error: "Failed to update lesson" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
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
    const lessonId = resolvedParams.lessonId;

    // Delete the lesson
    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    return NextResponse.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  try {
    const resolvedParams = await params;
    const lessonId = resolvedParams.lessonId;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: true,
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson" },
      { status: 500 }
    );
  }
}
