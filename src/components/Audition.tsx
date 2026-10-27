"use client";

import { useRef, useState } from "react";

/** Buttons that play a role's sample line in each candidate voice. */
export function Audition({ lang, role, speakers, current, currentLabel }: {
  lang: string;
  role: string;
  speakers: string[];
  current: string;
  currentLabel: string;
}) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  const play = (speaker: string) => {
    const el = audio.current!;
    if (playing === speaker) {
      el.pause();
      setPlaying(null);
      return;
    }
    setFailed(null);
    el.src = `/api/tts?lang=${lang}&role=${role}&speaker=${speaker}`;
    el.play().then(
      () => setPlaying(speaker),
      () => setFailed(speaker),
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {speakers.map((speaker) => (
        <button
          key={speaker}
          type="button"
          onClick={() => play(speaker)}
          className={`rounded-full border px-3 py-1 text-sm transition ${
            playing === speaker ? "border-accent bg-accent text-accent-ink" : "border-line hover:border-accent"
          } ${failed === speaker ? "line-through opacity-60" : ""}`}
        >
          {playing === speaker ? "■" : "▶"} {speaker}
          {speaker === current && <span className="ml-1 opacity-70">({currentLabel})</span>}
        </button>
      ))}
      <audio ref={audio} onEnded={() => setPlaying(null)} onError={() => (setFailed(playing), setPlaying(null))} />
    </div>
  );
}
