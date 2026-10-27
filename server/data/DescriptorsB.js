const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const DESCRIPTORS = {
  communication: {
    A1: [
      "Expresses basic personal information through familiar words and simple expressions.",
      "Responds to straightforward questions about everyday needs and experiences.",
    ],

    A2: [
      "Shares simple ideas and information in familiar situations with growing independence.",
      "Handles short exchanges on routine topics with generally understandable expression.",
    ],

    B1: [
      "Expresses personal experiences, opinions and ideas with a clear overall message.",
      "Keeps the message on track when discussing familiar subjects, even when occasional hesitation occurs.",
    ],

    B2: [
      "Presents ideas clearly and develops points with relevant explanations and examples.",
      "Adapts expression effectively when moving between social, academic and professional settings.",
    ],

    C1: [
      "Expresses complex thoughts with precision, flexibility and a strong sense of audience.",
      "Handles demanding situations with ease while maintaining clarity and persuasive expression.",
    ],

    C2: [
      "Conveys sophisticated ideas with exceptional precision, subtlety and natural control.",
      "Navigates highly nuanced situations effortlessly, tailoring expression to purpose, context and audience.",
    ],
  },

  vocabulary: {
    A1: [
      "Draws on a small range of familiar words connected with everyday life.",
      "Recognises and produces common expressions related to personal needs and surroundings.",
    ],

    A2: [
      "Draws from an expanding range of vocabulary for routine situations and familiar subjects.",
      "Combines familiar expressions to add basic detail to ideas and experiences.",
    ],

    B1: [
      "Shows a practical vocabulary range suited to everyday, social and familiar professional situations.",
      "Finds alternative ways to express an idea when the exact word does not immediately come to mind.",
    ],

    B2: [
      "Demonstrates a broad lexical range with increasingly precise word choices.",
      "Varies expressions naturally to add detail, emphasis and clarity without sounding repetitive.",
    ],

    C1: [
      "Displays an extensive and nuanced vocabulary with highly accurate word selection.",
      "Distinguishes subtle shades of meaning and chooses sophisticated expressions according to context.",
    ],

    C2: [
      "Commands an exceptionally rich lexical repertoire with remarkable precision.",
      "Handles idiomatic language, subtle distinctions and sophisticated phrasing with effortless accuracy.",
    ],
  },

  grammar: {
    A1: [
      "Forms basic sentences using familiar grammatical patterns.",
      "Produces simple statements about people, objects, routines and immediate experiences.",
    ],

    A2: [
      "Builds connected sentences using a growing range of everyday grammatical structures.",
      "Shows developing control of tense, agreement and sentence formation, despite occasional errors.",
    ],

    B1: [
      "Maintains reasonable grammatical control while expressing connected thoughts and experiences.",
      "Combines familiar structures effectively, with errors rarely preventing the intended meaning.",
    ],

    B2: [
      "Handles a wider variety of grammatical structures with consistent control.",
      "Builds well-formed and increasingly sophisticated sentences to express relationships between ideas.",
    ],

    C1: [
      "Demonstrates strong command of complex grammatical structures with only minor slips.",
      "Manipulates sentence structure flexibly to create emphasis, contrast, precision and coherence.",
    ],

    C2: [
      "Displays exceptional grammatical mastery across highly complex forms and structures.",
      "Shapes language with remarkable flexibility, using subtle grammatical choices to convey exact meaning.",
    ],
  },

  fluency: {
    A1: [
      "Produces short phrases and simple statements with noticeable pauses.",
      "Relies on familiar expressions when building basic spoken responses.",
    ],

    A2: [
      "Maintains short stretches of speech on familiar subjects with increasing continuity.",
      "Recovers from hesitation and continues expressing the main idea with occasional support.",
    ],

    B1: [
      "Maintains a steady flow while discussing familiar experiences and opinions.",
      "Recovers naturally from pauses, reformulation or moments of hesitation without losing the main thread.",
    ],

    B2: [
      "Sustains extended speech at a generally even pace with limited hesitation.",
      "Moves between ideas smoothly while developing explanations, examples and viewpoints.",
    ],

    C1: [
      "Maintains an effortless flow while developing detailed and complex ideas.",
      "Speaks spontaneously with minimal searching for expressions and uses pauses deliberately for emphasis.",
    ],

    C2: [
      "Demonstrates exceptional verbal fluidity with an almost effortless delivery.",
      "Moves seamlessly through complex ideas, subtle arguments and unexpected turns without disrupting the flow.",
    ],
  },

  pronunciation: {
    A1: [
      "Produces familiar words and short expressions with generally recognisable pronunciation.",
      "Basic sounds and word stress are developing through repeated practice.",
    ],

    A2: [
      "Maintains generally understandable pronunciation across familiar situations.",
      "Shows growing control of word stress and basic intonation, although occasional clarification may be needed.",
    ],

    B1: [
      "Maintains clear pronunciation that supports comfortable understanding.",
      "Uses stress and intonation with reasonable control, even when traces of first-language influence remain.",
    ],

    B2: [
      "Delivers speech with clear pronunciation and increasingly natural rhythm.",
      "Uses stress, rhythm and intonation purposefully to highlight important information.",
    ],

    C1: [
      "Demonstrates refined pronunciation with strong control of rhythm, stress and intonation.",
      "Adjusts vocal emphasis skilfully to convey attitude, intention and subtle differences in meaning.",
    ],

    C2: [
      "Maintains exceptionally clear and natural pronunciation across demanding speaking situations.",
      "Uses rhythm, emphasis, intonation and subtle phonological features with remarkable precision.",
    ],
  },

  confidence: {
    A1: [
      "Shows willingness to attempt simple spoken tasks despite initial hesitation.",
      "Responds positively to familiar prompts and gradually becomes more comfortable expressing basic ideas.",
    ],

    A2: [
      "Approaches familiar speaking situations with growing self-assurance.",
      "Takes small risks with language and remains engaged even when searching for the right expression.",
    ],

    B1: [
      "Expresses opinions and personal experiences with noticeable confidence in familiar settings.",
      "Recovers from mistakes without losing momentum and shows a willingness to step outside the comfort zone.",
    ],

    B2: [
      "Approaches extended speaking tasks with composure and self-assurance.",
      "Handles unexpected questions positively and keeps their confidence intact when faced with challenging topics.",
    ],

    C1: [
      "Projects a poised and assured presence across demanding academic and professional situations.",
      "Responds to pressure with composure while maintaining clarity, control and purposeful expression.",
    ],

    C2: [
      "Displays exceptional self-assurance even in highly demanding or unfamiliar situations.",
      "Remains poised under pressure and handles challenging exchanges with remarkable calm and authority.",
    ],
  },

  interaction: {
    A1: [
      "Responds to simple questions and basic prompts related to familiar information.",
      "Takes initial steps in short exchanges when the topic and language are familiar.",
    ],

    A2: [
      "Takes part in brief exchanges involving familiar people, places, routines and experiences.",
      "Asks and responds to straightforward questions while keeping the exchange moving.",
    ],

    B1: [
      "Maintains an exchange by responding appropriately, asking follow-up questions and seeking clarification.",
      "Builds on another person's ideas while expressing a personal viewpoint.",
    ],

    B2: [
      "Manages extended exchanges with appropriate turn-taking and responsive listening.",
      "Develops discussion points, responds constructively to differing opinions and keeps the interaction productive.",
    ],

    C1: [
      "Handles complex interactions with flexibility, tact and strong awareness of context.",
      "Responds naturally to shifts in direction while balancing personal viewpoints with those of others.",
    ],

    C2: [
      "Navigates sophisticated interactions with exceptional sensitivity and adaptability.",
      "Reads subtle cues, manages turn-taking effortlessly and responds appropriately to implied meaning.",
    ],
  },
};

export { CEFR_LEVELS, DESCRIPTORS };

export default DESCRIPTORS;
