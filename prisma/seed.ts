import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  // Create courses in order
  const pythonCourse = await prisma.course.create({
    data: {
      name: "Python Fundamentals",
      description:
        "Learn Python from basics to advanced concepts including data structures, OOP, and file handling.",
      icon: "🐍",
      duration: "8 weeks",
      lessons: 24,
      difficulty: "Beginner",
      order: 1,
    },
  });

  const javaCourse = await prisma.course.create({
    data: {
      name: "Java Programming",
      description:
        "Master Java programming with object-oriented concepts, collections, and enterprise development.",
      icon: "☕",
      duration: "10 weeks",
      lessons: 30,
      difficulty: "Intermediate",
      order: 2,
    },
  });

  // Create sample lessons for Python course
  const pythonLessons = [
    "Introduction to Python",
    "Variables and Data Types",
    "Control Structures",
    "Functions and Modules",
    "Object-Oriented Programming",
    "File Handling",
    "Error Handling",
    "Libraries and Frameworks",
  ];

  for (let i = 0; i < pythonLessons.length; i++) {
    await prisma.lesson.create({
      data: {
        title: pythonLessons[i],
        content: `# ${pythonLessons[i]}\n\nThis is the content for ${pythonLessons[i]} lesson.`,
        order: i + 1,
        courseId: pythonCourse.id,
      },
    });
  }

  // Create practice quests
  const pythonQuests = [
    {
      title: "Basic Calculator",
      description:
        "Create a simple calculator that can add, subtract, multiply, and divide two numbers.",
      difficulty: "easy",
      testCases: [
        { input: [5, 3, "+"], expected: 8 },
        { input: [10, 4, "-"], expected: 6 },
        { input: [7, 3, "*"], expected: 21 },
        { input: [12, 4, "/"], expected: 3 },
      ],
      solution:
        'def calculator(a, b, op):\n    if op == "+":\n        return a + b\n    elif op == "-":\n        return a - b\n    elif op == "*":\n        return a * b\n    elif op == "/":\n        return a / b',
    },
    {
      title: "String Reversal",
      description: "Write a function that reverses a given string.",
      difficulty: "easy",
      testCases: [
        { input: ["hello"], expected: "olleh" },
        { input: ["python"], expected: "nohtyp" },
        { input: [""], expected: "" },
      ],
      solution: "def reverse_string(s):\n    return s[::-1]",
    },
    {
      title: "Class Implementation",
      description: "Create a Student class with properties and methods.",
      difficulty: "medium",
      testCases: [
        {
          input: ["John", 20, "B2"],
          expected: "Student: John, Age: 20, Class: B2",
        },
      ],
      solution:
        'class Student:\n    def __init__(self, name, age, class_name):\n        self.name = name\n        self.age = age\n        self.class_name = class_name\n    \n    def __str__(self):\n        return f"Student: {self.name}, Age: {self.age}, Class: {self.class_name}"',
    },
  ];

  for (const quest of pythonQuests) {
    await prisma.practiceQuest.create({
      data: {
        title: quest.title,
        description: quest.description,
        difficulty: quest.difficulty,
        courseId: pythonCourse.id,
        testCases: quest.testCases,
        solution: quest.solution,
      },
    });
  }

  // Create demo user
  const hashedPassword = await bcrypt.hash("password123", 12);
  const demoUser = await prisma.user.create({
    data: {
      email: "student@gocode.com",
      name: "Alex Johnson",
      password: hashedPassword,
      class: "B2",
    },
  });

  // Create enrollments and progress for demo user
  await prisma.courseEnrollment.create({
    data: {
      userId: demoUser.id,
      courseId: pythonCourse.id,
      isCompleted: false,
    },
  });

  await prisma.userProgress.create({
    data: {
      userId: demoUser.id,
      courseId: pythonCourse.id,
      progress: 75,
    },
  });

  await prisma.courseEnrollment.create({
    data: {
      userId: demoUser.id,
      courseId: javaCourse.id,
      isCompleted: false,
    },
  });

  await prisma.userProgress.create({
    data: {
      userId: demoUser.id,
      courseId: javaCourse.id,
      progress: 45,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
