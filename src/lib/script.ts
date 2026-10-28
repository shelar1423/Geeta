/**
 * Translations are written as performance scripts. Measured on Bulbul v4
 * Flash: a comma pauses ~0.4 s, a sentence end anywhere from 0 to ~0.55 s,
 * and a line break a steady ~0.55 s, the longest pause available within
 * one clip. "…" alone is unreliable (0.26 s in English, shorter than a
 * comma), but "…" plus a line break gives a steady ~0.5 s.
 *
 * So `|` marks a breath and is spoken as a line break (hidden on screen),
 * and every "…" is followed by one. Longer beats come from the silences
 * between clips (see timing.ts).
 */
const BREATH = /\s*\|\s*/g;
const HESITATION = /…(?!\s*(?:\||\n|$))\s*/g;

export function toSpeech(text: string): string {
  return text.replace(HESITATION, "…\n").replace(BREATH, "\n");
}

export function toDisplay(text: string): string {
  return text.replace(BREATH, " ");
}
