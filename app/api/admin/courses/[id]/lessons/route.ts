import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const courseId = resolvedParams.id;

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const lessonData = await request.json();
    const courseId = resolvedParams.id;

    // Validate required fields
    if (!lessonData.title || !lessonData.content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Create the lesson
    const lesson = await prisma.lesson.create({
      data: {
        title: lessonData.title,
        content: lessonData.content,
        order: lessonData.order || 1,
        courseId: courseId,
        isPublished: lessonData.isPublished ?? true,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}
