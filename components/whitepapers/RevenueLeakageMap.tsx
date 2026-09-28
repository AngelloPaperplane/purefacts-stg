'use client'

// ─────────────────────────────────────────────────────────────────────────────
// components/whitepapers/RevenueLeakageMap.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'

interface Props { post: any }

// ── Animated counter hook ─────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1800, decimals = 0) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1)
            const ease = 1 - Math.pow(1 - p, 3)
            setValue(parseFloat((ease * target).toFixed(decimals)))
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration, decimals])
  return { value, ref }
}

// ── Animated stat ─────────────────────────────────────────────────────────────
function AnimatedStat({ value, prefix = '', suffix = '', label, decimals = 0 }: {
  value: number; prefix?: string; suffix?: string; label: string; decimals?: number
}) {
  const { value: count, ref } = useCountUp(value, 1600, decimals)
  return (
    <div ref={ref} className="text-center">
      <div className="font-bold leading-none" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#3b84ff' }}>
        {prefix}{decimals > 0 ? count.toFixed(decimals) : Math.round(count).toLocaleString()}{suffix}
      </div>
      <div className="mt-2 text-xs uppercase tracking-widest font-semibold" style={{ color: 'rgba(20,15,12,0.45)' }}>
        {label}
      </div>
    </div>
  )
}

// ── FadeIn ────────────────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.08 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

// ── Pull quote ────────────────────────────────────────────────────────────────
function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <FadeIn>
      <blockquote className="my-10 px-8 py-6" style={{ borderLeft: '3px solid #3b84ff', background: 'rgba(59,132,255,0.05)' }}>
        <p className="text-lg font-semibold leading-relaxed" style={{ color: '#140f0c' }}>{children}</p>
      </blockquote>
    </FadeIn>
  )
}

