'use client';

import { forwardRef } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from 'recharts';
import type { QualifierSelection, UserInputs, ModelOutputs, ModelParameters, YearlyOutput } from '@/lib/roi-calculator/types';
import { profilePresets, aumBandConfigs, getRoleLabel } from '@/lib/roi-calculator/presets';
import { formatChallenges } from '@/lib/roi-calculator/content';
import { formatMillions, formatCompact, formatMarginExpansion, formatPct, formatBps } from '@/lib/roi-calculator/format';

interface Props {
  qualifier: QualifierSelection;
  userInputs: UserInputs;
  modelParams: ModelParameters;
  outputs: ModelOutputs;
  leadName: string;
  leadCompany: string;
}

// Hex-only tokens — no oklch/oklab/color-mix that html2canvas can't parse
const C = {
  black:    '#140f0c',
  offWhite: '#f4f4f4',
  azure:    '#3b84ff',
  indigo:   '#4760FF',
  cyan:     '#0DCCFF',
  mandarin: '#fb5607',
  honey:    '#ffb30c',
  white:    '#ffffff',
  border:   '#e0dbd9',
  muted:    'rgba(20,15,12,0.45)',
  dimBg:    'rgba(59,132,255,0.08)',
  dimBorder:'rgba(20,15,12,0.12)',
} as const;

const FONT = 'Arial, Helvetica, sans-serif';
const M = 1_000_000;

const narrativeCards = [
  { title: 'Why the value exists', body: 'Revenue leakage typically comes from fee exceptions, missed billing logic, reconciliation gaps, stale data, and manual payout adjustments. Pricing opportunity often comes from discount drift, non-standard schedules, and limited governance across books or teams.' },
  { title: 'Why it matters now',   body: 'As firms scale, acquire, launch new offerings, or face tighter reporting expectations, manual revenue processes become harder to control. Small breaks in revenue operations can compound into material EBITDA and enterprise value impact.' },
  { title: 'How PureFacts helps',  body: 'PureFacts helps firms govern revenue logic, fee billing, compensation, pricing controls, and reporting workflows so earned revenue is captured more consistently and leadership can run the business with better visibility.' },
];

function buildChartData(schedule: YearlyOutput[]) {
  const y1Base = schedule[0]?.baselineEbitda ?? 0;
  return schedule.map((row) => {
    const rate = row.incrementalRevenue > 0 ? row.advisorPayoutOnIncremental / row.incrementalRevenue : 0;
    return {
      name: `Y${row.year}`,
      hidden:   y1Base / M,
      growth:   (row.baselineEbitda - y1Base) / M,
      recovery: (row.leakageRevenueRealized * (1 - rate)) / M,
      ops:       row.opsSavingsRealized / M,
      pricing:  (row.netPricingUplift * (1 - rate)) / M,
    };
  });
}

function PageHeader({ leadName, leadCompany }: { leadName: string; leadCompany: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 12, borderBottom: `2px solid ${C.azure}` }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.black, fontFamily: FONT }}>Enterprise Value Simulator</div>
        <div style={{ fontSize: 10, color: C.muted, fontFamily: FONT }}>Personalized Business Case · PureFacts Financial Solutions</div>
      </div>
      <div style={{ textAlign: 'right', fontSize: 10, color: C.muted, fontFamily: FONT }}>
        {leadName && <div style={{ fontWeight: 700, color: C.black, fontSize: 11 }}>{leadName}</div>}
        {leadCompany && <div>{leadCompany}</div>}
        <div>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
    </div>
  );
}

function PageFooter({ page, total }: { page: number; total: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 10, borderTop: `1px solid ${C.dimBorder}`, fontFamily: FONT }}>
      <div style={{ fontSize: 9, color: C.muted }}>For planning purposes only. Not financial, legal, or investment advice.</div>
      <div style={{ fontSize: 9, color: C.muted }}>Page {page} of {total} · PureFacts Financial Solutions</div>
    </div>
  );
}

