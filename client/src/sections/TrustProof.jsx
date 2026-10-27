import {
  GraduationCap,
  BriefcaseBusiness,
  Languages,
  UserRoundSearch,
  Building2,
  School,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { getWhatsAppLink } from "../data/contact.js";

// Audience images
import studentsImage from "../assets/audiences/student.webp";
import professionalsImage from "../assets/audiences/working-professional.webp";
import aspirantsImage from "../assets/audiences/ielts-aspirants.webp";
import jobSeekersImage from "../assets/audiences/job-seekers.webp";
import corporateImage from "../assets/audiences/corporate-teams.webp";
import institutionsImage from "../assets/audiences/institutions.webp";

/* accent = strong colour (text, icon, borders)
   tint   = very light background of the same family */
const audienceItems = [
  {
    number: "01",
    icon: GraduationCap,
    tag: "STUDENTS",
    title: "Students",
    description:
      "Build stronger communication, presentation, and interpersonal skills for academics and beyond.",
    image: studentsImage,
    accent: "#C2553F",
    tint: "#FFF1EC",
    categories: [
      {
        title: "School Students",
        description: "Confidence, communication & academic expression",
      },
      {
        title: "Undergraduate Students",
        description: "Presentations, interviews & professional readiness",
      },
      {
        title: "Postgraduate Students",
        description: "Advanced communication & career preparation",
      },
    ],
  },
  {
    number: "02",
    icon: BriefcaseBusiness,
    tag: "PROFESSIONALS",
    title: "Working Professionals",
    description:
      "Communicate with greater clarity, confidence, and presence in meetings, presentations, and workplaces.",
    image: professionalsImage,
    accent: "#9A6B12",
    tint: "#FFF7E3",
    categories: [
      {
        title: "Early-Career Professionals",
        description: "Workplace communication & professional confidence",
      },
      {
        title: "Mid-Level Professionals",
        description: "Leadership communication & strategic presence",
      },
      {
        title: "Senior Professionals",
        description: "Executive presence, influence & communication",
      },
    ],
  },
  {
    number: "03",
    icon: Languages,
    tag: "ENGLISH & IELTS",
    title: "English & IELTS Aspirants",
    description:
      "Strengthen your English communication and develop the confidence needed for academic and professional opportunities.",
    image: aspirantsImage,
    accent: "#2F8A6B",
    tint: "#EAF6F0",
    categories: [
      {
        title: "General English",
        description: "Build everyday fluency and communication confidence",
      },
      {
        title: "Academic English",
        description: "Communicate effectively in academic environments",
      },
      {
        title: "IELTS Preparation",
        description: "Focused preparation for your IELTS goals",
      },
    ],
  },
  {
    number: "04",
    icon: UserRoundSearch,
    tag: "CAREER SEEKERS",
    title: "Job Seekers",
    description:
      "Prepare for interviews, professional conversations, presentations, and the communication demands of your next opportunity.",
    image: jobSeekersImage,
    accent: "#7A5BB8",
    tint: "#F2EEFA",
    categories: [
      {
        title: "Students & Fresh Graduates",
        description: "Build interview confidence & workplace readiness",
      },
      {
        title: "Early-Career Job Seekers",
        description: "Strengthen professional communication & presence",
      },
      {
        title: "Career Switchers",
        description: "Communicate your experience for a new direction",
      },
    ],
  },
  {
    number: "05",
    icon: Building2,
    tag: "CORPORATE",
    title: "Corporate Teams",
    description:
      "Develop communication capabilities through customized workshops, training, simulations, and professional development.",
    image: corporateImage,
    accent: "#2F6F9F",
    tint: "#EAF3FA",
    categories: [
      {
        title: "Leaders & Directors",
        description: "Executive presence, influence & strategic communication",
      },
      {
        title: "Managers & Team Leads",
        description: "Leadership communication & people management",
      },
      {
        title: "Teams & Organizations",
        description: "Collaboration, presentations & workplace communication",
      },
    ],
  },
  {
    number: "06",
    icon: School,
    tag: "INSTITUTIONS",
    title: "Schools & Institutions",
    description:
      "Bring expert-led workshops, mock interviews, guest lectures, and practical communication learning to your learners.",
    image: institutionsImage,
    accent: "#B03A62",
    tint: "#FCEDF2",
    categories: [
      {
        title: "Schools",
        description: "Communication, confidence & student development",
      },
      {
        title: "Colleges & Universities",
        description: "Career readiness, interviews & professional skills",
      },
      {
        title: "Academic Institutions",
        description: "Workshops, lectures & customized programs",
      },
    ],
  },
];

function TrustProof() {
  return (
    <section
      id="audience"
      className="relative overflow-hidden border-y border-jashna-charcoal/10 bg-[#FBF7F1] px-4 py-20 sm:px-8 lg:py-18 xl:px-12 2xl:px-16"
    >
      {/* ===== Decorative background ===== */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(120,80,60,0.10) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <div className="pointer-events-none absolute -left-40 top-10 h-[460px] w-[460px] rounded-full bg-jashna-maroon/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[460px] w-[460px] rounded-full bg-jashna-gold/15 blur-3xl" />

      {/* Wide container: uses the full screen width instead of a narrow centred column */}
      <div className="relative mx-auto w-full max-w-[1760px]">
        {/* ============================= */}
        {/* SECTION INTRO */}
        {/* ============================= */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-jashna-maroon/15 bg-white/80 px-5 py-2 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[#2a9d8f]" />
            <span className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-[#2a9d8f] sm:text-xs">
              Built for different journeys
            </span>
            <span className="h-2 w-2 rounded-full bg-[#84e245]" />
          </div>

          <h2 className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-jashna-charcoal sm:text-6xl lg:text-7xl">
            Who is{" "}
            <span className="bg-gradient-to-r from-[#215e93] via-[#2a9d8f] to-[#84e245] bg-clip-text text-transparent">
              JASHNA EDU
            </span>
            {" "}
            for?
          </h2>

          <div className="mx-auto mt-6 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#84e245] to-[#2a9d8f]" />

          <p className="mx-auto mt-7 max-w-3xl text-base font-medium leading-8 text-jashna-muted sm:text-lg lg:text-xl">
            Whether you're a student, professional, job seeker, English or IELTS
            aspirant, institution, or corporate team — discover a learning path
            designed around{" "}
            <span className="font-bold text-jashna-charcoal">
              where you are
            </span>{" "}
            and{" "}
            <span className="font-bold text-jashna-charcoal">
              where you want to go.
            </span>
          </p>
        </motion.div>

        {/* ============================= */}
        {/* AUDIENCE CARDS — full width grid */}
        {/* ============================= */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-20 xl:grid-cols-3 xl:gap-8">
          {audienceItems.map((item, index) => (
            <AudienceCard key={item.number} item={item} index={index} />
          ))}
        </div>

      </div>
    </section>
  );
}

function AudienceCard({ item, index }) {
  const Icon = item.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.08 }}
      whileHover={{ y: -8 }}
      style={{ "--accent": item.accent, "--tint": item.tint }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[32px] border border-jashna-charcoal/10 bg-white shadow-[0_10px_35px_rgba(90,50,40,0.07)] transition-[box-shadow,border-color] duration-500 hover:border-[color:var(--accent)]/40 hover:shadow-[0_28px_70px_rgba(90,50,40,0.16)]"
    >
      {/* ================= IMAGE ================= */}
      <div className="relative h-56 overflow-hidden sm:h-60 xl:h-64">
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
        />

        {/* colour wash + soft fade into the white body */}
        <div
          className="absolute inset-0 opacity-30 mix-blend-multiply"
          style={{ backgroundColor: item.accent }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/0 to-black/10" />

        {/* tag */}
        <span
          className="absolute left-5 top-5 rounded-full bg-white/95 px-4 py-1.5 text-[10px] font-extrabold tracking-[0.2em] shadow-md backdrop-blur"
          style={{ color: item.accent }}
        >
          {item.tag}
        </span>

        {/* big outlined number */}
        <span
          className="pointer-events-none absolute -top-2 right-5 font-display text-7xl font-extrabold leading-none text-transparent transition-transform duration-500 group-hover:scale-110"
          style={{ WebkitTextStroke: "2px rgba(255,255,255,0.95)" }}
        >
          {item.number}
        </span>
      </div>

      {/* ================= BODY ================= */}
      <div className="relative flex flex-1 flex-col px-6 pb-8 pt-0 sm:px-8">
        {/* icon chip overlapping the image */}
        <div
          className="-mt-8 flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white text-white shadow-lg transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105"
          style={{ backgroundColor: item.accent }}
        >
          <Icon size={26} strokeWidth={2} />
        </div>

        {/* title row */}
        <div className="mt-5 flex items-start justify-between gap-4">
          <h3 className="font-display text-2xl font-extrabold leading-tight text-jashna-charcoal sm:text-[1.75rem]">
            {item.title}
          </h3>

          <span
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 group-hover:rotate-45 group-hover:text-white group-hover:[background-color:var(--accent)]"
            style={{ borderColor: item.accent, color: item.accent }}
          >
            <ArrowUpRight size={18} strokeWidth={2.4} />
          </span>
        </div>

        <p className="mt-3 text-[18px] font-medium leading-7 text-mauve-900">
          {item.description}
        </p>

        {/* divider with label */}
        <div className="mb-4 mt-6 flex items-center gap-3">
          <span
            className="text-[11px] font-extrabold uppercase tracking-[0.22em]"
            style={{ color: item.accent }}
          >
            Choose your journey
          </span>
          <span
            className="h-px flex-1 opacity-40"
            style={{ backgroundColor: item.accent }}
          />
        </div>

        {/* categories — always visible, no layout jump, works on touch */}
        <ul className="mt-auto space-y-2.5">
          {item.categories.map((category, i) => (
            <li key={category.title}>
              <a
                href={getWhatsAppLink(
                  `Hello Dr.Shivam Sir, I would like to know more about ${category.title} curriculum at Jashna Edu. Please guide me about the suitable program and consultation.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Enquire on WhatsApp about ${category.title}`}
                className="group/row flex items-center gap-4 rounded-2xl border border-transparent bg-[color:var(--tint)] px-4 py-3.5 transition-all duration-300 hover:translate-x-1.5 hover:border-[color:var(--accent)]/40 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ "--tw-ring-color": item.accent }}
              >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-extrabold shadow-sm transition-colors duration-300 group-hover/row:text-white group-hover/row:[background-color:var(--accent)]"
                style={{ color: item.accent }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0">
                <p className="text-[16px] font-bold leading-snug text-jashna-charcoal">
                  {category.title}
                </p>
                <p className="mt-0.5 text-[15px] font-medium leading-5 text-jashna-muted">
                  {category.description}
                </p>
              </div>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* bottom accent bar grows on hover */}
      <span
        className="absolute bottom-0 left-0 h-1.5 w-0 transition-all duration-500 group-hover:w-full"
        style={{ backgroundColor: item.accent }}
      />
    </motion.article>
  );
}

export default TrustProof;