// Example script to add a new course
// Run with: npx tsx add-course.ts

import { prisma } from "../lib/prisma";

async function addCourse() {
  try {
    const newCourse = await prisma.course.create({
      data: {
        name: "JavaScript Fundamentals",
        description:
          "Learn JavaScript from basics to advanced concepts including ES6+, DOM manipulation, and async programming.",
        icon: "🚀",
        duration: "6 weeks",
        lessons: 20,
        difficulty: "Beginner",
        order: 3, // Next in sequence after existing courses
      },
    });

    console.log("Course created:", newCourse);

    // Optionally add some lessons
    const lessons = [
      "Introduction to JavaScript",
      "Variables and Data Types",
      "Functions and Scope",
      "Objects and Arrays",
      "DOM Manipulation",
      "Events and Event Handling",
      "Async JavaScript and Promises",
      "ES6+ Features",
    ];

    for (let i = 0; i < lessons.length; i++) {
      await prisma.lesson.create({
        data: {
          title: lessons[i],
          content: `# ${lessons[i]}\n\nThis is the content for ${lessons[i]} lesson.\n\n## Learning Objectives\n- Understand the concepts\n- Practice with examples\n- Apply knowledge in exercises`,
          order: i + 1,
          courseId: newCourse.id,
        },
      });
    }

    console.log(`Added ${lessons.length} lessons to the course`);
  } catch (error) {
    console.error("Error adding course:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addCourse();
