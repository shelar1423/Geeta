import Link from "next/link";
import { LANGUAGE_NAMES, t } from "@/lib/i18n";
import { LANGUAGES, type Lang } from "@/lib/types";

/** Site header. `path` is the current path below the language, used to switch language in place. */
export function Header({ lang, path = "" }: { lang: Lang; path?: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
        <Link href={`/${lang}`} className="font-display text-xl font-bold text-accent">
          {t(lang, "appName")}
        </Link>
        <nav aria-label="Language" className="flex gap-1 text-sm">
          {LANGUAGES.map((l) => (
            <Link
              key={l}
              href={`/${l}${path}`}
              lang={l}
              aria-current={l === lang ? "page" : undefined}
              className={`rounded-full px-3 py-1 ${l === lang ? "bg-accent text-accent-ink" : "text-muted hover:text-ink"}`}
            >
              {LANGUAGE_NAMES[l]}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
