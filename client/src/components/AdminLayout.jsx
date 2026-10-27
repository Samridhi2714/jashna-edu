import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LearningGoalsBadge } from "../hooks/useLearningGoalsNotifications";
import {
  CalendarDays,
  ClipboardCheck,
  FileCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  Trophy,
  Users,
  X,
  Menu,
  ArrowUpRight,
  BookOpen,
  ClipboardList,
  UserRoundPlus,
  Layers,
  Target,
  Briefcase,
  MessageCircle,
  Link2,
} from "lucide-react";

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");

    navigate("/admin/login", {
      replace: true,
    });
  };

  const closeMobile = () => {
    setMobileOpen(false);
  };

  const isActive = (href) => {
    if (href === "/admin/events") {
      return location.pathname === "/admin/events";
    }

    if (
      href === "/admin/challenges" ||
      href === "/admin/students" ||
      href === "/admin/attendance" ||
      href === "/admin/activities" ||
      href === "/admin/programs" ||
      href === "/admin/learning-goals" ||
      href === "/admin/careers"
    ) {
      return location.pathname.startsWith(href);
    }

    if (href === "/admin/dashboard") {
      return location.pathname === href;
    }

    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-[#F0F5F7]">
      {/* MOBILE TOP BAR */}
      <div className="sticky top-0 z-[90] flex h-[74px] items-center justify-between border-b border-[#102B4E]/10 bg-gradient-to-r from-[#F3F8FF] to-[#EAF4F8] px-5 shadow-md lg:hidden">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#1FA886]">
            JASHNA EDU
          </p>

          <p className="mt-0.5 font-display text-xl font-bold text-[#102B4E]">
            Admin Portal
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((previous) => !previous)}
          className="
            flex h-11 w-11 items-center justify-center rounded-xl
            border border-[#102B4E]/10 bg-white text-[#102B4E] shadow-md
            transition-all duration-200 hover:border-[#49C4A5]/50
            hover:bg-[#49C4A5]/10 hover:text-[#177A62] active:scale-90
          "
          aria-label={mobileOpen ? "Close admin menu" : "Open admin menu"}
        >
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[80] bg-[#102B4E]/30 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed left-0 top-0 z-[100] flex h-screen w-[285px] flex-col
          overflow-hidden border-r border-[#102B4E]/10
          bg-gradient-to-b from-[#F6FAFF] via-[#EEF6FC] to-[#E8F4F0]
          text-[#102B4E]
          shadow-[10px_0_40px_rgba(16,43,78,0.08)]
          transition-transform duration-300 lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* BRAND */}
        <div className="relative border-b border-[#102B4E]/10 px-6 py-7">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#338DFD]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-8 left-10 h-20 w-20 rounded-full bg-[#49C4A5]/20 blur-3xl" />

          <div className="relative">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.32em] text-[#1FA886]">
              JASHNA EDU
            </p>

            <h1 className="mt-1 font-display text-[26px] font-bold leading-tight text-[#102B4E]">
              Admin Portal
            </h1>

            <p className="mt-1 text-xs font-semibold text-[#102B4E]/55">
              Learning Management Workspace
            </p>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {/* OVERVIEW */}
          <AdminSectionLabel label="Overview" />

          <div className="space-y-1.5">
            <AdminNavItem
              to="/admin/dashboard"
              label="Dashboard"
              icon={<LayoutDashboard size={18} />}
              active={isActive("/admin/dashboard")}
              onClick={closeMobile}
            />
          </div>

          {/* STUDENT MANAGEMENT */}
          <div className="mt-8">
            <AdminSectionLabel label="Student Management" />

            <div className="space-y-1.5">
              <AdminNavItem
                to="/admin/students"
                label="Students"
                icon={<Users size={19} />}
                active={isActive("/admin/students")}
                onClick={closeMobile}
              />

              <AdminNavItem
                to="/admin/attendance"
                label="Attendance"
                icon={<ClipboardCheck size={19} />}
                active={isActive("/admin/attendance")}
                onClick={closeMobile}
              />

              <AdminNavItem
                to="/admin/activities"
                label="Activities"
                icon={<BookOpen size={18} />}
                active={isActive("/admin/activities")}
                onClick={closeMobile}
              />

              {/* LEARNING GOALS (with new-update notification badge) */}
              <AdminNavItem
                to="/admin/learning-goals"
                label="Learning Goals"
                icon={<Target size={19} />}
                active={isActive("/admin/learning-goals")}
                onClick={closeMobile}
                badge={<LearningGoalsBadge />}
              />

              <AdminNavItem
                to="/admin/submissions"
                label="Submissions & Review"
                icon={<FileCheck size={18} />}
                active={isActive("/admin/submissions")}
                onClick={closeMobile}
              />

              <AdminNavItem
                to="/admin/assessments-tasks"
                label="Assessments & Tasks"
                icon={<ClipboardList size={18} />}
                active={isActive("/admin/assessments-tasks")}
                onClick={closeMobile}
              />
            </div>
          </div>

          {/* CONTENT MANAGEMENT */}
          <div className="mt-8">
            <AdminSectionLabel label="Content Management" />

            <div className="space-y-1.5">
              <AdminNavItem
                to="/admin/events"
                label="Events"
                icon={<CalendarDays size={19} />}
                active={isActive("/admin/events")}
                onClick={closeMobile}
              />

              <AdminNavItem
                to="/admin/challenges"
                label="Challenges"
                icon={<Trophy size={19} />}
                active={isActive("/admin/challenges")}
                onClick={closeMobile}
              />

              <AdminNavItem
                to="/admin/programs"
                label="Programs"
                icon={<Layers size={19} />}
                active={isActive("/admin/programs")}
                onClick={closeMobile}
              />

              <AdminNavItem
                to="/admin/recent-admissions"
                label="Recent Admissions"
                icon={<UserRoundPlus size={19} />}
                active={isActive("/admin/recent-admissions")}
                onClick={closeMobile}
              />

              <AdminNavItem
                to="/admin/faqs"
                label="FAQs"
                icon={<MessageCircle size={19} />}
                active={isActive("/admin/faqs")}
                onClick={closeMobile}
              />

              <AdminNavItem
                to="/admin/assessment-links"
                label="Assessment Links"
                icon={<Link2 size={19} />}
                active={isActive("/admin/assessment-links")}
                onClick={closeMobile}
              />
            </div>
          </div>

          {/* OTHER */}
          <div className="mt-8">
            <AdminSectionLabel label="Other" />

            <div className="space-y-1.5">
              <AdminNavItem
                to="/admin/careers"
                label="Careers"
                icon={<Briefcase size={19} />}
                active={isActive("/admin/careers")}
                onClick={closeMobile}
              />

              <AdminNavItem
                to="/admin/settings"
                label="Settings"
                icon={<Settings size={18} />}
                active={isActive("/admin/settings")}
                onClick={closeMobile}
              />
            </div>
          </div>

          {/* STUDENT PORTAL QUICK ACCESS */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-[#102B4E]/10 bg-white/80 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div
                className="
                  flex h-10 w-10 shrink-0 items-center justify-center
                  rounded-xl bg-[#338DFD]/12 text-[#1D6FD8]
                "
              >
                <GraduationCap size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-extrabold text-[#102B4E]">
                  Student Portal
                </p>

                <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-[#102B4E]/55">
                  Quickly preview the learner login experience.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                closeMobile();
                navigate("/student/login");
              }}
              className="
                group mt-4 flex w-full items-center justify-between
                rounded-xl border border-[#102B4E]/10 bg-[#F3F8FF]
                px-3.5 py-3 text-xs font-extrabold text-[#102B4E]/70
                transition-all duration-200 hover:-translate-y-0.5
                hover:border-[#49C4A5]/50 hover:bg-[#49C4A5]/10
                hover:text-[#177A62] active:translate-y-0
                active:scale-[0.97]
              "
            >
              <span>Open Student Login</span>

              <ArrowUpRight
                size={15}
                className="
                  transition-transform duration-200
                  group-hover:translate-x-0.5 group-hover:-translate-y-0.5
                "
              />
            </button>
          </div>
        </div>

        {/* LOGOUT */}
        <div className="border-t border-[#102B4E]/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="
              group flex w-full items-center gap-3 rounded-xl px-3 py-3
              text-left text-sm font-extrabold text-[#102B4E]/65
              transition-all duration-200 hover:bg-red-50
              hover:text-red-600 active:scale-[0.98]
            "
          >
            <div
              className="
                flex h-9 w-9 items-center justify-center rounded-lg
                bg-[#102B4E]/[0.05] transition-all duration-200
                group-hover:bg-red-100
              "
            >
              <LogOut
                size={17}
                className="transition-transform duration-200 group-hover:-translate-x-0.5"
              />
            </div>

            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="min-h-screen bg-[#F0F5F7] lg:ml-[285px]">
        <div className="min-h-screen px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10 xl:px-14">
          <div className="mx-auto w-full max-w-[1500px]">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

/* SECTION LABEL */
function AdminSectionLabel({ label }) {
  return (
    <div className="mb-3 flex items-center gap-3 px-3">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#102B4E]/45">
        {label}
      </p>

      <div className="h-px flex-1 bg-[#102B4E]/10" />
    </div>
  );
}

/* ACTIVE NAV ITEM */
function AdminNavItem({ to, label, icon, active, onClick, badge }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={`
        group relative flex w-full items-center gap-3 overflow-hidden
        rounded-xl px-3 py-3 text-[15px] font-extrabold
        transition-all duration-250 active:scale-[0.97]
        ${
          active
            ? "bg-white text-[#102B4E] shadow-[0_8px_24px_rgba(51,141,253,0.16)] ring-1 ring-[#338DFD]/20"
            : "text-[#102B4E]/70 hover:-translate-y-[1px] hover:bg-white/70 hover:text-[#102B4E]"
        }
      `}
    >
      {/* Active indicator */}
      <span
        className={`
          absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2
          rounded-r-full bg-[#49C4A5]
          transition-all duration-300
          ${active ? "opacity-100" : "opacity-0 group-hover:opacity-70"}
        `}
      />

      {/* Icon */}
      <span
        className={`
          flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
          transition-all duration-300
          ${
            active
              ? "bg-gradient-to-br from-[#338DFD] to-[#38BDF8] text-white shadow-[0_6px_16px_rgba(51,141,253,0.3)]"
              : "bg-[#102B4E]/[0.05] text-[#102B4E]/55 group-hover:bg-[#338DFD]/15 group-hover:text-[#1D6FD8]"
          }
        `}
      >
        <span className="transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
          {icon}
        </span>
      </span>

      {/* Label */}
      <span className="relative z-10 flex-1">{label}</span>

      {/* Notification badge (rendered as-is; it styles itself) */}
      {badge && <span className="relative z-10 shrink-0">{badge}</span>}

      {/* Active dot */}
      <span
        className={`
          h-1.5 w-1.5 rounded-full bg-[#49C4A5]
          transition-all duration-300
          ${
            active
              ? "scale-100 opacity-100"
              : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-60"
          }
        `}
      />

      {/* Hover gradient */}
      <span
        className="
          pointer-events-none absolute inset-0 rounded-xl
          bg-gradient-to-r from-[#338DFD]/[0.05] via-transparent
          to-[#49C4A5]/[0.06] opacity-0 transition-opacity duration-300
          group-hover:opacity-100
        "
      />
    </NavLink>
  );
}

export default AdminLayout;
