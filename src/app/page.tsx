import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { CHARACTERS } from "@/lib/casting";
import { LANGUAGE_NAMES, t } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/types";

const SPEAKERS = ["krishna", "arjuna", "sanjaya", "dhritarashtra"] as const;

export default function Landing() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-10 px-4 py-16 text-center">
      <div className="flex -space-x-3">
        {SPEAKERS.map((role) => (
          <span key={role} className="rounded-full ring-4 ring-bg">
            <Avatar role={role} lang="en" size="lg" />
          </span>
        ))}
      </div>
      <div className="space-y-3">
        <p className="font-shloka text-lg text-muted">श्रीमद्भगवद्गीता</p>
        <h1 className="font-display text-5xl font-bold text-accent">Gita Vani</h1>
        <p className="mx-auto max-w-md text-lg">{t("en", "tagline")}</p>
        <p className="text-muted">
          {SPEAKERS.map((r) => CHARACTERS[r].name.en).join(" · ")}
        </p>
      </div>
      <div className="w-full max-w-sm space-y-3">
        <h2 className="text-sm uppercase tracking-widest text-muted">Choose your language · भाषा चुनें</h2>
        <div className="grid gap-3">
          {LANGUAGES.map((lang) => (
            <Link
              key={lang}
              href={`/${lang}`}
              lang={lang}
              className="rounded-2xl border border-line bg-card px-5 py-4 text-left transition hover:border-accent"
            >
              <span className="block font-display text-2xl font-bold">{LANGUAGE_NAMES[lang]}</span>
              <span className="text-sm text-muted">{t(lang, "tagline")}</span>
            </Link>
          ))}
        </div>
      </div>
      <p className="text-sm text-muted">{t("en", "free")}</p>
    </main>
  );
}
