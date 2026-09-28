'use client';

import { forwardRef } from 'react';
import type { ModelOutputs, RoleFraming } from '@/lib/roi-calculator/types';
import { formatMillions, formatCompact, formatRoi } from '@/lib/roi-calculator/format';
import { useCountUp } from '@/hooks/useCountUp';
import { useFadeIn } from '@/hooks/useFadeIn';

interface Props {
  outputs: ModelOutputs;
  role: RoleFraming;
  highlightedOutputs: string[];
}

function interpolateSummary(template: string, outputs: ModelOutputs): string {
  return template
    .replace('{fiveYearCumulativeNetEbitda}', formatMillions(outputs.fiveYearCumulativeNetEbitda))
    .replace('{year5EvUplift}', formatMillions(outputs.year5EvUplift))
    .replace('{year5LeakageRecovery}', formatMillions(outputs.year5LeakageRecovery))
    .replace('{year5PricingUplift}', formatMillions(outputs.year5PricingUplift))
    .replace('{avgAnnualRevenueRecovery}', formatMillions(outputs.avgAnnualRevenueRecovery))
    .replace('{avgAnnualOpsSavings}', formatCompact(outputs.avgAnnualOpsSavings))
    .replace('{roiMultiple}', formatRoi(outputs.roiMultiple));
}

function AnimatedValue({ value, formatter }: { value: number; formatter: (v: number) => string }) {
  const animated = useCountUp(value);
  return <>{formatter(animated)}</>;
}

const heroCards: {
  key: string;
  label: string;
  getRawValue: (o: ModelOutputs) => number;
  format: (v: number) => string;
  getSubtitle: (o: ModelOutputs) => string;
}[] = [
  {
    key: 'avgAnnualRevenueRecovery',
    label: 'Avg. Annual Revenue Recovery',
    getRawValue: (o) => o.avgAnnualRevenueRecovery,
    format: formatMillions,
    getSubtitle: () => '5-year average of recovered leakage revenue',
  },
  {
    key: 'avgAnnualOpsSavings',
    label: 'Avg. Annual Ops Savings',
    getRawValue: (o) => o.avgAnnualOpsSavings,
    format: formatCompact,
    getSubtitle: () => 'Annual billing & comp efficiency improvement',
  },
  {
    key: 'fiveYearCumulativeNetEbitda',
    label: '5-Year EBITDA Impact',
    getRawValue: (o) => o.fiveYearCumulativeNetEbitda,
    format: formatMillions,
    getSubtitle: () => 'Cumulative incremental EBITDA, Y1 to Y5',
  },
  {
    key: 'year5EvUplift',
    label: 'Year 5 EV Uplift',
    getRawValue: (o) => o.year5EvUplift,
    format: formatMillions,
    getSubtitle: () => 'Based on Year 5 incremental EBITDA at 10x',
  },
];

export const ExecutiveSummary = forwardRef<HTMLElement, Props>(
  function ExecutiveSummary({ outputs, role, highlightedOutputs }, ref) {
    const summary = interpolateSummary(role.summaryTemplate, outputs);
    const isHighlighted = (key: string) => highlightedOutputs.includes(key);
    const fade = useFadeIn();

    return (
      <section ref={ref}>
        <div
          ref={fade.ref}
          className={`bg-[#1c1712] p-5 sm:p-6 mb-5 transition-opacity duration-500 ${fade.visible ? 'opacity-100' : 'opacity-0'}`}
          style={{ borderRadius: 10 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {heroCards.map((card) => {
              const hl = isHighlighted(card.key);
              return (
                <div
                  key={card.key}
                  className={`p-4 text-center transition-all ${
                    hl
                      ? 'bg-white border-2 border-[#3b84ff]'
                      : 'bg-white/[0.07] border border-white/[0.10]'
                  }`}
                  style={{ borderRadius: 8 }}
                >
                  <div className={`text-[11px] font-medium mb-1.5 uppercase tracking-wider ${
                    hl ? 'text-[#140f0c]/60' : 'text-[#f4f4f4]/65'
                  }`}>
                    {card.label}
                  </div>
                  <div className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                    hl ? 'text-[#140f0c]' : 'text-[#f4f4f4]'
                  }`}>
                    <AnimatedValue value={card.getRawValue(outputs)} formatter={card.format} />
                  </div>
                  <div className={`text-[10px] mt-1.5 leading-tight ${
                    hl ? 'text-[#140f0c]/40' : 'text-[#f4f4f4]/55'
                  }`}>
                    {card.getSubtitle(outputs)}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[#f4f4f4]/70 text-xs leading-relaxed mt-4">{summary}</p>
        </div>
      </section>
    );
  },
);