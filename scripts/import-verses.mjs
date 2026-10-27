// Builds content/verses.json from the public-domain gita/gita dataset
// (https://github.com/gita/gita, Unlicense). Only the Sanskrit text is
// taken (transliteration is derived from it); translations are our own (content/translations).
//
// `speaker` is who opens the verse. A few verses change speaker midway
// (e.g. 1.21, 1.28); translations split those into per-speaker segments.
//
// Usage: node scripts/import-verses.mjs
import { writeFile } from "node:fs/promises";

const SOURCE = "https://raw.githubusercontent.com/gita/gita/main/data/verse.json";

// "<speaker> उवाच" markers that open a verse whenever the speaker changes.
const SPEAKER_MARKER = /^(धृतराष्ट्र|सञ्जय|संजय|अर्जुन|श्री\s?भगवान्?)\s?(?:उवाच|ुवाच)\s*/;
const SPEAKER_IDS = {
  धृतराष्ट्र: "dhritarashtra",
  सञ्जय: "sanjaya",
  संजय: "sanjaya",
  अर्जुन: "arjuna",
};

function parseSanskrit(text) {
  let body = text.trim();
  let speaker = null;
  const m = body.match(SPEAKER_MARKER);
  if (m) {
    speaker = SPEAKER_IDS[m[1]] ?? "krishna";
    body = body.slice(m[0].length);
  }
  body = body.replace(/[।|॥]*\s*\d+\.\d+\s*[।|॥]*\s*$/, "").trim();
  let lines = body.split("\n").map((l) => l.trim()).filter(Boolean);
  // Some verses come as a single line; split after each half-verse danda.
  if (lines.length === 1) lines = lines[0].split(/(?<=।)/).map((l) => l.trim()).filter(Boolean);
  lines = lines.map((l) => l.replace(/।$/, ""));
  return {
    speaker,
    lines: lines.map((l, i) => l + (i === lines.length - 1 ? " ॥" : " ।")),
  };
}

// Devanagari -> IAST. The dataset's own transliteration is misaligned in
// ~30 verses, so we derive it from the Sanskrit instead.
const CONSONANTS = {
  क: "k", ख: "kh", ग: "g", घ: "gh", ङ: "ṅ", च: "c", छ: "ch", ज: "j", झ: "jh", ञ: "ñ",
  ट: "ṭ", ठ: "ṭh", ड: "ḍ", ढ: "ḍh", ण: "ṇ", त: "t", थ: "th", द: "d", ध: "dh", न: "n",
  प: "p", फ: "ph", ब: "b", भ: "bh", म: "m", य: "y", र: "r", ल: "l", व: "v", श: "ś",
  ष: "ṣ", स: "s", ह: "h", ळ: "ḷ",
};
const VOWELS = {
  अ: "a", आ: "ā", इ: "i", ई: "ī", उ: "u", ऊ: "ū", ऋ: "ṛ", ॠ: "ṝ", ऌ: "ḷ", ए: "e", ऐ: "ai", ओ: "o", औ: "au",
};
const MATRAS = {
  "ा": "ā", "ि": "i", "ी": "ī", "ु": "u", "ू": "ū", "ृ": "ṛ", "ॄ": "ṝ", "ॢ": "ḷ", "े": "e", "ै": "ai", "ो": "o", "ौ": "au",
};
const MARKS = { "ं": "ṃ", "ः": "ḥ", "ँ": "m̐", "ऽ": "’", "ॐ": "oṃ", "।": "", "॥": "" };
const NUKTA = "़";
const VIRAMA = "्";

function toIAST(text) {
  const chars = [...text.replaceAll(NUKTA, "")];
  let out = "";
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c in CONSONANTS) {
      out += CONSONANTS[c];
      const next = chars[i + 1];
      if (next === VIRAMA) {
        i++;
      } else if (next in MATRAS) {
        out += MATRAS[next];
        i++;
      } else {
        out += "a";
      }
    } else if (c in VOWELS) out += VOWELS[c];
    else if (c in MATRAS) out += MATRAS[c];
    else if (c in MARKS) out += MARKS[c];
    else out += c;
  }
  return out.replace(/\s+/g, " ").trim();
}

const res = await fetch(SOURCE);
if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
const raw = await res.json();
raw.sort((a, b) => a.chapter_number - b.chapter_number || a.verse_number - b.verse_number);

let speaker = null;
const verses = raw.map((v) => {
  const parsed = parseSanskrit(v.text);
  speaker = parsed.speaker ?? speaker;
  return {
    chapter: v.chapter_number,
    verse: v.verse_number,
    speaker,
    sanskrit: parsed.lines,
    transliteration: parsed.lines.map(toIAST),
  };
});

await writeFile(new URL("../content/verses.json", import.meta.url), JSON.stringify(verses, null, 1) + "\n");

const counts = {};
for (const v of verses) counts[v.speaker] = (counts[v.speaker] ?? 0) + 1;
console.log(`Wrote ${verses.length} verses`, counts);
