'use client';

import { useState, useEffect } from 'react';

interface Props {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
}

export function SliderInput({ label, value, onChange, min, max, step, unit }: Props) {
  // Local text state allows free typing without clamping mid-input
  const [inputText, setInputText] = useState(String(value));
  const [focused, setFocused] = useState(false);

  // Keep display in sync when value changes externally (e.g. slider drag, reset)
  useEffect(() => {
    if (!focused) setInputText(String(value));
  }, [value, focused]);

  const commit = (raw: string) => {
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      // Round to nearest step, then clamp
      const stepped = Math.round(parsed / step) * step;
      const clamped = Math.min(max, Math.max(min, stepped));
      onChange(clamped);
      setInputText(String(clamped));
    } else {
      // Invalid input — revert to last known good value
      setInputText(String(value));
    }
  };

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm text-[#140f0c]/70">{label}</label>
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            inputMode="decimal"
            value={inputText}
            onFocus={(e) => {
              setFocused(true);
              e.target.select();
            }}
            onChange={(e) => setInputText(e.target.value)}
            onBlur={() => {
              setFocused(false);
              commit(inputText);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commit(inputText);
                (e.target as HTMLInputElement).blur();
              }
              // Arrow up/down nudge by step
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                const next = Math.min(max, value + step);
                onChange(next);
                setInputText(String(next));
              }
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                const next = Math.max(min, value - step);
                onChange(next);
                setInputText(String(next));
              }
            }}
            className="w-20 text-right text-sm font-semibold text-[#3b84ff] bg-[#3b84ff]/8
                       border border-[#3b84ff]/25 px-2 py-1.5
                       focus:outline-none focus:ring-2 focus:ring-[#3b84ff]/40"
            style={{ borderRadius: 6 }}
          />
          <span className="text-xs text-[#140f0c]/40 w-8">{unit}</span>
        </div>
      </div>
      <div className="relative h-5 flex items-center">
        {/* Track background */}
        <div className="absolute left-0 right-0 h-1.5 rounded-full bg-[#140f0c]/12" />
        {/* Filled portion — offset compensates for thumb radius so fill meets dot exactly */}
        <div
          className="absolute left-0 h-1.5 rounded-full bg-[#3b84ff] pointer-events-none"
          style={{ width: `calc(${pct}% + ${8 * (1 - (2 * pct) / 100)}px)` }}
        />
        <input
          type="range"
          value={value}
          onChange={(e) => {
            const v = Number(e.target.value);
            onChange(v);
            if (!focused) setInputText(String(v));
          }}
          min={min}
          max={max}
          step={step}
          className="relative w-full h-5 appearance-none bg-transparent cursor-pointer z-10"
        />
      </div>
    </div>
  );
}