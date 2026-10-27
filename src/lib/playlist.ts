import "server-only";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { voiceFor } from "./casting";
import { getDirection, getTranslation, normalizeCue, versesOf } from "./content";
import { toDisplay, toSpeech } from "./script";
import type { CharacterId, Clip, Lang, Layer, Mood, Segment, VoiceRole } from "./types";

export interface VerseItem {
  verse: number;
  speaker: CharacterId;
  sanskrit: string[];
  transliteration: string[];
  segments: Segment[];
  note?: string;
  clips: { sanskrit: Clip; translation: Clip[]; note?: Clip };
}

export interface ChapterPlaylist {
  lang: Lang;
  chapter: number;
  translated: boolean;
  intro?: { text: string; clip: Clip };
  verses: VerseItem[];
}

export const AUDIO_DIR = path.join(process.cwd(), "public", "audio");

/** Content hash of everything that affects the audio, so changed text or casting gets new audio. */
export function clipId(lang: Lang, role: VoiceRole, text: string, mood?: Mood): string {
  const voice = voiceFor(lang, role, mood);
  return createHash("sha256").update(JSON.stringify({ voice, text })).digest("hex").slice(0, 20);
}

function makeClip(
  lang: Lang,
  chapter: number,
  key: string,
  layer: Layer,
  role: VoiceRole,
  text: string,
  mood?: Mood,
): Clip {
  text = toSpeech(text);
  const id = clipId(lang, role, text, mood);
  // Pre-generated audio is served statically; anything else is synthesised
  // on first request and cached by the CDN (the id pins the content).
  const src = existsSync(path.join(AUDIO_DIR, `${id}.mp3`))
    ? `/audio/${id}.mp3`
    : `/api/tts?lang=${lang}&ch=${chapter}&key=${key}&v=${id}`;
  return { id, layer, role, text, src, ...(mood ? { mood } : {}) };
}

export function buildPlaylist(lang: Lang, chapter: number): ChapterPlaylist {
  const translation = getTranslation(lang, chapter);
  const direction = getDirection(chapter);

  const verses = versesOf(chapter).map((v): VerseItem => {
    const n = String(v.verse);
    const rawText = translation?.verses[n];
    const texts = rawText === undefined ? [] : Array.isArray(rawText) ? rawText : [rawText];
    const rawCues = direction[n];
    const cues = Array.isArray(rawCues) ? rawCues : [rawCues];
    if (Array.isArray(rawCues) && texts.length && rawCues.length !== texts.length) {
      throw new Error(`${lang} ${chapter}.${n}: ${texts.length} segments but ${rawCues.length} cues`);
    }

    const segments: Segment[] = texts.map((text, i) => {
      const cue = normalizeCue(cues[Array.isArray(rawCues) ? i : 0]);
      return { speaker: cue.speaker ?? v.speaker, text, ...(cue.mood ? { mood: cue.mood } : {}) };
    });
    const note = translation?.notes?.[n];
    const clips = {
      sanskrit: makeClip(lang, chapter, `v${n}.s`, "sanskrit", "reciter", v.sanskrit.join("\n")),
      translation: segments.map((s, i) => makeClip(lang, chapter, `v${n}.t${i}`, "translation", s.speaker, s.text, s.mood)),
      ...(note ? { note: makeClip(lang, chapter, `v${n}.n`, "note", "guide", note) } : {}),
    };

    return {
      verse: v.verse,
      speaker: v.speaker,
      sanskrit: v.sanskrit,
      transliteration: v.transliteration,
      segments: segments.map((s) => ({ ...s, text: toDisplay(s.text) })),
      ...(note ? { note: toDisplay(note) } : {}),
      clips,
    };
  });

  return {
    lang,
    chapter,
    translated: translation !== null,
    ...(translation?.intro
      ? {
          intro: {
            text: toDisplay(translation.intro),
            clip: makeClip(lang, chapter, "intro", "note", "guide", translation.intro),
          },
        }
      : {}),
    verses,
  };
}

/** Every clip in a chapter, keyed by the `key` used in /api/tts URLs. */
export function clipIndex(playlist: ChapterPlaylist): Map<string, Clip> {
  const index = new Map<string, Clip>();
  if (playlist.intro) index.set("intro", playlist.intro.clip);
  for (const v of playlist.verses) {
    index.set(`v${v.verse}.s`, v.clips.sanskrit);
    v.clips.translation.forEach((c, i) => index.set(`v${v.verse}.t${i}`, c));
    if (v.clips.note) index.set(`v${v.verse}.n`, v.clips.note);
  }
  return index;
}
