import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Sparkles, Users } from "lucide-react";
import { API_BASE } from "../../config";

const API_URL = API_BASE;

/* Scoped styles: fonts + left-to-right floating animation */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

.ra-section { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
.ra-heading { font-family: 'Fraunces', Georgia, serif; }

/* Cards float from LEFT -> RIGHT */
@keyframes ra-float-ltr {
  from { transform: translateX(-50%); }
  to   { transform: translateX(0); }
}
.ra-track {
  animation: ra-float-ltr var(--ra-duration, 45s) linear infinite;
  will-change: transform;
}
/* Very small fade at the edges so cards run almost edge-to-edge */
.ra-marquee {
  -webkit-mask-image: linear-gradient(to right, transparent, #000 2%, #000 98%, transparent);
          mask-image: linear-gradient(to right, transparent, #000 2%, #000 98%, transparent);
}
@media (prefers-reduced-motion: reduce) {
  .ra-track { animation: none; }
  .ra-marquee { overflow-x: auto; }
}
`;

function RecentAdmissions() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchAdmissions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/recent-admissions/public`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load learner profiles.");
        }

        const data = await response.json();

        const admissions = Array.isArray(data)
          ? data
          : Array.isArray(data.admissions)
            ? data.admissions
            : Array.isArray(data.data)
              ? data.data
              : [];

        setStudents(admissions);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to load recent admissions:", err);
          setError("Learner profiles are temporarily unavailable.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchAdmissions();
    return () => controller.abort();
  }, []);

  /* Make sure one "half" of the track is wide enough to fill the screen,
     then render it twice so the loop is seamless. */
  const { loopItems, duration } = useMemo(() => {
    if (students.length === 0) return { loopItems: [], duration: 45 };
    const repeats = Math.max(1, Math.ceil(8 / students.length));
    const half = Array.from({ length: repeats }, () => students).flat();
    return {
      loopItems: [...half, ...half],
      duration: Math.max(30, half.length * 7),
    };
  }, [students]);

  return (
    <section
      id="growing-learning-community"
      className="ra-section relative overflow-hidden bg-gradient-to-b from-[#F5F9FC] via-[#EEF6F4] to-[#F6F3EC] py-10 sm:py-14 lg:py-10"
    >
      <style>{styles}</style>

      {/* Soft background accents */}
      <div className="pointer-events-none absolute -left-24 top-10 h-60 w-60 rounded-full bg-[#BFDBFE]/50 blur-[90px] sm:h-80 sm:w-80 sm:blur-[110px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-[#BBF7D0]/50 blur-[100px] sm:h-96 sm:w-96 sm:blur-[120px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-[#FDE9C9]/40 blur-[110px]" />

      {/* Heading + states stay centred in a max-width container */}
      <div className="relative mx-auto max-w-7xl">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="mx-auto mb-5 max-w-3xl px-5 text-center sm:mb-8 sm:px-8"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#338DFD]/20 bg-white/80 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#2563B8] shadow-sm backdrop-blur sm:mb-5 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.2em]">
            <Sparkles size={14} /> Our Learning Community
          </div>

          <h2 className="ra-heading text-[2rem] font-bold leading-[1.12] tracking-tight text-[#14304F] min-[400px]:text-4xl sm:text-5xl lg:text-6xl">
            Our Growing{" "}
            <span className="bg-gradient-to-r from-[#2F7FE8] via-[#3AA6B9] to-[#2FA98A] bg-clip-text text-transparent">
              Learning Community
            </span>
          </h2>

          {/* Bigger + darker paragraph */}
          <p className="mx-auto mt-5 max-w-3xl text-base font-medium leading-7 text-[#0B1F36] sm:mt-6 sm:text-xl sm:leading-9 lg:text-2xl lg:leading-10">
            Every learner brings a different ambition. Meet some of the people
            taking their next step with Jashna Edu.
          </p>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div
            className="grid grid-cols-1 gap-5 px-5 sm:grid-cols-2 sm:gap-6 sm:px-8 lg:grid-cols-3 lg:px-12"
            aria-label="Loading learner profiles"
          >
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className={`animate-pulse rounded-[28px] border border-[#14304F]/10 bg-white/80 p-5 ${
                  item === 3 ? "hidden lg:block" : ""
                }`}
              >
                <div className="aspect-[4/3] rounded-2xl bg-[#14304F]/10" />
                <div className="mt-5 h-5 w-2/3 rounded bg-[#14304F]/10" />
                <div className="mt-3 h-4 w-1/2 rounded bg-[#14304F]/10" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            role="status"
            className="mx-5 rounded-2xl border border-[#14304F]/10 bg-white/90 px-5 py-7 text-center text-sm text-[#14304F]/70 sm:mx-8 sm:px-6 sm:py-8 sm:text-base lg:mx-12"
          >
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && students.length === 0 && (
          <div className="mx-5 rounded-[28px] border border-[#14304F]/10 bg-white/80 px-5 py-10 text-center shadow-sm sm:mx-8 sm:px-6 sm:py-12 lg:mx-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#338DFD]/10 text-[#2F7FE8]">
              <GraduationCap size={28} />
            </div>
            <h3 className="ra-heading mt-5 text-xl font-bold text-[#14304F]">
              Every journey starts somewhere.
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#14304F]/60 sm:text-base">
              Our learner community is growing. Published student profiles will
              appear here.
            </p>
          </div>
        )}
      </div>

      {/* Floating learner cards (left -> right).
          Placed OUTSIDE the max-w-7xl container so it spans the full screen width. */}
      {!loading && !error && students.length > 0 && (
        <div className="ra-marquee relative w-full overflow-hidden py-3">
          <div
            className="ra-track flex w-max"
            style={{ "--ra-duration": `${duration}s` }}
          >
            {loopItems.map((student, index) => {
              const image =
                student.profileImage || student.student?.profileImage || "";
              const name =
                student.name || student.student?.name || "Jashna Edu Learner";
              const designation =
                student.designation || student.student?.designation || "";
              const id = student._id || student.id || index;
              const isClone = index >= loopItems.length / 2;

              return (
                <div
                  key={`${id}-${index}`}
                  className="shrink-0 pr-4 sm:pr-6"
                  aria-hidden={isClone ? "true" : undefined}
                >
                  {/* Gradient border wrapper */}
                  <article className="group w-[228px] rounded-[26px] bg-gradient-to-br from-[#7DB7FF] via-[#A8E0D0] to-[#F6D9A8] p-[2px] shadow-[0_14px_40px_rgba(20,48,79,0.08)] sm:w-[290px] sm:rounded-[30px] lg:w-[310px]">
                    <div className="flex h-full flex-col overflow-hidden rounded-[24px] bg-white sm:rounded-[28px]">
                      {/* Image */}
                      <div className="relative aspect-[4/4.2] overflow-hidden bg-gradient-to-br from-[#DCEBFF] via-[#F4F8F6] to-[#D5F2E8]">
                        {image ? (
                          <img
                            src={image}
                            alt={name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center text-[#14304F]/40">
                            <Users size={44} strokeWidth={1.3} />
                            <span className="mt-3 text-xs font-semibold">
                              Learner profile
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/90 to-transparent" />

                        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#2563B8] shadow-sm backdrop-blur-md sm:left-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-[10px]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#2FA98A]" />
                          New Learner
                        </span>
                      </div>

                      {/* Information at the bottom */}
                      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5 sm:px-6 sm:pb-5 sm:pt-4">
                        <h3 className="ra-heading text-lg font-bold leading-snug tracking-tight text-[#14304F] sm:text-[22px]">
                          {name}
                        </h3>

                        {designation && (
                          <p className="mt-1 text-[13px] font-medium leading-5 text-[#2A9275] sm:mt-1.5 sm:text-sm sm:leading-6">
                            {designation}
                          </p>
                        )}

                        <div className="mt-auto flex items-center justify-between border-t border-dashed border-[#14304F]/15 pt-3.5 sm:pt-4">
                          <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#14304F]/75 sm:text-[10px] sm:tracking-[0.18em]">
                            Jashna Edu Community
                          </span>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#338DFD]/10 text-[#2F7FE8] transition-colors duration-300 group-hover:bg-[#2F7FE8] group-hover:text-white">
                            <ArrowRight
                              size={15}
                              className="transition-transform duration-300 group-hover:translate-x-0.5"
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default RecentAdmissions;