export const PrintLayout = forwardRef<HTMLDivElement, Props>(
  function PrintLayout({ qualifier, userInputs, modelParams, outputs, leadName, leadCompany }, ref) {
    const profile = profilePresets[qualifier.firmProfile];
    const band    = aumBandConfigs[qualifier.aumBand];
    const role    = getRoleLabel(qualifier.role);
    const challenges = formatChallenges(qualifier.challenges);
    const s = outputs.schedule;
    const chartData = buildChartData(s);
    const y1BaseM = (s[0]?.baselineEbitda ?? 0) / M;

    const page: React.CSSProperties = {
      width: 1100, minHeight: 760, padding: 36,
      display: 'flex', flexDirection: 'column',
      backgroundColor: C.white, fontFamily: FONT,
      color: C.black, boxSizing: 'border-box',
    };

    return (
      <div ref={ref} style={{ width: 1100, backgroundColor: C.white }}>

        {/* ── PAGE 1 ── */}
        <div style={page}>
          <PageHeader leadName={leadName} leadCompany={leadCompany} />

          {/* Profile strip */}
          <div style={{ backgroundColor: C.offWhite, padding: '6px 14px', marginBottom: 14, fontSize: 11, borderRadius: 4, fontFamily: FONT }}>
            <strong>{profile.label}</strong>
            <span style={{ color: C.muted, margin: '0 8px' }}>·</span>{role}
            <span style={{ color: C.muted, margin: '0 8px' }}>·</span>{band.label} AUM
            <span style={{ color: C.muted, margin: '0 8px' }}>·</span>{formatCompact(userInputs.aum)}
            <span style={{ color: C.muted, margin: '0 8px' }}>·</span>{formatBps(userInputs.feeRate)} fee rate
          </div>

          {/* Narrative block */}
          <div style={{ border: `1px solid ${C.border}`, padding: '12px 16px', marginBottom: 14, borderRadius: 6 }}>
            <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.mandarin, marginBottom: 4 }}>Business case narrative</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.black, marginBottom: 5 }}>
                  The size of the prize: {formatMillions(outputs.fiveYearCumulativeNetEbitda)} in 5-year EBITDA impact
                </div>
                <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.55 }}>
                  By Year 5, that translates to an estimated {formatMillions(outputs.year5EvUplift)} in enterprise value uplift, with {formatMillions(outputs.year5LeakageRecovery)} of annual recoverable revenue and {formatMarginExpansion(outputs.year5EbitdaMarginExpansionBps)} of margin expansion.
                </div>
              </div>
              <div style={{ maxWidth: 250, textAlign: 'right', fontSize: 9, color: C.muted, lineHeight: 1.5 }}>
                <strong>Selected priorities:</strong> {challenges}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {narrativeCards.map((card) => (
                <div key={card.title} style={{ backgroundColor: C.offWhite, padding: '10px 12px', borderRadius: 4 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{card.title}</div>
                  <div style={{ fontSize: 9, color: C.muted, lineHeight: 1.5 }}>{card.body}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'Avg. Annual Revenue Recovery', value: formatMillions(outputs.avgAnnualRevenueRecovery) },
              { label: 'Avg. Annual Ops Savings',       value: formatCompact(outputs.avgAnnualOpsSavings) },
              { label: '5-Year EBITDA Impact',          value: formatMillions(outputs.fiveYearCumulativeNetEbitda) },
              { label: 'Year 5 EV Uplift',              value: formatMillions(outputs.year5EvUplift) },
            ].map((m) => (
              <div key={m.label} style={{ backgroundColor: '#edf3ff', padding: '10px 12px', textAlign: 'center', borderRadius: 6 }}>
                <div style={{ fontSize: 9, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.azure }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Chart + Y5 */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 16 }}>EBITDA — Full Value Creation</div>
              <BarChart width={600} height={200} data={chartData} margin={{ top: 20, right: 8, left: 4, bottom: 8 }} barCategoryGap="18%">
                <CartesianGrid strokeDasharray="3 3" stroke={C.black} strokeOpacity={0.06} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: C.muted }} axisLine={{ stroke: C.border }} tickLine={false} />
                <YAxis domain={[y1BaseM, 'auto']} allowDataOverflow tickFormatter={(v: number) => `$${Math.abs(v).toFixed(v >= 10 ? 0 : 1)}M`} tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} width={48} />
                <Bar dataKey="hidden"   stackId="a" fill={C.azure}    maxBarSize={44} isAnimationActive={false} legendType="none" />
                <Bar dataKey="growth"   name="Baseline Growth"   stackId="a" fill={C.azure}    maxBarSize={44} isAnimationActive={false} />
                <Bar dataKey="recovery" name="Revenue Recovery"  stackId="a" fill={C.indigo}   maxBarSize={44} isAnimationActive={false} />
                <Bar dataKey="ops"      name="Ops Efficiency"    stackId="a" fill={C.mandarin} maxBarSize={44} isAnimationActive={false} />
                <Bar dataKey="pricing"  name="Pricing Uplift"    stackId="a" fill={C.honey}    radius={[3,3,0,0]} maxBarSize={44} isAnimationActive={false} />
                <Legend wrapperStyle={{ fontSize: 9, paddingTop: 6 }} iconType="circle" iconSize={6} />
              </BarChart>
            </div>
            <div style={{ width: 252, flexShrink: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 16 }}>Year 5 Metrics</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: 'EBITDA Impact',          value: formatMillions(outputs.year5NetIncrementalEbitda),             color: C.azure },
                  { label: 'Margin Expansion',        value: formatMarginExpansion(outputs.year5EbitdaMarginExpansionBps), color: C.indigo },
                  { label: 'Recoverable Revenue',     value: formatMillions(outputs.year5LeakageRecovery),                color: C.cyan },
                  { label: 'Pricing Uplift',          value: formatMillions(outputs.year5PricingUplift),                  color: C.honey },
                  { label: 'Advisor Comp. Unlocked',  value: formatMillions(outputs.year5AdvisorPayoutOnIncremental),     color: C.mandarin },
                ].map((c) => (
                  <div key={c.label} style={{ borderLeft: `3px solid ${c.color}`, border: `1px solid ${C.border}`, borderLeftWidth: 3, borderLeftColor: c.color, padding: '6px 12px', borderRadius: '0 4px 4px 0' }}>
                    <div style={{ fontSize: 8, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{c.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.black }}>{c.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <PageFooter page={1} total={2} />
        </div>

        {/* ── PAGE 2 ── */}
        <div style={{ ...page, paddingTop: 36 }}>
          <PageHeader leadName={leadName} leadCompany={leadCompany} />

          {/* Two-column layout: 4/5 table + 1/5 sidebar */}
          <div style={{ display: 'flex', gap: 20, flex: 1, marginBottom: 14 }}>

            {/* Left: 5-year table (4/5 width) */}
            <div style={{ flex: '0 0 78%' }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>5-Year Detailed Projection</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, fontFamily: FONT }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.dimBorder}` }}>
                    <th style={{ textAlign: 'left', padding: '5px 4px', fontWeight: 600, color: C.muted }}>Metric</th>
                    {s.map((r) => <th key={r.year} style={{ textAlign: 'right', padding: '5px 4px', fontWeight: 600, color: C.muted }}>Year {r.year}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <SectionRow label="Baseline" />
                  <DataRow label="Projected AUM"             rows={s} fn={(r) => r.projectedAum} />
                  <DataRow label="Baseline Revenue"          rows={s} fn={(r) => r.baselineRevenue} />
                  <DataRow label="Baseline EBITDA"           rows={s} fn={(r) => r.baselineEbitda} bold />
                  <SectionRow label="Value Creation" />
                  <DataRow label="Leakage Recovery"          rows={s} fn={(r) => r.leakageRevenueRealized} />
                  <DataRow label="Pricing Uplift (net)"      rows={s} fn={(r) => r.netPricingUplift} />
                  <DataRow label="Ops Efficiency Savings"    rows={s} fn={(r) => r.opsSavingsRealized} />
                  <DataRow label="Total Incremental Revenue" rows={s} fn={(r) => r.incrementalRevenue} bold />
                  <SectionRow label="EBITDA Impact" />
                  <DataRow label="Advisor Payout"            rows={s} fn={(r) => r.advisorPayoutOnIncremental} dim />
                  <DataRow label="Incremental EBITDA"        rows={s} fn={(r) => r.grossIncrementalEbitda} bold />
                  <DataRow label="Total EBITDA"              rows={s} fn={(r) => r.totalEbitda} bold />
                  <SectionRow label="Enterprise Value" />
                  <DataRow label="Baseline EV"               rows={s} fn={(r) => r.baselineEv} />
                  <DataRow label="EV Uplift from PureFacts"  rows={s} fn={(r) => r.evUpliftFromPF} />
                  <DataRow label="Total EV"                  rows={s} fn={(r) => r.totalEv} bold />
                </tbody>
              </table>
            </div>

            {/* Right: sidebar (1/5 width) — assumptions + methodology */}
            <div style={{ flex: '0 0 20%', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Key assumptions */}
              <div style={{ backgroundColor: C.offWhite, padding: '10px 12px', borderRadius: 6 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Key Assumptions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 9, color: C.muted, lineHeight: 1.4 }}>
                  <div><strong style={{ color: C.black }}>Organic Growth:</strong> {formatPct(userInputs.organicGrowth)}</div>
                  <div><strong style={{ color: C.black }}>EBITDA Margin:</strong> {formatPct(userInputs.ebitdaMargin)}</div>
                  <div><strong style={{ color: C.black }}>Revenue Leakage:</strong> {formatPct(userInputs.leakageRate)}</div>
                  <div><strong style={{ color: C.black }}>Advisor Payout:</strong> {formatPct(modelParams.advisorPayout)}</div>
                  <div><strong style={{ color: C.black }}>EV Multiple:</strong> {modelParams.evMultiple}x</div>
                  <div><strong style={{ color: C.black }}>Margin Expansion:</strong> {formatMarginExpansion(outputs.year5EbitdaMarginExpansionBps)}</div>
                </div>
              </div>

              {/* Methodology */}
              <div style={{ backgroundColor: C.offWhite, padding: '10px 12px', borderRadius: 6 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Methodology</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 9, color: C.muted, lineHeight: 1.5 }}>
                  <div><strong style={{ color: C.black }}>Revenue Recovery:</strong> Leakage as {formatPct(userInputs.leakageRate)} of gross revenue, ramped {modelParams.recoveryRamp.join('/')}% Y1–Y5.</div>
                  <div><strong style={{ color: C.black }}>Pricing Uplift:</strong> {formatBps(modelParams.pricingUpliftBps)} on {formatPct(modelParams.annualRepricingRate)} of original AUM/yr, net of {formatPct(modelParams.pricingAttrition)} attrition.</div>
                  <div><strong style={{ color: C.black }}>Ops Efficiency:</strong> {formatPct(modelParams.opsEfficiencyGain)} on cost base + headcount avoidance ({formatPct(modelParams.opsHeadcountAvoidanceRate)} of incremental hiring).</div>
                  <div><strong style={{ color: C.black }}>EBITDA:</strong> (1 − {formatPct(modelParams.advisorPayout)} payout) × incremental rev + ops. EV = EBITDA × {modelParams.evMultiple}x.</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA — full width below the two columns */}
          <div style={{ backgroundColor: '#edf3ff', border: '1px solid #bdd3ff', padding: '12px 16px', borderRadius: 6, marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Talk to PureFacts</div>
            <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.6 }}>
              If these numbers are directionally meaningful, the next step is to validate the assumptions with your actual revenue, fee, billing, pricing, and payout workflows. PureFacts can help identify where leakage, pricing inconsistency, and complexity are showing up today.
            </div>
          </div>

          <PageFooter page={2} total={2} />
        </div>
      </div>
    );
  },
);

function SectionRow({ label }: { label: string }) {
  return (
    <tr>
      <td colSpan={6} style={{ paddingTop: 10, paddingBottom: 3 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(20,15,12,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      </td>
    </tr>
  );
}

function DataRow({ label, rows, fn, bold, dim }: {
  label: string; rows: YearlyOutput[]; fn: (r: YearlyOutput) => number; bold?: boolean; dim?: boolean;
}) {
  return (
    <tr style={{ borderBottom: '1px solid rgba(20,15,12,0.08)', opacity: dim ? 0.5 : 1, backgroundColor: bold ? '#f4f4f4' : C.white }}>
      <td style={{ padding: '3px 4px', fontWeight: bold ? 700 : 400, fontSize: 10 }}>{label}</td>
      {rows.map((r) => (
        <td key={r.year} style={{ padding: '3px 4px', textAlign: 'right', fontFamily: 'monospace', fontWeight: bold ? 700 : 400, fontSize: 10 }}>
          {formatCompact(fn(r))}
        </td>
      ))}
    </tr>
  );
}