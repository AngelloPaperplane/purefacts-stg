'use client';

import type { FirmChallenge } from '@/lib/roi-calculator/types';
import { firmChallengeOptions } from '@/lib/roi-calculator/content';

interface Props {
  selected: FirmChallenge[];
  onToggle: (value: FirmChallenge) => void;
  onContinue: () => void;
  onBack: () => void;
}

const CHALLENGE_GROUPS: { title: string; values: FirmChallenge[] }[] = [
  {
    title: 'Revenue integrity',
    values: ['revenue_leakage', 'pricing_complexity', 'reporting_visibility'],
  },
  {
    title: 'Operating complexity',
    values: ['fragmented_data', 'legacy_tech', 'compensation_complexity'],
  },
  {
    title: 'Scale and control',
    values: ['mna_integration', 'scaling_operations', 'regulatory_pressure'],
  },
];

const optionsByValue = Object.fromEntries(
  firmChallengeOptions.map((option) => [option.value, option]),
) as Record<FirmChallenge, (typeof firmChallengeOptions)[number]>;

export function StepChallenges({ selected, onToggle, onContinue, onBack }: Props) {
  const hasSelection = selected.length > 0;

  return (
    <div>
      <button
        onClick={onBack}
        className="text-sm text-[#140f0c]/40 hover:text-[#3b84ff] mb-6 flex items-center gap-1 transition-colors"
      >
        <span className="text-base leading-none">&larr;</span> Back
      </button>

      <h2 className="text-2xl font-semibold text-[#140f0c] mb-2 text-center">
        What types of problems does your firm face today?
      </h2>
      <p className="text-[#140f0c]/55 mb-6 text-center">
        Select all that apply. We&#39;ll use this to tailor your business case and follow-up context.
      </p>

      <div className="grid gap-4 lg:grid-cols-3">
        {CHALLENGE_GROUPS.map((group) => (
          <section
            key={group.title}
            className="border border-[#140f0c]/8 bg-[#f4f4f4] p-3"
            style={{ borderRadius: 8 }}
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#140f0c]/40 mb-2">
              {group.title}
            </h3>
            <div className="grid gap-2">
              {group.values.map((value) => {
                const option = optionsByValue[value];
                const isSelected = selected.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onToggle(value)}
                    className={`group w-full text-left p-3 border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-[#3b84ff] bg-white shadow-sm'
                        : 'border-white bg-white/80 hover:border-[#3b84ff] hover:bg-white'
                    }`}
                    style={{ borderRadius: 6 }}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`mt-0.5 h-4 w-4 border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-[#3b84ff] border-[#3b84ff]'
                            : 'border-[#140f0c]/25 bg-white'
                        }`}
                        aria-hidden="true"
                      >
                        {isSelected && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#140f0c] group-hover:text-[#3b84ff] leading-snug transition-colors">
                          {option.label}
                        </div>
                        <div className="text-xs text-[#140f0c]/50 mt-1 leading-snug">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="text-sm text-[#140f0c]/40 hover:text-[#3b84ff] flex items-center gap-1 transition-colors"
        >
          <span className="text-base leading-none">&larr;</span> Back
        </button>
        <div className="flex items-center gap-3">
          <p className="text-xs text-[#140f0c]/40">
            {hasSelection ? `${selected.length} selected` : 'Choose at least one'}
          </p>
          <button
            type="button"
            onClick={onContinue}
            disabled={!hasSelection}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}