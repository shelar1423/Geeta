import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Header } from "@/components/Header";
import { CHARACTERS } from "@/lib/casting";
import { CHAPTERS, hasTranslation } from "@/lib/content";
import { num, t } from "@/lib/i18n";
import { parseLang } from "@/lib/params";

const CAST_ROW = ["krishna", "arjuna", "sanjaya", "dhritarashtra", "duryodhana", "guide"] as const;

export default async function Home({ params }: PageProps<"/[lang]">) {
  const lang = parseLang((await params).lang);
  return (
    <>
      <Header lang={lang} />
      <main className="mx-auto w-full max-w-3xl space-y-12 px-4 py-10">
        <section className="space-y-3">
          <p className="font-shloka text-muted">श्रीमद्भगवद्गीता</p>
          <h1 className="font-display text-4xl font-bold">{t(lang, "tagline")}</h1>
          <p className="text-muted">{t(lang, "free")}</p>
        </section>

        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-bold">{t(lang, "cast")}</h2>
            <Link href={`/${lang}/cast`} className="text-sm text-accent hover:underline">
              {t(lang, "meetCast")} →
            </Link>
          </div>
          <ul className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
            {CAST_ROW.map((role) => (
              <li key={role} className="flex w-24 shrink-0 flex-col items-center gap-2 text-center">
                <Avatar role={role} lang={lang} size="lg" />
                <span className="leading-tight font-semibold">{CHARACTERS[role].name[lang]}</span>
                <span className="-mt-2 text-xs text-muted">{CHARACTERS[role].role[lang]}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold">{t(lang, "chapters")}</h2>
          <ol className="grid gap-3 sm:grid-cols-2">
            {CHAPTERS.map((c) => {
              const voiced = hasTranslation(lang, c.number);
              return (
                <li key={c.number}>
                  <Link
                    href={`/${lang}/chapter/${c.number}`}
                    className="flex h-full gap-4 rounded-2xl border border-line bg-card p-4 transition hover:border-accent"
                  >
                    <span className="font-display text-3xl font-bold text-accent/80">{num(lang, c.number)}</span>
                    <span className="space-y-1">
                      <span className="block font-semibold leading-snug">{c.title[lang]}</span>
                      <span className="block font-shloka text-sm text-muted">{c.sanskritName}</span>
                      <span className="block text-xs text-muted">
                        {num(lang, c.verseCount)} {t(lang, "verses")}
                        {" · "}
                        {voiced ? (
                          <span className="font-semibold text-accent">▶ {t(lang, "listen")}</span>
                        ) : (
                          t(lang, "sanskritOnly")
                        )}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      </main>
      <footer className="mx-auto w-full max-w-3xl px-4 py-8 text-sm text-muted">{t(lang, "voicedBy")}</footer>
    </>
  );
}