// ── Callout ───────────────────────────────────────────────────────────────────
function Callout({ eyebrow, children, accent = '#3b84ff' }: {
  eyebrow: string; children: React.ReactNode; accent?: string
}) {
  return (
    <FadeIn>
      <div className="my-10 p-6" style={{ border: `1px solid ${accent}30`, background: `${accent}08` }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>{eyebrow}</p>
        <div style={{ color: '#140f0c' }}>{children}</div>
      </div>
    </FadeIn>
  )
}

// ── Section heading (registers id for TOC) ────────────────────────────────────
function SectionHead({ number, title, id }: { number: string; title: string; id: string }) {
  return (
    <FadeIn>
      <div id={id} className="flex items-start gap-5 mb-8 mt-16" style={{ scrollMarginTop: '6rem' }}>
        <span className="font-bold text-4xl leading-none shrink-0 mt-0.5"
          style={{ color: 'rgba(59,132,255,0.25)', fontVariantNumeric: 'tabular-nums' }}>
          {number}
        </span>
        <h2 className="text-2xl font-bold leading-snug" style={{ color: '#140f0c' }}>{title}</h2>
      </div>
    </FadeIn>
  )
}

// ── Body ──────────────────────────────────────────────────────────────────────
function Body({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-base leading-relaxed mb-5" style={{ color: 'rgba(20,15,12,0.75)' }}>{children}</p>
  )
}

// ── Leakage card ──────────────────────────────────────────────────────────────
function LeakageCard({ zone, failures, why, control, delay = 0 }: {
  zone: string; failures: string; why: string; control: string; delay?: number
}) {
  return (
    <FadeIn delay={delay}>
      <div className="p-5 h-full" style={{ background: '#ffffff', border: '1px solid rgba(20,15,12,0.1)' }}>
        <h3 className="font-bold text-xs uppercase tracking-wider mb-3" style={{ color: '#fb5607' }}>{zone}</h3>
        <div className="space-y-3 text-sm" style={{ color: 'rgba(20,15,12,0.7)' }}>
          <div><span className="font-semibold" style={{ color: '#140f0c' }}>Failure points: </span>{failures}</div>
          <div><span className="font-semibold" style={{ color: '#140f0c' }}>Why missed: </span>{why}</div>
          <div><span className="font-semibold" style={{ color: '#3b84ff' }}>Control needed: </span>{control}</div>
        </div>
      </div>
    </FadeIn>
  )
}

// ── Control layer row ─────────────────────────────────────────────────────────
function ControlLayer({ label, governs, objective, index }: {
  label: string; governs: string; objective: string; index: number
}) {
  const colors = ['#3b84ff', '#fb5607', '#3b84ff', '#fb5607', '#3b84ff', '#fb5607']
  return (
    <FadeIn delay={index * 80}>
      <div className="flex gap-4 items-start py-5" style={{ borderBottom: '1px solid rgba(20,15,12,0.07)' }}>
        <div className="text-xs font-bold uppercase tracking-widest w-20 shrink-0 mt-0.5"
          style={{ color: colors[index % colors.length] }}>{label}</div>
        <div className="flex-1 text-sm" style={{ color: 'rgba(20,15,12,0.65)' }}>{governs}</div>
        <div className="flex-1 text-sm font-medium" style={{ color: '#140f0c' }}>{objective}</div>
      </div>
    </FadeIn>
  )
}

// ── Table of contents (sticky sidebar) ───────────────────────────────────────
const TOC_ITEMS = [
  { id: 'exec-summary',    label: 'Executive Summary' },
  { id: 'section-01',      label: '01 — Why Billing Got Complex' },
  { id: 'section-02',      label: '02 — How Leakage Happens' },
  { id: 'section-03',      label: '03 — Leakage Diagnostic' },
  { id: 'section-04',      label: '04 — Why Systems Miss It' },
  { id: 'section-05',      label: '05 — Economics of Leakage' },
  { id: 'section-06',      label: '06 — Regulatory Proof Points' },
  { id: 'section-07',      label: '07 — The Control Model' },
  { id: 'section-08',      label: '08 — Modern Architecture' },
  { id: 'conclusion',      label: 'Conclusion' },
]

function TableOfContents() {
  const [active, setActive] = useState('')

  useEffect(() => {
    const ids = TOC_ITEMS.map(t => t.id)
    const observers: IntersectionObserver[] = []
    ids.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id) },
        { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav aria-label="Table of contents">
      <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(20,15,12,0.35)' }}>
        Contents
      </p>
      <ul className="space-y-1">
        {TOC_ITEMS.map(item => (
          <li key={item.id}>
            <button
              onClick={() => scrollTo(item.id)}
              className="text-left w-full text-xs leading-snug py-1 px-2 transition-all duration-150"
              style={{
                color: active === item.id ? '#3b84ff' : 'rgba(20,15,12,0.5)',
                background: active === item.id ? 'rgba(59,132,255,0.07)' : 'transparent',
                borderLeft: active === item.id ? '2px solid #3b84ff' : '2px solid transparent',
                fontWeight: active === item.id ? 600 : 400,
              }}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return ''
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function RevenueLeakageMap({ post }: Props) {
  const authorName: string = post?.author?.name ?? ''
  const publishedAt: string = post?.publishedAt ?? ''
  const formattedDate = formatDate(publishedAt)

  return (
    <main style={{ background: '#ffffff', color: '#140f0c', fontFamily: 'Carlito, sans-serif' }}>
      <style>{`
        .rlm-table { width: 100%; border-collapse: collapse; }
        .rlm-table th { color: rgba(20,15,12,0.45); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; padding: 0.6rem 1rem; text-align: left; border-bottom: 2px solid rgba(20,15,12,0.1); }
        .rlm-table td { padding: 0.75rem 1rem; font-size: 0.875rem; color: rgba(20,15,12,0.7); border-bottom: 1px solid rgba(20,15,12,0.07); vertical-align: top; }
        .rlm-table tr:last-child td { border-bottom: none; }
        .rlm-table td:first-child { color: #140f0c; font-weight: 500; }
        .rlm-table tr:hover td { background: rgba(59,132,255,0.03); }
        .rlm-table td.money { color: #3b84ff; font-weight: 600; font-variant-numeric: tabular-nums; }
        .rlm-table td.exposure { color: #fb5607; font-weight: 600; font-variant-numeric: tabular-nums; }
        @media (min-width: 1280px) { .rlm-toc-sidebar { display: block !important; } }
        .rlm-gradient-text { background: linear-gradient(135deg, #FACC22, #FB5607, #4760FF, #0DCCFF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-16 px-6"
        style={{ background: '#f4f4f4', borderBottom: '1px solid rgba(20,15,12,0.08)' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#fb5607' }}>
            Whitepaper
          </p>
          <h1 className="font-bold leading-tight mb-5"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#140f0c', maxWidth: '40rem' }}>
            The Revenue Leakage Map
          </h1>
          <p className="text-lg leading-relaxed mb-10" style={{ color: 'rgba(20,15,12,0.6)', maxWidth: '36rem' }}>
            Where wealth management firms lose earned revenue and why current systems miss it.
          </p>
          <div className="h-px w-full mb-12"
            style={{ background: 'linear-gradient(90deg, #FACC22, #FB5607, #4760FF, #0DCCFF)', opacity: 0.7 }} />

          {/* Key stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <AnimatedStat value={200} suffix="T" prefix="$" label="Global AUM by 2030" />
            <AnimatedStat value={19} suffix="%" label="Profit per AUM decline since 2018" />
            <AnimatedStat value={25} suffix="M" prefix="$" label="1bp exposure on $250B AUM" />
            <AnimatedStat value={89} suffix="%" label="Asset managers under profit pressure" />
          </div>

          {/* Author / date meta */}
          {(authorName || formattedDate) && (
            <div className="flex items-center gap-3 justify-center"
              style={{ borderTop: '1px solid rgba(20,15,12,0.1)', paddingTop: '1.25rem' }}>
              {authorName && (
                <span className="text-xs font-semibold" style={{ color: 'rgba(20,15,12,0.5)' }}>
                  {authorName}
                </span>
              )}
              {authorName && formattedDate && (
                <span style={{ color: 'rgba(20,15,12,0.25)', fontSize: '0.65rem' }}>•</span>
              )}
              {formattedDate && (
                <span className="text-xs" style={{ color: 'rgba(20,15,12,0.4)' }}>
                  {formattedDate}
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Two-column layout: article + sticky TOC ────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-16 flex gap-16 items-start">

        {/* ── Article ─────────────────────────────────────────────────── */}
        <article className="min-w-0 flex-1">

          {/* Executive Summary */}
          <div id="exec-summary" style={{ scrollMarginTop: '6rem' }}>
            <FadeIn>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-8"
                style={{ color: 'rgba(20,15,12,0.35)' }}>
                Executive Summary
              </h2>
            </FadeIn>
            <FadeIn>
              <Body>
                Revenue leakage in wealth management is rarely the result of one broken calculation. It is
                the cumulative loss of earned revenue caused by gaps between client agreements, account data,
                householding logic, investment strategy structures, fee schedules, valuation feeds, billing
                operations, collections, advisor compensation, and executive reporting. The problem hides
                between systems and therefore cannot be solved by treating billing as a standalone back-office
                utility.
              </Body>
            </FadeIn>
            <FadeIn>
              <Body>
                The economics of wealth management make that gap more costly than it used to be. Global
                assets under management are projected to grow from US$139 trillion in 2024 to US$200 trillion
                by 2030, but PwC reports that profit per AUM is down 19% since 2018 and that 89% of surveyed
                asset managers experienced profitability pressure over the prior five years. In U.S. wealth
                advice, McKinsey estimates that fee-based advisory relationship revenue grew from approximately
                $150 billion in 2015 to $260 billion in 2024. Cerulli reports that 83% of advisors expect to
                charge less than 1% by 2026 for clients with more than $5 million in investable assets.
              </Body>
            </FadeIn>

            <PullQuote>
              A one-basis-point miss on $250 billion in AUM is $25 million of annual gross revenue exposure
              before any tax, compensation, or margin assumptions.
            </PullQuote>

            <FadeIn>
              <Body>
                A modern household may include multiple account registrations, an advisory program, a UMA,
                one or more SMA strategies, private assets, cash exclusions, security-level exclusions,
                negotiated discounts, tiered household breakpoints, tax overlays, third-party manager fees,
                advisor team splits, and billing in arrears. Each term may be reasonable in isolation.
                Together, they create an operating model that many systems cannot fully express, monitor,
                reconcile, and evidence.
              </Body>
            </FadeIn>

            <Callout eyebrow="The Central Argument">
              <p className="text-base leading-relaxed">
                A billing engine calculates fees. A revenue management architecture governs whether the right
                agreement terms, account data, investment strategy rules, approvals, calculations, collections,
                payouts, and reporting all reconcile to the same revenue truth.
              </p>
            </Callout>
          </div>

          {/* ── Section 1 ───────────────────────────────────────────────── */}
          <SectionHead number="01" title="Why Fee Billing Became More Complex" id="section-01" />
          <FadeIn>
            <Body>
              A decade ago, many wealth billing models were comparatively straightforward: account-level AUM
              fees, standard schedules, quarterly billing, liquid public-market assets, and a limited set of
              discounts or exclusions. Those models still exist, but they are no longer the whole business.
              Large firms now monetize advice through a wider range of products, service levels, account
              structures, investment programs, and advisor team arrangements.
            </Body>
          </FadeIn>
          <FadeIn>
            <Body>The complexity did not arrive all at once. It accumulated through a series of industry shifts.</Body>
          </FadeIn>
          <FadeIn>
            <div className="my-8 overflow-x-auto">
              <table className="rlm-table" style={{ background: '#f4f4f4' }}>
                <thead>
                  <tr><th>Complexity driver</th><th>Operational impact</th></tr>
                </thead>
                <tbody>
                  {[
                    ['Household and relationship pricing', 'Multiple accounts, entities, trusts, spouses, and related relationships must be aggregated for pricing, breakpoint, discount, and service-tier logic.'],
                    ['Program and strategy-level fees', 'UMA, SMA, model, direct-indexing, tax-overlay, and third-party manager structures introduce sleeve-, strategy-, or product-level billing rules.'],
                    ['Asset eligibility rules', 'Cash, alternatives, restricted securities, employer stock, held-away assets, annuities, and private assets may each require different inclusion, exclusion, valuation, or disclosure treatment.'],
                    ['Bespoke client economics', 'Negotiated discounts, temporary waivers, pricing concessions, service tiers, retainer fees, and grandfathered arrangements require durable configuration and expiry logic.'],
                    ['Advisor teams and compensation complexity', 'Revenue must flow into team splits, succession arrangements, referral credits, payout grids, and advisor statements that match the billing economics.'],
                    ['M&A and platform conversion', 'Acquired books bring legacy agreements, undocumented exceptions, paper fee schedules, and conversion-era patches into the revenue stack.'],
                  ].map(([d, i]) => <tr key={d}><td>{d}</td><td>{i}</td></tr>)}
                </tbody>
              </table>
            </div>
          </FadeIn>
          <FadeIn>
            <Body>
              Complexity is manageable when the rules are explicit, versioned, automated, and reconciled. It
              becomes leakage when the rules live across contracts, spreadsheets, CRM fields, portfolio
              systems, billing engines, advisor desktops, and compensation workbooks that do not share the
              same revenue truth.
            </Body>
          </FadeIn>

          {/* ── Section 2 ───────────────────────────────────────────────── */}
          <SectionHead number="02" title="A Typical Complex Fee Structure: How Leakage Happens in Practice" id="section-02" />
          <FadeIn>
            <Body>
              Consider a $10 million high-net-worth household. The relationship is not unusual for a large
              wealth firm, but it is complex enough to expose why leakage hides in the seams between systems.
            </Body>
          </FadeIn>
          <FadeIn>
            <div className="my-8 overflow-x-auto">
              <table className="rlm-table" style={{ background: '#f4f4f4' }}>
                <thead>
                  <tr><th>Household component</th><th>Fee or operating rule</th><th>Why it matters</th></tr>
                </thead>
                <tbody>
                  {[
                    ['Four related accounts', 'Taxable account, IRA, revocable trust, and family LLC account treated as one economic household.', 'If the accounts are not linked, breakpoints, service tiers, reporting, and advisor payout logic can all be wrong.'],
                    ['Tiered household schedule', 'First $5M at 75 bps; assets above $5M at 55 bps; billed quarterly in arrears.', 'The platform must support household aggregation, marginal tier logic, arrears billing, and period-end valuation.'],
                    ['6-month introductory discount', 'A 10 bps discount applies for the first two billing cycles only.', 'Without an expiration control, a temporary concession becomes a recurring leakage event.'],
                    ['UMA with multiple sleeves', 'The UMA includes model sleeves, a tax overlay, and a direct-indexing sleeve.', 'Billing may need to distinguish program fees, overlay fees, underlying manager fees, and excluded positions.'],
                    ['SMA strategy', 'A separately managed account has a strategy-level fee and a third-party manager fee.', 'If the strategy is coded as non-billable or the manager fee is handled outside the billing system, fee capture and reporting diverge.'],
                    ['Cash and security exclusions', 'Cash above a threshold and a concentrated employer-stock position are excluded from advisory billing.', 'The system must apply exclusions at the correct asset, account, and period level, not as a broad account override.'],
                    ['Private asset', 'A private credit position is valued quarterly and billed only when a current valuation is available.', 'Late or stale valuations can cause underbilling, overbilling, delayed billing, or manual adjustments.'],
                    ['Mid-quarter funding', 'The client contributes $500,000 halfway through the billing period.', 'Proration must reflect timing, eligible assets, and household rate logic.'],
                    ['Advisor team split', 'Revenue is split 70/30 between lead advisor and service advisor.', 'Compensation must use the same collected revenue and household economics as finance and billing.'],
                  ].map(([c, r, w]) => <tr key={c}><td>{c}</td><td>{r}</td><td>{w}</td></tr>)}
                </tbody>
              </table>
            </div>
          </FadeIn>

          {/* Exposure cards */}
          <FadeIn>
            <p className="text-xs font-bold uppercase tracking-widest mb-5"
              style={{ color: 'rgba(20,15,12,0.4)' }}>
              Illustrative leakage exposures on a single $10M household
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
            {[
              { point: 'Discount expiry', exposure: '$10,000/yr', detail: '10 bps persisting on $10M after the introductory period expired' },
              { point: 'Strategy fee capture', exposure: '$7,800/yr', detail: '$1.2M SMA sleeve at 65 bps coded as non-billable due to external manager fee' },
              { point: 'Cash exclusion error', exposure: '$2,750/yr', detail: '$500K incorrectly excluded at 55 bps when only cash above the threshold should be excluded' },
              { point: 'Stale private valuation', exposure: '$1,100/yr', detail: '$200K of billable private-credit value falling out of the fee run' },
              { point: 'Mid-period proration', exposure: '$688', detail: '$500K mid-quarter deposit not prorated at 55 bps for half a quarter' },
              { point: 'Failed collection', exposure: 'Full invoice', detail: 'Calculated revenue never becomes collected revenue due to unretried failed debit' },
            ].map(({ point, exposure, detail }, i) => (
              <FadeIn key={point} delay={i * 60}>
                <div className="p-5" style={{ background: '#f4f4f4', border: '1px solid rgba(20,15,12,0.09)' }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: '#fb5607' }}>{exposure}</div>
                  <div className="text-sm font-semibold mb-2" style={{ color: '#140f0c' }}>{point}</div>
                  <div className="text-xs leading-relaxed" style={{ color: 'rgba(20,15,12,0.55)' }}>{detail}</div>
                </div>
              </FadeIn>
            ))}
          </div>

          <PullQuote>
            None of these leakage points requires a dramatic failure. Each can look like a reasonable
            exception, data gap, product nuance, or manual adjustment. At enterprise scale, the same patterns
            repeat across thousands of households, advisors, products, and billing cycles.
          </PullQuote>

          {/* ── Section 3 ───────────────────────────────────────────────── */}
          <SectionHead number="03" title="The Revenue Leakage Diagnostic" id="section-03" />
          <FadeIn>
            <Body>
              The following diagnostic shows where earned revenue breaks inside the operating model, why the
              break happens, who typically owns it, and what control is required. Large firms can use this as
              a discovery tool, control checklist, and business-case structure for billing or revenue
              architecture modernization.
            </Body>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-8">
            {[
              { zone: 'Contract and disclosure alignment', failures: 'Agreement terms, service commitments, disclosures, and billing setup do not match.', why: 'Document systems, CRM, and billing platforms do not share executable contract terms.', control: 'Contract-to-billing mapping; approved template control; evidence retention.' },
              { zone: 'Client and household data', failures: 'Related accounts, trusts, entities, spouses, or advisor relationships not linked correctly.', why: 'CRM householding, billing householding, and compensation hierarchies use different definitions.', control: 'Authoritative household rules; master data governance; automated relationship matching.' },
              { zone: 'Investment strategy and product structure', failures: 'UMA/SMA sleeves, strategy fees, manager fees, overlays, alternatives not represented consistently.', why: 'Portfolio systems understand positions and strategies, but billing systems may not express strategy-level economics.', control: 'Product and strategy fee taxonomy; sleeve-level rules; manager-fee and overlay-fee controls.' },
              { zone: 'Asset classification and valuation', failures: 'Cash, alternatives, annuities, private assets, employer stock included or excluded incorrectly.', why: 'Asset classifications change across custodian, portfolio, product, and billing systems.', control: 'Billable-asset taxonomy; valuation controls; exception monitoring for stale or missing values.' },
              { zone: 'Fee schedule and calculation', failures: 'Wrong rate, tier, breakpoint, billing frequency, day-count, or proration rule applied.', why: 'Fee logic is configured locally, patched manually, or not versioned against agreement terms.', control: 'Versioned fee library; deterministic calculation engine; regression testing of fee rules.' },
              { zone: 'Discounts, waivers, and exceptions', failures: 'Temporary discounts become permanent; credits and waivers lack reason codes or approval evidence.', why: 'Exceptions sit in emails, spreadsheets, or account notes instead of controlled workflows.', control: 'Approval workflow; expiry dates; reason codes; exception aging and review.' },
              { zone: 'Billing operations and reconciliation', failures: 'Late feeds, manual adjustments, aged exceptions, unresolved variances disrupt fee runs.', why: 'Operations can resolve individual breaks but cannot always identify root causes or recurring patterns.', control: 'Reconciliation workflow; exception queues; GL/custodian/billing tie-out; root-cause reporting.' },
              { zone: 'Collection and adjustments', failures: 'Direct-bill invoices age; failed debits not retried; credits and write-offs not classified.', why: 'Billing output is not fully connected to AR, collections, client servicing, and profitability analytics.', control: 'Collections workflow; failed-payment escalation; write-off governance; collected-revenue reporting.' },
              { zone: 'Advisor compensation and payout', failures: 'Compensation based on billed rather than collected revenue; splits do not match client-level economics.', why: 'Compensation runs on a separate data model from billing and finance.', control: 'Integrated payout engine; advisor statements; split governance; dispute workflow.' },
              { zone: 'M&A, conversion, and migration', failures: 'Legacy fee schedules, grandfathered terms, paper agreements not digitized cleanly.', why: 'Conversion teams often map accounts and positions before they fully map revenue terms.', control: 'Fee-term digitization; migration controls; post-conversion testing; sunset logic for temporary patches.' },
              { zone: 'Reporting and analytics', failures: 'Executives cannot see eligible, billed, collected, compensated, and adjusted revenue by owner or root cause.', why: 'Reporting aggregates outcomes but does not preserve the lineage of data, rules, and decisions.', control: 'Revenue waterfall; leakage KPIs; owner-level dashboards; audit trail.' },
            ].map((card, i) => <LeakageCard key={card.zone} {...card} delay={i * 40} />)}
          </div>
          <Callout eyebrow="Pattern to note" accent="#ffb30c">
            <p className="text-sm leading-relaxed">
              Leakage clusters where ownership changes hands: contract to billing setup, household data to fee
              logic, product strategy to asset eligibility, fee calculation to collection, collection to
              compensation, and operations to executive reporting. These seams are the places large firms
              should test first.
            </p>
          </Callout>

          {/* ── Section 4 ───────────────────────────────────────────────── */}
          <SectionHead number="04" title="Why Current Systems Miss Leakage" id="section-04" />
          <FadeIn>
            <Body>
              Large wealth firms are not underinvested in technology. They often operate modern CRMs,
              portfolio accounting systems, billing platforms, custodian feeds, data warehouses, advisor
              desktops, compensation tools, and reporting environments. Leakage persists because each system
              solves part of the operating model, while revenue depends on the whole model working together.
            </Body>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
            <FadeIn>
              <div className="p-6 h-full" style={{ background: '#f4f4f4', border: '1px solid rgba(20,15,12,0.09)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#3b84ff' }}>
                  Technical Limitations
                </p>
                <ul className="space-y-3 text-sm" style={{ color: 'rgba(20,15,12,0.7)' }}>
                  {[
                    'Account-centric architecture: many systems are organized around accounts and positions, while wealth economics are often household-, strategy-, team-, or service-tier-based.',
                    'Static fee configuration: many billing setups handle standard schedules well but struggle with temporary discounts, conditional terms, strategy-level rules, and exception expiry.',
                    'Product taxonomy gaps: portfolio systems may know the security or model, but not whether that exposure is billable, excluded, wrapped, rebated, or subject to an overlay fee.',
                    'Semantic integration gaps: APIs move fields, but do not automatically reconcile the meaning of household, account, product, advisor, team, fee schedule, or collected revenue.',
                    'Calculation without context: a billing engine can calculate exactly what it is told, even when the upstream household, asset class, contract term, or discount rule is wrong.',
                    'Reporting without lineage: dashboards may show revenue outcomes without preserving the policy version, data inputs, approvals, overrides, collections, and payouts that produced them.',
                  ].map(item => (
                    <li key={item} className="flex gap-2 leading-relaxed">
                      <span className="shrink-0 mt-0.5" style={{ color: '#3b84ff' }}>—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <div className="p-6 h-full" style={{ background: '#f4f4f4', border: '1px solid rgba(20,15,12,0.09)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#fb5607' }}>
                  Operational Limitations
                </p>
                <ul className="space-y-3 text-sm" style={{ color: 'rgba(20,15,12,0.7)' }}>
                  {[
                    'Exceptions leave the control environment: one-off discounts, overrides, and reconciliation patches are often managed in email or spreadsheets.',
                    'Product launches outpace billing governance: new strategies, overlays, private assets, or fee treatments enter the business before the fee taxonomy is fully governed.',
                    'M&A creates inherited complexity: acquired books bring legacy terms, undocumented concessions, and account structures that may not map cleanly into the target platform.',
                    'Ownership is diffused: distribution, compliance, operations, finance, data, technology, and compensation each own part of revenue integrity, but no single function owns the full lifecycle.',
                    'Manual fixes become permanent process: teams solve the current billing cycle under time pressure, but the underlying root cause remains for the next cycle.',
                    'Advisor trust is affected: when statements are late, opaque, or disconnected from billing outcomes, advisors build shadow ledgers and disputes become a signal of upstream leakage.',
                  ].map(item => (
                    <li key={item} className="flex gap-2 leading-relaxed">
                      <span className="shrink-0 mt-0.5" style={{ color: '#fb5607' }}>—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
          <Callout eyebrow="A Practical Test" accent="#ffb30c">
            <p className="text-sm leading-relaxed">
              Ask distribution, operations, finance, compensation, and compliance to produce the same
              household revenue waterfall for the prior quarter: contracted revenue, approved adjustments,
              billed revenue, collected revenue, advisor payout, and unresolved exceptions. If the numbers do
              not reconcile without manual intervention, the firm does not yet have revenue integrity.
            </p>
          </Callout>

          {/* ── Section 5 ───────────────────────────────────────────────── */}
          <SectionHead number="05" title="The Economics of Leakage" id="section-05" />
          <FadeIn>
            <Body>
              Revenue leakage becomes a board-level issue because small basis-point differences scale quickly
              across enterprise AUM. The models below are illustrative and are not intended to assert a
              universal industry leakage rate; each firm should substitute its own AUM, realized yield,
              payout ratio, margin, and valuation assumptions.
            </Body>
          </FadeIn>
          <FadeIn>
            <p className="text-xs font-bold uppercase tracking-widest mt-10 mb-4"
              style={{ color: 'rgba(20,15,12,0.4)' }}>
              Model 1: What one basis point means (60 bps realized yield)
            </p>
            <div className="overflow-x-auto">
              <table className="rlm-table" style={{ background: '#f4f4f4' }}>
                <thead>
                  <tr><th>AUM</th><th>Gross revenue at 60 bps</th><th>1 bp exposure</th><th>2 bp exposure</th><th>3 bp exposure</th></tr>
                </thead>
                <tbody>
                  {[
                    ['$50B','$300M','$5M','$10M','$15M'],
                    ['$250B','$1.5B','$25M','$50M','$75M'],
                    ['$750B','$4.5B','$75M','$150M','$225M'],
                    ['$1.5T','$9.0B','$150M','$300M','$450M'],
                  ].map(([a,r,b1,b2,b3]) => (
                    <tr key={a}>
                      <td>{a}</td><td className="money">{r}</td>
                      <td className="exposure">{b1}</td><td className="exposure">{b2}</td><td className="exposure">{b3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
          <FadeIn>
            <p className="text-xs font-bold uppercase tracking-widest mt-10 mb-4"
              style={{ color: 'rgba(20,15,12,0.4)' }}>
              Model 2: 2% revenue leakage scenario (30% EBITDA conversion, 13x EV multiple)
            </p>
            <div className="overflow-x-auto">
              <table className="rlm-table" style={{ background: '#f4f4f4' }}>
                <thead>
                  <tr><th>AUM</th><th>Gross revenue</th><th>2% leakage</th><th>EBITDA impact</th><th>EV impact</th></tr>
                </thead>
                <tbody>
                  {[
                    ['$50B','$300M','$6M','$1.8M','$23M'],
                    ['$250B','$1.5B','$30M','$9.0M','$117M'],
                    ['$750B','$4.5B','$90M','$27.0M','$351M'],
                    ['$1.5T','$9.0B','$180M','$54.0M','$702M'],
                  ].map(([a,r,l,e,ev]) => (
                    <tr key={a}>
                      <td>{a}</td><td className="money">{r}</td>
                      <td className="exposure">{l}</td><td>{e}</td><td>{ev}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>

          <PullQuote>
            Enterprise-scale firms do not need large error rates to create large exposure. A temporary
            discount without an expiry, a strategy fee coded incorrectly, an unlinked household, or a
            conversion mapping error can compound quietly across years.
          </PullQuote>

          {/* ── Section 6 ───────────────────────────────────────────────── */}
          <SectionHead number="06" title="Regulatory Proof Points: Why Precision Now Matters More" id="section-06" />
          <FadeIn>
            <Body>
              The primary reason to control leakage is economic: firms should capture the revenue they have
              earned and avoid margin dilution. But the regulatory record shows that fee and revenue-control
              failures can also create remediation, penalty, and reputational costs.
            </Body>
          </FadeIn>
          <div className="my-8 space-y-0" style={{ border: '1px solid rgba(20,15,12,0.09)' }}>
            {[
              { year: '2018', title: 'SEC Advisory-Fee Risk Alert', body: 'Identified common deficiencies including fee billing based on incorrect account valuations; billing in advance or with improper frequency; applying incorrect fee rates; omitting rebates or applying discounts incorrectly, including householding and breakpoint failures; disclosure issues; and adviser expense misallocations.' },
              { year: '2023', title: 'Wells Fargo Advisors Settlement', body: "The SEC charged two Wells Fargo advisory firms with overcharging more than 10,900 investment advisory accounts by more than $26.8 million. Agreed reduced advisory fee rates were handwritten into client agreements but not entered into the firms' billing systems. Wells Fargo paid a $35 million civil penalty and reimbursed affected accountholders approximately $40 million including interest." },
              { year: '2025', title: 'SEC: $60M in Combined Civil Penalties', body: 'The SEC announced $60 million in combined civil penalties against Wells Fargo Advisors and Merrill Lynch relating to cash sweep program policies and procedures.' },
              { year: '2025', title: 'FCA Ongoing Advice Services Review', body: 'The FCA told firms to ensure consumers receive the services they are paying for, with attention to contracts, evidence, monitoring, and redress where needed.' },
              { year: '2026', title: 'CIRO Enhanced Cost Reporting', body: "Canada's CIRO enhanced cost reporting amendments take effect January 1, 2026, requiring more transparent client reporting of investment fund costs and charges." },
            ].map(({ year, title, body }, i) => (
              <FadeIn key={year + title} delay={i * 70}>
                <div className="flex gap-6 px-5 py-5"
                  style={{ borderBottom: i < 4 ? '1px solid rgba(20,15,12,0.07)' : 'none', background: i % 2 === 0 ? '#ffffff' : '#f4f4f4' }}>
                  <div className="text-sm font-bold shrink-0 w-12 mt-0.5" style={{ color: '#fb5607' }}>{year}</div>
                  <div>
                    <p className="font-semibold mb-1" style={{ color: '#140f0c' }}>{title}</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(20,15,12,0.65)' }}>{body}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
          <Callout eyebrow="Practical expectation for large firms">
            <p className="text-sm leading-relaxed">
              What is promised, configured, billed, collected, compensated, and reported must be reconcilable.
              The stronger the audit trail, the lower the cost of answering questions from regulators,
              auditors, clients, advisors, and acquirers.
            </p>
          </Callout>

          {/* ── Section 7 ───────────────────────────────────────────────── */}
          <SectionHead number="07" title="The Control Model: From Billing Accuracy to Revenue Integrity" id="section-07" />
          <FadeIn>
            <Body>
              The operating model for leakage reduction has six layers. Each layer is necessary; none is
              sufficient alone.
            </Body>
          </FadeIn>
          <FadeIn>
            <div className="my-8" style={{ background: '#f4f4f4', border: '1px solid rgba(20,15,12,0.09)' }}>
              <div className="flex gap-4 px-5 py-3" style={{ borderBottom: '2px solid rgba(20,15,12,0.1)' }}>
                <div className="w-20 shrink-0 text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(20,15,12,0.4)' }}>Layer</div>
                <div className="flex-1 text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(20,15,12,0.4)' }}>What it governs</div>
                <div className="flex-1 text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(20,15,12,0.4)' }}>Control objective</div>
              </div>
              {[
                { label: 'Policy', governs: 'Version-controlled fee schedules, discount rules, householding definitions, asset eligibility rules, proration logic, compensation rules, and exception authorities.', objective: 'Every revenue-affecting calculation can be traced to an approved policy version.' },
                { label: 'Data', governs: 'Authoritative client, household, account, product, strategy, asset, advisor, team, rep-code, and service-tier data.', objective: 'The same relationship and economic facts are used across CRM, billing, compensation, finance, and reporting.' },
                { label: 'Calculation', governs: 'Configurable fee and compensation logic across tiered, blended, marginal, performance, retainer, project, advisory, and hybrid structures.', objective: 'Results are deterministic, reproducible, and tied to the data and policy version used.' },
                { label: 'Workflow', governs: 'Approval, exception, adjustment, reconciliation, migration, collections, and dispute workflows embedded in the system.', objective: 'Revenue-impacting events happen inside a controlled workflow with owner, reason code, timestamp, and evidence.' },
                { label: 'Analytics', governs: 'Reporting that shows eligible revenue, approved adjustments, billed revenue, collected revenue, compensated revenue, and realized yield.', objective: 'Leakage is measurable by source, owner, segment, advisor, household, product, and trend.' },
                { label: 'Audit trail', governs: 'Evidence of policy changes, data changes, approvals, calculation runs, invoice adjustments, collections, payouts, and overrides.', objective: 'The firm can answer regulatory, audit, client, advisor, and M&A diligence questions without reconstruction.' },
              ].map((layer, i) => <ControlLayer key={layer.label} {...layer} index={i} />)}
            </div>
          </FadeIn>

          <PullQuote>
            Instead of asking whether the billing engine calculated the fee correctly, the firm asks whether
            the entire revenue lifecycle is governed: was the right contract term captured, the right
            household identified, the right asset base classified, the right invoice collected, the right
            advisor paid, and the right revenue reported?
          </PullQuote>

          {/* ── Section 8 ───────────────────────────────────────────────── */}
          <SectionHead number="08" title="What to Look for in a Modern Revenue Management Architecture" id="section-08" />
          <FadeIn>
            <Body>
              Once leakage is viewed as a lifecycle issue, the architecture question becomes clearer. A firm
              may still need to replace or modernize its billing engine. But the evaluation should test
              whether the future-state platform can support the full revenue management model, not just fee
              calculation.
            </Body>
          </FadeIn>
          <div className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Maintain a single, governed source of revenue policy, including fee schedules, discount approvals, asset-eligibility rules, householding definitions, proration logic, strategy fee rules, and compensation rules.',
              'Translate contracts, service terms, and product structures into executable billing, monitoring, and reporting rules.',
              'Use authoritative client, household, account, asset, advisor, team, and strategy data across billing, compensation, finance, and reporting.',
              'Calculate complex fees and payouts across products, strategies, entities, custodians, advisors, teams, and channels.',
              'Prevent exceptions from leaving the control environment by embedding approvals, reason codes, adjustment workflows, collections workflows, and reconciliation processes.',
              'Track the revenue waterfall from eligible revenue to billed revenue to collected revenue to compensated revenue.',
              'Surface leakage drivers through analytics rather than waiting for complaints, disputes, close variances, or regulatory findings.',
              'Produce audit-ready evidence for any material fee, adjustment, override, invoice, payout, or policy change.',
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 50}>
                <div className="flex gap-3 p-4 text-sm"
                  style={{ background: '#f4f4f4', border: '1px solid rgba(20,15,12,0.08)', color: 'rgba(20,15,12,0.75)' }}>
                  <span className="font-bold shrink-0" style={{ color: '#3b84ff' }}>{String(i + 1).padStart(2, '0')}</span>
                  <span>{item}</span>
                </div>
              </FadeIn>
            ))}
          </div>
          <Callout eyebrow="Five questions before replacing a billing system" accent="#3b84ff">
            <ol className="space-y-3 text-sm" style={{ color: 'rgba(20,15,12,0.8)' }}>
              {[
                'Can the platform trace revenue from agreement terms through billing, collection, compensation, and reporting?',
                'Can it compare eligible revenue, billed revenue, collected revenue, and compensated revenue?',
                'Can it govern householding, fee schedules, discounts, exclusions, proration, product strategies, and exceptions from a single source of truth?',
                'Can it use the same revenue data for finance, operations, advisor compensation, and executive analytics?',
                'Can it produce an audit-ready explanation of every material fee, adjustment, override, invoice, payout, and policy change?',
              ].map((q, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-bold shrink-0" style={{ color: '#3b84ff' }}>{i + 1}.</span>
                  <span>{q}</span>
                </li>
              ))}
            </ol>
          </Callout>

          {/* ── Conclusion ──────────────────────────────────────────────── */}
          <div id="conclusion" style={{ scrollMarginTop: '6rem' }}>
            <FadeIn>
              <div className="mt-16 mb-12 px-10 py-12 text-center" style={{ background: '#140f0c' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#fb5607' }}>
                  Conclusion
                </p>
                <h2 className="rlm-gradient-text font-bold leading-snug mb-6 max-w-2xl mx-auto"
                  style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
                  Capturing the Revenue Already Earned
                </h2>
                <p className="text-base leading-relaxed max-w-2xl mx-auto mb-5"
                  style={{ color: 'rgba(244,244,244,0.65)' }}>
                  Revenue leakage is not a single operational defect. It is the cost of allowing revenue
                  decisions to fragment across systems, teams, and control environments. In a market defined
                  by fee pressure, product complexity, advisor capacity constraints, M&A activity, and greater
                  scrutiny of client economics, that fragmentation is too expensive to ignore.
                </p>
                <p className="text-base leading-relaxed max-w-2xl mx-auto mb-8"
                  style={{ color: 'rgba(244,244,244,0.65)' }}>
                  The firms that reduce leakage will not simply run cleaner fee calculations. They will
                  connect what was promised, configured, calculated, collected, distributed, and monitored and
                  they will be able to prove that connection at scale.
                </p>
                <p className="text-lg font-semibold mb-10" style={{ color: '#f4f4f4' }}>
                  The revenue is already there. The question is whether the firm has the operating model to
                  capture it.
                </p>
                <div className="flex justify-center">
                  <a href="/contact" className="btn-alt text-center px-8 py-3 font-semibold text-sm">
                    Book a Demo
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* ── About PureFacts ─────────────────────────────────────────── */}
          <FadeIn>
            <div className="p-6 mb-12"
              style={{ background: '#f4f4f4', border: '1px solid rgba(20,15,12,0.09)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: 'rgba(20,15,12,0.4)' }}>
                About PureFacts
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(20,15,12,0.65)' }}>
                PureFacts Financial Solutions provides revenue performance management solutions for wealth and
                asset management firms. PureFacts helps firms manage complex fee calculation and billing,
                advisor and team compensation, revenue analytics, workflow, and auditability so they can
                reduce leakage, strengthen controls, and turn revenue operations into a scalable enterprise
                capability.
              </p>
            </div>
          </FadeIn>

          {/* ── Appendix ─────────────────────────────────────────────────── */}
          <FadeIn>
            <div className="pt-10 mt-10" style={{ borderTop: '1px solid rgba(20,15,12,0.1)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-6"
                style={{ color: 'rgba(20,15,12,0.35)' }}>
                Appendix A: Modeling Methodology and Assumptions
              </p>
              <div className="overflow-x-auto mb-10">
                <table className="rlm-table" style={{ background: '#f4f4f4' }}>
                  <thead>
                    <tr><th>Assumption</th><th>How to interpret it</th></tr>
                  </thead>
                  <tbody>
                    {[
                      ['AUM scale', 'Illustrative tiers of $50B, $250B, $750B, and $1.5T reflect regional, national, and enterprise wealth platforms.'],
                      ['Realized yield', 'A 60 bps yield is used for illustration. Firms should substitute actual realized yield by channel, product, client segment, and entity.'],
                      ['Basis point exposure', '1 bp equals 0.01% of AUM. The formula is AUM x (basis points / 10,000).'],
                      ['Revenue leakage percentage', 'The 2% scenario is illustrative. Firm-specific back-testing should determine actual exposure.'],
                      ['EBITDA conversion', 'The paper uses a 30% illustrative conversion rate after compensation and operating-cost effects.'],
                      ['Enterprise value multiple', 'The paper uses a 13x illustrative EBITDA multiple for sensitivity. Multiples vary by growth, margin, scale, channel, and market conditions.'],
                    ].map(([a, i]) => <tr key={a}><td>{a}</td><td>{i}</td></tr>)}
                  </tbody>
                </table>
              </div>

              <p className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: 'rgba(20,15,12,0.35)' }}>
                Appendix B: Sources
              </p>
              <ol className="space-y-2 text-xs"
                style={{ color: 'rgba(20,15,12,0.5)', listStyleType: 'decimal', paddingLeft: '1.25rem' }}>
                {[
                  ['PwC, "Private markets to account for more than half of global asset management industry revenues by 2030 — PwC 2025 Global Asset & Wealth Management Report," November 24, 2025.', 'https://www.pwc.com/gx/en/newsroom/press-releases/2025/pwc-2025-global-asset-wealth-management-report.html'],
                  ['McKinsey & Company, "The looming advisor shortage in US wealth management," February 10, 2025.', 'https://www.mckinsey.com/industries/financial-services/our-insights/the-looming-advisor-shortage-in-us-wealth-management'],
                  ['Cerulli Associates, "Fee Compression and Rising Service Demands Cause Advisors to Adjust Pricing Structure," April 29, 2025.', 'https://www.cerulli.com/press-releases/fee-compression-and-rising-service-demands-cause-advisors-to-adjust-pricing-structure'],
                  ['Broadridge, "Mitigating revenue leakage in fee billing: Strategies for optimizing fee capture and billing accuracy," 2024.', 'https://www.broadridge.com/_assets/pdf/mitigating-revenue-leakage-in-fee-billing_broadridge-white-paper.pdf'],
                  ['U.S. Securities and Exchange Commission, OCIE, "Risk Alert: Overview of the Most Frequent Advisory Fee and Expense Compliance Issues," April 12, 2018.', 'https://www.sec.gov/files/ocie-risk-alert-advisory-fee-expense-compliance.pdf'],
                  ['U.S. Securities and Exchange Commission, "Wells Fargo Settles with SEC for Charging Excessive Advisory Fees," Press Release 2023-159, August 25, 2023.', 'https://www.sec.gov/newsroom/press-releases/2023-159'],
                  ['U.S. Securities and Exchange Commission, "SEC Charges Pair of Wells Fargo Advisory Firms and Merrill Lynch with Compliance Failures Relating to Cash Sweep Programs," Press Release 2025-16, January 17, 2025.', 'https://www.sec.gov/newsroom/press-releases/2025-16'],
                  ['Financial Conduct Authority, "Ongoing financial advice services," Multi-firm review, February 24, 2025.', 'https://www.fca.org.uk/publications/multi-firm-reviews/ongoing-financial-advice-services'],
                  ['Canadian Investment Regulatory Organization, "Enhanced Cost Reporting," Rules Bulletin 25-0176, July 3, 2025.', 'https://www.ciro.ca/newsroom/publications/enhanced-cost-reporting'],
                  ['Charles Schwab Advisor Services, "2025 RIA Benchmarking Study: Growth drivers and performance," 2025.', 'https://advisorservices.schwab.com/insights-hub/perspectives/ria-benchmarking-study-2025'],
                  ['PureFacts, "PureFacts Named to the WealthTech100: A Continued Legacy of Innovation," April 8, 2026.', 'https://purefacts.com/purefacts-wealthtech100-2026/'],
                ].map(([cite, url], i) => (
                  <li key={i}>
                    {cite}{' '}
                    <a href={url} target="_blank" rel="noopener noreferrer"
                      className="underline" style={{ color: '#3b84ff' }}>
                      {url}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </FadeIn>

        </article>

        {/* ── Sticky TOC sidebar ───────────────────────────────────────── */}
        <aside style={{
          display: 'none',
          width: '14rem',
          flexShrink: 0,
          position: 'sticky',
          top: '6rem',
          alignSelf: 'flex-start',
          maxHeight: 'calc(100vh - 8rem)',
          overflowY: 'auto',
        }}
        className="rlm-toc-sidebar">
          <TableOfContents />
        </aside>

      </div>
    </main>
  )
}