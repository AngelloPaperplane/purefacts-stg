'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'

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
  azure:   '#3b84ff',
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

function Eyebrow({ children, color = C.honey }: { children: React.ReactNode; color?: string }) {
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
   COMPLEXITY GRAPHIC
───────────────────────────────────────────────────────────── */
const COMPLEXITY_PANELS = [
  { id: 'billing',     label: 'Billing Engine',  color: C.mandarin, status: 'ERROR',
    metrics: [{ label: 'Errors', value: '47' },      { label: 'Last run', value: '3d ago' }],
    errorMsg: 'Fee schedule mismatch' },
  { id: 'comp',        label: 'Compensation',    color: C.honey,    status: 'WARN',
    metrics: [{ label: 'Disputes', value: '8' },     { label: 'Shadow accts', value: '23' }],
    errorMsg: 'Payout discrepancy' },
  { id: 'reporting',   label: 'Reporting',       color: C.azure,    status: 'STALE',
    metrics: [{ label: 'Freshness', value: 'T+2' },  { label: 'Reconciled', value: '61%' }],
    errorMsg: 'Data mismatch' },
  { id: 'audit',       label: 'Audit Trail',     color: C.mandarin, status: 'MISSING',
    metrics: [{ label: 'Coverage', value: '44%' },   { label: 'Gaps', value: '19' }],
    errorMsg: 'Incomplete traceability' },
  { id: 'datasync',    label: 'Data Sync',       color: C.honey,    status: 'WARN',
    metrics: [{ label: 'Queue depth', value: '143' },{ label: 'Lag', value: '4h' }],
    errorMsg: 'Sync lag detected' },
  { id: 'recon',       label: 'Reconciliation',  color: C.mandarin, status: 'ERROR',
    metrics: [{ label: 'Open items', value: '34' },  { label: 'Breaks', value: '9' }],
    errorMsg: 'Unresolved breaks' },
  { id: 'feeoverride', label: 'Fee Override',    color: C.azure,    status: 'STALE',
    metrics: [{ label: 'Active', value: '28' },      { label: 'Expired', value: '7' }],
    errorMsg: 'Stale overrides' },
  { id: 'compliance',  label: 'Compliance',      color: C.honey,    status: 'WARN',
    metrics: [{ label: 'Flags', value: '5' },        { label: 'Due', value: 'Today' }],
    errorMsg: 'Review deadline near' },
  { id: 'export',      label: 'Export Queue',    color: C.mandarin, status: 'MISSING',
    metrics: [{ label: 'Failed', value: '4' },       { label: 'Last export', value: '48h' }],
    errorMsg: 'Export failure' },
]

const STATUS_COLORS: Record<string, string> = {
  ERROR:   '#ff3b3b',
  WARN:    C.honey,
  STALE:   C.mandarin,
  MISSING: '#ff3b3b',
}

function ComplexityGraphic() {
  const { isMobile } = useBreakpoint()
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [tick, setTick] = useState(0)
  const rafRef = useRef<number>(0)
  const tickRef = useRef(0)

  const alarmRef = useRef<{
    activeIds: string[]
    nextEventAt: number
    isActive: boolean
  }>({ activeIds: [], nextEventAt: 100, isActive: false })

  useEffect(() => {
    const container = containerRef.current; if (!container) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.2 })
    obs.observe(container)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const loop = () => {
      tickRef.current++
      if (tickRef.current >= alarmRef.current.nextEventAt) {
        if (alarmRef.current.isActive) {
          alarmRef.current.activeIds = []
          alarmRef.current.isActive = false
          alarmRef.current.nextEventAt = tickRef.current + 120 + Math.floor(Math.random() * 180)
        } else {
          const options = [0, 1, 1, 1, 2, 2, 3, 4]
          const count = options[Math.floor(Math.random() * options.length)]
          if (count > 0) {
            const shuffled = [...COMPLEXITY_PANELS].sort(() => Math.random() - 0.5)
            alarmRef.current.activeIds = shuffled.slice(0, count).map(p => p.id)
            alarmRef.current.isActive = true
            alarmRef.current.nextEventAt = tickRef.current + 90 + Math.floor(Math.random() * 90)
          } else {
            alarmRef.current.activeIds = []
            alarmRef.current.nextEventAt = tickRef.current + 40 + Math.floor(Math.random() * 60)
          }
        }
      }
      setTick(tickRef.current)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [visible])

  const visiblePanels = isMobile ? COMPLEXITY_PANELS.slice(0, 4) : COMPLEXITY_PANELS
  const hiddenCount = COMPLEXITY_PANELS.length - visiblePanels.length
  const activeCount = alarmRef.current.activeIds.length

  return (
    <div ref={containerRef} style={{ background: C.surface, border: `1px solid ${C.border}`, padding: isMobile ? 10 : 14, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: C.subtle }}>
          Revenue Operations
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: activeCount > 0 ? '#ff3b3b' : 'rgba(244,244,244,0.25)' }}>
          {activeCount > 0
            ? `● ${activeCount} ISSUE${activeCount !== 1 ? 'S' : ''} DETECTED`
            : '○ ALL CLEAR'}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))', gap: isMobile ? 6 : 8 }}>
        {visiblePanels.map((panel) => {
          const isActive = alarmRef.current.activeIds.includes(panel.id)
          const blink = isActive && tickRef.current % 180 < 90
          const statusColor = STATUS_COLORS[panel.status]
          return (
            <motion.div
              key={panel.id}
              initial={{ opacity: 0, y: 10 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.35, delay: COMPLEXITY_PANELS.indexOf(panel) * 0.06 }}
              style={{
                background: C.bg,
                border: `1.5px solid ${isActive && blink ? statusColor : C.border}`,
                padding: isMobile ? '10px 8px' : '9px 10px',
                position: 'relative',
                transition: 'border-color 0.18s ease',
                boxShadow: isActive && blink ? `0 0 10px ${statusColor}22` : 'none',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: panel.color, opacity: isActive ? 0.85 : 0.3 }} aria-hidden="true" />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: panel.color, letterSpacing: '0.08em', textTransform: 'uppercase' as const, opacity: isActive ? 1 : 0.55 }}>{panel.label}</span>
                <span style={{ fontSize: isMobile ? 6 : 7, fontWeight: 800, letterSpacing: '0.12em', color: statusColor, opacity: isActive ? (blink ? 1 : 0.5) : 0.15, transition: 'opacity 0.18s' }}>{panel.status}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                {panel.metrics.map(m => (
                  <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 9, color: C.subtle }}>{m.label}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: isActive ? C.text : C.subtle }}>{m.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 8, color: statusColor, fontStyle: 'italic', opacity: isActive ? (blink ? 0.9 : 0.35) : 0, transition: 'opacity 0.18s', borderTop: `1px solid ${C.border}`, paddingTop: 5 }}>
                ⚠ {panel.errorMsg}
              </div>
            </motion.div>
          )
        })}
      </div>
      <p style={{ textAlign: 'center', fontSize: 11, color: C.subtle, letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontWeight: 600, marginTop: 14, marginBottom: 0 }}>
        {isMobile && hiddenCount > 0 ? `Manual friction at every step · ${hiddenCount} more systems hidden` : 'Manual friction at every step'}
      </p>
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

  const VB = 200
  const CX = 100, CY = 100
  const INNER = 43
  const OUTER = 84
  const WEDGE_INNER = INNER + 2
  const LABEL_R = OUTER + 18
  const HUB_R = INNER

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: isMobile ? 260 : 380, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 'min(260px, 70%)', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,132,255,0.13) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', width: isMobile ? 'min(200px, 70vw)' : 'min(340px, 88%)', aspectRatio: '1' }}>
        <svg viewBox={`0 0 ${VB} ${VB}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <radialGradient id="hub-grad-cx" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="rgba(59,132,255,0.20)" />
              <stop offset="100%" stopColor="rgba(59,132,255,0.05)" />
            </radialGradient>
          </defs>
          {DIAGRAM_WEDGES.map((w, wi) => {
            const path = diagramWedgePath(CX, CY, OUTER, WEDGE_INNER, w.startAngle, w.endAngle)
            const mid  = (w.startAngle + w.endAngle) / 2
            const iconPt  = diagramPolarToXY(CX, CY, (OUTER + WEDGE_INNER) / 2, mid)
            const labelPt = diagramPolarToXY(CX, CY, LABEL_R, mid)
            const textAnchor = labelPt.x < CX - 5 ? 'end' : labelPt.x > CX + 5 ? 'start' : 'middle'
            const words = w.label.split(' ')
            const half = Math.ceil(words.length / 2)
            return (
              <g key={w.id}>
                <motion.path d={path} fill={w.fill} stroke={w.stroke} strokeWidth="1.5"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.88 }}
                  style={{ transformOrigin: `${CX}px ${CY}px` }}
                  transition={{ duration: 0.55, delay: visible ? wi * 0.18 : 0, ease: [0.16, 1, 0.3, 1] }}
                />
                <motion.text x={iconPt.x} y={iconPt.y} textAnchor="middle" dominantBaseline="middle"
                  fontSize="13" fontWeight="900"
                  fontFamily="'Font Awesome 6 Free', 'Font Awesome 6 Pro', 'Font Awesome 5 Free'"
                  fill={w.stroke}
                  initial={{ opacity: 0 }}
                  animate={visible ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.4, delay: visible ? wi * 0.18 + 0.18 : 0 }}
                >{w.faUnicode}</motion.text>
                <motion.text x={labelPt.x} y={labelPt.y} textAnchor={textAnchor} dominantBaseline="middle"
                  fontSize="8.5" fontWeight="700" fill={w.stroke} style={{ letterSpacing: '0.02em' }}
                  initial={{ opacity: 0 }}
                  animate={visible ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.4, delay: visible ? wi * 0.18 + 0.30 : 0 }}
                >
                  {words.length > 1 ? (
                    <><tspan x={labelPt.x} dy="-0.6em">{words.slice(0, half).join(' ')}</tspan><tspan x={labelPt.x} dy="1.3em">{words.slice(half).join(' ')}</tspan></>
                  ) : w.label}
                </motion.text>
              </g>
            )
          })}
          <circle cx={CX} cy={CY} r={HUB_R + 2} fill="#140f0c" />
          <circle cx={CX} cy={CY} r={HUB_R} fill="none" stroke="rgba(59,132,255,0.18)" strokeWidth="1.5" />
          <motion.circle cx={CX} cy={CY} r={HUB_R} fill="none"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={visible ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          />
          <circle cx={CX} cy={CY} r={HUB_R} fill="none" stroke="rgba(59,132,255,0.45)" strokeWidth="1.5" />
          <motion.text x={CX} y={CY} textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fontWeight="600" fill="#f4f4f4" style={{ letterSpacing: '0.02em' }}
            initial={{ opacity: 0 }}
            animate={visible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.38 }}
          >
            <tspan x={CX} dy="-5">Revenue Book</tspan>
            <tspan x={CX} dy="11">of Record</tspan>
          </motion.text>
        </svg>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   LARGE STAT COUNTER
───────────────────────────────────────────────────────────── */
function LargeStatCount({ value, prefix = '', suffix = '', color = C.text }: {
  value: number; prefix?: string; suffix?: string; color?: string
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const triggered = useRef(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !triggered.current) {
        triggered.current = true; obs.disconnect()
        const start = Date.now(); const dur = 1800
        const tick = () => {
          const p = Math.min((Date.now() - start) / dur, 1)
          const eased = 1 - Math.pow(1 - p, 3)
          setCount(Math.round(eased * value))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [value])
  return (
    <div ref={ref} style={{ fontSize: 'clamp(4rem,10vw,7rem)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', color: C.text, margin: 0 }} aria-label={`${prefix}${value}${suffix}`}>
      {prefix}{count}<span style={{ color: C.text }}>{suffix}</span>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
export default function ComplexityClient() {
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '56px 0' : '90px 0'
  const heroPad = isMobile ? '48px 0 48px' : '90px 0 72px'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const twoCols = isTablet ? '1fr' : 'repeat(2, minmax(0, 1fr))'
  const heroGap = isMobile ? '24px' : isTablet ? '32px' : '80px'
  const sectionGap = isMobile ? '24px' : isTablet ? '32px' : '80px'
  const caseCols = isTablet ? '1fr' : '1fr 1.4fr'
  const relatedCols = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'
  const roleCols = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'

  const heroGraphic = (
    <motion.div initial={{ opacity: 0, x: isMobile ? 0 : 24, y: isMobile ? 14 : 0 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}>
      <ComplexityGraphic />
    </motion.div>
  )

  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; } }

        .cx-role-card {
          display: flex; flex-direction: column;
          background: ${C.surface};
          border: 1px solid ${C.border};
          padding: 28px 26px 26px;
          position: relative;
          transition: border-color 0.3s ease, transform 0.3s ease;
        }
        .cx-role-card:hover { border-color: rgba(255,255,255,0.13); transform: translateY(-3px); }
        .cx-bullet-row { display: flex; gap: 14px; align-items: flex-start; padding: 14px 0; border-bottom: 1px solid ${C.border}; }
        .cx-bullet-row:last-child { border-bottom: none; }
        .cx-cta-row { display: flex; gap: 18px; align-items: flex-start; padding: 18px 0; border-bottom: 1px solid ${C.border}; }
        .cx-cta-row:last-child { border-bottom: none; }
        .cx-related-card {
          display: flex; flex-direction: column;
          background: ${C.surface}; border: 1px solid ${C.border};
          padding: 28px 26px; text-decoration: none;
          position: relative; overflow: hidden;
          transition: border-color 0.3s ease, transform 0.3s ease;
        }
        .cx-related-card:hover { border-color: rgba(255,255,255,0.14); transform: translateY(-4px); }
        .btn-primary { border-color: ${C.honey} !important; }
        .btn-primary:hover { border-color: ${C.honey} !important; }
        .cx-gradient-border {
          position: relative;
          background: ${C.surface};
        }
        .cx-gradient-border::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 1px;
          background: linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
      `}</style>

      {/* ── 1. HERO ── */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: heroPad, display: 'flex', alignItems: 'center' }} aria-label="Revenue complexity in wealth management">
        <div aria-hidden="true" style={{ position: 'absolute', top: '5%', left: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.07) 0%, transparent 62%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '5%', right: '5%', width: 700, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.05) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', top: '30%', right: '10%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.04) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, pointerEvents: 'none', background: `linear-gradient(to bottom, transparent, ${C.bg})` }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad, width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: heroGap, alignItems: 'center' }}>
            {isMobile && heroGraphic}
            <div style={{ maxWidth: 560 }}>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                <Eyebrow color={C.honey}>Industry Challenges</Eyebrow>
              </motion.div>
              <h1 style={{ fontSize: 'clamp(2.25rem,5vw,4rem)', fontWeight: 700, color: C.text, lineHeight: 1.05, letterSpacing: '-0.028em', margin: 0 }}>
                <motion.span style={{ display: 'block' }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}>Complexity Is Consuming Capacity</motion.span>
                <motion.span style={{ display: 'block' }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}>
                  <span style={{ color: C.honey }}>Firms Can No Longer Afford</span> To Lose
                </motion.span>
              </h1>
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.75 }} style={{ marginTop: 24, fontSize: 18, color: C.body, lineHeight: 1.75, maxWidth: 500 }}>
                In wealth and asset management, complexity is not just an operational nuisance.
                It is a growth constraint. PureFacts helps firms govern that complexity
                so it stops acting like a tax on every part of the business.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.95 }} style={{ marginTop: 36 }}>
                <Link href="/contact" className="btn-primary">Talk to an expert</Link>
              </motion.div>
            </div>
            {!isMobile && heroGraphic}
          </div>
        </div>
      </section>

      {/* ── 2. COMPLEXITY SLOWS EVERY PART ── */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="How complexity slows down the business">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.05) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <Reveal>
            <div style={{ marginBottom: 48, maxWidth: 640 }}>
              <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', margin: 0 }}>
                Complexity Slows Down Every Part Of The Business
              </h2>
              <p style={{ marginTop: 14, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                Most firms experience complexity gradually: one exception, one workaround,
                one report at a time. Over time, those exceptions become the operating model
                and the cost shows up everywhere.
              </p>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: roleCols, gap: 16, alignItems: 'stretch' }}>
            {[
              { icon: 'fa-user-tie',        role: 'Advisors',   impact: 'Spend more time navigating process and validating numbers than building relationships and growing the book.' },
              { icon: 'fa-gears',            role: 'Operations', impact: 'Become trapped in exception handling and manual reconciliation, with less time for process improvement or scale.' },
              { icon: 'fa-chart-pie',        role: 'Finance',    impact: 'Lose visibility into where effort is being consumed and where margin is being diluted across the business.' },
              { icon: 'fa-building-columns', role: 'Leadership', impact: 'Spend time managing exceptions instead of managing the business, with less confidence in the data they are acting on.' },
            ].map((item, i) => (
              <Reveal key={item.role} delay={i * 70} style={{ display: 'flex' }}>
                <div className="cx-role-card" style={{ flex: 1, border: `1px solid ${C.honey}` }}>
                  <i className={`fa-solid ${item.icon}`} style={{ color: C.honey, fontSize: 22, marginBottom: 16, lineHeight: 1 }} aria-hidden="true" />
                  <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 10px', lineHeight: 1 }}>{item.role}</p>
                  <p style={{ fontSize: 15, color: C.body, lineHeight: 1.72, margin: 0 }}>{item.impact}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. THE PROBLEM ── */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="How complexity erodes trust and efficiency">
        <div aria-hidden="true" style={{ position: 'absolute', top: '10%', right: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(251,86,7,0.05) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '0%', left: '5%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.05) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'start' }}>
            <div>
              <Reveal>
                <Eyebrow color={C.honey}>The Problem</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                  Complexity Erodes Trust and Efficiency
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
                  <p style={{ fontSize: 16, color: C.body, lineHeight: 1.75, margin: 0 }}>
                    When compensation plans are opaque, advisors build their own shadow
                    accounting. When billing logic is difficult to follow, operations and
                    field leaders spend time checking and rechecking outcomes. When reporting
                    depends on stitched-together data, leadership questions whether the
                    organization is seeing the full picture.
                  </p>
                  <p style={{ fontSize: 16, color: C.body, lineHeight: 1.75, margin: 0 }}>
                    That trust gap matters. It affects culture, advisor satisfaction, speed
                    of decision-making, and the firm&rsquo;s ability to scale confidently.
                  </p>
                </div>
              </Reveal>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {[
                { label: 'Shadow Accounting',      icon: 'fa-file-excel',  detail: 'When advisors cannot trust compensation calculations, they build their own tracking systems, duplicating effort and eroding confidence.' },
                { label: 'Compounding Exceptions', icon: 'fa-layer-group', detail: 'Each workaround layered on top of the last normalizes work that should be unnecessary, until the exception becomes standard procedure.' },
                { label: 'Scaling Headcount Risk', icon: 'fa-users',       detail: 'Without a governed foundation, firms are forced to add operational headcount to keep pace with growth, degrading operating leverage.' },
              ].map((item, i) => (
                <Reveal key={item.label} delay={i * 70}>
                  <li className="cx-bullet-row">
                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                      <i className={`fa-solid ${item.icon}`} style={{ color: C.honey, fontSize: 14, lineHeight: 1 }} aria-hidden="true" />
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1 }}>{item.label}</p>
                      <p style={{ marginTop: 4, fontSize: 15, color: C.body, lineHeight: 1.7, margin: '4px 0 0' }}>{item.detail}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 4. $63M PROOF MOMENT ── */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Regulatory enforcement and RBC case study">
        <div aria-hidden="true" style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.07) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '0%', right: '5%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.04) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: caseCols, gap: sectionGap, alignItems: 'center' }}>
            <Reveal>
              <LargeStatCount value={63} prefix="$" suffix="M" color={C.honey} />
              <p style={{ marginTop: 16, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.18em', color: C.subtle }}>In penalties, one SEC sweep</p>
              <div style={{ marginTop: 20, height: 1, width: 64, background: C.border }} aria-hidden="true" />
              <p style={{ marginTop: 16, fontSize: 13, color: C.subtle, fontStyle: 'italic' }}>U.S. SEC enforcement press release, January 2025</p>
            </Reveal>
            <Reveal delay={120}>
              <Eyebrow color={C.honey}>The Cost of Poor Governance</Eyebrow>
              <h2 style={{ fontSize: 'clamp(1.6rem,2.8vw,2.2rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.22, margin: 0 }}>
                In January 2025, the SEC hit 12 firms with more than $63 million in penalties in a single sweep for recordkeeping failures.
              </h2>
              <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                Poor data hygiene and fragmented audit trails are no longer just operational problems.
                They are regulatory exposure. RBC partnered with PureFacts to deliver a complex,
                large-scale Fees and Billing implementation, meeting every critical milestone on one
                of the most aggressive timelines in the firm&rsquo;s history.
              </p>
              <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
                {[
                  { value: '<1 Year', label: 'Production launch achieved',              color: C.honey },
                  { value: '2.8M',    label: 'Accounts calculated including sleeves',   color: C.honey },
                  { value: '100%',    label: 'Critical milestones met on schedule',     color: C.text  },
                ].map(s => (
                  <div key={s.label}>
                    <p style={{ fontSize: 'clamp(1.35rem,2.4vw,1.8rem)', fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
                    <p style={{ marginTop: 4, fontSize: 13, color: C.body, lineHeight: 1.6 }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24 }}>
                <Link href="/case-study/professional-services-tackling-complex-purefees-implementation-with-rbc" className="btn-primary">Read the case study</Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 5. THE PUREFACTS APPROACH ── */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="What firms gain when they reduce revenue complexity">
        <div aria-hidden="true" style={{ position: 'absolute', top: '5%', left: '0%', width: 550, height: 450, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.06) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '5%', right: '5%', width: 600, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'center' }}>
            <div>
              <Reveal>
                <Eyebrow color={C.honey}>The PureFacts Approach</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                  What Firms Gain When They{' '}
                  <span style={{ color: C.honey }}>Reduce Revenue Complexity</span>
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                  PureFacts helps firms turn fragmented revenue operations into a more
                  coordinated, auditable, and manageable system. That reduces friction today
                  and creates a stronger base for future growth, without proportionally
                  increasing administrative burden.
                </p>
              </Reveal>
              <ul style={{ margin: '24px 0 0', padding: 0, listStyle: 'none' }}>
                {[
                  'When billing, compensation, and reporting run reliably, advisors stop navigating process and start focusing on relationships and growth.',
                  'A governed revenue foundation reduces the exceptions-as-default model that consumes operations capacity quarter after quarter.',
                  'When the underlying logic is clearer and the system of record is reliable, every part of the business moves faster and with more certainty.',
                  'Firms can take on more clients, products, and arrangements without proportionally increasing the administrative burden.',
                ].map((detail, i) => (
                  <Reveal key={i} delay={i * 70}>
                    <li style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '12px 0' }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.honey, flexShrink: 0, marginTop: 9 }} aria-hidden="true" />
                      <p style={{ fontSize: 15, color: C.body, lineHeight: 1.7, margin: 0 }}>{detail}</p>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
            <Reveal delay={120}><PlatformDiagram /></Reveal>
          </div>
        </div>
      </section>

      {/* ── 6. RELATED CHALLENGES ── */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Related revenue challenges">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 350, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <Reveal>
            <h2 style={{ fontSize: 'clamp(1.5rem,2.5vw,2rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.02em', margin: '0 0 8px' }}>Complexity Does Not Exist In Isolation</h2>
            <p style={{ fontSize: 15, color: C.body, maxWidth: 560, margin: '0 0 36px' }}>It amplifies every other challenge in the revenue lifecycle. Explore the forces working against margin and growth.</p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: relatedCols, gap: 16, alignItems: 'stretch' }}>
            {[
              { icon: 'fa-compress',              color: C.azure,    label: 'Compression', href: '/why-purefacts/compression', desc: 'Fee pressure is rising while cost to serve expands. See how firms protect margin without sacrificing growth.', isPlatform: false },
              { icon: 'fa-circle-dollar-to-slot', color: C.mandarin, label: 'Collection',  href: '/why-purefacts/collection',  desc: 'Revenue you earned but did not collect is margin lost. See how firms close the gap between realized and collected value.', isPlatform: false },
              { icon: null,                        color: C.azure,    label: 'Secure Your Revenue Lifecycle', href: '/platform', desc: 'Compression, collection, and complexity are connected problems. The PureFacts platform addresses all three.', isPlatform: true },
            ].map((card, i) => (
              <Reveal key={card.label} delay={i * 70} style={{ display: 'flex' }}>
                {card.isPlatform ? (
                  <Link
                    href={card.href}
                    className="cx-gradient-border"
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: isMobile ? '24px 22px' : '28px 26px', textDecoration: 'none', position: 'relative', overflow: 'hidden', transition: 'transform 0.3s ease' }}
                    aria-label={`${card.label}: ${card.desc}`}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    <div style={{ width: 180, height: 40, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Image src="/PureRevenueWhite.svg" alt="PureRevenue" width={200} height={50} style={{ objectFit: 'contain' }} />
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: C.text, margin: '0 0 10px' }}>{card.label}</h3>
                    <p style={{ fontSize: 14, color: C.body, lineHeight: 1.7, margin: '0 0 20px', flex: 1 }}>{card.desc}</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: C.honey }}>
                      Explore the platform <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} aria-hidden="true" />
                    </span>
                  </Link>
                ) : (
                  <Link href={card.href} className="cx-related-card" style={{ flex: 1, border: `1px solid ${card.color}` }} aria-label={`${card.label}: ${card.desc}`}>
                    <div style={{ flexShrink: 0, marginBottom: 16 }}>
                      <i className={`fa-solid ${card.icon}`} style={{ color: card.color, fontSize: 16, lineHeight: 1 }} aria-hidden="true" />
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: C.text, margin: '0 0 10px' }}>{card.label}</h3>
                    <p style={{ fontSize: 14, color: C.body, lineHeight: 1.7, margin: '0 0 20px', flex: 1 }}>{card.desc}</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: card.color }}>
                      Learn more <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} aria-hidden="true" />
                    </span>
                  </Link>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. FINAL CTA ── */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Bring more control to revenue complexity">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 1000, height: 600, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.06) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '0%', left: '5%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(251,86,7,0.05) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', top: '20%', right: '0%', width: 400, height: 350, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.04) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'center' }}>
            <div>
              {[
                { icon: 'fa-user-tie',           color: C.honey,    title: 'More Advisor Time For Clients',   desc: 'When billing, compensation, and reporting run reliably, advisors stop navigating process and start focusing on relationships and growth.' },
                { icon: 'fa-gears',               color: C.mandarin, title: 'Less Operational Reconciliation', desc: 'A governed revenue foundation reduces the exceptions-as-default model that consumes operations capacity quarter after quarter.' },
                { icon: 'fa-arrow-up-right-dots', color: C.azure,    title: 'Scalable Growth',                 desc: 'Take on more clients, products, and arrangements without proportionally increasing the administrative burden of managing them.' },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 70}>
                  <div className="cx-cta-row">
                    <div style={{ width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                      <i className={`fa-solid ${item.icon}`} style={{ color: item.color, fontSize: 17, lineHeight: 1 }} aria-hidden="true" />
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
                Bring More Control To The{' '}
                <GradientText>Complexity Behind Growth.</GradientText>
              </h2>
              <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                PureFacts helps wealth management firms simplify the revenue lifecycle
                across pricing, billing, compensation, and reporting, so complexity
                stops acting like a tax on growth and starts becoming a manageable
                part of the business.
              </p>
              <div style={{ marginTop: 30 }}>
                <Link href="/contact" className="btn-primary">Talk to an expert</Link>
              </div>
              <p style={{ marginTop: 16, fontSize: 13, color: C.subtle }}>Trusted by the top global financial firms</p>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}