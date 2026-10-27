import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserRound,
  ClipboardCheck,
  CalendarDays,
  Zap,
  LogOut,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
  Lock,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

/* =========================================================
   STUDENT PORTAL NAVIGATION
========================================================= */

const navigationItems = [
  {
    label: "Dashboard",
    path: "/student/dashboard",
    icon: LayoutDashboard,
    enabled: true,
    hint: "Your day at a glance",
  },
  {
    label: "My Profile",
    path: "/student/profile",
    icon: UserRound,
    enabled: true,
    hint: "Manage your profile",
  },
  {
    label: "Assessments & Tasks",
    path: "/student/tasks",
    icon: ClipboardCheck,
    enabled: true,
    hint: "View and submit tasks",
  },
  {
    label: "Attendance",
    path: "/student/attendance",
    icon: CalendarDays,
    enabled: true,
    hint: "Check your classes",
  },
  {
    label: "Monthly Activities",
    path: "/student/activities",
    icon: Zap,
    enabled: true,
    hint: "Practice every week",
  },
];

/* Title + subtitle shown in the top header for each page */
const pageMeta = {
  "/student/dashboard": {
    title: "Dashboard",
    subtitle: "Here is how your learning is going today.",
  },
  "/student/attendance": {
    title: "Attendance",
    subtitle: "Every class you attend builds your confidence.",
  },
  "/student/activities": {
    title: "Monthly Activities",
    subtitle: "Small activities, big improvement in speaking.",
  },
  "/student/profile": {
    title: "My Profile",
    subtitle: "Your Jashna Edu Identity.",
  },
  "/student/tasks": {
    title: "Assessments & Tasks",
    subtitle: "View assignments, submit your work, and track feedback.",
  },
};

/* =========================================================
   HELPERS
========================================================= */

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const getStudentName = () => {
  try {
    const raw = localStorage.getItem("studentData");
    if (!raw) return "Student";

    const data = JSON.parse(raw);
    const fullName = data?.name || data?.fullName || data?.username || "";

    return fullName ? String(fullName).split(" ")[0] : "Student";
  } catch {
    return "Student";
  }
};

/* =========================================================
   STUDENT PORTAL
========================================================= */

