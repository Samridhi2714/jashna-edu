import express from "express";
import AssessmentLinks from "../models/AssessmentLinks.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

const INITIAL_ASSESSMENTS = [
{
assessmentType: "general-english",
title: "General English",
sets: [
{
setNumber: 1,
title: "Test Set 1",
link: "https://forms.gle/ZCvBieT6vtseHD2Q6",
},
{
setNumber: 2,
title: "Test Set 2",
link: "",
},
{
setNumber: 3,
title: "Test Set 3",
link: "",
},
{
setNumber: 4,
title: "Test Set 4",
link: "",
},
{
setNumber: 5,
title: "Test Set 5",
link: "",
},
{
setNumber: 6,
title: "Test Set 6",
link: "",
},
],
},
{
assessmentType: "business-english",
title: "Business English",
sets: Array.from({ length: 6 }, (_, index) => ({
setNumber: index + 1,
title: `Test Set ${index + 1}`,
link: "",
})),
},
];

const isValidGoogleFormLink = (value) => {
if (!value) return true;

try {
const url = new URL(value);

```
return (
  url.protocol === "https:" &&
  (url.hostname === "forms.gle" ||
    url.hostname === "docs.google.com")
);
```

} catch {
return false;
}
};

const ensureInitialAssessments = async () => {
for (const assessment of INITIAL_ASSESSMENTS) {
await AssessmentLinks.updateOne(
{ assessmentType: assessment.assessmentType },
{ $setOnInsert: assessment },
{ upsert: true, runValidators: true }
);
}
};

/**

* GET /api/assessment-links
* Public endpoint.
* Returns available links for the assessment cards.
  */
  router.get("/", async (req, res) => {
  try {
  await ensureInitialAssessments();

  const assessments = await AssessmentLinks.find(
  {},
  { _id: 0, __v: 0 }
  ).lean();

  res.json({
  success: true,
  assessments,
  });
  } catch (error) {
  console.error("Fetch assessment links error:", error);

  res.status(500).json({
  success: false,
  message: "Unable to load assessment links.",
  });
  }
  });

/**

* GET /api/assessment-links/admin
* Protected endpoint.
* Returns assessment configuration for the admin page.
  */
  router.get("/admin", protect, async (req, res) => {
  try {
  await ensureInitialAssessments();

  const assessments = await AssessmentLinks.find().sort({
  assessmentType: 1,
  });

  res.json({
  success: true,
  assessments,
  });
  } catch (error) {
  console.error("Admin fetch assessment links error:", error);

  res.status(500).json({
  success: false,
  message: "Unable to load assessment settings.",
  });
  }
  });

/**

* PUT /api/assessment-links/admin/:assessmentType
* Protected endpoint.
* Updates all six sets for one assessment.
  */
  router.put("/admin/:assessmentType", protect, async (req, res) => {
  try {
  const { assessmentType } = req.params;
  const { sets } = req.body;

  if (
  !["general-english", "business-english"].includes(
  assessmentType
  )
  ) {
  return res.status(400).json({
  success: false,
  message: "Invalid assessment type.",
  });
  }

  if (!Array.isArray(sets) || sets.length !== 6) {
  return res.status(400).json({
  success: false,
  message: "Exactly six test sets are required.",
  });
  }

  const seenNumbers = new Set();

  for (const set of sets) {
  if (
  !Number.isInteger(set.setNumber) ||
  set.setNumber < 1 ||
  set.setNumber > 6 ||
  seenNumbers.has(set.setNumber)
  ) {
  return res.status(400).json({
  success: false,
  message: "Test sets must be numbered uniquely from 1 to 6.",
  });
  }

  seenNumbers.add(set.setNumber);

  if (
  typeof set.link !== "string" ||
  !isValidGoogleFormLink(set.link.trim())
  ) {
  return res.status(400).json({
  success: false,
  message: `Test Set ${set.setNumber} must contain a valid Google Forms URL or be left empty.`,
  });
  }
  }

  const title =
  assessmentType === "general-english"
  ? "General English"
  : "Business English";

  const normalizedSets = sets
  .map((set) => ({
  setNumber: set.setNumber,
  title: `Test Set ${set.setNumber}`,
  link: set.link.trim(),
  }))
  .sort((a, b) => a.setNumber - b.setNumber);

  const assessment = await AssessmentLinks.findOneAndUpdate(
  { assessmentType },
  {
  $set: {
  title,
  sets: normalizedSets,
  },
  },
  {
  new: true,
  upsert: true,
  runValidators: true,
  setDefaultsOnInsert: true,
  }
  );

  res.json({
  success: true,
  message: `${title} links saved successfully.`,
  assessment,
  });
  } catch (error) {
  console.error("Save assessment links error:", error);

  res.status(500).json({
  success: false,
  message: "Unable to save assessment links.",
  });
  }
  });

export default router;
