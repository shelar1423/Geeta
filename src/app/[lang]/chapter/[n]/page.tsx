import Link from "next/link";
import { notFound } from "next/navigation";
import { ChapterPlayer, type PlayerVerse } from "@/components/ChapterPlayer";
import { Header } from "@/components/Header";
import { CHAPTERS, getChapter } from "@/lib/content";
import { num, stringsFor, t } from "@/lib/i18n";
import { parseLang } from "@/lib/params";
import { buildPlaylist } from "@/lib/playlist";
import type { Clip } from "@/lib/types";

export function generateStaticParams() {
  return CHAPTERS.map((c) => ({ n: String(c.number) }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/chapter/[n]">) {
  const { lang: rawLang, n } = await params;
  const lang = parseLang(rawLang);
  const chapter = getChapter(Number(n));
  return chapter ? { title: `${chapter.title[lang]} · ${t(lang, "appName")}` } : {};
}

/** The client needs who speaks, how, and where the audio is; not the text again. */
const slim = ({ id, layer, role, mood, src }: Clip) => ({ id, layer, role, mood, src });

export default async function ChapterPage({ params }: PageProps<"/[lang]/chapter/[n]">) {
  const { lang: rawLang, n } = await params;
  const lang = parseLang(rawLang);
  const chapter = getChapter(Number(n));
  if (!chapter || String(chapter.number) !== n) notFound();

  const playlist = buildPlaylist(lang, chapter.number);
  const verses: PlayerVerse[] = playlist.verses.map((v) => ({
    verse: v.verse,
    speaker: v.speaker,
    sanskrit: v.sanskrit,
    transliteration: v.transliteration,
    segments: v.segments.map(({ speaker, text }) => ({ speaker, text })),
    note: v.note,
    clips: {
      sanskrit: slim(v.clips.sanskrit),
      translation: v.clips.translation.map(slim),
      note: v.clips.note && slim(v.clips.note),
    },
  }));
  const prev = getChapter(chapter.number - 1);
  const next = getChapter(chapter.number + 1);

  return (
    <>
      <Header lang={lang} path={`/chapter/${chapter.number}`} />
      <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-48">
        <div className="mb-8 space-y-1">
          <p className="text-sm uppercase tracking-widest text-muted">
            {t(lang, "chapter")} {num(lang, chapter.number)}
          </p>
          <h1 className="font-display text-4xl font-bold">{chapter.title[lang]}</h1>
          <p className="font-shloka text-lg text-muted">{chapter.sanskritName}</p>
        </div>
        <ChapterPlayer
          lang={lang}
          chapter={chapter.number}
          translated={playlist.translated}
          intro={playlist.intro && { text: playlist.intro.text, clip: slim(playlist.intro.clip) }}
          verses={verses}
          strings={stringsFor(lang)}
        />
        <nav className="mt-12 flex justify-between gap-4 text-sm">
          {prev ? (
            <Link href={`/${lang}/chapter/${prev.number}`} className="text-accent hover:underline">
              ← {num(lang, prev.number)}. {prev.title[lang]}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/${lang}/chapter/${next.number}`} className="text-right text-accent hover:underline">
              {num(lang, next.number)}. {next.title[lang]} →
            </Link>
          )}
        </nav>
      </main>
    </>
  );
}
