import mongoose from "mongoose";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import {
  getOrCreateFolder,
  uploadBuffer,
} from "../services/driveService.js";

const LINKEDIN_REGEX =
  /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/(in|pub)\/[\w\-%.]+\/?(\?.*)?$/i;

const DRIVE_FILE_REGEX =
  /^https:\/\/(drive|docs)\.google\.com\/(file\/d\/|open\?id=|document\/d\/)[\w-]+/i;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^\+?[\d\s-]{10,15}$/;

/*
=========================================================
HELPER: ESCAPE HTML
=========================================================
Prevents applicant-provided text from being interpreted
as HTML markup.
*/
const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });

/*
=========================================================
GET /api/careers/jobs
Only return currently open jobs.
=========================================================
*/
export const listOpenJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true })
      .sort({ createdAt: -1 })
      .select("title type location description requirements createdAt")
      .lean();

    return res.json(jobs);
  } catch (error) {
    console.error("listOpenJobs error:", error);

    return res.status(500).json({
      message: "Unable to load job openings.",
    });
  }
};

/*
=========================================================
POST /api/careers/apply
Save the application in MongoDB and create an HTML file
in the existing Google Drive connection.
=========================================================
*/
export const applyToJob = async (req, res) => {
  let application = null;

  try {
    const {
      jobId,
      fullName,
      email,
      phone,
      linkedinUrl,
      resumeLink,
      qualification,
      experienceYears,
    } = req.body;

    const data = {
      fullName: String(fullName || "").trim(),
      email: String(email || "").trim().toLowerCase(),
      phone: String(phone || "").trim(),
      linkedinUrl: String(linkedinUrl || "").trim(),
      resumeLink: String(resumeLink || "").trim(),
      qualification: String(qualification || "").trim(),
      experienceYears: Number(experienceYears),
    };

    // Validate selected job ID.
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        message: "Invalid job selected.",
      });
    }

    // Required fields.
    if (
      !data.fullName ||
      !data.email ||
      !data.phone ||
      !data.linkedinUrl ||
      !data.resumeLink ||
      !data.qualification
    ) {
      return res.status(400).json({
        message: "Please fill in all the fields.",
      });
    }

    // Validate email.
    if (!EMAIL_REGEX.test(data.email)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    // Validate phone.
    if (!PHONE_REGEX.test(data.phone)) {
      return res.status(400).json({
        message: "Please enter a valid phone number.",
      });
    }

    // Validate LinkedIn profile URL.
    if (!LINKEDIN_REGEX.test(data.linkedinUrl)) {
      return res.status(400).json({
        message:
          "Please enter a valid LinkedIn profile URL (e.g. https://www.linkedin.com/in/your-name).",
      });
    }

    // Validate Google Drive resume URL.
    if (!DRIVE_FILE_REGEX.test(data.resumeLink)) {
      return res.status(400).json({
        message: "Please enter a valid Google Drive link to your resume.",
      });
    }

    // Validate experience.
    if (
      !Number.isFinite(data.experienceYears) ||
      data.experienceYears < 0 ||
      data.experienceYears > 50
    ) {
      return res.status(400).json({
        message: "Please enter valid years of experience.",
      });
    }

    // Confirm the job is still active.
    const job = await Job.findOne({
      _id: jobId,
      isActive: true,
    });

    if (!job) {
      return res.status(404).json({
        message: "This opening is no longer available.",
      });
    }

    /*
    -----------------------------------------------------
    STEP 1: SAVE APPLICATION IN MONGODB
    -----------------------------------------------------
    */
    application = await Application.create({
      job: job._id,
      ...data,
      driveSyncStatus: "pending",
    });

    /*
    -----------------------------------------------------
    STEP 2: CREATE HTML FILE IN GOOGLE DRIVE
    -----------------------------------------------------
    */
    try {
      // Reuse the existing Google Drive connection.
      const careersFolderId = await getOrCreateFolder(
        "Careers Applications"
      );

      // Sanitize applicant name for the filename.
      const safeName =
        data.fullName
          .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 100) || "Applicant";

      const fileName = `${safeName}.html`;

      const applicationDate = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      });

      // Escape user-provided values before inserting them into HTML.
      const applicantNameHtml = escapeHtml(data.fullName);
      const emailHtml = escapeHtml(data.email);
      const phoneHtml = escapeHtml(data.phone);
      const qualificationHtml = escapeHtml(data.qualification);
      const experienceHtml = escapeHtml(data.experienceYears);
      const jobTitleHtml = escapeHtml(job.title);
      const jobTypeHtml = escapeHtml(job.type);
      const jobLocationHtml = escapeHtml(job.location);
      const applicationDateHtml = escapeHtml(applicationDate);
      const applicationIdHtml = escapeHtml(application._id);

      // Encode URLs safely for HTML attributes.
      const linkedinUrlHtml = escapeHtml(data.linkedinUrl);
      const resumeUrlHtml = escapeHtml(data.resumeLink);

      const fileContents = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Job Application - ${applicantNameHtml}</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 32px 16px;
      background: #f4f7fb;
      color: #263445;
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.6;
    }

    .container {
      max-width: 760px;
      margin: 0 auto;
      overflow: hidden;
      background: #ffffff;
      border: 1px solid #e1e8f0;
      border-radius: 14px;
      box-shadow: 0 8px 28px rgba(16, 43, 78, 0.08);
    }

    .header {
      padding: 28px 32px;
      background: #102b4e;
      color: #ffffff;
    }

    .brand {
      margin: 0;
      font-size: 27px;
      font-weight: 800;
      letter-spacing: 0.2px;
    }

    .brand span {
      color: #61d6bd;
    }

    .subtitle {
      margin: 8px 0 0;
      color: #dce8f5;
      font-size: 14px;
    }

    .content {
      padding: 28px 32px 32px;
    }

    .status {
      display: inline-block;
      margin-bottom: 22px;
      padding: 6px 12px;
      border-radius: 20px;
      background: #e4f8ef;
      color: #167448;
      font-size: 12px;
      font-weight: 700;
    }

    .section-title {
      margin: 26px 0 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5ebf2;
      color: #102b4e;
      font-size: 17px;
    }

    .section-title:first-of-type {
      margin-top: 0;
    }

    .details {
      width: 100%;
      border-collapse: collapse;
    }

    .details td {
      padding: 11px 8px;
      border-bottom: 1px solid #edf1f5;
      vertical-align: top;
      overflow-wrap: anywhere;
    }

    .details td:first-child {
      width: 36%;
      color: #637386;
      font-weight: 600;
    }

    a {
      color: #1769c2;
      font-weight: 600;
      text-decoration: underline;
      overflow-wrap: anywhere;
    }

    a:hover {
      color: #102b4e;
    }

    .application-meta {
      margin-top: 26px;
      padding: 16px;
      border: 1px solid #e5ebf2;
      border-radius: 9px;
      background: #f8fafc;
      font-size: 13px;
      overflow-wrap: anywhere;
    }

    .footer {
      padding: 18px 32px;
      background: #f8fafc;
      border-top: 1px solid #e5ebf2;
      color: #728096;
      font-size: 12px;
      text-align: center;
    }

    @media (max-width: 520px) {
      body {
        padding: 12px 8px;
      }

      .header,
      .content {
        padding: 22px 18px;
      }

      .details td {
        display: block;
        width: 100%;
        padding: 6px 0;
        border-bottom: none;
      }

      .details tr {
        display: block;
        padding: 10px 0;
        border-bottom: 1px solid #edf1f5;
      }

      .details td:first-child {
        width: 100%;
      }

      .footer {
        padding: 16px 18px;
      }
    }
  </style>
