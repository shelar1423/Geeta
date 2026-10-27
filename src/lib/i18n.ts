import type { Lang } from "./types";

export const LANGUAGE_NAMES: Record<Lang, string> = { hi: "हिन्दी", en: "English", mr: "मराठी" };

const STRINGS = {
  appName: { en: "Gita Vani", hi: "गीता वाणी", mr: "गीता वाणी" },
  tagline: {
    en: "The Bhagavad Gita, performed. Every character in their own voice.",
    hi: "श्रीमद्भगवद्गीता, जीवंत संवाद में। हर पात्र की अपनी आवाज़।",
    mr: "श्रीमद्भगवद्गीता, जिवंत संवादात. प्रत्येक पात्राचा स्वतःचा आवाज.",
  },
  chapters: { en: "Chapters", hi: "अध्याय", mr: "अध्याय" },
  chapter: { en: "Chapter", hi: "अध्याय", mr: "अध्याय" },
  verses: { en: "verses", hi: "श्लोक", mr: "श्लोक" },
  cast: { en: "The voices", hi: "आवाज़ें", mr: "आवाज" },
  meetCast: { en: "Meet the voices", hi: "आवाज़ों से मिलिए", mr: "आवाजांची ओळख" },
  listen: { en: "Listen", hi: "सुनें", mr: "ऐका" },
  sanskritOnly: { en: "Sanskrit only for now", hi: "अभी केवल संस्कृत", mr: "सध्या फक्त संस्कृत" },
  play: { en: "Play", hi: "चलाएँ", mr: "चालू करा" },
  pause: { en: "Pause", hi: "रोकें", mr: "थांबवा" },
  previous: { en: "Previous verse", hi: "पिछला श्लोक", mr: "मागील श्लोक" },
  next: { en: "Next verse", hi: "अगला श्लोक", mr: "पुढील श्लोक" },
  speed: { en: "Speed", hi: "गति", mr: "गती" },
  repeat: { en: "Repeat verse", hi: "श्लोक दोहराएँ", mr: "श्लोक पुन्हा" },
  layerSanskrit: { en: "Sanskrit", hi: "संस्कृत", mr: "संस्कृत" },
  layerTranslation: { en: "Dialogue", hi: "संवाद", mr: "संवाद" },
  layerNote: { en: "Explanation", hi: "भावार्थ", mr: "भावार्थ" },
  introduction: { en: "Introduction", hi: "परिचय", mr: "परिचय" },
  playFromHere: { en: "Play from this verse", hi: "यहाँ से सुनें", mr: "इथून ऐका" },
  audioUnavailable: {
    en: "Audio isn't available yet. Add a Sarvam API key to generate it.",
    hi: "ऑडियो अभी उपलब्ध नहीं है। इसे बनाने के लिए Sarvam API key जोड़ें।",
    mr: "ऑडिओ अजून उपलब्ध नाही. तो तयार करण्यासाठी Sarvam API key जोडा.",
  },
  audioError: {
    en: "Couldn't play this part. Skipping ahead.",
    hi: "यह हिस्सा नहीं चल सका। आगे बढ़ रहे हैं।",
    mr: "हा भाग चालू होऊ शकला नाही. पुढे जात आहोत.",
  },
  notTranslated: {
    en: "The voiced translation of this chapter is coming soon. You can listen to the Sanskrit now.",
    hi: "इस अध्याय का संवाद जल्द आ रहा है। अभी आप संस्कृत श्लोक सुन सकते हैं।",
    mr: "या अध्यायाचा संवाद लवकरच येत आहे. सध्या तुम्ही संस्कृत श्लोक ऐकू शकता.",
  },
  experimentalSanskrit: {
    en: "Sanskrit recitation is experimental: Sarvam's voices are trained on modern Indian languages, not Sanskrit chanting.",
    hi: "संस्कृत पाठ प्रयोगात्मक है: Sarvam की आवाज़ें आधुनिक भारतीय भाषाओं पर प्रशिक्षित हैं, संस्कृत पाठ पर नहीं।",
    mr: "संस्कृत पठण प्रायोगिक आहे: Sarvam चे आवाज आधुनिक भारतीय भाषांवर प्रशिक्षित आहेत, संस्कृत पठणावर नाहीत.",
  },
  audition: { en: "Audition", hi: "सुनकर चुनें", mr: "ऐकून निवडा" },
  auditionHelp: {
    en: "Hear each character's line in different Sarvam voices. The first one is the current choice.",
    hi: "हर पात्र की पंक्ति अलग-अलग Sarvam आवाज़ों में सुनें। पहली आवाज़ अभी चुनी हुई है।",
    mr: "प्रत्येक पात्राची ओळ वेगवेगळ्या Sarvam आवाजांत ऐका. पहिला आवाज सध्या निवडलेला आहे.",
  },
  current: { en: "current", hi: "चुनी हुई", mr: "निवडलेला" },
  free: {
    en: "Free. No ads, no sign-up.",
    hi: "निःशुल्क। न विज्ञापन, न साइन-अप।",
    mr: "मोफत. ना जाहिराती, ना साइन-अप.",
  },
  chooseLanguage: { en: "Choose your language", hi: "अपनी भाषा चुनें", mr: "तुमची भाषा निवडा" },
  home: { en: "Home", hi: "मुखपृष्ठ", mr: "मुखपृष्ठ" },
  voicedBy: { en: "Voices by Sarvam AI", hi: "आवाज़ें: Sarvam AI", mr: "आवाज: Sarvam AI" },
} satisfies Record<string, Record<Lang, string>>;

export type StringKey = keyof typeof STRINGS;

export function t(lang: Lang, key: StringKey): string {
  return STRINGS[key][lang];
}

/** All strings for one language, for handing to client components. */
export function stringsFor(lang: Lang): Record<StringKey, string> {
  return Object.fromEntries(Object.entries(STRINGS).map(([k, v]) => [k, v[lang]])) as Record<StringKey, string>;
}

const DEVANAGARI_DIGITS = "०१२३४५६७८९";
export function num(lang: Lang, n: number | string): string {
  const s = String(n);
  return lang === "en" ? s : s.replace(/\d/g, (d) => DEVANAGARI_DIGITS[Number(d)]);
}
