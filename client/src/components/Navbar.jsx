import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";

import {
  Menu,
  X,
  ArrowUpRight,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";

import logo from "../assets/images/logo.webp";

/* Same font on Navbar + Footer */
const TIMES = { fontFamily: '"Times New Roman", Times, serif' };

/*
  THEME  (blue · teal · green)
  ink    #0F3B5C  → main text
  blue   #1E73B0  → brand blue (links, focus ring)
  teal   #0E8A8C  → secondary accent (hover tint, CTA gradient end)
  green  #84E245  → fresh accent (logo "Edu", underline end)
  mist   #EEF8F8  → soft hover background

  INTERACTION STATES
  hover       → soft teal/blue tint + text turns blue
  pressed     → slightly stronger tint
  active page → blue text + blue→teal→green underline
*/

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "IELTS", href: "/ielts" },
  { label: "Events", href: "/events" },
  { label: "Assessment", href: "/assessment" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Resources", href: "/resources" },
];

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E73B0]";

/* =========================================================
   IELTS NUDGE  (home page only)

   1. Right after the home page opens, a dotted blue→teal path
      quickly shoots out of the IELTS nav link (or the menu
      button on phones / tablets).
   2. It lands on a small outlined CLOUD that pops in with the
      text "Are you looking for IELTS?" and a "Explore" button
      → /ielts.
   3. The cloud floats gently, then fades away after ~4.5s.
========================================================= */

const NUDGE_START_DELAY = 300; // ms after the home page opens
const NUDGE_SHOW_MS = 4500; // total time on screen
const NUDGE_PATH_SECONDS = 0.35; // time the dotted path takes to draw
const NUDGE_ONCE_PER_SESSION = false; // true = show only once per browser session
const NUDGE_MAX_WIDTH = 270; // cloud width in px (was 380)

/* cloud outline, drawn in a "26 26 286 168" viewBox */
const CLOUD_PATH =
  "M 78 188 A 42 42 0 0 1 52 112 A 48 48 0 0 1 115 62 A 62 62 0 0 1 215 58 A 46 46 0 0 1 285 108 A 44 44 0 0 1 262 188 Z";
const CLOUD_RATIO = 168 / 286; // height / width

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function measureNudge() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // desktop IELTS link if visible, otherwise the mobile menu button
  const anchor = [
    ...document.querySelectorAll("[data-ielts-anchor], [data-menu-btn]"),
  ].find((el) => el.getClientRects().length > 0);

  const header = document.querySelector("header");
  const headerBottom = header ? header.getBoundingClientRect().bottom : 80;

  const rect = anchor?.getBoundingClientRect();
  const sx = rect ? rect.left + rect.width / 2 : vw - 48;
  const sy = rect ? rect.bottom + 2 : headerBottom - 8;

  const cardW = Math.min(NUDGE_MAX_WIDTH, vw - 24);
  const cardH = cardW * CLOUD_RATIO;
  const cardLeft = clamp(sx - cardW / 2, 12, vw - cardW - 12);
  const cardTop = headerBottom + 36;

  // path ends on the top of the cloud
  const ex = cardLeft + cardW * 0.49;
  const ey = cardTop + cardH * 0.05 - 3;

  const dy = ey - sy;
  const d = `M ${sx} ${sy} C ${sx + 24} ${sy + dy * 0.4}, ${ex - 24} ${
    ey - dy * 0.4
  }, ${ex} ${ey}`;

  return { vw, vh, sx, sy, ex, ey, d, cardW, cardH, cardLeft, cardTop };
}

