// Script to add sample lessons to existing courses
// Run with: npx tsx scripts/add-sample-lessons.ts

import { prisma } from "../lib/prisma";

async function addSampleLessons() {
  try {
    // Get existing courses
    const courses = await prisma.course.findMany({
      orderBy: { order: "asc" },
    });

    console.log(`Found ${courses.length} courses`);

    for (const course of courses) {
      console.log(`\nAdding lessons to ${course.name}...`);

      // Delete existing lessons first (to avoid conflicts)
      await prisma.lesson.deleteMany({
        where: { courseId: course.id },
      });

      let lessons: string[] = [];

      if (course.name.includes("Python")) {
        lessons = [
          "Introduction to Python",
          "Variables and Data Types",
          "Control Structures (if/else, loops)",
          "Functions and Modules",
          "Lists and Dictionaries",
          "Object-Oriented Programming",
          "File Handling",
          "Error Handling and Debugging",
        ];
      } else if (course.name.includes("Java")) {
        lessons = [
          "Introduction to Java",
          "Variables and Data Types",
          "Control Flow Statements",
          "Methods and Classes",
          "Inheritance and Polymorphism",
          "Exception Handling",
          "Collections Framework",
          "File I/O Operations",
        ];
      } else if (course.name.includes("JavaScript")) {
        lessons = [
          "Introduction to JavaScript",
          "Variables and Data Types",
          "Functions and Scope",
          "Objects and Arrays",
          "DOM Manipulation",
          "Event Handling",
          "Async JavaScript and Promises",
          "ES6+ Features",
        ];
      } else {
        // Generic lessons for any other course
        lessons = [
          "Course Introduction",
          "Basic Concepts",
          "Core Principles",
          "Practical Examples",
          "Advanced Topics",
          "Best Practices",
          "Real-world Applications",
          "Course Summary",
        ];
      }

      // Create lessons with rich content
      for (let i = 0; i < lessons.length; i++) {
        const lessonTitle = lessons[i];
        const lessonContent = generateLessonContent(lessonTitle, course.name);

        await prisma.lesson.create({
          data: {
            title: lessonTitle,
            content: lessonContent,
            order: i + 1,
            courseId: course.id,
          },
        });
      }

      // Update course lesson count
      await prisma.course.update({
        where: { id: course.id },
        data: { lessons: lessons.length },
      });

      console.log(`✅ Added ${lessons.length} lessons to ${course.name}`);
    }

    console.log("\n🎉 All sample lessons added successfully!");
  } catch (error) {
    console.error("Error adding lessons:", error);
  } finally {
    await prisma.$disconnect();
  }
}

function generateLessonContent(title: string, courseName: string): string {
  const language = courseName.toLowerCase().includes("python")
    ? "Python"
    : courseName.toLowerCase().includes("java")
    ? "Java"
    : courseName.toLowerCase().includes("javascript")
    ? "JavaScript"
    : "Programming";

  return `# ${title}

Welcome to this lesson on ${title.toLowerCase()} in ${language}!

## Learning Objectives

By the end of this lesson, you will be able to:
- Understand the key concepts of ${title.toLowerCase()}
- Apply these concepts in practical scenarios
- Write clean, efficient code using these principles
- Debug common issues related to this topic

## Introduction

${title} is a fundamental concept in ${language} programming. It forms the building blocks for more advanced topics and is essential for any programmer to master.

## Key Concepts

### Concept 1: Foundation
This is where we lay the groundwork for understanding ${title.toLowerCase()}. We'll start with the basics and build up your knowledge step by step.

### Concept 2: Implementation
Here we'll see how to implement these concepts in real ${language} code. You'll learn the syntax and best practices.

### Concept 3: Best Practices
We'll cover the do's and don'ts when working with ${title.toLowerCase()}, including common pitfalls and how to avoid them.

## Code Example

\`\`\`${language.toLowerCase()}
// This is a sample code snippet for ${title}
// In a real lesson, this would contain actual working code examples

function example() {
    // ${title} implementation goes here
    console.log("Learning ${title} in ${language}!");
}
\`\`\`

## Practice Exercise

Try implementing the concepts you've learned in this lesson. Create a simple program that demonstrates your understanding of ${title.toLowerCase()}.

## Summary

In this lesson, you learned:
- The fundamentals of ${title.toLowerCase()}
- How to implement these concepts in ${language}
- Best practices and common pitfalls to avoid

## Next Steps

In the next lesson, we'll build upon these concepts and explore more advanced topics. Make sure you're comfortable with this material before proceeding.

Remember: Programming is all about practice! The more you code, the better you'll become.

---

*Complete this lesson and click "Mark as Complete" to proceed to the next lesson.*`;
}

addSampleLessons();
