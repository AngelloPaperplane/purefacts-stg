'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'

// ─── Animated counter ─────────────────────────────────────────────────────────
function useCounter(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return value
}

// ─── Intersection observer ────────────────────────────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

// ─── Word-by-word scroll-illuminated heading ─────────────────────────────────
function IlluminatedHeading({
  white,
  dim,
  className = '',
}: {
  white: string
  dim: string
  className?: string
}) {
  const ref = useRef<HTMLHeadingElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const rect = el.getBoundingClientRect()
      const vh   = window.innerHeight
      const p = Math.min(1, Math.max(0, (vh - rect.bottom) / (vh * 0.5)))
      setProgress(p)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  const words = [...white.split(' '), ...dim.split(' ')]
  const total = words.length

  return (
    <h2 ref={ref} className={className} style={{ lineHeight: 1.1 }}>
      <BreadcrumbJsonLd pathname="/platform/fee-manager" />
      {words.map((word, i) => {
        const threshold = i / total
        const raw = progress > threshold
          ? Math.min(1, 0.2 + ((progress - threshold) / (1 / total)) * 0.8)
          : 0.2
        return (
          <span
            key={i}
            style={{
              color: `rgba(244,244,244,${Math.min(1, raw).toFixed(3)})`,
              transition: 'color 0.12s ease',
              marginRight: i < words.length - 1 ? '0.28em' : 0,
              display: 'inline-block',
            }}
          >
            {word}
          </span>
        )
      })}
    </h2>
  )
}

// ─── Animated hero grid (moving light source) ────────────────────────────────
function AnimatedHeroGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0, h = 0
    const resize = () => {
      w = canvas.width  = canvas.offsetWidth
      h = canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const CELL = 64
    let t = 0

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      const lx = w * 0.5 + Math.sin(t * 0.4) * w * 0.32
      const ly = h * 0.5 + Math.sin(t * 0.8) * h * 0.28
      const cols = Math.ceil(w / CELL) + 1
      const rows = Math.ceil(h / CELL) + 1

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = c * CELL
          const y = r * CELL
          const dist = Math.hypot(x - lx, y - ly)
          const alpha = Math.max(0, 1 - dist / 480) * 0.18
          if (alpha <= 0.004) continue

          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x + CELL, y)
          ctx.strokeStyle = `rgba(244,244,244,${alpha.toFixed(3)})`
          ctx.lineWidth = 1
          ctx.stroke()

          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x, y + CELL)
          ctx.stroke()
        }
      }

      t += 0.008
      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-100"
      style={{ display: 'block' }}
      aria-hidden="true"
    />
  )
}

// ─── SVG arc builder ──────────────────────────────────────────────────────────
function buildArc(cx: number, cy: number, r: number, startPct: number, pct: number) {
  function polar(angleDeg: number) {
    const rad = (angleDeg - 90) * (Math.PI / 180)
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }
  const s = polar(startPct * 3.6)
  const e = polar((startPct + pct) * 3.6)
  return `M ${s.x.toFixed(3)} ${s.y.toFixed(3)} A ${r} ${r} 0 ${pct > 50 ? 1 : 0} 1 ${e.x.toFixed(3)} ${e.y.toFixed(3)}`
}

// ─── Living Ledger ────────────────────────────────────────────────────────────
const DONUT_SEGMENTS = [
  { label: 'Fund A', pct: 72.4, color: '#FACC22', index: 0 },
  { label: 'Fund B', pct: 18.2, color: '#FB5607', index: 1 },
  { label: 'Other',  pct: 9.4,  color: '#4760FF', index: 2 },
]
const METRICS = [
  { label: 'AUTOMATED RECON',  value: 'Matching Engines Active',     color: '#FACC22', segIdx: 0 },
  { label: 'PENDING APPROVAL', value: 'Q4 Carry Distribution',       color: '#FB5607', segIdx: 1 },
  { label: 'SYSTEM HEALTH',    value: '99.99% Calculation Accuracy',  color: '#4760FF', segIdx: 2 },
]

