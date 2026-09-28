'use client';

import { useState, useRef, useEffect } from 'react';
import { formatAum } from '@/lib/roi-calculator/format';

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export const AUM_MIN = 1_000_000_000;
export const AUM_MAX = 500_000_000_000;
const LOG_MIN = Math.log10(AUM_MIN);
const LOG_MAX = Math.log10(AUM_MAX);
const SLIDER_STEPS = 500;

export function aumToSlider(aum: number): number {
  const clamped = Math.max(AUM_MIN, Math.min(AUM_MAX, aum));
  return Math.round(
    ((Math.log10(clamped) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * SLIDER_STEPS,
  );
}

export function sliderToAum(pos: number): number {
  const logVal = LOG_MIN + (pos / SLIDER_STEPS) * (LOG_MAX - LOG_MIN);
  const raw = Math.pow(10, logVal);
  if (raw >= 100_000_000_000) return Math.round(raw / 10_000_000_000) * 10_000_000_000;
  if (raw >= 50_000_000_000) return Math.round(raw / 5_000_000_000) * 5_000_000_000;
  if (raw >= 5_000_000_000) return Math.round(raw / 1_000_000_000) * 1_000_000_000;
  return Math.round(raw / 250_000_000) * 250_000_000;
}

export function AumInput({ value, onChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const handleCommit = () => {
    const parsed = Number(editValue);
    if (!isNaN(parsed) && parsed >= AUM_MIN) {
      onChange(Math.min(AUM_MAX, parsed));
    }
    setEditing(false);
  };

  const sliderPos = aumToSlider(value);
  const pct = (sliderPos / SLIDER_STEPS) * 100;

  return (
    <div className="py-2">
      <label className="text-sm text-[#140f0c]/70 block mb-1.5">
        Assets under management (AUM)
      </label>

      {editing ? (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#140f0c]/40">
            $
          </span>
          <input
            ref={inputRef}
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCommit();
            }}
            step={250_000_000}
            min={AUM_MIN}
            className="w-full text-sm font-semibold text-[#3b84ff] bg-[#3b84ff]/8
                       border border-[#3b84ff]/30 pl-7 pr-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-[#3b84ff]/40"
            style={{ borderRadius: 6 }}
          />
        </div>
      ) : (
        <button
          onClick={() => {
            setEditValue(String(value));
            setEditing(true);
          }}
          className="w-full text-left text-xl font-bold text-[#3b84ff]
                     bg-[#3b84ff]/8 border border-[#3b84ff]/25 px-4 py-2
                     hover:bg-[#3b84ff]/12 transition-colors cursor-text"
          style={{ borderRadius: 6 }}
        >
          {formatAum(value)}
        </button>
      )}

      <div className="relative h-5 flex items-center mt-2">
        <div className="absolute left-0 right-0 h-1.5 rounded-full bg-[#140f0c]/12" />
        <div
          className="absolute left-0 h-1.5 rounded-full bg-[#3b84ff] pointer-events-none"
          style={{ width: `calc(${pct}% + ${8 * (1 - (2 * pct) / 100)}px)` }}
        />
        <input
          type="range"
          value={sliderPos}
          onChange={(e) => onChange(sliderToAum(Number(e.target.value)))}
          min={0}
          max={SLIDER_STEPS}
          step={1}
          className="relative w-full h-5 appearance-none bg-transparent cursor-pointer z-10"
        />
      </div>
      <div className="flex justify-between text-xs text-[#140f0c]/50 mt-0.5 font-medium">
        <span>$1B</span>
        <span>$500B</span>
      </div>
    </div>
  );
}