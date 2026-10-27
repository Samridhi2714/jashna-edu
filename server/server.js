import "dotenv/config";
import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import eventRoutes from "./routes/eventRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import StudentAtendanceRoutes from "./routes/studentAttendanceRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import studentTaskRoutes from "./routes/studentTaskRoutes.js";
import batchRoutes from "./routes/batchRoutes.js";
import driveRoutes from "./routes/driveRoutes.js";
import instituteInfoRoutes from "./routes/instituteInforoutes.js";
import programRoutes from "./routes/programRoutes.js";
import recentAdmissionRoutes from "./routes/recentAdmissionRoutes.js";
import studentLearningGoalsRoutes from "./routes/studentLearningGoalsRoutes.js";
import adminCareersRoutes from "./routes/adminCareerRoutes.js";
import careersRoutes from "./routes/careersRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";
import assessmentLinksRoutes from "./routes/assessmentLinksRoutes.js";
const app = express();

connectDB();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Jashna Edu API is running",
  });
});
app.use("/api/ai", aiRoutes);
/*TEMPORARY ENDPOINT FOR TESTING OPENAI CONFIGURATION*/
app.get("/api/test-openai-config", (req, res) => {
  res.json({
    apiKeyLoaded: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL || "not configured",
  });
});
app.get("/api/test-openai", async (req, res) => {
  try {
    const OpenAI = (await import("openai")).default;

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      input: "Reply with exactly: Jashna AI connection successful",
    });

    res.json({
      success: true,
      response: response.output_text,
    });
  } catch (error) {
    console.error("OpenAI test error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/api/test-groq", async (req, res) => {
  try {
    const Groq = (await import("groq-sdk")).default;

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
      messages: [
        {
          role: "user",
          content:
            "Reply with exactly: Jashna Groq AI connection successful",
        },
      ],
    });

    res.json({
      success: true,
      response: completion.choices[0]?.message?.content || "",
    });
  } catch (error) {
    console.error("Groq test error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/student-attendance", StudentAtendanceRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/student-tasks", studentTaskRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/drive", driveRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/settings", instituteInfoRoutes);
app.use("/api/recent-admissions", recentAdmissionRoutes);
app.use("/api/student-learning-goals", studentLearningGoalsRoutes);
app.use("/api/admin/careers", adminCareersRoutes);
app.use("/api/careers", careersRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/assessment-links", assessmentLinksRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});