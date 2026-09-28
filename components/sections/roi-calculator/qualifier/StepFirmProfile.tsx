'use client';

import type { FirmProfile } from '@/lib/roi-calculator/types';
import { profilePresets } from '@/lib/roi-calculator/presets';

interface Props {
  onSelect: (fp: FirmProfile) => void;
}

const PROFILES: FirmProfile[] = ['ria_hybrid', 'advisor_platform', 'private_wealth', 'asset_manager'];

export function StepFirmProfile({ onSelect }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#140f0c] mb-2 text-center">
        Which firm profile best matches your business?
      </h2>
      <p className="text-[#140f0c]/55 mb-8 text-center">
        This helps us tailor assumptions, terminology, and examples.
      </p>

      <div className="grid gap-3">
        {PROFILES.map((fp) => {
          const preset = profilePresets[fp];
          return (
            <button
              key={fp}
              onClick={() => onSelect(fp)}
              className="group w-full text-left p-5 border-2 border-[#140f0c]/10
                         hover:border-[#3b84ff] hover:bg-[#3b84ff]/4
                         transition-all duration-200"
              style={{ borderRadius: 8 }}
            >
              <div className="font-medium text-[#140f0c] group-hover:text-[#3b84ff] transition-colors">
                {preset.label}
              </div>
              <div className="text-sm text-[#140f0c]/50 mt-0.5">
                {preset.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}