import "server-only";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import type { Chapter, CharacterId, Lang, Mood, Verse } from "./types";

const CONTENT = path.join(process.cwd(), "content");

const readJson = <T>(...parts: string[]): T => JSON.parse(readFileSync(path.join(CONTENT, ...parts), "utf8"));

export const VERSES: Verse[] = readJson("verses.json");
export const CHAPTERS: Chapter[] = readJson("chapters.json");

export function getChapter(n: number): Chapter | undefined {
  return CHAPTERS.find((c) => c.number === n);
}

export function versesOf(chapter: number): Verse[] {
  return VERSES.filter((v) => v.chapter === chapter);
}

/** Per-verse text: a string, or one string per speaker when the verse changes hands. */
export interface TranslationFile {
  intro?: string;
  verses: Record<string, string | string[]>;
  notes?: Record<string, string>;
}

/** A cue is a mood, or a speaker override with an optional mood. */
type Cue = Mood | { speaker?: CharacterId; mood?: Mood };
export type DirectionFile = Record<string, Cue | Cue[]>;

const pad = (n: number) => String(n).padStart(2, "0");

export function getTranslation(lang: Lang, chapter: number): TranslationFile | null {
  const file = path.join(CONTENT, "translations", lang, `${pad(chapter)}.json`);
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null;
}

export function getDirection(chapter: number): DirectionFile {
  const file = path.join(CONTENT, "direction", `${pad(chapter)}.json`);
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
}

export function hasTranslation(lang: Lang, chapter: number): boolean {
  return existsSync(path.join(CONTENT, "translations", lang, `${pad(chapter)}.json`));
}

export function normalizeCue(cue: Cue | undefined): { speaker?: CharacterId; mood?: Mood } {
  if (!cue) return {};
  return typeof cue === "string" ? { mood: cue } : cue;
}
