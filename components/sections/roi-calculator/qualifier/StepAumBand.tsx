'use client';

import type { AumBand } from '@/lib/roi-calculator/types';
import { aumBandConfigs } from '@/lib/roi-calculator/presets';

interface Props {
  onSelect: (ab: AumBand) => void;
  onBack: () => void;
}

const BANDS: AumBand[] = ['5b_10b', '10b_25b', '25b_100b', 'over_100b'];

export function StepAumBand({ onSelect, onBack }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#140f0c] mb-2 text-center">
        What is your AUM range?
      </h2>
      <p className="text-[#140f0c]/55 mb-8 text-center">
        This helps tailor the model scale and planning defaults.
      </p>

      <div className="grid gap-3">
        {BANDS.map((band) => {
          const config = aumBandConfigs[band];
          return (
            <button
              key={band}
              onClick={() => onSelect(band)}
              className="group w-full text-left p-5 border-2 border-[#140f0c]/10
                         hover:border-[#3b84ff] hover:bg-[#3b84ff]/4
                         transition-all duration-200"
              style={{ borderRadius: 8 }}
            >
              <div className="font-medium text-[#140f0c] group-hover:text-[#3b84ff] transition-colors">
                {config.label}
              </div>
              {config.description && (
                <div className="text-sm text-[#140f0c]/50 mt-0.5">{config.description}</div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex">
        <button
          onClick={onBack}
          className="text-sm text-[#140f0c]/40 hover:text-[#3b84ff] flex items-center gap-1 transition-colors"
        >
          <span className="text-base leading-none">&larr;</span> Back
        </button>
      </div>
    </div>
  );
}