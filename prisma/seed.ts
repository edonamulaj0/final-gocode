import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  // Create admin users first
  const adminPassword = await bcrypt.hash("admin123", 12);

  const admin1 = await prisma.user.upsert({
    where: { email: "admin@gocode.com" },
    update: {},
    create: {
      email: "admin@gocode.com",
      name: "Admin User",
      password: adminPassword,
      class: "ADMIN",
      role: "admin",
    },
  });

  const admin2 = await prisma.user.upsert({
    where: { email: "instructor@gocode.com" },
    update: {},
    create: {
      email: "instructor@gocode.com",
      name: "Instructor User",
      password: adminPassword,
      class: "ADMIN",
      role: "admin",
    },
  });

  console.log("Admin users created:", {
    admin1: admin1.email,
    admin2: admin2.email,
  });

  // Create courses in order
  const pythonCourse = await prisma.course.create({
    data: {
      name: "Python Fundamentals",
      description:
        "Learn Python from basics to advanced concepts including data structures, OOP, and file handling.",
      icon: "🐍",
      duration: "8 weeks",
      difficulty: "Beginner",
      order: 1,
      isUnlocked: true, // First course is unlocked by default
    },
  });

  const javaCourse = await prisma.course.create({
    data: {
      name: "Java Programming",
      description:
        "Master Java programming with object-oriented concepts, collections, and enterprise development.",
      icon: "☕",
      duration: "10 weeks",
      difficulty: "Intermediate",
      order: 2,
      isUnlocked: false, // Locked by default, you can unlock it manually
    },
  });

  // Create modules for Python course
  const module1 = await prisma.module.create({
    data: {
      name: "Python Basics",
      description: "Learn the fundamentals of Python programming.",
      order: 1,
      courseId: pythonCourse.id,
      isPublished: true,
    },
  });

  // Create sample lessons for module 1
  const lessons = [
    "Introduction to Python",
    "Variables and Data Types",
    "Control Structures",
    "Functions and Modules",
  ];

  for (let i = 0; i < lessons.length; i++) {
    await prisma.lesson.create({
      data: {
        title: lessons[i],
        content: `# ${lessons[i]}\n\nThis is the content for ${lessons[i]} lesson.`,
        order: i + 1,
        moduleId: module1.id,
      },
    });
  }

  // Create practice questions for module 1
  const practiceQuestion = await prisma.practiceQuestion.create({
    data: {
      title: "Python Variable Declaration",
      question:
        "Which of the following correctly declares a variable in Python?",
      type: "multiple_choice",
      moduleId: module1.id,
      order: 1,
      points: 1,
      options: {
        create: [
          { text: "my_variable = 5", isCorrect: true, order: 1 },
          { text: "var my_variable = 5", isCorrect: false, order: 2 },
          { text: "declare my_variable = 5", isCorrect: false, order: 3 },
          { text: "int my_variable = 5", isCorrect: false, order: 4 },
        ],
      },
    },
  });

  // Create module exam
  const moduleExam = await prisma.moduleExam.create({
    data: {
      title: "Python Basics - Module Exam",
      description: "Test your understanding of Python basics.",
      moduleId: module1.id,
      passingScore: 70,
      timeLimit: 30,
      questions: {
        create: [
          {
            question: "What is Python?",
            type: "essay",
            points: 5,
            order: 1,
          },
          {
            question: "Which data type would you use to store a list of items?",
            type: "multiple_choice",
            points: 2,
            order: 2,
            options: {
              create: [
                { text: "string", isCorrect: false, order: 1 },
                { text: "int", isCorrect: false, order: 2 },
                { text: "list", isCorrect: true, order: 3 },
                { text: "bool", isCorrect: false, order: 4 },
              ],
            },
          },
        ],
      },
    },
  });

  // Create a project
  const project = await prisma.project.create({
    data: {
      title: "Python Calculator Application",
      description: "Create a calculator application using Python.",
      requirements: `
        Requirements:
        1. Create a Python script that can perform basic arithmetic operations
        2. Handle user input validation
        3. Include error handling for division by zero
        4. Add a menu system for operation selection
        5. Include documentation and comments
      `,
      courseId: pythonCourse.id,
      order: 1,
      points: 100,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  // Create final exam
  const finalExam = await prisma.finalExam.create({
    data: {
      title: "Python Fundamentals - Final Exam",
      description: "Comprehensive exam covering all Python fundamentals.",
      courseId: pythonCourse.id,
      passingScore: 75,
      timeLimit: 120,
      questions: {
        create: [
          {
            question:
              "Explain the difference between lists and tuples in Python.",
            type: "essay",
            points: 10,
            order: 1,
          },
          {
            question: "What is the output of: print(type([1, 2, 3]))?",
            type: "multiple_choice",
            points: 3,
            order: 2,
            options: {
              create: [
                { text: "<class 'list'>", isCorrect: true, order: 1 },
                { text: "<class 'tuple'>", isCorrect: false, order: 2 },
                { text: "<class 'array'>", isCorrect: false, order: 3 },
                { text: "<class 'dict'>", isCorrect: false, order: 4 },
              ],
            },
          },
        ],
      },
    },
  });

  // Create practice quests (keeping existing functionality)
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
      role: "student",
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
  console.log("Admin credentials:");
  console.log("Email: admin@gocode.com | Password: admin123");
  console.log("Email: instructor@gocode.com | Password: admin123");
  console.log("Student credentials:");
  console.log("Email: student@gocode.com | Password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

  