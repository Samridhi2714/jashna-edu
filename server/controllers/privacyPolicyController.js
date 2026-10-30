import PrivacyPolicy from "../models/PrivacyPolicy.js";

const BLOCK_KINDS = ["paragraph", "subheading", "bullets"];

const MAX_SECTIONS = 30;
const MAX_BLOCKS_PER_SECTION = 50;
const MAX_BULLETS_PER_BLOCK = 50;
const MAX_TITLE_LENGTH = 200;
const MAX_TEXT_LENGTH = 5000;
const MAX_BULLET_LENGTH = 1000;

/*
=========================================================
DEFAULT PRIVACY POLICY

Returned whenever the admin has not saved their own version
(or after "Reset to default"). Section numbers are added by
the website when it renders.

Block kinds:
  paragraph  -> { kind, text }
  subheading -> { kind, text }
  bullets    -> { kind, items: [] }
=========================================================
*/

const DEFAULT_PRIVACY_POLICY = {
  lastUpdated: "2026-10-30T00:00:00.000Z",

  sections: [
    {
      title: "Who We Are",
      blocks: [
        {
          kind: "paragraph",
          text: 'Jashna Edu ("we", "us", "our") is an English communication coaching company based in Faridabad, Haryana, India. This Privacy Policy explains what personal information we collect through our website (jashnaedu.com), our student portal and our careers portal, how we use it, and the choices you have.',
        },
      ],
    },
    {
      title: "Information We Collect",
      blocks: [
        {
          kind: "paragraph",
          text: "We collect only the information needed to run our programs and hiring process.",
        },
        { kind: "subheading", text: "Students" },
        {
          kind: "bullets",
          items: [
            "Name, email address and phone number provided at registration or enrolment.",
            "Files you upload through the student portal, such as assignments, recordings, assessment submissions and other learning material.",
            "Your assessment responses and learning progress.",
          ],
        },
        { kind: "subheading", text: "Job applicants (Careers portal)" },
        {
          kind: "bullets",
          items: [
            "Name, email address and phone number.",
            "Your resume / CV and any other documents you choose to upload.",
            "Any other personal or professional details you include in your application, such as education, work experience, skills and location.",
          ],
        },
        { kind: "subheading", text: "Visitors" },
        {
          kind: "bullets",
          items: [
            "Details you submit through contact or enquiry forms.",
            "Basic technical information such as browser type and pages visited, used to keep the website working properly.",
          ],
        },
      ],
    },
    {
      title: "How We Use Your Information",
      blocks: [
        {
          kind: "bullets",
          items: [
            "To create and manage student accounts and deliver our English communication programs.",
            "To review, evaluate and give feedback on student assignments and assessments.",
            "To review job applications, shortlist candidates and contact applicants about their application.",
            "To respond to your questions and enquiries.",
            "To maintain the security and performance of our website and portals.",
          ],
        },
        {
          kind: "paragraph",
          text: "We do not use your personal information for advertising, and we do not sell it.",
        },
      ],
    },
    {
      title: "How We Store Files (Google Drive)",
      blocks: [
        {
          kind: "paragraph",
          text: "Files uploaded to our website, including student submissions and applicant resumes, are stored in a private Google Drive folder owned and controlled by Jashna Edu. Our server accesses this folder using Jashna Edu's own authorised Google account to save, retrieve and delete these files.",
        },
        {
          kind: "paragraph",
          text: "We do not request access to the Google accounts or Google Drive of our students, applicants or visitors. Your files are never made public, and they are available only to authorised Jashna Edu staff who need them for the purposes described above.",
        },
        {
          kind: "paragraph",
          text: "Jashna Edu's use of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.",
        },
      ],
    },
    {
      title: "Sharing of Information",
      blocks: [
        {
          kind: "paragraph",
          text: "We do not sell, rent or trade your personal information. We share it only in these limited cases:",
        },
        {
          kind: "bullets",
          items: [
            "With service providers that help us operate the website and store files (such as Google for file storage and our hosting provider), who process data only on our behalf.",
            "When required by law, court order or a valid request from a public authority.",
            "To protect the rights, safety and security of Jashna Edu, our students or others.",
          ],
        },
      ],
    },
    {
      title: "How Long We Keep Your Data",
      blocks: [
        {
          kind: "bullets",
          items: [
            "Student information and uploaded files are kept while the student is enrolled and for a reasonable period afterwards for academic and record-keeping purposes.",
            "Job application data, including resumes, is kept for up to 12 months after the hiring decision so that we can consider you for future openings, unless you ask us to delete it earlier.",
          ],
        },
        {
          kind: "paragraph",
          text: "When data is no longer needed, we delete it from our systems and from Google Drive.",
        },
      ],
    },
    {
      title: "Data Security",
      blocks: [
        {
          kind: "paragraph",
          text: "We take reasonable technical and organisational steps to protect your information, including restricted access to the admin area, authenticated access to uploaded files and encrypted (HTTPS) connections. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.",
        },
      ],
    },
    {
      title: "Your Rights and Choices",
      blocks: [
        { kind: "paragraph", text: "You can contact us at any time to:" },
        {
          kind: "bullets",
          items: [
            "Ask what personal information we hold about you.",
            "Correct information that is inaccurate or out of date.",
            "Request deletion of your personal information, resume or uploaded files.",
            "Withdraw your consent to us processing your information.",
          ],
        },
        {
          kind: "paragraph",
          text: "We will respond to such requests within a reasonable time.",
        },
      ],
    },
    {
      title: "Children's Privacy",
      blocks: [
        {
          kind: "paragraph",
          text: "Our careers portal is intended for adults. If a student is under 18, we ask that a parent or guardian is aware of and agrees to the student's use of our website and portals.",
        },
      ],
    },
    {
      title: "Changes to This Policy",
      blocks: [
        {
          kind: "paragraph",
          text: 'We may update this Privacy Policy from time to time. When we do, we will change the "Last updated" date at the top of this page. Please review it occasionally.',
        },
      ],
    },
  ],
};

