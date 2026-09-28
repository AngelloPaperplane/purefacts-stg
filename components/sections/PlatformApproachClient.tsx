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
  azure:   '#3b84ff',
  mandarin:'#fb5607',
  honey:   '#ffb30c',
  fees:    '#ED65D0',
  comp:    '#FF006E',
  sunset:  'linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%)',
} as const

function GradientText({ children }: { children: React.ReactNode }) {
  return <span style={{ background: C.sunset, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{children}</span>
}

function Eyebrow({ children, color = C.azure }: { children: React.ReactNode; color?: string }) {
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

/* ─────────────────────────────────────────────────────────────
   PLATFORM DIAGRAM — PureRevenue wedge diagram
   Layout: Practice Management top · Compensation right ·
           Fees & Billing bottom-left.
───────────────────────────────────────────────────────────── */
const DIAGRAM_WEDGES = [
  {
    id: 'practice',
    label: 'Practice Management',
    startAngle: -60, endAngle: 60,
    fill: 'none', stroke: '#ffb30c',
    faUnicode: '\uf201',
  },
  {
    id: 'comp',
    label: 'Compensation',
    startAngle: 60, endAngle: 180,
    fill: 'none', stroke: '#FF006E',
    faUnicode: '\uf51e',
  },
  {
    id: 'fees',
    label: 'Fees & Billing',
    startAngle: 180, endAngle: 300,
    fill: 'none', stroke: '#ED65D0',
    faUnicode: '\uf571',
  },
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
      {/* Ambient glow behind diagram */}
      <div style={{
        position: 'absolute',
        width: 'min(260px, 70%)', aspectRatio: '1',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,132,255,0.13) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', width: isMobile ? 'min(220px, 78vw)' : 'min(340px, 88%)', aspectRatio: '1' }}>
        <svg viewBox={`0 0 ${VB} ${VB}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <radialGradient id="hub-grad-ic" cx="40%" cy="35%" r="60%">
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
                {/* Wedge shape */}
                <motion.path
                  d={path}
                  fill={w.fill} stroke={w.stroke} strokeWidth="1.5"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.88 }}
                  style={{ transformOrigin: `${CX}px ${CY}px` }}
                  transition={{ duration: 0.55, delay: visible ? wi * 0.18 : 0, ease: [0.16, 1, 0.3, 1] }}
                />
                {/* FA icon inside wedge */}
                <motion.text
                  x={iconPt.x} y={iconPt.y}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="13" fontWeight="900"
                  fontFamily="'Font Awesome 6 Free', 'Font Awesome 6 Pro', 'Font Awesome 5 Free'"
                  fill={w.stroke}
                  initial={{ opacity: 0 }}
                  animate={visible ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.4, delay: visible ? wi * 0.18 + 0.18 : 0 }}
                >
                  {w.faUnicode}
                </motion.text>
                {/* Label outside wedge */}
                <motion.text
                  x={labelPt.x} y={labelPt.y}
                  textAnchor={textAnchor} dominantBaseline="middle"
                  fontSize="8.5" fontWeight="700" fill={w.stroke}
                  style={{ letterSpacing: '0.02em' }}
                  initial={{ opacity: 0 }}
                  animate={visible ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.4, delay: visible ? wi * 0.18 + 0.30 : 0 }}
                >
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

          {/* Hub background wipe */}
          <circle cx={CX} cy={CY} r={HUB_R + 2} fill="#140f0c" />
          <circle cx={CX} cy={CY} r={HUB_R} fill="none" stroke="rgba(59,132,255,0.18)" strokeWidth="1.5" />

          {/* Hub fill */}
          <motion.circle
            cx={CX} cy={CY} r={HUB_R}
            fill="none"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={visible ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          />

          {/* Hub border ring */}
          <circle cx={CX} cy={CY} r={HUB_R} fill="none" stroke="rgba(59,132,255,0.45)" strokeWidth="1.5" />

          {/* Hub label */}
          <motion.text
            x={CX} y={CY}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fontWeight="600" fill="#f4f4f4"
            style={{ letterSpacing: '0.02em' }}
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
   FRAGMENTATION VS CONNECTED DIAGRAM
───────────────────────────────────────────────────────────── */
function FragmentationConnectedDiagram() {
  const { isMobile } = useBreakpoint()
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const c = containerRef.current; if (!c) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.25 })
    obs.observe(c); return () => obs.disconnect()
  }, [])

  const MODULES = [
    { label: 'Fees',          color: C.fees },
    { label: 'Comp',          color: C.comp },
    { label: 'Insights',      color: C.honey },
    { label: 'Intelligence',  color: C.azure },
  ]

  function Block({ label, color, idx }: { label: string; color: string; idx: number }) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={visible ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.4, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
        style={{ background: C.bg, border: `1px solid ${color}45`, padding: '8px 12px', textAlign: 'center' as const, minWidth: 70, position: 'relative' }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color, opacity: 0.7 }} />
        <span style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: '0.08em' }}>{label}</span>
      </motion.div>
    )
  }

  return (
    <div ref={containerRef} style={{ background: C.surface, border: `1px solid ${C.border}`, padding: isMobile ? 14 : 20, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2px 1fr', gap: isMobile ? 20 : 0 }}>

        {/* BEFORE */}
        <div style={{ padding: isMobile ? 0 : '0 16px 0 0' }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: C.mandarin, letterSpacing: '0.16em', textTransform: 'uppercase' as const, margin: '0 0 14px' }}>Before</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {MODULES.map((m, i) => <Block key={m.label} label={m.label} color={m.color} idx={i} />)}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={visible ? { opacity: 1 } : {}}
            transition={{ delay: 0.5, duration: 0.3 }}
            style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}
          >
            {[C.fees, C.comp, C.honey].map((color, i) => (
              <div key={i} style={{ fontSize: 11, color: C.mandarin }}>✕</div>
            ))}
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={visible ? { opacity: 1 } : {}}
            transition={{ delay: 0.65, duration: 0.3 }}
            style={{ fontSize: 10, color: C.subtle, textAlign: 'center' as const, marginTop: 8, marginBottom: 0 }}
          >
            No shared data model
          </motion.p>
        </div>

        {/* Divider */}
        {!isMobile && <div style={{ background: C.border, margin: '0 12px' }} />}

        {/* AFTER */}
        <div style={{ padding: isMobile ? 0 : '0 0 0 16px' }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: C.azure, letterSpacing: '0.16em', textTransform: 'uppercase' as const, margin: '0 0 14px' }}>After</p>

          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={visible ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ background: `${C.azure}18`, border: `1.5px solid ${C.azure}50`, padding: '6px 10px', textAlign: 'center' as const, margin: '0 auto 10px', width: 'fit-content' }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, color: C.azure }}>PureRevenue</span>
          </motion.div>

          <svg style={{ display: 'block', width: '100%', height: 20, overflow: 'visible', marginBottom: 6 }} aria-hidden="true">
            {[0, 1, 2, 3].map(i => (
              <motion.line
                key={i}
                x1="50%" y1="0" x2={`${12.5 + i * 25}%`} y2="20"
                stroke={MODULES[i].color} strokeWidth="1.5" strokeOpacity="0.55"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={visible ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.35 }}
              />
            ))}
          </svg>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {MODULES.map((m, i) => <Block key={m.label} label={m.label} color={m.color} idx={i + 4} />)}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={visible ? { opacity: 1 } : {}}
            transition={{ delay: 0.9, duration: 0.3 }}
            style={{ fontSize: 10, color: C.azure, textAlign: 'center' as const, marginTop: 8, marginBottom: 0, fontWeight: 600 }}
          >
            One shared data model ✓
          </motion.p>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: C.subtle, letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontWeight: 600, marginTop: 16, marginBottom: 0 }}>
        Connected by design, not by integration
      </p>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   AUDIT TRAIL PANEL
───────────────────────────────────────────────────────────── */
function AuditTrailPanel() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const c = containerRef.current; if (!c) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        obs.disconnect()
        ;[0, 1, 2, 3].forEach(i => setTimeout(() => setPhase(i + 1), 200 + i * 250))
      }
    }, { threshold: 0.25 })
    obs.observe(c); return () => obs.disconnect()
  }, [])

  const ROWS = [
    { step: '01', label: 'Fee calculation run',         detail: 'Tiered schedule applied — 847 accounts',          status: 'Complete',  color: C.azure,    time: '09:14:22' },
    { step: '02', label: 'Exception flagged',            detail: 'Account #4821 — below-band rate detected',        status: 'Reviewed',  color: C.honey,    time: '09:14:23' },
    { step: '03', label: 'Override approved',            detail: 'Approved by J. Lawson — 90-day expiry set',       status: 'Governed',  color: C.mandarin, time: '09:17:01' },
    { step: '04', label: 'Output generated',             detail: 'Invoice batch #2024-Q3-042 — audit log attached', status: 'Auditable', color: C.azure,    time: '09:17:04' },
  ]

  return (
    <div ref={containerRef} style={{ background: C.surface, border: `1px solid ${C.border}`, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: C.subtle }}>Calculation Audit Trail</span>
        <span style={{ fontSize: 9, color: C.azure, fontWeight: 700 }}>LIVE</span>
      </div>

      <div style={{ position: 'relative', paddingLeft: 28 }}>
        {/* Spine */}
        <div style={{ position: 'absolute', left: 10, top: 8, bottom: 8, width: 1, background: C.border }} />

        {ROWS.map((row, i) => (
          <motion.div
            key={row.step}
            initial={{ opacity: 0, x: -8 }}
            animate={phase > i ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'relative', marginBottom: i < ROWS.length - 1 ? 10 : 0 }}
          >
            {/* Dot on spine */}
            <div style={{ position: 'absolute', left: -24, top: 10, width: 8, height: 8, borderRadius: '50%', background: row.color, border: `1px solid ${row.color}`, boxShadow: `0 0 5px ${row.color}50` }} />

            <div style={{ background: C.bg, border: `1px solid ${row.color}25`, padding: '9px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: row.color }}>{row.step}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{row.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 9, color: C.subtle }}>{row.time}</span>
                  <span style={{ fontSize: 8, fontWeight: 800, color: row.color, letterSpacing: '0.10em', textTransform: 'uppercase' as const }}>{row.status}</span>
                </div>
              </div>
              <p style={{ fontSize: 11, color: C.subtle, margin: 0, paddingLeft: 20 }}>{row.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={phase >= 4 ? { opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.4 }}
        style={{ marginTop: 12, padding: '8px 12px', background: `${C.azure}0c`, border: `1px solid ${C.azure}30`, display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <i className="fa-solid fa-circle-check" style={{ color: C.azure, fontSize: 11 }} aria-hidden="true" />
        <span style={{ fontSize: 10, color: C.azure, fontWeight: 600 }}>Full lineage captured. Every step defensible.</span>
      </motion.div>

      <p style={{ textAlign: 'center', fontSize: 11, color: C.subtle, letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontWeight: 600, marginTop: 14, marginBottom: 0 }}>
        Audit readiness built in, not bolted on
      </p>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MODULE ROW LINK
───────────────────────────────────────────────────────────── */
function ModuleRow({ href, gradient, icon, title, body, ariaLabel }: {
  href: string; gradient: string; icon: string; title: string; body: string; ariaLabel: string
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 20,
        padding: '20px 16px', margin: '0 -16px',
        borderBottom: `1px solid ${C.border}`,
        textDecoration: 'none',
        background: hovered ? `rgba(255,255,255,0.03)` : 'transparent',
        transition: 'background 0.15s ease',
      }}
    >
      <div style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 10, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden="true">
        <i className={`fa-solid ${icon}`} style={{ color: '#fff', fontSize: 16 }} aria-hidden="true" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: hovered ? C.azure : C.text, margin: 0, transition: 'color 0.15s' }}>{title}</h3>
        <p style={{ marginTop: 4, fontSize: 14, color: C.body, lineHeight: 1.65, margin: '4px 0 0' }}>{body}</p>
      </div>
      <i className={`fa-solid fa-arrow-right`} style={{ fontSize: 12, color: hovered ? C.azure : C.border, transform: hovered ? 'translateX(3px)' : 'none', transition: 'all 0.15s', flexShrink: 0 }} aria-hidden="true" />
    </Link>
  )
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
export default function PlatformApproachClient() {
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '56px 0' : '90px 0'
  const heroPad = isMobile ? '48px 0 48px' : '90px 0 72px'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const twoCols = isTablet ? '1fr' : 'repeat(2, minmax(0, 1fr))'
  const heroGap = isMobile ? '24px' : isTablet ? '32px' : '80px'
  const sectionGap = isMobile ? '24px' : isTablet ? '32px' : '80px'
  const cardGridCols = isMobile ? '1fr' : '1fr 1fr'

  const heroGraphic = (
    <motion.div initial={{ opacity: 0, x: isMobile ? 0 : 24, y: isMobile ? 14 : 0 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }} style={{ minHeight: isMobile ? 260 : 400, display: 'flex', alignItems: 'center' }}>
      <PlatformDiagram />
    </motion.div>
  )

  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; } }

        .pa-bullet-row { display: flex; gap: 14px; align-items: flex-start; padding: 14px 0; border-bottom: 1px solid ${C.border}; }
        .pa-bullet-row:last-child { border-bottom: none; }
        .pa-plain-bullet { display: flex; gap: 12px; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid ${C.border}; }
        .pa-plain-bullet:last-child { border-bottom: none; }
        .pa-ai-card { background: ${C.surface}; border: 1px solid ${C.border}; padding: 22px 20px; transition: border-color 0.3s ease, transform 0.3s ease; }
        .pa-ai-card:hover { border-color: rgba(59,132,255,0.3); transform: translateY(-3px); }
        .pa-cta-row { display: flex; gap: 18px; align-items: flex-start; padding: 18px 0; border-bottom: 1px solid ${C.border}; }
        .pa-cta-row:last-child { border-bottom: none; }
      `}</style>

      {/* ══════════════════════════════════
          1. HERO
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: heroPad, display: 'flex', alignItems: 'center' }} aria-label="Platform Approach hero">
        <div aria-hidden="true" style={{ position: 'absolute', top: '5%', left: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.07) 0%, transparent 62%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '5%', right: '5%', width: 700, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(237,101,208,0.05) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', top: '30%', right: '5%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,0,110,0.04) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, pointerEvents: 'none', background: `linear-gradient(to bottom, transparent, ${C.bg})` }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad, width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: heroGap, alignItems: 'center' }}>
            {isMobile && heroGraphic}

            <div style={{ maxWidth: 560 }}>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                <Eyebrow color={C.azure}>Platform Approach</Eyebrow>
              </motion.div>
              <h1 style={{ fontSize: 'clamp(2.25rem,5vw,4rem)', fontWeight: 700, color: C.text, lineHeight: 1.05, letterSpacing: '-0.028em', margin: 0 }}>
                <motion.span style={{ display: 'block' }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                  A Platform Built For
                </motion.span>
                <motion.span style={{ display: 'block' }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}>
                  <span style={{ color: C.azure }}>Revenue Complexity</span>
                </motion.span>
              </h1>
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.75 }} style={{ marginTop: 24, fontSize: 18, color: C.body, lineHeight: 1.75, maxWidth: 500 }}>
                PureFacts connects billing, compensation, reporting, and intelligence in one AI-fueled platform. Not a collection of disconnected tools. A purpose-built system designed to help firms operate with more consistency, adapt faster, and make better decisions across the revenue lifecycle.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.95 }} style={{ marginTop: 36, display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>
                <Link href="/contact" className="btn-primary">Talk to an expert</Link>
              </motion.div>
            </div>

            {/* Hero graphic: PlatformDiagram replaces PlatformConnectionCanvas */}
            {!isMobile && heroGraphic}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          2. PLATFORM MODULE LIST
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Connected platform modules">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap }}>

            {/* Left: eyebrow, H2, body, PureRevenue card */}
            <Reveal style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Eyebrow color={C.azure}>Platform Approach</Eyebrow>
              <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: '0 0 16px' }}>
                Connected <span style={{ color: C.azure }}>By Design</span>
              </h2>
              <p style={{ fontSize: 16, color: C.body, lineHeight: 1.75, margin: '0 0 28px' }}>
                Revenue decisions do not happen in isolation. A pricing exception affects billing. Billing accuracy affects advisor trust. Compensation shapes behavior, profitability, and growth.
              </p>

              {/* PureRevenue card — gradient trim, SVG logo */}
              <Link
                href="/platform"
                style={{ textDecoration: 'none', display: 'block' }}
                aria-label="Explore the PureRevenue platform"
              >
                <div style={{ padding: 2, background: 'linear-gradient(135deg, #3A86FF, #045ABD, #2575E6)' }}>
                  <div style={{ background: C.surface, padding: '18px 20px' }}>
                    {/* SVG logo replacing the text label */}
                    <img
                      src="/PureRevenueWhite.svg"
                      alt="PureRevenue"
                      style={{ height: 22, display: 'block', marginBottom: 12 }}
                    />
                    <p style={{ fontSize: 15, color: C.body, lineHeight: 1.7, margin: '0 0 14px' }}>
                      One connected platform managing fee billing, advisor compensation, reporting, and intelligence across the full revenue lifecycle.
                    </p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: C.azure }}>
                      Explore the platform <i className="fa-solid fa-arrow-right" style={{ fontSize: 11 }} aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>

            {/* Right: module rows — icons updated to match platform diagram icons */}
            <Reveal delay={80} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div>
                <ModuleRow
                  href="/platform/fees-and-billing"
                  gradient="linear-gradient(135deg, #FE5EB6, #BD79FF)"
                  icon="fa-file-invoice-dollar"
                  title="Fees and Billing"
                  body="Centralized fee logic with full traceability at any scale. Every calculation defensible, every exception governed, every output auditable."
                  ariaLabel="Explore Fees and Billing: centralized fee logic with full traceability at any scale"
                />
                <ModuleRow
                  href="/platform/compensation"
                  gradient="linear-gradient(135deg, #FB5607, #FF006E)"
                  icon="fa-coins"
                  title="Compensation"
                  body="Governed payout logic that builds trust with advisors and precision for the firm. Rule-based, transparent, and connected to the same data model as billing."
                  ariaLabel="Explore Compensation: governed payout logic that builds trust with advisors"
                />
                <ModuleRow
                  href="/platform/practice-management"
                  gradient="linear-gradient(135deg, #FFB40B, #FB5607)"
                  icon="fa-chart-line"
                  title="Practice Management"
                  body="Role-based dashboards and advisor performance tools built on governed, trusted data. A native output of the same logic driving billing and compensation."
                  ariaLabel="Explore Practice Management: role-based dashboards built on governed, trusted data"
                />
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          3. WHY PLATFORM MATTERS
          Graphic removed — icons list moved to right column
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Why a connected platform matters">
        <div aria-hidden="true" style={{ position: 'absolute', top: '10%', right: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.06) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'start' }}>

            {/* Left: eyebrow, H2, body */}
            <div>
              <Reveal>
                <Eyebrow color={C.azure}>Why It Matters</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                  When Revenue Is Fragmented,{' '}
                  <span style={{ color: C.azure }}>Everything Downstream Suffers</span>
                </h2>
              </Reveal>
              <Reveal delay={70}>
                <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                  When moving parts are spread across disconnected systems, firms lose visibility. Manual work increases. Confidence drops. Processes slow down. What should be a strategic revenue engine starts to feel fragmented and difficult to trust. PureFacts takes a different approach.
                </p>
              </Reveal>
            </div>

            {/* Right: icons list (moved from below body, graphic removed) */}
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', alignSelf: 'start' }}>
              {[
                { label: 'One Connected Foundation', color: C.azure,    icon: 'fa-link',          detail: 'Billing, compensation, reporting, and control points share the same data model. No reconciliation between systems.' },
                { label: 'Greater Consistency',      color: C.mandarin, icon: 'fa-equals',         detail: 'Fee logic, payout rules, and reporting outputs behave the same way across every team, product, and region.' },
                { label: 'Trustworthy Outputs',      color: C.azure,    icon: 'fa-shield-halved',  detail: 'Auditable, decision-grade results across highly complex revenue operations. Not just one step, the whole system.' },
                { label: 'Scales With Complexity',   color: C.honey,    icon: 'fa-arrow-trend-up', detail: 'More advisors, more products, more pricing variation. The platform absorbs it without adding proportional operational drag.' },
              ].map((item, i) => (
                <Reveal key={item.label} delay={i * 70}>
                  <li className="pa-bullet-row">
                    <i className={`fa-solid ${item.icon}`} style={{ color: item.color, fontSize: 18, flexShrink: 0, width: 20, textAlign: 'center' as const, marginTop: 2 }} aria-hidden="true" />
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>{item.label}</p>
                      <p style={{ marginTop: 4, fontSize: 15, color: C.body, lineHeight: 1.7, margin: '4px 0 0' }}>{item.detail}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          4. AI SECTION
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="AI-fueled intelligence">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.06) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'start' }}>
            <div>
              <Reveal>
                <Eyebrow color={C.azure}>AI-Fueled Intelligence</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                  AI That Makes The Platform <span style={{ color: C.azure }}>More Useful.</span> Not More Theatrical.
                </h2>
              </Reveal>
              <Reveal delay={70}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
                  <p style={{ fontSize: 16, color: C.body, lineHeight: 1.75, margin: 0 }}>
                    At PureFacts, AI is not a feature announcement. It is a design principle. The opportunity is making the platform more adaptive, more insightful, and more capable of helping firms identify patterns, understand performance, and act with greater confidence.
                  </p>
                  <p style={{ fontSize: 16, color: C.body, lineHeight: 1.75, margin: 0 }}>
                    That means AI grounded in domain knowledge, built on top of accurate data, and applied where it genuinely improves how revenue is managed. Intelligence built on bad logic is still bad logic. We start from the right foundation.
                  </p>
                </div>
              </Reveal>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: cardGridCols, gap: 14, gridAutoRows: '1fr', alignItems: 'stretch' }}>
              {[
                { icon: 'fa-magnifying-glass-chart', title: 'Pattern Recognition',    body: 'Surface trends, anomalies, and emerging issues before they require escalation.' },
                { icon: 'fa-bolt',                   title: 'Faster Analysis',         body: 'Accelerate the time from data to insight so decisions happen in hours, not days.' },
                { icon: 'fa-sliders',                title: 'Adaptive Workflows',      body: 'Workflows that learn from the business and improve as complexity evolves.' },
                { icon: 'fa-shield-halved',          title: 'Responsible Application', body: 'AI applied with auditability and governance, never as a black box on critical revenue flows.' },
              ].map((card, i) => (
                <Reveal key={card.title} delay={i * 70} style={{ display: 'contents' }}>
                  <div className="pa-ai-card" style={{ boxSizing: 'border-box' as const }}>
                    <i className={`fa-solid ${card.icon}`} style={{ color: C.azure, fontSize: 20, display: 'block', marginBottom: 12 }} aria-hidden="true" />
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>{card.title}</h3>
                    <p style={{ fontSize: 14, color: C.body, lineHeight: 1.65, margin: 0 }}>{card.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          5. TRUSTWORTHY OUTCOMES SPLIT
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Built for trust and auditability">
        <div aria-hidden="true" style={{ position: 'absolute', top: '5%', left: '0%', width: 550, height: 450, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.06) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'center' }}>
            <Reveal delay={80}><AuditTrailPanel /></Reveal>
            <div>
              <Reveal>
                <Eyebrow color={C.azure}>Built For Trust</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                  In This Industry, <span style={{ color: C.azure }}>Trustworthiness</span> Is Not A Brand Slogan.
                  {!isTablet && <br />}
                  <span style={{ color: C.text }}>It Is </span><span style={{ color: C.azure }}>A Requirement.</span>
                </h2>
              </Reveal>
              <Reveal delay={70}>
                <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                  If billing cannot be trusted, compensation cannot be trusted. If the data is inconsistent, reporting weakens and decision-making slows. PureFacts is designed to support reliable, auditable, decision-grade outputs across highly complex revenue operations.
                </p>
              </Reveal>
              {/* Bullet list — tighter spacing, bullet aligned to first-line center */}
              <ul style={{ margin: '20px 0 0', padding: 0, listStyle: 'none' }}>
                {[
                  'Every calculation is traceable with clear lineage and defensible history.',
                  'Exception governance is embedded into the workflow, not bolted on after the fact.',
                  'Reporting outputs reflect the same governed logic as billing and compensation.',
                  'Audit readiness is a byproduct of how the platform operates, not a separate effort.',
                ].map((item, i) => (
                  <Reveal key={i} delay={i * 60}>
                    <li className="pa-plain-bullet">
                      {/* Bullet: top offset calculated to sit at vertical center of first line (font-size 15, line-height 1.7 ≈ 25.5px → center ≈ 12.75px; dot is 6px → offset ~10px) */}
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.azure, flexShrink: 0, marginTop: 10 }} aria-hidden="true" />
                      <p style={{ fontSize: 15, color: C.body, lineHeight: 1.7, margin: 0 }}>{item}</p>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          6. FINAL CTA
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Call to action">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 1000, height: 600, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.07) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '0%', left: '5%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(237,101,208,0.05) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'center' }}>
            <div>
              {[
                { icon: 'fa-link',          color: C.azure,    title: 'One Connected Foundation', desc: 'Billing, compensation, reporting, and control points share the same data model: no reconciliation between disconnected systems.' },
                { icon: 'fa-microchip',     color: C.mandarin, title: 'AI That Actually Helps',   desc: 'Pattern recognition, adaptive workflows, and faster analysis built on accurate data and domain knowledge: not theatrics.' },
                { icon: 'fa-shield-halved', color: C.honey,    title: 'Trustworthy By Design',    desc: 'Every calculation is traceable, every exception is governed, and audit readiness is a byproduct of how the platform operates.' },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 70}>
                  <div className="pa-cta-row">
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
                The Right Platform Does More Than <GradientText>Connect Systems.</GradientText>
              </h2>
              <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                It connects the logic, workflows, controls, and intelligence needed to manage revenue with greater precision and confidence across the full lifecycle.
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