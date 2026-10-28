// Pre-generates audio for the chapters we have translations for, so the app
// can serve it as static files instead of calling Sarvam on demand.
//
// Every generated clip spends Sarvam credits (the free ₹100 is one-time),
// so by default this only reports what is missing and what it would cost.
//
// Usage:
//   npm run audio                                    # report only
//   npm run audio -- --lang hi --chapters 1,2 --yes  # generate (spends credits)
//
// Files land in public/audio/<clip id>.mp3. Ids are content hashes, so
// re-running only generates clips whose text or voice has changed.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { voiceFor } from "../src/lib/casting";
import { CHAPTERS, hasTranslation } from "../src/lib/content";
import { AUDIO_DIR, buildPlaylist, clipIndex } from "../src/lib/playlist";
import { synthesize } from "../src/lib/sarvam";
import { LANGUAGES, type Clip, type Lang } from "../src/lib/types";

// Bulbul v4 Flash list price, ₹ per 10,000 characters.
const RUPEES_PER_10K_CHARS = 20;
const CONCURRENCY = 2;

/**
 * Post-processing, when ffmpeg is available:
 * - trim leading silence to 80 ms (bulbul:v3 voices start with up to 0.6 s,
 *   which would stretch the pauses the player times between clips);
 * - limit peaks to -2 dBFS, leaving room for MP3 overshoot (Sarvam's output often overshoots full scale);
 * - re-encode the 128 kbps MP3 Sarvam returns to 48 kbps mono, plenty for
 *   speech and about a third of the size.
 */
export const POST_FILTER =
  "silenceremove=start_periods=1:start_silence=0.08:start_threshold=-45dB,alimiter=limit=0.794:level=disabled";

function compress(mp3: Buffer): Buffer {
  const args = ["-v", "error", "-i", "pipe:0", "-af", POST_FILTER, "-ac", "1", "-b:a", "48k", "-f", "mp3", "pipe:1"];
  const result = spawnSync("ffmpeg", args, {
    input: mp3,
    maxBuffer: 64 * 1024 * 1024,
  });
  return result.status === 0 && result.stdout.length ? result.stdout : mp3;
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}

// Spending needs an explicit --yes; --dry-run is kept for old habits.
const dryRun = !process.argv.includes("--yes") || process.argv.includes("--dry-run");
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
if (unique.length === 0) process.exit(0);
if (dryRun) {
  console.log("Nothing generated. Re-run with --yes to spend Sarvam credits on these clips.");
  process.exit(0);
}

mkdirSync(AUDIO_DIR, { recursive: true });
let done = 0;
let failed = 0;
async function worker() {
  for (let clip = unique.shift(); clip; clip = unique.shift()) {
    const lang = clip.src as Lang;
    try {
      const audio = await synthesize(clip.text, voiceFor(lang, clip.role, clip.mood));
      writeFileSync(path.join(AUDIO_DIR, `${clip.id}.mp3`), compress(audio));
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
