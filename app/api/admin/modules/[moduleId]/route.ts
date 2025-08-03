import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ModuleOrderItem {
  id: string;
  order: number;
}

export async function PUT(request: NextRequest) {
  try {
    const { modules }: { modules: ModuleOrderItem[] } = await request.json();

    await Promise.all(
      modules.map((module: ModuleOrderItem) =>
        prisma.module.update({
          where: { id: module.id },
          data: { order: module.order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering modules:", error);
    return NextResponse.json(
      { error: "Failed to reorder modules" },
      { status: 500 }
    );
  }
}
