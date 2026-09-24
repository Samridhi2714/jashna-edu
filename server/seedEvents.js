import mongoose from "mongoose";
import dotenv from "dotenv";

import Event from "./models/Event.js";

dotenv.config();

const events = [
  {
    eventNumber: 1,
    title: "Seminar & Mock Interview",
    date: "2026-08-20T00:00:00.000Z",
    datePrecision: "exact",
    location: "DAV Institute of Management (DAVIM)",
    description:
      "A focused learning and interview experience designed to help students understand professional expectations, strengthen communication and gain confidence through practical interaction.",
    category: "Seminar & Mock Interview",
    status: "published",
  },

  {
    eventNumber: 2,
    title: "Voice & Vision – Phase 1, 2026",
    date: "2026-08-19T00:00:00.000Z",
    datePrecision: "exact",
    location: "Vivekanand International School",
    description:
      "An engaging experience encouraging students to express their ideas, communicate with confidence and discover the power of their own voice.",
    category: "Event",
    status: "published",
  },

  {
    eventNumber: 3,
    title: "Jashna Storytelling 2026",
    date: "2026-07-06T00:00:00.000Z",
    datePrecision: "exact",
    location: "Jashna Edu, N.I.T.-2, Faridabad",
    description:
      "A storytelling experience where participants turned ideas and imagination into meaningful stories while developing expression, confidence and public speaking skills.",
    category: "Storytelling Competition",
    status: "published",
  },

  {
    eventNumber: 4,
    title: "Webinar on Building a Winning Resume",
    date: "2026-07-04T00:00:00.000Z",
    datePrecision: "exact",
    location: "Online — Zoom",
    description:
      "A practical webinar focused on creating a stronger professional resume and presenting skills, experiences and achievements with greater clarity.",
    category: "Webinar",
    status: "published",
  },

  {
    eventNumber: 5,
    title: "Session on English Language",
    date: "2026-01-01T00:00:00.000Z",
    datePrecision: "year",
    location: "YMCA / J.C. Bose University of Science and Technology, YMCA",
    description:
      "An interactive English language session focused on improving everyday communication, confidence and the ability to express thoughts effectively.",
    category: "Session",
    status: "published",
  },

  {
    eventNumber: 6,
    title: "From Campus to Career: Skills That Truly Matter",
    date: "2026-05-08T00:00:00.000Z",
    datePrecision: "exact",
    location: "Amity University Rajasthan",
    description:
      "A career-focused conversation connecting campus learning with workplace expectations and highlighting the practical skills that help students become future-ready.",
    category: "Career Session",
    status: "published",
  },

  {
    eventNumber: 7,
    title: "Career Counselling",
    date: "2026-04-28T00:00:00.000Z",
    datePrecision: "exact",
    location: "K.L. Mehta Dayanand College",
    description:
      "A guidance-driven session helping students think through career choices, understand their strengths and approach their next professional step with greater direction.",
    category: "Career Counselling",
    status: "published",
  },

  {
    eventNumber: 8,
    title: "Intelligent, Qualified, Yet Not Selected",
    date: "2026-04-09T00:00:00.000Z",
    datePrecision: "exact",
    location: "Echelon Institute of Technology",
    description:
      "A thought-provoking workshop exploring why qualifications alone may not be enough and how communication, confidence and interview readiness influence professional opportunities.",
    category: "Workshop",
    status: "published",
  },

  {
    eventNumber: 9,
    title: "350+ Mock Interviews & Workshop",
    date: "2026-03-30T00:00:00.000Z",
    datePrecision: "exact",
    location: "K.L. Mehta Dayanand College",
    description:
      "A large-scale practical experience giving students an opportunity to face interview situations, receive guidance and understand how to present themselves professionally.",
    category: "Mock Interviews & Workshop",
    status: "published",
  },

  {
    eventNumber: 10,
    title: "Mock Interview",
    date: "2026-01-01T00:00:00.000Z",
    datePrecision: "year",
    location: "Town Park, Sector-12, Faridabad",
    description:
      "A hands-on mock interview experience designed to turn interview preparation into practice and help participants become more comfortable answering real-world questions.",
    category: "Mock Interview",
    status: "published",
  },

  {
    eventNumber: 11,
    title: "Jashna Storytelling Competition 2025",
    date: "2025-06-20T00:00:00.000Z",
    datePrecision: "exact",
    location: "",
    description:
      "A memorable storytelling gathering where participants shared their ideas, experiences and imagination while building confidence through the art of speaking.",
    category: "Storytelling Competition",
    status: "published",
  },

  {
    eventNumber: 12,
    title: "Session on Habits That Build Startups",
    date: "2025-05-09T00:00:00.000Z",
    datePrecision: "exact",
    location: "YMCA / J.C. Bose University of Science and Technology, YMCA",
    description:
      "An inspiring session exploring the habits, mindset and everyday practices that can help aspiring entrepreneurs move ideas closer to meaningful action.",
    category: "Session",
    status: "published",
  },

  {
    eventNumber: 13,
    title: "Workshop on Interview Skills",
    date: "2025-01-01T00:00:00.000Z",
    datePrecision: "year",
    location: "Mangalayatan University",
    description:
      "A practical workshop helping participants understand interview etiquette, communicate their strengths and approach professional conversations with confidence.",
    category: "Workshop",
    status: "published",
  },

  {
    eventNumber: 14,
    title: "Workshop on Interview Skills",
    date: "2025-01-02T00:00:00.000Z",
    datePrecision: "year",
    location: "Echelon Institute of Technology",
    description:
      "An interactive interview-readiness workshop designed to help students prepare stronger responses, improve body language and feel more prepared for selection processes.",
    category: "Workshop",
    status: "published",
  },

  {
    eventNumber: 15,
    title: "Workshop on “CyberCrime, Drugs, & Traffic Rules”",
    date: "2025-01-03T00:00:00.000Z",
    datePrecision: "year",
    location: "The Institute of English Language, Jashna",
    description:
      "An awareness-focused workshop bringing important social and safety topics into conversation while encouraging responsible choices and informed participation.",
    category: "Workshop",
    status: "published",
  },

  {
    eventNumber: 16,
    title: "Workshop on Interview Skills",
    date: "2025-03-08T00:00:00.000Z",
    datePrecision: "exact",
    location: "K.L. Mehta Dayanand College for Women, Faridabad",
    description:
      "A skill-building workshop where students could practise professional communication, understand interview expectations and develop greater confidence before entering selection rounds.",
    category: "Workshop",
    status: "published",
  },

  {
    eventNumber: 17,
    title: "Workshop on Interview Skills",
    date: "2025-03-03T00:00:00.000Z",
    datePrecision: "exact",
    location: "DAV Institute of Management",
    description:
      "A practical learning session centred on interview preparation, professional presentation and the communication skills needed to make a stronger first impression.",
    category: "Workshop",
    status: "published",
  },

  {
    eventNumber: 18,
    title: "Workshop on Interview Skills",
    date: "2024-11-18T00:00:00.000Z",
    datePrecision: "exact",
    location: "MVN University, Palwal",
    description:
      "An engaging interview-skills workshop helping participants move beyond theoretical preparation and practise the confidence, clarity and presence expected in interviews.",
    category: "Workshop",
    status: "published",
  },

  {
    eventNumber: 19,
    title: "Workshop on Interview Preparation",
    date: "2024-11-08T00:00:00.000Z",
    datePrecision: "exact",
    location: "K.L. Mehta Dayanand College for Women, Faridabad",
    description:
      "A preparation-oriented session giving students useful perspectives on answering interview questions, presenting themselves professionally and handling interview situations calmly.",
    category: "Workshop",
    status: "published",
  },

  {
    eventNumber: 20,
    title: "Mock Interviews",
    date: "2024-10-08T00:00:00.000Z",
    datePrecision: "exact",
    location: "Government College for Women, Sector-16A, Faridabad",
    description:
      "A practical mock interview experience created to simulate the interview environment and help participants identify areas for improvement before real opportunities arrive.",
    category: "Mock Interview",
    status: "published",
  },

  {
    eventNumber: 21,
    title: "Mock Interview",
    date: "2024-01-01T00:00:00.000Z",
    datePrecision: "year",
    location: "DAV Centenary College, Faridabad",
    description:
      "A confidence-building interview practice session where participants could test their preparation, refine their answers and become more comfortable with professional conversations.",
    category: "Mock Interview",
    status: "published",
  },

  {
    eventNumber: 22,
    title: "Career Prospects",
    date: "2024-01-02T00:00:00.000Z",
    datePrecision: "year",
    location: "Amity University",
    description:
      "A career exploration session encouraging students to look beyond academic qualifications and think about opportunities, skills and pathways that can shape their professional future.",
    category: "Career Session",
    status: "published",
  },

  {
    eventNumber: 23,
    title: "Mock Interview",
    date: "2024-01-03T00:00:00.000Z",
    datePrecision: "year",
    location: "Echelon Institute of Technology",
    description:
      "A realistic interview practice experience focused on improving response quality, communication and confidence while preparing participants for the expectations of recruiters.",
    category: "Mock Interview",
    status: "published",
  },

  {
    eventNumber: 24,
    title: "Mock Interviews",
    date: "2024-09-19T00:00:00.000Z",
    datePrecision: "exact",
    location: "Aravali Institute of Engineering & Management",
    description:
      "A hands-on opportunity for students to experience interview-style conversations, reflect on their performance and strengthen the way they communicate their abilities.",
    category: "Mock Interview",
    status: "published",
  },

  {
    eventNumber: 25,
    title: "Mock Interview",
    date: "2024-09-18T00:00:00.000Z",
    datePrecision: "exact",
    location: "J.C. Bose University of Science and Technology, YMCA",
    description:
      "An experiential interview session helping participants practise professional answers, manage interview pressure and approach future selection rounds with greater self-assurance.",
    category: "Mock Interview",
    status: "published",
  },

  {
    eventNumber: 26,
    title: "Training Session",
    date: "2023-01-01T00:00:00.000Z",
    datePrecision: "year",
    location: "GAIL (India) Limited, Jaipur",
    description:
      "Dr. Shivam delivered a session on Work-Life Balance on behalf of Amity University, Rajasthan.",
    category: "Training Session",
    status: "published",
  },
];

const seedEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected to:", mongoose.connection.name);

    let created = 0;
    let updated = 0;

    for (const eventData of events) {
      const existingEvent = await Event.findOne({
        title: eventData.title,
        location: eventData.location,
      });

      if (existingEvent) {
        await Event.findByIdAndUpdate(existingEvent._id, eventData, {
          new: true,
          runValidators: true,
        });

        updated++;
      } else {
        await Event.create(eventData);
        created++;
      }
    }

    console.log(`Events created: ${created}`);
    console.log(`Events updated: ${updated}`);
    console.log(`Total seed records processed: ${events.length}`);

    const totalEvents = await Event.countDocuments();

    console.log(`Total events currently in database: ${totalEvents}`);

    await mongoose.connection.close();

    console.log("Seed completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Event seed failed:");
    console.error(error.message);

    await mongoose.connection.close().catch(() => {});

    process.exit(1);
  }
};

seedEvents();