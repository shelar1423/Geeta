"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Avatar } from "./Avatar";
import { CHARACTERS } from "@/lib/casting";
import type { StringKey } from "@/lib/i18n";
import { gapBetween } from "@/lib/timing";
import type { CharacterId, Layer, Lang, Mood, VoiceRole } from "@/lib/types";

export interface PlayerClip {
  id: string;
  layer: Layer;
  role: VoiceRole;
  mood?: Mood;
  src: string;
}

export interface PlayerVerse {
  verse: number;
  speaker: CharacterId;
  sanskrit: string[];
  transliteration: string[];
  segments: { speaker: CharacterId; text: string }[];
  note?: string;
  clips: { sanskrit: PlayerClip; translation: PlayerClip[]; note?: PlayerClip };
}

interface Settings {
  sanskrit: boolean;
  translation: boolean;
  note: boolean;
  rate: number;
  repeat: boolean;
}

const DEFAULT_SETTINGS: Settings = { sanskrit: false, translation: true, note: true, rate: 1, repeat: false };
const RATES = [0.75, 1, 1.25, 1.5];
const SETTINGS_KEY = "gita-vani:settings";
const INTRO = -1;

/** Where playback is: a verse index (or INTRO) and a part within it. */
interface Cursor {
  verse: number;
  part: number;
}

class AudioUnavailableError extends Error {}

// Settings live in localStorage, so they follow the listener across chapters.
const settingsListeners = new Set<() => void>();
const settingsStore = {
  subscribe(listener: () => void) {
    settingsListeners.add(listener);
    window.addEventListener("storage", listener);
    return () => {
      settingsListeners.delete(listener);
      window.removeEventListener("storage", listener);
    };
  },
  read(): string | null {
    try {
      return localStorage.getItem(SETTINGS_KEY);
    } catch {
      return null;
    }
  },
  write(settings: Settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
    settingsListeners.forEach((l) => l());
  },
};

