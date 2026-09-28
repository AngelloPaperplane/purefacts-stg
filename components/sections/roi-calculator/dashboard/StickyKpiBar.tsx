'use client';

import { useState, useEffect, useRef } from 'react';
import type { ModelOutputs } from '@/lib/roi-calculator/types';
import { formatMillions, formatCompact } from '@/lib/roi-calculator/format';

interface Props {
  outputs: ModelOutputs;
  heroRef: React.RefObject<HTMLElement | null>;
}

const kpis: { label: string; getValue: (o: ModelOutputs) => string }[] = [
  { label: 'Avg. Recovery', getValue: (o) => formatMillions(o.avgAnnualRevenueRecovery) },
  { label: 'Avg. Ops Savings', getValue: (o) => formatCompact(o.avgAnnualOpsSavings) },
  { label: '5Y EBITDA', getValue: (o) => formatMillions(o.fiveYearCumulativeNetEbitda) },
  { label: 'Y5 EV Uplift', getValue: (o) => formatMillions(o.year5EvUplift) },
];

export function StickyKpiBar({ outputs: _outputs, heroRef: _heroRef }: Props) {
  // Removed: was causing a persistent gap below the context bar even when hidden.
  // Re-enable if a sticky summary bar is needed in future.
  return null;
}