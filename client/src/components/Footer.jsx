import { useEffect, useState } from "react";
import { ArrowUpRight, Globe, Mail, MapPin, Phone } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/images/logo.webp";

const TIMES = { fontFamily: '"Times New Roman", Times, serif' };
const API_URL = "http://localhost:5000";

const FOUNDER_LINKEDIN =
  "https://www.linkedin.com/in/dr-shivam-jhamb-42070517a?utm_source=share_via&utm_content=profile&utm_medium=member_android";
const COMPANY_LINKEDIN = "https://www.linkedin.com/company/jashna-edu/";
const INSTAGRAM =
  "https://www.instagram.com/jashnaenglishclasses?igsi=bXA4OTJlcmZqcjR1";

const DEFAULT_SETTINGS = {
  instituteName: "Jashna Edu",
  contactEmail: "info@jashnaedu.com",
  contactNumber: "+91 99530 06751",
  whatsappNumber: "+91 99530 06751",
  websiteUrl: "https://www.jashnaedu.com/",
  address:
    "Jashna Edu, Block D, New Industrial Twp 2, New Industrial Township, Faridabad, Haryana 121001, India",
  footerDescription:
    "Empowering English language learners with communication skills and confidence.",
};

/*
=========================================================
ROUTES WHERE THE PUBLIC FOOTER MUST NOT APPEAR
=========================================================
The admin and student portals have their own fixed sidebar
layouts. The public footer spans the full page width, so on
those routes it ran underneath the sidebar. It is now hidden
there.
=========================================================
*/

const HIDDEN_FOOTER_PREFIXES = ["/admin", "/student"];

