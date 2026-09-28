'use client'

import { useEffect, useRef, useState, type PointerEvent } from 'react'
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
  return (
    <span style={{ background: C.sunset, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
      {children}
    </span>
  )
}

function Eyebrow({ children, color = C.azure }: { children: React.ReactNode; color?: string }) {
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
   PLATFORM DIAGRAM (from DIAGRAM_WEDGES)
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
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: isMobile ? 240 : 380, overflow: 'visible' }}>
      <div style={{
        position: 'absolute',
        width: 'min(260px, 70%)', aspectRatio: '1',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,132,255,0.13) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', width: isMobile ? 'min(190px, 62vw)' : 'min(340px, 88%)', aspectRatio: '1' }}>
        <svg viewBox={`0 0 ${VB} ${VB}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <radialGradient id="hub-grad-sl" cx="40%" cy="35%" r="60%">
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
                <motion.path
                  d={path}
                  fill={w.fill} stroke={w.stroke} strokeWidth="1.5"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.88 }}
                  style={{ transformOrigin: `${CX}px ${CY}px` }}
                  transition={{ duration: 0.55, delay: visible ? wi * 0.18 : 0, ease: [0.16, 1, 0.3, 1] }}
                />
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

          <circle cx={CX} cy={CY} r={HUB_R + 2} fill="#140f0c" />
          <circle cx={CX} cy={CY} r={HUB_R} fill="none" stroke="rgba(59,132,255,0.18)" strokeWidth="1.5" />

          <motion.circle
            cx={CX} cy={CY} r={HUB_R}
            fill="none"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={visible ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          />

          <circle cx={CX} cy={CY} r={HUB_R} fill="none" stroke="rgba(59,132,255,0.45)" strokeWidth="1.5" />

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
   PAYOUT TRANSPARENCY PANEL
───────────────────────────────────────────────────────────── */
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
    }, { threshold: 0.25 })
    obs.observe(c)
    return () => { obs.disconnect(); if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const ADVISORS = [
    {
      name: 'Advisor A',
      items: [
        { label: 'Base commission',   amount: '$18,400' },
        { label: 'AUM bonus tier',    amount: '+$2,100' },
        { label: 'New client credit', amount: '+$750'   },
        { label: 'Exception override',amount: '−$200'   },
      ],
      total: '$21,050',
      color: C.comp,
    },
    {
      name: 'Advisor B',
      items: [
        { label: 'Base commission',   amount: '$12,600' },
        { label: 'Retention bonus',   amount: '+$900'   },
        { label: 'Fee waiver applied',amount: '−$150'   },
      ],
      total: '$13,350',
      color: C.comp,
    },
    {
      name: 'Advisor C',
      items: [
        { label: 'Base commission',   amount: '$9,200' },
        { label: 'Referral credit',   amount: '+$600'  },
      ],
      total: '$9,800',
      color: C.azure,
    },
  ]

  return (
    <div ref={containerRef} style={{ background: C.surface, border: `1px solid ${C.border}`, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: C.subtle }}>
          Payout Statement — Q3
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.comp, letterSpacing: '0.10em' }}>
          VERIFIED ✓
        </span>
      </div>

      {ADVISORS.map((adv, ai) => (
        <motion.div
          key={adv.name}
          initial={{ opacity: 0, y: 10 }}
          animate={phase > ai ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: ai < ADVISORS.length - 1 ? 12 : 0 }}
        >
          <div style={{ background: C.bg, border: `1px solid ${adv.color}30`, padding: '10px 12px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 3, bottom: 0, background: adv.color, opacity: 0.7 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: adv.color, letterSpacing: '0.10em', textTransform: 'uppercase' as const }}>{adv.name}</span>
            </div>
            {adv.items.map((item, ii) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0 }}
                animate={phase > ai ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.3, delay: ii * 0.08 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}
              >
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

/* ─────────────────────────────────────────────────────────────
   REVENUE PERFORMANCE SCORECARD
───────────────────────────────────────────────────────────── */
function RevenueScorecard() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const c = containerRef.current; if (!c) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.25 })
    obs.observe(c); return () => obs.disconnect()
  }, [])

  const TILES = [
    {
      label: 'Revenue Captured',
      value: '$3.2B',
      trend: '+4.1%',
      up: true,
      color: C.azure,
      spark: [62, 58, 65, 70, 68, 74, 78, 82, 80, 88],
    },
    {
      label: 'Leakage Identified',
      value: '$1.4M',
      trend: '−38%',
      up: false,
      color: C.honey,
      spark: [80, 76, 70, 68, 62, 55, 50, 46, 40, 36],
    },
    {
      label: 'Billing Accuracy',
      value: '99.8%',
      trend: '+0.6%',
      up: true,
      color: C.fees,
      spark: [88, 90, 91, 92, 93, 95, 96, 97, 98, 99],
    },
    {
      label: 'Cycle Time',
      value: '−31%',
      trend: 'vs prior yr',
      up: true,
      color: C.comp,
      spark: [90, 85, 80, 76, 70, 65, 60, 56, 52, 48],
    },
  ]

  function Spark({ data, color }: { data: number[]; color: string }) {
    const min = Math.min(...data), max = Math.max(...data)
    const W2 = 64, H2 = 22
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * W2
      const y = H2 - ((v - min) / (max - min || 1)) * H2
      return `${x},${y}`
    })
    return (
      <svg width={W2} height={H2} viewBox={`0 0 ${W2} ${H2}`} style={{ overflow: 'visible' }} aria-hidden="true">
        <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" opacity="0.7" />
        <circle cx={pts[pts.length - 1].split(',')[0]} cy={pts[pts.length - 1].split(',')[1]} r="2.5" fill={color} />
      </svg>
    )
  }

  return (
    <div ref={containerRef} style={{ background: C.surface, border: `1px solid ${C.border}`, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: C.subtle }}>
          Revenue Performance
        </span>
        <span style={{ fontSize: 9, color: C.honey, fontWeight: 600 }}>Q3 2024 · LIVE</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {TILES.map((tile, i) => (
          <motion.div
            key={tile.label}
            initial={{ opacity: 0, y: 10 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ background: C.bg, border: `1px solid ${tile.color}28`, padding: '12px 14px', position: 'relative' }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: tile.color, opacity: 0.6 }} />
            <div style={{ fontSize: 9, color: C.subtle, marginBottom: 6, letterSpacing: '0.08em' }}>{tile.label}</div>
            <div style={{ fontSize: 'clamp(1.1rem,2.5vw,1.4rem)', fontWeight: 800, color: C.text, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {tile.value}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: tile.up ? tile.color : C.mandarin }}>
                {tile.trend}
              </span>
              <Spark data={tile.spark} color={tile.color} />
            </div>
          </motion.div>
        ))}
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: C.subtle, letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontWeight: 600, marginTop: 14, marginBottom: 0 }}>
        One trusted view across the revenue lifecycle
      </p>
    </div>
  )
}


/* ─────────────────────────────────────────────────────────────
   REVENUE MANAGEMENT FRAMEWORK
───────────────────────────────────────────────────────────── */
const REVENUE_DOMAINS = [
  {
    id: 'strategy',
    label: 'Strategy',
    short: 'How pricing models, fee structures, and commercial rules are designed with intent.',
  },
  {
    id: 'alignment',
    label: 'Alignment',
    short: 'How incentives, advisor behavior, and firm strategy are connected.',
  },
  {
    id: 'execution',
    label: 'Execution',
    short: 'How pricing and rules become accurate billing and revenue workflows.',
  },
  {
    id: 'transparency',
    label: 'Transparency',
    short: 'How fees, value, and revenue outcomes are explained with confidence.',
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    short: 'How leakage is detected, opportunities surfaced, and drivers understood.',
  },
  {
    id: 'governance',
    label: 'Governance',
    short: 'How exceptions, approvals, contracts, and policy adherence are controlled.',
  },
]

const REVENUE_NUM = REVENUE_DOMAINS.length
const REVENUE_SLICE = 360 / REVENUE_NUM
const REVENUE_CX = 260
const REVENUE_CY = 260
const REVENUE_OUTER_R_BASE = 175
const REVENUE_OUTER_R_ACTIVE = 298
const REVENUE_INNER_R = 62
const REVENUE_GAP_DEG = 2.2
const REVENUE_INTERVAL_MS = 2800
const REVENUE_VB = 520
const REVENUE_VB_PAD = 64

function revenuePolarToXY(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: REVENUE_CX + r * Math.cos(rad), y: REVENUE_CY + r * Math.sin(rad) }
}

function revenueDescribeArc(startDeg: number, endDeg: number, innerR: number, outerR: number) {
  const s1 = revenuePolarToXY(startDeg, outerR)
  const s2 = revenuePolarToXY(endDeg, outerR)
  const s3 = revenuePolarToXY(endDeg, innerR)
  const s4 = revenuePolarToXY(startDeg, innerR)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return [
    `M ${s1.x} ${s1.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${s2.x} ${s2.y}`,
    `L ${s3.x} ${s3.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${s4.x} ${s4.y}`,
    'Z',
  ].join(' ')
}

function revenueWedgeCentroid(midAngleDeg: number, innerR: number, outerR: number) {
  const halfSliceRad = ((REVENUE_SLICE / 2) * Math.PI) / 180
  const r = (2 / 3) * ((outerR ** 3 - innerR ** 3) / (outerR ** 2 - innerR ** 2)) *
    (Math.sin(halfSliceRad) / halfSliceRad)
  return revenuePolarToXY(midAngleDeg, r)
}

function RevenueManagementWheel() {
  const { isMobile, isTablet } = useBreakpoint()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [hovered, setHovered] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const circumference = 2 * Math.PI * (REVENUE_INNER_R - 1)
  const scale = isMobile ? 0.72 : isTablet ? 0.86 : 1
  const activeOuter = REVENUE_OUTER_R_BASE + (REVENUE_OUTER_R_ACTIVE - REVENUE_OUTER_R_BASE) * scale
  const wheelViewBox = `${-REVENUE_VB_PAD} ${-REVENUE_VB_PAD} ${REVENUE_VB + REVENUE_VB_PAD * 2} ${REVENUE_VB + REVENUE_VB_PAD * 2}`

  const startRotation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setActiveIndex((i) => (i === null ? 0 : (i + 1) % REVENUE_NUM))
    }, REVENUE_INTERVAL_MS)
  }

  const stopRotation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  useEffect(() => {
    if (!hovered) startRotation()
    else stopRotation()
    return () => stopRotation()
  }, [hovered])

  function handleWedgeClick(i: number) {
    if (activeIndex === i) {
      setActiveIndex(null)
      startRotation()
    } else {
      setActiveIndex(i)
      stopRotation()
    }
  }

  function handleMouseLeave() {
    setHovered(false)
    startRotation()
  }

  return (
    <div
      style={{ width: '100%', maxWidth: isMobile ? 340 : 560, margin: '0 auto', overflow: 'visible' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <svg
          viewBox={wheelViewBox}
          style={{ width: '100%', overflow: 'visible', display: 'block' }}
          aria-label="Revenue Performance Framework: six interconnected domains"
          role="img"
        >
          <defs>
            <linearGradient id="rpf-sunset-solutions" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FACC22" />
              <stop offset="33%" stopColor="#FB5607" />
              <stop offset="66%" stopColor="#4760FF" />
              <stop offset="100%" stopColor="#0DCCFF" />
            </linearGradient>
          </defs>

          <circle cx={REVENUE_CX} cy={REVENUE_CY} r={REVENUE_OUTER_R_BASE} fill={C.surface} />

          {Array.from({ length: REVENUE_NUM }).map((_, i) => {
            const angle = i * REVENUE_SLICE - REVENUE_SLICE / 2
            const p1 = revenuePolarToXY(angle, REVENUE_INNER_R)
            const p2 = revenuePolarToXY(angle, REVENUE_OUTER_R_BASE + 6)
            return (
              <line key={`sep-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={C.bg} strokeWidth="4" />
            )
          })}

          {REVENUE_DOMAINS.map((d, i) => {
            const baseMid = i * REVENUE_SLICE
            const wStart = baseMid - REVENUE_SLICE / 2 + REVENUE_GAP_DEG
            const wEnd = baseMid + REVENUE_SLICE / 2 - REVENUE_GAP_DEG
            const isActive = activeIndex === i
            const outerR = isActive ? activeOuter : REVENUE_OUTER_R_BASE
            const centroid = revenueWedgeCentroid(baseMid, REVENUE_INNER_R, outerR)
            const foW = isActive ? (isMobile ? 122 : 145) : (isMobile ? 76 : 90)
            const foH = isActive ? (isMobile ? 104 : 120) : 30

            return (
              <g
                key={d.id}
                onClick={() => handleWedgeClick(i)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleWedgeClick(i)}
                tabIndex={0}
                role="button"
                aria-pressed={isActive}
                aria-label={`${d.label}: ${d.short}`}
                style={{ cursor: 'pointer', outline: 'none' }}
              >
                <motion.path
                  d={revenueDescribeArc(wStart, wEnd, REVENUE_INNER_R, outerR)}
                  fill={isActive ? C.azure : 'rgba(180,180,180,0.18)'}
                  animate={{ d: revenueDescribeArc(wStart, wEnd, REVENUE_INNER_R, outerR) }}
                  transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                />

                {isActive && (
                  <>
                    <line
                      x1={revenuePolarToXY(wStart - REVENUE_GAP_DEG, REVENUE_INNER_R).x}
                      y1={revenuePolarToXY(wStart - REVENUE_GAP_DEG, REVENUE_INNER_R).y}
                      x2={revenuePolarToXY(wStart - REVENUE_GAP_DEG, activeOuter + 6).x}
                      y2={revenuePolarToXY(wStart - REVENUE_GAP_DEG, activeOuter + 6).y}
                      stroke={C.bg} strokeWidth="4"
                    />
                    <line
                      x1={revenuePolarToXY(wEnd + REVENUE_GAP_DEG, REVENUE_INNER_R).x}
                      y1={revenuePolarToXY(wEnd + REVENUE_GAP_DEG, REVENUE_INNER_R).y}
                      x2={revenuePolarToXY(wEnd + REVENUE_GAP_DEG, activeOuter + 6).x}
                      y2={revenuePolarToXY(wEnd + REVENUE_GAP_DEG, activeOuter + 6).y}
                      stroke={C.bg} strokeWidth="4"
                    />
                  </>
                )}

                <foreignObject
                  x={centroid.x - foW / 2}
                  y={centroid.y - foH / 2}
                  width={foW}
                  height={foH}
                  style={{ pointerEvents: 'none', overflow: 'visible' }}
                >
                  <div style={{
                    width: `${foW}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: isMobile ? 4 : 6,
                    fontFamily: 'Carlito, sans-serif',
                    textAlign: 'center',
                  }}>
                    <div style={{
                      fontSize: isActive ? (isMobile ? 15 : 20) : (isMobile ? 10 : 13),
                      fontWeight: 700,
                      color: isActive ? 'white' : 'rgba(244,244,244,0.85)',
                      lineHeight: 1.2,
                      whiteSpace: isMobile ? 'normal' : 'nowrap',
                    }}>
                      {d.label}
                    </div>

                    {isActive && (
                      <div style={{
                        fontSize: isMobile ? 11 : 15,
                        fontWeight: 400,
                        color: 'rgba(255,255,255,0.85)',
                        lineHeight: 1.35,
                      }}>
                        {d.short}
                      </div>
                    )}
                  </div>
                </foreignObject>
              </g>
            )
          })}

          <circle cx={REVENUE_CX} cy={REVENUE_CY} r={REVENUE_INNER_R + 4} fill={C.bg} />
          <circle cx={REVENUE_CX} cy={REVENUE_CY} r={REVENUE_INNER_R} fill={C.bg} />
          <circle cx={REVENUE_CX} cy={REVENUE_CY} r={REVENUE_INNER_R} fill="none" stroke={C.azure} strokeWidth="1" strokeOpacity="0.35" />

          {!hovered && (
            <motion.circle
              key={`prog-${activeIndex}`}
              cx={REVENUE_CX} cy={REVENUE_CY}
              r={REVENUE_INNER_R - 1}
              fill="none"
              stroke="url(#rpf-sunset-solutions)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              style={{ transformOrigin: `${REVENUE_CX}px ${REVENUE_CY}px`, transform: 'rotate(-90deg)' }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: REVENUE_INTERVAL_MS / 1000, ease: 'linear' }}
            />
          )}

          <text x={REVENUE_CX} y={REVENUE_CY - 16} textAnchor="middle" fill={C.azure} fontSize={isMobile ? '9' : '11'} fontWeight="700" fontFamily="Carlito, sans-serif" letterSpacing="0.13em" style={{ pointerEvents: 'none' }}>
            REVENUE
          </text>
          <text x={REVENUE_CX} y={REVENUE_CY - 1} textAnchor="middle" fill={C.azure} fontSize={isMobile ? '9' : '11'} fontWeight="700" fontFamily="Carlito, sans-serif" letterSpacing="0.08em" style={{ pointerEvents: 'none' }}>
            PERFORMANCE
          </text>
          <text x={REVENUE_CX} y={REVENUE_CY + 15} textAnchor="middle" fill={C.azure} fontSize={isMobile ? '9' : '11'} fontWeight="700" fontFamily="Carlito, sans-serif" letterSpacing="0.08em" style={{ pointerEvents: 'none' }}>
            FRAMEWORK
          </text>
        </svg>
      </motion.div>
    </div>
  )
}

function MobileFrameworkCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const xRef = useRef(0)
  const rafRef = useRef<number>(0)
  const pausedRef = useRef(false)
  const draggingRef = useRef(false)
  const lastClientXRef = useRef(0)
  const SPEED = 0.45
  const items = [...REVENUE_DOMAINS, ...REVENUE_DOMAINS, ...REVENUE_DOMAINS]

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const getSetWidth = () => track.scrollWidth / 3
    const normalize = () => {
      const setW = getSetWidth()
      if (!setW) return
      if (xRef.current <= -setW) xRef.current += setW
      if (xRef.current > 0) xRef.current -= setW
    }

    const tick = () => {
      if (!pausedRef.current && !draggingRef.current) {
        xRef.current -= SPEED
        normalize()
        track.style.transform = `translateX(${xRef.current}px)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true
    pausedRef.current = true
    lastClientXRef.current = e.clientX
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current
    if (!draggingRef.current || !track) return
    const dx = e.clientX - lastClientXRef.current
    lastClientXRef.current = e.clientX
    xRef.current += dx
    const setW = track.scrollWidth / 3
    if (setW) {
      if (xRef.current <= -setW) xRef.current += setW
      if (xRef.current > 0) xRef.current -= setW
    }
    track.style.transform = `translateX(${xRef.current}px)`
  }

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false
    pausedRef.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: '100%', overflow: 'hidden' }}
    >
      <h3 style={{ color: C.text, fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.15, margin: '0 0 18px' }}>
        Revenue performance framework
      </h3>
      <div
        style={{ position: 'relative', overflow: 'hidden', touchAction: 'pan-y', cursor: 'grab' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onMouseEnter={() => { pausedRef.current = true }}
        onMouseLeave={() => { if (!draggingRef.current) pausedRef.current = false }}
      >
        <div ref={trackRef} style={{ display: 'flex', gap: 12, willChange: 'transform' }}>
          {items.map((domain, i) => (
            <div
              key={`${domain.id}-${i}`}
              style={{
                width: 'min(78vw, 300px)',
                minHeight: 190,
                flexShrink: 0,
                padding: '22px 20px',
                border: '1px solid rgba(59,132,255,0.28)',
                background: 'linear-gradient(145deg, rgba(59,132,255,0.18), rgba(26,20,16,0.92))',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(59,132,255,0.45)', color: C.azure, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, marginBottom: 18 }}>
                  {String((i % REVENUE_NUM) + 1).padStart(2, '0')}
                </div>
                <div style={{ color: C.text, fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.15, marginBottom: 10 }}>
                  {domain.label}
                </div>
                <div style={{ color: C.body, fontSize: '0.98rem', lineHeight: 1.45 }}>
                  {domain.short}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', inset: '0 auto 0 0', width: 40, pointerEvents: 'none', background: `linear-gradient(to right, ${C.bg}, transparent)`, zIndex: 1 }} />
        <div style={{ position: 'absolute', inset: '0 0 0 auto', width: 40, pointerEvents: 'none', background: `linear-gradient(to left, ${C.bg}, transparent)`, zIndex: 1 }} />
      </div>
    </motion.div>
  )
}

function RevenueManagementRow() {
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '56px 0' : '90px 0'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const cols = isTablet ? '1fr' : '1fr 1fr'
  const gap = isMobile ? '24px' : isTablet ? '32px' : '80px'

  return (
    <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Revenue Performance Management">
      <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '15%', width: 700, height: 300, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.06) 0%, transparent 60%)' }} />
      <div aria-hidden="true" style={{ position: 'absolute', top: '0%', right: '10%', width: 450, height: 280, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.05) 0%, transparent 60%)' }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
        <div style={{ display: 'grid', gridTemplateColumns: cols, gap, alignItems: 'center' }}>
          <div>
            <Reveal>
              <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.12, margin: 0 }}>
                The Revenue Lifecycle, Managed As One System
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75, maxWidth: 560 }}>
                Revenue performance depends on more than billing, compensation, or analytics in isolation. PureFacts connects the full revenue lifecycle into one operating system, helping firms design better commercial rules, execute them consistently, measure outcomes clearly, and improve decisions across advisors, operations, finance, and leadership.
              </p>
            </Reveal>
          </div>

          <Reveal delay={120}>
            {isMobile ? <MobileFrameworkCarousel /> : <RevenueManagementWheel />}
          </Reveal>
        </div>
      </div>
    </section>
  )
}


/* ─────────────────────────────────────────────────────────────
   REVENUE BOOK OF RECORD FOUNDATION ROW
───────────────────────────────────────────────────────────── */
const FOUNDATION_LEFT_NODES = [
  { label: 'Custodians', sub: 'Holdings & transactions' },
  { label: 'Portfolio Management', sub: 'AUM, accounts, positions' },
  { label: 'CRM', sub: 'Client & advisor data' },
  { label: 'Trading Platform', sub: 'Order & execution data' },
]
const FOUNDATION_RIGHT_NODES = [
  { label: 'Accounting Systems', sub: 'GL, reconciliation' },
  { label: 'Billing Systems', sub: 'Invoicing & collections' },
  { label: 'Compensation Systems', sub: 'Payout structures' },
  { label: 'Customer Data Lakes', sub: 'Enterprise data sources' },
]

function FoundationVisual({ visible }: { visible: boolean }) {
  const { isMobile } = useBreakpoint()
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 600, h: 420 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(e => {
      setSize({ w: e[0].contentRect.width, h: e[0].contentRect.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { w } = size
  const NODE_W = isMobile ? 116 : 170
  const NODE_H = isMobile ? 38 : 44
  const LEFT_X = isMobile ? 4 : 30
  const RIGHT_X = w - (isMobile ? 4 : 30) - NODE_W
  const NODE_TOPS = isMobile ? [58, 116, 174, 232] : [90, 160, 230, 300]
  const HUB_R = isMobile ? 40 : 65
  const cx = w / 2
  const cy = (NODE_TOPS[0] + NODE_TOPS[3] + NODE_H) / 2

  const leftConns = NODE_TOPS.map(top => ({ fromX: LEFT_X + NODE_W, fromY: top + NODE_H / 2 }))
  const rightConns = NODE_TOPS.map(top => ({ fromX: RIGHT_X, fromY: top + NODE_H / 2 }))

  function hubEntry(fromX: number, fromY: number) {
    const dx = cx - fromX
    const dy = cy - fromY
    const dist = Math.sqrt(dx * dx + dy * dy)
    return {
      x: cx - (dx / dist) * HUB_R,
      y: cy - (dy / dist) * HUB_R,
      angle: Math.atan2(fromY - cy, fromX - cx),
    }
  }

  function nodePath(fromX: number, fromY: number) {
    const entry = hubEntry(fromX, fromY)
    const midX = (fromX + cx) / 2
    return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${entry.y}, ${entry.x} ${entry.y}`
  }

  const circleCircumference = 2 * Math.PI * HUB_R
  const arcLen = circleCircumference * 0.18
  const arcSeeds = [...leftConns, ...rightConns].map((conn, i) => {
    const entry = hubEntry(conn.fromX, conn.fromY)
    return { startAngleDeg: (entry.angle * 180 / Math.PI + 360) % 360, delay: 0.6 + i * 0.18 }
  })

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', minHeight: isMobile ? 310 : 420, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        left: cx - HUB_R * 2.2,
        top: cy - HUB_R * 2.2,
        width: HUB_R * 4.4,
        height: HUB_R * 4.4,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,132,255,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {leftConns.map((conn, i) => (
          <motion.path key={`l${i}`} d={nodePath(conn.fromX, conn.fromY)} fill="none" stroke={C.azure} strokeWidth="1" strokeOpacity="0.3" initial={{ pathLength: 0, opacity: 0 }} animate={visible ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }} transition={{ duration: 0.6, delay: 0.4 + i * 0.1, ease: 'easeOut' }} />
        ))}
        {rightConns.map((conn, i) => (
          <motion.path key={`r${i}`} d={nodePath(conn.fromX, conn.fromY)} fill="none" stroke={C.azure} strokeWidth="1" strokeOpacity="0.3" initial={{ pathLength: 0, opacity: 0 }} animate={visible ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }} transition={{ duration: 0.6, delay: 0.5 + i * 0.1, ease: 'easeOut' }} />
        ))}
        {visible && leftConns.map((conn, i) => (
          <motion.circle key={`lp${i}`} r="2.5" fill={C.azure} opacity="0.8">
            <animateMotion dur={`${1.6 + i * 0.25}s`} repeatCount="indefinite" begin={`${i * 0.45}s`} path={nodePath(conn.fromX, conn.fromY)} />
          </motion.circle>
        ))}
        {visible && rightConns.map((conn, i) => (
          <motion.circle key={`rp${i}`} r="2.5" fill={C.azure} opacity="0.8">
            <animateMotion dur={`${1.6 + i * 0.25}s`} repeatCount="indefinite" begin={`${i * 0.45 + 0.3}s`} path={nodePath(conn.fromX, conn.fromY)} />
          </motion.circle>
        ))}
        {visible && <circle cx={cx} cy={cy} r={HUB_R} fill="none" stroke="rgba(59,132,255,0.18)" strokeWidth="1.5" />}
        {arcSeeds.map((arc, i) => (
          <motion.circle
            key={`arc${i}`}
            cx={cx} cy={cy} r={HUB_R}
            fill="none" stroke={C.azure} strokeWidth="2"
            strokeDasharray={`${arcLen} ${circleCircumference - arcLen}`}
            strokeLinecap="round"
            style={{ rotate: arc.startAngleDeg, transformOrigin: `${cx}px ${cy}px` }}
            initial={{ opacity: 0, strokeDashoffset: 0 }}
            animate={visible ? { opacity: [0, 0.75, 0.55, 0], strokeDashoffset: [0, -circleCircumference * 0.35] } : { opacity: 0 }}
            transition={{ duration: 1.4, delay: arc.delay, ease: 'easeOut', opacity: { times: [0, 0.08, 0.6, 1] } }}
          />
        ))}
      </svg>

      {FOUNDATION_LEFT_NODES.map((node, i) => (
        <motion.div key={node.label} initial={{ opacity: 0, x: -16 }} animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }} transition={{ duration: 0.45, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }} style={{
          position: 'absolute', left: LEFT_X, top: NODE_TOPS[i], width: NODE_W, height: NODE_H,
          background: C.surface, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: isMobile ? 10.5 : 13, fontWeight: 600, color: C.text, textAlign: 'center', padding: '0 8px', lineHeight: 1.15 }}>{node.label}</span>
        </motion.div>
      ))}
      {FOUNDATION_RIGHT_NODES.map((node, i) => (
        <motion.div key={node.label} initial={{ opacity: 0, x: 16 }} animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: 16 }} transition={{ duration: 0.45, delay: 0.12 + i * 0.09, ease: [0.16, 1, 0.3, 1] }} style={{
          position: 'absolute', left: RIGHT_X, top: NODE_TOPS[i], width: NODE_W, height: NODE_H,
          background: C.surface, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: isMobile ? 10.5 : 13, fontWeight: 600, color: C.text, textAlign: 'center', padding: '0 8px', lineHeight: 1.15 }}>{node.label}</span>
        </motion.div>
      ))}

      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={visible ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} style={{
        position: 'absolute', left: cx - HUB_R, top: cy - HUB_R, width: HUB_R * 2, height: HUB_R * 2,
        borderRadius: '50%', border: '1.5px solid rgba(59,132,255,0.45)', background: 'radial-gradient(circle at 40% 35%, rgba(59,132,255,0.18), rgba(59,132,255,0.05))', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 5,
      }}>
        <span style={{ fontSize: isMobile ? 10 : 13, fontWeight: 600, color: C.text, lineHeight: 1.35, textAlign: 'center', padding: '0 8px' }}>
          Revenue Book<br />of Record
        </span>
      </motion.div>
    </div>
  )
}

function RevenueBookOfRecordRow() {
  const { isMobile, isTablet } = useBreakpoint()
  const { ref, visible } = useReveal(0.12)
  const cols = isTablet ? '1fr' : 'repeat(2, minmax(0, 1fr))'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const sectionPad = isMobile ? '56px 0' : '90px 0'
  const gap = isMobile ? '24px' : isTablet ? '32px' : '80px'

  return (
    <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Revenue Book of Record foundation">
      <div aria-hidden="true" style={{ position: 'absolute', top: '5%', left: '0%', width: 550, height: 450, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.06) 0%, transparent 60%)' }} />
      <div aria-hidden="true" style={{ position: 'absolute', bottom: '5%', right: '5%', width: 600, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.04) 0%, transparent 60%)' }} />
      <div ref={ref} style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
        <div style={{ display: 'grid', gridTemplateColumns: cols, gap, alignItems: 'center' }}>
          <div>
            <Reveal>
              <Eyebrow color={C.azure}>The Foundation</Eyebrow>
              <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                Revenue Data, Unified Into One Source Of Truth
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                The Revenue Book of Record consolidates every client, account, contract, and pricing rule across the firm. Every downstream calculation, billing run, payout, and performance view flows from one authoritative foundation, reducing reconciliation work and giving teams one trusted version of revenue truth.
              </p>
            </Reveal>
            <Reveal delay={130}>
              <ul style={{ margin: '22px 0 0', padding: 0, listStyle: 'none' }}>
                {['Custodians, CRM, and portfolio data connected', 'Contracts and pricing logic centralized', 'Audit-ready at every stage'].map((pt) => (
                  <li key={pt} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 0' }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.azure, flexShrink: 0, marginTop: 9 }} />
                    <span style={{ fontSize: 14.5, color: C.body, lineHeight: 1.6 }}>{pt}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={180}>
              <div style={{ marginTop: 28 }}>
                <Link href="/platform/revenue-book-of-record" className="btn-primary">Explore Revenue Book of Record</Link>
              </div>
            </Reveal>
          </div>
          {!isMobile && (
          <Reveal delay={120}>
            <div style={{ minHeight: isMobile ? 310 : 420, width: '100%', overflow: 'hidden' }}>
              <FoundationVisual visible={visible} />
            </div>
          </Reveal>)}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   STAT COUNTER
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
        const tick = () => {
          const p = Math.min((Date.now() - start) / dur, 1)
          const eased = 1 - Math.pow(1 - p, 3)
          setCount(Math.round(eased * value))
          if (p < 1) requestAnimationFrame(tick)
        }
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

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
export default function SolutionsClient() {
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '56px 0' : '90px 0'
  const heroPad = isMobile ? '48px 0 48px' : '90px 0 72px'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const twoCols = isTablet ? '1fr' : 'repeat(2, minmax(0, 1fr))'
  const heroGap = isMobile ? '24px' : isTablet ? '32px' : '80px'
  const sectionGap = isMobile ? '24px' : isTablet ? '32px' : '80px'
  const connectedCols = isMobile ? '1fr' : '1fr 1fr'

  const heroGraphic = (
    <motion.div initial={{ opacity: 0, x: isMobile ? 0 : 24, y: isMobile ? 14 : 0 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ minHeight: isMobile ? 260 : 380, display: 'flex', alignItems: 'center' }}>
      <PlatformDiagram />
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

        .sl-bullet-row { display: flex; gap: 14px; align-items: flex-start; padding: 14px 0; border-bottom: 1px solid ${C.border}; }
        .sl-bullet-row:last-child { border-bottom: none; }
        .sl-connected-card {
          background: ${C.surface}; border: 1px solid ${C.border};
          padding: 28px 24px; position: relative;
          transition: border-color 0.3s ease, transform 0.3s ease;
        }
        .sl-connected-card:hover { border-color: rgba(255,255,255,0.14); transform: translateY(-3px); }
        .sl-cta-row { display: flex; gap: 18px; align-items: flex-start; padding: 18px 0; border-bottom: 1px solid ${C.border}; }
        .sl-cta-row:last-child { border-bottom: none; }

        .btn-fees, .btn-comp, .btn-honey {
          position: relative; display: inline-flex; align-items: center; justify-content: center;
          padding: 0.45rem 1rem; font-size: 0.875rem; font-weight: 600;
          color: #f4f4f4; text-decoration: none; border-radius: 0;
          background: transparent; border: 2px solid transparent;
          transition: color 0.2s, box-shadow 0.2s; z-index: 0;
        }
        /* Gradient border layer — fades in on hover */
        .btn-fees::before, .btn-comp::before, .btn-honey::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg,#FACC22,#FB5607,#4760FF,#0DCCFF);
          z-index: -1; opacity: 0; transition: opacity 0.2s;
        }
        .btn-fees:hover::before, .btn-comp:hover::before, .btn-honey:hover::before { opacity: 1; }
        /* Inner fill — inset 2px so box-shadow rim stays visible */
        .btn-fees::after, .btn-comp::after, .btn-honey::after {
          content: ''; position: absolute; inset: 2px;
          background: ${C.bg}; z-index: -1;
        }
        /* Resting colour via box-shadow — no border removal needed, no flicker */
        .btn-fees  { box-shadow: inset 0 0 0 2px ${C.fees}; }
        .btn-comp  { box-shadow: inset 0 0 0 2px ${C.comp}; }
        .btn-honey { box-shadow: inset 0 0 0 2px ${C.honey}; }
        .btn-fees:hover, .btn-comp:hover, .btn-honey:hover { box-shadow: none; }
      `}</style>

      {/* ══════════════════════════════════
          1. HERO
      ══════════════════════════════════ */}
      <section
        style={{ background: C.bg, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: heroPad }}
        aria-label="Solutions hero"
      >
        <div aria-hidden="true" style={{ position: 'absolute', top: '5%', left: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.07) 0%, transparent 62%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '5%', right: '5%', width: 700, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(237,101,208,0.05) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', top: '30%', right: '5%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,0,110,0.04) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, pointerEvents: 'none', background: `linear-gradient(to bottom, transparent, ${C.bg})` }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad, width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: heroGap, alignItems: 'center' }}>

            {isMobile && heroGraphic}

            <div style={{ maxWidth: 560 }}>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                <Eyebrow color={C.azure}>Solutions</Eyebrow>
              </motion.div>
              <h1 style={{ fontSize: 'clamp(2.25rem,5vw,4rem)', fontWeight: 700, color: C.text, lineHeight: 1.05, letterSpacing: '-0.028em', margin: 0 }}>
                <motion.span style={{ display: 'block' }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                  Solutions Built To
                </motion.span>
                <motion.span style={{ display: 'block' }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}>
                  <GradientText>Maximize Revenue Potential</GradientText>
                </motion.span>
              </h1>
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.75 }}
                style={{ marginTop: 24, fontSize: 18, color: C.body, lineHeight: 1.75, maxWidth: 500 }}>
                Revenue problems rarely live in one place. PureFacts connects fee billing,
                advisor compensation, and practice management into a single revenue lifecycle so
                firms can reduce friction, protect margin, and unlock more value from every
                client relationship.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.95 }} style={{ marginTop: 36 }}>
                <Link href="/contact" className="btn-primary">Get in contact</Link>
              </motion.div>
            </div>

            {/* Platform diagram */}
            {!isMobile && heroGraphic}

          </div>
        </div>
      </section>

      <RevenueManagementRow />

      {/* ══════════════════════════════════
          3. FEE BILLING — two column
          Left: headline + copy + button
          Right: icon list
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Fee Billing solution">
        <div aria-hidden="true" style={{ position: 'absolute', top: '10%', right: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(237,101,208,0.06) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '0%', left: '5%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.04) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'start' }}>

            {/* Left: headline + copy + button */}
            <div>
              <Reveal>
                <Eyebrow color={C.fees}>Fee Billing</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                  Billing Is Not Just A Back Office Concern.{' '}
                  <span style={{ color: C.fees }}>It Is Revenue Control.</span>
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                  As firms grow, fee structures get more complex, exceptions accumulate, and
                  legacy workflows become harder to trust. Small inconsistencies become manual
                  effort, billing disputes, compliance exposure, and revenue that never makes
                  it through the system.
                </p>
              </Reveal>
              <Reveal delay={160}>
                <div style={{ marginTop: 28 }}>
                  <Link href="/why-purefacts/fee-billing" className="btn-fees">Explore Fee Billing</Link>
                </div>
              </Reveal>
            </div>

            {/* Right: icon list */}
            <div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {[
                  { label: 'Protect Yield',             color: C.fees, icon: 'fa-percent',          detail: 'Centralized fee logic closes the gaps where missed rules and inconsistent exceptions silently erode revenue.' },
                  { label: 'Accelerate Billing Cycles', color: C.fees, icon: 'fa-bolt',             detail: 'Automation-first workflows mean fewer manual steps, fewer re-runs, and no more end-of-cycle scrambles.' },
                  { label: 'Audit-Ready By Default',    color: C.fees, icon: 'fa-clipboard-check',  detail: 'Every calculation and adjustment is traceable: so billing disputes become reviews, not reconstructions.' },
                ].map((item, i) => (
                  <Reveal key={item.label} delay={i * 70}>
                    <li className="sl-bullet-row">
                      <div style={{ width: 36, height: 36, flexShrink: 0, background: 'none', display: 'flex', alignItems: 'top', justifyContent: 'top' }}>
                        <i className={`fa-solid ${item.icon}`} style={{ color: item.color, fontSize: 18 }} aria-hidden="true" />
                      </div>
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
        </div>
      </section>

      {/* ══════════════════════════════════
          4. COMPENSATION — two column
          Left: icon list
          Right: headline + copy + button
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Advisor Compensation solution">
        <div aria-hidden="true" style={{ position: 'absolute', top: '10%', left: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,0,110,0.06) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '0%', right: '5%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.04) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'start' }}>

            {/* Left: icon list */}
            <div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {[
                  { label: 'Reduce Spillage',       color: C.comp, icon: 'fa-faucet-drip',         detail: 'Govern pricing exceptions before they quietly become permanent, protecting yield at the point where decisions are made.' },
                  { label: 'Build Advisor Trust',   color: C.comp, icon: 'fa-handshake',           detail: 'Transparent, accurate payouts mean advisors stop validating numbers and start focusing on clients.' },
                  { label: 'Align Pay With Growth', color: C.comp, icon: 'fa-arrow-up-right-dots', detail: 'Compensation structures that reward the right behaviors create a more profitable, more retainable advisor force.' },
                ].map((item, i) => (
                  <Reveal key={item.label} delay={i * 70}>
                    <li className="sl-bullet-row">
                      <div style={{ width: 36, height: 36, flexShrink: 0, background: 'none', display: 'flex', alignItems: 'top', justifyContent: 'top' }}>
                        <i className={`fa-solid ${item.icon}`} style={{ color: item.color, fontSize: 18 }} aria-hidden="true" />
                      </div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>{item.label}</p>
                        <p style={{ marginTop: 4, fontSize: 15, color: C.body, lineHeight: 1.7, margin: '4px 0 0' }}>{item.detail}</p>
                      </div>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>

            {/* Right: headline + copy + button */}
            <div>
              <Reveal>
                <Eyebrow color={C.comp}>Compensation and Incentives</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                  Compensation Is One Of The Most Important{' '}
                  <span style={{ color: C.comp }}>Levers In The Revenue Equation.</span>
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                  When compensation strategy is unclear or pricing discipline is weak, firms
                  give away value before it ever reaches the invoice. Habitual discounting and
                  temporary concessions that become permanent create significant spillage over
                  time, often without leadership seeing it until it is already embedded in
                  the cost structure.
                </p>
              </Reveal>
              <Reveal delay={160}>
                <div style={{ marginTop: 28 }}>
                  <Link href="/why-purefacts/compensation-and-incentives" className="btn-comp">Explore Advisor Compensation</Link>
                </div>
              </Reveal>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          5. INSIGHTS & ANALYTICS — two column
          Left: headline + copy + button
          Right: icon list
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Practice Management solution">
        <div aria-hidden="true" style={{ position: 'absolute', top: '10%', right: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.06) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '0%', left: '5%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.04) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'start' }}>

            {/* Left: headline + copy + button */}
            <div>
              <Reveal>
                <Eyebrow color={C.honey}>Practice Management</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                  Better Advisor Decisions Can{' '}
                  <span style={{ color: C.honey }}>Double Organic Growth.</span>
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                  Practice management gives advisors the insight to make smarter, more profitable decisions at the point of action. By connecting pricing, client value, advisor behavior, and firm strategy, PureFacts helps firms empower advisors to grow their books, strengthen client relationships, and improve profitability for themselves and the enterprise.
                </p>
              </Reveal>
              <Reveal delay={160}>
                <div style={{ marginTop: 28 }}>
                  <Link href="/platform/practice-management" className="btn-honey">Explore Practice Management</Link>
                </div>
              </Reveal>
            </div>

            {/* Right: icon list */}
            <div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {[
                  { label: 'Reduce Excessive Discounting', color: C.honey, icon: 'fa-tags', detail: 'Equip advisors with the insight to price confidently, protect margin, and avoid unnecessary fee concessions.' },
                  { label: 'Benchmark Performance', color: C.honey, icon: 'fa-chart-simple', detail: 'Show advisors how their clients, books, and decisions compare against peers and firm-defined growth expectations.' },
                  { label: 'Link Value to Pricing', color: C.honey, icon: 'fa-link', detail: 'Help advisors connect the value they deliver to the fees they charge, improving profitability for themselves and the firm.' },
                ].map((item, i) => (
                  <Reveal key={item.label} delay={i * 70}>
                    <li className="sl-bullet-row">
                      <div style={{ width: 36, height: 36, flexShrink: 0, background: 'none', display: 'flex', alignItems: 'top', justifyContent: 'top' }}>
                        <i className={`fa-solid ${item.icon}`} style={{ color: item.color, fontSize: 18 }} aria-hidden="true" />
                      </div>
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
        </div>
      </section>

      <RevenueBookOfRecordRow />

      {/* ══════════════════════════════════
          6. WHY CONNECTED SOLUTIONS
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Why connected solutions matter">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '5%', right: '5%', width: 500, height: 350, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.04) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'start' }}>

            <div>
              <Reveal>
                <Eyebrow color={C.azure}>The PureFacts Approach</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                  Why Connected Solutions Matter for Enterprise Growth
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
                  <p style={{ fontSize: 16, color: C.body, lineHeight: 1.75, margin: 0 }}>
                    Billing teams solve for invoices. Compensation teams solve for payouts.
                    Leaders piece together reports after the fact. The result is more work,
                    weaker visibility, and missed opportunities across the system.
                  </p>
                  <p style={{ fontSize: 16, color: C.body, lineHeight: 1.75, margin: 0 }}>
                    PureFacts brings those moving parts together: connecting workflows,
                    controls, and reporting around revenue so firms can reduce friction,
                    improve trustworthiness, and manage growth with more confidence.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={120}>
                <div style={{ marginTop: 28 }}>
                  <Link href="/platform" className="btn-primary">Explore the Platform</Link>
                </div>
              </Reveal>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: connectedCols, gap: 16 }}>
              {[
                { icon: 'fa-link',           color: C.azure,    title: 'Connected Data',    body: 'Billing, compensation, and reporting draw from the same governed source so every stakeholder works from numbers they can rely on.' },
                { icon: 'fa-sliders',        color: C.fees,     title: 'Built-In Controls', body: 'Exception governance, approval workflows, and audit trails are embedded into the process, not bolted on after the fact.' },
                { icon: 'fa-arrow-trend-up', color: C.honey,    title: 'Scalable Growth',   body: 'Add clients, products, and complexity without proportionally adding operational burden or compliance risk.' },
                { icon: 'fa-eye',            color: C.comp,     title: 'Full Visibility',   body: 'From pricing decisions to payout outcomes, every part of the revenue lifecycle is visible and measurable.' },
              ].map((card, i) => (
                <Reveal key={card.title} delay={i * 80} style={{ display: 'flex' }}>
                  <div className="sl-connected-card" style={{ flex: 1 }}>
                    <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                        <i className={`fa-solid ${card.icon}`} style={{ color: card.color, fontSize: 15 }} aria-hidden="true" />
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>{card.title}</p>
                    <p style={{ fontSize: 14, color: C.body, lineHeight: 1.7, margin: 0 }}>{card.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          7. FINAL CTA
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Call to action">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 1000, height: 600, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.07) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '0%', left: '5%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(237,101,208,0.05) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', top: '20%', right: '0%', width: 400, height: 350, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.04) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'center' }}>
            <div>
              {[
                { icon: 'fa-file-invoice-dollar',  color: C.fees,  title: 'Protect Margin Through Billing', desc: 'Centralized fee logic and audit-ready workflows close the gaps where missed rules and inconsistent exceptions silently erode revenue.' },
                { icon: 'fa-hand-holding-dollar',   color: C.comp,  title: 'Reduce Spillage at the Source',  desc: 'Govern pricing exceptions and compensation structures before habitual discounting and temporary concessions become permanently embedded in your cost base.' },
                { icon: 'fa-magnifying-glass-chart',color: C.honey, title: 'Operate With Full Visibility',   desc: 'Replace fragmented reports with a single trusted view of revenue performance across billing, compensation, and operations.' },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 70}>
                  <div className="sl-cta-row">
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
                Improve Performance.{' '}
                <GradientText>Operate With Confidence.</GradientText>
              </h2>
              <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                From fee billing to advisor compensation to trusted reporting,
                PureFacts helps firms strengthen the full revenue lifecycle so every
                part of the business works from the same reliable foundation.
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