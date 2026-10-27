/**
 * Translations are written as performance scripts. Besides ordinary
 * punctuation (Bulbul pauses briefly at commas, longer at sentence ends,
 * hesitates at "…" and emphasises at "!"), a `|` marks a breath: a longer,
 * paragraph-length pause. Bulbul pauses at line breaks, so `|` becomes one
 * when spoken and disappears when displayed.
 */
const BREATH = /\s*\|\s*/g;

export function toSpeech(text: string): string {
  return text.replace(BREATH, "\n");
}

export function toDisplay(text: string): string {
  return text.replace(BREATH, " ");
}
