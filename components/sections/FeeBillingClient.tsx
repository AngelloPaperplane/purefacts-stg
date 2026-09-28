'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

/* ─────────────────────────────────────────────────────────────
   TOKENS
───────────────────────────────────────────────────────────── */
const C = {
  bg:      '#140f0c',
  surface: '#1a1410',
  text:    '#f4f4f4',
  body:    'rgba(244,244,244,0.75)',
  subtle:  'rgba(244,244,244,0.45)',
  border:  'rgba(255,255,255,0.07)',
  fees:    '#ED65D0',
  mandarin:'#fb5607',
  honey:   '#ffb30c',
  sunset:  'linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%)',
} as const

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ background: C.sunset, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
      {children}
    </span>
  )
}

function Eyebrow({ children, color = C.fees }: { children: React.ReactNode; color?: string }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.20em', color, margin: '0 0 14px' }}>
      {children}
    </p>
  )
}

function useReveal(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
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
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(22px)',
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   BILLING STACK DIAGRAM
───────────────────────────────────────────────────────────── */
function BillingStackDiagram() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const c = containerRef.current; if (!c) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        obs.disconnect()
        ;[0, 1, 2, 3, 4].forEach(i => {
          setTimeout(() => setPhase(i + 1), 200 + i * 220)
        })
      }
    }, { threshold: 0.25 })
    obs.observe(c); return () => obs.disconnect()
  }, [])

  const LAYERS = [
    { label: 'Quarter-End Fire Drill', sub: 'Every team scrambles to close',       color: '#ff3b3b',  icon: 'fa-fire',              status: 'CRITICAL' },
    { label: 'Manual Reconciliation',  sub: 'Finance rebuilding truth by hand',    color: C.mandarin, icon: 'fa-person-digging',     status: 'ERROR'    },
    { label: 'Email Threads',          sub: 'Exception logic in inboxes',          color: C.mandarin, icon: 'fa-envelope-open-text', status: 'WARN'     },
    { label: 'Spreadsheet Overrides',  sub: 'Shadow logic no one controls',        color: C.honey,    icon: 'fa-file-excel',         status: 'WARN'     },
    { label: 'Legacy Billing System',  sub: 'Inflexible, hard to audit',           color: C.fees,     icon: 'fa-server',             status: 'STALE'    },
  ]

  const STATUS_COLORS: Record<string, string> = {
    CRITICAL: '#ff3b3b', ERROR: C.mandarin, WARN: C.honey, STALE: C.fees,
  }

  return (
    <div ref={containerRef} style={{ background: C.surface, border: `1px solid ${C.border}`, padding: 16 }}>
      <div style={{ marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: C.subtle }}>
          Typical Billing Architecture
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {LAYERS.map((layer, i) => {
          const revealIndex = LAYERS.length - 1 - i
          const revealed = phase > revealIndex
          return (
            <motion.div
              key={layer.label}
              initial={{ opacity: 0, y: 10, scaleX: 0.92 }}
              animate={revealed ? { opacity: 1, y: 0, scaleX: 1 } : { opacity: 0, y: 10, scaleX: 0.92 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ background: C.bg, border: `1px solid ${layer.color}35`, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: layer.color, opacity: 0.7 }} />
              <div style={{ width: 32, height: 32, flexShrink: 0, background: `${layer.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`fa-solid ${layer.icon}`} style={{ color: layer.color, fontSize: 13 }} aria-hidden="true" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{layer.label}</span>
                  <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.12em', color: STATUS_COLORS[layer.status], flexShrink: 0 }}>
                    {layer.status}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: C.subtle, marginTop: 2 }}>{layer.sub}</div>
              </div>
            </motion.div>
          )
        })}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={phase >= 5 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(255,59,59,0.06)', border: '1px solid rgba(255,59,59,0.22)', display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ff3b3b', fontSize: 11 }} aria-hidden="true" />
        <span style={{ fontSize: 10, color: '#ff3b3b', fontWeight: 600 }}>Structurally fragile. No single source of truth.</span>
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   STAT COUNTS
───────────────────────────────────────────────────────────── */
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
  return (
    <div ref={ref} style={{ fontSize: 'clamp(2.4rem,4.5vw,3.4rem)', fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.02em' }}>
      {prefix}{count}{suffix}
    </div>
  )
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
  return (
    <div ref={ref}
      style={{ fontSize: 'clamp(4rem,10vw,7rem)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', color: C.text, margin: 0 }}
      aria-label={`${prefix}${value}${suffix}`}>
      {prefix}{count}<span style={{ color: C.text }}>{suffix}</span>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   PLATFORM DIAGRAM
───────────────────────────────────────────────────────────── */
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
      <div aria-hidden="true" style={{ position: 'absolute', width: 'min(260px, 70%)', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle, rgba(237,101,208,0.13) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', width: isMobile ? 'min(220px, 78vw)' : 'min(340px, 88%)', aspectRatio: '1' }}>
        <svg viewBox={`0 0 ${VB} ${VB}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <radialGradient id="hub-grad-fb" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="rgba(237,101,208,0.20)" />
              <stop offset="100%" stopColor="rgba(237,101,208,0.05)" />
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
          <circle cx={CX} cy={CY} r={HUB_R} fill="none" stroke="rgba(237,101,208,0.18)" strokeWidth="1.5" />
          <motion.circle cx={CX} cy={CY} r={HUB_R} fill="none"
            initial={{ scale: 0.7, opacity: 0 }} animate={visible ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} style={{ transformOrigin: `${CX}px ${CY}px` }} />
          <circle cx={CX} cy={CY} r={HUB_R} fill="none" stroke="rgba(237,101,208,0.45)" strokeWidth="1.5" />
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

/* ─────────────────────────────────────────────────────────────
   INVOICE PANEL (hero graphic)
───────────────────────────────────────────────────────────── */
function InvoicePanel() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const c = containerRef.current; if (!c) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        obs.disconnect()
        timerRef.current = setTimeout(() => setPhase(1), 200)
        timerRef.current = setTimeout(() => setPhase(2), 620)
        timerRef.current = setTimeout(() => setPhase(3), 1040)
      }
    }, { threshold: 0.15 })
    obs.observe(c)
    return () => { obs.disconnect(); if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const INVOICES = [
    {
      client: 'Meridian Family Office',
      period: 'Q3 2024',
      items: [
        { label: 'AUM-based fee (0.45% on $42.8M)',   amount: '$48,150' },
        { label: 'Breakpoint applied (>$40M tier)',    amount: '−$3,210' },
        { label: 'Schedule: Quarterly wrap',           amount: '$0'      },
      ],
      total: '$44,940',
      status: 'VERIFIED',
      flag: null,
    },
    {
      client: 'Northgate Pension Fund',
      period: 'Q3 2024',
      items: [
        { label: 'AUM-based fee (0.38% on $118M)',     amount: '$112,440' },
        { label: 'Performance hurdle: not met',        amount: '$0'       },
        { label: 'Fee cap applied ($110K max)',        amount: '−$2,440'  },
      ],
      total: '$110,000',
      status: 'VERIFIED',
      flag: null,
    },
    {
      client: 'Clearwater Endowment',
      period: 'Q3 2024',
      items: [
        { label: 'Flat advisory fee',                  amount: '$18,000' },
        { label: 'Exception: 90-day concession',       amount: '−$1,800' },
      ],
      total: '$16,200',
      status: 'EXCEPTION',
      flag: 'Concession expires Dec 31',
    },
  ]

  return (
    <div ref={containerRef} style={{ background: C.surface, border: `1px solid ${C.border}`, padding: 16, width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: C.subtle }}>Fee Invoice Run — Q3 2024</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.fees, letterSpacing: '0.10em' }}>AUDIT-READY ✓</span>
      </div>
      {INVOICES.map((inv, ai) => (
        <motion.div key={inv.client}
          initial={{ opacity: 0, y: 10 }}
          animate={phase > ai ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: ai < INVOICES.length - 1 ? 10 : 0 }}
        >
          <div style={{ background: C.bg, border: `1px solid ${inv.status === 'EXCEPTION' ? `${C.mandarin}40` : `${C.fees}25`}`, padding: '10px 12px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 3, bottom: 0, background: inv.status === 'EXCEPTION' ? C.mandarin : C.fees, opacity: 0.7 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: inv.status === 'EXCEPTION' ? C.mandarin : C.fees, letterSpacing: '0.08em', textTransform: 'uppercase' as const, display: 'block' }}>{inv.client}</span>
                <span style={{ fontSize: 9, color: C.subtle }}>{inv.period}</span>
              </div>
              <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.10em', color: inv.status === 'EXCEPTION' ? C.mandarin : C.fees, textTransform: 'uppercase' as const, flexShrink: 0 }}>{inv.status}</span>
            </div>
            {inv.items.map((item, ii) => (
              <motion.div key={item.label}
                initial={{ opacity: 0 }}
                animate={phase > ai ? { opacity: 1 } : {}}
                transition={{ duration: 0.3, delay: ii * 0.07 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}
              >
                <span style={{ fontSize: 10, color: C.subtle }}>{item.label}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: item.amount.startsWith('−') ? C.mandarin : C.text, flexShrink: 0, marginLeft: 8 }}>{item.amount}</span>
              </motion.div>
            ))}
            {inv.flag && (
              <div style={{ marginTop: 6, padding: '4px 8px', background: `${C.mandarin}12`, border: `1px solid ${C.mandarin}30`, display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="fa-solid fa-clock" style={{ color: C.mandarin, fontSize: 9 }} aria-hidden="true" />
                <span style={{ fontSize: 9, color: C.mandarin, fontWeight: 600 }}>{inv.flag}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 6, borderTop: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.subtle, textTransform: 'uppercase' as const, letterSpacing: '0.10em' }}>Total</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{inv.total}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
export default function FeeBillingClient() {
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '56px 0' : '90px 0'
  const heroPad = isMobile ? '48px 0 48px' : '90px 0 72px'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const twoCols = isTablet ? '1fr' : 'repeat(2, minmax(0, 1fr))'
  const heroGap = isMobile ? '24px' : isTablet ? '32px' : '80px'
  const sectionGap = isMobile ? '24px' : isTablet ? '32px' : '80px'
  const caseCols = isTablet ? '1fr' : '1fr 1.4fr'
  const cardCols = isMobile ? '1fr' : '1fr 1fr'

  const heroGraphic = (
    <motion.div initial={{ opacity: 0, x: isMobile ? 0 : 24, y: isMobile ? 14 : 0 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ width: '100%' }}>
        <InvoicePanel />
      </div>
    </motion.div>
  )

  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; } }

        .fb-feature-card {
          background: ${C.bg};
          border: 1px solid ${C.border};
          padding: 20px 18px;
          position: relative;
          transition: border-color 0.3s ease;
          cursor: pointer;
          display: block;
          text-decoration: none;
          height: 100%;
          box-sizing: border-box;
        }
        .fb-feature-card:hover { border-color: rgba(237,101,208,0.3); }

        .btn-fees-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.55rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #f4f4f4;
          background: #140f0c;
          border: 2px solid #ED65D0;
          border-radius: 0;
          cursor: pointer;
          text-decoration: none;
          position: relative;
          transition: border-color 0.25s ease;
        }
        .btn-fees-primary:hover {
          border-image: linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%) 1;
        }
      `}</style>

      {/* ══════════════════════════════════
          1. HERO
      ══════════════════════════════════ */}
      <section
        style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: heroPad }}
        aria-label="Fee billing for wealth and asset managers"
      >
        <div aria-hidden="true" style={{ position: 'absolute', top: '5%', left: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(237,101,208,0.07) 0%, transparent 62%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '5%', right: '5%', width: 700, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(237,101,208,0.05) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad, width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: heroGap, alignItems: 'center' }}>
            {isMobile && heroGraphic}

            <div style={{ maxWidth: 560 }}>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                <Eyebrow color={C.fees}>Fee Billing</Eyebrow>
              </motion.div>
              <h1 style={{ fontSize: 'clamp(2.25rem,5vw,4rem)', fontWeight: 700, color: C.text, lineHeight: 1.05, letterSpacing: '-0.028em', margin: 0 }}>
                <motion.span initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                  Fee Billing That Protects <span style={{ color: C.fees }}>Revenue, Trust, And Margin</span>
                </motion.span>
              </h1>
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.75 }}
                style={{ marginTop: 24, fontSize: 18, color: C.body, lineHeight: 1.75, maxWidth: 500 }}>
                If billing is even slightly wrong, everything downstream gets expensive.
                PureFacts helps firms calculate and bill complex fees accurately,
                consistently, and audit-ready, at scale, without the spreadsheets,
                workarounds, and recurring fire drills.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.95 }}
                style={{ marginTop: 36 }}>
                <Link href="/platform/fees-and-billing" className="btn-fees-primary">Explore Fees and Billing</Link>
              </motion.div>
            </div>
            {!isMobile && heroGraphic}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          2. STATS BAND
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden' }} aria-label="PureFacts delivers for clients">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '15%', width: 700, height: 300, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(237,101,208,0.05) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: sectionPad }}>
          <Reveal>
            <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', margin: '0 0 40px' }}>
              PureFacts Delivers for Their Clients
            </h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {([
              { prefix: '',  value: 30, suffix: '%',  color: C.fees,    label: 'Reduction In Billing Cycle Time',  body: 'Firms centralizing with PureFacts see significant time savings across billing cycles, freeing teams for higher-value work.' },
              { prefix: '$', value: 3,  suffix: 'B+', color: C.fees,    label: 'In Fees Calculated Annually',      body: 'PureFacts processes billions in fee revenue each year with precision billing and zero-error tolerance.' },
              { prefix: '$', value: 15, suffix: 'T+', color: C.fees,    label: 'In Assets Under Administration',   body: 'Wealth and asset managers worldwide trust PureRevenue to calculate fees across trillions in AuA.' },
            ] as const).map((s, i) => (
              <Reveal key={s.label} delay={i * 90}>
                <div style={{ padding: '1.5rem 2rem', position: 'relative' }}>
                  <StatCount prefix={s.prefix} value={s.value} suffix={s.suffix} color={s.color} />
                  <div style={{ height: 3, width: 32, borderRadius: 2, backgroundColor: s.color, marginTop: 14 }} aria-hidden="true" />
                  <p style={{ marginTop: 14, fontSize: 15, fontWeight: 700, color: C.text }}>{s.label}</p>
                  <p style={{ marginTop: 6, fontSize: 15, color: C.body, lineHeight: 1.72 }}>{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          3. PROBLEM SPLIT
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Why billing is revenue control not back office">
        <div aria-hidden="true" style={{ position: 'absolute', top: '10%', right: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(251,86,7,0.06) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '0%', left: '5%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(237,101,208,0.04) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'center' }}>
            <div>
              <Reveal>
                <Eyebrow color={C.fees}>The Problem</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                  <span style={{ color: C.fees }}>Billing Is Not Back Office.</span> It Is Revenue Control.
                </h2>
              </Reveal>
              <Reveal delay={70}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
                  <p style={{ fontSize: 16, color: C.body, lineHeight: 1.75, margin: 0 }}>
                    Billing sits at the intersection of revenue, client trust, and regulatory confidence. When fee logic lives in too many places: legacy systems, spreadsheets, one-off exceptions, tribal knowledge, firms see the same predictable outcomes.
                  </p>
                  <p style={{ fontSize: 16, color: C.body, lineHeight: 1.75, margin: 0 }}>
                    The pattern is consistent across firms of every size: <span style={{ color: C.text, fontWeight: 600 }}>Revenue Leakage</span> through missed rules and inconsistent exceptions that silently erode what you are entitled to collect, <span style={{ color: C.text, fontWeight: 600 }}>Operational Drag</span> from end-of-cycle scrambles and manual reconciliation that consumes capacity, and <span style={{ color: C.text, fontWeight: 600 }}>Client Friction</span> when unclear invoices and billing errors erode the trust you have spent years building.
                  </p>
                </div>
              </Reveal>
            </div>
            <Reveal delay={100}>
              <BillingStackDiagram />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          4. $71M PROOF MOMENT
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="FINRA enforcement and RBC case study">
        <div aria-hidden="true" style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(237,101,208,0.07) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: caseCols, gap: sectionGap, alignItems: 'center' }}>
            <Reveal>
              <LargeStatCount value={71} prefix="$" suffix="M" color={C.fees} />
              <p style={{ marginTop: 16, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.18em', color: C.subtle }}>
                In fines, one FINRA sweep
              </p>
              <div style={{ marginTop: 20, height: 1, width: 64, background: C.border }} aria-hidden="true" />
              <p style={{ marginTop: 16, fontSize: 13, color: C.subtle, fontStyle: 'italic' }}>
                FINRA enforcement data, 2023
              </p>
            </Reveal>
            <Reveal delay={120}>
              <Eyebrow color={C.fees}>The Regulatory Stakes</Eyebrow>
              <h2 style={{ fontSize: 'clamp(1.6rem,2.8vw,2.2rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.22, margin: 0 }}>
                In 2023, FINRA collected about $71 million in fines tied to billing errors and misaligned compensation, putting fee accuracy firmly in regulators&rsquo; crosshairs.
              </h2>
              <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                RBC partnered with PureFacts Professional Services to deliver a complex, large-scale Fees and Billing implementation, meeting every critical milestone on one of the most aggressive timelines in the firm&rsquo;s history.
              </p>
              <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
                {[
                  { value: '<1 Year', label: 'Production launch achieved',            color: C.fees },
                  { value: '2.8M',    label: 'Accounts calculated including sleeves', color: C.fees },
                  { value: '100%',    label: 'Critical milestones met on schedule',   color: C.text },
                ].map(s => (
                  <div key={s.label}>
                    <p style={{ fontSize: 'clamp(1.35rem,2.4vw,1.8rem)', fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
                    <p style={{ marginTop: 4, fontSize: 13, color: C.body, lineHeight: 1.6 }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24 }}>
                <Link href="/case-study/professional-services-tackling-complex-purefees-implementation-with-rbc" className="btn-fees-primary">
                  Read the case study
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          5. PUREFACTS APPROACH
          Content left, platform diagram right
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="What changes when billing is done right">
        <div aria-hidden="true" style={{ position: 'absolute', top: '5%', left: '0%', width: 550, height: 450, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(237,101,208,0.06) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'center' }}>
            <div>
              <Reveal>
                <Eyebrow color={C.fees}>The PureFacts Approach</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                  What Changes When <span style={{ color: C.fees }}>Billing Is Done Right</span>
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                  PureFacts centralizes fee logic, automates calculation and workflow steps, and maintains full visibility into every change, so billing is repeatable, defensible, and no longer dependent on who remembers how it was done last quarter.
                </p>
              </Reveal>
              <Reveal delay={120}>
                <p style={{ marginTop: 16, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                  Fees and Billing sits at the center of the PureRevenue Platform alongside Compensation and Practice Management, all built on a shared Revenue Book of Record. Every fee rule, every exception, and every invoice is governed within a single connected system, giving your team the accuracy, speed, and audit trail that fragmented tooling simply cannot provide.
                </p>
              </Reveal>
              <Reveal delay={160}>
                <div style={{ marginTop: 28 }}>
                  <Link href="/platform" className="btn-fees-primary">Explore the Platform</Link>
                </div>
              </Reveal>
            </div>
            <Reveal delay={80}>
              <PlatformDiagram />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          6. PRODUCT CALLOUT
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Fees and Billing product features">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(237,101,208,0.05) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(2.5rem,5vw,4rem)', alignItems: 'start' }}>
            <Reveal>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.20em', color: C.fees, margin: '0 0 14px' }}>The Solution</p>
              <h2 style={{ fontSize: 'clamp(1.4rem,2.5vw,1.9rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.02em', margin: '0 0 20px', lineHeight: 1.22 }}>
                <span style={{ color: C.text }}>Fees and Billing:</span> <span style={{ color: C.fees }}>protect and grow your revenue.</span>
              </h2>
              <p style={{ fontSize: 16, color: C.body, lineHeight: 1.75, margin: '0 0 18px' }}>
                Fees and Billing is PureFacts&rsquo; dedicated billing module, designed for firms that need to manage complex fee structures with precision, scalability, and full auditability. It handles the edge cases, exceptions, and volume that break legacy systems and spreadsheet-based workflows.
              </p>
              <p style={{ fontSize: 16, color: C.body, lineHeight: 1.75, margin: '0 0 32px' }}>
                Where this page explains the philosophy and the problem, Fees and Billing is the engine that solves it at scale.
              </p>
              <Link href="/platform/fees-and-billing" className="btn-fees-primary">Explore Fees and Billing</Link>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: cardCols, gap: 12, gridAutoRows: '1fr' }}>
              {[
                { icon: 'fa-calculator',         title: 'Complex Fee Calculation',     body: 'Model and calculate fees across thousands of variations: tiering, breakpoints, exemptions, minimums, caps, blends, and client-specific arrangements.' },
                { icon: 'fa-arrows-rotate',       title: 'Automated Billing Workflows', body: 'Reduce manual touchpoints with automation-first billing cycles that preserve oversight and approval where it matters.' },
                { icon: 'fa-file-invoice-dollar', title: 'Client Billing Statements',   body: 'Deliver clear, consistent invoices that explain what clients are paying, why, and how it was calculated, reducing disputes at the source.' },
                { icon: 'fa-scale-balanced',      title: 'Audit-Ready By Default',      body: 'Every calculation, change, and adjustment is traceable with defensible history, so audits become a review, not a reconstruction.' },
              ].map((card, i) => (
                <Reveal key={card.title} delay={i * 70} style={{ height: '100%' }}>
                  <Link href="/platform/fees-and-billing" className="fb-feature-card" style={{ height: '100%' }}>
                    <i className={`fa-solid ${card.icon}`} style={{ color: C.fees, fontSize: 18, marginBottom: 12 }} aria-hidden="true" />
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: '0 0 8px', lineHeight: 1.3 }}>{card.title}</p>
                    <p style={{ fontSize: 13, color: C.body, lineHeight: 1.65, margin: 0 }}>{card.body}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          7. FINAL CTA
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Turn billing into a competitive advantage">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 1000, height: 600, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(237,101,208,0.06) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'center' }}>
            <div>
              {[
                { icon: 'fa-circle-dollar-to-slot', color: '#3b84ff', title: 'Stop Revenue Leaking Through Billing',  desc: 'Centralized fee logic closes the gaps where missed rules and inconsistent exceptions silently erode the revenue you are entitled to collect.' },
                { icon: 'fa-arrows-rotate',          color: C.mandarin, title: 'Eliminate End-of-Cycle Fire Drills',    desc: 'Automation-first workflows and standardized calculations mean faster billing cycles and no more last-minute scrambles to close the books.' },
                { icon: 'fa-scale-balanced',         color: C.fees,    title: 'Answer Auditors With Confidence',       desc: 'Every calculation, change, and adjustment is traceable, so how you got to a number becomes a quick review, not a days-long reconstruction.' },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 70}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '18px 0' }}>
                    <div style={{ width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                      <i className={`fa-solid ${item.icon}`} style={{ color: item.color, fontSize: 17 }} aria-hidden="true" />
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1 }}>{item.title}</p>
                      <p style={{ marginTop: 6, fontSize: 15, color: C.body, lineHeight: 1.72, margin: '6px 0 0' }}>{item.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={100}>
              <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                Turn Billing Into A <GradientText>Competitive Advantage.</GradientText>
              </h2>
              <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                If billing is still held together by spreadsheets, workarounds, and institutional memory, you are paying for it in leakage, risk, and cycle time. See how modern fee billing looks when it is built for complexity and designed for control.
              </p>
              <div style={{ marginTop: 30 }}>
                <Link href="/contact" className="btn-primary">Get in contact</Link>
              </div>
              <p style={{ marginTop: 16, fontSize: 13, color: C.subtle }}>Trusted by the top global financial firms</p>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}