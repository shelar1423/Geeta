import "server-only";
import type { VoiceRequest } from "./casting";

// Overridable so tests can point at a mock.
const ENDPOINT = process.env.SARVAM_TTS_URL ?? "https://api.sarvam.ai/text-to-speech";

export class MissingApiKeyError extends Error {
  constructor() {
    super("SARVAM_API_KEY is not set");
  }
}

/** Sends one request; returns null if Sarvam rejected the parameters. */
async function request(key: string, body: Record<string, unknown>): Promise<Buffer | null> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "api-subscription-key": key, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status === 400 || res.status === 422) {
    console.warn(`Sarvam TTS rejected ${JSON.stringify(Object.keys(body))}: ${await res.text()}`);
    return null;
  }
  if (!res.ok) throw new Error(`Sarvam TTS ${res.status}: ${await res.text()}`);
  const json: { audios: string[] } = await res.json();
  return Buffer.from(json.audios.join(""), "base64");
}

/**
 * Synthesises `text` with Bulbul and returns MP3 bytes.
 *
 * Sarvam's docs disagree on which expression controls each model accepts
 * (pitch, loudness, temperature, preprocessing), so if a request is
 * rejected it is retried with only the core parameters.
 */
export async function synthesize(text: string, voice: VoiceRequest): Promise<Buffer> {
  const key = process.env.SARVAM_API_KEY;
  if (!key) throw new MissingApiKeyError();

  const { pitch, loudness, temperature, ...core } = voice;
  const base = { text, ...core, speech_sample_rate: 24000, output_audio_codec: "mp3" };
  const full = { ...base, pitch, loudness, temperature, enable_preprocessing: true };
  let audio = coreOnly.has(voice.model) ? null : await request(key, full);
  if (!audio) {
    audio = await request(key, base);
    if (!audio) throw new Error(`Sarvam TTS rejected the request for speaker ${voice.speaker}`);
    coreOnly.add(voice.model);
  }
  return audio;
}

/** Models that rejected the expression controls; later requests skip them. */
const coreOnly = new Set<string>();
