import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Add authentication check for admin users if needed
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const courseData = await request.json();

    // Validate required fields
    if (!courseData.name || !courseData.description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    // Create the course
    const course = await prisma.course.create({
      data: {
        name: courseData.name,
        description: courseData.description,
        icon: courseData.icon || "📚",
        duration: courseData.duration || "4 weeks",
        lessons: courseData.lessons || 0,
        difficulty: courseData.difficulty || "Beginner",
        order: courseData.order || 1,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: {
            lessons_rel: true,
            practices: true,
            enrollments: true,
          },
        },
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
