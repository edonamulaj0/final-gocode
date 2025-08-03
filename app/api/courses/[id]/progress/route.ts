import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET detailed course progress with access control
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const courseId = resolvedParams.id;

    // Check if user is enrolled
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Not enrolled in course" },
        { status: 404 }
      );
    }

    // Get course with all content
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                completions: {
                  where: { userId: session.user.id },
                },
              },
              orderBy: { order: "asc" },
            },
            practiceQuestions: {
              include: {
                submissions: {
                  where: { userId: session.user.id },
                },
              },
              orderBy: { order: "asc" },
            },
            moduleExams: {
              include: {
                submissions: {
                  where: { userId: session.user.id },
                },
              },
            },
            moduleCompletions: {
              where: { userId: session.user.id },
            },
          },
          orderBy: { order: "asc" },
        },
        projects: {
          include: {
            submissions: {
              where: { userId: session.user.id },
            },
          },
          orderBy: { order: "asc" },
        },
        finalExams: {
          include: {
            submissions: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Calculate progress for each module
    const moduleProgress = [];
    let canAccessNext = true;

    for (let i = 0; i < course.modules.length; i++) {
      const moduleData = course.modules[i];

      // Check lesson completions
      const completedLessons = moduleData.lessons.filter(
        (lesson) => lesson.completions.length > 0
      ).length;

      // Check practice question completions
      const completedPracticeQuestions = moduleData.practiceQuestions.filter(
        (pq) => pq.submissions.length > 0
      ).length;

      // Check if module exam is passed
      const moduleExamPassed = moduleData.moduleExams.every((exam) =>
        exam.submissions.some((sub) => sub.passed)
      );

      // Module is completed if all requirements are met
      const isModuleCompleted = moduleData.moduleCompletions.length > 0;

      // Can access if previous modules are completed or if it's the first module
      const canAccess = i === 0 || canAccessNext;

      moduleProgress.push({
        moduleId: moduleData.id,
        name: moduleData.name,
        order: moduleData.order,
        completed: isModuleCompleted,
        canAccess,
        lessonsCompleted: completedLessons,
        totalLessons: moduleData.lessons.length,
        practiceQuestionsCompleted: completedPracticeQuestions,
        totalPracticeQuestions: moduleData.practiceQuestions.length,
        examPassed: moduleExamPassed,
        hasExam: moduleData.moduleExams.length > 0,
      });

      // Update canAccessNext for the next iteration
      if (!isModuleCompleted) {
        canAccessNext = false;
      }
    }

    // Check project access and completion
    const allModulesCompleted = moduleProgress.every((mp) => mp.completed);
    const completedProjects = course.projects.filter((project) =>
      project.submissions.some(
        (sub) => sub.status === "graded" && sub.score !== null
      )
    ).length;

    // Check final exam access and completion
    const allProjectsCompleted = completedProjects === course.projects.length;
    const finalExamPassed = course.finalExams.some((exam) =>
      exam.submissions.some((sub) => sub.passed)
    );

    // Calculate overall progress
    const totalModules = course.modules.length;
    const completedModulesCount = moduleProgress.filter(
      (mp) => mp.completed
    ).length;
    const totalProjects = course.projects.length;
    const totalFinalExams = course.finalExams.length;

    const totalItems = totalModules + totalProjects + totalFinalExams;
    const completedItems =
      completedModulesCount + completedProjects + (finalExamPassed ? 1 : 0);
    const overallProgress =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // Calculate average grade
    const grades = await prisma.grade.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { courseId },
          { moduleId: { in: course.modules.map((m) => m.id) } },
        ],
      },
    });

    const averageGrade =
      grades.length > 0
        ? grades.reduce((sum, grade) => sum + grade.percentage, 0) /
          grades.length
        : 0;

    const courseProgress = {
      course: {
        id: course.id,
        name: course.name,
        description: course.description,
      },
      overallProgress,
      moduleProgress,
      projectsCompleted: completedProjects,
      totalProjects,
      finalExamPassed,
      canAccessProjects: allModulesCompleted,
      canAccessFinalExam: allProjectsCompleted,
      averageGrade: Math.round(averageGrade * 100) / 100,
      isCompleted: overallProgress === 100,
    };

    return NextResponse.json(courseProgress);
  } catch (error) {
    console.error("Error fetching course progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
