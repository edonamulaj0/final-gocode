// --- Sidebar Widgets ---
// import React, { useMemo } from "react";
// function CalendarWidget() {
//   // Simple calendar for current month
//   const today = new Date();
//   const year = today.getFullYear();
//   const month = today.getMonth();
//   const firstDay = new Date(year, month, 1).getDay();
//   const daysInMonth = new Date(year, month + 1, 0).getDate();
//   const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
//   const days = useMemo(() => {
//     const arr = [];
//     for (let i = 0; i < firstDay; i++) arr.push(null);
//     for (let d = 1; d <= daysInMonth; d++) arr.push(d);
//     return arr;
//   }, [firstDay, daysInMonth]); // Only use necessary dependencies
//   return (
//     <div style={{ fontSize: "0.92em" }}>
//       <div style={{ display: "flex", gap: 2, marginBottom: 2 }}>
//         {weekDays.map((d) => (
//           <div
//             key={d}
//             style={{ width: 18, textAlign: "center", fontWeight: 600 }}
//           >
//             {d}
//           </div>
//         ))}
//       </div>
//       <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
//         {days.map((d, i) => (
//           <div
//             key={i}
//             style={{
//               width: 18,
//               height: 18,
//               textAlign: "center",
//               borderRadius: 3,
//               background: d === today.getDate() ? "var(--primary)" : undefined,
//               color: d === today.getDate() ? "var(--secondary)" : undefined,
//               fontWeight: d === today.getDate() ? 700 : 400,
//             }}
//           >
//             {d ? d : ""}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

function StudentStatsWidget({ _session }: { _session: unknown }) {
  // Placeholder: Replace with real stats if available
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
      <li>
        Courses: <b>3</b>
      </li>
      <li>
        Lessons Completed: <b>12</b>
      </li>
      <li>
        Current Level: <b>Intermediate</b>
      </li>
    </ul>
  );
}

