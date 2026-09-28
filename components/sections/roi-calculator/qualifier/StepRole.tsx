'use client';

import type { Role } from '@/lib/roi-calculator/types';
import { roleFraming } from '@/lib/roi-calculator/presets';

interface Props {
  onSelect: (role: Role) => void;
  onBack: () => void;
}

const ROLES: Role[] = ['executive', 'finance', 'operations', 'business_leader', 'strategy_product'];

export function StepRole({ onSelect, onBack }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#140f0c] mb-2 text-center">
        Which role best matches you?
      </h2>
      <p className="text-[#140f0c]/55 mb-8 text-center">
        We&#39;ll highlight the metrics most relevant to your priorities.
      </p>

      <div className="grid gap-3">
        {ROLES.map((role) => {
          const framing = roleFraming[role];
          return (
            <button
              key={role}
              onClick={() => onSelect(role)}
              className="group w-full text-left p-5 border-2 border-[#140f0c]/10
                         hover:border-[#3b84ff] hover:bg-[#3b84ff]/4
                         transition-all duration-200"
              style={{ borderRadius: 8 }}
            >
              <div className="font-medium text-[#140f0c] group-hover:text-[#3b84ff] transition-colors">
                {framing.defaultLabel}
              </div>
              <div className="text-sm text-[#140f0c]/50 mt-0.5">
                {framing.description}
              </div>
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