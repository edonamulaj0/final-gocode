import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level");
    const timeFilter = searchParams.get("timeFilter") || "all";

    // Calculate date filter based on timeFilter (for future use)
    let _dateFilter: Date | undefined;
    const now = new Date();

    switch (timeFilter) {
      case "week":
        _dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        _dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        _dateFilter = undefined;
    }

    // Build where clause for filtering
    const whereClause: Prisma.UserWhereInput = {
      role: "STUDENT",
    };
    if (level && level !== "ALL") {
      whereClause.class = level;
    }

    // First, let's just get the basic user data
    const students = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        class: true,
        createdAt: true,
      },
    });

    // Get all courses to calculate total modules
    const allCourses = await prisma.course.findMany({
      include: {
        modules: true,
      },
    });

    // Transform the data with mock progress for now
    const progressData = students.map((student) => {
      // Mock data structure - replace with actual queries when schema is fixed
      const mockCourseProgress = allCourses.slice(0, 2).map((course) => {
        const totalModules = course.modules.length;
        const completedModules = Math.floor(Math.random() * totalModules);
        const completionPercentage =
          totalModules > 0
            ? Math.round((completedModules / totalModules) * 100)
            : 0;

        return {
          courseId: course.id,
          courseName: course.name,
          completedModules,
          totalAccessibleModules: totalModules,
          completionPercentage,
          lastAccessed: new Date(),
          grades: course.modules.slice(0, completedModules).map((module) => ({
            moduleId: module.id,
            moduleName: module.name,
            grade: Math.floor(Math.random() * 30) + 70, // Random grade 70-100
            maxGrade: 100,
            completedAt: new Date(),
          })),
        };
      });

      const totalModules = mockCourseProgress.reduce(
        (sum, course) => sum + course.totalAccessibleModules,
        0
      );
      const completedModules = mockCourseProgress.reduce(
        (sum, course) => sum + course.completedModules,
        0
      );
      const overallCompletion =
        totalModules > 0
          ? Math.round((completedModules / totalModules) * 100)
          : 0;

      return {
        studentId: student.id,
        student: {
          id: student.id,
          name: student.name || "Unknown",
          email: student.email || "",
          currentLevel: student.class || "B2",
          enrolledAt: student.createdAt,
        },
        courseProgress: mockCourseProgress,
        overallCompletion,
        currentStreak: Math.floor(Math.random() * 20), // Mock streak
        totalTimeSpent: Math.round(Math.random() * 50 * 10) / 10, // Mock time
      };
    });

    return NextResponse.json(progressData);
  } catch (error) {
    console.error("Failed to fetch student progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch student progress" },
      { status: 500 }
    );
  }
}
