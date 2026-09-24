import { useState } from "react";
import {
  GraduationCap,
  BriefcaseBusiness,
  Languages,
  UserRoundSearch,
  Building2,
  School,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Audience images
import studentsImage from "../assets/audiences/student.webp";
import professionalsImage from "../assets/audiences/working-professional.webp";
import aspirantsImage from "../assets/audiences/ielts-aspirants.webp";
import jobSeekersImage from "../assets/audiences/job-seekers.webp";
import corporateImage from "../assets/audiences/corporate-teams.webp";
import institutionsImage from "../assets/audiences/institutions.webp";

const audienceItems = [
  {
    number: "01",
    icon: GraduationCap,
    tag: "STUDENTS",
    title: "Students",
    description:
      "Build stronger communication, presentation, and interpersonal skills for academics and beyond.",
    image: studentsImage,
    categories: [
      {
        title: "School Students",
        description: "Confidence, communication & academic expression",
        icon: "01",
      },
      {
        title: "Undergraduate Students",
        description: "Presentations, interviews & professional readiness",
        icon: "02",
      },
      {
        title: "Postgraduate Students",
        description: "Advanced communication & career preparation",
        icon: "03",
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
    categories: [
      {
        title: "Early-Career Professionals",
        description: "Workplace communication & professional confidence",
        icon: "01",
      },
      {
        title: "Mid-Level Professionals",
        description: "Leadership communication & strategic presence",
        icon: "02",
      },
      {
        title: "Senior Professionals",
        description: "Executive presence, influence & communication",
        icon: "03",
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
    categories: [
      {
        title: "General English",
        description: "Build everyday fluency and communication confidence",
        icon: "01",
      },
      {
        title: "Academic English",
        description: "Communicate effectively in academic environments",
        icon: "02",
      },
      {
        title: "IELTS Preparation",
        description: "Focused preparation for your IELTS goals",
        icon: "03",
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
    categories: [
      {
        title: "Students & Fresh Graduates",
        description: "Build interview confidence & workplace readiness",
        icon: "01",
      },
      {
        title: "Early-Career Job Seekers",
        description: "Strengthen professional communication & presence",
        icon: "02",
      },
      {
        title: "Career Switchers",
        description: "Communicate your experience for a new direction",
        icon: "03",
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
    categories: [
      {
        title: "Leaders & Directors",
        description: "Executive presence, influence & strategic communication",
        icon: "01",
      },
      {
        title: "Managers & Team Leads",
        description: "Leadership communication & people management",
        icon: "02",
      },
      {
        title: "Teams & Organizations",
        description: "Collaboration, presentations & workplace communication",
        icon: "03",
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
    categories: [
      {
        title: "Schools",
        description: "Communication, confidence & student development",
        icon: "01",
      },
      {
        title: "Colleges & Universities",
        description: "Career readiness, interviews & professional skills",
        icon: "02",
      },
      {
        title: "Academic Institutions",
        description: "Workshops, lectures & customized programs",
        icon: "03",
      },
    ],
  },
];

function TrustProof() {
  const [activeCard, setActiveCard] = useState(null);

  return (
    <section
      id="audience"
      className="
        relative overflow-hidden
        border-y border-jashna-charcoal/10
        bg-white
        px-6 py-24
        lg:px-10 lg:py-20
      "
    >
      {/* Decorative background */}

      <div
        className="
          pointer-events-none absolute
          -left-40 top-20
          h-96 w-96
          rounded-full
          bg-jashna-maroon/5
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none absolute
          -right-40 bottom-0
          h-96 w-96
          rounded-full
          bg-jashna-gold/5
          blur-3xl
        "
      />

      <div className="relative mx-auto max-w-7xl">
        {/* ============================= */}
        {/* SECTION INTRO */}
        {/* ============================= */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-jashna-gold" />

            <span
              className="
                text-xs font-semibold
                uppercase tracking-[0.25em]
                text-jashna-maroon
              "
            >
              Built for different journeys
            </span>

            <span className="h-px w-8 bg-jashna-gold" />
          </div>

          <h2
            className="
              font-display
              text-4xl font-semibold
              leading-tight
              text-jashna-charcoal
              sm:text-5xl
              lg:text-6xl
            "
          >
            Who is <span className="text-jashna-maroon">JASHNA EDU</span> for?
          </h2>

          <p
            className="
              mx-auto mt-6
              max-w-2xl
              text-base leading-7
              text-jashna-muted
              sm:text-lg
            "
          >
            Whether you're a student, professional, job seeker, English or IELTS
            aspirant, institution, or corporate team — discover a learning path
            designed around where you are and where you want to go.
          </p>
        </motion.div>

        {/* ============================= */}
        {/* AUDIENCE CARDS */}
        {/* ============================= */}

        <div
          className="
            mt-16
            grid gap-5
            sm:grid-cols-2
            lg:grid-cols-3
          "
        >
          {audienceItems.map((item, index) => (
            <AudienceCard
              key={item.number}
              item={item}
              index={index}
              isActive={activeCard === item.number}
              onActivate={() => setActiveCard(item.number)}
              onDeactivate={() => setActiveCard(null)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function AudienceCard({ item, index, isActive, onActivate, onDeactivate }) {
  const Icon = item.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.6,
        delay: index * 0.07,
      }}
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
      onClick={() => {
        if (isActive) {
          onDeactivate();
        } else {
          onActivate();
        }
      }}
      className={`
        group relative
        overflow-hidden
        rounded-[28px]
        border
        bg-jashna-charcoal
        cursor-pointer
        transition-all
        duration-500
        ${
          isActive
            ? "border-jashna-maroon/40 shadow-2xl shadow-jashna-maroon/15"
            : "border-jashna-charcoal/10 shadow-sm"
        }
      `}
    >
      {/* ================================= */}
      {/* BACKGROUND IMAGE */}
      {/* ================================= */}

      <motion.div
        className="
          absolute inset-0
          bg-cover
          bg-center
        "
        style={{
          backgroundImage: `url(${item.image})`,
        }}
        animate={{
          scale: isActive ? 1.08 : 1,
        }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
        }}
      />

      {/* ================================= */}
      {/* IMAGE OVERLAY */}
      {/* ================================= */}

      <div
        className={`
          absolute inset-0
          bg-gradient-to-t
          from-jashna-charcoal
          via-jashna-charcoal/70
          to-jashna-charcoal/10
          transition-opacity
          duration-500
          ${isActive ? "opacity-90" : "opacity-95"}
        `}
      />

      {/* Maroon hover tint */}

      <motion.div
        className="absolute inset-0 bg-jashna-maroon/25"
        initial={{ opacity: 0 }}
        animate={{
          opacity: isActive ? 1 : 0,
        }}
        transition={{ duration: 0.5 }}
      />

      {/* ================================= */}
      {/* LARGE NUMBER */}
      {/* ================================= */}

      <motion.span
        className="
          pointer-events-none
          absolute
          -right-2
          -top-7
          font-display
          text-[110px]
          font-semibold
          leading-none
        "
        animate={{
          color: isActive ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)",
        }}
      >
        {item.number}
      </motion.span>

      {/* ================================= */}
      {/* MAIN CARD CONTENT */}
      {/* ================================= */}

      <div
        className="
          relative
          flex
          min-h-[340px]
          flex-col
          p-7
        "
      >
        {/* Top Row */}

        <div className="flex items-start justify-between">
          {/* Icon */}

          <motion.div
            animate={{
              rotate: isActive ? 5 : 0,
              scale: isActive ? 1.05 : 1,
            }}
            className={`
              flex h-12 w-12
              items-center justify-center
              rounded-2xl
              border
              backdrop-blur-md
              transition-all
              duration-500
              ${
                isActive
                  ? "border-jashna-gold bg-jashna-gold text-jashna-charcoal"
                  : "border-white/20 bg-white/15 text-white"
              }
            `}
          >
            <Icon size={21} strokeWidth={1.8} />
          </motion.div>

          {/* Arrow */}

          <motion.div
            animate={{
              rotate: isActive ? 45 : 0,
              y: isActive ? -2 : 0,
            }}
            className={`
              flex h-9 w-9
              items-center justify-center
              rounded-full
              border
              transition-colors
              duration-500
              ${
                isActive
                  ? "border-white text-white"
                  : "border-white/20 text-white/60"
              }
            `}
          >
            <ArrowUpRight size={16} />
          </motion.div>
        </div>

        {/* ================================= */}
        {/* CARD INFORMATION */}
        {/* ================================= */}

        <div className="mt-auto">
          {/* Tag */}

          <span
            className="
              inline-flex
              rounded-full
              border border-jashna-gold/40
              bg-jashna-gold/15
              px-3 py-1
              text-[9px]
              font-semibold
              tracking-[0.18em]
              text-jashna-gold
              backdrop-blur-sm
            "
          >
            {item.tag}
          </span>

          {/* Title */}

          <h3
            className="
              mt-5
              max-w-[92%]
              font-display
              text-2xl
              font-semibold
              text-white
              transition-colors
              duration-300
            "
          >
            {item.title}
          </h3>

          {/* Description */}

          <p
            className="
              mt-3
              max-w-[95%]
              text-sm
              leading-6
              text-white/70
            "
          >
            {item.description}
          </p>

          {/* ================================= */}
          {/* EXPLORE INDICATOR */}
          {/* ================================= */}

          <AnimatePresence>
            {!isActive && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="
                  mt-5
                  flex items-center gap-2
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-white/45
                "
              >
                <span>Explore your path</span>

                <ChevronDown size={13} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ================================= */}
        {/* HOVER FLOWCHART */}
        {/* ================================= */}

        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              transition={{
                duration: 0.45,
                ease: "easeOut",
              }}
              className="relative overflow-hidden"
            >
              {/* Divider */}

              <div className="my-6 h-px w-full bg-white/15" />

              {/* Flow label */}

              <div className="flex flex-col items-center">
                <span
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-white/50
                  "
                >
                  Choose your journey
                </span>

                {/* Animated downward line */}

                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 28 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.15,
                  }}
                  className="
                    relative
                    w-px
                    bg-jashna-gold
                  "
                >
                  {/* Glow */}

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.25,
                    }}
                    className="
                      absolute
                      inset-0
                      w-2
                      -translate-x-[3px]
                      bg-jashna-gold
                      blur-sm
                    "
                  />
                </motion.div>

                {/* Down arrow */}

                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.4,
                  }}
                  className="text-jashna-gold"
                >
                  <ChevronDown size={16} />
                </motion.div>
              </div>

              {/* ================================= */}
              {/* THREE CATEGORY NODES */}
              {/* ================================= */}

              <div
                className="
                  mt-3
                  grid
                  grid-cols-3
                  gap-2
                "
              >
                {item.categories.map((category, categoryIndex) => (
                  <motion.div
                    key={category.title}
                    initial={{
                      opacity: 0,
                      y: 15,
                      scale: 0.95,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    transition={{
                      duration: 0.4,
                      delay: 0.25 + categoryIndex * 0.1,
                    }}
                    className="
                      group/category
                      min-h-[105px]
                      rounded-2xl
                      border
                      border-white/15
                      bg-white/10
                      p-3
                      backdrop-blur-md
                      transition-all
                      duration-300
                      hover:border-jashna-gold/60
                      hover:bg-white/15
                    "
                  >
                    {/* Category number */}

                    <div
                      className="
                        flex
                        h-6
                        w-6
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-jashna-gold/40
                        bg-jashna-gold/10
                        text-[8px]
                        font-semibold
                        text-jashna-gold
                      "
                    >
                      {category.icon}
                    </div>

                    {/* Category title */}

                    <p
                      className="
                        mt-3
                        text-[11px]
                        font-semibold
                        leading-4
                        text-white
                        transition-colors
                        group-hover/category:text-jashna-gold
                      "
                    >
                      {category.title}
                    </p>

                    {/* Category description */}

                    <p
                      className="
                        mt-2
                        text-[9px]
                        leading-4
                        text-white/45
                      "
                    >
                      {category.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Bottom hint */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                className="
                  mt-5
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-[9px]
                  uppercase
                  tracking-[0.15em]
                  text-white/40
                "
              >
                <span>Personalized for your goals</span>

                <SparkleDot />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ================================= */}
      {/* BOTTOM ACCENT */}
      {/* ================================= */}

      <motion.div
        animate={{
          width: isActive ? "100%" : "0%",
        }}
        transition={{
          duration: 0.5,
        }}
        className="
          absolute
          bottom-0
          left-0
          h-1
          bg-jashna-gold
        "
      />
    </motion.div>
  );
}

/* Small decorative dot */

function SparkleDot() {
  return (
    <span
      className="
        h-1
        w-1
        rounded-full
        bg-jashna-gold
      "
    />
  );
}

export default TrustProof;
