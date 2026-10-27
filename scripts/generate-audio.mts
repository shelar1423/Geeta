// Pre-generates audio for the chapters we have translations for, so the app
// can serve it as static files instead of calling Sarvam on demand.
//
// Usage:
//   npm run audio -- --dry-run                 # count characters and cost
//   npm run audio -- --lang hi --chapters 1,2  # generate
//
// Files land in public/audio/<clip id>.mp3. Ids are content hashes, so
// re-running only generates clips whose text or voice has changed.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { voiceFor } from "../src/lib/casting";
import { CHAPTERS, hasTranslation } from "../src/lib/content";
import { AUDIO_DIR, buildPlaylist, clipIndex } from "../src/lib/playlist";
import { synthesize } from "../src/lib/sarvam";
import { LANGUAGES, type Clip, type Lang } from "../src/lib/types";

// Bulbul v4 Flash list price, ₹ per 10,000 characters.
const RUPEES_PER_10K_CHARS = 20;
const CONCURRENCY = 3;

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}

const dryRun = process.argv.includes("--dry-run");
const sanskrit = process.argv.includes("--sanskrit");
const langs = (arg("lang")?.split(",") ?? LANGUAGES) as Lang[];
const chapterArg = arg("chapters")?.split(",").map(Number);

const clips: Clip[] = [];
for (const lang of langs) {
  const chapters = chapterArg ?? CHAPTERS.map((c) => c.number).filter((n) => hasTranslation(lang, n));
  for (const chapter of chapters) {
    for (const clip of clipIndex(buildPlaylist(lang, chapter)).values()) {
      if (clip.layer === "sanskrit" && !sanskrit) continue;
      if (!existsSync(path.join(AUDIO_DIR, `${clip.id}.mp3`))) clips.push({ ...clip, src: lang });
    }
  }
}
// The Sanskrit verse is the same in every language; generate it once.
const unique = [...new Map(clips.map((c) => [c.id, c])).values()];

const chars = unique.reduce((n, c) => n + c.text.length, 0);
console.log(
  `${unique.length} clips to generate, ${chars.toLocaleString()} characters, ` +
    `about ₹${Math.ceil((chars / 10_000) * RUPEES_PER_10K_CHARS)}`,
);
if (dryRun || unique.length === 0) process.exit(0);

mkdirSync(AUDIO_DIR, { recursive: true });
let done = 0;
let failed = 0;
async function worker() {
  for (let clip = unique.shift(); clip; clip = unique.shift()) {
    const lang = clip.src as Lang;
    try {
      const audio = await synthesize(clip.text, voiceFor(lang, clip.role, clip.mood));
      writeFileSync(path.join(AUDIO_DIR, `${clip.id}.mp3`), audio);
      done++;
    } catch (error) {
      failed++;
      console.error(`\n${lang} ${clip.role}: ${(error as Error).message}`);
    }
    process.stdout.write(`\r${done} generated, ${failed} failed`);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log();
if (failed) process.exit(1);
