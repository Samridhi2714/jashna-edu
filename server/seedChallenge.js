import mongoose from "mongoose";
import dotenv from "dotenv";
import Challenge from "./models/Challenge.js";
import ChallengeSettings from "./models/ChallengeSettings.js";

dotenv.config();

/* =========================================================
   JASHNA WEEKLY CHALLENGE BANK

   8 CATEGORIES × 3 DIFFICULTIES

   Categories:
   1. Vocabulary
   2. Grammar
   3. Speaking
   4. Interview
   5. Professional English
   6. Pronunciation
   7. Idioms
   8. Writing

   Difficulty progression:
   Beginner → recognition / basic production
   Intermediate → application / contextual use
   Advanced → reasoning / nuance / quality
========================================================= */

const CHALLENGES = [
  /* =======================================================
     1. VOCABULARY
  ======================================================= */

  {
    id: "vocabulary-easy",
    label: "VOCABULARY",
    type: "text",
    active: true,

    title: "Word Builder — Beginner",

    description:
      "Learn a useful English word and practise using it naturally in context.",

    task: "Choose one English word you recently learned and use it correctly in a sentence. Your sentence should make the meaning of the word clear.",

    placeholder:
      "Example: Curious — I was curious to learn how the machine worked.",

    expectedResponse:
      "One grammatically correct sentence using a suitable English word in a way that clearly demonstrates its meaning.",

    evaluationCriteria: {
      type: "text_quality",
      minWords: 5,
      maxWords: 40,
      requiredElements: [
        "one English vocabulary word",
        "correct meaning",
        "appropriate sentence context",
      ],
      checks: ["word meaning", "grammar", "sentence clarity"],
    },

    evaluationMode: "ai",
    evaluationCategory: "vocabulary",
    difficulty: "Beginner",

    feedback: {
      correct:
        "Good use of vocabulary. Keep building your word bank by using new words in everyday sentences.",
      incorrect:
        "Make sure the word is being used according to its actual meaning and fits naturally into the sentence.",
    },
  },

  {
    id: "vocabulary-medium",
    label: "VOCABULARY",
    type: "text",
    active: true,

    title: "Word Builder — Intermediate",

    description:
      "Move beyond basic vocabulary by choosing precise words for a specific situation.",

    task: "Choose an intermediate-level English word and use it in a sentence about a real academic, workplace or everyday situation. The context should clearly show why that particular word is appropriate.",

    placeholder:
      "Example: Reluctant — She was reluctant to accept the offer because she needed more time to decide.",

    expectedResponse:
      "A contextual sentence that demonstrates both the correct meaning and appropriate use of an intermediate-level word.",

    evaluationCriteria: {
      type: "text_quality",
      minWords: 8,
      maxWords: 60,
      requiredElements: [
        "intermediate-level vocabulary",
        "specific context",
        "clear demonstration of meaning",
      ],
      checks: [
        "meaning precision",
        "contextual appropriateness",
        "grammar",
        "naturalness",
      ],
    },

    evaluationMode: "ai",
    evaluationCategory: "vocabulary",
    difficulty: "Intermediate",

    feedback: {
      correct:
        "Nice contextual use. Strong vocabulary becomes more useful when you can choose the right word for a specific situation.",
      incorrect:
        "The word should fit the situation naturally. Check both its meaning and the context in which it is normally used.",
    },
  },

  {
    id: "vocabulary-hard",
    label: "VOCABULARY",
    type: "text",
    active: true,

    title: "Precision Words — Advanced",

    description:
      "Test your ability to use advanced vocabulary with precision rather than simply using complicated words.",

    task: "Choose an advanced English word and write a sentence in a professional or academic context. Your sentence should demonstrate the word's precise meaning and show that you understand its tone or nuance.",

    placeholder:
      "Example: Pragmatic — Rather than pursuing an ideal solution, the team adopted a pragmatic approach that could be implemented immediately.",

    expectedResponse:
      "A precise professional or academic sentence using advanced vocabulary appropriately, with correct meaning, grammar and tone.",

    evaluationCriteria: {
      type: "text_quality",
      minWords: 12,
      maxWords: 80,
      requiredElements: [
        "advanced vocabulary",
        "professional or academic context",
        "precise meaning",
        "appropriate tone",
      ],
      checks: [
        "semantic precision",
        "context",
        "tone",
        "grammar",
        "naturalness",
      ],
    },

    evaluationMode: "ai",
    evaluationCategory: "vocabulary",
    difficulty: "Advanced",

    feedback: {
      correct:
        "Excellent precision. Advanced vocabulary is most effective when it improves meaning rather than simply making a sentence sound complex.",
      incorrect:
        "Using an advanced word is not enough. Make sure its exact meaning and tone fit the context.",
    },
  },

  /* =======================================================
     2. GRAMMAR
  ======================================================= */

  {
    id: "grammar-easy",
    label: "GRAMMAR",
    type: "mcq",
    active: true,

    title: "Grammar Fix — Beginner",

    description: "Test your understanding of basic subject–verb agreement.",

    task: "Which sentence is grammatically correct?",

    options: [
      "She go to college every day.",
      "She goes to college every day.",
      "She going to college every day.",
      "She gone to college every day.",
    ],

    correct: 1,

    expectedResponse: "She goes to college every day.",

    evaluationCriteria: {
      type: "exact_match",
      concept: "subject-verb agreement",
    },

    evaluationMode: "rule_based",
    evaluationCategory: "grammar",
    difficulty: "Beginner",

    feedback: {
      correct:
        "Correct. With 'she', the present-simple verb takes the -s form: 'goes'.",
      incorrect:
        "Remember subject–verb agreement. In the present simple, 'she' takes the third-person singular form.",
    },
  },

  {
    id: "grammar-medium",
    label: "GRAMMAR",
    type: "mcq",
    active: true,

    title: "Grammar Fix — Intermediate",

    description:
      "Apply conditional grammar to describe an unreal situation in the past.",

    task: "Which sentence correctly describes something that did not happen in the past and its imagined result?",

    options: [
      "If I knew about the meeting, I would have attended it.",
      "If I had known about the meeting, I would have attended it.",
      "If I would have known about the meeting, I had attended it.",
      "If I knew about the meeting, I would attend it yesterday.",
    ],

    correct: 1,

    expectedResponse:
      "If I had known about the meeting, I would have attended it.",

    evaluationCriteria: {
      type: "exact_match",
      concept: "third conditional",
      requiredElements: ["if + past perfect", "would have + past participle"],
    },

    evaluationMode: "rule_based",
    evaluationCategory: "grammar",
    difficulty: "Intermediate",

    feedback: {
      correct:
        "Correct. The third conditional uses past perfect in the condition and 'would have + past participle' for the imagined result.",
      incorrect:
        "This is a third conditional. Look for 'had + past participle' in the if-clause and 'would have + past participle' in the result.",
    },
  },

  {
    id: "grammar-hard",
    label: "GRAMMAR",
    type: "mcq",
    active: true,

    title: "Grammar Precision — Advanced",

    description:
      "Test advanced knowledge of inversion in conditional sentences.",

    task: "Which sentence uses conditional inversion correctly and maintains the intended past meaning?",

    options: [
      "Had I known about the changes, I would have prepared differently.",
      "Had I knew about the changes, I would prepare differently.",
      "If I had knew about the changes, I would have prepared differently.",
      "Had I known about the changes, I would prepare differently yesterday.",
    ],

    correct: 0,

    expectedResponse:
      "Had I known about the changes, I would have prepared differently.",

    evaluationCriteria: {
      type: "exact_match",
      concept: "conditional inversion",
      requiredElements: [
        "Had + subject + past participle",
        "would have + past participle",
      ],
    },

    evaluationMode: "rule_based",
    evaluationCategory: "grammar",
    difficulty: "Advanced",

    feedback: {
      correct:
        "Excellent. 'Had I known...' is an inverted form of 'If I had known...' and is commonly used in formal English.",
      incorrect:
        "Advanced conditional inversion still requires the past participle after 'had' and the correct past conditional result.",
    },
  },

  /* =======================================================
     3. SPEAKING
  ======================================================= */

  {
    id: "speaking-easy",
    label: "SPEAKING",
    type: "text",
    active: true,

    title: "Speak Up — Beginner",

    description:
      "Practise organizing a simple idea before expressing it aloud.",

    task: "Speak aloud for 20–30 seconds about your favourite hobby. Then write 2–3 sentences summarizing what you said.",

    placeholder: "Write 2–3 sentences summarizing what you said aloud...",

    expectedResponse:
      "A short summary mentioning the hobby, why the learner enjoys it, and at least one supporting detail.",

    evaluationCriteria: {
      type: "speaking_reflection",
      minWords: 15,
      maxWords: 60,
      requiredElements: ["favourite hobby", "reason", "supporting detail"],
      checks: ["clarity", "sentence structure", "vocabulary", "organization"],
    },

    evaluationMode: "ai",
    evaluationCategory: "speaking",
    difficulty: "Beginner",

    feedback: {
      correct:
        "Good start. Try to organize your spoken answers with a simple beginning, reason and supporting detail.",
      incorrect:
        "Keep your response focused. Mention the hobby, explain why you enjoy it and add one supporting detail.",
    },
  },

  {
    id: "speaking-medium",
    label: "SPEAKING",
    type: "text",
    active: true,

    title: "Speak Up — Intermediate",

    description:
      "Practise expressing an opinion with a clear structure and supporting reasons.",

    task: "Speak aloud for about 30 seconds on: “A skill I want to improve this year.” Then write a short summary including the skill, why you want to improve it, and how you plan to practise.",

    placeholder: "Summarize your answer in 3–5 sentences...",

    expectedResponse:
      "A structured response identifying one skill, explaining its importance and giving a realistic improvement plan.",

    evaluationCriteria: {
      type: "speaking_reflection",
      minWords: 25,
      maxWords: 90,
      requiredElements: [
        "one specific skill",
        "reason for improvement",
        "practical plan",
      ],
      checks: [
        "organization",
        "clarity",
        "supporting reasoning",
        "grammar",
        "vocabulary",
      ],
    },

    evaluationMode: "ai",
    evaluationCategory: "speaking",
    difficulty: "Intermediate",

    feedback: {
      correct:
        "Well structured. A strong spoken response usually combines a clear idea, a reason and a specific example or action.",
      incorrect:
        "Try adding structure to your response: what skill, why it matters and what you will do to improve it.",
    },
  },

  {
    id: "speaking-hard",
    label: "SPEAKING",
    type: "text",
    active: true,

    title: "Speak Up — Advanced",

    description:
      "Challenge yourself to present a balanced argument and communicate your reasoning clearly.",

    task: "Speak aloud for about 60 seconds on: “Does technology make communication better or worse?” Then write a concise summary of your position, including one argument, one counterpoint and your conclusion.",

    placeholder: "Write your position, counterpoint and conclusion...",

    expectedResponse:
      "A balanced summary presenting a clear position, supporting reasoning, an opposing consideration and a reasoned conclusion.",

    evaluationCriteria: {
      type: "speaking_reflection",
      minWords: 45,
      maxWords: 130,
      requiredElements: [
        "clear position",
        "supporting argument",
        "counterpoint",
        "conclusion",
      ],
      checks: [
        "argument structure",
        "coherence",
        "clarity",
        "vocabulary",
        "grammar",
        "balance",
      ],
    },

    evaluationMode: "ai",
    evaluationCategory: "speaking",
    difficulty: "Advanced",

    feedback: {
      correct:
        "Strong communication involves more than speaking fluently. Presenting a position, considering another view and reaching a clear conclusion shows advanced communication skill.",
      incorrect:
        "For an advanced response, move beyond a simple opinion. Include a reason, acknowledge another perspective and finish with a clear conclusion.",
    },
  },

  /* =======================================================
     4. INTERVIEW
  ======================================================= */

  {
    id: "interview-easy",
    label: "INTERVIEW",
    type: "mcq",
    active: true,

    title: "Interview Ready — Beginner",

    description:
      "Learn the basic structure of an effective interview introduction.",

    task: "An interviewer asks: “Tell me about yourself.” Which response is most appropriate?",

    options: [
      "I don't know what to say.",
      "I am a student and I like many things.",
      "I am a final-year student with skills in web development, and I enjoy building practical projects.",
      "My friends say I am very hardworking.",
    ],

    correct: 2,

    expectedResponse:
      "A concise introduction that connects the candidate's current background, relevant skills and interests.",

    evaluationCriteria: {
      type: "best_response",
      checks: ["relevance", "conciseness", "professional tone", "specificity"],
    },

    evaluationMode: "rule_based",
    evaluationCategory: "interview",
    difficulty: "Beginner",

    feedback: {
      correct:
        "Good choice. A strong introduction briefly connects your background, relevant skills and professional interests.",
      incorrect:
        "Avoid vague personal statements. An interview introduction should focus on your background, relevant skills and professional direction.",
    },
  },

  {
    id: "interview-medium",
    label: "INTERVIEW",
    type: "mcq",
    active: true,

    title: "Interview Ready — Intermediate",

    description:
      "Practise connecting your skills to the value you can bring to an organization.",

    task: "An interviewer asks: “Why should we hire you?” Which response is most effective?",

    options: [
      "Because I really need this job and I am willing to work hard.",
      "I believe I am suitable because I have the required skills and can contribute while continuing to learn.",
      "I can do anything you ask me to do, so I think I will be perfect.",
      "I don't have much experience, but I am sure I will figure everything out.",
    ],

    correct: 1,

    expectedResponse:
      "A confident but realistic answer connecting relevant skills, contribution and willingness to learn.",

    evaluationCriteria: {
      type: "best_response",
      checks: [
        "relevance",
        "evidence of value",
        "confidence",
        "realism",
        "professional tone",
      ],
    },

    evaluationMode: "rule_based",
    evaluationCategory: "interview",
    difficulty: "Intermediate",

    feedback: {
      correct:
        "Good answer. Effective interview responses connect your skills with the value you can contribute while remaining realistic.",
      incorrect:
        "Avoid focusing only on what you need. Explain what relevant skills you bring and how you can contribute.",
    },
  },

  {
    id: "interview-hard",
    label: "INTERVIEW",
    type: "text",
    active: true,

    title: "Interview Ready — Advanced",

    description:
      "Practise answering a behavioural interview question using a structured example.",

    task: "Answer this interview question in 80–120 words: “Tell me about a time you made a mistake or faced a failure. What happened, what did you learn, and what did you change afterward?”",

    placeholder:
      "Describe the situation, what happened, what you learned and what you changed...",

    expectedResponse:
      "A specific situation, the learner's action or responsibility, the outcome, a lesson learned and a concrete change made afterward.",

    evaluationCriteria: {
      type: "behavioral_interview",
      minWords: 80,
      maxWords: 120,
      requiredElements: [
        "specific situation",
        "action or responsibility",
        "outcome",
        "lesson learned",
        "change made afterward",
      ],
      checks: [
        "specificity",
        "ownership",
        "reflection",
        "structure",
        "professional tone",
        "grammar",
      ],
    },

    evaluationMode: "ai",
    evaluationCategory: "interview",
    difficulty: "Advanced",

    feedback: {
      correct:
        "Strong behavioural answer. The most useful part is showing what changed after the experience, not simply describing the mistake.",
      incorrect:
        "Avoid giving a vague answer. Describe one specific situation, your role, what you learned and the concrete change you made afterward.",
    },
  },

  /* =======================================================
     5. PROFESSIONAL ENGLISH
  ======================================================= */

  {
    id: "professional-easy",
    label: "PROFESSIONAL",
    type: "mcq",
    active: true,

    title: "Professional English — Beginner",

    description:
      "Learn to ask for clarification politely in a workplace situation.",

    task: "Which sentence is the most professional way to ask for help?",

    options: [
      "Help me with this.",
      "I don't understand this. Do it for me.",
      "Could you please help me understand this task?",
      "You need to explain this to me.",
    ],

    correct: 2,

    expectedResponse: "Could you please help me understand this task?",

    evaluationCriteria: {
      type: "best_response",
      checks: ["politeness", "clarity", "professional tone"],
    },

    evaluationMode: "rule_based",
    evaluationCategory: "professional",
    difficulty: "Beginner",

    feedback: {
      correct:
        "Correct. Asking politely for clarification creates a more professional and collaborative tone.",
      incorrect:
        "Professional communication should be clear and respectful, especially when asking someone for help.",
    },
  },

  {
    id: "professional-medium",
    label: "PROFESSIONAL",
    type: "mcq",
    active: true,

    title: "Professional English — Intermediate",

    description:
      "Practise writing a clear workplace request with a specific deadline and reason.",

    task: "You need a colleague to send a document before a meeting. Which message is the most professional?",

    options: [
      "Send the document ASAP. I need it.",
      "Can you send me the document whenever you get time?",
      "Could you please share the document by 3 PM? I need it for the upcoming meeting.",
      "I want the document now because the meeting is soon.",
    ],

    correct: 2,

    expectedResponse:
      "A polite request containing a clear deadline and a relevant reason.",

    evaluationCriteria: {
      type: "best_response",
      checks: [
        "specific request",
        "deadline",
        "reason",
        "politeness",
        "professional tone",
      ],
    },

    evaluationMode: "rule_based",
    evaluationCategory: "professional",
    difficulty: "Intermediate",

    feedback: {
      correct:
        "Good workplace communication includes the request, a reasonable deadline and enough context for the other person to act.",
      incorrect:
        "A professional request should clearly state what you need, when you need it and, when useful, why you need it.",
    },
  },

  {
    id: "professional-hard",
    label: "PROFESSIONAL",
    type: "text",
    active: true,

    title: "Professional English — Advanced",

    description:
      "Practise disagreeing constructively while keeping a professional and collaborative tone.",

    task: "Write a 60–100 word response to a colleague whose proposal you disagree with. Explain your concern respectfully, acknowledge one useful part of their idea, and suggest an alternative or modification.",

    placeholder: "Write your professional response here...",

    expectedResponse:
      "A diplomatic workplace response that acknowledges the colleague's perspective, explains a concern and proposes a constructive alternative.",

    evaluationCriteria: {
      type: "professional_writing",
      minWords: 60,
      maxWords: 100,
      requiredElements: [
        "acknowledgement",
        "specific concern",
        "constructive alternative",
      ],
      checks: [
        "diplomacy",
        "clarity",
        "professional tone",
        "constructiveness",
        "grammar",
      ],
    },

    evaluationMode: "ai",
    evaluationCategory: "professional",
    difficulty: "Advanced",

    feedback: {
      correct:
        "Strong professional communication balances confidence with respect. You addressed the concern without making the disagreement personal.",
      incorrect:
        "Try to disagree with the idea rather than the person. Acknowledge the useful part, explain your concern and suggest a constructive alternative.",
    },
  },

  /* =======================================================
     6. PRONUNCIATION
  ======================================================= */

  {
    id: "pronunciation-easy",
    label: "PRONUNCIATION",
    type: "mcq",
    active: true,

    title: "Pronunciation Check — Beginner",

    description: "Identify a familiar sound represented by the letters 'ph'.",

    task: 'Which word begins with the same sound as "phone"?',

    options: ["Photo", "Go", "Know", "Zoo"],

    correct: 0,

    expectedResponse: "Photo",

    evaluationCriteria: {
      type: "pronunciation_sound_match",
      targetSound: "/f/",
      checks: ["initial consonant sound"],
    },

    evaluationMode: "rule_based",
    evaluationCategory: "pronunciation",
    difficulty: "Beginner",

    feedback: {
      correct: "Correct. 'Phone' and 'photo' both begin with the /f/ sound.",
      incorrect:
        "Listen for the first sound rather than the spelling. 'Phone' begins with the /f/ sound.",
    },
  },

  {
    id: "pronunciation-medium",
    label: "PRONUNCIATION",
    type: "mcq",
    active: true,

    title: "Pronunciation Check — Intermediate",

    description:
      "Distinguish between similar vowel sounds in commonly confused words.",

    task: 'Which word rhymes with "bear", not "beer"?',

    options: ["Hear", "Wear", "Clear", "Fear"],

    correct: 1,

    expectedResponse: "Wear",

    evaluationCriteria: {
      type: "rhyme_match",
      targetSound: "/eə/",
      excludedSound: "/ɪə/",
      checks: ["vowel sound", "rhyme"],
    },

    evaluationMode: "rule_based",
    evaluationCategory: "pronunciation",
    difficulty: "Intermediate",

    feedback: {
      correct:
        "Correct. 'Wear' has the same vowel sound as 'bear' in standard English pronunciation.",
      incorrect:
        "Focus on the vowel sound. 'Hear', 'clear' and 'fear' use a different vowel sound from 'bear'.",
    },
  },

  {
    id: "pronunciation-hard",
    label: "PRONUNCIATION",
    type: "mcq",
    active: true,

    title: "Pronunciation Check — Advanced",

    description:
      "Distinguish between a short vowel and nearby long-vowel sounds.",

    task: 'Which word contains the same vowel sound as the "a" in "cat"?',

    options: ["Cake", "Car", "Map", "Call"],

    correct: 2,

    expectedResponse: "Map",

    evaluationCriteria: {
      type: "vowel_sound_match",
      targetSound: "/æ/",
      checks: ["short vowel sound", "vowel contrast"],
    },

    evaluationMode: "rule_based",
    evaluationCategory: "pronunciation",
    difficulty: "Advanced",

    feedback: {
      correct:
        "Correct. 'Map' contains the same short /æ/ vowel sound as 'cat'.",
      incorrect:
        "Focus on the vowel sound in the middle of the word. 'Cat' and 'map' share the short /æ/ sound.",
    },
  },

  /* =======================================================
     7. IDIOMS
  ======================================================= */

  {
    id: "idiom-easy",
    label: "IDIOMS",
    type: "mcq",
    active: true,

    title: "Phrase Finder — Beginner",

    description: "Learn a common everyday English idiom.",

    task: 'What does "break the ice" mean?',

    options: [
      "To break something made of ice.",
      "To make people feel more comfortable in a social situation.",
      "To end a friendship.",
      "To become angry suddenly.",
    ],

    correct: 1,

    expectedResponse:
      "To make people feel more comfortable in a social situation.",

    evaluationCriteria: {
      type: "idiom_meaning",
      idiom: "break the ice",
      checks: ["figurative meaning"],
    },

    evaluationMode: "rule_based",
    evaluationCategory: "idioms",
    difficulty: "Beginner",

    feedback: {
      correct:
        "Correct. 'Break the ice' means to make people feel more comfortable when meeting or interacting.",
      incorrect:
        "This idiom is not about literal ice. It describes making a social situation more relaxed or comfortable.",
    },
  },

  {
    id: "idiom-medium",
    label: "IDIOMS",
    type: "mcq",
    active: true,

    title: "Phrase Finder — Intermediate",

    description:
      "Understand an idiom from its meaning within a workplace context.",

    task: 'Your manager says, “Let\'s not jump the gun before we receive the final approval.” What does "jump the gun" mean?',

    options: [
      "To react quickly when there is an emergency.",
      "To act before the appropriate time or before something is confirmed.",
      "To make a decision after carefully checking all the facts.",
      "To avoid taking responsibility for a decision.",
    ],

    correct: 1,

    expectedResponse:
      "To act before the appropriate time or before something is confirmed.",

    evaluationCriteria: {
      type: "idiom_context",
      idiom: "jump the gun",
      checks: ["figurative meaning", "contextual interpretation"],
    },

    evaluationMode: "rule_based",
    evaluationCategory: "idioms",
    difficulty: "Intermediate",

    feedback: {
      correct:
        "Correct. 'Jump the gun' means to act too early, before the appropriate time or before something is confirmed.",
      incorrect:
        "Look at the context: the manager wants everyone to wait for approval. 'Jump the gun' means acting too early.",
    },
  },

  {
    id: "idiom-hard",
    label: "IDIOMS",
    type: "text",
    active: true,

    title: "Phrase Finder — Advanced",

    description:
      "Move beyond memorizing idioms by using an expression naturally in context.",

    task: 'Use the idiom "read between the lines" in a professional or academic sentence. Your sentence should make its figurative meaning clear without explaining the idiom directly.',

    placeholder:
      "Example: We need to read between the lines of the report before deciding what the client really expects.",

    expectedResponse:
      "A natural sentence using 'read between the lines' to communicate the idea of understanding an implied or unstated meaning.",

    evaluationCriteria: {
      type: "idiom_usage",
      minWords: 10,
      maxWords: 60,
      requiredElements: [
        "exact idiom",
        "figurative meaning",
        "professional or academic context",
      ],
      checks: ["idiom meaning", "grammar", "naturalness", "context"],
    },

    evaluationMode: "ai",
    evaluationCategory: "idioms",
    difficulty: "Advanced",

    feedback: {
      correct:
        "Excellent. You used the idiom in context rather than simply defining it.",
      incorrect:
        "Make sure 'read between the lines' is used figuratively to describe understanding something that is implied rather than directly stated.",
    },
  },

  /* =======================================================
     8. WRITING
  ======================================================= */

  {
    id: "writing-easy",
    label: "WRITING",
    type: "mcq",
    active: true,

    title: "Sentence Upgrade — Beginner",

    description: "Practise basic tense consistency in everyday writing.",

    task: "Which sentence is written correctly?",

    options: [
      "I am going to the market yesterday.",
      "I went to the market yesterday.",
      "I go to the market yesterday.",
      "I had go to the market yesterday.",
    ],

    correct: 1,

    expectedResponse: "I went to the market yesterday.",

    evaluationCriteria: {
      type: "exact_match",
      concept: "past simple",
      checks: ["tense", "grammar"],
    },

    evaluationMode: "rule_based",
    evaluationCategory: "writing",
    difficulty: "Beginner",

    feedback: {
      correct:
        "Correct. 'Yesterday' refers to a completed past action, so the simple past 'went' is appropriate.",
      incorrect:
        "Look at the time marker 'yesterday'. It refers to a completed action in the past.",
    },
  },

  {
    id: "writing-medium",
    label: "WRITING",
    type: "mcq",
    active: true,

    title: "Writing Upgrade — Intermediate",

    description:
      "Choose workplace writing that is clear, complete and appropriately formal.",

    task: "Which sentence would be most appropriate in a formal email?",

    options: [
      "I am writing this mail to tell you that I can't come tomorrow.",
      "I just wanted to say that I will not be able to attend tomorrow's meeting.",
      "I want to inform you that I won't be able to attend tomorrow's meeting due to a prior commitment.",
      "I cannot come tomorrow meeting because I have some work.",
    ],

    correct: 2,

    expectedResponse:
      "I want to inform you that I won't be able to attend tomorrow's meeting due to a prior commitment.",

    evaluationCriteria: {
      type: "best_response",
      checks: [
        "formal tone",
        "clarity",
        "complete information",
        "professional phrasing",
      ],
    },

    evaluationMode: "rule_based",
    evaluationCategory: "writing",
    difficulty: "Intermediate",

    feedback: {
      correct:
        "Good choice. The sentence clearly communicates the situation and gives a professional reason.",
      incorrect:
        "Formal email writing should be clear, complete and professional without sounding unnecessarily casual.",
    },
  },

  {
    id: "writing-hard",
    label: "WRITING",
    type: "text",
    active: true,

    title: "Writing Upgrade — Advanced",

    description:
      "Practise rewriting wordy workplace communication so that it becomes concise without losing meaning.",

    task: "Rewrite this sentence in a clearer and more concise professional style: “Due to the fact that the meeting was postponed, we were unable to complete the discussion which we had planned earlier.”",

    placeholder: "Write your concise professional version here...",

    expectedResponse:
      "A concise rewrite that preserves the original meaning while removing unnecessary wording.",

    evaluationCriteria: {
      type: "rewrite_quality",
      minWords: 8,
      maxWords: 40,
      requiredElements: [
        "meeting was postponed",
        "planned discussion was not completed",
      ],
      preferredElements: [
        "concise structure",
        "active or clear construction",
        "professional tone",
      ],
      checks: [
        "meaning preservation",
        "concision",
        "clarity",
        "grammar",
        "professional style",
      ],
    },

    evaluationMode: "ai",
    evaluationCategory: "writing",
    difficulty: "Advanced",

    feedback: {
      correct:
        "Excellent. Advanced writing is not about using more words; it is about communicating the same meaning with greater precision and efficiency.",
      incorrect:
        "Keep the original meaning, but remove unnecessary phrases and make the sentence more direct.",
    },
  },
];

