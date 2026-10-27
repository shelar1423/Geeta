import type { NextRequest } from "next/server";
import { AUDITION, CAST, voiceFor } from "@/lib/casting";
import { getChapter } from "@/lib/content";
import { auditionLine } from "@/lib/audition";
import { buildPlaylist, clipIndex } from "@/lib/playlist";
import { MissingApiKeyError, synthesize } from "@/lib/sarvam";
import { LANGUAGES, type Lang, type VoiceRole } from "@/lib/types";

/**
 * On-demand audio for clips that were not pre-generated. Only text that
 * exists in our content can be synthesised, so the endpoint cannot be used
 * to spend credits on arbitrary input.
 *
 *   ?lang=hi&ch=2&key=v47.t0&v=<clip id>     a clip from a chapter
 *   ?lang=hi&role=krishna&speaker=<persona>  an audition sample
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lang = params.get("lang") as Lang;
  if (!LANGUAGES.includes(lang)) return new Response("Unknown language", { status: 400 });

  let text: string;
  let voice;
  const role = params.get("role") as VoiceRole | null;
  if (role) {
    const speaker = params.get("speaker") ?? CAST[lang][role]?.speaker;
    const allowed = [CAST[lang][role]?.speaker, ...(AUDITION[lang][role] ?? [])];
    if (!speaker || !allowed.includes(speaker)) return new Response("Unknown voice", { status: 400 });
    text = auditionLine(lang, role);
    // Audition alternatives are all v4 Flash personas.
    voice = speaker === CAST[lang][role].speaker ? voiceFor(lang, role) : { ...voiceFor(lang, role), model: "bulbul:v4-flash" as const, speaker };
  } else {
    const chapter = Number(params.get("ch"));
    const clip = getChapter(chapter) && clipIndex(buildPlaylist(lang, chapter)).get(params.get("key") ?? "");
    if (!clip) return new Response("Unknown clip", { status: 404 });
    text = clip.text;
    voice = voiceFor(lang, clip.role, clip.mood);
  }

  try {
    const audio = await synthesize(text, voice);
    return new Response(new Uint8Array(audio), {
      headers: {
        "Content-Type": "audio/mpeg",
        // URLs carry a content hash, so a response never goes stale.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      return new Response("Audio is not available: SARVAM_API_KEY is not configured.", { status: 503 });
    }
    console.error(error);
    return new Response("Speech synthesis failed", { status: 502 });
  }
}
