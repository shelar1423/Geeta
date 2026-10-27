import type { CharacterId, Lang, Mood, VoiceRole } from "./types";

export interface Character {
  id: VoiceRole;
  name: Record<Lang, string>;
  role: Record<Lang, string>;
  /** CSS colour used for the speaker's accent throughout the UI. */
  color: string;
}

export const CHARACTERS: Record<VoiceRole, Character> = {
  krishna: {
    id: "krishna",
    name: { en: "Krishna", hi: "श्रीकृष्ण", mr: "श्रीकृष्ण" },
    role: { en: "The teacher", hi: "गुरु", mr: "गुरु" },
    color: "#4f6bd8",
  },
  arjuna: {
    id: "arjuna",
    name: { en: "Arjuna", hi: "अर्जुन", mr: "अर्जुन" },
    role: { en: "The seeker", hi: "जिज्ञासु", mr: "जिज्ञासू" },
    color: "#d9534f",
  },
  sanjaya: {
    id: "sanjaya",
    name: { en: "Sanjaya", hi: "संजय", mr: "संजय" },
    role: { en: "The narrator", hi: "सूत्रधार", mr: "सूत्रधार" },
    color: "#1f9d8a",
  },
  dhritarashtra: {
    id: "dhritarashtra",
    name: { en: "Dhritarashtra", hi: "धृतराष्ट्र", mr: "धृतराष्ट्र" },
    role: { en: "The blind king", hi: "अंध राजा", mr: "अंध राजा" },
    color: "#7a7f8c",
  },
  duryodhana: {
    id: "duryodhana",
    name: { en: "Duryodhana", hi: "दुर्योधन", mr: "दुर्योधन" },
    role: { en: "The Kaurava prince", hi: "कौरव राजकुमार", mr: "कौरव राजपुत्र" },
    color: "#b5651d",
  },
  guide: {
    id: "guide",
    name: { en: "Guide", hi: "मार्गदर्शक", mr: "मार्गदर्शक" },
    role: { en: "Explains the verse", hi: "श्लोक का भाव", mr: "श्लोकाचा भावार्थ" },
    color: "#c58b16",
  },
  reciter: {
    id: "reciter",
    name: { en: "Reciter", hi: "पाठक", mr: "पाठक" },
    role: { en: "Sanskrit verse", hi: "संस्कृत श्लोक", mr: "संस्कृत श्लोक" },
    color: "#9c5bd1",
  },
};

export interface Voice {
  model: "bulbul:v4-flash" | "bulbul:v3";
  speaker: string;
  /** 0.5–2.0 */
  pace: number;
  /** -0.5–0.5, bulbul:v4-flash only */
  pitch?: number;
  /** Same voice, different delivery style, for particular moods. */
  moodSpeakers?: Partial<Record<Mood, string>>;
}

/**
 * Who voices whom, per language. Bulbul personas are per-language, so each
 * character is cast separately in each language to keep the same feel:
 * Krishna calm and deep, Arjuna young and expressive, Sanjaya a storyteller,
 * Dhritarashtra old and anxious. Audition alternatives on /[lang]/cast.
 */
export const CAST: Record<Lang, Record<VoiceRole, Voice>> = {
  hi: {
    krishna: { model: "bulbul:v4-flash", speaker: "girish_hi_devotional", pace: 0.92, pitch: -0.05 },
    arjuna: {
      model: "bulbul:v4-flash",
      speaker: "shubh_hi_stories_dramatic",
      pace: 1,
      moodSpeakers: { calm: "shubh_hi_devotional", awe: "shubh_hi_devotional", tender: "shubh_hi_devotional" },
    },
    sanjaya: {
      model: "bulbul:v4-flash",
      speaker: "ratan_hi_documentary",
      pace: 1,
      moodSpeakers: { awe: "ratan_hi_devotional", tender: "ratan_hi_latenight_warm" },
    },
    dhritarashtra: { model: "bulbul:v4-flash", speaker: "ashok_hi_character", pace: 0.9, pitch: -0.15 },
    duryodhana: {
      model: "bulbul:v4-flash",
      speaker: "mukul_hi_suspense",
      pace: 1.02,
      // His boasting about his army gets the brighter, showier style.
      moodSpeakers: { triumphant: "mukul_hi_ads" },
    },
    guide: { model: "bulbul:v4-flash", speaker: "roopa_hi_narration", pace: 0.97 },
    reciter: { model: "bulbul:v4-flash", speaker: "nachiket_hi_devotional", pace: 0.8 },
  },
  en: {
    krishna: { model: "bulbul:v4-flash", speaker: "girish_en_devotional", pace: 0.92, pitch: -0.05 },
    arjuna: {
      model: "bulbul:v4-flash",
      speaker: "shubh_en_audiobook",
      pace: 1,
      moodSpeakers: { calm: "shubh_en_narration_gentle", tender: "shubh_en_narration_gentle" },
    },
    sanjaya: { model: "bulbul:v4-flash", speaker: "sarang_en_narration", pace: 1 },
    dhritarashtra: { model: "bulbul:v4-flash", speaker: "varun_en_suspense", pace: 0.9, pitch: -0.1 },
    duryodhana: { model: "bulbul:v4-flash", speaker: "rustom_en_suspense", pace: 1.02 },
    guide: { model: "bulbul:v4-flash", speaker: "simran_en_narration", pace: 0.97 },
    reciter: { model: "bulbul:v4-flash", speaker: "nachiket_hi_devotional", pace: 0.8 },
  },
  mr: {
    krishna: { model: "bulbul:v4-flash", speaker: "soham_mr_narration", pace: 0.92, pitch: -0.1 },
    arjuna: { model: "bulbul:v4-flash", speaker: "mukul_mr_stories", pace: 1 },
    sanjaya: { model: "bulbul:v4-flash", speaker: "nilesh_mr_conversation", pace: 1 },
    // Marathi v4 personas have only three male voices, so the Kaurava side
    // borrows v3 voices; "varun" is deep and dramatic.
    dhritarashtra: { model: "bulbul:v3", speaker: "varun", pace: 0.9 },
    duryodhana: { model: "bulbul:v3", speaker: "kabir", pace: 1.02 },
    guide: { model: "bulbul:v4-flash", speaker: "rupali_mr_stories", pace: 0.97 },
    reciter: { model: "bulbul:v4-flash", speaker: "nachiket_hi_devotional", pace: 0.8 },
  },
};

