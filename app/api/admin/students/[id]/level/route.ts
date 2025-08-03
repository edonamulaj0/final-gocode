import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
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

    const { level } = await request.json();
    const resolvedParams = await params;
    const studentId = resolvedParams.id;

    // Validate level
    const validLevels = ["B2", "B3", "M1", "M2"];
    if (!validLevels.includes(level)) {
      return NextResponse.json({ error: "Invalid level" }, { status: 400 });
    }

    // Check if student exists
    const existingStudent = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Update student level (using the class field)
    const updatedStudent = await prisma.user.update({
      where: { id: studentId },
      data: { class: level }, // Map to class field in your schema
      select: {
        id: true,
        name: true,
        email: true,
        class: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Student level updated successfully",
      student: {
        id: updatedStudent.id,
        name: updatedStudent.name,
        email: updatedStudent.email,
        currentLevel: updatedStudent.class,
      },
    });
  } catch (error) {
    console.error("Failed to update student level:", error);
    return NextResponse.json(
      { error: "Failed to update student level" },
      { status: 500 }
    );
  }
}