</head>

<body>
  <main class="container">
    <header class="header">
      <h1 class="brand">Jashna <span>Edu</span></h1>
      <p class="subtitle">Careers &amp; Recruitment · Job Application</p>
    </header>

    <section class="content">
      <div class="status">APPLICATION RECEIVED</div>

      <h2 class="section-title">Applicant Information</h2>

      <table class="details">
        <tr>
          <td>Full Name</td>
          <td>${applicantNameHtml}</td>
        </tr>
        <tr>
          <td>Email Address</td>
          <td>
            <a href="mailto:${emailHtml}">${emailHtml}</a>
          </td>
        </tr>
        <tr>
          <td>Phone Number</td>
          <td>${phoneHtml}</td>
        </tr>
        <tr>
          <td>Qualification</td>
          <td>${qualificationHtml}</td>
        </tr>
        <tr>
          <td>Years of Experience</td>
          <td>${experienceHtml}</td>
        </tr>
      </table>

      <h2 class="section-title">Position Details</h2>

      <table class="details">
        <tr>
          <td>Position</td>
          <td>${jobTitleHtml}</td>
        </tr>
        <tr>
          <td>Job Type</td>
          <td>${jobTypeHtml}</td>
        </tr>
        <tr>
          <td>Location</td>
          <td>${jobLocationHtml}</td>
        </tr>
      </table>

      <h2 class="section-title">Applicant Links</h2>

      <table class="details">
        <tr>
          <td>LinkedIn Profile</td>
          <td>
            <a href="${linkedinUrlHtml}" target="_blank" rel="noopener noreferrer">
              View LinkedIn Profile ↗
            </a>
          </td>
        </tr>
        <tr>
          <td>Resume</td>
          <td>
            <a href="${resumeUrlHtml}" target="_blank" rel="noopener noreferrer">
              View Applicant Resume ↗
            </a>
          </td>
        </tr>
      </table>

      <div class="application-meta">
        <strong>Application Date:</strong> ${applicationDateHtml}<br>
        <strong>Application ID:</strong> ${applicationIdHtml}<br>
        <strong>Application Status:</strong> Received
      </div>
    </section>

    <footer class="footer">
      Jashna Edu · Internal Recruitment Record
    </footer>
  </main>
</body>
</html>`;

      // Upload the HTML file to the existing Careers Applications folder.
      const uploadedFile = await uploadBuffer({
        buffer: Buffer.from(fileContents, "utf8"),
        fileName,
        mimeType: "text/html",
        folderId: careersFolderId,
      });

      // Update the MongoDB record with Drive details.
      application.driveFileId = uploadedFile.id;
      application.resumeFileName = fileName;
      application.resumeMimeType = "text/html";
      application.driveSyncStatus = "synced";

      await application.save();

      return res.status(201).json({
        message: "Your application has been submitted successfully.",
        driveSynced: true,
      });
    } catch (driveError) {
      console.error(
        "Careers Google Drive sync failed:",
        driveError.message
      );

      // Preserve the MongoDB application if Drive sync fails.
      application.driveSyncStatus = "failed";
      await application.save();

      return res.status(201).json({
        message:
          "Your application was received, but syncing it to Google Drive failed. Please contact Jashna Edu if needed.",
        driveSynced: false,
      });
    }
  } catch (error) {
    // Unique index: one application per job and email.
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "You have already applied for this position with this email.",
      });
    }

    console.error("applyToJob error:", error);

    return res.status(500).json({
      message: "Unable to submit your application. Please try again.",
    });
  }
};