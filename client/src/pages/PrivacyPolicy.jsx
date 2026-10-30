import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LoaderCircle, Mail, MapPin, ShieldCheck } from "lucide-react";

import { API_URL } from "../config";

const TIMES = { fontFamily: '"Times New Roman", Times, serif' };

const FALLBACK_CONTACT = {
  email: "info@jashnaedu.com",
  address:
    "Jashna Edu, Block D, New Industrial Twp 2, New Industrial Township, Faridabad, Haryana 121001, India",
};

/* Shared text style so every paragraph and list item stays consistent */
const BODY_TEXT = "text-base leading-7 text-[#173B5E] sm:text-lg sm:leading-8";

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

export default function PrivacyPolicy() {
  const [policy, setPolicy] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [contact, setContact] = useState(FALLBACK_CONTACT);

  useEffect(() => {
    document.title = "Privacy Policy | Jashna Edu";
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const getJson = (path) =>
      fetch(`${API_URL}${path}`, { signal: controller.signal }).then(
        (response) => {
          if (!response.ok) throw new Error("Request failed.");
          return response.json();
        },
      );

    async function load() {
      const [policyResult, settingsResult] = await Promise.allSettled([
        getJson("/api/privacy-policy"),
        getJson("/api/settings/public"),
      ]);

      if (controller.signal.aborted) return;

      const saved =
        policyResult.status === "fulfilled" ? policyResult.value?.policy : null;

      if (saved?.sections?.length) {
        setPolicy(saved);
        setStatus("ready");
      } else {
        setStatus("error");
      }

      if (settingsResult.status === "fulfilled") {
        const settings = settingsResult.value?.settings;

        setContact({
          email: settings?.contactEmail?.trim() || FALLBACK_CONTACT.email,
          address: settings?.address?.trim() || FALLBACK_CONTACT.address,
        });
      }
    }

    load();

    return () => controller.abort();
  }, []);

  const sections = policy?.sections ?? [];
  const contactNumber = sections.length + 1;

  const tocItems = [
    ...sections.map((section, index) => ({
      id: `section-${index + 1}`,
      title: `${index + 1}. ${section.title}`,
    })),
    { id: "contact", title: `${contactNumber}. Contact Us` },
  ];

  return (
    <main
      style={TIMES}
      className="w-full overflow-x-hidden bg-[#F3F7FB] px-4 pb-14 pt-28 text-[#173B5E] sm:px-6 sm:pb-20 sm:pt-32 lg:px-10 lg:pb-24 lg:pt-36"
    >
      <div className="mx-auto w-full max-w-4xl">
        {/* ==================================================
            HEADER
        ================================================== */}
        <header className="relative overflow-hidden rounded-2xl bg-[#215e93] px-5 py-8 text-white shadow-[0_16px_40px_rgba(33,94,147,0.18)] sm:rounded-3xl sm:px-10 sm:py-12 lg:px-12 lg:py-14">
          <span
            aria-hidden="true"
            className="absolute right-0 top-0 h-full w-1.5 bg-[#84e245]"
          />

          <div className="flex items-center gap-2.5 text-[#B5F28A] sm:gap-3">
            <ShieldCheck
              aria-hidden="true"
              className="h-5 w-5 shrink-0 sm:h-6 sm:w-6"
            />
            <p className="text-xs font-bold uppercase tracking-[0.2em] sm:text-sm sm:tracking-[0.26em]">
              Your Privacy Matters
            </p>
          </div>

          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Privacy Policy
          </h1>

          {policy && formatDate(policy.lastUpdated) && (
            <p className="mt-3 text-base text-white sm:text-lg">
              Last updated: {formatDate(policy.lastUpdated)}
            </p>
          )}
        </header>

        {/* ==================================================
            CONTENT CARD
        ================================================== */}
        <div className="mt-6 rounded-2xl border border-[#215e93]/15 bg-white px-5 py-8 shadow-sm sm:mt-8 sm:rounded-3xl sm:px-10 sm:py-12 lg:px-12 lg:py-14">
          {status === "loading" && (
            <div
              role="status"
              className="flex min-h-48 items-center justify-center gap-3 text-base font-bold text-[#215e93]"
            >
              <LoaderCircle
                aria-hidden="true"
                className="h-6 w-6 animate-spin"
              />
              Loading privacy policy...
            </div>
          )}

          {status === "error" && (
            <div role="alert" className="min-h-48">
              <h2 className="text-xl font-bold text-[#215e93] sm:text-2xl">
                We could not load the privacy policy
              </h2>

              <p className={`mt-3 ${BODY_TEXT}`}>
                Please refresh the page in a moment. If the problem continues,
                write to us at{" "}
                <a
                  href={`mailto:${contact.email}`}
                  className="break-all font-bold text-[#215e93] underline decoration-[#84e245] decoration-2 underline-offset-4"
                >
                  {contact.email}
                </a>{" "}
                and we will send you a copy.
              </p>
            </div>
          )}

          {status === "ready" && (
            <>
              {/* TABLE OF CONTENTS */}
              <nav
                aria-label="Privacy policy sections"
                className="rounded-2xl border border-[#215e93]/15 bg-[#F3F7FB] p-5 sm:p-6"
              >
                <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[#215e93] sm:text-base sm:tracking-[0.2em]">
                  In this policy
                </h2>
                <span className="mt-2 block h-[3px] w-10 rounded-full bg-[#84e245]" />

                <ul className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
                  {tocItems.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="inline-block break-words text-base font-bold leading-6 text-[#173B5E] transition-colors hover:text-[#215e93] hover:underline hover:decoration-[#84e245] hover:decoration-2 hover:underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#215e93]"
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* SECTIONS */}
              <div className="mt-10 space-y-10 sm:mt-12 sm:space-y-12">
                {sections.map((section, sectionIndex) => {
                  const id = `section-${sectionIndex + 1}`;

                  return (
                    <section
                      key={id}
                      id={id}
                      aria-labelledby={`${id}-title`}
                      className="scroll-mt-28 sm:scroll-mt-32"
                    >
                      <SectionTitle id={`${id}-title`}>
                        {sectionIndex + 1}. {section.title}
                      </SectionTitle>

                      {section.blocks?.map((block, blockIndex) => (
                        <Block key={blockIndex} block={block} />
                      ))}
                    </section>
                  );
                })}

                {/* CONTACT (always the last section) */}
                <section
                  id="contact"
                  aria-labelledby="contact-title"
                  className="scroll-mt-28 sm:scroll-mt-32"
                >
                  <SectionTitle id="contact-title">
                    {contactNumber}. Contact Us
                  </SectionTitle>

                  <p className={`mt-4 ${BODY_TEXT}`}>
                    If you have any questions about this Privacy Policy or want
                    to access, correct or delete your information, please
                    contact us.
                  </p>

                  <a
                    href={`mailto:${contact.email}`}
                    className="mt-5 inline-flex max-w-full items-center gap-2.5 rounded-full bg-[#215e93] px-5 py-3 text-base font-bold text-white transition-colors duration-200 hover:bg-[#173B5E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#215e93]"
                  >
                    <Mail aria-hidden="true" className="h-5 w-5 shrink-0" />
                    <span className="min-w-0 break-all">{contact.email}</span>
                  </a>

                  <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#215e93]/15 bg-[#F3F7FB] p-4 sm:p-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#215e93]">
                      <MapPin aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <p className="min-w-0 break-words text-base leading-7 text-[#173B5E] sm:text-lg sm:leading-8">
                      {contact.address}
                    </p>
                  </div>
                </section>
              </div>
            </>
          )}
        </div>

        {/* BACK LINK */}
        <div className="mt-8 text-center sm:mt-10">
          <Link
            to="/"
            className="inline-block text-base font-bold text-[#215e93] underline decoration-[#84e245] decoration-2 underline-offset-4 transition-colors hover:text-[#173B5E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#215e93] sm:text-lg"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

/* ONE CONTENT BLOCK: paragraph, subheading or bullet list */
function Block({ block }) {
  if (block.kind === "subheading") {
    return (
      <h3 className="mt-6 text-lg font-bold text-[#215e93] sm:text-xl">
        {block.text}
      </h3>
    );
  }

  if (block.kind === "bullets") {
    return <BulletList items={block.items || []} />;
  }

  return <p className={`mt-4 ${BODY_TEXT}`}>{block.text}</p>;
}

/* SECTION HEADING */
function SectionTitle({ id, children }) {
  return (
    <>
      <h2
        id={id}
        className="break-words text-xl font-bold leading-snug text-[#215e93] sm:text-2xl lg:text-3xl"
      >
        {children}
      </h2>
      <span
        aria-hidden="true"
        className="mt-2 block h-[3px] w-10 rounded-full bg-[#84e245]"
      />
    </>
  );
}

/* BULLET LIST */
function BulletList({ items }) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map((item, index) => (
        <li key={index} className={`flex items-start gap-3 ${BODY_TEXT}`}>
          <span
            aria-hidden="true"
            className="mt-[0.7em] h-2 w-2 shrink-0 rounded-full bg-[#84e245] ring-1 ring-[#215e93]/30"
          />
          <span className="min-w-0 break-words">{item}</span>
        </li>
      ))}
    </ul>
  );
}