/* =========================================================
   DATABASE CONNECTION
========================================================= */

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

/* =========================================================
   VALIDATION
========================================================= */

const validateChallengeBank = () => {
  if (CHALLENGES.length !== 24) {
    throw new Error(`Expected 24 challenges but found ${CHALLENGES.length}.`);
  }

  const ids = new Set();

  for (const challenge of CHALLENGES) {
    if (ids.has(challenge.id)) {
      throw new Error(`Duplicate challenge ID: ${challenge.id}`);
    }

    ids.add(challenge.id);

    if (!challenge.evaluationCategory) {
      throw new Error(`Missing evaluation category: ${challenge.id}`);
    }

    if (!challenge.evaluationCriteria) {
      throw new Error(`Missing evaluation criteria: ${challenge.id}`);
    }

    if (!challenge.expectedResponse) {
      throw new Error(`Missing expected response: ${challenge.id}`);
    }

    if (!challenge.feedback?.correct || !challenge.feedback?.incorrect) {
      throw new Error(`Missing feedback configuration: ${challenge.id}`);
    }

    if (challenge.type === "mcq") {
      if (!Array.isArray(challenge.options) || challenge.options.length < 2) {
        throw new Error(`Invalid MCQ options: ${challenge.id}`);
      }

      if (
        !Number.isInteger(challenge.correct) ||
        challenge.correct < 0 ||
        challenge.correct >= challenge.options.length
      ) {
        throw new Error(`Invalid correct answer index: ${challenge.id}`);
      }
    }

    if (challenge.type === "text") {
      if (challenge.correct !== undefined) {
        throw new Error(
          `Text challenge should not define correct index: ${challenge.id}`,
        );
      }
    }
  }

  const categoryCount = {};

  for (const challenge of CHALLENGES) {
    categoryCount[challenge.evaluationCategory] =
      (categoryCount[challenge.evaluationCategory] || 0) + 1;
  }

  const expectedCategories = [
    "vocabulary",
    "grammar",
    "speaking",
    "interview",
    "professional",
    "pronunciation",
    "idioms",
    "writing",
  ];

  for (const category of expectedCategories) {
    if (categoryCount[category] !== 3) {
      throw new Error(
        `Category "${category}" should contain exactly 3 challenges but contains ${
          categoryCount[category] || 0
        }.`,
      );
    }
  }

  console.log("✓ Challenge bank validation passed.");
};

