'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const C = {
  bg:      '#140f0c',
  surface: '#1a1410',
  text:    '#f4f4f4',
  body:    'rgba(244,244,244,0.75)',
  subtle:  'rgba(244,244,244,0.45)',
  border:  'rgba(255,255,255,0.07)',
  azure:   '#3b84ff',
  mandarin:'#fb5607',
  honey:   '#ffb30c',
  comp:    '#FF006E',
  sunset:  'linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%)',
} as const

function GradientText({ children }: { children: React.ReactNode }) {
  return <span style={{ background: C.sunset, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{children}</span>
}

function Eyebrow({ children, color = C.comp }: { children: React.ReactNode; color?: string }) {
  return <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.20em', color, margin: '0 0 14px' }}>{children}</p>
}

function useReveal(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    obs.observe(el); return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}


function useBreakpoint() {
  const [w, setW] = useState(1280)
  useEffect(() => {
    const update = () => setW(window.innerWidth)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return { isMobile: w < 640, isTablet: w < 1024, w }
}

function Reveal({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(22px)', transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`, ...style }}>
      {children}
    </div>
  )
}

/* ─── PAYOUT PANEL (hero graphic) ───────────────────────────── */
function PayoutPanel() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    const c = containerRef.current; if (!c) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        obs.disconnect()
        timerRef.current = setTimeout(() => setPhase(1), 200)
        timerRef.current = setTimeout(() => setPhase(2), 600)
        timerRef.current = setTimeout(() => setPhase(3), 1000)
      }
    }, { threshold: 0.15 })
    obs.observe(c)
    return () => { obs.disconnect(); if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const ADVISORS = [
    { name: 'Advisor A', items: [{ label: 'Base commission', amount: '$18,400' }, { label: 'AUM bonus tier', amount: '+$2,100' }, { label: 'New client credit', amount: '+$750' }, { label: 'Exception override', amount: '−$200' }], total: '$21,050' },
    { name: 'Advisor B', items: [{ label: 'Base commission', amount: '$12,600' }, { label: 'Retention bonus', amount: '+$900' }, { label: 'Fee waiver applied', amount: '−$150' }], total: '$13,350' },
    { name: 'Advisor C', items: [{ label: 'Base commission', amount: '$9,200' }, { label: 'Referral credit', amount: '+$600' }], total: '$9,800' },
  ]

  return (
    <div ref={containerRef} style={{ background: C.surface, border: `1px solid ${C.border}`, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: C.subtle }}>Payout Statement — Q3</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.comp, letterSpacing: '0.10em' }}>VERIFIED ✓</span>
      </div>
      {ADVISORS.map((adv, ai) => (
        <motion.div key={adv.name} initial={{ opacity: 0, y: 10 }} animate={phase > ai ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} style={{ marginBottom: ai < ADVISORS.length - 1 ? 12 : 0 }}>
          <div style={{ background: C.bg, border: `1px solid ${C.comp}30`, padding: '10px 12px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 3, bottom: 0, background: C.comp, opacity: 0.7 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.comp, letterSpacing: '0.10em', textTransform: 'uppercase' as const }}>{adv.name}</span>
            </div>
            {adv.items.map((item, ii) => (
              <motion.div key={item.label} initial={{ opacity: 0 }} animate={phase > ai ? { opacity: 1 } : {}} transition={{ duration: 0.3, delay: ii * 0.08 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                <span style={{ fontSize: 10, color: C.subtle }}>{item.label}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: item.amount.startsWith('−') ? C.mandarin : C.text }}>{item.amount}</span>
              </motion.div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 6, borderTop: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.subtle, textTransform: 'uppercase' as const, letterSpacing: '0.10em' }}>Total</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{adv.total}</span>
            </div>
          </div>
        </motion.div>
      ))}
      <p style={{ textAlign: 'center', fontSize: 11, color: C.subtle, letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontWeight: 600, marginTop: 14, marginBottom: 0 }}>
        Every line item traceable and explainable
      </p>
    </div>
  )
}

/* ─── PRICING EXCEPTION TIMELINE ──────────────────────────── */
function ExceptionTimeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const c = containerRef.current; if (!c) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        obs.disconnect()
        ;[0, 1, 2, 3, 4].forEach(i => setTimeout(() => setPhase(i + 1), 200 + i * 240))
      }
    }, { threshold: 0.2 })
    obs.observe(c); return () => obs.disconnect()
  }, [])

  const ENTRIES = [
    { quarter: 'Q1',  label: 'Temp concession granted', status: 'Temporary',     note: '90-day discount, pending review',      color: C.azure,    statusColor: C.azure    },
    { quarter: 'Q2',  label: 'Still active, no review',  status: 'Overdue',       note: 'Review missed, discount continues',    color: C.honey,    statusColor: C.honey    },
    { quarter: 'Q3',  label: 'Exception compounding',    status: 'Embedded',      note: '3 similar exceptions added',           color: C.mandarin, statusColor: C.mandarin },
    { quarter: 'Q4',  label: 'Now the default rate',     status: 'Permanent',     note: 'Advisor expects this pricing',         color: '#ff3b3b',  statusColor: '#ff3b3b'  },
    { quarter: 'Y+1', label: 'Structural leakage',       status: 'Unrecoverable', note: 'Embedded in cost structure',           color: '#ff3b3b',  statusColor: '#ff3b3b'  },
  ]

  return (
    <div ref={containerRef} style={{ background: C.surface, border: `1px solid ${C.border}`, padding: 16 }}>
      <div style={{ marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: C.subtle }}>Pricing Exception Lifecycle</span>
      </div>
      <div style={{ position: 'relative', paddingLeft: 32 }}>
        <div style={{ position: 'absolute', left: 12, top: 0, bottom: 0, width: 1, background: C.border }} />
        {ENTRIES.map((e, i) => (
          <motion.div key={e.quarter}
            initial={{ opacity: 0, x: -8 }}
            animate={phase > i ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'relative', marginBottom: i < ENTRIES.length - 1 ? 14 : 0, paddingLeft: 10 }}
          >
            <div style={{ position: 'absolute', left: -26, top: 8, width: 10, height: 10, borderRadius: '50%', background: e.color, border: `1px solid ${e.color}`, boxShadow: `0 0 6px ${e.color}60` }} />
            <div style={{ background: C.bg, border: `1px solid ${e.color}30`, padding: '8px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: e.color }}>{e.quarter}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{e.label}</span>
                </div>
                <span style={{ fontSize: 8, fontWeight: 700, color: e.statusColor, letterSpacing: '0.10em', textTransform: 'uppercase' as const, flexShrink: 0 }}>{e.status}</span>
              </div>
              <p style={{ fontSize: 10, color: C.subtle, margin: 0, fontStyle: 'italic' }}>{e.note}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={phase >= 5 ? { opacity: 1 } : {}} transition={{ duration: 0.5, delay: 0.3 }}
        style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(255,59,59,0.06)', border: '1px solid rgba(255,59,59,0.22)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ff3b3b', fontSize: 11 }} aria-hidden="true" />
        <span style={{ fontSize: 10, color: '#ff3b3b', fontWeight: 600 }}>Temporary exceptions become structural leakage without governance.</span>
      </motion.div>
    </div>
  )
}

/* ─── STAT COUNT ───────────────────────────────────────────── */
function StatCount({ value, prefix = '', suffix = '', color }: { value: number; prefix?: string; suffix?: string; color: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const triggered = useRef(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !triggered.current) {
        triggered.current = true; obs.disconnect()
        const start = Date.now(); const dur = 1600
        const tick = () => { const p = Math.min((Date.now() - start) / dur, 1); const eased = 1 - Math.pow(1 - p, 3); setCount(Math.round(eased * value)); if (p < 1) requestAnimationFrame(tick) }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    obs.observe(el); return () => obs.disconnect()
  }, [value])
  return <div ref={ref} style={{ fontSize: 'clamp(2.4rem,4.5vw,3.4rem)', fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.02em' }}>{prefix}{count}{suffix}</div>
}

function LargeStatCount({ value, prefix = '', suffix = '', color = C.text }: { value: number; prefix?: string; suffix?: string; color?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const triggered = useRef(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !triggered.current) {
        triggered.current = true; obs.disconnect()
        const start = Date.now(); const dur = 1800
        const tick = () => { const p = Math.min((Date.now() - start) / dur, 1); const eased = 1 - Math.pow(1 - p, 3); setCount(Math.round(eased * value)); if (p < 1) requestAnimationFrame(tick) }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    obs.observe(el); return () => obs.disconnect()
  }, [value])
  return <div ref={ref} style={{ fontSize: 'clamp(4rem,10vw,7rem)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', color: C.text, margin: 0 }} aria-label={`${prefix}${value}${suffix}`}>{prefix}{count}<span style={{ color: C.text }}>{suffix}</span></div>
}

/* ─── PLATFORM DIAGRAM ─────────────────────────────────────── */
const DIAGRAM_WEDGES = [
  { id: 'practice', label: 'Practice Management', startAngle: -60, endAngle: 60,  fill: 'none', stroke: '#ffb30c', faUnicode: '\uf201' },
  { id: 'comp',     label: 'Compensation',         startAngle: 60,  endAngle: 180, fill: 'none', stroke: '#FF006E', faUnicode: '\uf51e' },
  { id: 'fees',     label: 'Fees & Billing',        startAngle: 180, endAngle: 300, fill: 'none', stroke: '#ED65D0', faUnicode: '\uf571' },
]

function diagramPolarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * Math.PI / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function diagramWedgePath(cx: number, cy: number, outerR: number, innerR: number, s: number, e: number) {
  const o1 = diagramPolarToXY(cx, cy, outerR, s), o2 = diagramPolarToXY(cx, cy, outerR, e)
  const i2 = diagramPolarToXY(cx, cy, innerR, e), i1 = diagramPolarToXY(cx, cy, innerR, s)
  const lg = e - s > 180 ? 1 : 0
  return `M${o1.x} ${o1.y} A${outerR} ${outerR} 0 ${lg} 1 ${o2.x} ${o2.y} L${i2.x} ${i2.y} A${innerR} ${innerR} 0 ${lg} 0 ${i1.x} ${i1.y}Z`
}

function PlatformDiagram() {
  const { isMobile } = useBreakpoint()
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = containerRef.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const VB = 200, CX = 100, CY = 100, INNER = 43, OUTER = 84
  const WEDGE_INNER = INNER + 2, LABEL_R = OUTER + 18, HUB_R = INNER

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: isMobile ? 260 : 380, overflow: 'hidden' }}>
      <div aria-hidden="true" style={{ position: 'absolute', width: 'min(260px, 70%)', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,132,255,0.13) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', width: isMobile ? 'min(200px, 70vw)' : 'min(340px, 88%)', aspectRatio: '1' }}>
        <svg viewBox={`0 0 ${VB} ${VB}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <radialGradient id="hub-grad-ci" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="rgba(59,132,255,0.20)" />
              <stop offset="100%" stopColor="rgba(59,132,255,0.05)" />
            </radialGradient>
          </defs>
          {DIAGRAM_WEDGES.map((w, wi) => {
            const path = diagramWedgePath(CX, CY, OUTER, WEDGE_INNER, w.startAngle, w.endAngle)
            const mid = (w.startAngle + w.endAngle) / 2
            const iconPt = diagramPolarToXY(CX, CY, (OUTER + WEDGE_INNER) / 2, mid)
            const labelPt = diagramPolarToXY(CX, CY, LABEL_R, mid)
            const textAnchor = labelPt.x < CX - 5 ? 'end' : labelPt.x > CX + 5 ? 'start' : 'middle'
            const words = w.label.split(' ')
            const half = Math.ceil(words.length / 2)
            return (
              <g key={w.id}>
                <motion.path d={path} fill={w.fill} stroke={w.stroke} strokeWidth="1.5"
                  initial={{ opacity: 0, scale: 0.88 }} animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.88 }}
                  style={{ transformOrigin: `${CX}px ${CY}px` }} transition={{ duration: 0.55, delay: visible ? wi * 0.18 : 0, ease: [0.16, 1, 0.3, 1] }} />
                <motion.text x={iconPt.x} y={iconPt.y} textAnchor="middle" dominantBaseline="middle"
                  fontSize="13" fontWeight="900" fontFamily="'Font Awesome 6 Free', 'Font Awesome 6 Pro', 'Font Awesome 5 Free'"
                  fill={w.stroke} initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.4, delay: visible ? wi * 0.18 + 0.18 : 0 }}>
                  {w.faUnicode}
                </motion.text>
                <motion.text x={labelPt.x} y={labelPt.y} textAnchor={textAnchor} dominantBaseline="middle"
                  fontSize="8.5" fontWeight="700" fill={w.stroke} style={{ letterSpacing: '0.02em' }}
                  initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.4, delay: visible ? wi * 0.18 + 0.30 : 0 }}>
                  {words.length > 1 ? (
                    <>
                      <tspan x={labelPt.x} dy="-0.6em">{words.slice(0, half).join(' ')}</tspan>
                      <tspan x={labelPt.x} dy="1.3em">{words.slice(half).join(' ')}</tspan>
                    </>
                  ) : w.label}
                </motion.text>
              </g>
            )
          })}
          <circle cx={CX} cy={CY} r={HUB_R + 2} fill="#140f0c" />
          <circle cx={CX} cy={CY} r={HUB_R} fill="none" stroke="rgba(59,132,255,0.18)" strokeWidth="1.5" />
          <motion.circle cx={CX} cy={CY} r={HUB_R} fill="none"
            initial={{ scale: 0.7, opacity: 0 }} animate={visible ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} style={{ transformOrigin: `${CX}px ${CY}px` }} />
          <circle cx={CX} cy={CY} r={HUB_R} fill="none" stroke="rgba(59,132,255,0.45)" strokeWidth="1.5" />
          <motion.text x={CX} y={CY} textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fontWeight="600" fill="#f4f4f4" style={{ letterSpacing: '0.02em' }}
            initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.5, delay: 0.38 }}>
            <tspan x={CX} dy="-5">Revenue Book</tspan>
            <tspan x={CX} dy="11">of Record</tspan>
          </motion.text>
        </svg>
      </div>
    </div>
  )
}

export default function CompensationIncentivesClient() {
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '44px 0' : '90px 0'
  const heroPad = isMobile ? '48px 0 48px' : '90px 0 72px'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const twoCols = isTablet ? '1fr' : 'repeat(2, minmax(0, 1fr))'
  const heroGap = isMobile ? '24px' : isTablet ? '32px' : '80px'
  const sectionGap = isMobile ? '24px' : isTablet ? '32px' : '80px'
  const caseCols = isTablet ? '1fr' : '1fr 1.4fr'
  const cardCols = isMobile ? '1fr' : '1fr 1fr'

  const heroGraphic = (
    <motion.div initial={{ opacity: 0, x: isMobile ? 0 : 24, y: isMobile ? 14 : 0 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }} style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ width: '100%' }}>
        <PayoutPanel />
      </div>
    </motion.div>
  )

  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; } }
        *, *::before, *::after { box-sizing: border-box; }
        section { max-width: 100%; }
        h1, h2, h3, p { overflow-wrap: anywhere; }
        svg { max-width: 100%; }

        .ci-feature-card { background: ${C.bg}; border: 1px solid ${C.border}; padding: 20px 18px; position: relative; transition: border-color 0.3s ease; cursor: pointer; display: block; text-decoration: none; height: 100%; box-sizing: border-box; }
        .ci-feature-card:hover { border-color: rgba(255,0,110,0.3); }

        .btn-comp-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.55rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #f4f4f4;
          background: #140f0c;
          border: 2px solid #FF006E;
          border-radius: 0;
          cursor: pointer;
          text-decoration: none;
          position: relative;
          transition: border-color 0.25s ease;
        }
        .btn-comp-primary:hover {
          border-image: linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%) 1;
        }
      `}</style>

      {/* 1. HERO — not full height, stats section peeks below */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: heroPad }} aria-label="Advisor compensation and incentives strategy">
        <div aria-hidden="true" style={{ position: 'absolute', top: '5%', left: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,0,110,0.07) 0%, transparent 62%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '5%', right: '5%', width: 700, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,0,110,0.05) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad, width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: heroGap, alignItems: 'center' }}>
            {isMobile && heroGraphic}

            <div style={{ maxWidth: 560 }}>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}><Eyebrow color={C.comp}>Compensation and Incentives</Eyebrow></motion.div>
              <h1 style={{ fontSize: 'clamp(2.25rem,5vw,4rem)', fontWeight: 700, color: C.text, lineHeight: 1.05, letterSpacing: '-0.028em', margin: 0 }}>
                <motion.span style={{ display: 'block' }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}>Turn Advisor Compensation Into</motion.span>
                <motion.span style={{ display: 'block' }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}><span style={{ color: C.comp }}>Your Competitive Edge</span></motion.span>
              </h1>
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.75 }} style={{ marginTop: 24, fontSize: 18, color: C.body, lineHeight: 1.75, maxWidth: 500 }}>
                Compensation shapes pricing behavior, advisor confidence, and firm economics. When it is managed well, it becomes one of your most powerful tools for growth and retention.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.95 }} style={{ marginTop: 36 }}>
                <Link href="/platform/compensation" className="btn-comp-primary">Explore Compensation</Link>
              </motion.div>
            </div>
            {!isMobile && heroGraphic}
          </div>
        </div>
      </section>

      {/* 2. STATS BAND */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden' }} aria-label="The cost of getting compensation wrong">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 300, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,0,110,0.05) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '44px 20px' : sectionPad }}>
          <Reveal><h2 style={{ textAlign: isMobile ? 'left' : 'center', fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', margin: isMobile ? '0 0 20px' : '0 0 40px' }}>The Cost Of Getting Compensation Wrong</h2></Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(260px, 420px))', justifyContent: 'center' }}>
            {[
              { node: <span style={{ fontSize: 'clamp(2.4rem,4.5vw,3.4rem)', fontWeight: 800, color: C.comp, lineHeight: 1, letterSpacing: '-0.02em' }}>15 to 30%</span>, color: C.comp, label: 'Of Billed Revenue Lost To Avoidable Discounting', body: 'Pricing drift and unmanaged exceptions quietly surrender revenue before it ever reaches the invoice.' },
              { node: <StatCount value={60} suffix="%" color={C.comp} />, color: C.comp, label: 'Advisors Cite Pay Uncertainty As A Retention Risk', body: 'When advisors cannot trust their compensation, the cost shows up in attrition, not just satisfaction scores.' },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 90}>
                <div style={{ padding: isMobile ? '1rem 0' : '1.5rem 2rem', position: 'relative' }}>
                  {s.node}
                  <div style={{ height: 3, width: 32, borderRadius: 2, backgroundColor: s.color, marginTop: 14 }} aria-hidden="true" />
                  <p style={{ marginTop: 14, fontSize: 15, fontWeight: 700, color: C.text }}>{s.label}</p>
                  <p style={{ marginTop: 6, fontSize: 15, color: C.body, lineHeight: 1.72 }}>{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PROBLEM SPLIT */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Weak compensation strategy costs more than you think">
        <div aria-hidden="true" style={{ position: 'absolute', top: '10%', right: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,0,110,0.06) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'center' }}>
            <div>
              <Reveal>
                <Eyebrow color={C.comp}>The Problem</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}><span style={{ color: C.text }}>Weak Compensation Strategy</span> <span style={{ color: C.comp }}>Costs More Than You Think</span></h2>
              </Reveal>
              <Reveal delay={70}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
                  <p style={{ fontSize: 16, color: C.body, lineHeight: 1.75, margin: 0 }}>For most wealth management firms, advisor compensation was built to administer payouts, not to drive strategy. The systems are disconnected, the oversight is manual, and the pricing decisions that happen inside that environment quietly erode revenue every quarter.</p>
                  <p style={{ fontSize: 16, color: C.body, lineHeight: 1.75, margin: 0 }}>The problem is not the advisors. It is the absence of structure, visibility, and discipline around the compensation process itself: <span style={{ color: C.text, fontWeight: 600 }}>Pricing Drift</span> from legacy plans that push advisors toward unnecessary concessions, <span style={{ color: C.text, fontWeight: 600 }}>Misaligned Incentives</span> that reward activity rather than profitable outcomes, and <span style={{ color: C.text, fontWeight: 600 }}>Process Erosion</span> from manual, error-prone workflows that undermine both advisor trust and firm economics.</p>
                </div>
              </Reveal>
            </div>
            <Reveal delay={100}><ExceptionTimeline /></Reveal>
          </div>
        </div>
      </section>

      {/* 4. 51% PROOF MOMENT */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Compensation research and whitepaper">
        <div aria-hidden="true" style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,0,110,0.07) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: caseCols, gap: sectionGap, alignItems: 'center' }}>
            <Reveal>
              <LargeStatCount value={51} suffix="%" color={C.comp} />
              <p style={{ marginTop: 16, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.18em', color: C.subtle }}>Faster revenue growth</p>
              <div style={{ marginTop: 20, height: 1, width: 64, background: C.border }} aria-hidden="true" />
              <p style={{ marginTop: 16, fontSize: 13, color: C.subtle, fontStyle: 'italic' }}>Charles Schwab RIA Benchmarking / Compensation Insights Study</p>
            </Reveal>
            <Reveal delay={120}>
              <Eyebrow color={C.comp}>The Performance Case</Eyebrow>
              <h2 style={{ fontSize: 'clamp(1.6rem,2.8vw,2.2rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.22, margin: 0 }}>
                RIAs that use performance-based incentive pay grew revenue 51% faster over five years than firms without such incentives.
              </h2>
              <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                The Architecture of Alignment is PureFacts&rsquo; definitive guide to optimizing advisor compensation, incentive design, and operational governance, built for Heads of Wealth, CFOs, COOs, and CAOs navigating today&rsquo;s talent and margin pressures.
              </p>
              <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: cardCols, gap: 16, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
                {[
                  { value: '$146T',  label: 'In RIA assets under management in 2024',    color: C.comp  },
                  { value: '37.5%', label: 'Of advisors planning to retire in 10 years', color: C.comp  },
                ].map(s => (
                  <div key={s.label}><p style={{ fontSize: 'clamp(1.35rem,2.4vw,1.8rem)', fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p><p style={{ marginTop: 4, fontSize: 13, color: C.body, lineHeight: 1.6 }}>{s.label}</p></div>
                ))}
              </div>
              <div style={{ marginTop: 24 }}>
                <Link href="/whitepaper/the-architecture-of-alignment" className="btn-comp-primary">Read the whitepaper</Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 5. SOLUTION SPLIT — content left, platform diagram right */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="The PureFacts approach to advisor compensation">
        <div aria-hidden="true" style={{ position: 'absolute', top: '5%', left: '0%', width: 550, height: 450, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,0,110,0.06) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'center' }}>
            <div>
              <Reveal>
                <Eyebrow color={C.comp}>The PureFacts Approach</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>Advisor Compensation Plans That Will <span style={{ color: C.comp }}>Drive Profitable Behavior</span></h2>
              </Reveal>
              <Reveal delay={80}>
                <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>PureFacts brings structure to the full compensation lifecycle: from pricing strategy and exception governance to payout accuracy and advisor reporting. The result is a compensation environment where advisors hold the line, leaders have visibility, and revenue reaches the firm as intended.</p>
              </Reveal>
              <Reveal delay={120}>
                <p style={{ marginTop: 16, fontSize: 16, color: C.body, lineHeight: 1.75 }}>Compensation sits at the center of the PureRevenue Platform alongside Fees and Practice Management, all built on a shared Revenue Book of Record. That means every pricing decision, every exception, and every payout is governed within a single connected system, not a patchwork of spreadsheets and manual reviews.</p>
              </Reveal>
              <Reveal delay={160}>
                <div style={{ marginTop: 28 }}>
                  <Link href="/platform/compensation" className="btn-comp-primary">Explore Compensation</Link>
                </div>
              </Reveal>
            </div>
            <Reveal delay={80}>
              <PlatformDiagram />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 6. PRODUCT CALLOUT */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Compensation product overview">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,0,110,0.05) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: isMobile ? '24px' : 'clamp(2.5rem,5vw,4rem)', alignItems: 'start' }}>
            <Reveal>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.20em', color: C.comp, margin: '0 0 14px' }}>The Solution</p>
              <h2 style={{ fontSize: 'clamp(1.4rem,2.5vw,1.9rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.02em', margin: '0 0 20px', lineHeight: 1.22 }}><span style={{ color: C.text }}>Compensation:</span> <span style={{ color: C.comp }}>software that improves profitability and scalability.</span></h2>
              <p style={{ fontSize: 16, color: C.body, lineHeight: 1.75, margin: '0 0 18px' }}>Compensation is PureFacts&rsquo; dedicated advisor compensation and incentives module, built for firms that want to move beyond manual administration toward a governed, transparent, and strategically aligned compensation environment.</p>
              <Link href="/platform/compensation" className="btn-comp-primary">Explore Compensation</Link>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: cardCols, gap: 12, gridAutoRows: '1fr' }}>
              {[
                { icon: 'fa-gears',         title: 'Rules-Based Compensation Engine', body: 'Handle every plan detail automatically: tiers, overrides, splits, and edge cases, without manual intervention.' },
                { icon: 'fa-shield-halved', title: 'Pricing Exception Management',    body: 'A structured workflow for reviewing, approving, and tracking every discount so exceptions never become defaults.' },
                { icon: 'fa-chart-line',    title: 'Advisor Dashboards',              body: 'Give advisors complete visibility into their earnings, performance metrics, and billing status in real time.' },
                { icon: 'fa-file-contract', title: 'Audit-Ready Reporting',           body: 'Full traceability on every compensation calculation and payout for leadership, compliance, and external auditors.' },
              ].map((card, i) => (
                <Reveal key={card.title} delay={i * 70} style={{ height: '100%' }}>
                  <Link href="/platform/compensation" className="ci-feature-card" style={{ height: '100%' }}>
                    <i className={`fa-solid ${card.icon}`} style={{ color: C.comp, fontSize: 18, marginBottom: 12 }} aria-hidden="true" />
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: '0 0 8px', lineHeight: 1.3 }}>{card.title}</p>
                    <p style={{ fontSize: 13, color: C.body, lineHeight: 1.65, margin: 0 }}>{card.body}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Transform compensation into competitive advantage">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 1000, height: 600, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,0,110,0.06) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'center' }}>
            <div>
              {[
                { icon: 'fa-shield-halved',      color: C.comp,     title: 'Stop Discounting Before It Sticks',    desc: 'Set guardrails that protect yield at the pricing decision point, before temporary concessions quietly become permanent.' },
                { icon: 'fa-hand-holding-dollar', color: C.mandarin, title: 'Build Advisor Trust Through Accuracy', desc: 'Accurate, transparent payouts mean advisors stop double-checking their bills and start spending that time on clients and growth.' },
                { icon: 'fa-trophy',              color: C.azure,    title: 'Compete for Top Talent',               desc: 'A compensation environment advisors trust becomes a recruitment and retention advantage the competition cannot easily replicate.' },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 70}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '18px 0' }}>
                    <div style={{ width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}><i className={`fa-solid ${item.icon}`} style={{ color: item.color, fontSize: 17 }} aria-hidden="true" /></div>
                    <div><p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1 }}>{item.title}</p><p style={{ marginTop: 6, fontSize: 15, color: C.body, lineHeight: 1.72, margin: '6px 0 0' }}>{item.desc}</p></div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={100}>
              <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                Transform Compensation From Cost To <GradientText>Competitive Advantage.</GradientText>
              </h2>
              <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>See how Compensation helps leading wealth management firms bill closer to full value and build compensation environments that attract and retain top talent.</p>
              <div style={{ marginTop: 30 }}>
                <Link href="/platform/compensation" className="btn-primary">Explore Compensation</Link>
              </div>
              <p style={{ marginTop: 16, fontSize: 13, color: C.subtle }}>Trusted by the top global financial firms</p>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}