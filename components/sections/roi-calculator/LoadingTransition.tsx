'use client';

import { useState, useEffect, useRef } from 'react';
import type { QualifierSelection } from '@/lib/roi-calculator/types';
import { profilePresets, getRoleLabel } from '@/lib/roi-calculator/presets';

interface Props {
  qualifier: QualifierSelection;
  onComplete: () => void;
}

const DURATION = 3000;
const TICK = 50;

function useIrregularProgress(duration: number, tick: number): number {
  const [progress, setProgress] = useState(0);
  const elapsed = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      elapsed.current += tick;
      const t = elapsed.current / duration;
      let p: number;
      if (t < 0.3) { p = t * 1.8; }
      else if (t < 0.7) { p = 0.54 + (t - 0.3) * 0.6; }
      else { p = 0.78 + (t - 0.7) * 1.4; }
      const clamped = Math.min(p, 1);
      setProgress(clamped);
      if (elapsed.current >= duration) { clearInterval(interval); setProgress(1); }
    }, tick);
    return () => clearInterval(interval);
  }, [duration, tick]);

  return progress;
}

export function LoadingTransition({ qualifier, onComplete }: Props) {
  const progress = useIrregularProgress(DURATION, TICK);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (progress >= 1) {
      setFading(true);
      const t = setTimeout(onComplete, 400);
      return () => clearTimeout(t);
    }
  }, [progress, onComplete]);

  const profileLabel = profilePresets[qualifier.firmProfile].label;
  const roleLabel = getRoleLabel(qualifier.role);

  return (
    <div
      className={`min-h-[70vh] bg-[#f4f4f4] flex items-center justify-center p-6 transition-opacity duration-400 ${fading ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#3b84ff]/12 mb-5">
            <svg
              className="w-7 h-7 text-[#3b84ff] animate-spin"
              style={{ animationDuration: '2.5s' }}
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-80" d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-[#140f0c] mb-2">
            Building your enterprise value model...
          </h2>
          <p className="text-sm text-[#140f0c]/50">
            {profileLabel} &middot; {roleLabel}
          </p>
        </div>

        <div className="w-full h-1.5 bg-[#140f0c]/12 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#3b84ff] rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <p className="text-xs text-[#140f0c]/35 mt-3">
          Tailoring assumptions and projections for your firm
        </p>
      </div>
    </div>
  );
}
