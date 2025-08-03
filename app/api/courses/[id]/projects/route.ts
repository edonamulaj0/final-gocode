import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET projects for a course
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

    // Check if user is enrolled in the course
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

    // Check if user can access projects (all modules completed)
    const canAccessProjects = await checkProjectAccess(
      session.user.id,
      courseId
    );
    if (!canAccessProjects) {
      return NextResponse.json(
        { error: "Complete all modules first" },
        { status: 403 }
      );
    }

    const projects = await prisma.project.findMany({
      where: { courseId },
      include: {
        submissions: {
          where: { userId: session.user.id },
        },
      },
      orderBy: { order: "asc" },
    });

    // Map projects with user submission data
    const projectsWithSubmissions = projects.map((project) => ({
      ...project,
      userSubmission: project.submissions[0] || null,
      isCompleted:
        project.submissions.length > 0 &&
        project.submissions[0].status === "graded",
    }));

    return NextResponse.json(projectsWithSubmissions);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new project (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const courseId = resolvedParams.id;
    const body = await request.json();
    const { title, description, requirements, points = 100, dueDate } = body;

    // Get the next order number
    const lastProject = await prisma.project.findFirst({
      where: { courseId },
      orderBy: { order: "desc" },
    });
    const nextOrder = (lastProject?.order || 0) + 1;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        requirements,
        courseId,
        order: nextOrder,
        points,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function checkProjectAccess(
  userId: string,
  courseId: string
): Promise<boolean> {
  // Get all modules for the course
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course) return false;

  // Check if all modules are completed
  for (const moduleItem of course.modules) {
    const completion = await prisma.moduleCompletion.findUnique({
      where: {
        userId_moduleId: {
          userId,
          moduleId: moduleItem.id,
        },
      },
    });

    if (!completion) return false;
  }

  return true;
}
