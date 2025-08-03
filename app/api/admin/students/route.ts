import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try this approach instead - get all users and filter in code
    const students = await prisma.user.findMany({
      where: {
        role: {
          not: "admin", // Get everyone who is not admin
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        class: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform to match frontend interface
    const transformedStudents = students.map((student) => ({
      id: student.id,
      name: student.name || "",
      email: student.email || "",
      currentLevel: (student.class as "B2" | "B3" | "M1" | "M2") || "B2",
      enrolledAt: student.createdAt,
    }));

    return NextResponse.json(transformedStudents);
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
