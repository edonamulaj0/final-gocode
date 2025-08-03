import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params;
    const lessons = await prisma.lesson.findMany({
      where: { moduleId },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(lessons);
  } catch{
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params;
    const body = await request.json();

    const lastLesson = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { order: "desc" },
    });

    const newLesson = await prisma.lesson.create({
      data: {
        title: body.name,
        content: body.content || "",
        type: body.type || "theory",
        moduleId,
        order: (lastLesson?.order || 0) + 1,
        isPublished: true,
      },
    });

    return NextResponse.json(newLesson);
  } catch {
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}
