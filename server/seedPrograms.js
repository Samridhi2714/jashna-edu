/*
  One-time seed: copies your existing client/src/data/programs.js into MongoDB
  so the public page looks exactly the same after switching to the API.

  Run from the server folder:
    node server/seedPrograms.js                    (skips if programs already exist)
    node server/seedPrograms.js --force            (wipes and re-seeds)
    node server/seedPrograms.js ../client/src/data/programs.js   (custom path)
*/
import "dotenv/config";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import mongoose from "mongoose";

import Program from "./models/Program.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const force = args.includes("--force");
const dataArg = args.find((a) => !a.startsWith("--"));
const dataPath = path.resolve(__dirname, dataArg || "../client/src/data/programs.js");

// Same grouping the page used to hard-code in its `goals` array.
const goalByTitle = {
  "Spoken English & Fluency": "confidence",
  "Public Speaking Mastery": "confidence",
  "Presentation & Storytelling Skills": "confidence",
  "Interview & Career Skills": "career",
  "Business English & Workplace Communication": "career",
  "Professional Writing Skills": "career",
  "IELTS Preparation & Success": "academic",
  "English for Competitive Exams": "academic",
  "English as a Foreign Language": "academic",
  "Teacher Training & Development": "educator",
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

  const existing = await Program.countDocuments();
  if (existing > 0 && !force) {
    console.log(`Programs collection already has ${existing} documents. Use --force to re-seed.`);
    return;
  }

  const { default: source } = await import(pathToFileURL(dataPath).href);

  if (force) await Program.deleteMany();

  for (const [index, p] of source.entries()) {
    await Program.create({
      title: p.title,
      shortTitle: p.shortTitle || "",
      category: p.category,
      goalId: goalByTitle[p.title] || "",
      duration: p.duration || "",
      description: p.description,
      audience: p.audience || "",
      highlights: Array.isArray(p.highlights) ? p.highlights : [],
      fees: typeof p.fees === "number" ? p.fees : null,
      status: "published",
      displayOrder: index,
    });
  }

  console.log(`Seeded ${source.length} programs from ${dataPath}`);
};

run()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());