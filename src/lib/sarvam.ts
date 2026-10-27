import "server-only";
import type { VoiceRequest } from "./casting";

// Overridable so tests can point at a mock.
const ENDPOINT = process.env.SARVAM_TTS_URL ?? "https://api.sarvam.ai/text-to-speech";

export class MissingApiKeyError extends Error {
  constructor() {
    super("SARVAM_API_KEY is not set");
  }
}

/** Synthesises `text` with Bulbul and returns MP3 bytes. */
export async function synthesize(text: string, voice: VoiceRequest): Promise<Buffer> {
  const key = process.env.SARVAM_API_KEY;
  if (!key) throw new MissingApiKeyError();

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "api-subscription-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      ...voice,
      speech_sample_rate: 24000,
      output_audio_codec: "mp3",
      enable_preprocessing: true,
    }),
  });
  if (!res.ok) {
    throw new Error(`Sarvam TTS ${res.status}: ${await res.text()}`);
  }
  const body: { audios: string[] } = await res.json();
  return Buffer.from(body.audios.join(""), "base64");
}