export default function Footer() {
  const { pathname } = useLocation();

  const hideFooter = HIDDEN_FOOTER_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // No need to load public settings when the footer is not shown.
    if (hideFooter) return undefined;

    const controller = new AbortController();

    async function fetchSettings() {
      try {
        const response = await fetch(`${API_URL}/api/settings/public`, {
          method: "GET",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to fetch institute settings.");
        }

        const result = await response.json();
        const data = result?.settings ?? result?.data ?? result;

        if (!data || typeof data !== "object") return;

        setSettings((previous) => ({
          ...previous,
          ...Object.fromEntries(
            Object.entries(DEFAULT_SETTINGS).map(([key, fallback]) => {
              const value = data[key];

              return [
                key,
                typeof value === "string" && value.trim()
                  ? value.trim()
                  : previous[key] || fallback,
              ];
            }),
          ),
        }));
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to load public institute settings:", error);
        }
      }
    }

    fetchSettings();

    return () => controller.abort();
  }, [hideFooter]);

  // Must come after all hooks.
  if (hideFooter) return null;

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  };

  const phoneHref = `tel:${settings.contactNumber.replace(/[^\d+]/g, "")}`;
  const emailHref = `mailto:${settings.contactEmail}`;

  const websiteLabel = settings.websiteUrl
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");

  return (
    <footer
      style={TIMES}
      className="relative isolate overflow-hidden border-t border-[#215e93]/15 bg-[#F3F7FB] text-[#173B5E]"
    >
      {/* TOP BRAND STRIPE */}
      <div className="absolute inset-x-0 top-0 z-20 flex h-1">
        <span className="w-[72%] bg-[#215e93]" />
        <span className="flex-1 bg-[#84e245]" />
      </div>

      {/* SUBTLE BACKGROUND DECORATION */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <motion.div
          className="absolute -left-40 -top-32 h-80 w-80 rounded-full bg-[#215e93]/[0.06] blur-3xl"
          animate={shouldReduceMotion ? {} : { scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-[#84e245]/[0.12] blur-3xl"
          animate={shouldReduceMotion ? {} : { scale: [1, 1.1, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="mx-auto w-full max-w-[1500px] px-4 pb-6 pt-12 sm:px-6 sm:pb-8 sm:pt-16 lg:px-10 lg:pt-20">
        {/* ==================================================
            CONTACT CTA
        ================================================== */}

        <section
          aria-labelledby="footer-cta-title"
          className="relative overflow-hidden rounded-2xl bg-[#215e93] px-5 py-7 text-white shadow-[0_16px_40px_rgba(33,94,147,0.18)] sm:rounded-3xl sm:px-8 sm:py-9 lg:px-12 lg:py-11"
        >
          {/* Green accent */}
          <span
            aria-hidden="true"
            className="absolute right-0 top-0 h-full w-1.5 bg-[#84e245]"
          />

          <div className="grid items-center gap-7 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#84e245] sm:text-sm sm:tracking-[0.28em]">
                Stay Connected
              </p>

              <h2
                id="footer-cta-title"
                className="mt-3 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
              >
                Let's build{" "}
                <span className="block text-[#84e245]">
                  better communication.
                </span>
              </h2>

              <p className="mt-3 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
                Have a question about our English language programs? Get in
                touch with our team.
              </p>
            </div>

            <div className="flex min-w-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <a
                href={phoneHref}
                className="inline-flex min-w-0 items-center justify-center gap-2.5 rounded-full bg-white px-4 py-3.5 text-base font-bold text-[#215e93] transition-colors duration-200 hover:bg-[#84e245] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:flex-1 sm:px-5"
              >
                <Phone size={19} className="shrink-0" />

                <span className="break-words text-center">
                  {settings.contactNumber}
                </span>
              </a>

              <a
                href={emailHref}
                className="inline-flex min-w-0 items-center justify-center gap-2.5 rounded-full border border-white/60 px-5 py-3.5 text-base font-bold text-white transition-colors duration-200 hover:border-[#84e245] hover:bg-[#84e245] hover:text-[#173B5E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:flex-1"
              >
                <Mail size={19} className="shrink-0" />
                Email Us
              </a>
            </div>
          </div>
        </section>

        {/* ==================================================
            MAIN FOOTER CONTENT
        ================================================== */}

        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 sm:gap-y-12 lg:mt-14 lg:grid-cols-[1.35fr_0.8fr_0.8fr_1.05fr] lg:gap-x-10 xl:gap-x-14">
          {/* BRAND */}
          <div className="min-w-0">
            <Link
              to="/"
              aria-label="Jashna Edu Home"
              className="inline-flex max-w-full items-center gap-3 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#215e93]"
            >
              <img
                src={logo}
                alt="Jashna Edu logo"
                className="h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16"
              />

              <span className="min-w-0">
                <span className="block whitespace-nowrap text-2xl font-bold tracking-wide text-[#215e93] sm:text-3xl">
                  JASHNA <span className="text-[#84e245]">EDU</span>
                </span>

                <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#173B5E]/70 sm:text-[11px]">
                  Learn. Communicate. Grow.
                </span>
              </span>
            </Link>

            <p className="mt-4 max-w-md break-words text-base leading-7 text-[#173B5E]/80 sm:text-lg sm:leading-8">
              {settings.footerDescription}
            </p>

            <a
              href={settings.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-5 inline-flex max-w-full items-center gap-2 break-all text-base font-bold text-[#215e93] transition-colors hover:text-[#173B5E]"
            >
              <Globe size={19} className="shrink-0" />

              <span className="underline decoration-[#84e245] decoration-2 underline-offset-4">
                {websiteLabel}
              </span>

              <ArrowUpRight
                size={17}
                className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </div>

          {/* EXPLORE */}
          <div className="min-w-0">
            <ColumnTitle>Explore</ColumnTitle>

            <div className="mt-5 flex flex-col items-start gap-3.5">
              <FooterLink to="/" label="Home" />
              <FooterLink to="/about" label="About Jashna" />
              <FooterLink to="/programs" label="Programs" />
              <FooterLink to="/ielts" label="IELTS Course" />
              <FooterLink to="/events" label="Events" />
              <FooterLink to="/careers" label="Careers" />
            </div>
          </div>

          {/* LEARN */}
          <div className="min-w-0">
            <ColumnTitle>Learn</ColumnTitle>

            <div className="mt-5 flex flex-col items-start gap-3.5">
              <FooterLink to="/assessment" label="Assessment" />
              <FooterLink to="/weekly-challenge" label="Weekly Challenge" />
              <FooterLink to="/testimonials" label="Testimonials" />
              <FooterLink to="/resources" label="Resources" />
            </div>
          </div>

          {/* CONNECT */}
          <div className="min-w-0">
            <ColumnTitle>Connect</ColumnTitle>

            <div className="mt-5 flex flex-col items-start gap-4">
              <SocialLink
                href={FOUNDER_LINKEDIN}
                icon="in"
                label="Founder LinkedIn"
              />

              <SocialLink
                href={COMPANY_LINKEDIN}
                icon="in"
                label="Jashna Edu LinkedIn"
              />

              <SocialLink href={INSTAGRAM} icon="ig" label="Instagram" />
            </div>

            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-[#215e93]/10 bg-white/70 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#215e93]/[0.07] text-[#215e93]">
                <MapPin size={20} />
              </span>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#215e93]">
                  Visit Us
                </p>

                <p className="mt-2 break-words text-sm leading-6 text-[#173B5E]/80 sm:text-base">
                  {settings.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            BOTTOM BAR
        ================================================== */}

        <div className="mt-10 border-t border-[#215e93]/15 pt-6 sm:mt-12 sm:pt-7">
          <div className="flex flex-col gap-5 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm leading-6 text-[#173B5E]/75 sm:text-base">
              © {new Date().getFullYear()} {settings.instituteName}. All rights
              reserved.
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-bold text-[#215e93] sm:text-base">
              <span>Better Communication</span>

              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-full bg-[#84e245]"
              />

              <span>Brighter Futures</span>
            </div>

            <motion.button
              type="button"
              onClick={scrollToTop}
              whileHover={shouldReduceMotion ? {} : { y: -2 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-full border border-[#215e93]/25 bg-white px-5 py-2.5 text-base font-bold text-[#215e93] transition-colors duration-200 hover:border-[#215e93] hover:bg-[#215e93] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#215e93]"
            >
              Back to Top
              <ArrowUpRight size={18} />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* FOOTER COLUMN HEADING */
function ColumnTitle({ children }) {
  return (
    <div>
      <h3 className="text-base font-bold uppercase tracking-[0.2em] text-[#215e93] sm:text-lg">
        {children}
      </h3>

      <span className="mt-2 block h-[3px] w-10 rounded-full bg-[#84e245]" />
    </div>
  );
}

/* INTERNAL NAVIGATION LINK */
function FooterLink({ to, label }) {
  return (
    <Link
      to={to}
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="group inline-flex max-w-full items-start gap-2 text-base font-bold leading-6 text-[#173B5E]/85 transition-colors duration-200 hover:text-[#215e93] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#215e93]"
    >
      <span className="break-words">{label}</span>

      <ArrowUpRight
        size={15}
        className="mt-1 shrink-0 text-[#215e93] opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
      />
    </Link>
  );
}

/* SOCIAL LINK */
function SocialLink({ href, icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex max-w-full items-center gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#215e93]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#215e93]/15 bg-white text-sm font-bold uppercase text-[#215e93] transition-colors duration-200 group-hover:border-[#215e93] group-hover:bg-[#215e93] group-hover:text-white">
        {icon}
      </span>

      <span className="break-words text-base font-bold leading-5 text-[#173B5E]/85 transition-colors duration-200 group-hover:text-[#215e93]">
        {label}
      </span>

      <ArrowUpRight
        size={16}
        className="shrink-0 text-[#215e93]/60 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    </a>
  );
}