/* =========================================================
   SEED CHALLENGES
========================================================= */

const seedChallenges = async () => {
  try {
    console.log("\n========================================");
    console.log("Seeding Jashna Weekly Challenge Bank");
    console.log("========================================\n");

    validateChallengeBank();

    for (const challenge of CHALLENGES) {
      const result = await Challenge.findOneAndUpdate(
        { id: challenge.id },
        challenge,
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      );

      console.log(
        `✓ ${result.label.padEnd(16)} | ${result.difficulty.padEnd(
          12,
        )} | ${result.title}`,
      );
    }

    console.log(`\n✓ ${CHALLENGES.length} challenges seeded successfully.`);

    /* =====================================================
       CREATE INITIAL SETTINGS
    ===================================================== */

    let settings = await ChallengeSettings.findOne();

    if (!settings) {
      const firstChallenge = await Challenge.findOne({
        id: "vocabulary-easy",
        active: true,
      });

      if (!firstChallenge) {
        throw new Error("Initial challenge could not be found.");
      }

      settings = await ChallengeSettings.create({
        selectionMode: "weekly",
        activeChallengeId: firstChallenge._id,
        weekKey: "",
      });

      console.log(`✓ Initial challenge selected: ${firstChallenge.title}`);
    } else {
      console.log("✓ Existing challenge settings preserved.");
    }

    /* =====================================================
       SUMMARY
    ===================================================== */

    const categoryCount = {};

    const difficultyCount = {};

    for (const challenge of CHALLENGES) {
      categoryCount[challenge.label] =
        (categoryCount[challenge.label] || 0) + 1;

      difficultyCount[challenge.difficulty] =
        (difficultyCount[challenge.difficulty] || 0) + 1;
    }

    console.log("\n========================================");
    console.log("Challenge Bank Summary");
    console.log("========================================\n");

    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`✓ ${category}: ${count} questions`);
    });

    console.log("\nDifficulty Distribution:");

    Object.entries(difficultyCount).forEach(([difficulty, count]) => {
      console.log(`✓ ${difficulty}: ${count}`);
    });

    console.log(`\nTotal: ${CHALLENGES.length} questions`);

    console.log("\n✓ 8 categories × 3 difficulty levels");

    console.log("✓ Evaluation metadata included");

    console.log("✓ Feedback metadata included");

    console.log("✓ Challenge bank validation enabled");

    console.log("\nChallenge seed completed successfully.\n");
  } catch (error) {
    console.error("\nChallenge seed failed:");
    console.error(error);

    process.exit(1);
  } finally {
    await mongoose.connection.close();

    console.log("MongoDB connection closed.");
  }
};

/* =========================================================
   START
========================================================= */

connectDB().then(seedChallenges);
