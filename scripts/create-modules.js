import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createModules() {
  try {
    // Get the Python course
    const pythonCourse = await prisma.course.findFirst({
      where: { name: "Python Fundamentals" },
    });

    if (!pythonCourse) {
      console.log("Python Fundamentals course not found!");
      return;
    }

    console.log("Found Python course:", pythonCourse.id);

    // Create modules for Python course
    const modules = [
      {
        name: "Python Basics",
        description:
          "Introduction to Python programming, variables, and data types",
        order: 1,
        courseId: pythonCourse.id,
      },
      {
        name: "Control Flow",
        description:
          "Learn about conditional statements, loops, and program flow control",
        order: 2,
        courseId: pythonCourse.id,
      },
      {
        name: "Functions and Modules",
        description: "Understanding functions, modules, and code organization",
        order: 3,
        courseId: pythonCourse.id,
      },
      {
        name: "Object-Oriented Programming",
        description: "Classes, objects, inheritance, and OOP principles",
        order: 4,
        courseId: pythonCourse.id,
      },
    ];

    for (const moduleData of modules) {
      const newModule = await prisma.module.create({
        data: moduleData,
      });
      console.log("Created module:", newModule.name);
    }

    console.log("Successfully created modules!");
  } catch (error) {
    console.error("Error creating modules:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createModules();
