import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { Menu, X, ArrowUpRight, Sparkles } from "lucide-react";

import { motion } from "framer-motion";

import logo from "../assets/images/logo.webp";

const navLinks = [
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Programs",
    href: "/programs",
  },
  {
    label: "Events",
    href: "/events",
  },
  {
    label: "Assessment",
    href: "/assessment",
  },
  {
    label: "Testimonials",
    href: "/testimonials",
  },
  {
    label: "Resources",
    href: "/resources",
  },
];

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const location = useLocation();

  /* =========================================================
     CLOSE MOBILE MENU
  ========================================================= */

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  /* =========================================================
     SCROLL EFFECT
  ========================================================= */

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 90);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =========================================================
     CLOSE MENU WHEN ROUTE CHANGES
  ========================================================= */

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  /* =========================================================
     ACTIVE PAGE
  ========================================================= */

  const isActivePage = (href) => {
    if (href === "/") {
      return location.pathname === "/";
    }

    return (
      location.pathname === href || location.pathname.startsWith(`${href}/`)
    );
  };

  /* =========================================================
     CONSULTATION LINK
  ========================================================= */

  const consultationHref =
    location.pathname === "/" ? "consultation" : "/consultation";

  return (
    <header
      className="
        fixed
        left-0
        right-0
        top-0
        z-[100]

        px-3
        pt-3

        sm:px-5
        lg:px-8
      "
    >
      {/* =======================================================
          NAVBAR
      ======================================================== */}

      <nav
        className={`
          relative

          mx-auto
          flex
          max-w-7xl
          items-center
          justify-between

          overflow-hidden
          rounded-2xl

          border

          px-3
          py-2.5

          sm:px-5
          lg:px-6

          transition-all
          duration-700
          ease-out

          ${
            isScrolled
              ? `
                border-white/10
                bg-[#10243E]/95
                shadow-[0_18px_55px_rgba(16,36,62,0.28)]
                backdrop-blur-2xl
              `
              : `
                border-[#10243E]/10
                bg-[#F8F6EF]/94
                shadow-[0_10px_35px_rgba(16,36,62,0.08)]
                backdrop-blur-xl
              `
          }
        `}
      >
        {/* =====================================================
            TOP ACCENT LINE
        ====================================================== */}

        <motion.div
          className="
            pointer-events-none

            absolute
            left-0
            right-0
            top-0

            h-[2px]

            bg-gradient-to-r
            from-transparent
            via-[#338DFD]
            to-[#49C4A5]
          "
          animate={{
            opacity: isScrolled ? 1 : 0.7,
          }}
          transition={{
            duration: 0.5,
          }}
        />

        {/* =====================================================
            SUBTLE INNER GLOW
        ====================================================== */}

        <div
          className={`
            pointer-events-none

            absolute
            inset-0

            rounded-2xl

            bg-gradient-to-r
            from-[#338DFD]/[0.035]
            via-transparent
            to-[#49C4A5]/[0.045]

            transition-opacity
            duration-700

            ${isScrolled ? "opacity-100" : "opacity-0"}
          `}
        />

        {/* =====================================================
            LOGO + WORDMARK
        ====================================================== */}

        <Link
          to="/"
          onClick={closeMenu}
          aria-label="Jashna Edu Home"
          className="
            group
            relative
            z-10

            flex
            shrink-0
            items-center
            gap-2.5
          "
        >
          {/* LOGO */}

          <motion.img
            src={logo}
            alt="Jashna Edu"
            className="
              h-[46px]
              w-[46px]

              object-contain

              sm:h-[50px]
              sm:w-[50px]
            "
            animate={{
              rotateY: [0, 180, 0],
              y: [0, -1.5, 0],
            }}
            transition={{
              rotateY: {
                duration: 4.8,
                repeat: Infinity,
                ease: "easeInOut",
              },
              y: {
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            whileHover={{
              scale: 1.08,
              rotateY: 180,
              transition: {
                duration: 0.6,
                ease: "easeInOut",
              },
            }}
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "visible",
            }}
          />

          {/* WORDMARK */}

          <div
            className="
              hidden
              leading-none

              sm:block
            "
          >
            <span
              className={`
                block

                font-display
                text-[17px]
                font-bold
                tracking-[0.08em]

                transition-colors
                duration-500

                ${isScrolled ? "text-white" : "text-[#10243E]"}

                group-hover:text-[#338DFD]
              `}
            >
              JASHNA
            </span>

            <span
              className="
                mt-1
                block

                text-[8px]
                font-bold
                tracking-[0.34em]

                text-[#338DFD]

                transition-colors
                duration-300

                group-hover:text-[#49C4A5]
              "
            >
              EDU
            </span>
          </div>
        </Link>

        {/* =====================================================
            DESKTOP NAVIGATION
        ====================================================== */}

        <div
          className="
            relative
            z-10

            hidden
            items-center
            gap-1

            lg:flex
          "
        >
          {navLinks.map((link) => {
            const active = isActivePage(link.href);

            return (
              <Link
                key={link.label}
                to={link.href}
                className={`
                  group
                  relative

                  rounded-full

                  px-4
                  py-2.5

                  text-[14px]
                  font-bold
                  tracking-[0.01em]

                  transition-all
                  duration-300
                  ease-out

                  active:scale-95

                  ${
                    active
                      ? `
                        bg-gradient-to-r
                        from-[#338DFD]/[0.10]
                        to-[#49C4A5]/[0.10]

                        text-[#338DFD]

                        shadow-[0_4px_18px_rgba(51,141,253,0.08)]
                      `
                      : `
                        ${isScrolled ? "text-white/85" : "text-[#10243E]/80"}

                        hover:-translate-y-[1px]

                        hover:text-[#338DFD]

                        hover:bg-gradient-to-r
                        hover:from-[#338DFD]/[0.07]
                        hover:to-[#49C4A5]/[0.07]
                      `
                  }
                `}
              >
                {/* HOVER LIGHT */}

                <span
                  className="
                    pointer-events-none

                    absolute
                    inset-0

                    rounded-full

                    bg-gradient-to-r
                    from-[#338DFD]/[0.08]
                    via-transparent
                    to-[#49C4A5]/[0.08]

                    opacity-0

                    transition-opacity
                    duration-300

                    group-hover:opacity-100
                  "
                />

                {/* TEXT */}

                <span className="relative z-10">{link.label}</span>

                {/* ACTIVE / HOVER LINE */}

                <span
                  className={`
                    absolute

                    bottom-[5px]
                    left-1/2

                    h-[2px]

                    -translate-x-1/2

                    rounded-full

                    bg-gradient-to-r
                    from-[#338DFD]
                    to-[#49C4A5]

                    shadow-[0_0_8px_rgba(51,141,253,0.35)]

                    transition-all
                    duration-300

                    ${
                      active
                        ? "w-7 opacity-100"
                        : "w-0 opacity-0 group-hover:w-7 group-hover:opacity-100"
                    }
                  `}
                />
              </Link>
            );
          })}
        </div>

        {/* =====================================================
            DESKTOP CTA
        ====================================================== */}

        <Link
          to={consultationHref}
          className="
            group
            relative
            z-10

            hidden

            items-center
            gap-2

            overflow-hidden
            rounded-full

            bg-gradient-to-r
            from-[#338DFD]
            to-[#49C4A5]

            px-5
            py-2.5

            text-sm
            font-bold
            text-white

            shadow-[0_7px_22px_rgba(51,141,253,0.22)]

            transition-all
            duration-300

            hover:-translate-y-0.5

            hover:shadow-[0_12px_32px_rgba(51,141,253,0.32)]

            active:translate-y-0
            active:scale-95

            lg:flex
          "
        >
          {/* SHINE */}

          <span
            className="
              pointer-events-none

              absolute
              inset-y-0
              -left-12

              w-8

              rotate-12

              bg-white/30

              blur-sm

              transition-all
              duration-700

              group-hover:left-[115%]
            "
          />

          {/* SOFT HOVER GLOW */}

          <span
            className="
              pointer-events-none

              absolute
              inset-0

              bg-white/10

              opacity-0

              transition-opacity
              duration-300

              group-hover:opacity-100
            "
          />

          <span className="relative z-10">Book Consultation</span>

          <ArrowUpRight
            size={16}
            className="
              relative
              z-10

              transition-all
              duration-300

              group-hover:translate-x-0.5
              group-hover:-translate-y-0.5
            "
          />
        </Link>

        {/* =====================================================
            MOBILE MENU BUTTON
        ====================================================== */}

        <button
          type="button"
          onClick={() => setIsMenuOpen((previous) => !previous)}
          className={`
            group
            relative
            z-10

            flex
            h-10
            w-10

            items-center
            justify-center

            rounded-full

            border

            transition-all
            duration-300

            active:scale-90

            lg:hidden

            ${
              isScrolled
                ? `
                  border-white/15
                  bg-white/10
                  text-white

                  hover:border-[#49C4A5]/50
                  hover:bg-[#49C4A5]/10
                  hover:text-[#49C4A5]
                `
                : `
                  border-[#10243E]/10
                  bg-white/60
                  text-[#10243E]

                  hover:border-[#338DFD]/30
                  hover:bg-[#338DFD]/[0.07]
                  hover:text-[#338DFD]
                `
            }
          `}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </nav>

      {/* =======================================================
          MOBILE NAVIGATION
      ======================================================== */}

      <div
        className={`
          mx-auto
          mt-2
          max-w-7xl

          overflow-hidden
          rounded-2xl

          border
          border-white/10

          bg-[#10243E]/[0.98]

          shadow-[0_20px_60px_rgba(16,36,62,0.30)]

          backdrop-blur-2xl

          transition-all
          duration-500

          lg:hidden

          ${
            isMenuOpen
              ? `
                max-h-[700px]
                translate-y-0
                opacity-100
              `
              : `
                pointer-events-none
                max-h-0
                -translate-y-3
                opacity-0
              `
          }
        `}
      >
        {/* TOP GRADIENT */}

        <div
          className="
            h-[2px]

            bg-gradient-to-r
            from-[#338DFD]
            via-[#49C4A5]
            to-[#338DFD]
          "
        />

        <div className="p-5">
          {/* MOBILE LABEL */}

          <div
            className="
              mb-3

              flex
              items-center
              gap-2
            "
          >
            <Sparkles size={12} className="text-[#49C4A5]" />

            <span
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.3em]
                text-[#49C4A5]
              "
            >
              Explore Jashna
            </span>

            <div
              className="
                h-px
                flex-1

                bg-gradient-to-r
                from-[#49C4A5]/40
                to-transparent
              "
            />
          </div>

          {/* MOBILE LINKS */}

          <div className="flex flex-col">
            {navLinks.map((link, index) => {
              const active = isActivePage(link.href);

              return (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={closeMenu}
                  className={`
                    group

                    flex
                    items-center
                    justify-between

                    border-b
                    border-white/[0.08]

                    py-4

                    text-[15px]
                    font-bold

                    transition-all
                    duration-300

                    active:scale-[0.98]

                    ${
                      active
                        ? "text-white"
                        : "text-white/75 hover:pl-1 hover:text-white"
                    }
                  `}
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <span
                      className={`
                        h-1.5
                        w-1.5

                        rounded-full

                        transition-all
                        duration-300

                        ${
                          active
                            ? `
                              scale-100

                              bg-[#49C4A5]

                              shadow-[0_0_10px_rgba(73,196,165,0.65)]
                            `
                            : `
                              scale-0

                              bg-[#338DFD]

                              group-hover:scale-100
                            `
                        }
                      `}
                    />

                    <span>{link.label}</span>
                  </div>

                  <span
                    className={`
                      text-[10px]
                      font-bold
                      tracking-[0.1em]

                      ${active ? "text-[#49C4A5]" : "text-white/25"}
                    `}
                  >
                    0{index + 1}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* MOBILE CTA */}

          <Link
            to={consultationHref}
            onClick={closeMenu}
            className="
              group
              relative

              mt-5

              flex
              items-center
              justify-center
              gap-2

              overflow-hidden
              rounded-full

              bg-gradient-to-r
              from-[#338DFD]
              to-[#49C4A5]

              px-5
              py-3

              text-sm
              font-bold
              text-white

              shadow-[0_8px_25px_rgba(51,141,253,0.25)]

              transition-all
              duration-300

              hover:-translate-y-0.5

              hover:shadow-[0_12px_32px_rgba(51,141,253,0.35)]

              active:translate-y-0
              active:scale-95
            "
          >
            {/* SHINE */}

            <span
              className="
                pointer-events-none

                absolute
                inset-y-0
                -left-10

                w-8

                rotate-12

                bg-white/25

                blur-sm

                transition-all
                duration-700

                group-hover:left-[110%]
              "
            />

            <span className="relative z-10">Book Consultation</span>

            <ArrowUpRight
              size={16}
              className="
                relative
                z-10

                transition-transform
                duration-300

                group-hover:translate-x-0.5
                group-hover:-translate-y-0.5
              "
            />
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
