import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courses = await prisma.course.findMany({
      orderBy: { order: "asc" },
      include: {
        modules: {
          select: {
            id: true,
            name: true,
            order: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      name,
      description,
      icon = "📚",
      duration = "4 weeks",
      difficulty = "Beginner",
    } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Course name is required" },
        { status: 400 }
      );
    }

    // Get the next order number - keep as number
    const lastCourse = await prisma.course.findFirst({
      orderBy: { order: "desc" },
    });

    // Keep as number since schema expects number
    const nextOrder = (lastCourse?.order || 0) + 1;

    const course = await prisma.course.create({
      data: {
        name,
        description: description || "",
        icon,
        order: nextOrder, // Number
        duration,
        difficulty,
        lessons: 0, // Number (starting with 0 lessons)
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Failed to create course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
  
    );
  }
}
