// app/api/admin/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin (add your admin check logic here)
    // if (!session.user.isAdmin) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { error: "Course name is required" },
        { status: 400 }
      );
    }

    // Get the last course order
    const lastCourse = await prisma.course.findFirst({
      orderBy: { order: "desc" },
    });
    const nextOrder = (lastCourse?.order || 0) + 1;

    // Create course without lessons initially
    const newCourse = await prisma.course.create({
      data: {
        name: body.name,
        description: body.description || "",
        icon: body.icon || "📚",
        duration: body.duration || "",
        difficulty: body.difficulty || "Beginner",
        order: nextOrder,
        isUnlocked: body.isUnlocked || false,
        // Don't include lessons here - they'll be created separately
      },
      include: {
        lessons: true,
        modules: true,
        _count: {
          select: {
            lessons: true,
            enrollments: true,
          },
        },
      },
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);

    if (error instanceof Error) {
      // Handle Prisma errors specifically
      if ("code" in error) {
        console.error("Prisma error code:", error.code);

        if (error.code === "P2002") {
          return NextResponse.json(
            { error: "A course with this name already exists" },
            { status: 409 }
          );
        }

        if (error.code === "P2011") {
          return NextResponse.json(
            { error: "Required field missing or null constraint violation" },
            { status: 400 }
          );
        }
      }

      return NextResponse.json(
        {
          error: "Failed to create course",
          details:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all courses for admin view
    const courses = await prisma.course.findMany({
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
        modules: {
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            lessons: true,
            enrollments: true,
          },
        },
      },
      orderBy: { order: "asc" },
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
