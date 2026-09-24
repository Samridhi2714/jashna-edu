import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import {
  CalendarDays,
  FileText,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";

/* =========================================================
   ADMIN LAYOUT
========================================================= */

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");

    navigate("/admin/login");
  };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const navigation = [
    {
      label: "Events",
      path: "/admin/events",
      icon: CalendarDays,
    },
    {
      label: "Challenges",
      path: "/admin/challenges",
      icon: Trophy,
    },
  ];

  const secondaryNavigation = [
    {
      label: "Blog",
      icon: FileText,
      soon: true,
    },
    {
      label: "Settings",
      icon: Settings,
      soon: true,
    },
  ];

  /* =======================================================
     SIDEBAR CONTENT
  ======================================================= */

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex h-full flex-col">
      {/* ---------------------------------------------------
          BRAND
      --------------------------------------------------- */}

      <div className="border-b border-white/10 px-6 py-6">
        <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#d7b46a]">
          Jashna Edu
        </p>

        <h1 className="mt-1 font-display text-[23px] leading-tight text-white">
          Admin Portal
        </h1>

        <p className="mt-1 text-[11px] text-white/40">
          Content Management
        </p>
      </div>

      {/* ---------------------------------------------------
          NAVIGATION
      --------------------------------------------------- */}

      <nav className="flex-1 px-3 py-5">
        <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
          Manage
        </p>

        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.path === "/admin/events"
                ? location.pathname === "/admin/events" ||
                  location.pathname.startsWith("/admin/events/")
                : item.path === "/admin/challenges"
                  ? location.pathname === "/admin/challenges" ||
                    location.pathname.startsWith("/admin/challenges/")
                  : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => mobile && setMobileOpen(false)}
                className={`
                  group
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-2.5
                  text-sm
                  font-medium
                  transition-all
                  duration-200
                  ${
                    isActive
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                  }
                `}
              >
                <Icon
                  size={17}
                  className={
                    isActive
                      ? "text-[#d7b46a]"
                      : "text-white/40 group-hover:text-white/70"
                  }
                />

                <span>{item.label}</span>

                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* -------------------------------------------------
            OTHER SECTIONS
        ------------------------------------------------- */}

        <p className="mb-2 mt-7 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
          Other
        </p>

        <div className="space-y-1">
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                disabled
                className="
                  flex
                  w-full
                  cursor-not-allowed
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-2.5
                  text-sm
                  text-white/25
                "
              >
                <Icon size={17} />

                <span>{item.label}</span>

                {item.soon && (
                  <span className="ml-auto text-[8px] font-bold uppercase tracking-wider text-white/25">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ---------------------------------------------------
          LOGOUT
      --------------------------------------------------- */}

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-3
            py-2.5
            text-sm
            font-medium
            text-white/55
            transition
            hover:bg-white/[0.06]
            hover:text-white
          "
        >
          <LogOut size={17} />

          Logout
        </button>
      </div>
    </div>
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-jashna-charcoal">
      {/* ===================================================
          DESKTOP SIDEBAR
      =================================================== */}

      <aside
        className="
          fixed
          inset-y-0
          left-0
          z-50
          hidden
          w-[230px]
          bg-[#142b49]
          shadow-[4px_0_20px_rgba(20,43,73,0.08)]
          lg:block
        "
      >
        <SidebarContent />
      </aside>

      {/* ===================================================
          MOBILE OVERLAY
      =================================================== */}

      {mobileOpen && (
        <div
          className="
            fixed
            inset-0
            z-[60]
            bg-black/40
            backdrop-blur-sm
            lg:hidden
          "
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ===================================================
          MOBILE SIDEBAR
      =================================================== */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-[70]
          w-[260px]
          bg-[#142b49]
          shadow-2xl
          transition-transform
          duration-300
          lg:hidden
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="
            absolute
            right-4
            top-4
            rounded-full
            p-2
            text-white/50
            transition
            hover:bg-white/10
            hover:text-white
          "
        >
          <X size={18} />
        </button>

        <SidebarContent mobile />
      </aside>

      {/* ===================================================
          MAIN AREA
      =================================================== */}

      <div className="lg:pl-[230px]">
        {/* -------------------------------------------------
            MOBILE TOP BAR
        ------------------------------------------------- */}

        <header
          className="
            sticky
            top-0
            z-40
            border-b
            border-black/[0.06]
            bg-white/95
            backdrop-blur
            lg:hidden
          "
        >
          <div className="flex items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="
                rounded-xl
                border
                border-black/[0.08]
                bg-white
                p-2.5
                text-[#142b49]
              "
            >
              <Menu size={19} />
            </button>

            <div className="text-center">
              <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#b48a35]">
                Jashna Edu
              </p>

              <p className="font-display text-lg text-[#142b49]">
                Admin Portal
              </p>
            </div>

            <div className="w-10" />
          </div>
        </header>

        {/* -------------------------------------------------
            PAGE CONTENT
        ------------------------------------------------- */}

        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;