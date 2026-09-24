import {
  ArrowUpRight,
  Globe,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import logo from "../assets/images/logo.webp";

const WEBSITE_URL = "https://www.jashnaedu.com/";
const FOUNDER_LINKEDIN =
  "https://www.linkedin.com/in/dr-shivam-jhamb-42070517a?utm_source=share_via&utm_content=profile&utm_medium=member_android";
const COMPANY_LINKEDIN =
  "https://www.linkedin.com/company/jashna-edu/";
const INSTAGRAM =
  "https://www.instagram.com/jashnaenglishclasses?igsi=bXA4OTJlcmZqcjR1";

const PHONE = "+91 99530 06751";
const EMAIL = "info@jashnaedu.com";

const ADDRESS =
  "Jashna Edu, Block D, New Industrial Twp 2, New Industrial Township, Faridabad, Haryana 121001, India";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="relative overflow-hidden bg-[#102443] text-white">
      {/* =====================================================
          BACKGROUND DECORATION
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-[#338DFD]/10 blur-[120px]"
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.45, 0.7, 0.45],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-[#49C4A5]/10 blur-[120px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.65, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.5)_1px,transparent_0)] [background-size:28px_28px]" />
      </div>

      {/* =====================================================
          MAIN FOOTER
      ====================================================== */}

      <div className="relative z-10 mx-auto max-w-[1280px] px-5 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20">

        {/* ===================================================
            TOP BRAND / CTA AREA
        ==================================================== */}

        <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          {/* BRAND */}

          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.07] shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
                <img src={logo} alt="JashnaEdu Logo" className="h-10 w-10 rounded-2xl" />
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-[-0.03em] text-white">
                  Jashna<span className="text-[#67D4B7]">Edu</span>
                </h2>

                <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.28em] text-white/45">
                  Better Communication • Brighter Futures
                </p>
              </div>
            </div>

            <p className="mt-6 max-w-xl text-sm leading-7 text-white/60 sm:text-base sm:leading-8">
              Building stronger communication, confident expression and
              brighter opportunities through purposeful English learning.
            </p>

            {/* WEBSITE */}

            <a
              href={WEBSITE_URL}
              target="_blank"
              rel="noreferrer"
              className="group mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[#75DCC2] transition-colors hover:text-white"
            >
              <Globe size={15} />

              <span>www.jashnaedu.com</span>

              <ArrowUpRight
                size={13}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </div>

          {/* CONTACT CTA */}

          <div className="lg:text-right">
            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#67D4B7]">
              Stay Connected
            </p>

            <h3 className="mt-3 font-serif text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Let&apos;s build
              <span className="block text-[#67D4B7]">
                better communication.
              </span>
            </h3>

            <a
              href={`tel:${PHONE.replace(/\s/g, "")}`}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-5 py-3 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#67D4B7]/30 hover:bg-white/10"
            >
              <Phone size={14} className="text-[#67D4B7]" />
              {PHONE}
            </a>
          </div>
        </div>

        {/* ===================================================
            DIVIDER
        ==================================================== */}

        <div className="my-12 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {/* ===================================================
            FOOTER COLUMNS
        ==================================================== */}

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1fr_0.7fr_0.9fr_1.4fr]">

          {/* EXPLORE */}

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/40">
              Explore
            </p>

            <div className="mt-5 space-y-3">
              <FooterLink to="/" label="Home" />
              <FooterLink to="/programs" label="Programs" />
              <FooterLink to="/events" label="Events" />
              <FooterLink to="/assessment" label="Assessment" />
              <FooterLink to="/about" label="About Jashna" />
              <FooterLink
                to="/weekly-challenge"
                label="Weekly Challenge"
              />
            </div>
          </div>

          {/* LEARN */}

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/40">
              Learn
            </p>

            <div className="mt-5 space-y-3">
              <FooterLink
                to="/weekly-challenge"
                label="Weekly Challenge"
              />

              <FooterLink
                to="/assessment"
                label="Skill Assessment"
              />

              <FooterLink
                to="/programs"
                label="Learning Programs"
              />

              <FooterLink
                to="/events"
                label="Jashna Events"
              />
            </div>
          </div>

          {/* SOCIAL */}

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/40">
              Connect
            </p>

            <div className="mt-5 space-y-3">
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

              <SocialLink
                href={INSTAGRAM}
                icon="ig"
                label="Instagram"
              />
            </div>
          </div>

          {/* CONTACT */}

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/40">
              Contact
            </p>

            <div className="mt-5 space-y-5">

              {/* PHONE */}

              <a
                href={`tel:${PHONE.replace(/\s/g, "")}`}
                className="group flex items-start gap-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                  <Phone
                    size={15}
                    className="text-[#67D4B7]"
                  />
                </span>

                <span>
                  <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">
                    Phone
                  </span>

                  <span className="mt-1 block text-xs font-medium text-white/70 transition-colors group-hover:text-white">
                    {PHONE}
                  </span>
                </span>
              </a>

              {/* EMAIL */}

              <a
                href={`mailto:${EMAIL}`}
                className="group flex items-start gap-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                  <Mail
                    size={15}
                    className="text-[#67D4B7]"
                  />
                </span>

                <span>
                  <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">
                    Email
                  </span>

                  <span className="mt-1 block text-xs font-medium text-white/70 transition-colors group-hover:text-white">
                    {EMAIL}
                  </span>
                </span>
              </a>

              {/* ADDRESS */}

              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                  <MapPin
                    size={15}
                    className="text-[#67D4B7]"
                  />
                </span>

                <span>
                  <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">
                    Visit Us
                  </span>

                  <span className="mt-1 block max-w-sm text-xs leading-5 text-white/60">
                    {ADDRESS}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            BOTTOM DIVIDER
        ==================================================== */}

        <div className="my-10 h-px bg-white/10" />

        {/* ===================================================
            BOTTOM BAR
        ==================================================== */}

        <div className="flex flex-col gap-5 text-[10px] text-white/40 sm:flex-row sm:items-center sm:justify-between">

          <p>
            © {new Date().getFullYear()} Jashna Edu. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>Better Communication</span>

            <span className="h-1 w-1 rounded-full bg-[#49C4A5]" />

            <span>Brighter Futures</span>
          </div>

          {/* BACK TO TOP */}

          <motion.button
            type="button"
            onClick={scrollToTop}
            whileHover={{
              y: -2,
            }}
            whileTap={{
              scale: 0.95,
            }}
            className="group inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-[10px] font-semibold text-white/60 transition-all duration-300 hover:border-[#67D4B7]/30 hover:bg-white/[0.09] hover:text-white sm:self-auto"
          >
            Back to top

            <ArrowUpRight
              size={12}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </motion.button>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
   INTERNAL NAV LINK
========================================================= */

function FooterLink({ to, label }) {
  return (
    <Link
      to={to}
      onClick={() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }}
      className="group flex w-fit items-center gap-2 text-xs font-medium text-white/55 transition-all duration-300 hover:translate-x-1 hover:text-white"
    >
      <span>{label}</span>

      <ArrowUpRight
        size={11}
        className="opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
      />
    </Link>
  );
}

/* =========================================================
   SOCIAL LINK
========================================================= */

function SocialLink({ href, icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex w-fit items-center gap-3"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-[10px] font-black uppercase text-white/60 transition-all duration-300 group-hover:border-[#67D4B7]/30 group-hover:bg-[#67D4B7]/10 group-hover:text-[#67D4B7]">
        {icon}
      </span>

      <span className="text-xs font-medium text-white/55 transition-colors group-hover:text-white">
        {label}
      </span>

      <ArrowUpRight
        size={11}
        className="text-white/20 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#67D4B7]"
      />
    </a>
  );
}