import React from "react";
import { signIn, signOut } from "next-auth/react";
import { Session } from "next-auth";
import {
  Home,
  BookOpen,
  FileText,
  BarChart3,
  UserPlus,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";

interface NavbarProps {
  session: Session | null;
  currentPage: string;
  changePage: (page: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

interface NavItemProps {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  page: string;
  currentPage: string;
  changePage: (page: string) => void;
}

const NavItem = ({
  icon: Icon,
  label,
  page,
  currentPage,
  changePage,
}: NavItemProps) => (
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

const Navbar = ({
  session,
  currentPage,
  changePage,
  mobileMenuOpen,
  setMobileMenuOpen,
}: NavbarProps) => {
  const handleMobileNavClick = (page: string) => {
    changePage(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-slate-900 text-white shadow-xl z-10">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-400 mb-8">GoCode</h1>
          <nav className="space-y-4">
            {!session && (
              <NavItem
                icon={Home}
                label="Home"
                page="home"
                currentPage={currentPage}
                changePage={changePage}
              />
            )}
            <NavItem
              icon={BookOpen}
              label="Courses"
              page="courses"
              currentPage={currentPage}
              changePage={changePage}
            />
            <NavItem
              icon={FileText}
              label="Assignments"
              page="assignments"
              currentPage={currentPage}
              changePage={changePage}
            />
            {session && (
              <NavItem
                icon={BarChart3}
                label="Dashboard"
                page="dashboard"
                currentPage={currentPage}
                changePage={changePage}
              />
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
            {currentPage !== "home" && currentPage !== "dashboard" && (
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
              {!session && (
                <button
                  onClick={() => handleMobileNavClick("home")}
                  className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    currentPage === "home"
                      ? "bg-blue-600 text-white shadow-md"
                      : "hover:bg-slate-800 text-slate-300 hover:text-white"
                  }`}
                  aria-current={currentPage === "home" ? "page" : undefined}
                  role="menuitem"
                >
                  <Home size={20} />
                  <span className="font-medium">Home</span>
                </button>
              )}
              <button
                onClick={() => handleMobileNavClick("courses")}
                className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  currentPage === "courses"
                    ? "bg-blue-600 text-white shadow-md"
                    : "hover:bg-slate-800 text-slate-300 hover:text-white"
                }`}
                aria-current={currentPage === "courses" ? "page" : undefined}
                role="menuitem"
              >
                <BookOpen size={20} />
                <span className="font-medium">Courses</span>
              </button>
              <button
                onClick={() => handleMobileNavClick("assignments")}
                className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  currentPage === "assignments"
                    ? "bg-blue-600 text-white shadow-md"
                    : "hover:bg-slate-800 text-slate-300 hover:text-white"
                }`}
                aria-current={
                  currentPage === "assignments" ? "page" : undefined
                }
                role="menuitem"
              >
                <FileText size={20} />
                <span className="font-medium">Assignments</span>
              </button>
              {session && (
                <button
                  onClick={() => handleMobileNavClick("dashboard")}
                  className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    currentPage === "dashboard"
                      ? "bg-blue-600 text-white shadow-md"
                      : "hover:bg-slate-800 text-slate-300 hover:text-white"
                  }`}
                  aria-current={
                    currentPage === "dashboard" ? "page" : undefined
                  }
                  role="menuitem"
                >
                  <BarChart3 size={20} />
                  <span className="font-medium">Dashboard</span>
                </button>
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
};

export default Navbar;
