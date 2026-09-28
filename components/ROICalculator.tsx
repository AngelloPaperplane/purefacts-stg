'use client'

import { useState, useCallback, useRef } from 'react'

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface Inputs {
  aum: number
  feeBps: number
  leakageBps: number
  recoveryPct: number
  ebitdaMarginPct: number
  multiple: number
  oneTime: number
  annualCost: number
  horizon: number
  discountPct: number
  growthPct: number
}

interface CashFlowRow {
  year: number
  netEbitda: number | null
  discountFactor: number
  pv: number | null
  cumulative: number
}

interface SensRow {
  leakBps: number
  values: (number | null)[]
}

interface Outputs {
  grossRevY1: number
  billingOpsCost: number
  leakageY1: number
  recoverableY1: number
  incEbitdaY1: number
  netEbitdaY1: number
  evUpliftY1: number
  year1NetBenefit: number
  payback: number | null
  npv: number
  cashflows: CashFlowRow[]
  sens: SensRow[]
}

/* ─────────────────────────────────────────────
   DEFAULTS  (match V2 spreadsheet)
───────────────────────────────────────────── */
const DEFAULTS: Inputs = {
  aum: 10_000_000_000,
  feeBps: 70,
  leakageBps: 4,
  recoveryPct: 75,
  ebitdaMarginPct: 30,
  multiple: 10,
  oneTime: 250_000,
  annualCost: 300_000,
  horizon: 3,
  discountPct: 12,
  growthPct: 15,
}

/* ─────────────────────────────────────────────
   MODEL  (V2 spreadsheet — growth-adjusted)
───────────────────────────────────────────── */
function compute(i: Inputs): Outputs {
  const recovery  = i.recoveryPct     / 100
  const ebitda    = i.ebitdaMarginPct / 100
  const discount  = i.discountPct     / 100
  const growth    = i.growthPct       / 100

  const grossRevY1     = i.aum * (i.feeBps    / 10_000)
  const billingOpsCost = grossRevY1 * 0.02
  const leakageY1      = i.aum * (i.leakageBps / 10_000)
  const recoverableY1  = leakageY1 * recovery
  const incEbitdaY1    = recoverableY1 * ebitda
  const netEbitdaY1    = incEbitdaY1 - i.annualCost
  const evUpliftY1     = netEbitdaY1 * i.multiple
  const year1NetBenefit = netEbitdaY1 - i.oneTime
  const payback = incEbitdaY1 > 0
    ? (i.annualCost + i.oneTime) / incEbitdaY1
    : null

  const cashflows: CashFlowRow[] = []
  let cumulative = -i.oneTime
  let npvAcc     = -i.oneTime

  for (let y = 1; y <= 10; y++) {
    const df        = 1 / Math.pow(1 + discount, y)
    const inHorizon = y <= i.horizon
    const netEbitda = inHorizon ? netEbitdaY1 * Math.pow(1 + growth, y - 1) : null
    const pv        = netEbitda !== null ? netEbitda * df : null
    if (netEbitda !== null) { cumulative += netEbitda; npvAcc += pv! }
    cashflows.push({ year: y, netEbitda, discountFactor: df, pv, cumulative })
  }

  const sens: SensRow[] = [2, 3, 4, 5, 6].map(lb => ({
    leakBps: lb,
    values: [0.50, 0.75, 1.00].map(rr => {
      const net = i.aum * (lb / 10_000) * rr * ebitda - i.annualCost
      return net > 0 ? net * i.multiple : null
    }),
  }))

  return {
    grossRevY1, billingOpsCost, leakageY1, recoverableY1,
    incEbitdaY1, netEbitdaY1, evUpliftY1, year1NetBenefit,
    payback, npv: npvAcc, cashflows, sens,
  }
}