/** Alternatives worth auditioning for each role (v4 Flash persona IDs). */
export const AUDITION: Record<Lang, Partial<Record<VoiceRole, string[]>>> = {
  hi: {
    krishna: ["girish_hi_devotional", "shubh_hi_devotional", "mani_hi_devotional", "anand_hi_documentary"],
    arjuna: ["shubh_hi_stories_dramatic", "advait_hi_character", "aditya_hi_conversational"],
    sanjaya: ["ratan_hi_documentary", "mahesh_hi_documentary", "anand_hi_documentary"],
    dhritarashtra: ["ashok_hi_character", "mukul_hi_suspense"],
    duryodhana: ["mukul_hi_suspense", "advait_hi_character", "ashok_hi_character"],
    guide: ["roopa_hi_narration", "simran_hi_narration", "ishita_hi_devotional"],
  },
  en: {
    krishna: ["girish_en_devotional", "shubh_en_narration_gentle", "sarang_en_narration"],
    arjuna: ["shubh_en_audiobook", "dev_en_conversational", "rohan_en_recovery"],
    sanjaya: ["sarang_en_narration", "girish_en_documentary", "shubh_en_narration"],
    dhritarashtra: ["varun_en_suspense", "rustom_en_suspense"],
    duryodhana: ["rustom_en_suspense", "varun_en_ads"],
    guide: ["simran_en_narration", "aditi_en_stories", "chandrika_en_stories"],
  },
  mr: {
    krishna: ["soham_mr_narration", "nilesh_mr_conversation", "mukul_mr_stories"],
    arjuna: ["mukul_mr_stories", "nilesh_mr_conversation"],
    sanjaya: ["nilesh_mr_conversation", "soham_mr_narration"],
    guide: ["rupali_mr_stories", "mrunal_mr_narration", "neha_mr_narration"],
  },
};

/**
 * How each mood shifts delivery. Pace and pitch are relative to the cast
 * voice; loudness (v4 Flash) and temperature (expressiveness) are absolute.
 * Kept small: large shifts make a voice stop sounding like itself.
 */
const MOOD_DELIVERY: Record<Mood, { pace: number; pitch: number; loudness: number; temperature: number }> = {
  calm: { pace: 0, pitch: 0, loudness: 1, temperature: 0.6 },
  grave: { pace: -0.07, pitch: -0.06, loudness: 0.95, temperature: 0.6 },
  anguish: { pace: -0.1, pitch: 0.03, loudness: 0.9, temperature: 0.8 },
  awe: { pace: -0.08, pitch: 0.02, loudness: 0.95, temperature: 0.7 },
  urgent: { pace: 0.08, pitch: 0.05, loudness: 1.12, temperature: 0.75 },
  tender: { pace: -0.07, pitch: -0.02, loudness: 0.85, temperature: 0.7 },
  triumphant: { pace: 0.05, pitch: 0.06, loudness: 1.18, temperature: 0.8 },
};

export const LANGUAGE_CODES: Record<Lang, string> = { hi: "hi-IN", en: "en-IN", mr: "mr-IN" };

export interface VoiceRequest {
  model: Voice["model"];
  speaker: string;
  language_code: string;
  pace: number;
  pitch?: number;
  loudness?: number;
  temperature?: number;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(n * 100) / 100));

/** The exact Sarvam parameters for a role speaking in a mood. */
export function voiceFor(lang: Lang, role: VoiceRole, mood: Mood = "calm"): VoiceRequest {
  const voice = CAST[lang][role];
  const delivery = MOOD_DELIVERY[mood];
  const request: VoiceRequest = {
    model: voice.model,
    speaker: voice.moodSpeakers?.[mood] ?? voice.speaker,
    // The reciter always reads Devanagari Sanskrit, closest to Hindi.
    language_code: role === "reciter" ? "hi-IN" : LANGUAGE_CODES[lang],
    pace: clamp(voice.pace + delivery.pace, 0.5, 2),
    temperature: delivery.temperature,
  };
  // Pitch and loudness are only accepted by v4 Flash.
  if (voice.model === "bulbul:v4-flash") {
    request.pitch = clamp((voice.pitch ?? 0) + delivery.pitch, -0.5, 0.5);
    request.loudness = clamp(delivery.loudness, 0.1, 2.5);
  }
  return request;
}

export function isCharacter(role: VoiceRole): role is CharacterId {
  return role !== "guide" && role !== "reciter";
}