function StudentPortal() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const studentName = useMemo(() => getStudentName(), []);
  const greeting = useMemo(() => getGreeting(), []);

  const currentPage = pageMeta[location.pathname] || {
    title: "Student Portal",
    subtitle: "Learn · Speak · Grow",
  };

  /* =======================================================
     SIDE EFFECTS
  ======================================================= */

  // Close mobile drawer whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  // Top scroll progress bar
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      setScrollProgress(total > 0 ? (doc.scrollTop / total) * 100 : 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when drawer / modal is open + ESC to close
  useEffect(() => {
    const locked = mobileOpen || logoutOpen;
    document.body.style.overflow = locked ? "hidden" : "";

    const onKey = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setLogoutOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen, logoutOpen]);

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentData");

    navigate("/student/login", {
      replace: true,
    });
  };

  /* =======================================================
     DESKTOP NAVIGATION ITEM
  ======================================================= */

  const renderNavigationItem = (item) => {
    const Icon = item.icon;

    /* -----------------------------------------------------
       DISABLED ITEMS
       Visible but not functional yet.
    ----------------------------------------------------- */

    if (!item.enabled) {
      return (
        <div
          key={item.label}
          title={collapsed ? `${item.label} (coming soon)` : undefined}
          className={[
            "group relative flex cursor-not-allowed items-center rounded-2xl py-3.5 text-[15px] font-bold text-[#102b4e]/35 transition-colors duration-200 hover:bg-[#102b4e]/[0.03]",
            collapsed ? "justify-center px-0" : "gap-3.5 px-4",
          ].join(" ")}
        >
          <Icon size={21} strokeWidth={1.8} className="shrink-0" />

          {!collapsed && (
            <>
              <span>{item.label}</span>

              <span className="ml-auto flex items-center gap-1 rounded-full bg-[#102b4e]/[0.06] px-2 py-0.5 text-[10px] font-extrabold text-[#102b4e]/45 transition group-hover:bg-[#f2c14e]/25 group-hover:text-[#a87b0b]">
                <Lock size={10} />
                Soon
              </span>
            </>
          )}
        </div>
      );
    }

    /* -----------------------------------------------------
       ACTIVE / NORMAL NAVIGATION
    ----------------------------------------------------- */

    return (
      <NavLink
        key={item.label}
        to={item.path}
        title={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          [
            "group relative flex items-center overflow-hidden rounded-2xl py-3.5 text-[15px] font-extrabold",
            "transition-all duration-300 ease-out active:scale-[0.97]",
            collapsed ? "justify-center px-0" : "gap-3.5 px-4",
            isActive
              ? "bg-white text-[#102b4e] shadow-[0_10px_26px_rgba(51,141,253,0.16)] ring-1 ring-[#338DFD]/20"
              : "text-[#102b4e]/70 hover:translate-x-1 hover:bg-white/70 hover:text-[#102b4e]",
          ].join(" ")
        }
      >
        {({ isActive }) => (
          <>
            {/* ACTIVE INDICATOR */}

            {isActive && (
              <span className="absolute left-0 top-1/2 h-8 w-[4px] -translate-y-1/2 rounded-r-full bg-[#49C4A5]" />
            )}

            {/* SHINE SWEEP ON HOVER */}

            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#338DFD]/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

            <span
              className={[
                "relative flex shrink-0 items-center justify-center transition-transform duration-300",
                "group-hover:scale-110 group-hover:-rotate-6",
                isActive ? "text-[#1D6FD8]" : "",
              ].join(" ")}
            >
              <Icon size={21} strokeWidth={isActive ? 2.3 : 1.9} />
            </span>

            {!collapsed && (
              <>
                <span className="relative">{item.label}</span>

                {isActive ? (
                  <span className="relative ml-auto flex h-2.5 w-2.5">
                    <span className="portal-ping absolute inline-flex h-full w-full rounded-full bg-[#49C4A5]" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#49C4A5]" />
                  </span>
                ) : (
                  <span className="relative ml-auto translate-x-2 text-[11px] font-bold text-[#102b4e]/0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-[#102b4e]/50">
                    {item.hint}
                  </span>
                )}
              </>
            )}
          </>
        )}
      </NavLink>
    );
  };

  /* =======================================================
     MAIN RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f4f6f3] text-[#102b4e]">
      {/* Component-scoped animations */}
      <style>{`
        @keyframes portal-page-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes portal-drawer-in {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        @keyframes portal-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes portal-pop-in {
          from { opacity: 0; transform: scale(0.92) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes portal-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(18px, -22px) scale(1.08); }
        }
        @keyframes portal-ping {
          0%   { transform: scale(1); opacity: 0.7; }
          80%, 100% { transform: scale(2.6); opacity: 0; }
        }
        @keyframes portal-wave {
          0%, 60%, 100% { transform: rotate(0deg); }
          10%, 30%      { transform: rotate(16deg); }
          20%, 40%      { transform: rotate(-10deg); }
          50%           { transform: rotate(8deg); }
        }
        .portal-page   { animation: portal-page-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .portal-drawer { animation: portal-drawer-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .portal-fade   { animation: portal-fade-in 0.25s ease-out both; }
        .portal-pop    { animation: portal-pop-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .portal-float  { animation: portal-float 9s ease-in-out infinite; }
        .portal-ping   { animation: portal-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .portal-wave   { display: inline-block; transform-origin: 70% 70%; animation: portal-wave 2.6s ease-in-out 0.6s 1; }
        @media (prefers-reduced-motion: reduce) {
          .portal-page, .portal-drawer, .portal-fade, .portal-pop,
          .portal-float, .portal-ping, .portal-wave { animation: none !important; }
        }
      `}</style>

      {/* =================================================
          SCROLL PROGRESS BAR
      ================================================= */}

      <div className="fixed inset-x-0 top-0 z-[70] h-[3px] bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-[#61d6bd] via-[#4aa8d8] to-[#f2c14e] transition-[width] duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* =================================================
          MOBILE TOP BAR
      ================================================= */}

      <div className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-[#102b4e]/8 bg-white/85 px-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#102b4e] to-[#315779] text-sm font-black text-white shadow-md">
            J
          </div>

          <div>
            <p className="text-sm font-black text-[#102b4e]">
              {currentPage.title}
            </p>

            <p className="text-[11px] font-semibold text-[#8290a0]">
              Jashna Edu · Learn · Speak · Grow
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#102b4e]/10 bg-white text-[#315779] shadow-sm transition active:scale-90"
          aria-label="Toggle student navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* =================================================
          MOBILE NAVIGATION
      ================================================= */}

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* BACKDROP */}

          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="portal-fade absolute inset-0 bg-[#102b4e]/35 backdrop-blur-sm"
          />

          {/* DRAWER */}

          <aside className="portal-drawer relative z-10 flex h-full w-[310px] max-w-[88vw] flex-col overflow-hidden border-r border-[#102b4e]/10 bg-gradient-to-b from-[#F6FAFF] via-[#EEF6FC] to-[#E8F4F0] px-4 py-5 shadow-[20px_0_60px_rgba(16,43,78,0.18)]">
            {/* Decorative glow */}
            <div className="portal-float pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#61d6bd]/25 blur-3xl" />

            {/* BRAND */}

            <div className="relative flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#102b4e] to-[#315779] text-base font-black text-white shadow-md">
                  J
                </div>

                <div>
                  <p className="text-base font-black text-[#102b4e]">
                    Jashna Edu
                  </p>

                  <p className="text-[11px] font-semibold text-[#102b4e]/55">
                    Learn · Speak · Grow
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102b4e]/5 text-[#102b4e]/70 transition hover:bg-[#102b4e]/10 active:scale-90"
              >
                <X size={18} />
              </button>
            </div>

            {/* WELCOME CARD */}

            <div className="relative mt-7 rounded-2xl border border-[#102b4e]/10 bg-white/80 px-4 py-4 shadow-sm">
              <p className="text-xs font-semibold text-[#102b4e]/55">
                {greeting}
              </p>

              <p className="mt-0.5 text-lg font-black text-[#102b4e]">
                {studentName} <span className="portal-wave">👋</span>
              </p>
            </div>

            {/* NAVIGATION */}

            <nav className="relative mt-6 space-y-1.5">
              {navigationItems.map((item) => {
                const Icon = item.icon;

                if (!item.enabled) {
                  return (
                    <div
                      key={item.label}
                      className="flex cursor-not-allowed items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-bold text-[#102b4e]/35"
                    >
                      <Icon size={20} />

                      <span>{item.label}</span>

                      <span className="ml-auto flex items-center gap-1 rounded-full bg-[#102b4e]/[0.06] px-2 py-0.5 text-[10px] font-extrabold text-[#102b4e]/45">
                        <Lock size={10} />
                        Soon
                      </span>
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      [
                        "flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-extrabold transition active:scale-[0.97]",
                        isActive
                          ? "bg-white text-[#102b4e] shadow-[0_8px_22px_rgba(51,141,253,0.15)] ring-1 ring-[#338DFD]/20"
                          : "text-[#102b4e]/70 hover:bg-white/70 hover:text-[#102b4e]",
                      ].join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={20}
                          className={isActive ? "text-[#1D6FD8]" : ""}
                        />

                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* MOBILE SPACER */}

            <div className="flex-1" />

            {/* LOGOUT */}

            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              className="relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-extrabold text-red-500 transition hover:bg-red-50 hover:text-red-600 active:scale-[0.97]"
            >
              <LogOut size={20} />

              <span>Logout</span>
            </button>
          </aside>
        </div>
      )}

      {/* =================================================
          DESKTOP PORTAL
      ================================================= */}

      <div className="flex min-h-screen">
        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside
          className={[
            "fixed inset-y-0 left-0 z-40 hidden flex-col overflow-hidden border-r border-[#102b4e]/10 bg-gradient-to-b from-[#F6FAFF] via-[#EEF6FC] to-[#E8F4F0] shadow-[10px_0_40px_rgba(16,43,78,0.08)] lg:flex",
            "transition-[width] duration-300 ease-out",
            collapsed ? "w-[88px]" : "w-[290px]",
          ].join(" ")}
        >
          {/* Decorative floating glows */}
          <div className="portal-float pointer-events-none absolute -left-20 top-1/4 h-60 w-60 rounded-full bg-[#61d6bd]/20 blur-3xl" />
          <div
            className="portal-float pointer-events-none absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-[#4aa8d8]/15 blur-3xl"
            style={{ animationDelay: "-4s" }}
          />

          {/* -------------------------------------------------
              BRAND
          ------------------------------------------------- */}

          <div
            className={[
              "relative border-b border-[#102b4e]/10 py-7",
              collapsed ? "px-0" : "px-7",
            ].join(" ")}
          >
            <div
              className={[
                "flex items-center",
                collapsed ? "justify-center" : "gap-3.5",
              ].join(" ")}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#102b4e] to-[#315779] text-base font-black text-white shadow-md transition-transform duration-300 hover:rotate-6 hover:scale-110">
                J
              </div>

              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-lg font-black tracking-tight text-[#102b4e]">
                    Jashna Edu
                  </p>

                  <p className="mt-0.5 text-[11px] font-semibold text-[#102b4e]/55">
                    Learn · Speak · Grow
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* -------------------------------------------------
              NAVIGATION
          ------------------------------------------------- */}

          <div className="relative flex-1 overflow-y-auto overflow-x-hidden px-4 py-7">
            {!collapsed && (
              <p className="mb-3 px-4 text-[11px] font-black uppercase tracking-[0.18em] text-[#102b4e]/40">
                Your learning
              </p>
            )}

            <nav className="space-y-1.5">
              {navigationItems.map(renderNavigationItem)}
            </nav>
          </div>

          {/* -------------------------------------------------
              BOTTOM AREA
          ------------------------------------------------- */}

          <div className="relative border-t border-[#102b4e]/10 px-4 py-5">
            {!collapsed && (
              <div className="group mb-4 cursor-default overflow-hidden rounded-2xl border border-[#102b4e]/10 bg-white/80 px-4 py-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#49C4A5]/50 hover:bg-white">
                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-[#177A62]">
                  <Sparkles
                    size={12}
                    className="transition-transform duration-500 group-hover:rotate-180"
                  />
                  Your journey
                </p>

                <p className="mt-1.5 text-[13px] font-semibold leading-5 text-[#102b4e]/60">
                  Small progress adds up.
                </p>
              </div>
            )}

            {/* COLLAPSE TOGGLE */}

            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={[
                "mb-1.5 flex w-full items-center rounded-2xl py-3 text-sm font-extrabold text-[#102b4e]/55 transition hover:bg-white/70 hover:text-[#102b4e] active:scale-[0.97]",
                collapsed ? "justify-center px-0" : "gap-3.5 px-4",
              ].join(" ")}
            >
              {collapsed ? (
                <ChevronsRight size={20} />
              ) : (
                <>
                  <ChevronsLeft size={20} />
                  <span>Collapse menu</span>
                </>
              )}
            </button>

            {/* LOGOUT */}

            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              title={collapsed ? "Logout" : undefined}
              className={[
                "flex w-full items-center rounded-2xl py-3.5 text-[15px] font-extrabold text-[#102b4e]/65 transition hover:bg-red-50 hover:text-red-600 active:scale-[0.97]",
                collapsed ? "justify-center px-0" : "gap-3.5 px-4",
              ].join(" ")}
            >
              <LogOut size={20} />

              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <main
          className={[
            "min-w-0 flex-1 transition-[margin] duration-300 ease-out",
            collapsed ? "lg:ml-[88px]" : "lg:ml-[290px]",
          ].join(" ")}
        >
          {/* DESKTOP TOP HEADER */}

          <header className="sticky top-0 z-30 hidden items-center justify-between gap-6 border-b border-[#102b4e]/8 bg-[#f4f6f3]/80 px-8 py-5 backdrop-blur-xl xl:px-12 lg:flex">
            <div key={location.pathname} className="portal-page min-w-0">
              <h1 className="truncate text-2xl font-black tracking-tight text-[#102b4e]">
                {currentPage.title}
              </h1>

              <p className="mt-0.5 text-sm font-semibold text-[#718196]">
                {currentPage.subtitle}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-semibold text-[#8290a0]">
                  {greeting}
                </p>

                <p className="text-sm font-black text-[#102b4e]">
                  {studentName} <span className="portal-wave">👋</span>
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#315779] to-[#102b4e] text-base font-black text-white shadow-[0_10px_24px_rgba(16,43,78,0.25)] ring-2 ring-white transition duration-300 hover:-rotate-6 hover:scale-110">
                {studentName.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          {/* ROUTED PAGE — wide container + fade/slide on every route change */}

          <div
            key={location.pathname}
            className="portal-page mx-auto w-full max-w-[1680px] px-0 sm:px-2 lg:px-4 xl:px-6"
          >
            <Outlet />
          </div>
        </main>
      </div>

      {/* =================================================
          LOGOUT CONFIRMATION
      ================================================= */}

      {logoutOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Cancel logout"
            onClick={() => setLogoutOpen(false)}
            className="portal-fade absolute inset-0 bg-[#102b4e]/55 backdrop-blur-sm"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="portal-pop relative w-full max-w-[400px] rounded-3xl bg-white p-7 text-center shadow-[0_30px_80px_rgba(16,43,78,0.35)]"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <AlertTriangle size={30} />
            </div>

            <h2
              id="logout-title"
              className="mt-5 text-xl font-black text-[#102b4e]"
            >
              Log out now?
            </h2>

            <p className="mt-2 text-sm font-semibold leading-6 text-[#718196]">
              You will need to sign in again to see your attendance and weekly
              activities.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLogoutOpen(false)}
                className="rounded-2xl border border-[#102b4e]/10 bg-[#f4f6f3] px-4 py-3 text-sm font-extrabold text-[#315779] transition hover:bg-[#e9eef1] active:scale-95"
              >
                Stay signed in
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl bg-red-500 px-4 py-3 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(239,68,68,0.3)] transition hover:bg-red-600 active:scale-95"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentPortal;