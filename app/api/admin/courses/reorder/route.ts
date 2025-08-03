import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface CourseOrderItem {
  id: string;
  order: number;
}

export async function PUT(request: NextRequest) {
  try {
    const { courses }: { courses: CourseOrderItem[] } = await request.json();

    await Promise.all(
      courses.map((course: CourseOrderItem) =>
        prisma.course.update({
          where: { id: course.id },
          data: { order: course.order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering courses:", error);
    return NextResponse.json(
      { error: "Failed to reorder courses" },
      { status: 500 }
    );
  }
}
