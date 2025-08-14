// app/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Course } from "@/types/course";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Navbar from "@/components/layout/Navbar";
import CoursesPage from "@/components/pages/CoursesPage";
import AssignmentsPage from "@/components/pages/AssignmentsPage";
import DashboardPage from "@/components/pages/DashboardPage";

export default function Home() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper function to change page and update URL
  const changePage = (page: string) => {
    setCurrentPage(page);
    if (page === "home" || (page === "dashboard" && session)) {
      router.push("/", { scroll: false });
    } else {
      router.push(`/?page=${page}`, { scroll: false });
    }
  };

  // Handle URL parameters and default page logic
  useEffect(() => {
    const pageParam = searchParams.get("page");
    if (pageParam) {
      setCurrentPage(pageParam);
    } else {
      // If user is logged in, default to dashboard; otherwise redirect to login
      if (session) {
        setCurrentPage("dashboard");
      } else {
        router.push("/auth/signin");
      }
    }
  }, [searchParams, session, router]);

  useEffect(() => {
    fetchCourses();
  }, [session]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/courses");
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        throw new Error(`Failed to load courses: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError(
        "Unable to load courses. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific "already enrolled" case
        if (
          response.status === 400 &&
          data.error === "Already enrolled in this course"
        ) {
          // Redirect to course overview page (use plural 'courses')
          router.push(`/courses/${courseId}`);
          return {
            success: true,
            message: "Redirecting to course...",
            alreadyEnrolled: true,
          };
        }

        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      // Handle successful enrollment
      console.log("Enrollment successful:", data);
      // Also redirect to course page after successful enrollment (use plural 'courses')
      router.push(`/courses/${courseId}`);
      return {
        success: true,
        data,
        message: "Successfully enrolled in course",
      };
    } catch (error) {
      console.error("Failed to enroll:", error);
      throw error;
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage courses={courses} session={session} />;
      case "courses":
        return (
          <CoursesPage
            courses={courses}
            loading={loading}
            error={error}
            session={session}
            fetchCourses={fetchCourses}
            enrollInCourse={enrollInCourse}
            setCurrentPage={setCurrentPage}
          />
        );
      case "assignments":
        return (
          <AssignmentsPage
            loading={loading}
            error={error}
            session={session}
            fetchCourses={fetchCourses}
          />
        );
      default:
        return <DashboardPage courses={courses} session={session} />;
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        <Navbar
          session={session}
          currentPage={currentPage}
          changePage={changePage}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        <main className="lg:ml-64 pt-16 lg:pt-0 p-4 md:p-8 overflow-x-hidden">
          <div className="max-w-6xl mx-auto flex items-center justify-center py-20 overflow-x-hidden">
            <div className="text-center space-y-4">
              <LoadingSpinner size="lg" />
              <p className="text-slate-600 text-lg">Loading MasterMore...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Navbar
        session={session}
        currentPage={currentPage}
        changePage={changePage}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <main className="lg:ml-64 pt-16 lg:pt-0 overflow-x-hidden">
        {renderCurrentPage()}
      </main>
    </div>
  );
}
