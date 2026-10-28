# Gita Vani · गीता वाणी

The Bhagavad Gita as a living dialogue. Every character speaks in their own
voice, using [Sarvam AI's Bulbul](https://docs.sarvam.ai/api/getting-started/models/bulbul)
text-to-speech, in Hindi, English and Marathi. It's free, with no ads and no sign-up.

- **The cast.** Krishna is calm and deep. Arjuna is young and expressive. Sanjaya narrates. Dhritarashtra is the old, anxious king. Duryodhana is boastful. A guide explains the verses. Each role is cast separately in each language (`src/lib/casting.ts`).
- **Expressive delivery.** Every line carries a mood (`grave`, `anguish`, `awe`, `urgent`, `tender`, `triumphant`). The mood sets pace, pitch, loudness and expressiveness (temperature), and can switch to another style of the same voice. Arjuna's despair in 1.28–1.46 is slower and softer, while Duryodhana's boasting and the conches in 1.12–1.19 are louder and brighter.
- **Pauses.** Translations are written as performance scripts, with breaths, hesitations and exclamations (see [Performance scripts](#performance-scripts)). Between clips the player leaves silences like a radio play would. Turns within a verse are quick. There's a beat between verses and a breath when the speaker changes. The Sanskrit and the explanations get room to settle, and heavy moods linger longer (`src/lib/timing.ts`).
- **Speaker hand-offs inside a verse.** In 1.21, Sanjaya says "he spoke to Krishna", and then Arjuna speaks in his own voice.
- **Three layers per verse.** You can play the Sanskrit (experimental), the dialogue, and a short explanation, and switch each one on or off.
- **Reading view.** Devanagari, IAST transliteration and translation are shown together. The verse being spoken is highlighted and kept in view.
- **Player.** Speed control, repeat-verse mode for learning, and lock-screen and headset controls (Media Session).

Chapters 1–2 are fully voiced. Chapters 3–18 have Sanskrit and transliteration, so for now they can only be heard in Sanskrit.

## Running it

```bash
npm install
cp .env.example .env.local   # add your SARVAM_API_KEY
npm run dev
```

Without a key the site still works for reading. When you press play it says audio isn't available.

## Audio

Audio is made in one of two ways:

1. **Pre-generated** (recommended for production). Clips are written to `public/audio/<id>.mp3` and served as static files.
   ```bash
   npm run audio -- --dry-run                # how many characters, roughly how many ₹
   npm run audio -- --lang hi --chapters 1,2 # generate
   npm run audio -- --sanskrit               # include the Sanskrit recitation
   ```
2. **On demand.** Any clip without a file is synthesised by `/api/tts` on first play. The response is cached as immutable, because the URL contains a hash of the text and voice. The route only voices text that exists in `content/`, so it can't be used to spend credits on arbitrary input.

`npm run audio` trims leading silence (the bulbul:v3 voices start with up to 0.6 s), limits peaks to −2 dBFS (Sarvam's output often overshoots full scale), and re-encodes to 48 kbps mono. That takes Chapters 1–2 from about 90 MB to 36 MB. It retries when rate-limited. If the account runs out of credits, the app tells listeners that part isn't voiced yet instead of skipping ahead.

Clip ids are content hashes of the text and voice settings. If you change a line, a mood or a casting choice, only the affected clips are regenerated.
Chapters 1–2 in all three languages, including intros and notes, come to about 50k characters, roughly ₹100.

Audition alternative voices for every role at `/<lang>/cast`.

## Content

```
content/
  verses.json             Sanskrit + IAST for all 701 verses, tagged with who opens each verse
  chapters.json           chapter names and titles
  direction/NN.json       per-verse mood and speaker overrides (shared by all languages)
  translations/<lang>/NN.json
```

- `verses.json` is built from the public-domain [gita/gita](https://github.com/gita/gita) dataset by `npm run import-verses`. Only the Sanskrit is taken. The transliteration is derived from it, because the dataset's own transliteration is misaligned in about 30 verses.
- Translations, intros and notes are our own. They are written to be spoken aloud and are free of copyrighted commentaries. A verse whose speaker changes midway holds one string per speaker. Its direction entry is then an array of cues, one for each string.

```jsonc
// direction/01.json
"21": [{ "speaker": "sanjaya", "mood": "calm" }, { "speaker": "arjuna", "mood": "urgent" }]
// translations/en/01.json
"21": ["And he spoke these words to Krishna.", "Achyuta, take my chariot out, between the two armies!"]
```

## Performance scripts

Bulbul has no SSML, so delivery is directed through the text itself:

Measured on Bulbul v4 Flash:

| Write | Effect |
| --- | --- |
| `,` | a short pause, about 0.4 s |
| `.` / `।` | end of a sentence; the pause varies from none to 0.55 s |
| `!` / `?` | emphasis or a question |
| `\|` | a breath. It is spoken as a line break, which gives a steady 0.55 s pause, the longest available within a clip. It is hidden on screen |
| `…` | a hesitation. On its own Bulbul barely pauses (0.26 s in English, less than a comma), so the app adds a line break after it, which gives a steady 0.5 s |

Longer, dramatic silences come from the gaps between clips, which the player times exactly.

```jsonc
"29": "my limbs give way… | my mouth is dry. | My body trembles, and my hair stands on end."
```

Keep sentences short. Long ones make the voice run out of breath. Quoted speech can go to the person who said it. In 2.9, Sanjaya narrates, Arjuna himself says "I will not fight", and then Sanjaya continues.

Sarvam's docs disagree on which expression controls (`pitch`, `loudness`, `temperature`) each model accepts. If a request is rejected, `src/lib/sarvam.ts` retries with only the core parameters, and from then on it skips those controls for that model.

## Roadmap

- Voice chapters 3–18, then Bengali, Gujarati, Tamil, Telugu, Kannada and Punjabi. All of these have Bulbul v4 personas.
- Sanskrit chanting that follows the verse's meter, e.g. [Vāgdhenu](https://github.com/sharadcodes/vagdhenu). Bulbul doesn't support Sanskrit.
- One identity per character across languages, using Sarvam's cross-lingual voice cloning.
- Offline downloads, verse of the day, and the iOS/Android apps. The content and playlist model are designed to be shared with an Expo/React Native client.
