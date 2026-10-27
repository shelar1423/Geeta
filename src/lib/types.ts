export const LANGUAGES = ["hi", "en", "mr"] as const;
export type Lang = (typeof LANGUAGES)[number];

/** Speakers voiced in the dialogue. Duryodhana is quoted by Sanjaya in chapter 1. */
export type CharacterId = "krishna" | "arjuna" | "sanjaya" | "dhritarashtra" | "duryodhana";
/** Everyone who can be heard: the characters, the commentary guide and the Sanskrit reciter. */
export type VoiceRole = CharacterId | "guide" | "reciter";

/**
 * Delivery direction for a line. Each mood nudges pace and pitch, and a cast
 * entry may swap to a different style of the same voice for it.
 */
export type Mood = "calm" | "grave" | "anguish" | "awe" | "urgent" | "tender" | "triumphant";

export type Layer = "sanskrit" | "translation" | "note";

export interface Verse {
  chapter: number;
  verse: number;
  speaker: CharacterId;
  sanskrit: string[];
  transliteration: string[];
}

export interface Segment {
  speaker: CharacterId;
  text: string;
  mood?: Mood;
}

export interface Chapter {
  number: number;
  sanskritName: string;
  iast: string;
  title: Record<Lang, string>;
  verseCount: number;
}

/** One playable piece of audio. */
export interface Clip {
  id: string;
  layer: Layer;
  role: VoiceRole;
  text: string;
  mood?: Mood;
  src: string;
}
