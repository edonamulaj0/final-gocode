import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Type assertion for module access
interface ExtendedPrismaClient {
  module: {
    findMany: (args?: unknown) => Promise<unknown[]>;
  };
}

const extendedPrisma = prisma as typeof prisma & ExtendedPrismaClient;

// This endpoint is for admin access only - requires authentication
export async function GET() {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Check if user is admin (you can define your admin criteria)
    // Option 1: Check by email
    const adminEmails = ["edonaamulaj@gmail.com"]; // Replace with your actual admin email

    // Option 2: Check by class (if admin users have a specific class)
    // const isAdmin = session.user?.class === 'ADMIN';

    const isAdmin = adminEmails.includes(session.user?.email || "");

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Get all users (admin view)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        class: true,
        createdAt: true,
        enrollments: {
          include: {
            course: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get all courses with stats
    const courses = await prisma.course.findMany({
      include: {
        _count: {
          select: {
            lessons_rel: true,
            practices: true,
            enrollments: true,
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    // Get all lessons
    const lessons = await prisma.lesson.findMany({
      include: {
        course: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ courseId: "asc" }, { order: "asc" }],
    });

    // Get all enrollments
    const enrollments = await prisma.courseEnrollment.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    // Get all modules
    const modules = await extendedPrisma.module.findMany({
      include: {
        course: {
          select: {
            name: true,
          },
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

    return NextResponse.json({
      users: users,
      courses: courses,
      lessons: lessons,
      modules: modules,
      enrollments: enrollments,
      stats: {
        totalUsers: users.length,
        totalCourses: courses.length,
        totalLessons: lessons.length,
        totalModules: modules.length,
        totalEnrollments: enrollments.length,
      },
    });
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch database data" },
      { status: 500 }
    );
  }
}