/* ─────────────────────────────────────────────
   FORMATTERS
───────────────────────────────────────────── */
const fmtUSD   = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const fmtPct   = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 2 }).format(n)
const fmtNum2  = (n: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n)
const fmtNum4  = (n: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(n)
const fmtComma = (n: number) => n.toLocaleString('en-US')

/* ─────────────────────────────────────────────
   KPI CARD
───────────────────────────────────────────── */
function KpiCard({
  dark,
  label,
  value,
  sub,
  full = false,
  valueColor,
}: {
  dark: boolean
  label: string
  value: string
  sub?: string
  full?: boolean
  valueColor?: string
}) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-xl p-[14px] min-h-[78px]
        border-[1.5px] transition-all duration-300 group
        hover:border-blue-300
        ${full ? 'col-span-2' : ''}
        ${dark
          ? 'bg-[#1a2740] border-white/[0.10]'
          : 'bg-[#f5f7fc] border-gray-200'
        }
      `}
    >
      {/* gradient accent bar on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: 'linear-gradient(90deg,#facc22,#fb5607,#4760ff,#0dccff)' }}
      />
      <div className={`text-[11.5px] font-semibold uppercase tracking-[0.4px] mb-[6px] ${dark ? 'text-[#9fb1d1]' : 'text-gray-400'}`}>
        {label}
      </div>
      <div
        className={`text-[20px] font-black leading-none ${dark ? 'text-[#eaf0ff]' : 'text-gray-900'}`}
        style={valueColor ? { color: valueColor } : {}}
      >
        {value}
      </div>
      {sub && (
        <div className={`mt-[5px] text-[11.5px] ${dark ? 'text-[#9fb1d1]' : 'text-gray-400'}`}>
          {sub}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function ROICalculator() {
  const [inputs, setInputs]       = useState<Inputs>(DEFAULTS)
  const [aumDisplay, setAumDisplay] = useState(fmtComma(DEFAULTS.aum))
  const [dark, setDark]           = useState(false)
  const aumRef                    = useRef<HTMLInputElement>(null)

  const set = useCallback(<K extends keyof Inputs>(key: K, value: Inputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }))
  }, [])

  const reset = () => {
    setInputs(DEFAULTS)
    setAumDisplay(fmtComma(DEFAULTS.aum))
  }

  const handleAumInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw       = e.target.value
    const digits    = raw.replace(/[^0-9]/g, '')
    const n         = digits ? parseInt(digits, 10) : 0
    const selEnd    = e.target.selectionEnd ?? 0
    const oldLen    = raw.length
    const formatted = n > 0 ? fmtComma(n) : ''
    setAumDisplay(formatted)
    set('aum', n)
    requestAnimationFrame(() => {
      if (aumRef.current) {
        const pos = Math.max(0, selEnd + (formatted.length - oldLen))
        aumRef.current.setSelectionRange(pos, pos)
      }
    })
  }

  const out = compute(inputs)

  /* value tone */
  const tone = (n: number) => n > 0 ? '#37d67a' : n === 0 ? '#c07a00' : '#d63b3b'
  const paybackColor =
    out.payback === null || !Number.isFinite(out.payback) ? '#c07a00'
    : out.payback <= 1   ? '#37d67a'
    : out.payback <= 2.5 ? '#c07a00'
    : '#d63b3b'

  /* ── Shared theme shorthand ── */
  const text      = dark ? 'text-[#eaf0ff]'  : 'text-gray-900'
  const muted     = dark ? 'text-[#9fb1d1]'  : 'text-gray-400'
  const secBorder = dark ? 'border-white/10' : 'border-gray-200'
  const pill      = dark
    ? 'bg-[#1e2f4a] border-white/[0.15] text-[rgba(234,240,255,0.85)]'
    : 'bg-blue-50 border-blue-200 text-[#3b84ff]'
  const hint = dark
    ? 'bg-[#1a2e4a] border-l-[#4ea1ff] text-[#9fb1d1]'
    : 'bg-blue-50 border-l-[#3b84ff] text-gray-400'
  const noteBox = dark
    ? 'bg-[#1e2510] border-l-[#FACC22] text-[#9fb1d1]'
    : 'bg-amber-50 border-l-[#FACC22] text-gray-500'
  const noteStrong = dark ? 'text-[#eaf0ff]' : 'text-gray-700'
  const inputCls = `
    w-full px-3 py-[9px] rounded-[9px] border-[1.5px] font-semibold text-[13px] outline-none
    transition-all duration-150
    ${dark
      ? 'bg-[#1a2e4a] border-[#2d4f7a] text-[#eaf0ff] focus:bg-[#1e3358] focus:border-[#4ea1ff] focus:ring-2 focus:ring-[#4ea1ff]/20'
      : 'bg-blue-50 border-blue-200 text-gray-900 focus:bg-white focus:border-[#3b84ff] focus:ring-2 focus:ring-blue-100'
    }
  `
  const iconBg  = dark ? 'bg-[#1e3050]' : 'bg-blue-50'
  const resetBtnCls = dark
    ? 'bg-[#1e2f4a] border-white/[0.15] text-[#eaf0ff] hover:bg-[#253d60] hover:border-white/[0.25] hover:text-[#eaf0ff]'
    : 'bg-blue-50 border-blue-200 text-[#3b84ff] hover:bg-[#3b84ff] hover:text-white hover:border-[#3b84ff]'
  const tableHeadCls = dark ? 'bg-[#1e2f4a] text-[#dbe6ff]' : 'bg-[#3b84ff] text-white'
  const tableEvenCls = dark ? 'bg-[#162033]' : 'bg-[#f5f7fc]'
  const tableHoverCls = dark ? 'hover:bg-[#1e3050]' : 'hover:bg-blue-50'
  const tableBorder   = dark ? 'border-white/10' : 'border-gray-200'
  const panelBg = dark
    ? 'border-white/[0.12] shadow-[0_10px_30px_rgba(0,0,0,0.3)]'
    : 'border-gray-200 shadow-sm'
  const panelStyle = dark
    ? { background: 'linear-gradient(180deg, #162033 0%, #0f1a2e 100%)' }
    : { background: '#ffffff' }
  const wrapGlow = dark
    ? { boxShadow: '0 4px 32px rgba(55,214,122,0.15), 0 4px 24px rgba(71,96,255,0.2)' }
    : { boxShadow: '0 4px 28px rgba(71,96,255,0.15)' }
  const footBorder = dark ? 'border-white/10' : 'border-gray-200'

  /* Section title row */
  const SectionTitle = ({ title, badge }: { title: string; badge: string }) => (
    <div className={`flex items-center justify-between mb-[14px] pb-[10px] border-b ${secBorder} transition-colors duration-300`}>
      <h3 className={`text-[13px] font-bold uppercase tracking-[0.2px] m-0 ${text}`}>{title}</h3>
      <span className={`text-[11px] font-semibold px-[9px] py-[3px] rounded-full border ${pill} transition-colors duration-300`}>
        {badge}
      </span>
    </div>
  )

  /* Form row helper — 3-col grid: label | input | unit */
  const Row = ({ label, unit, children }: { label: string; unit: string; children: React.ReactNode }) => (
    <>
      <label className={`text-[13px] font-medium leading-tight ${text} transition-colors duration-300`}>{label}</label>
      <div>{children}</div>
      <div className={`text-[11.5px] italic text-right hidden sm:block ${muted}`}>{unit}</div>
    </>
  )

  return (
    <div className={`transition-colors duration-300 ${dark ? 'text-[#eaf0ff]' : 'text-gray-900'}`}>

      {/* ── Subheadline + dark toggle ── */}
      <div className="flex items-center justify-between gap-3 mb-[22px]">
        <p className={`text-[13px] m-0 ${muted} transition-colors duration-300`}>
          Enter your assumptions in the inputs panel. All outputs update instantly, with projected growth applied from Year 2 onward.
        </p>

        <button
          onClick={() => setDark(d => !d)}
          className="flex items-center gap-2 bg-transparent border-none p-0 cursor-pointer select-none flex-shrink-0"
          aria-label="Toggle dark mode"
        >
          <span className={`text-[12px] min-w-[46px] text-right ${muted} transition-colors duration-300`}>
            {dark ? '☾ Dark' : '☀ Light'}
          </span>
          <div
            className={`w-10 h-[22px] rounded-full relative transition-colors duration-300 ${dark ? 'bg-[#3b84ff]' : 'bg-gray-300'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-[3px] shadow-sm transition-transform duration-300 ${dark ? 'translate-x-[21px]' : 'translate-x-[3px]'}`} />
          </div>
        </button>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-5 items-start">

        {/* ════ LEFT: INPUTS ════ */}
        <section
          className={`border rounded-[14px] p-[22px] transition-all duration-300 ${panelBg}`}
          style={panelStyle}
        >
          {/* Header */}
          <div className="flex items-center gap-[10px] mb-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[#3b84ff] flex-shrink-0 transition-colors duration-300 ${iconBg}`}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M2 8h12M8 2v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className={`text-[15px] font-black m-0 ${text} transition-colors duration-300`}>Inputs</h2>
            <button
              onClick={reset}
              className={`ml-auto text-[13px] font-semibold px-3 py-[7px] rounded-[10px] border-[1.5px] transition-all duration-150 ${resetBtnCls}`}
            >
              ↺ Reset
            </button>
          </div>

          {/* Core assumptions */}
          <div className="mt-0">
            <SectionTitle title="Core assumptions" badge="Blue = editable" />
            <div className="grid grid-cols-[1fr_165px_95px] gap-x-[10px] gap-y-[10px] items-center">

              <Row label="AUM" unit="USD">
                <div className="relative">
                  <span className={`absolute left-[9px] top-1/2 -translate-y-1/2 text-[13px] font-semibold pointer-events-none z-10 ${muted}`}>$</span>
                  <input
                    ref={aumRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={aumDisplay}
                    onChange={handleAumInput}
                    onBlur={() => setAumDisplay(inputs.aum > 0 ? fmtComma(inputs.aum) : '')}
                    placeholder="10,000,000,000"
                    className={`${inputCls} pl-5`}
                  />
                </div>
              </Row>

              <Row label="Blended advisory fee rate" unit="bps">
                <input type="number" step="1" min="0" value={inputs.feeBps}
                  onChange={e => set('feeBps', parseFloat(e.target.value) || 0)}
                  className={inputCls} />
              </Row>

              <Row label="Estimated revenue leakage" unit="bps of AUM">
                <input type="number" step="0.1" min="0" value={inputs.leakageBps}
                  onChange={e => set('leakageBps', parseFloat(e.target.value) || 0)}
                  className={inputCls} />
              </Row>

              <Row label="Recovery rate (portion of leakage captured)" unit="%">
                <input type="number" step="0.1" min="0" max="100" value={inputs.recoveryPct}
                  onChange={e => set('recoveryPct', parseFloat(e.target.value) || 0)}
                  className={inputCls} />
              </Row>

            </div>
          </div>

          {/* Valuation, costs & horizon */}
          <div className="mt-[22px]">
            <SectionTitle title="Valuation, costs & horizon" badge="Used in EV / NPV" />
            <div className="grid grid-cols-[1fr_165px_95px] gap-x-[10px] gap-y-[10px] items-center">

              <Row label="EBITDA margin (on incremental revenue)" unit="%">
                <input type="number" step="0.1" min="0" max="100" value={inputs.ebitdaMarginPct}
                  onChange={e => set('ebitdaMarginPct', parseFloat(e.target.value) || 0)}
                  className={inputCls} />
              </Row>

              <Row label="Valuation multiple (EV / EBITDA)" unit="x">
                <input type="number" step="0.1" min="0" value={inputs.multiple}
                  onChange={e => set('multiple', parseFloat(e.target.value) || 0)}
                  className={inputCls} />
              </Row>

              <Row label="One-time implementation cost" unit="USD">
                <input type="number" step="1000" min="0" value={inputs.oneTime}
                  onChange={e => set('oneTime', parseFloat(e.target.value) || 0)}
                  className={inputCls} />
              </Row>

              <Row label="Annual platform cost (subscription + run)" unit="USD">
                <input type="number" step="1000" min="0" value={inputs.annualCost}
                  onChange={e => set('annualCost', parseFloat(e.target.value) || 0)}
                  className={inputCls} />
              </Row>

              <Row label="Analysis horizon" unit="years (0–10)">
                <input type="number" step="1" min="0" max="10" value={inputs.horizon}
                  onChange={e => set('horizon', Math.min(10, Math.round(parseFloat(e.target.value) || 0)))}
                  className={inputCls} />
              </Row>

              <Row label="Discount rate" unit="%">
                <input type="number" step="0.1" value={inputs.discountPct}
                  onChange={e => set('discountPct', parseFloat(e.target.value) || 0)}
                  className={inputCls} />
              </Row>

              <Row label="Projected annual growth rate" unit="%">
                <input type="number" step="0.1" min="0" value={inputs.growthPct}
                  onChange={e => set('growthPct', parseFloat(e.target.value) || 0)}
                  className={inputCls} />
              </Row>

            </div>

            <div className={`mt-3 border-l-4 rounded-lg px-3 py-[10px] text-[12px] leading-[1.55] transition-colors duration-300 ${noteBox}`}>
              <strong className={noteStrong}>Note:</strong> Formulas used:
              <ul className="mt-2 ml-4 space-y-1 list-disc">
                <li><strong>Incremental EBITDA</strong> = Recoverable Revenue &times; EBITDA margin</li>
                <li><strong>Net EBITDA</strong> = Incremental EBITDA &minus; Annual platform cost</li>
                <li><strong>NPV</strong> subtracts one-time cost upfront; cash flows grow at the projected rate from Year 2</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ════ RIGHT: OUTPUTS — full gradient border on outer wrap ════ */}
        <div
          className="rounded-[calc(14px+2.5px)] p-[2.5px] transition-all duration-300"
          style={{
            background: 'linear-gradient(132deg,#facc22,#fb5607,#4760ff,#0dccff)',
            ...wrapGlow,
          }}
        >
          <section
            className={`rounded-[14px] p-[22px] h-full border-0 transition-all duration-300 ${dark ? 'shadow-[0_10px_30px_rgba(0,0,0,0.3)]' : 'shadow-sm'}`}
            style={panelStyle}
          >

            {/* Header */}
            <div className="flex items-center gap-[10px] mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[#3b84ff] flex-shrink-0 transition-colors duration-300 ${iconBg}`}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 12 L7 7 L10 9 L14 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className={`text-[15px] font-black m-0 ${text} transition-colors duration-300`}>Key Outputs</h2>
            </div>

            <p className={`text-[12.5px] mb-5 border-l-4 rounded-lg px-3 py-[10px] transition-colors duration-300 ${hint}`}>
              Calculated outputs update instantly based on your inputs.
            </p>

            {/* KPI grid */}
            <div className="grid grid-cols-2 gap-3 mb-6" role="region" aria-label="Key outputs">
              <KpiCard dark={dark} label="Gross advisory revenue (Year 1)"
                value={fmtUSD(out.grossRevY1)}
                sub={`Fee rate = ${fmtNum2(inputs.feeBps)} bps (${fmtPct(inputs.feeBps / 10000)})`} />

              <KpiCard dark={dark} label="Estimated revenue leakage (Year 1)"
                value={fmtUSD(out.leakageY1)}
                sub={`${inputs.leakageBps} bps of AUM`} />

              <KpiCard dark={dark} label="Recoverable revenue (Year 1)"
                value={fmtUSD(out.recoverableY1)}
                sub={`Recovery rate = ${fmtPct(inputs.recoveryPct / 100)}`} />

              <KpiCard dark={dark} label="Billing operations cost (Year 1, 2%)"
                value={fmtUSD(out.billingOpsCost)}
                sub="2% of gross advisory revenue" />

              <KpiCard dark={dark} label="Incremental EBITDA (Year 1)"
                value={fmtUSD(out.incEbitdaY1)}
                valueColor={tone(out.incEbitdaY1)}
                sub={`EBITDA margin = ${fmtPct(inputs.ebitdaMarginPct / 100)}`} />

              <KpiCard dark={dark} label="Net EBITDA after platform cost (Year 1)"
                value={fmtUSD(out.netEbitdaY1)}
                valueColor={tone(out.netEbitdaY1)}
                sub={`Annual cost = ${fmtUSD(inputs.annualCost)}`} />

              <KpiCard dark={dark} label="Enterprise value uplift (Year 1)"
                value={fmtUSD(out.evUpliftY1)}
                valueColor={tone(out.evUpliftY1)}
                sub={`Multiple = ${fmtNum2(inputs.multiple)}x`} />

              <KpiCard dark={dark} label="Payback period (growth-adjusted)"
                value={out.payback === null || !Number.isFinite(out.payback) ? 'N/A' : `${fmtNum2(out.payback)} yrs`}
                valueColor={paybackColor}
                sub="(annualCost + oneTime) / Incremental EBITDA" />

              <KpiCard dark={dark} full
                label="NPV over horizon (after one-time cost, growth-adjusted)"
                value={fmtUSD(out.npv)}
                valueColor={tone(out.npv)}
                sub={`After one-time cost — ${inputs.horizon}-year horizon, ${inputs.growthPct}% growth`} />
            </div>

            {/* Cash flow table */}
            <div className="mt-[22px]">
              <div className={`flex items-center justify-between mb-[14px] pb-[10px] border-b ${secBorder} transition-colors duration-300`}>
                <h3 className={`text-[13px] font-bold uppercase tracking-[0.2px] m-0 ${text}`}>Cash Flow Schedule (for NPV)</h3>
                <span className={`text-[11px] font-semibold px-[9px] py-[3px] rounded-full border ${pill} transition-colors duration-300`}>Years 1–10</span>
              </div>
              <div className="overflow-x-auto">
                <table
                  className={`w-full text-[12px] rounded-xl border overflow-hidden ${tableBorder} transition-colors duration-300`}
                  style={{ borderCollapse: 'separate', borderSpacing: 0 }}
                >
                  <thead>
                    <tr>
                      {['Year', 'Net EBITDA after platform cost', 'Discount factor', 'Present value', 'Cumulative net cash flow'].map((h, i) => (
                        <th key={h}
                          className={`px-3 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.4px] border-b ${tableBorder} ${tableHeadCls} ${i === 0 ? 'text-left' : 'text-right'} transition-colors duration-300`}
                        >{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {out.cashflows.map((r, idx) => (
                      <tr key={r.year} className={`${idx % 2 === 1 ? tableEvenCls : ''} ${tableHoverCls} transition-colors duration-150`}>
                        <td className={`px-3 py-2.5 text-left font-semibold border-b ${tableBorder} ${text}`}>{r.year}</td>
                        <td className={`px-3 py-2.5 text-right border-b ${tableBorder} ${text}`}>
                          {r.netEbitda !== null ? fmtUSD(r.netEbitda) : <span className={muted}>—</span>}
                        </td>
                        <td className={`px-3 py-2.5 text-right border-b ${tableBorder} ${muted}`}>{fmtNum4(r.discountFactor)}</td>
                        <td className={`px-3 py-2.5 text-right border-b ${tableBorder} ${text}`}>
                          {r.pv !== null ? fmtUSD(r.pv) : <span className={muted}>—</span>}
                        </td>
                        <td className={`px-3 py-2.5 text-right border-b ${tableBorder} font-semibold ${text}`}>
                          {fmtUSD(r.cumulative)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sensitivity table */}
            <div className="mt-[22px]">
              <div className={`flex items-center justify-between mb-[14px] pb-[10px] border-b ${secBorder} transition-colors duration-300`}>
                <h3 className={`text-[13px] font-bold uppercase tracking-[0.2px] m-0 ${text}`}>Sensitivity: Year 1 EV Uplift ($)</h3>
                <span className={`text-[11px] font-semibold px-[9px] py-[3px] rounded-full border ${pill} transition-colors duration-300`}>Leakage (bps) &times; Recovery</span>
              </div>
              <div className="overflow-x-auto">
                <table
                  className={`w-full text-[12px] rounded-xl border overflow-hidden ${tableBorder} transition-colors duration-300`}
                  style={{ borderCollapse: 'separate', borderSpacing: 0 }}
                >
                  <thead>
                    <tr>
                      {['Leakage (bps) ↓ / Recovery →', '50%', '75%', '100%'].map((h, i) => (
                        <th key={h}
                          className={`px-3 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.4px] border-b ${tableBorder} ${tableHeadCls} ${i === 0 ? 'text-left' : 'text-right'} transition-colors duration-300`}
                        >{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {out.sens.map((row, idx) => (
                      <tr key={row.leakBps} className={`${idx % 2 === 1 ? tableEvenCls : ''} ${tableHoverCls} transition-colors duration-150`}>
                        <td className={`px-3 py-2.5 text-left font-semibold border-b ${tableBorder} ${text}`}>{row.leakBps}</td>
                        {row.values.map((v, vi) => (
                          <td key={vi} className={`px-3 py-2.5 text-right border-b ${tableBorder} ${text}`}>
                            {v !== null ? fmtUSD(v) : <span className={muted}>—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={`mt-3 border-l-4 rounded-lg px-3 py-[10px] text-[12px] leading-[1.55] transition-colors duration-300 ${noteBox}`}>
                EV uplift: <strong className={noteStrong}>(Recovered Revenue &times; EBITDA margin &minus; Annual platform cost) &times; Valuation multiple</strong>,
                where Recovered Revenue = <strong className={noteStrong}>AUM &times; Leakage(bps)/10,000 &times; Recovery</strong>. One-time cost is{' '}
                <strong className={noteStrong}>not</strong> included here.
              </div>
            </div>

            {/* Footer disclaimer */}
            <div className={`mt-[18px] border-t pt-[14px] text-[12px] leading-[1.55] transition-colors duration-300 ${footBorder} ${muted}`}>
              <strong className={text}>Disclaimer:</strong> For planning purposes only. This is not financial, legal, or investment advice.
            </div>

          </section>
        </div>

      </div>
    </div>
  )
}