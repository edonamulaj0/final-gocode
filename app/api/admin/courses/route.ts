import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch courses",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("Creating course with data:", body);

    const lastCourse = await prisma.course.findFirst({
      orderBy: { order: "desc" },
    });

    const nextOrder = (lastCourse?.order || 0) + 1;

    const newCourse = await prisma.course.create({
      data: {
        name: body.name,
        description: body.description || "",
        icon: body.icon || "📚",
        duration: body.duration || "4 weeks",
        difficulty: body.difficulty || "Beginner",
        order: nextOrder,
        isUnlocked: false, // Add this field that was missing
      },
    });

    console.log("Created course:", newCourse);
    return NextResponse.json(newCourse);
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      {
        error: "Failed to create course",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
