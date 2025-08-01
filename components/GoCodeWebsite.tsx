"use client";
import React, { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Home,
  BookOpen,
  Code,
  BarChart3,
  UserPlus,
  Play,
  Lock,
  CheckCircle,
  User,
  Star,
  Clock,
  Target,
  ArrowRight,
  LogOut,
  Menu,
  X,
  RefreshCw,
  AlertCircle,
  MoreHorizontal,
} from "lucide-react";

interface Course {
  id: string;
  name: string;
  description: string;
  icon: string;
  duration: string;
  lessons: number;
  difficulty: string;
  order: number;
  progress?: number;
  isEnrolled?: boolean;
  isCompleted?: boolean;
}

// Professional Loading Component
const LoadingSpinner = ({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <MoreHorizontal
        className={`${sizeClasses[size]} animate-pulse text-blue-600`}
      />
    </div>
  );
};

// Professional Error Component
const ErrorMessage = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
    <h3 className="text-lg font-semibold text-slate-800 mb-2">
      Oops! Something went wrong
    </h3>
    <p className="text-slate-600 text-center mb-6 max-w-md">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Try Again</span>
      </button>
    )}
  </div>
);

const GoCodeWebsite = () => {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState("home");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper function to change page and update URL
  const changePage = (page: string) => {
    setCurrentPage(page);
    if (page === "home") {
      router.push("/", { scroll: false });
    } else {
      router.push(`/?page=${page}`, { scroll: false });
    }
  };

  // Handle URL parameters - do NOT auto redirect to dashboard
  useEffect(() => {
    const pageParam = searchParams.get("page");
    if (pageParam) {
      setCurrentPage(pageParam);
    } else {
      setCurrentPage("home");
    }
  }, [searchParams]);

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
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      });
      if (response.ok) {
        fetchCourses();
      }
    } catch (error) {
      console.error("Error enrolling in course:", error);
    }
  };

  const Navbar = () => (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-slate-900 text-white shadow-xl z-10">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-400 mb-8">GoCode</h1>
          <nav className="space-y-4">
            <NavItem icon={Home} label="Home" page="home" />
            <NavItem icon={BookOpen} label="Courses" page="courses" />
            <NavItem icon={Code} label="Practice" page="practice" />
            {session && (
              <NavItem icon={BarChart3} label="Dashboard" page="dashboard" />
            )}
            {!session ? (
              <button
                onClick={() => signIn()}
                className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <UserPlus size={20} />
                <span>Join Us</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  signOut();
                  changePage("home");
                }}
                className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-slate-800 transition-colors text-red-400"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            )}
          </nav>
        </div>

        {session && (
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <p className="font-medium text-sm">{session.user?.name}</p>
                  <p className="text-slate-400 text-xs">
                    Class {session.user?.class}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-slate-900 text-white shadow-xl z-20">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-blue-400">GoCode</h1>
            {currentPage !== "home" && (
              <>
                <span className="text-slate-400">•</span>
                <span className="text-lg font-medium text-white capitalize">
                  {currentPage}
                </span>
              </>
            )}
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-slate-900 text-white z-10 pt-16">
          <div className="p-6">
            <nav className="space-y-4">
              <MobileNavItem icon={Home} label="Home" page="home" />
              <MobileNavItem icon={BookOpen} label="Courses" page="courses" />
              <MobileNavItem icon={Code} label="Practice" page="practice" />
              {session && (
                <MobileNavItem
                  icon={BarChart3}
                  label="Dashboard"
                  page="dashboard"
                />
              )}
              {!session ? (
                <button
                  onClick={() => {
                    signIn();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <UserPlus size={20} />
                  <span>Join Us</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    signOut();
                    changePage("home");
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-slate-800 transition-colors text-red-400"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              )}
            </nav>
            {session && (
              <div className="mt-8 bg-slate-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{session.user?.name}</p>
                    <p className="text-slate-400 text-xs">
                      Class {session.user?.class}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  const NavItem = ({
    icon: Icon,
    label,
    page,
  }: {
    icon: React.ComponentType<{ size?: number }>;
    label: string;
    page: string;
  }) => (
    <button
      onClick={() => changePage(page)}
      className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${
        currentPage === page ? "bg-blue-600" : "hover:bg-slate-800"
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  const MobileNavItem = ({
    icon: Icon,
    label,
    page,
  }: {
    icon: React.ComponentType<{ size?: number }>;
    label: string;
    page: string;
  }) => (
    <button
      onClick={() => {
        changePage(page);
        setMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
        currentPage === page
          ? "bg-blue-600 text-white shadow-md"
          : "hover:bg-slate-800 text-slate-300 hover:text-white"
      }`}
      aria-current={currentPage === page ? "page" : undefined}
      role="menuitem"
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  const HomePage = () => (
    <div className="space-y-8">
      {/* Home Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="flex flex-col space-y-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Master Programming with{" "}
                <span className="text-blue-600">GoCode</span>
              </h1>
              <p className="text-gray-600 text-lg mb-6">
                Progressive learning platform designed for students. Unlock
                courses step by step, practice with real problems, and track
                your journey to becoming a skilled developer.
              </p>
              <div className="flex flex-wrap items-center gap-3 lg:gap-6 mb-6 text-sm text-gray-500">
                <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg">
                  Progressive Learning
                </span>
                <span>Student-Focused</span>
                <span>Interactive Platform</span>
              </div>
              <div>
                <button
                  onClick={() => changePage("courses")}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center space-x-3"
                >
                  <span>Start Learning</span>
                  <ArrowRight size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <section className="mx-4 md:mx-8 overflow-x-hidden">
        <div className="bg-slate-50 rounded-2xl p-6 md:p-12 max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 text-center">
            Why Choose GoCode?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl text-slate-600 font-semibold mb-3">
                Progressive Learning
              </h3>
              <p className="text-slate-600">
                Unlock courses sequentially to build strong foundations before
                advancing.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl text-slate-600  font-semibold mb-3">
                Hands-on Practice
              </h3>
              <p className="text-slate-600">
                Reinforce learning with practical coding challenges and
                projects.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl text-slate-600 font-semibold mb-3">
                Track Progress
              </h3>
              <p className="text-slate-600">
                Monitor your learning journey with detailed progress analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Preview */}
      <section className="px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 text-center">
            Our Courses
          </h2>
          {loading ? (
            <LoadingSpinner size="lg" className="py-20" />
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchCourses} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl shadow-md p-6 border border-slate-200"
                >
                  <div className="text-4xl mb-4">{course.icon}</div>
                  <h3 className="text-xl text-slate-600 font-semibold mb-2">
                    {course.name}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    {course.description.substring(0, 80)}...
                  </p>
                  <div className="space-y-2 text-sm text-slate-500">
                    <div className="flex items-center space-x-2">
                      <Clock size={14} />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen size={14} />
                      <span>{course.lessons} lessons</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-4 md:mx-8 overflow-x-hidden mb-16">
        <div className="bg-slate-800 text-white rounded-2xl p-6 md:p-12 text-center max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Simple, Student-Friendly Pricing
          </h2>
          <p className="text-slate-300 mb-8">
            Full access to all courses and features
          </p>
          <div className="bg-slate-700 rounded-xl p-6 md:p-8 max-w-md mx-auto">
            <div className="text-3xl md:text-4xl font-bold mb-2">
              $29<span className="text-lg">/month</span>
            </div>
            <p className="text-slate-300 mb-6">Per student</p>
            <ul className="space-y-3 text-left mb-8">
              <li className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-400" />
                <span>Access to all courses</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-400" />
                <span>Unlimited practice problems</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-400" />
                <span>Progress tracking</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-400" />
                <span>Student dashboard</span>
              </li>
            </ul>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </section>
    </div>
  );

  const CoursesPage = () => (
    <div>
      {/* Courses Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 invisible">
              <span className="text-blue-600 hover:text-blue-800 font-medium">
                ← Back to Courses
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-4xl">📚</div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Programming Courses
              </h1>
              <p className="text-gray-600 mt-2">
                Master programming languages step by step. Complete each course
                to unlock the next one.
              </p>
              <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-3 text-sm text-gray-500">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {courses.length} Courses Available
                </span>
                <span>Beginner to Advanced</span>
                <span>Self-paced Learning</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 overflow-x-hidden">
        {loading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchCourses} />
        ) : (
          <div className="space-y-6">
            {courses.map((course, index) => {
              const isUnlocked = index === 0 || courses[index - 1]?.isCompleted;
              const progress = course.progress || 0;
              return (
                <div
                  key={course.id}
                  className={`bg-white rounded-xl shadow-md p-4 md:p-8 border-2 ${
                    isUnlocked
                      ? "border-slate-200"
                      : "border-slate-100 opacity-60"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6 flex-1">
                      <div className="text-4xl md:text-6xl self-center md:self-start">
                        {course.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-center md:justify-start space-x-3 mb-3">
                          <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                            {course.name}
                          </h2>
                          {!isUnlocked && (
                            <Lock className="text-slate-900" size={20} />
                          )}
                          {course.isCompleted && (
                            <CheckCircle className="text-green-500" size={20} />
                          )}
                        </div>
                        <p className="text-slate-600 mb-4 text-center md:text-left">
                          {course.description}
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 md:gap-6 text-sm text-slate-500 mb-4">
                          <div className="flex items-center space-x-2">
                            <Clock size={16} />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <BookOpen size={16} />
                            <span>{course.lessons} lessons</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Star size={16} />
                            <span>{course.difficulty}</span>
                          </div>
                        </div>
                        {session && progress > 0 && (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-slate-600 mb-1">
                              <span>Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      disabled={!isUnlocked || !session}
                      onClick={() => {
                        if (!course.isEnrolled) {
                          enrollInCourse(course.id);
                        } else {
                          window.location.href = `/courses/${course.id}`;
                        }
                      }}
                      className={`flex items-center justify-center space-x-2 px-4 md:px-6 py-3 rounded-lg font-semibold transition-colors mt-4 md:mt-0 w-full md:w-auto ${
                        isUnlocked && session
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <Play size={18} />
                      <span>
                        {!session
                          ? "Login Required"
                          : !course.isEnrolled
                          ? "Enroll"
                          : progress > 0
                          ? "Continue"
                          : "Start Course"}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const PracticePage = () => {
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const practiceProblems = {
      easy: [
        "Basic Calculator",
        "String Manipulation",
        "List Operations",
        "Simple Loops",
      ],
      medium: [
        "File I/O Operations",
        "Dictionary Management",
        "Class Implementation",
      ],
      hard: ["Advanced OOP", "Decorators & Generators", "Threading"],
    };

    if (selectedCourse) {
      return (
        <div>
          {/* Practice Problems Header */}
          <div className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    ← Back to Practice
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-4xl">{selectedCourse.icon}</div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {selectedCourse.name} Practice
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Strengthen your {selectedCourse.name} skills with hands-on
                    coding challenges.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-3 text-sm text-gray-500">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Practice Mode
                    </span>
                    <span>Easy to Hard</span>
                    <span>Interactive Challenges</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Practice Problems Content */}
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 overflow-x-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {["easy", "medium", "hard"].map((difficulty) => (
                <div
                  key={difficulty}
                  className="bg-white rounded-xl shadow-md p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className={`text-xl font-bold capitalize ${
                        difficulty === "easy"
                          ? "text-blue-600"
                          : difficulty === "medium"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {difficulty}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {practiceProblems[
                      difficulty as keyof typeof practiceProblems
                    ].map((problem, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <span className="text-slate-700">{problem}</span>
                        <button className="text-blue-600 hover:text-blue-700">
                          <Play size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div>
        {/* Practice Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4 invisible">
                <span className="text-blue-600 hover:text-blue-800 font-medium">
                  ← Back to Practice
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-4xl">🚀</div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Practice Problems
                </h1>
                <p className="text-gray-600 mt-2">
                  Sharpen your skills with hands-on coding challenges.
                </p>
                <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-3 text-sm text-gray-500">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Interactive Challenges
                  </span>
                  <span>Multiple Difficulty Levels</span>
                  <span>Real-world Problems</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Practice Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 overflow-x-hidden">
          {loading ? (
            <LoadingSpinner size="lg" className="py-20" />
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchCourses} />
          ) : (
            <div className="space-y-6">
              {courses.map((course, index) => {
                const isUnlocked = course.isEnrolled || index === 0;
                const progress = course.progress || 0;
                return (
                  <div
                    key={course.id}
                    className={`bg-white rounded-xl shadow-md p-4 md:p-8 border-2 ${
                      isUnlocked
                        ? "border-slate-200"
                        : "border-slate-100 opacity-60"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6 flex-1">
                        <div className="text-4xl md:text-6xl self-center md:self-start">
                          {course.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-center md:justify-start space-x-3 mb-3">
                            <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                              {course.name}
                            </h2>
                            {!isUnlocked && (
                              <Lock className="text-slate-900" size={20} />
                            )}
                            {course.isCompleted && (
                              <CheckCircle
                                className="text-green-500"
                                size={20}
                              />
                            )}
                          </div>
                          <p className="text-slate-600 mb-4 text-center md:text-left">
                            {course.description}
                          </p>
                          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 md:gap-6 text-sm text-slate-500 mb-4">
                            <div className="flex items-center space-x-2">
                              <Clock size={16} />
                              <span>{course.duration}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <BookOpen size={16} />
                              <span>{course.lessons} lessons</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Star size={16} />
                              <span>{course.difficulty}</span>
                            </div>
                          </div>
                          {session && course.isEnrolled && (
                            <div className="mb-4">
                              <div className="flex justify-between text-sm text-slate-600 mb-1">
                                <span>Progress</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        disabled={!isUnlocked || !session}
                        onClick={() => setSelectedCourse(course)}
                        className={`flex items-center justify-center space-x-2 px-4 md:px-6 py-3 rounded-lg font-semibold transition-colors mt-4 md:mt-0 w-full md:w-auto ${
                          isUnlocked && session
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        <Play size={18} />
                        <span>
                          {!session
                            ? "Login Required"
                            : !course.isEnrolled
                            ? "Enroll to Practice"
                            : "Practice Problems"}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const DashboardPage = () => {
    if (!session) {
      return (
        <div className="text-center py-20 px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Access Denied
          </h1>
          <p className="text-slate-600 mb-8">
            Please log in to view your dashboard.
          </p>
          <button
            onClick={() => signIn()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Log In
          </button>
        </div>
      );
    }

    const enrolledCourses = courses.filter((course) => course.isEnrolled);
    const totalProgress =
      enrolledCourses.length > 0
        ? enrolledCourses.reduce(
            (sum, course) => sum + (course.progress || 0),
            0
          ) / enrolledCourses.length
        : 0;
    const completedCourses = courses.filter(
      (course) => course.isCompleted
    ).length;

    return (
      <div>
        {/* Dashboard Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-4xl">
                <User size={40} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Welcome back, {session.user?.name}!
                </h1>
                <p className="text-gray-600 text-lg mb-6">
                  Track your learning progress and continue your programming
                  journey.
                </p>
                <div className="flex flex-wrap items-center gap-3 lg:gap-6 text-sm text-gray-500">
                  <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg">
                    Class {session.user?.class}
                  </span>
                  <span>{Math.round(totalProgress)}% Overall Progress</span>
                  <span>{completedCourses} Courses Completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 overflow-x-hidden">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">
                {Math.round(totalProgress)}%
              </div>
              <p className="text-slate-600 text-sm md:text-base">
                Overall Progress
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">
                {completedCourses}
              </div>
              <p className="text-slate-600 text-sm md:text-base">
                Completed Courses
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 text-center">
              <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-2">
                {enrolledCourses.length}
              </div>
              <p className="text-slate-600 text-sm md:text-base">
                Enrolled Courses
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 text-center">
              <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-2">
                {courses.length - enrolledCourses.length}
              </div>
              <p className="text-slate-600 text-sm md:text-base">
                Available Courses
              </p>
            </div>
          </div>

          {/* Course Progress */}
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-6">
              Course Progress
            </h3>
            <div className="space-y-6">
              {enrolledCourses.map((course) => {
                const progress = course.progress || 0;
                return (
                  <div key={course.id} className="flex items-center space-x-4">
                    <div className="text-xl md:text-2xl">{course.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-slate-800 text-sm md:text-base">
                          {course.name}
                        </h4>
                        {course.isCompleted && (
                          <CheckCircle className="text-green-500" size={16} />
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-slate-200 rounded-full h-2 md:h-3">
                          <div
                            className="bg-blue-600 h-2 md:h-3 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs md:text-sm font-medium text-slate-600 w-8 md:w-12">
                          {progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {enrolledCourses.length === 0 && (
                <p className="text-slate-500 text-center py-8">
                  No enrolled courses yet. Start by enrolling in a course!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage />;
      case "courses":
        return <CoursesPage />;
      case "practice":
        return <PracticePage />;
      case "dashboard":
        return <DashboardPage />;
      default:
        return <HomePage />;
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        <Navbar />
        <main className="lg:ml-64 pt-16 lg:pt-0 p-4 md:p-8 overflow-x-hidden">
          <div className="max-w-6xl mx-auto flex items-center justify-center py-20 overflow-x-hidden">
            <div className="text-center space-y-4">
              <LoadingSpinner size="lg" />
              <p className="text-slate-600 text-lg">Loading GoCode...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Navbar />
      <main className="lg:ml-64 pt-16 lg:pt-0 overflow-x-hidden">
        {renderCurrentPage()}
      </main>
    </div>
  );
};

export default GoCodeWebsite;
