import "server-only";
import { buildPlaylist } from "./playlist";
import type { Clip, Lang, VoiceRole } from "./types";

/** A characteristic line for each role, used to audition voices. */
const SAMPLES: Record<VoiceRole, [chapter: number, verse: number, part: number | "note" | "sanskrit"]> = {
  krishna: [2, 47, 0],
  arjuna: [1, 29, 0],
  sanjaya: [1, 12, 0],
  dhritarashtra: [1, 1, 0],
  duryodhana: [1, 3, 0],
  guide: [2, 47, "note"],
  reciter: [2, 47, "sanskrit"],
};

/** The clip (speech text and mood) a role auditions with. */
export function auditionClip(lang: Lang, role: VoiceRole): Clip {
  const [chapter, verse, part] = SAMPLES[role];
  const { clips } = buildPlaylist(lang, chapter).verses.find((v) => v.verse === verse)!;
  if (part === "note") return clips.note!;
  if (part === "sanskrit") return clips.sanskrit;
  return clips.translation[part];
}