function AssignmentRemindersWidget({ _session }: { _session: unknown }) {
  // Placeholder: Replace with real reminders if available
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
      <li>
        Math HW due <b>Aug 16</b>
      </li>
      <li>
        Science Quiz <b>Aug 18</b>
      </li>
      <li>
        Essay Draft <b>Aug 20</b>
      </li>
    </ul>
  );
}
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
    className={`sidebar-link ${
      currentPage === page ? "sidebar-link-active" : ""
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
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 z-10 sidebar-bg">
        <div className="p-6">
          <h1 className="sidebar-header text-2xl mb-4">MasterMore</h1>
          <div style={{ marginBottom: "1.5rem" }} />
          <nav className="space-y-2">
            {session && (
              <NavItem
                icon={BarChart3}
                label="Dashboard"
                page="dashboard"
                currentPage={currentPage}
                changePage={changePage}
              />
            )}
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

            {/* Auth Button */}
            {!session ? (
              <button
                onClick={() => signIn()}
                className="glass-button-primary w-full justify-center mt-6"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  minHeight: "2.2rem",
                }}
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
                className="glass-button-primary w-full justify-center mt-6"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  minHeight: "2.2rem",
                  background: "var(--glass-bg)",
                  color: "var(--primary)",
                  border: "1px solid var(--glass-border)",
                }}
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            )}
          </nav>
        </div>

        {/* Sidebar Widgets */}
        <div className="px-6 mt-6">
          {/* Integrated Calendar */}
          <div className="glass-card mb-4" style={{ padding: "0.7rem" }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: "1rem",
                marginBottom: "0.5rem",
              }}
            >
              Calendar
            </div>
            <div
              style={{
                fontSize: "0.95rem",
                color: "var(--primary)",
                opacity: 0.85,
              }}
            >
              {/* Simple calendar grid for current month */}
              {/* <CalendarWidget /> */}
            </div>
          </div>
          {/* Student Stats */}
          <div className="glass-card mb-4" style={{ padding: "0.7rem" }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: "1rem",
                marginBottom: "0.5rem",
              }}
            >
              Your Stats
            </div>
            <div
              style={{
                fontSize: "0.95rem",
                color: "var(--primary)",
                opacity: 0.85,
              }}
            >
              <StudentStatsWidget _session={session} />
            </div>
          </div>
          {/* Assignment Reminders */}
          <div className="glass-card" style={{ padding: "0.7rem" }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: "1rem",
                marginBottom: "0.5rem",
              }}
            >
              Reminders
            </div>
            <div
              style={{
                fontSize: "0.95rem",
                color: "var(--primary)",
                opacity: 0.85,
              }}
            >
              <AssignmentRemindersWidget _session={session} />
            </div>
          </div>
        </div>

        {/* User Profile in Sidebar (keep at bottom) */}
        {session && (
          <div className="absolute bottom-6 left-6 right-6">
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="glass-card bg-primary p-3 rounded-full">
                  <User size={20} className="text-secondary" />
                </div>
                <div>
                  <p className="font-medium text-primary text-sm">
                    {session.user?.name}
                  </p>
                  <p className="text-primary opacity-70 text-xs">
                    Class {session.user?.class}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 glass-header">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-primary">MasterMore</h1>
            {currentPage !== "home" && currentPage !== "dashboard" && (
              <>
                <span className="text-primary opacity-70">•</span>
                <span className="text-lg font-medium capitalize text-primary">
                  {currentPage}
                </span>
              </>
            )}
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="glass-button p-2"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-10 pt-16 glass-nav bg-primary">
          <div className="p-6">
            <nav className="space-y-4">
              {/* Navigation Items */}
              {!session && (
                <button
                  onClick={() => handleMobileNavClick("home")}
                  className={`sidebar-link text-secondary ${
                    currentPage === "home"
                      ? "bg-secondary text-primary"
                      : "hover:bg-secondary hover:bg-opacity-20"
                  }`}
                  role="menuitem"
                >
                  <Home size={20} />
                  <span className="font-medium">Home</span>
                </button>
              )}

              <button
                onClick={() => handleMobileNavClick("courses")}
                className={`sidebar-link text-secondary ${
                  currentPage === "courses"
                    ? "bg-secondary text-primary"
                    : "hover:bg-secondary hover:bg-opacity-20"
                }`}
                role="menuitem"
              >
                <BookOpen size={20} />
                <span className="font-medium">Courses</span>
              </button>

              <button
                onClick={() => handleMobileNavClick("assignments")}
                className={`sidebar-link text-secondary ${
                  currentPage === "assignments"
                    ? "bg-secondary text-primary"
                    : "hover:bg-secondary hover:bg-opacity-20"
                }`}
                role="menuitem"
              >
                <FileText size={20} />
                <span className="font-medium">Assignments</span>
              </button>

              {session && (
                <button
                  onClick={() => handleMobileNavClick("dashboard")}
                  className={`sidebar-link text-secondary ${
                    currentPage === "dashboard"
                      ? "bg-secondary text-primary"
                      : "hover:bg-secondary hover:bg-opacity-20"
                  }`}
                  role="menuitem"
                >
                  <BarChart3 size={20} />
                  <span className="font-medium">Dashboard</span>
                </button>
              )}

              {/* Auth Button */}
              {!session ? (
                <button
                  onClick={() => {
                    signIn();
                    setMobileMenuOpen(false);
                  }}
                  className="glass-button w-full justify-center bg-secondary text-primary border-secondary"
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
                  className="glass-button w-full justify-center bg-secondary text-primary border-secondary"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              )}
            </nav>

            {/* Mobile User Profile */}
            {session && (
              <div className="mt-8 glass-card bg-secondary p-4">
                <div className="flex items-center gap-3">
                  <div className="glass-card bg-primary p-3 rounded-full">
                    <User size={20} className="text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-primary text-sm">
                      {session.user?.name}
                    </p>
                    <p className="text-primary opacity-70 text-xs">
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
