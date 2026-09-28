"use client";

import { useEffect, useRef, useState } from "react";

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  authorName?: string;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({ audioUrl, title, authorName }: AudioPlayerProps) {
  const audioRef               = useRef<HTMLAudioElement>(null);
  const progressRef            = useRef<HTMLDivElement>(null);
  const [playing, setPlaying]  = useState(false);
  const [current, setCurrent]  = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume]    = useState(1);
  const [muted, setMuted]      = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1); // default 1x
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  // If metadata already loaded (cached page), set immediately
  if (audio.readyState >= 1) {
    setDuration(audio.duration);
  }

  const onTime         = () => { if (!dragging) setCurrent(audio.currentTime) };
  const onDuration     = () => setDuration(audio.duration);
  const onDurationChange = () => setDuration(audio.duration);
  const onEnded        = () => setPlaying(false);

  audio.addEventListener("timeupdate", onTime);
  audio.addEventListener("loadedmetadata", onDuration);
  audio.addEventListener("durationchange", onDurationChange);
  audio.addEventListener("ended", onEnded);

  return () => {
    audio.removeEventListener("timeupdate", onTime);
    audio.removeEventListener("loadedmetadata", onDuration);
    audio.removeEventListener("durationchange", onDurationChange);
    audio.removeEventListener("ended", onEnded);
  };
}, [dragging]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    const bar   = progressRef.current;
    if (!audio || !bar) return;
    const rect = bar.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * duration;
    setCurrent(pct * duration);
  }

  function skip(seconds: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  }

  function cycleSpeed() {
    const audio = audioRef.current;
    if (!audio) return;
    const next = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(next);
    audio.playbackRate = SPEEDS[next];
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    const v = parseFloat(e.target.value);
    setVolume(v);
    audio.volume = v;
    setMuted(v === 0);
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !muted;
    setMuted(next);
    audio.muted = next;
  }

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div className="bg-white shadow-[0_4px_24px_rgba(0,0,0,0.10)] px-6 py-5">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Top row: label + time */}
      <div className="flex items-start justify-between mb-3">
        <div>
          {title && (
            <p className="text-sm font-bold text-[#140f0c] leading-tight">{title}</p>
          )}
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#fb5607] mt-0.5">
            {authorName ? `Narrated · ${authorName}` : "Listen to this article"}
          </p>
        </div>
        <span className="text-xs text-gray-400 tabular-nums shrink-0 ml-4 mt-0.5">
          {formatTime(current)} / {formatTime(duration)}
        </span>
      </div>

      {/* Progress bar */}
      <div
        ref={progressRef}
        onClick={seek}
        className="relative h-1.5 w-full cursor-pointer mb-4 bg-gray-200"
      >
        {/* Filled portion — gradient */}
        <div
          className="absolute inset-y-0 left-0 transition-none"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(135deg, #FACC22, #FB5607, #4760FF, #0DCCFF)",
          }}
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-[#140f0c] border-2 border-white shadow"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-3">

        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          className="h-11 w-11 shrink-0 flex items-center justify-center bg-[#140f0c] text-white hover:bg-[#1a1410] transition-colors"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="5" y="3" width="4" height="18" rx="1" />
              <rect x="15" y="3" width="4" height="18" rx="1" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Skip back 10s */}
        <button
          onClick={() => skip(-10)}
          className="text-gray-400 hover:text-[#140f0c] transition-colors"
          aria-label="Back 10 seconds"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
            <text x="8.5" y="15" fontSize="5.5" fontFamily="sans-serif" fontWeight="bold" fill="currentColor">10</text>
          </svg>
        </button>

        {/* Skip forward 30s */}
        <button
          onClick={() => skip(30)}
          className="text-gray-400 hover:text-[#140f0c] transition-colors"
          aria-label="Forward 30 seconds"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
            <text x="8.5" y="15" fontSize="5.5" fontFamily="sans-serif" fontWeight="bold" fill="currentColor">30</text>
          </svg>
        </button>

        {/* Playback speed */}
        <button
          onClick={cycleSpeed}
          className="text-xs font-bold text-gray-400 hover:text-[#140f0c] transition-colors tabular-nums w-10 text-left"
          aria-label="Cycle playback speed"
        >
          {SPEEDS[speedIdx]}x
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Volume icon */}
        <button
          onClick={toggleMute}
          className="text-gray-400 hover:text-[#140f0c] transition-colors shrink-0"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted || volume === 0 ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17.73 18L19 19.27 20.27 18 5.27 3 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
          )}
        </button>

        {/* Volume slider */}
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={handleVolume}
          className="w-20 h-1 accent-[#4760FF] cursor-pointer"
          aria-label="Volume"
        />
      </div>
    </div>
  );
}