function LiveLedger() {
  const [activeMetric, setActiveMetric] = useState(0)
  const [hoveredSeg, setHoveredSeg]     = useState<number | null>(null)
  const { ref, inView } = useInView(0.3)

  const feesCount  = useCounter(142509211, 2200, inView)
  const highlighted = hoveredSeg !== null ? hoveredSeg : activeMetric
  const activeSeg   = DONUT_SEGMENTS[highlighted]
  const activeColor = METRICS[activeMetric].color

  useEffect(() => {
    if (!inView) return
    const id = setInterval(() => setActiveMetric(m => (m + 1) % 3), 2600)
    return () => clearInterval(id)
  }, [inView])

  const cx = 80, cy = 80
  let cum = 0
  const arcs = DONUT_SEGMENTS.map(seg => {
    const d = buildArc(cx, cy, 60, cum, seg.pct)
    cum += seg.pct
    return { ...seg, d }
  })

  return (
    <div ref={ref} style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div
        className="relative overflow-hidden"
        role="img"
        aria-label="Live fee management dashboard showing total fees managed and real-time system metrics"
        style={{
          background: 'rgba(20,15,12,0.75)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: `0 0 80px rgba(71,96,255,0.08), inset 0 1px 0 rgba(255,255,255,0.06)`,
        }}
      >
        <div
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2"
          style={{
            width: '700px',
            height: '200px',
            background: `radial-gradient(ellipse, ${activeColor}14 0%, transparent 70%)`,
            filter: 'blur(50px)',
            transition: 'background 1s ease',
          }}
          aria-hidden="true"
        />

        {/* Header */}
        <div
          className="relative flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div>
            <p className="text-xs font-semibold tracking-[0.18em]" style={{ color: 'rgba(244,244,244,0.28)' }}>
              TOTAL FEES MANAGED
            </p>
            <p className="mt-1 font-bold tabular-nums" style={{ fontSize: '2rem', letterSpacing: '-0.02em', color: '#f4f4f4' }}>
              <span style={{ color: 'rgba(244,244,244,0.32)' }}>$</span>
              {inView ? feesCount.toLocaleString('en-US') : '0'}
              <span style={{ color: activeColor, transition: 'color 0.8s ease' }}>.82</span>
            </p>
          </div>
          <div className="flex gap-2" aria-hidden="true">
            {[{ icon: '↗', bg: 'rgba(255,255,255,0.05)' }, { icon: '↻', bg: '#FB5607' }].map((btn, i) => (
              <button
                key={i}
                className="flex h-9 w-9 items-center justify-center text-sm font-bold transition-opacity hover:opacity-75 sm:h-10 sm:w-10"
                style={{ background: btn.bg, border: '1px solid rgba(255,255,255,0.1)', color: '#f4f4f4' }}
                aria-label={i === 0 ? 'Export data' : 'Refresh data'}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col sm:flex-row">
          {/* Donut */}
          <div
            className="flex flex-col items-center justify-center gap-4 p-6 sm:p-10"
            style={{ borderRight: '1px solid rgba(255,255,255,0.05)', minWidth: '200px' }}
          >
            <div className="relative" style={{ overflow: 'visible' }}>
              <svg
                width="160"
                height="160"
                viewBox="0 0 160 160"
                style={{ overflow: 'visible' }}
                role="img"
                aria-label={`Donut chart showing ${activeSeg.label} at ${activeSeg.pct}%`}
              >
                <circle cx={cx} cy={cy} r={60} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="16" />
                {arcs.map(seg => {
                  const isHl = highlighted === seg.index
                  return (
                    <path
                      key={seg.label}
                      d={seg.d}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth={isHl ? 20 : 14}
                      strokeLinecap="butt"
                      style={{
                        opacity: isHl ? 1 : 0.28,
                        transition: 'all 0.4s ease',
                        cursor: 'pointer',
                        filter: isHl ? `drop-shadow(0 0 6px ${seg.color}aa)` : 'none',
                      }}
                      onMouseEnter={() => setHoveredSeg(seg.index)}
                      onMouseLeave={() => setHoveredSeg(null)}
                      aria-label={`${seg.label}: ${seg.pct}%`}
                    />
                  )
                })}
                <text x={cx} y={cy - 6} textAnchor="middle" fill="#f4f4f4" fontSize="20" fontWeight="700">
                  {activeSeg.pct}%
                </text>
                <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(244,244,244,0.32)" fontSize="9" letterSpacing="1.5">
                  {activeSeg.label.toUpperCase()}
                </text>
              </svg>
              <div
                className="pointer-events-none absolute"
                style={{
                  top: '50%', left: '50%',
                  width: '80px', height: '80px',
                  transform: 'translate(-50%, -50%)',
                  background: `radial-gradient(circle, ${activeSeg.color}1a 0%, transparent 70%)`,
                  transition: 'background 0.5s ease',
                  borderRadius: '50%',
                }}
                aria-hidden="true"
              />
            </div>
            <p
              className="text-center text-xs leading-relaxed"
              style={{ color: 'rgba(244,244,244,0.28)', maxWidth: '150px' }}
            >
              Real-time allocation of performance fees across global entities.
            </p>
          </div>

          {/* Metrics */}
          <div className="flex flex-1 flex-col justify-center gap-3 p-5 sm:p-8">
            {METRICS.map((m, i) => {
              const isActive = activeMetric === i
              return (
                <div
                  key={m.label}
                  className="flex cursor-pointer items-center gap-4 px-4 py-3 transition-all duration-500 sm:px-5 sm:py-4"
                  style={{
                    background: isActive ? `${m.color}0a` : 'rgba(255,255,255,0.02)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: `1px solid ${isActive ? `${m.color}2a` : 'rgba(255,255,255,0.05)'}`,
                    transform: isActive ? 'translateX(6px)' : 'none',
                  }}
                  onMouseEnter={() => { setActiveMetric(i); setHoveredSeg(m.segIdx) }}
                  onMouseLeave={() => setHoveredSeg(null)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  aria-label={`${m.label}: ${m.value}`}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setActiveMetric(i) }}
                >
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                      background: m.color,
                      boxShadow: isActive ? `0 0 8px ${m.color}` : 'none',
                      transition: 'box-shadow 0.4s ease',
                    }}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold tracking-[0.14em]" style={{ color: 'rgba(244,244,244,0.28)' }}>
                      {m.label}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold" style={{ color: isActive ? '#f4f4f4' : 'rgba(244,244,244,0.48)' }}>
                      {m.value}
                    </p>
                  </div>
                  <div
                    className="h-8 w-0.5 shrink-0"
                    style={{
                      background: isActive ? m.color : 'transparent',
                      boxShadow: isActive ? `0 0 6px ${m.color}` : 'none',
                      transition: 'all 0.4s ease',
                    }}
                    aria-hidden="true"
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Outcome mosaic ───────────────────────────────────────────────────────────
const OUTCOMES = [
  {
    title: 'Complex Fee Coverage',
    body: 'Handle multi-entity, multi-currency receivables and payables, including mandates and retrocession/rebates, with zero manual intervention.',
    tags: ['RECURSIVE', 'MULTI-CURRENCY', 'TIERED'],
    color: '#FACC22',
    wide: true,
  },
  {
    title: 'Finance-Ready Outputs',
    body: 'Direct exports to SAP, Oracle, and NetSuite. Audit-trailed and reconciliation-ready.',
    color: '#0DCCFF',
    wide: false,
    tags: null,
  },
  {
    title: 'Exception-Proof',
    body: 'Automated flagging of anomalies before they hit the ledger. Every break caught, tracked, and resolved.',
    color: '#FB5607',
    wide: false,
    tags: null,
  },
  {
    title: 'Immutable Logs',
    body: 'Every calculation is timestamped and cryptographically signed for regulatory compliance. Full audit trail from intake to close.',
    color: '#4760FF',
    wide: true,
    tags: null,
  },
]

function GlassCard({ outcome, delay, inView }: {
  outcome: typeof OUTCOMES[0]
  delay: number
  inView: boolean
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="group relative overflow-hidden transition-all duration-700"
      style={{
        flex: outcome.wide ? '2 1 0%' : '1 1 0%',
        minHeight: '200px',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transitionDelay: `${delay}ms`,
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${hovered ? `${outcome.color}40` : `${outcome.color}28`}`,
        boxShadow: hovered
          ? `0 0 40px ${outcome.color}10, inset 0 1px 0 rgba(255,255,255,0.08)`
          : 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="pointer-events-none absolute -top-8 left-0 h-28 w-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(ellipse 50% 90% at 30% 0%, ${outcome.color}0c, transparent)` }}
        aria-hidden="true"
      />
      <div className="relative p-6 sm:p-9">
        <div
          className="mb-5 h-2 w-2 rounded-full"
          style={{ background: outcome.color, boxShadow: `0 0 8px ${outcome.color}` }}
          aria-hidden="true"
        />
        <h3 className="mb-3 text-lg font-bold sm:text-xl" style={{ color: '#f4f4f4' }}>
          {outcome.title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(244,244,244,0.52)' }}>
          {outcome.body}
        </p>
        {outcome.tags && (
          <div className="mt-5 flex flex-wrap gap-2">
            {outcome.tags.map(tag => (
              <span
                key={tag}
                className="px-2.5 py-1 text-[10px] font-bold tracking-widest"
                style={{
                  background: `${outcome.color}12`,
                  border: `1px solid ${outcome.color}2e`,
                  color: outcome.color,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function OutcomeMosaic() {
  const { ref, inView } = useInView(0.1)
  return (
    <div ref={ref} className="mx-auto max-w-7xl px-6">
      <div className="flex flex-col gap-4 lg:flex-row">
        {OUTCOMES.slice(0, 2).map((o, i) => (
          <GlassCard key={o.title} outcome={o} delay={i * 80} inView={inView} />
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row">
        {OUTCOMES.slice(2, 4).map((o, i) => (
          <GlassCard key={o.title} outcome={o} delay={160 + i * 80} inView={inView} />
        ))}
      </div>
    </div>
  )
}

// ─── Platform capabilities selector ──────────────────────────────────────────
const FEATURES = [
  {
    id: 'data',
    title: 'Data & Contract Management',
    tag: '01',
    body: 'Maintain data and fee contracts: schedules, policies, and payment instructions, with automated validation and full exception handling. One governed source of truth from intake to export.',
    points: ['Fee schedules and policies', 'Payment instructions', 'Automated validation', 'Exception flagging'],
    color: '#FACC22',
  },
  {
    id: 'calc',
    title: 'Fee Calculation',
    tag: '02',
    body: 'Configurable runs, periodic or ad hoc, with complex multi-entity, multi-currency formulas. Externally calculated fee support and calculation exception handling keep every run accurate.',
    points: ['Complex formulas', 'Multi-currency support', 'Ad hoc or scheduled runs', 'Externally calculated fees'],
    color: '#FB5607',
  },
  {
    id: 'payment',
    title: 'Payment & Booking',
    tag: '03',
    body: 'Flexible booking rules covering debit/credit, accruals, corrections, and reversals, with optional payment interfaces and full reconciliation. Sub-ledger entries generated automatically.',
    points: ['Debit/credit booking rules', 'Accruals and reversals', 'Payment interfaces', 'Reconciliation'],
    color: '#4760FF',
  },
  {
    id: 'reports',
    title: 'Reports & Exports',
    tag: '04',
    body: 'Operational dashboards plus exportable views in CSV, Excel, and PDF. Configurable MIS and BI outputs, plus client statements ready for SAP, Oracle, and NetSuite.',
    points: ['Client statements', 'CSV / Excel / PDF exports', 'Configurable MIS/BI outputs', 'GL-ready exports'],
    color: '#0DCCFF',
  },
  {
    id: 'controls',
    title: 'Controls & Approvals',
    tag: '05',
    body: 'Tolerance and threshold checks. Maker-checker approvals. User checkpoints at every stage. Full audit trail from intake to close, built for finance teams that need to prove every number.',
    points: ['Tolerance/threshold checks', 'Maker-checker approvals', 'Segregation of duties', 'Complete audit trail'],
    color: '#FACC22',
  },
  {
    id: 'exceptions',
    title: 'Exception Handling & Reprocessing',
    tag: '06',
    body: 'Detect breaks early. Correct, adjust, and reprocess with full control: total or delta. No manual workarounds, no silent errors. Every exception is tracked, resolved, and documented.',
    points: ['Break detection', 'Corrections and adjustments', 'Delta reprocessing', 'Documented resolution'],
    color: '#FB5607',
  },
]

const AUTOPLAY_DURATION = 4000

function CapabilitySelector() {
  const [active, setActive]   = useState(0)
  const [paused, setPaused]   = useState(false)
  const [fillPct, setFillPct] = useState(0)
  const startRef              = useRef<number>(Date.now())
  const rafRef                = useRef<number>(0)
  const feat = FEATURES[active]

  const goTo = (i: number) => {
    setActive(i)
    setFillPct(0)
    startRef.current = Date.now()
  }

  useEffect(() => {
    if (paused) { cancelAnimationFrame(rafRef.current); return }
    startRef.current = Date.now()

    const tick = () => {
      const elapsed = Date.now() - startRef.current
      const pct = Math.min(100, (elapsed / AUTOPLAY_DURATION) * 100)
      setFillPct(pct)
      if (elapsed >= AUTOPLAY_DURATION) {
        setActive(a => (a + 1) % FEATURES.length)
        startRef.current = Date.now()
        setFillPct(0)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [paused, active])

  return (
    <div className="mx-auto max-w-7xl px-6">
      <div
        className="flex flex-col gap-6 lg:flex-row lg:gap-8"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => { startRef.current = Date.now(); setFillPct(0); setPaused(false) }}
      >
        {/* Left: feature list */}
        <div className="flex flex-col gap-2 lg:w-[45%]" role="tablist" aria-label="Platform capabilities">
          {FEATURES.map((f, i) => {
            const isActive = active === i
            return (
              <button
                key={f.id}
                onClick={() => goTo(i)}
                onMouseEnter={() => goTo(i)}
                className="relative flex w-full items-center gap-4 overflow-hidden px-5 py-4 text-left transition-all duration-300 sm:px-6 sm:py-5"
                role="tab"
                aria-selected={isActive}
                aria-controls={`capability-panel-${f.id}`}
                id={`capability-tab-${f.id}`}
                style={{
                  background: isActive ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: `1px solid ${isActive ? `${f.color}3a` : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: isActive ? `inset 0 0 20px ${f.color}05` : 'none',
                }}
              >
                {isActive && !paused && (
                  <div
                    className="pointer-events-none absolute bottom-0 left-0 h-[2px]"
                    style={{
                      width: `${fillPct}%`,
                      background: f.color,
                      boxShadow: `0 0 6px ${f.color}`,
                      transition: 'none',
                    }}
                    aria-hidden="true"
                  />
                )}
                <span
                  className="shrink-0 text-xs font-black tabular-nums tracking-widest"
                  style={{ color: isActive ? f.color : 'rgba(244,244,244,0.18)', minWidth: '24px' }}
                  aria-hidden="true"
                >
                  {f.tag}
                </span>
                <div
                  className="h-5 w-0.5 shrink-0 transition-all duration-300"
                  style={{
                    background: isActive ? f.color : 'rgba(255,255,255,0.1)',
                    boxShadow: isActive ? `0 0 6px ${f.color}` : 'none',
                  }}
                  aria-hidden="true"
                />
                <span
                  className="flex-1 text-sm font-semibold transition-colors duration-300"
                  style={{ color: isActive ? '#f4f4f4' : 'rgba(244,244,244,0.42)' }}
                >
                  {f.title}
                </span>
                <span
                  className="ml-auto text-base transition-all duration-300"
                  style={{
                    color: isActive ? f.color : 'rgba(244,244,244,0.15)',
                    transform: isActive ? 'translateX(3px)' : 'none',
                  }}
                  aria-hidden="true"
                >
                  &rarr;
                </span>
              </button>
            )
          })}
        </div>

        {/* Right: capability detail */}
        <div className="lg:w-[55%]">
          <div
            className="sticky top-24 relative overflow-hidden transition-all duration-500"
            id={`capability-panel-${feat.id}`}
            role="tabpanel"
            aria-labelledby={`capability-tab-${feat.id}`}
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: `1px solid ${feat.color}38`,
              boxShadow: `0 0 50px ${feat.color}0a, inset 0 1px 0 rgba(255,255,255,0.06)`,
              minHeight: '380px',
            }}
          >
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 opacity-20 transition-all duration-500"
              style={{
                background: `radial-gradient(circle, ${feat.color} 0%, transparent 70%)`,
                filter: 'blur(40px)',
              }}
              aria-hidden="true"
            />

            <div className="relative p-6 sm:p-10">
              <div className="mb-6 flex items-start gap-4 sm:mb-7">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center text-sm font-black transition-all duration-500"
                  style={{
                    background: `${feat.color}16`,
                    border: `1px solid ${feat.color}38`,
                    color: feat.color,
                  }}
                  aria-hidden="true"
                >
                  {feat.tag}
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.18em]" style={{ color: feat.color }}>
                    CAPABILITY
                  </p>
                  <h3 className="mt-1 text-lg font-bold sm:text-xl" style={{ color: '#f4f4f4' }}>
                    {feat.title}
                  </h3>
                </div>
              </div>

              <p className="mb-7 text-sm leading-relaxed sm:mb-8" style={{ color: 'rgba(244,244,244,0.6)' }}>
                {feat.body}
              </p>

              <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {feat.points.map(p => (
                  <li
                    key={p}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{
                      background: 'rgba(255,255,255,0.025)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: feat.color, boxShadow: `0 0 5px ${feat.color}` }}
                      aria-hidden="true"
                    />
                    <span className="text-sm" style={{ color: 'rgba(244,244,244,0.72)' }}>
                      {p}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}


export default function FeeManagerPage() {
  const [heroVisible, setHeroVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <main style={{ background: '#140f0c', color: '#f4f4f4' }}>

      {/* ── 1. Hero ───────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: '#140f0c', paddingTop: '80px' }}
        aria-label="FeeManager automated fee billing engine"
      >
        <AnimatedHeroGrid />

        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(71,96,255,0.16) 0%, transparent 65%)' }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-16 text-center sm:pb-28 sm:pt-20">
          <div
            className="mb-8 flex justify-center"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? 'translateY(0)' : 'translateY(10px)',
              transition: 'all 0.6s ease',
            }}
          >
            <Image
              src="/logos/fee-manager-white.svg"
              alt="FeeManager by PureFacts"
              width={160}
              height={40}
              className="h-10 w-auto"
            />
          </div>

          <h1
            className="mx-auto max-w-4xl text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-7xl"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.7s ease 0.1s',
            }}
          >
            Control Every Fee.{' '}
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #FACC22 0%, #FB5607 35%, #4760FF 70%, #0DCCFF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              End-to-End.
            </span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-3xl text-base leading-relaxed sm:mt-7 sm:text-lg"
            style={{
              color: 'rgba(244,244,244,0.52)',
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.7s ease 0.2s',
            }}
          >
            Automate end-to-end fee operations: from data and contracts to calculation,
            approvals, booking, and GL-ready exports. Reduce breaks, control
            exceptions, and close with confidence.
          </p>

          <div
            className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:mt-10"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.7s ease 0.3s',
            }}
          >
            <Link href="/contact" className="btn-primary">Book a Demo</Link>
          </div>
        </div>
      </section>

      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, #FACC22, #FB5607, #4760FF, #0DCCFF)' }} aria-hidden="true" />

      {/* ── 2. Outcome mosaic ─────────────────────────────────── */}
      <section className="py-16 sm:py-24" style={{ background: '#140f0c' }} aria-label="FeeManager outcomes">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-3 text-xs font-bold tracking-widest uppercase" style={{ color: '#fb5607' }}>
            Precision-Engineered Outcomes
          </p>
          <IlluminatedHeading
            white="Built for the complexity"
            dim="of enterprise fee ops"
            className="mb-10 text-2xl font-bold sm:mb-12 sm:text-3xl lg:text-4xl"
          />
        </div>
        <OutcomeMosaic />
      </section>

      {/* ── 3. Living Ledger ──────────────────────────────────── */}
      <section
        className="relative py-20 sm:py-28"
        style={{ background: '#140f0c', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        aria-label="Real-time fee visibility"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: '900px', height: '500px',
              background: 'radial-gradient(ellipse, rgba(71,96,255,0.07) 0%, rgba(250,204,34,0.03) 40%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center sm:mb-16">
            <p className="mb-3 text-xs font-bold tracking-widest uppercase" style={{ color: '#FACC22' }}>
              Real-Time Visibility
            </p>
            <h2 className="text-2xl font-bold sm:text-3xl lg:text-5xl" style={{ color: '#f4f4f4' }}>
              The Living Ledger Interface
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base sm:mt-5" style={{ color: 'rgba(244,244,244,0.42)' }}>
              Data is no longer static. Watch your fee operations breathe with real-time
              kinetic visualizations.
            </p>
          </div>
          <LiveLedger />
        </div>
      </section>

      {/* ── 4. Platform capabilities ──────────────────────────── */}
      <section className="py-16 sm:py-24" style={{ background: '#140f0c' }} aria-label="Platform capabilities">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-3 text-xs font-bold tracking-widest uppercase" style={{ color: '#fb5607' }}>
            Platform Capabilities
          </p>
          <IlluminatedHeading
            white="Turn Fee Operations Into a"
            dim="Growth Advantage"
            className="mb-12 text-2xl font-bold sm:mb-16 sm:text-3xl lg:text-4xl"
          />
        </div>
        <CapabilitySelector />
      </section>

      {/* ── 5. CTA band ───────────────────────────────────────── */}
      <section className="bg-[#140f0c] py-12 sm:py-14" aria-label="Get started with FeeManager">
        <div className="mx-auto max-w-7xl px-6">
          <div>
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">

              <div className="flex flex-col gap-6 sm:gap-8 lg:w-1/2">
                {[
                  {
                    icon: 'fa-infinity',
                    iconColor: '#FACC22',
                    title: 'End-to-End Control',
                    desc: 'One governed workflow from data intake to GL-ready export. No spreadsheet bridges, no manual handoffs between systems.',
                  },
                  {
                    icon: 'fa-shield-halved',
                    iconColor: '#FB5607',
                    title: 'Built-In Audit Confidence',
                    desc: 'Tolerances, maker-checker approvals, and a complete audit trail baked into every step. Close with confidence.',
                  },
                  {
                    icon: 'fa-bolt',
                    iconColor: '#0DCCFF',
                    title: 'Exception-Proof by Design',
                    desc: 'Breaks are detected early, tracked, and resolved with full control. No silent errors, no manual workarounds.',
                  },
                ].map(({ icon, iconColor, title, desc }) => (
                  <div key={title} className="flex items-start gap-4 sm:gap-5">
                    <div
                      className="flex h-12 w-12 shrink-0 items-start justify-start sm:h-12 sm:w-12"
                      aria-hidden="true"
                    >
                      <i className={`fa-solid ${icon} text-lg`} style={{ color: iconColor, lineHeight: 1 }} />
                    </div>
                    <div>
                      <p className="text-base font-bold" style={{ color: '#f4f4f4', lineHeight: 1 }}>{title}</p>
                      <p className="mt-1 text-sm leading-relaxed" style={{ color: 'rgba(244,244,244,0.5)' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:w-1/2">
                <h2 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl" style={{ color: '#f4f4f4' }}>
                  Ready to Turn Fee Operations Into a{' '}
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #FACC22, #FB5607, #4760FF, #0DCCFF)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Growth Advantage?
                  </span>
                </h2>
                <p className="mt-4 text-base leading-relaxed" style={{ color: 'rgba(244,244,244,0.52)' }}>
                  Join the world&apos;s most sophisticated finance teams automating their
                  fee operations with FeeManager by PureFacts.
                </p>
                <div className="mt-6 sm:mt-8">
                  <Link href="/contact" className="btn-alt">Book a Demo</Link>
                </div>
                <p className="mt-5 text-sm" style={{ color: 'rgba(244,244,244,0.3)' }}>
                  Trusted by the world&apos;s top financial institutions
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

    </main>
  )
}