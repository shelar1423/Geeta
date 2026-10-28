"use client";

import { useRef, useState } from "react";

export interface AuditionSample {
  speaker: string;
  src: string;
}

/** Buttons that play a role's sample line in each candidate voice. */
export function Audition({ samples, current, currentLabel }: {
  samples: AuditionSample[];
  current: string;
  currentLabel: string;
}) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  const play = ({ speaker, src }: AuditionSample) => {
    const el = audio.current!;
    if (playing === speaker) {
      el.pause();
      setPlaying(null);
      return;
    }
    setFailed(null);
    el.src = src;
    el.play().then(
      () => setPlaying(speaker),
      () => setFailed(speaker),
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {samples.map((sample) => (
        <button
          key={sample.speaker}
          type="button"
          onClick={() => play(sample)}
          className={`rounded-full border px-3 py-1 text-sm transition ${
            playing === sample.speaker ? "border-accent bg-accent text-accent-ink" : "border-line hover:border-accent"
          } ${failed === sample.speaker ? "line-through opacity-60" : ""}`}
        >
          {playing === sample.speaker ? "■" : "▶"} {sample.speaker}
          {sample.speaker === current && <span className="ml-1 opacity-70">({currentLabel})</span>}
        </button>
      ))}
      <audio ref={audio} onEnded={() => setPlaying(null)} onError={() => (setFailed(playing), setPlaying(null))} />
    </div>
  );
}