/*
=========================================================
VALIDATE AND CLEAN THE SECTIONS SENT BY THE ADMIN

Returns { sections } when valid, or { error } with a
message that can be shown to the admin.

Only known fields are copied, so nothing unexpected is
ever saved. Empty paragraphs and empty bullet lists are
dropped silently.
=========================================================
*/

const sanitizeSections = (input) => {
  if (!Array.isArray(input) || input.length === 0) {
    return { error: "At least one section is required." };
  }

  if (input.length > MAX_SECTIONS) {
    return { error: `A policy can have at most ${MAX_SECTIONS} sections.` };
  }

  const sections = [];

  for (let sectionIndex = 0; sectionIndex < input.length; sectionIndex += 1) {
    const rawSection = input[sectionIndex];
    const label = `Section ${sectionIndex + 1}`;

    if (!rawSection || typeof rawSection !== "object") {
      return { error: `${label} is not valid.` };
    }

    if (typeof rawSection.title !== "string" || !rawSection.title.trim()) {
      return { error: `${label} needs a title.` };
    }

    const title = rawSection.title.trim();

    if (title.length > MAX_TITLE_LENGTH) {
      return {
        error: `${label}: the title must be ${MAX_TITLE_LENGTH} characters or fewer.`,
      };
    }

    const rawBlocks = Array.isArray(rawSection.blocks)
      ? rawSection.blocks
      : [];

    if (rawBlocks.length > MAX_BLOCKS_PER_SECTION) {
      return {
        error: `${label} can have at most ${MAX_BLOCKS_PER_SECTION} blocks.`,
      };
    }

    const blocks = [];

    for (const rawBlock of rawBlocks) {
      if (!rawBlock || !BLOCK_KINDS.includes(rawBlock.kind)) {
        return { error: `${label} contains an unknown block type.` };
      }

      if (rawBlock.kind === "bullets") {
        if (!Array.isArray(rawBlock.items)) {
          return { error: `${label} has a bullet list that is not valid.` };
        }

        if (rawBlock.items.length > MAX_BULLETS_PER_BLOCK) {
          return {
            error: `${label}: a bullet list can have at most ${MAX_BULLETS_PER_BLOCK} items.`,
          };
        }

        const items = [];

        for (const rawItem of rawBlock.items) {
          if (typeof rawItem !== "string") {
            return { error: `${label} has a bullet that is not valid.` };
          }

          const item = rawItem.trim();

          if (!item) continue;

          if (item.length > MAX_BULLET_LENGTH) {
            return {
              error: `${label}: each bullet must be ${MAX_BULLET_LENGTH} characters or fewer.`,
            };
          }

          items.push(item);
        }

        if (items.length > 0) {
          blocks.push({ kind: "bullets", items });
        }
      } else {
        if (typeof rawBlock.text !== "string") {
          return { error: `${label} has a text block that is not valid.` };
        }

        const text = rawBlock.text.trim();

        if (!text) continue;

        if (text.length > MAX_TEXT_LENGTH) {
          return {
            error: `${label}: a text block must be ${MAX_TEXT_LENGTH} characters or fewer.`,
          };
        }

        blocks.push({ kind: rawBlock.kind, text });
      }
    }

    sections.push({ title, blocks });
  }

  return { sections };
};

/*
=========================================================
GET PRIVACY POLICY
GET /api/privacy-policy

No authentication required (the policy is a public page).
Returns the saved policy, or the default text when nothing
has been saved yet (isDefault: true).
=========================================================
*/

export const getPrivacyPolicy = async (req, res) => {
  try {
    const document = await PrivacyPolicy.findOne({ key: "main" }).lean();

    if (!document || !document.sections?.length) {
      return res.status(200).json({
        success: true,
        isDefault: true,
        policy: DEFAULT_PRIVACY_POLICY,
      });
    }

    return res.status(200).json({
      success: true,
      isDefault: false,
      policy: {
        sections: document.sections,
        lastUpdated: document.lastUpdated,
      },
    });
  } catch (error) {
    console.error("Get privacy policy error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load the privacy policy.",
    });
  }
};

/*
=========================================================
UPDATE PRIVACY POLICY
PUT /api/privacy-policy

Requires admin authentication.
=========================================================
*/

export const updatePrivacyPolicy = async (req, res) => {
  try {
    const { sections, error } = sanitizeSections(req.body?.sections);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const document = await PrivacyPolicy.findOneAndUpdate(
      { key: "main" },
      {
        $set: {
          sections,
          lastUpdated: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    return res.status(200).json({
      success: true,
      message: "Privacy policy saved successfully.",
      isDefault: false,
      policy: {
        sections: document.sections,
        lastUpdated: document.lastUpdated,
      },
    });
  } catch (error) {
    console.error("Update privacy policy error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save the privacy policy.",
    });
  }
};

/*
=========================================================
RESET PRIVACY POLICY TO DEFAULT
DELETE /api/privacy-policy

Requires admin authentication. Removes the saved version, so
the website shows the default text again.
=========================================================
*/

export const resetPrivacyPolicy = async (req, res) => {
  try {
    await PrivacyPolicy.deleteOne({ key: "main" });

    return res.status(200).json({
      success: true,
      message: "Privacy policy reset to the default text.",
    });
  } catch (error) {
    console.error("Reset privacy policy error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reset the privacy policy.",
    });
  }
};