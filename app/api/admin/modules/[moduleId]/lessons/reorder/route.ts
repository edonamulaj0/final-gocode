import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface LessonOrderItem {
  id: string;
  order: number;
}

export async function PUT(request: NextRequest) {
  try {
    const { lessons }: { lessons: LessonOrderItem[] } = await request.json();

    // Update all lessons with their new order
    await Promise.all(
      lessons.map((lesson: LessonOrderItem, index: number) =>
        prisma.lesson.update({
          where: { id: lesson.id },
          data: { order: index + 1 },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering lessons:", error);
    return NextResponse.json(
      { error: "Failed to reorder lessons" },
      { status: 500 }
    );
  }
}
