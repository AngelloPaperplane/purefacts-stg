'use client';

import { useState } from 'react';
import type { YearlyOutput, ModelParameters } from '@/lib/roi-calculator/types';
import { formatCompact, formatPct, formatBps } from '@/lib/roi-calculator/format';
import { useFadeIn } from '@/hooks/useFadeIn';

interface Props {
  schedule: YearlyOutput[];
  params: ModelParameters;
}

type Tab = 'yearly' | 'methodology';

export function ModelDetails({ schedule, params }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [tab, setTab] = useState<Tab>('yearly');
  const fade = useFadeIn();

  return (
    <div
      ref={fade.ref}
      className={`bg-white border border-[#140f0c]/10 overflow-hidden transition-opacity duration-500 ${fade.visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ borderRadius: 10 }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-3.5 text-left flex items-center justify-between hover:bg-[#f4f4f4] transition-colors"
      >
        <span className="text-sm font-semibold text-[#140f0c]">Model Details</span>
        <svg
          className={`w-4 h-4 text-[#140f0c]/35 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-[#140f0c]/8">
          <div className="flex border-b border-[#140f0c]/8">
            {(['yearly', 'methodology'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2.5 text-xs font-medium transition-colors capitalize ${
                  tab === t
                    ? 'text-[#3b84ff] border-b-2 border-[#3b84ff] -mb-px'
                    : 'text-[#140f0c]/40 hover:text-[#140f0c]'
                }`}
              >
                {t === 'yearly' ? 'Year-by-Year' : 'Methodology'}
              </button>
            ))}
          </div>

          {tab === 'yearly' && (
            <div className="px-5 pt-4 pb-4 overflow-x-auto">
              <table className="w-full text-xs min-w-[640px]">
                <thead>
                  <tr className="text-[#140f0c]/40">
                    <th className="py-2 pr-3 text-left font-medium">Metric</th>
                    {schedule.map((r) => (
                      <th key={r.year} className="py-2 px-2 text-right font-medium">Year {r.year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-[#140f0c]/80">
                  <SectionHeader label="Baseline" cols={schedule.length} color="#3b84ff" />
                  <Row label="Projected AUM" rows={schedule} accessor={(r) => r.projectedAum} />
                  <Row label="Baseline Revenue" rows={schedule} accessor={(r) => r.baselineRevenue} />
                  <Row label="Baseline EBITDA" rows={schedule} accessor={(r) => r.baselineEbitda} bold />

                  <SectionHeader label="Value Creation" cols={schedule.length} color="#4760FF" />
                  <Row label="Leakage Recovery" rows={schedule} accessor={(r) => r.leakageRevenueRealized} />
                  <Row label="Pricing Uplift (net)" rows={schedule} accessor={(r) => r.netPricingUplift} />
                  <Row label="Ops Efficiency Savings" rows={schedule} accessor={(r) => r.opsSavingsRealized} />
                  <Row label="Total Incremental Revenue" rows={schedule} accessor={(r) => r.incrementalRevenue} bold />

                  <SectionHeader label="EBITDA Impact" cols={schedule.length} color="#fb5607" />
                  <Row label="Advisor Payout" rows={schedule} accessor={(r) => r.advisorPayoutOnIncremental} dim />
                  <Row label="Incremental EBITDA" rows={schedule} accessor={(r) => r.grossIncrementalEbitda} bold />
                  <Row label="Total EBITDA" rows={schedule} accessor={(r) => r.totalEbitda} bold />
                  <Row label="EV Uplift" rows={schedule} accessor={(r) => r.evUpliftFromPF} />
                </tbody>
              </table>
            </div>
          )}

          {tab === 'methodology' && (
            <div className="px-5 py-5">
              <ul className="space-y-3 text-xs text-[#140f0c]/55 leading-relaxed">
                <MethodItem title="Baseline Projections" text="Uses your AUM, fee rate, organic growth rate, and EBITDA margin to project 5 years of baseline revenue and EBITDA." />
                <MethodItem title="Revenue Leakage Recovery" text={`Estimated as a % of gross revenue, recovered over a ramp schedule (${params.recoveryRamp.join('/')}% across Y1 to Y5).`} />
                <MethodItem title="Pricing Uplift" text={`Assumes ${formatBps(params.pricingUpliftBps)} improvement on ${formatPct(params.annualRepricingRate)} of the original AUM book repriced annually, net of ${formatPct(params.pricingAttrition)} attrition.`} />
                <MethodItem title="Operational Efficiency" text={`${formatPct(params.opsEfficiencyGain)} improvement on the ${(params.billingOpsCostRate * 100).toFixed(0)}% billing/comp cost base, plus headcount avoidance from organic growth (${formatPct(params.opsHeadcountAvoidanceRate)} of incremental ops hiring avoided).`} />
                <MethodItem title="Incremental EBITDA" text={`(Incremental revenue x (1 - ${formatPct(params.advisorPayout)} advisor payout)) + ops savings.`} />
                <MethodItem title="Enterprise Value Uplift" text={`Incremental EBITDA x ${params.evMultiple}x EV/EBITDA multiple.`} />
                <MethodItem title="Disclaimer" text="All outputs are directional planning estimates based on your inputs and model assumptions. Not financial, legal, or investment advice." />
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MethodItem({ title, text }: { title: string; text: string }) {
  return (
    <li className="flex gap-3">
      <div className="w-1 shrink-0 bg-[#3b84ff]/30 mt-0.5" />
      <div>
        <span className="font-semibold text-[#140f0c]/80">{title}:</span>{' '}{text}
      </div>
    </li>
  );
}

function SectionHeader({ label, cols, color }: { label: string; cols: number; color: string }) {
  return (
    <tr>
      <td colSpan={cols + 1} className="pt-4 pb-1.5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-3.5" style={{ backgroundColor: color }} />
          <span className="text-[10px] font-semibold text-[#140f0c]/40 uppercase tracking-wider">{label}</span>
        </div>
      </td>
    </tr>
  );
}

function Row({ label, rows, accessor, bold, dim }: {
  label: string;
  rows: YearlyOutput[];
  accessor: (r: YearlyOutput) => number;
  bold?: boolean;
  dim?: boolean;
}) {
  return (
    <tr className={`border-b border-[#140f0c]/5 ${dim ? 'text-[#140f0c]/35' : ''} ${bold ? 'bg-[#f4f4f4]/60' : ''}`}>
      <td className={`py-2 pr-3 ${bold ? 'font-semibold text-[#140f0c]' : ''}`}>{label}</td>
      {rows.map((r) => (
        <td key={r.year} className={`py-2 px-2 text-right tabular-nums ${bold ? 'font-semibold' : ''}`}>
          {formatCompact(accessor(r))}
        </td>
      ))}
    </tr>
  );
}