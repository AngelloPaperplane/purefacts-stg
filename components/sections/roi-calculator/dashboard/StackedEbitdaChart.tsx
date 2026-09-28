'use client';

import { useMemo } from 'react';
import { useFadeIn } from '@/hooks/useFadeIn';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ModelOutputs, YearlyOutput } from '@/lib/roi-calculator/types';
import { formatCompact } from '@/lib/roi-calculator/format';

// Brand colors: Azure baseline, Indigo recovery, Mandarin ops, Honey pricing
const BASELINE_COLOR = '#3b84ff';
const RECOVERY_COLOR = '#4760FF';
const OPS_COLOR = '#fb5607';
const PRICING_COLOR = '#ffb30c';

const M = 1_000_000;

interface Props {
  schedule: ModelOutputs['schedule'];
}

type ChartRow = {
  name: string;
  hiddenM: number;
  baselineGrowthM: number;
  recoveryM: number;
  opsM: number;
  pricingM: number;
};

function payoutRate(row: YearlyOutput): number {
  if (row.incrementalRevenue <= 0) return 0;
  return row.advisorPayoutOnIncremental / row.incrementalRevenue;
}

function buildRows(schedule: YearlyOutput[]): { rows: ChartRow[]; y1BaseM: number } {
  const y1Base = schedule[0]?.baselineEbitda ?? 0;
  const rows = schedule.map((row) => {
    const rate = payoutRate(row);
    return {
      name: `Y${row.year}`,
      hiddenM: y1Base / M,
      baselineGrowthM: (row.baselineEbitda - y1Base) / M,
      recoveryM: (row.leakageRevenueRealized * (1 - rate)) / M,
      opsM: row.opsSavingsRealized / M,
      pricingM: (row.netPricingUplift * (1 - rate)) / M,
    };
  });
  return { rows, y1BaseM: y1Base / M };
}

function totalOf(row: ChartRow): number {
  return (row.hiddenM + row.baselineGrowthM + row.recoveryM + row.opsM + row.pricingM) * M;
}

function TotalBarLabel(props: Record<string, unknown>) {
  const x = (props.x as number) ?? 0;
  const y = (props.y as number) ?? 0;
  const width = (props.width as number) ?? 0;
  const payload = props.payload as ChartRow | undefined;
  if (!payload) return null;
  return (
    <text x={x + width / 2} y={y - 6} textAnchor="middle" fill="#140f0c" fillOpacity={0.5} fontSize={11} fontWeight={600}>
      {formatCompact(totalOf(payload))}
    </text>
  );
}

function pctOf(part: number, total: number): string {
  if (total <= 0) return '';
  return `${((part / total) * 100).toFixed(1)}%`;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartRow }> }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  const b = (row.hiddenM + row.baselineGrowthM) * M;
  const r = row.recoveryM * M;
  const o = row.opsM * M;
  const p = row.pricingM * M;
  const total = totalOf(row);
  return (
    <div className="bg-white border border-[#140f0c]/12 px-3 py-2.5 text-xs min-w-[220px] shadow-lg">
      <p className="font-semibold text-[#140f0c] mb-2">{row.name} — {formatCompact(total)}</p>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span style={{ color: BASELINE_COLOR }} className="font-medium">Baseline EBITDA</span>
          <span className="text-[#140f0c]/60">{formatCompact(b)} <span className="text-[#140f0c]/35">({pctOf(b, total)})</span></span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: RECOVERY_COLOR }} className="font-medium">Revenue Recovery</span>
          <span className="text-[#140f0c]/60">{formatCompact(r)} <span className="text-[#140f0c]/35">({pctOf(r, total)})</span></span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: OPS_COLOR }} className="font-medium">Ops Efficiency</span>
          <span className="text-[#140f0c]/60">{formatCompact(o)} <span className="text-[#140f0c]/35">({pctOf(o, total)})</span></span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: PRICING_COLOR }} className="font-medium">Pricing Uplift</span>
          <span className="text-[#140f0c]/60">{formatCompact(p)} <span className="text-[#140f0c]/35">({pctOf(p, total)})</span></span>
        </div>
      </div>
    </div>
  );
}

export function StackedEbitdaChart({ schedule }: Props) {
  const { rows: data, y1BaseM } = useMemo(() => buildRows(schedule), [schedule]);
  const fade = useFadeIn();

  return (
    <div ref={fade.ref} className={`transition-opacity duration-500 ${fade.visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-sm font-semibold text-[#140f0c]">
          EBITDA — Full Value Creation
        </h3>
        <div className="flex-1 h-px bg-[#140f0c]/10" />
      </div>

      <div className="bg-white border border-[#140f0c]/10 shadow-sm p-4" style={{ borderRadius: 10 }}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 28, right: 12, left: 4, bottom: 24 }} barCategoryGap="18%">
            <CartesianGrid strokeDasharray="3 3" stroke="#140f0c" strokeOpacity={0.06} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#140f0c', fillOpacity: 0.5 }}
              axisLine={{ stroke: '#140f0c', strokeOpacity: 0.1 }}
              tickLine={false}
            />
            <YAxis
              domain={[y1BaseM, 'auto']}
              allowDataOverflow={true}
              tickFormatter={(v: number) => `$${Math.abs(v).toFixed(Math.abs(v) >= 10 || Number.isInteger(v) ? 0 : 1)}M`}
              tick={{ fontSize: 11, fill: '#140f0c', fillOpacity: 0.5 }}
              axisLine={false}
              tickLine={false}
              width={52}
              label={{ value: 'EBITDA ($M)', angle: -90, position: 'insideLeft', style: { fill: '#140f0c', fillOpacity: 0.35, fontSize: 11, textAnchor: 'middle' }, offset: 10 }}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(20,15,12,0.04)' }} />
            <Bar dataKey="hiddenM" stackId="ebitda" fill={BASELINE_COLOR} maxBarSize={56} isAnimationActive={false} legendType="none" />
            <Bar dataKey="baselineGrowthM" name="Baseline Growth" stackId="ebitda" fill={BASELINE_COLOR} maxBarSize={56} isAnimationActive={true} animationDuration={600} animationBegin={0} />
            <Bar dataKey="recoveryM" name="Revenue Recovery" stackId="ebitda" fill={RECOVERY_COLOR} maxBarSize={56} isAnimationActive={true} animationDuration={600} animationBegin={150} />
            <Bar dataKey="opsM" name="Ops Efficiency" stackId="ebitda" fill={OPS_COLOR} maxBarSize={56} isAnimationActive={true} animationDuration={600} animationBegin={300} />
            <Bar dataKey="pricingM" name="Pricing Uplift" stackId="ebitda" fill={PRICING_COLOR} radius={[3, 3, 0, 0]} maxBarSize={56} isAnimationActive={true} animationDuration={600} animationBegin={450}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <LabelList content={TotalBarLabel as any} />
            </Bar>
            <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 11, paddingTop: 16 }} iconType="circle" iconSize={8} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-[11px] text-[#140f0c]/40 mt-1 px-0.5 leading-relaxed">
          Y-axis starts at Year 1 baseline EBITDA. Incremental layers show PureFacts value creation.
        </p>
      </div>
    </div>
  );
}