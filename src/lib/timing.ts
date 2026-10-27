import type { Layer, Mood, VoiceRole } from "./types";

export interface TimedClip {
  layer: Layer;
  role: VoiceRole;
  mood?: Mood;
}

/** Heavier moods leave the words hanging a little longer. */
const MOOD_LINGER: Partial<Record<Mood, number>> = { grave: 300, anguish: 450, awe: 500, tender: 300, urgent: -150 };

/**
 * Silence, in ms at 1× speed, between two consecutive clips. Like a radio
 * play: quick turns within a verse, a beat between verses, a breath when the
 * speaker changes, and room to settle after the Sanskrit or an explanation.
 */
export function gapBetween(prev: TimedClip, next: TimedClip, sameVerse: boolean): number {
  let gap: number;
  if (prev.layer === "note" && !sameVerse) gap = 1100; // after the guide, before the next verse
  else if (prev.layer === "sanskrit") gap = 800; // let the shloka settle before its meaning
  else if (next.layer === "note") gap = 700; // stepping out of the scene to explain
  else if (sameVerse) gap = prev.role === next.role ? 250 : 450; // a turn within a verse
  else gap = prev.role === next.role ? 450 : 900; // next verse: a beat, or a change of speaker
  return Math.max(150, gap + (MOOD_LINGER[prev.mood ?? "calm"] ?? 0));
}
