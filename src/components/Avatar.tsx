import { CHARACTERS } from "@/lib/casting";
import type { Lang, VoiceRole } from "@/lib/types";

const SIZES = { sm: "size-8 text-sm", md: "size-11 text-lg", lg: "size-16 text-2xl" };

/** A monogram in the character's colour. */
export function Avatar({ role, lang, size = "md" }: { role: VoiceRole; lang: Lang; size?: keyof typeof SIZES }) {
  const character = CHARACTERS[role];
  return (
    <span
      aria-hidden
      className={`${SIZES[size]} inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold text-white`}
      style={{ background: `linear-gradient(140deg, ${character.color}, color-mix(in oklab, ${character.color} 55%, black))` }}
    >
      {[...character.name[lang].replace(/^श्री/, "")][0]}
    </span>
  );
}
