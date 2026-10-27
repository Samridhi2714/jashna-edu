import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import FAQ from "./models/FAQ.js";

/* =========================================================
   INITIAL JASHNA EDU FAQs
   Only missing questions will be inserted.
========================================================= */

const initialFAQs = [
  {
    question: "Which English communication program is right for me?",
    answer:
      "Jashna Edu offers programs focused on Spoken English, IELTS preparation, Public Speaking, Interview Skills, and Business English. The right program depends on your current skills, learning goals, and professional or personal needs. Explore our programs to find an option that suits you.",
    linkText: "Explore Our Programs",
    linkUrl: "/programs",
    isPublished: true,
    order: 1,
  },
  {
    question: "What are the batch timings at Jashna Edu?",
    answer:
      "Batch timings and availability may vary. Contact our team to enquire about the current schedules and find a suitable batch before enrolling.",
    linkText: "Enquire About Batch Timings",
    linkUrl:
      "https://wa.me/919953009947?text=Hello%20Dr.%20Shivam%20Sir%2C%20I%20would%20like%20to%20know%20the%20current%20batch%20timings%20at%20Jashna%20Edu.",
    isPublished: true,
    order: 2,
  },
  {
    question: "Who can join Jashna Edu's programs?",
    answer:
      "Our programs are designed around different communication and learning goals. The most suitable program depends on your requirements and the course you wish to pursue. Contact our team to discuss your goals and confirm the eligibility requirements for your chosen program.",
    linkText: "Explore Programs",
    linkUrl: "/programs",
    isPublished: true,
    order: 3,
  },
  {
    question: "How can I prepare for IELTS with Jashna Edu?",
    answer:
      "If you are planning to take IELTS, explore our IELTS program to learn more about the preparation opportunities available at Jashna Edu. Contact our team for details about the program and the next steps.",
    linkText: "Explore IELTS Preparation",
    linkUrl: "/ielts",
    isPublished: true,
    order: 4,
  },
  {
    question:
      "Who is Dr. Shivam, and what makes Jashna Edu different?",
    answer:
      "Jashna Edu focuses on helping learners develop practical English communication skills for personal, academic, and professional growth. Visit our About page to learn more about the founder and the vision behind Jashna Edu.",
    linkText: "Meet Our Founder",
    linkUrl: "/about",
    isPublished: true,
    order: 5,
  },
  {
    question:
      "Which program can help me improve my confidence and speaking skills?",
    answer:
      "The right program depends on the skills you want to develop. Spoken English can help you work on everyday communication, while Public Speaking focuses on expressing ideas before an audience. Explore the available programs to decide which best matches your goals.",
    linkText: "Find Your Program",
    linkUrl: "/programs",
    isPublished: true,
    order: 6,
  },
  {
    question: "How can I explore career opportunities at Jashna Edu?",
    answer:
      "For information about career opportunities and vacancies at Jashna Edu, visit our Careers page to explore the opportunities currently listed there.",
    linkText: "Explore Career Opportunities",
    linkUrl: "/careers",
    isPublished: true,
    order: 7,
  },
  {
    question:
      "How can I book a consultation or enquire about admission?",
    answer:
      "You can contact the Jashna Edu team through WhatsApp to discuss your learning goals, enquire about programs, and ask about the next steps for admission.",
    linkText: "Book a Consultation",
    linkUrl:
      "https://wa.me/919953009947?text=Hello%20Dr.%20Shivam%20Sir%2C%20I%20would%20like%20to%20book%20a%20consultation%20about%20Jashna%20Edu%20programs.",
    isPublished: true,
    order: 8,
  },
];

/* =========================================================
   SEED FAQs
========================================================= */

const seedFAQs = async () => {
  try {
    // Connect through the existing database configuration.
    await connectDB();

    // Read existing questions so we don't create duplicates.
    const existingFAQs = await FAQ.find({}, "question").lean();

    const existingQuestions = new Set(
      existingFAQs.map((faq) =>
        faq.question.trim().toLowerCase()
      )
    );

    const missingFAQs = initialFAQs.filter(
      (faq) =>
        !existingQuestions.has(faq.question.trim().toLowerCase())
    );

    if (missingFAQs.length === 0) {
      console.log(
        "All eight initial FAQ questions already exist. No new records inserted."
      );
      return;
    }

    await FAQ.insertMany(missingFAQs);

    console.log(
      `Successfully inserted ${missingFAQs.length} FAQ(s).`
    );

    console.log(
      `Total FAQs in database: ${await FAQ.countDocuments()}`
    );

    console.log("Inserted questions:");

    missingFAQs.forEach((faq, index) => {
      console.log(`${index + 1}. ${faq.question}`);
    });
  } catch (error) {
    console.error("FAQ seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
};

seedFAQs();
