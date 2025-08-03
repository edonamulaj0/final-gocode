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

    const modules = await prisma.module.findMany({
      include: {
        course: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ courseId: "asc" }, { order: "asc" }],
    });

    return NextResponse.json(modules);
  } catch (error) {
    console.error("Failed to fetch modules:", error);
    return NextResponse.json(
      { error: "Failed to fetch modules" },
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

    const { name, description, courseId, order } = await request.json();

    if (!name || !courseId) {
      return NextResponse.json(
        { error: "Name and courseId are required" },
        { status: 400 }
      );
    }

    // Get the next order number if not provided
    let moduleOrder = order;
    if (!moduleOrder) {
      const lastModule = await prisma.module.findFirst({
        where: { courseId },
        orderBy: { order: "desc" },
      });
      moduleOrder = (lastModule?.order || 0) + 1;
    }

    const newModule = await prisma.module.create({
      data: {
        name,
        description: description || "",
        courseId,
        order: moduleOrder,
        isPublished: true,
      },
      include: {
        course: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(newModule, { status: 201 });
  } catch (error) {
    console.error("Failed to create module:", error);
    return NextResponse.json(
      { error: "Failed to create module" },
      { status: 500 }
    );
  }
}
