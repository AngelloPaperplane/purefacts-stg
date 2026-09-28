'use client';

import type { ModelOutputs } from '@/lib/roi-calculator/types';
import { formatMillions, formatMarginExpansion } from '@/lib/roi-calculator/format';
import { useFadeIn } from '@/hooks/useFadeIn';

interface Props {
  outputs: ModelOutputs;
  highlightedOutputs: string[];
}

const cards: {
  key: string;
  label: string;
  getValue: (o: ModelOutputs) => string;
  note: string;
  accentColor: string;
}[] = [
  { key: 'year5NetIncrementalEbitda', label: 'Year 5 EBITDA Impact', getValue: (o) => formatMillions(o.year5NetIncrementalEbitda), note: 'Annual incremental EBITDA', accentColor: '#3b84ff' },
  { key: 'year5EbitdaMarginExpansionBps', label: 'EBITDA Margin Expansion', getValue: (o) => formatMarginExpansion(o.year5EbitdaMarginExpansionBps), note: 'Year 5 vs baseline margin', accentColor: '#4760FF' },
  { key: 'year5LeakageRecovery', label: 'Year 5 Recoverable Revenue', getValue: (o) => formatMillions(o.year5LeakageRecovery), note: 'Annual leakage recovery', accentColor: '#0DCCFF' },
  { key: 'year5PricingUplift', label: 'Year 5 Pricing Uplift', getValue: (o) => formatMillions(o.year5PricingUplift), note: 'Annual net pricing alignment benefit', accentColor: '#ffb30c' },
  { key: 'year5AdvisorPayoutOnIncremental', label: 'Year 5 Advisor Comp. Unlocked', getValue: (o) => formatMillions(o.year5AdvisorPayoutOnIncremental), note: 'Additional advisor payout from captured revenue', accentColor: '#fb5607' },
];

export function SecondaryKpiGrid({ outputs, highlightedOutputs }: Props) {
  const isHl = (key: string) => highlightedOutputs.includes(key);
  const fade = useFadeIn();

  return (
    <div
      ref={fade.ref}
      className={`grid grid-cols-2 md:grid-cols-3 gap-3 transition-opacity duration-500 ${fade.visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {cards.map((c) => (
        <div
          key={c.key}
          className={`border px-4 py-3.5 transition-all ${
            isHl(c.key)
              ? 'bg-[#3b84ff]/5 border-[#3b84ff]/20'
              : 'bg-white border-[#140f0c]/10'
          }`}
          style={{ borderRadius: 10, borderLeftWidth: 3, borderLeftColor: c.accentColor }}
        >
          <div className="text-[11px] text-[#140f0c]/40 leading-tight mb-1.5 font-medium uppercase tracking-wider">
            {c.label}
          </div>
          <div className={`text-xl font-bold ${isHl(c.key) ? 'text-[#3b84ff]' : 'text-[#140f0c]'}`}>
            {c.getValue(outputs)}
          </div>
          <div className="text-[10px] text-[#140f0c]/35 mt-1">{c.note}</div>
        </div>
      ))}
    </div>
  );
}