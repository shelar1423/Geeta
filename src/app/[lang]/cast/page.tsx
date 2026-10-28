import { Audition } from "@/components/Audition";
import { Avatar } from "@/components/Avatar";
import { Header } from "@/components/Header";
import { auditionClip } from "@/lib/audition";
import { AUDITION, CAST, CHARACTERS } from "@/lib/casting";
import { t } from "@/lib/i18n";
import { parseLang } from "@/lib/params";
import { liveTtsEnabled } from "@/lib/sarvam";
import { toDisplay } from "@/lib/script";
import type { VoiceRole } from "@/lib/types";

const ROLES: VoiceRole[] = ["krishna", "arjuna", "sanjaya", "dhritarashtra", "duryodhana", "guide", "reciter"];

export default async function CastPage({ params }: PageProps<"/[lang]/cast">) {
  const lang = parseLang((await params).lang);
  return (
    <>
      <Header lang={lang} path="/cast" />
      <main className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10">
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-bold">{t(lang, "meetCast")}</h1>
          <p className="text-muted">{t(lang, "auditionHelp")}</p>
        </div>
        <ul className="space-y-4">
          {ROLES.map((role) => {
            const cast = CAST[lang][role];
            // The cast voice's sample is a chapter clip, normally pre-generated.
            // Other voices cost Sarvam credits, so they are offered only with live TTS on.
            const clip = auditionClip(lang, role);
            const alternatives = liveTtsEnabled() ? (AUDITION[lang][role] ?? []).filter((s) => s !== cast.speaker) : [];
            const samples = [
              { speaker: cast.speaker, src: clip.src },
              ...alternatives.map((speaker) => ({ speaker, src: `/api/tts?lang=${lang}&role=${role}&speaker=${speaker}` })),
            ];
            return (
              <li
                key={role}
                className="space-y-3 rounded-2xl border border-line bg-card p-5"
                style={{ borderLeft: `4px solid ${CHARACTERS[role].color}` }}
              >
                <div className="flex items-center gap-3">
                  <Avatar role={role} lang={lang} />
                  <div>
                    <p className="font-display text-xl font-bold">{CHARACTERS[role].name[lang]}</p>
                    <p className="text-sm text-muted">{CHARACTERS[role].role[lang]}</p>
                  </div>
                </div>
                <blockquote
                  lang={role === "reciter" ? "sa" : lang}
                  className={`border-l-2 border-line pl-3 text-muted italic ${role === "reciter" ? "font-shloka not-italic" : ""}`}
                >
                  {toDisplay(clip.text)}
                </blockquote>
                <Audition samples={samples} current={cast.speaker} currentLabel={t(lang, "current")} />
                {role === "reciter" && <p className="text-xs text-muted">{t(lang, "experimentalSanskrit")}</p>}
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
