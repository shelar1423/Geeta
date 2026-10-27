import "server-only";
import { buildPlaylist } from "./playlist";
import type { Lang, VoiceRole } from "./types";

/** A characteristic line for each role, used to audition voices. */
const SAMPLES: Record<VoiceRole, [chapter: number, verse: number, segment: number]> = {
  krishna: [2, 47, 0],
  arjuna: [1, 32, 0],
  sanjaya: [1, 12, 0],
  dhritarashtra: [1, 1, 0],
  duryodhana: [1, 3, 0],
  guide: [2, 47, -1],
  reciter: [2, 47, -2],
};

export function auditionLine(lang: Lang, role: VoiceRole): string {
  const [chapter, verse, segment] = SAMPLES[role];
  const item = buildPlaylist(lang, chapter).verses.find((v) => v.verse === verse)!;
  if (segment === -1) return item.note ?? item.segments[0].text;
  if (segment === -2) return item.sanskrit.join("\n");
  return item.segments[segment].text;
}