function parseSettings(raw: string | null): Settings {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw ?? "{}") };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function ChapterPlayer({
  lang,
  chapter,
  translated,
  intro,
  verses,
  strings,
}: {
  lang: Lang;
  chapter: number;
  translated: boolean;
  intro?: { text: string; clip: PlayerClip };
  verses: PlayerVerse[];
  strings: Record<StringKey, string>;
}) {
  const rawSettings = useSyncExternalStore(settingsStore.subscribe, settingsStore.read, () => null);
  const settings = useMemo(() => parseSettings(rawSettings), [rawSettings]);
  const [cursor, setCursor] = useState<Cursor>({ verse: intro ? INTRO : 0, part: 0 });
  const [playing, setPlaying] = useState(false);
  // Highlight the cursor only once the listener has started playback.
  const [started, setStarted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const blobs = useRef(new Map<string, Promise<string>>());

  const updateSettings = (patch: Partial<Settings>) => settingsStore.write({ ...settings, ...patch });

  // Without a translation there is only the Sanskrit to listen to.
  const layers = translated ? settings : { ...settings, sanskrit: true };

  const partsOf = useCallback(
    (index: number): PlayerClip[] => {
      if (index === INTRO) return intro && layers.note ? [intro.clip] : [];
      const { clips } = verses[index];
      return [
        ...(layers.sanskrit ? [clips.sanskrit] : []),
        ...(layers.translation ? clips.translation : []),
        ...(layers.note && clips.note ? [clips.note] : []),
      ];
    },
    [intro, verses, layers.note, layers.sanskrit, layers.translation],
  );

  /** The cursor after `c`, or null at the end of the chapter. */
  const after = useCallback(
    (c: Cursor, repeat: boolean): Cursor | null => {
      if (c.part + 1 < partsOf(c.verse).length) return { verse: c.verse, part: c.part + 1 };
      if (repeat && c.verse !== INTRO) return { verse: c.verse, part: 0 };
      for (let v = c.verse + 1; v < verses.length; v++) if (partsOf(v).length) return { verse: v, part: 0 };
      return null;
    },
    [partsOf, verses.length],
  );

  const current = partsOf(cursor.verse)[cursor.part];

  /** Fetches audio once into a blob URL, so we can tell a missing API key from a network blip. */
  const load = useCallback((src: string) => {
    let pending = blobs.current.get(src);
    if (!pending) {
      pending = fetch(src).then(async (res) => {
        if (res.status === 503) throw new AudioUnavailableError();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return URL.createObjectURL(await res.blob());
      });
      pending.catch(() => blobs.current.delete(src));
      blobs.current.set(src, pending);
    }
    return pending;
  }, []);

  const advance = useCallback(() => {
    setCursor((c) => {
      const next = after(c, settings.repeat);
      if (!next) setPlaying(false);
      return next ?? c;
    });
  }, [after, settings.repeat]);

  // When a clip ends, hold a silence that fits the moment, then move on.
  const gapTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onEnded = () => {
    const next = after(cursor, settings.repeat);
    const nextClip = next && partsOf(next.verse)[next.part];
    const gap = current && nextClip ? gapBetween(current, nextClip, next.verse === cursor.verse) : 0;
    gapTimer.current = setTimeout(advance, gap / settings.rate);
  };
  useEffect(() => {
    if (!playing) clearTimeout(gapTimer.current);
  }, [playing]);
  useEffect(() => () => clearTimeout(gapTimer.current), []);

  // Play the current clip, and warm up the next two.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!playing || !current) {
      audio.pause();
      return;
    }
    let cancelled = false;
    load(current.src)
      .then((url) => {
        if (cancelled) return;
        if (audio.src !== url) audio.src = url;
        audio.playbackRate = settings.rate;
        audio.play().catch(() => {});
        setMessage(null);
      })
      .catch((error) => {
        if (cancelled) return;
        if (error instanceof AudioUnavailableError) {
          setMessage(strings.audioUnavailable);
          setPlaying(false);
        } else {
          setMessage(strings.audioError);
          advance();
        }
      });
    let ahead: Cursor | null = cursor;
    for (let i = 0; i < 2 && ahead; i++) {
      ahead = after(ahead, false);
      const clip = ahead && partsOf(ahead.verse)[ahead.part];
      if (clip) load(clip.src).catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [playing, current, cursor, after, partsOf, load, advance, settings.rate, strings]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = settings.rate;
  }, [settings.rate]);

  // Keep the verse being spoken in view.
  useEffect(() => {
    if (!playing) return;
    const id = cursor.verse === INTRO ? "intro" : `v${verses[cursor.verse].verse}`;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [playing, cursor.verse, verses]);

  const play = (on: boolean) => {
    setPlaying(on);
    if (on) setStarted(true);
  };
  const playFrom = (verse: number) => {
    clearTimeout(gapTimer.current);
    setCursor({ verse, part: 0 });
    play(true);
  };
  const stepVerse = (delta: number) => {
    let v = cursor.verse + delta;
    while (v >= 0 && v < verses.length && !partsOf(v).length) v += delta;
    if (v >= (intro ? INTRO : 0) && v < verses.length) {
      clearTimeout(gapTimer.current);
      setCursor({ verse: v, part: 0 });
    }
  };

  const speaker: VoiceRole = current?.role ?? (cursor.verse === INTRO ? "guide" : verses[cursor.verse].speaker);
  const reference = cursor.verse === INTRO ? strings.introduction : `${chapter}.${verses[cursor.verse].verse}`;

  // Lock-screen and headset controls.
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${strings.appName} ${reference}`,
      artist: CHARACTERS[speaker].name[lang],
      album: `${strings.chapter} ${chapter}`,
    });
    navigator.mediaSession.setActionHandler("play", () => play(true));
    navigator.mediaSession.setActionHandler("pause", () => setPlaying(false));
    navigator.mediaSession.setActionHandler("nexttrack", () => stepVerse(1));
    navigator.mediaSession.setActionHandler("previoustrack", () => stepVerse(-1));
  });

  return (
    <>
      {!translated && <p className="mb-6 rounded-2xl border border-line bg-card p-4 text-muted">{strings.notTranslated}</p>}

      {intro && (
        <section
          id="intro"
          style={{ "--speaker": CHARACTERS.guide.color } as React.CSSProperties}
          className={`mb-6 rounded-2xl border border-line bg-card p-5 transition ${cursor.verse === INTRO && started ? "verse-active" : ""}`}
        >
          <div className="mb-3 flex items-center gap-3">
            <Avatar role="guide" lang={lang} size="sm" />
            <span className="font-semibold">{strings.introduction}</span>
            <PlayHere label={strings.playFromHere} onClick={() => playFrom(INTRO)} />
          </div>
          {intro.text.split("\n").map((p, i) => (
            <p key={i} className={i === 0 ? "font-display text-lg font-bold" : "text-lg leading-relaxed"}>
              {p}
            </p>
          ))}
        </section>
      )}

      <ol className="space-y-5">
        {verses.map((v, index) => {
          const active = started && cursor.verse === index;
          const multiVoice = v.segments.some((s) => s.speaker !== v.speaker) || v.segments.length > 1;
          const translationStart = layers.sanskrit ? 1 : 0;
          return (
            <li
              key={v.verse}
              id={`v${v.verse}`}
              style={{ "--speaker": CHARACTERS[v.segments[0]?.speaker ?? v.speaker].color } as React.CSSProperties}
              className={`scroll-mt-24 rounded-2xl border border-line bg-card p-5 transition ${active ? "verse-active" : ""}`}
            >
              <div className="mb-4 flex items-center gap-3">
                <Avatar role={v.segments[0]?.speaker ?? v.speaker} lang={lang} size="sm" />
                <span className="font-semibold">{CHARACTERS[v.segments[0]?.speaker ?? v.speaker].name[lang]}</span>
                <span className="text-sm text-muted">
                  {chapter}.{v.verse}
                </span>
                <PlayHere label={strings.playFromHere} onClick={() => playFrom(index)} />
              </div>

              <div className={`space-y-1 ${active && current?.role === "reciter" ? "text-accent" : ""}`}>
                {v.sanskrit.map((line, i) => (
                  <p key={i} lang="sa" className="font-shloka text-xl leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
              <div className="mt-2 mb-4 space-y-0.5 text-sm text-muted italic">
                {v.transliteration.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>

              <div className="space-y-2">
                {v.segments.map((s, i) => {
                  const speaking = active && layers.translation && cursor.part === translationStart + i;
                  return (
                    <p
                      key={i}
                      className={`rounded-lg text-lg leading-relaxed transition ${speaking ? "-mx-2 px-2 py-1" : ""}`}
                      style={speaking ? { background: `color-mix(in oklab, ${CHARACTERS[s.speaker].color} 14%, transparent)` } : undefined}
                    >
                      {multiVoice && (
                        <span className="mr-2 font-semibold" style={{ color: CHARACTERS[s.speaker].color }}>
                          {CHARACTERS[s.speaker].name[lang]}:
                        </span>
                      )}
                      {s.text}
                    </p>
                  );
                })}
              </div>

              {v.note && (
                <div className="mt-4 flex gap-3 rounded-xl border border-line p-3 text-muted">
                  <Avatar role="guide" lang={lang} size="sm" />
                  <p>
                    <span className="font-semibold text-ink">{strings.layerNote}. </span>
                    {v.note}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <audio ref={audioRef} onEnded={onEnded} />

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 backdrop-blur">
        {message && <p className="mx-auto max-w-3xl px-4 pt-2 text-sm text-accent">{message}</p>}
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="relative">
              <Avatar role={speaker} lang={lang} />
              {playing && <SpeakingBars color={CHARACTERS[speaker].color} />}
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-semibold">{CHARACTERS[speaker].name[lang]}</span>
              <span className="block truncate text-sm text-muted">{reference}</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <IconButton label={strings.previous} onClick={() => stepVerse(-1)}>
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
            </IconButton>
            <button
              type="button"
              aria-label={playing ? strings.pause : strings.play}
              onClick={() => play(!playing)}
              className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-ink shadow-md"
            >
              <svg viewBox="0 0 24 24" className="size-6 fill-current" aria-hidden>
                {playing ? <path d="M6 5h4v14H6zm8 0h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}
              </svg>
            </button>
            <IconButton label={strings.next} onClick={() => stepVerse(1)}>
              <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" />
            </IconButton>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 text-sm sm:w-auto">
            {translated && (
              <>
                <Toggle on={settings.sanskrit} onClick={() => updateSettings({ sanskrit: !settings.sanskrit })} title={strings.experimentalSanskrit}>
                  {strings.layerSanskrit}
                </Toggle>
                <Toggle on={settings.translation} onClick={() => updateSettings({ translation: !settings.translation })}>
                  {strings.layerTranslation}
                </Toggle>
                <Toggle on={settings.note} onClick={() => updateSettings({ note: !settings.note })}>
                  {strings.layerNote}
                </Toggle>
              </>
            )}
            <Toggle on={settings.repeat} onClick={() => updateSettings({ repeat: !settings.repeat })} title={strings.repeat}>
              ↻
            </Toggle>
            <button
              type="button"
              aria-label={strings.speed}
              onClick={() => updateSettings({ rate: RATES[(RATES.indexOf(settings.rate) + 1) % RATES.length] })}
              className="rounded-full border border-line px-3 py-1 tabular-nums"
            >
              {settings.rate}×
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function PlayHere({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="ml-auto flex size-9 items-center justify-center rounded-full border border-line text-muted transition hover:border-accent hover:text-accent"
    >
      <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
        <path d="M8 5v14l11-7z" />
      </svg>
    </button>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className="flex size-10 items-center justify-center rounded-full text-muted hover:text-ink">
      <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
        {children}
      </svg>
    </button>
  );
}

function Toggle({ on, onClick, title, children }: { on: boolean; onClick: () => void; title?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      title={title}
      onClick={onClick}
      className={`rounded-full border px-3 py-1 transition ${on ? "border-accent bg-accent/15 text-ink" : "border-line text-muted"}`}
    >
      {children}
    </button>
  );
}

function SpeakingBars({ color }: { color: string }) {
  return (
    <span className="absolute -right-1 -bottom-1 flex h-4 items-end gap-px rounded bg-card px-0.5" aria-hidden>
      {[0, 0.2, 0.4].map((delay) => (
        <span key={delay} className="speaking-bar w-1 rounded-sm" style={{ height: "100%", background: color, animationDelay: `${delay}s` }} />
      ))}
    </span>
  );
}