function IeltsNudge() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  const [visible, setVisible] = useState(false);
  const [geo, setGeo] = useState(null);

  /* show → hide timers (home page only) */
  useEffect(() => {
    if (!isHome) {
      setVisible(false);
      return undefined;
    }

    try {
      if (NUDGE_ONCE_PER_SESSION && sessionStorage.getItem("ielts-nudge")) {
        return undefined;
      }
    } catch (e) {
      /* storage blocked – just show it */
    }

    const showTimer = setTimeout(() => {
      setGeo(measureNudge());
      setVisible(true);
      try {
        sessionStorage.setItem("ielts-nudge", "1");
      } catch (e) {
        /* ignore */
      }
    }, NUDGE_START_DELAY);

    const hideTimer = setTimeout(
      () => setVisible(false),
      NUDGE_START_DELAY + NUDGE_SHOW_MS
    );

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [isHome]);

  /* keep the path glued to the nav link if the window is resized */
  useEffect(() => {
    if (!visible) return undefined;
    const onResize = () => setGeo(measureNudge());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [visible]);

  const cloudDelay = NUDGE_PATH_SECONDS - 0.1;

  /* portal → the header has backdrop-blur, which would trap a fixed popup inside it */
  return createPortal(
    <AnimatePresence>
      {visible && geo && (
        <motion.div
          key="ielts-nudge"
          className="pointer-events-none fixed inset-0 z-[90]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={TIMES}
        >
          {/* ---------- dotted path ---------- */}
          <svg
            className="absolute inset-0 h-full w-full"
            width={geo.vw}
            height={geo.vh}
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="ielts-dots"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1={geo.sy}
                x2="0"
                y2={geo.ey}
              >
                <stop offset="0%" stopColor="#1E73B0" />
                <stop offset="100%" stopColor="#0E8A8C" />
              </linearGradient>

              {/* the mask makes the dots appear one after another */}
              <mask
                id="ielts-reveal"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width={geo.vw}
                height={geo.vh}
              >
                <motion.path
                  d={geo.d}
                  fill="none"
                  stroke="white"
                  strokeWidth="14"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: NUDGE_PATH_SECONDS, ease: "easeOut" }}
                />
              </mask>
            </defs>

            {/* pulse where the path leaves the nav */}
            <motion.circle
              cx={geo.sx}
              cy={geo.sy}
              r="5"
              fill="none"
              stroke="#1E73B0"
              strokeWidth="2"
              initial={{ r: 4, opacity: 0.8 }}
              animate={{ r: 12, opacity: 0 }}
              transition={{ duration: 0.5, repeat: 2, ease: "easeOut" }}
            />

            <path
              d={geo.d}
              fill="none"
              stroke="url(#ielts-dots)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="0.1 9"
              mask="url(#ielts-reveal)"
            />

            {/* landing dot */}
            <motion.circle
              cx={geo.ex}
              cy={geo.ey}
              r="4"
              fill="#0E8A8C"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: NUDGE_PATH_SECONDS - 0.05,
                type: "spring",
                stiffness: 500,
              }}
              style={{ transformOrigin: `${geo.ex}px ${geo.ey}px` }}
            />
          </svg>

          {/* ---------- cloud ---------- */}
          <motion.div
            role="status"
            className="pointer-events-auto absolute"
            style={{
              left: geo.cardLeft,
              top: geo.cardTop,
              width: geo.cardW,
              height: geo.cardH,
              transformOrigin: "50% 0%",
            }}
            initial={{ opacity: 0, scale: 0.5, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              delay: cloudDelay,
              type: "spring",
              stiffness: 520,
              damping: 22,
            }}
          >
            {/* gentle floating */}
            <motion.div
              className="relative h-full w-full"
              animate={{ y: [0, -4, 0] }}
              transition={{
                delay: cloudDelay + 0.3,
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* outlined cloud shape */}
              <svg
                viewBox="26 26 286 168"
                className="absolute inset-0 h-full w-full overflow-visible"
                style={{ filter: "drop-shadow(0 8px 12px rgba(15,59,92,0.18))" }}
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="ielts-cloud-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#EEF8F8" />
                  </linearGradient>
                  <linearGradient id="ielts-cloud-stroke" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1E73B0" />
                    <stop offset="55%" stopColor="#0E8A8C" />
                    <stop offset="100%" stopColor="#84E245" />
                  </linearGradient>
                </defs>

                <path d={CLOUD_PATH} fill="url(#ielts-cloud-fill)" />
                <motion.path
                  d={CLOUD_PATH}
                  fill="none"
                  stroke="url(#ielts-cloud-stroke)"
                  strokeWidth="5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: cloudDelay, duration: 0.3, ease: "easeOut" }}
                />
              </svg>

              {/* close */}
              <button
                type="button"
                onClick={() => setVisible(false)}
                aria-label="Dismiss"
                className={`absolute flex h-5 w-5 items-center justify-center rounded-full text-[#0F3B5C]/60 transition-colors hover:bg-[#0E8A8C]/10 hover:text-[#0E8A8C] ${FOCUS}`}
                style={{ left: "calc(79% - 10px)", top: "calc(21% - 10px)" }}
              >
                <X size={12} strokeWidth={2.8} />
              </button>

              {/* text inside the cloud */}
              <div
                className="absolute flex flex-col items-center justify-center text-center"
                style={{ left: "20%", right: "20%", top: "27%", bottom: "10%" }}
              >
                <p className="text-[13px] font-bold leading-tight text-[#0F3B5C]">
                  Are you looking for
                </p>
                <p className="mt-0.5 bg-gradient-to-r from-[#1E73B0] to-[#0E8A8C] bg-clip-text text-[26px] font-extrabold leading-none tracking-wide text-transparent">
                  IELTS?
                </p>

                <Link
                  to="/ielts"
                  onClick={() => setVisible(false)}
                  className={`mt-2 inline-flex h-7 items-center gap-1 whitespace-nowrap rounded-full bg-gradient-to-r from-[#1E73B0] to-[#0E8A8C] px-3.5 text-[13px] font-bold text-white shadow-[0_4px_10px_rgba(14,138,140,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:from-[#2585C6] hover:to-[#12A3A5] active:translate-y-0 active:from-[#17639A] active:to-[#0B7274] ${FOCUS}`}
                >
                  Explore
                  <ArrowUpRight size={14} strokeWidth={2.8} />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const location = useLocation();

  const closeMenu = () => setIsMenuOpen(false);

  /* SCROLL EFFECT */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* CLOSE MENU WHEN ROUTE CHANGES */
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const isActivePage = (href) => {
    if (href === "/") return location.pathname === "/";
    return (
      location.pathname === href || location.pathname.startsWith(`${href}/`)
    );
  };

  const adminActive = location.pathname.startsWith("/admin");

  return (
    <header
      style={TIMES}
      className={`
        fixed inset-x-0 top-0 z-[100] w-full
        border-b border-[#0E8A8C]/15 bg-white/95 backdrop-blur-xl
        transition-shadow duration-300
        ${
          isScrolled
            ? "shadow-[0_10px_30px_rgba(15,59,92,0.12)]"
            : "shadow-[0_1px_0_rgba(15,59,92,0.04)]"
        }
      `}
    >
      {/* brand accent line: blue → teal → green */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#1E73B0] via-[#0E8A8C] to-[#84E245]" />

      {/* =======================================================
          NAVBAR BAR
      ======================================================== */}

      <nav
        className={`
          mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4
          px-4 transition-all duration-300
          sm:px-8 xl:gap-4 xl:px-8 2xl:gap-6 2xl:px-10
          ${isScrolled ? "h-[72px] xl:h-[76px]" : "h-[78px] xl:h-[84px]"}
        `}
      >
        {/* ================= LOGO ================= */}
        <Link
          to="/"
          onClick={closeMenu}
          aria-label="Jashna Edu Home"
          className={`
            group flex shrink-0 items-center gap-3 rounded-xl py-1.5 pl-1.5 pr-3
            transition-colors duration-200
            hover:bg-[#0E8A8C]/10 active:bg-[#0E8A8C]/20
            ${FOCUS}
          `}
        >
          <motion.img
            src={logo}
            alt="Jashna Edu"
            className="h-12 w-12 rounded-lg object-contain sm:h-14 sm:w-14 xl:h-[58px] xl:w-[58px] 2xl:h-[64px] 2xl:w-[64px]"
            animate={{ rotateY: [0, 180, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d", backfaceVisibility: "visible" }}
          />

          <span className="hidden leading-none sm:block">
            <span className="block whitespace-nowrap text-[24px] font-bold tracking-[0.01em] text-[#1E73B0] xl:text-[23px] 2xl:text-[26px]">
              Jashna <span className="text-[#5FC21E]">Edu</span>
            </span>
            {/* tagline only on very wide screens (1850px+), so it never collides with the links */}
            <span className="mt-1.5 hidden whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0E8A8C] min-[1850px]:block">
              Empowering English Language Learners
            </span>
          </span>
        </Link>

        {/* ================= DESKTOP LINKS ================= */}
        <div className="hidden min-w-0 flex-1 items-center justify-center xl:flex xl:gap-0 2xl:gap-1">
          {navLinks.map((link) => {
            const active = isActivePage(link.href);

            return (
              <Link
                key={link.label}
                to={link.href}
                data-ielts-anchor={link.href === "/ielts" ? "true" : undefined}
                aria-current={active ? "page" : undefined}
                className={`
                  group relative flex shrink-0 items-center whitespace-nowrap rounded-lg
                  px-2 py-2.5 text-[16px] font-semibold leading-none
                  transition-colors duration-200
                  2xl:px-3.5 2xl:text-[20px]
                  ${FOCUS}
                  ${
                    active
                      ? "text-[#1E73B0] active:bg-[#0E8A8C]/20"
                      : "text-[#0F3B5C] hover:bg-[#0E8A8C]/10 hover:text-[#1E73B0] active:bg-[#0E8A8C]/20"
                  }
                `}
              >
                {link.label}

                {/* underline: always grows on hover, stays on the current page */}
                <span
                  className={`
                    absolute inset-x-2 bottom-0 h-[3px] origin-left rounded-full
                    bg-gradient-to-r from-[#1E73B0] via-[#0E8A8C] to-[#84E245]
                    transition-transform duration-300 2xl:inset-x-3.5
                    ${active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}
                  `}
                />
              </Link>
            );
          })}
        </div>

        {/* ================= DESKTOP ACTIONS ================= */}
        <div className="hidden shrink-0 items-center gap-2 xl:flex 2xl:gap-3">
          {/* ADMIN */}
          <Link
            to="/admin/login"
            className={`
              flex h-11 items-center gap-2 whitespace-nowrap rounded-full border-2 px-3.5
              text-[16px] font-semibold transition-colors duration-200
              2xl:h-12 2xl:px-5 2xl:text-[18px]
              ${FOCUS}
              ${
                adminActive
                  ? "border-[#0E8A8C] bg-[#0E8A8C]/10 text-[#0E8A8C]"
                  : "border-[#0E8A8C]/40 text-[#0F3B5C] hover:border-[#0E8A8C] hover:bg-[#0E8A8C]/10 hover:text-[#0E8A8C] active:bg-[#0E8A8C]/20"
              }
            `}
          >
            <ShieldCheck size={19} strokeWidth={2.2} />
            Admin
          </Link>

          {/* STUDENT PORTAL (primary call to action) */}
          <Link
            to="/student/login"
            className={`
              flex h-11 items-center gap-2 whitespace-nowrap rounded-full
              bg-gradient-to-r from-[#1E73B0] to-[#0E8A8C]
              px-4 text-[16px] font-semibold text-white
              shadow-[0_6px_16px_rgba(14,138,140,0.28)]
              transition-all duration-200
              hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(14,138,140,0.35)]
              hover:from-[#2585C6] hover:to-[#12A3A5]
              active:translate-y-0 active:from-[#17639A] active:to-[#0B7274]
              2xl:h-12 2xl:px-6 2xl:text-[18px]
              ${FOCUS}
            `}
          >
            <GraduationCap size={20} strokeWidth={2.3} />
            Student Portal
          </Link>
        </div>

        {/* ================= MOBILE BUTTON ================= */}
        <button
          type="button"
          data-menu-btn
          onClick={() => setIsMenuOpen((previous) => !previous)}
          className={`
            flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2
            transition-colors duration-200 xl:hidden
            ${FOCUS}
            ${
              isMenuOpen
                ? "border-[#0E8A8C] bg-[#0E8A8C]/10 text-[#0E8A8C]"
                : "border-[#0E8A8C]/35 text-[#0F3B5C] hover:bg-[#0E8A8C]/10 hover:text-[#0E8A8C] active:bg-[#0E8A8C]/20"
            }
          `}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {/* =======================================================
          MOBILE / TABLET MENU  (drops under the bar)
      ======================================================== */}

      <div
        className={`
          overflow-hidden bg-white transition-all duration-500 xl:hidden
          ${
            isMenuOpen
              ? "max-h-[calc(100vh-76px)] overflow-y-auto border-t border-[#0E8A8C]/15 opacity-100"
              : "pointer-events-none max-h-0 opacity-0"
          }
        `}
      >
        <div className="mx-auto max-w-[900px] px-4 py-4 sm:px-8 sm:py-6">
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-x-4">
            {navLinks.map((link) => {
              const active = isActivePage(link.href);

              return (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={closeMenu}
                  aria-current={active ? "page" : undefined}
                  className={`
                    flex items-center justify-between rounded-xl px-4 py-3.5
                    text-[19px] font-semibold transition-colors duration-200
                    ${
                      active
                        ? "bg-gradient-to-r from-[#1E73B0]/10 to-[#84E245]/15 text-[#1E73B0]"
                        : "text-[#0F3B5C] hover:bg-[#0E8A8C]/10 hover:text-[#1E73B0] active:bg-[#0E8A8C]/20"
                    }
                  `}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full bg-gradient-to-br from-[#0E8A8C] to-[#84E245] ${
                        active ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    {link.label}
                  </span>
                  <ArrowUpRight
                    size={20}
                    className={active ? "text-[#1E73B0]" : "text-[#0E8A8C]/50"}
                  />
                </Link>
              );
            })}
          </div>

          {/* portal buttons */}
          <div className="mt-5 grid grid-cols-1 gap-3 border-t border-[#0E8A8C]/15 pt-5 sm:grid-cols-2">
            <Link
              to="/admin/login"
              onClick={closeMenu}
              className={`
                flex items-center justify-center gap-2 rounded-full border-2 px-5 py-3.5
                text-[18px] font-semibold transition-colors duration-200
                ${
                  adminActive
                    ? "border-[#0E8A8C] bg-[#0E8A8C]/10 text-[#0E8A8C]"
                    : "border-[#0E8A8C]/40 text-[#0F3B5C] hover:bg-[#0E8A8C]/10 hover:text-[#0E8A8C] active:bg-[#0E8A8C]/20"
                }
              `}
            >
              <ShieldCheck size={21} />
              Admin
            </Link>

            <Link
              to="/student/login"
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1E73B0] to-[#0E8A8C] px-5 py-3.5 text-[18px] font-semibold text-white shadow-[0_6px_16px_rgba(14,138,140,0.25)] transition-all duration-200 hover:from-[#2585C6] hover:to-[#12A3A5] active:from-[#17639A] active:to-[#0B7274]"
            >
              <GraduationCap size={21} />
              Student Portal
            </Link>
          </div>
        </div>
      </div>

      {/* IELTS pop-up (home page only, auto-hides) */}
      <IeltsNudge />
    </header>
  );
}

export default Navbar;