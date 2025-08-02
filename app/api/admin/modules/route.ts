import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Type for module data
interface ModuleData {
  id: string;
  name: string;
  description?: string;
  order: number;
  courseId: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Type assertion to access module properties until Prisma client is properly generated
interface ExtendedPrismaClient {
  module: {
    findMany: (args?: unknown) => Promise<ModuleData[]>;
    findFirst: (args?: unknown) => Promise<ModuleData | null>;
    create: (args?: unknown) => Promise<ModuleData>;
    update: (args?: unknown) => Promise<ModuleData>;
    delete: (args?: unknown) => Promise<ModuleData>;
  };
}

const extendedPrisma = prisma as typeof prisma & ExtendedPrismaClient;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.email !== "admin@example.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    // Try accessing module with different casing
    const modules = await extendedPrisma.module.findMany({
      where: courseId ? { courseId } : {},
      include: {
        course: {
          select: { name: true },
        },
        _count: {
          select: {
            lessons: true,
            practiceQuests: true,
          },
        },
      },
      orderBy: [{ courseId: "asc" }, { order: "asc" }],
    });

    return NextResponse.json(modules);
  } catch (error) {
    console.error("Error fetching modules:", error);
    return NextResponse.json(
      { error: "Failed to fetch modules" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.email !== "admin@example.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, courseId, order } = body;

    if (!name || !courseId) {
      return NextResponse.json(
        { error: "Name and courseId are required" },
        { status: 400 }
      );
    }

    // If no order specified, get the next order number
    let moduleOrder = order;
    if (!moduleOrder) {
      const lastModule = await extendedPrisma.module.findFirst({
        where: { courseId },
        orderBy: { order: "desc" },
      });
      moduleOrder = (lastModule?.order || 0) + 1;
    }

    const newModule = await extendedPrisma.module.create({
      data: {
        name,
        description,
        courseId,
        order: moduleOrder,
      },
      include: {
        course: {
          select: { name: true },
        },
        _count: {
          select: {
            lessons: true,
            practiceQuests: true,
          },
        },
      },
    });

    return NextResponse.json(newModule, { status: 201 });
  } catch (error) {
    console.error("Error creating module:", error);
    return NextResponse.json(
      { error: "Failed to create module" },
      { status: 500 }
    );
  }
}
