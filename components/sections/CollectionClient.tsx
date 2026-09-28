'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
  sunset:  'linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%)',
} as const

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ background: C.sunset, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
      {children}
    </span>
  )
}

function Eyebrow({ children, color = C.mandarin }: { children: React.ReactNode; color?: string }) {
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
   HERO LEAKAGE BAR CHART
───────────────────────────────────────────────────────────── */
function HeroLeakageChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [barsIn, setBarsIn] = useState([false, false, false, false])

  useEffect(() => {
    const el = containerRef.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const delays = [0, 220, 440, 660]
    delays.forEach((d, i) => {
      setTimeout(() => {
        setBarsIn(prev => { const n = [...prev]; n[i] = true; return n })
      }, d)
    })
  }, [visible])

  const { isMobile, isTablet } = useBreakpoint()

  const BARS = [
    { label: 'Potential', pct: 0.92, color: C.mandarin },
    { label: 'Priced',    pct: 0.78, color: C.mandarin },
    { label: 'Billed',    pct: 0.61, color: C.mandarin },
    { label: 'Collected', pct: 0.45, color: C.azure },
  ]

  return (
    <div ref={containerRef} style={{ padding: isMobile ? '12px 0 4px' : isTablet ? '20px 8px 12px' : '28px 24px 24px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: isMobile ? 10 : 20, height: isMobile ? 180 : 220, justifyContent: 'space-around', paddingTop: isMobile ? 18 : 32 }}>
        {BARS.map((bar, i) => (
          <div key={bar.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, height: '100%', justifyContent: 'flex-end', minWidth: 0 }}>
            <div style={{ width: isMobile ? '62%' : '52%', position: 'relative', height: `${bar.pct * 100}%`, overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: barsIn[i] ? '100%' : '0%',
                background: bar.color,
                opacity: i === 3 ? 0.55 : 0.45,
                transition: 'height 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
              }} />
            </div>
            <span style={{
              fontSize: isMobile ? 10 : 11, fontWeight: 600, color: i === 3 ? C.azure : C.subtle,
              letterSpacing: '0.06em', textAlign: 'center',
              opacity: barsIn[i] ? 1 : 0,
              transition: 'opacity 0.4s ease 0.3s',
            }}>{bar.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   SCENARIO CAROUSEL
───────────────────────────────────────────────────────────── */
const SCENARIOS = [
  { icon: 'fa-house-crack',       scenario: 'Failed Householding',              impact: 'Tiered pricing calculated against an incomplete household leads to incorrect fees, compliance risk, or pure underbilling.' },
  { icon: 'fa-file-circle-xmark', scenario: 'Un-Actioned Contract Terms',       impact: 'Custom clauses and negotiated exceptions never make it into live billing. The firm earns the revenue on paper but fails to collect it.' },
  { icon: 'fa-ghost',             scenario: 'Stale Pricing and Orphaned Assets', impact: 'New assets and mid-cycle deposits sit outside billing logic, quietly eroding yield over time without triggering any alert.' },
  { icon: 'fa-fire-extinguisher', scenario: 'Quarter-End Scramble',             impact: 'Highly paid finance and operations teams spend critical weeks reconciling files instead of managing the business with confidence.' },
]

const CAROUSEL_DURATION = 3400

function ScenarioCarousel() {
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '56px 0' : '90px 0'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const gridCols = isTablet ? '1fr' : '1.04fr 1.55fr'
  const gridGap = isMobile ? '24px' : isTablet ? '32px' : '40px'
  const { ref: sectionRef, visible: sectionVisible } = useReveal(0.05)
  const N = SCENARIOS.length
  const [active, setActive] = useState(0)
  const [fillPct, setFillPct] = useState(0)
  const [paused, setPaused] = useState(false)
  const rafRef = useRef<number>(0)
  const startRef = useRef<number>(Date.now())
  const dragRef = useRef({ down: false, startX: 0, moved: false })

  const prev = useCallback(() => { setActive(a => a - 1); setFillPct(0); startRef.current = Date.now() }, [])
  const next = useCallback(() => { setActive(a => a + 1); setFillPct(0); startRef.current = Date.now() }, [])

  useEffect(() => {
    if (paused) { cancelAnimationFrame(rafRef.current); return }
    startRef.current = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startRef.current
      const pct = Math.min(100, (elapsed / CAROUSEL_DURATION) * 100)
      setFillPct(pct)
      if (elapsed >= CAROUSEL_DURATION) {
        setActive(a => a + 1)
        setFillPct(0)
        startRef.current = Date.now()
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [paused, active])

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { down: true, startX: e.clientX, moved: false }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    setPaused(true)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.down) return
    if (Math.abs(e.clientX - dragRef.current.startX) > 8) dragRef.current.moved = true
  }
  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current.down) return
    const dx = e.clientX - dragRef.current.startX
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev()
    dragRef.current.down = false
    setFillPct(0)
    startRef.current = Date.now()
    setPaused(false)
  }

  const cardWidth = 340
  const cardGap = 20
  const WINDOW = 4
  const cardSlots = Array.from({ length: WINDOW * 2 + 1 }, (_, k) => k - WINDOW)
  const step = cardWidth + cardGap

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLDivElement>}
      style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }}
      aria-label="What collection failure looks like inside a firm"
    >
      <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(251,86,7,0.05) 0%, transparent 60%)' }} />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: gridGap, alignItems: 'center' }}>
          <div style={{ opacity: sectionVisible ? 1 : 0, transform: sectionVisible ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
            <Eyebrow color={C.mandarin}>Industry Challenges</Eyebrow>
            <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.1, margin: '0 0 20px' }}>
              What{' '}<span style={{ color: C.mandarin }}>Collection Failure</span>{' '}Looks Like Inside A Firm
            </h2>
            <p style={{ fontSize: '0.9375rem', color: C.body, lineHeight: 1.75, maxWidth: 340, marginBottom: 40 }}>
              Most firms do not lose margin because the market moved against them.
              They lose it because their revenue operations cannot consistently collect
              what the firm already earned.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[{ label: '←', fn: prev }, { label: '→', fn: next }].map(({ label, fn }) => (
                <button key={label} onClick={() => { fn(); setPaused(true); setTimeout(() => setPaused(false), 4000) }}
                  style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: `1px solid ${C.border}`, color: C.body, fontSize: 16, cursor: 'pointer', transition: 'border-color 0.2s, color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.mandarin; (e.currentTarget as HTMLElement).style.color = C.mandarin }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.body }}
                  aria-label={label === '←' ? 'Previous scenario' : 'Next scenario'}
                >{label}</button>
              ))}
            </div>
          </div>

          {isTablet ? (
            <div style={{ position: 'relative', minHeight: 0 }}>
              {(() => {
                const f = SCENARIOS[((active % N) + N) % N]
                return (
                  <div style={{ position: 'relative', padding: isMobile ? '28px 24px 24px' : '32px 28px 24px', background: `rgba(251,86,7,0.07)`, border: `1px solid ${C.mandarin}`, overflow: 'hidden', boxSizing: 'border-box' as const }}>
                    <div style={{ marginBottom: 20 }}>
                      <i className={`fa-solid ${f.icon}`} style={{ color: C.mandarin, fontSize: 15, lineHeight: 1 }} aria-hidden="true" />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 10, lineHeight: 1.3 }}>{f.scenario}</div>
                    <p style={{ fontSize: 13, color: C.body, lineHeight: 1.7, margin: 0 }}>{f.impact}</p>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `rgba(251,86,7,0.12)` }} aria-hidden="true">
                      <div style={{ height: '100%', width: `${fillPct}%`, background: C.mandarin, transition: 'none' }} />
                    </div>
                  </div>
                )
              })()}
            </div>
          ) : (
            <div
              style={{ overflow: 'hidden', position: 'relative', cursor: 'grab', height: 280 }}
              onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => { setFillPct(0); startRef.current = Date.now(); setPaused(false) }}
            >
              {cardSlots.map(offset => {
                const featureIndex = ((active + offset) % N + N) % N
                const f = SCENARIOS[featureIndex]
                const isCenter = offset === 0
                const xPos = offset * step
                return (
                  <div
                    key={`slot-${offset}`}
                    onClick={() => { if (!dragRef.current.moved && !isCenter) setActive(a => a + offset) }}
                    style={{
                      position: 'absolute', top: 0, left: 0, width: cardWidth, height: '100%',
                      padding: '32px 28px 20px',
                      background: isCenter ? `rgba(251,86,7,0.07)` : C.surface,
                      border: `1px solid ${isCenter ? C.mandarin : C.border}`,
                      overflow: 'hidden',
                      opacity: Math.abs(offset) <= 1 ? (isCenter ? 1 : 0.5) : 0,
                      transform: `translateX(${xPos}px)`,
                      transition: 'opacity 0.35s ease, border-color 0.35s ease, background 0.35s ease, transform 0.45s cubic-bezier(0.4,0,0.2,1)',
                      cursor: isCenter ? 'default' : 'pointer',
                      pointerEvents: Math.abs(offset) > 2 ? 'none' : 'auto',
                      boxSizing: 'border-box' as const,
                    }}
                  >
                    <div style={{ marginBottom: 20 }}>
                      <i className={`fa-solid ${f.icon}`} style={{ color: C.mandarin, fontSize: 15, lineHeight: 1 }} aria-hidden="true" />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 10, lineHeight: 1.3 }}>{f.scenario}</div>
                    <p style={{ fontSize: 13, color: C.body, lineHeight: 1.7, margin: 0 }}>{f.impact}</p>
                    {isCenter && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `rgba(251,86,7,0.12)` }} aria-hidden="true">
                        <div style={{ height: '100%', width: `${fillPct}%`, background: C.mandarin, transition: 'none' }} />
                      </div>
                    )}
                  </div>
                )
              })}
              <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 80, background: `linear-gradient(to right, transparent, ${C.bg})`, pointerEvents: 'none', zIndex: 10 }} aria-hidden="true" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   LARGE STAT COUNT
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
   PLATFORM WEDGE DIAGRAM
───────────────────────────────────────────────────────────── */
const DIAGRAM_WEDGES = [
  { id: 'practice', label: 'Practice Management', startAngle: -60, endAngle: 60,  stroke: '#ffb30c', faUnicode: '\uf201' },
  { id: 'comp',     label: 'Compensation',         startAngle: 60,  endAngle: 180, stroke: '#FF006E', faUnicode: '\uf51e' },
  { id: 'fees',     label: 'Fees & Billing',        startAngle: 180, endAngle: 300, stroke: '#ED65D0', faUnicode: '\uf571' },
]

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * Math.PI / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function wedgePath(cx: number, cy: number, outerR: number, innerR: number, s: number, e: number) {
  const o1 = polarToXY(cx, cy, outerR, s), o2 = polarToXY(cx, cy, outerR, e)
  const i2 = polarToXY(cx, cy, innerR, e), i1 = polarToXY(cx, cy, innerR, s)
  const lg = e - s > 180 ? 1 : 0
  return `M${o1.x} ${o1.y} A${outerR} ${outerR} 0 ${lg} 1 ${o2.x} ${o2.y} L${i2.x} ${i2.y} A${innerR} ${innerR} 0 ${lg} 0 ${i1.x} ${i1.y}Z`
}

function PlatformDiagram({ visible }: { visible: boolean }) {
  const { isMobile } = useBreakpoint()
  const VB = 200, CX = 100, CY = 100
  const INNER = 43, OUTER = 84
  const WEDGE_INNER = INNER + 2, LABEL_R = OUTER + 18, HUB_R = INNER

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: isMobile ? 260 : 380, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 'min(260px,70%)', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,132,255,0.13) 0%, transparent 70%)', pointerEvents: 'none' }} aria-hidden="true" />
      <div style={{ position: 'relative', width: isMobile ? 'min(200px,70vw)' : 'min(340px,88%)', aspectRatio: '1' }}>
        <svg viewBox={`0 0 ${VB} ${VB}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {DIAGRAM_WEDGES.map((w, wi) => {
            const path = wedgePath(CX, CY, OUTER, WEDGE_INNER, w.startAngle, w.endAngle)
            const mid = (w.startAngle + w.endAngle) / 2
            const iconPt = polarToXY(CX, CY, (OUTER + WEDGE_INNER) / 2, mid)
            const labelPt = polarToXY(CX, CY, LABEL_R, mid)
            const textAnchor = labelPt.x < CX - 5 ? 'end' : labelPt.x > CX + 5 ? 'start' : 'middle'
            const words = w.label.split(' ')
            const half = Math.ceil(words.length / 2)
            return (
              <g key={w.id}>
                <path d={path} fill="none" stroke={w.stroke} strokeWidth="1.5"
                  opacity={visible ? 1 : 0}
                  style={{ transformOrigin: `${CX}px ${CY}px`, transform: visible ? 'scale(1)' : 'scale(0.88)', transition: `opacity 0.55s ease ${wi * 0.18}s, transform 0.55s ease ${wi * 0.18}s` }}
                />
                <text x={iconPt.x} y={iconPt.y} textAnchor="middle" dominantBaseline="middle"
                  fontSize="13" fontWeight="900"
                  fontFamily="'Font Awesome 6 Free','Font Awesome 6 Pro','Font Awesome 5 Free'"
                  fill={w.stroke} opacity={visible ? 1 : 0}
                  style={{ transition: `opacity 0.4s ease ${wi * 0.18 + 0.18}s` }}
                >{w.faUnicode}</text>
                <text x={labelPt.x} y={labelPt.y} textAnchor={textAnchor} dominantBaseline="middle"
                  fontSize="8.5" fontWeight="700" fill={w.stroke}
                  style={{ letterSpacing: '0.02em', opacity: visible ? 1 : 0, transition: `opacity 0.4s ease ${wi * 0.18 + 0.30}s` }}
                >
                  {words.length > 1 ? (
                    <><tspan x={labelPt.x} dy="-0.6em">{words.slice(0, half).join(' ')}</tspan><tspan x={labelPt.x} dy="1.3em">{words.slice(half).join(' ')}</tspan></>
                  ) : w.label}
                </text>
              </g>
            )
          })}
          <circle cx={CX} cy={CY} r={HUB_R + 2} fill="#140f0c" />
          <circle cx={CX} cy={CY} r={HUB_R} fill="none" stroke="rgba(59,132,255,0.18)" strokeWidth="1.5" />
          <circle cx={CX} cy={CY} r={HUB_R} fill="none" stroke="rgba(59,132,255,0.45)" strokeWidth="1.5"
            opacity={visible ? 1 : 0}
            style={{ transformOrigin: `${CX}px ${CY}px`, transform: visible ? 'scale(1)' : 'scale(0.7)', transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s' }}
          />
          <text x={CX} y={CY} textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fontWeight="600" fill="#f4f4f4"
            style={{ letterSpacing: '0.02em', opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease 0.38s' }}
          >
            <tspan x={CX} dy="-5">Revenue Book</tspan>
            <tspan x={CX} dy="11">of Record</tspan>
          </text>
        </svg>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
export default function CollectionClient() {
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '56px 0' : '90px 0'
  const heroPad = isMobile ? '48px 0 48px' : '90px 0 72px'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const twoCols = isTablet ? '1fr' : 'repeat(2, minmax(0, 1fr))'
  const heroGap = isMobile ? '24px' : isTablet ? '32px' : '80px'
  const sectionGap = isMobile ? '24px' : isTablet ? '32px' : '80px'
  const caseCols = isTablet ? '1fr' : '1fr 1.4fr'
  const relatedCols = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'

  const approachRef = useRef<HTMLDivElement>(null)
  const [approachVisible, setApproachVisible] = useState(false)
  useEffect(() => {
    const el = approachRef.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setApproachVisible(true); obs.disconnect() } }, { threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const heroGraphic = (
    <motion.div initial={{ opacity: 0, x: isMobile ? 0 : 24, y: isMobile ? 14 : 0 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}>
      <HeroLeakageChart />
    </motion.div>
  )

  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; } }

        .cl-bullet-row { display: flex; gap: 14px; align-items: flex-start; padding: 14px 0; border-bottom: 1px solid ${C.border}; }
        .cl-bullet-row:last-child { border-bottom: none; }
        .cl-cta-row { display: flex; gap: 18px; align-items: flex-start; padding: 18px 0; border-bottom: 1px solid ${C.border}; }
        .cl-cta-row:last-child { border-bottom: none; }
        .cl-related-card {
          display: flex; flex-direction: column;
          background: ${C.surface}; border: 1px solid ${C.border};
          padding: 28px 26px; text-decoration: none; position: relative; overflow: hidden;
          transition: border-color 0.3s ease, transform 0.3s ease;
        }
        .cl-related-card:hover { border-color: rgba(255,255,255,0.14); transform: translateY(-4px); }
        .cl-gradient-border {
          background: linear-gradient(${C.surface}, ${C.surface}) padding-box,
                      linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%) border-box;
          border: 1px solid transparent;
          transition: transform 0.3s ease;
        }
        .cl-gradient-border:hover { transform: translateY(-4px); }
        .btn-orange {
          position: relative; display: inline-flex; align-items: center; justify-content: center;
          padding: 0.45rem 1rem; font-size: 0.875rem; font-weight: 600; border-radius: 0;
          transition: color 0.2s; z-index: 0; color: #ffffff;
          border: 2px solid ${C.mandarin}; text-decoration: none;
        }
        .btn-orange::before {
          content: ''; position: absolute; inset: -2px;
          background: linear-gradient(90deg, #FACC22, #FB5607, #4760FF, #0DCCFF);
          z-index: -1; opacity: 0; transition: opacity 0.2s;
        }
        .btn-orange::after { content: ''; position: absolute; inset: 0; z-index: -1; background-color: #140f0c; }
        .btn-orange:hover::before { opacity: 1; }
      `}</style>

      {/* ── 1. HERO ── */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: heroPad, display: 'flex', alignItems: 'center' }} aria-label="Revenue collection and billing accuracy">
        <div aria-hidden="true" style={{ position: 'absolute', top: '5%', left: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(251,86,7,0.07) 0%, transparent 62%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '5%', right: '5%', width: 700, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(251,86,7,0.05) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', top: '30%', right: '10%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.04) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, pointerEvents: 'none', background: `linear-gradient(to bottom, transparent, ${C.bg})` }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad, width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: heroGap, alignItems: 'center' }}>
            {isMobile && heroGraphic}
            <div style={{ maxWidth: 560 }}>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                <Eyebrow color={C.mandarin}>Industry Challenges</Eyebrow>
              </motion.div>
              <h1 style={{ fontSize: 'clamp(2.25rem,5vw,4rem)', fontWeight: 700, color: C.text, lineHeight: 1.05, letterSpacing: '-0.028em', margin: 0 }}>
                <motion.span style={{ display: 'block' }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                  Collect Every Dollar{' '}<span style={{ color: C.mandarin }}>You&apos;ve Earned.</span>
                </motion.span>
              </h1>
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.75 }} style={{ marginTop: 24, fontSize: 18, color: C.body, lineHeight: 1.75, maxWidth: 500 }}>
                Collection is where revenue integrity becomes real. When billing data is
                fragmented and exceptions live in spreadsheets, firms do not just create
                process headaches. They leave rightfully earned revenue uncollected.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.95 }} style={{ marginTop: 36 }}>
                <Link href="/contact" className="btn-orange">Talk to an expert</Link>
              </motion.div>
            </div>
            {!isMobile && heroGraphic}
          </div>
        </div>
      </section>

      {/* ── 2. SCENARIO CAROUSEL ── */}
      <ScenarioCarousel />

      {/* ── 3. THE PROBLEM ── */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Collection problems begin with fragmentation">
        <div aria-hidden="true" style={{ position: 'absolute', top: '10%', right: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(251,86,7,0.06) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '0%', left: '5%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.04) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'start' }}>
            <div>
              <Reveal>
                <Eyebrow color={C.mandarin}>The Problem</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                  Collection Problems Begin With{' '}<span style={{ color: C.mandarin }}>Fragmentation</span>
                </h2>
              </Reveal>
              <Reveal delay={70}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
                  <p style={{ fontSize: 16, color: C.body, lineHeight: 1.75, margin: 0 }}>
                    Client data lives in one system. Assets live in another. Billing rules
                    sit somewhere else. Contract terms may be buried in PDFs, email threads,
                    or static spreadsheets. By quarter-end, finance and operations are forced
                    to stitch the truth together by hand.
                  </p>
                  <p style={{ fontSize: 16, color: C.body, lineHeight: 1.75, margin: 0 }}>
                    Collection is not an abstract reporting problem. It is a financial
                    performance problem. The cost to serve has already been incurred. Every
                    missed dollar comes off the bottom line almost dollar for dollar.
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Right: bullet list — bare icons, no backgrounds */}
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {[
                { label: 'Earned But Not Collected', icon: 'fa-circle-xmark',    detail: 'Revenue leaves the book before it is ever invoiced because billing logic does not reflect the full relationship.' },
                { label: 'EBITDA Impact Is Direct',  icon: 'fa-arrow-trend-down', detail: 'A small leakage rate translates into a disproportionate reduction in EBITDA, and in a market valued on trailing profitability, that affects enterprise value.' },
                { label: 'Compounding Over Time',    icon: 'fa-layer-group',      detail: 'Each missed exception, stale schedule, or orphaned asset is small in isolation. Together they create a persistent drag on yield that is difficult to reverse.' },
                { label: 'Manual Reconciliation Cost', icon: 'fa-hourglass-half', detail: 'The operational burden of closing these gaps every quarter consumes time that should be directed at managing the business, not reconstructing the truth.' },
              ].map((item, i) => (
                <Reveal key={item.label} delay={i * 70}>
                  <li className="cl-bullet-row">
                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                      <i className={`fa-solid ${item.icon}`} style={{ color: C.mandarin, fontSize: 16, lineHeight: 1 }} aria-hidden="true" />
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

      {/* ── 4. $71M PROOF MOMENT ── */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Regulatory enforcement and case study">
        <div aria-hidden="true" style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(251,86,7,0.07) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '0%', right: '5%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.04) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: caseCols, gap: 'clamp(2rem,4vw,5rem)', alignItems: 'center' }}>
            <Reveal>
              <LargeStatCount value={71} prefix="$" suffix="M" color={C.text} />
              <p style={{ marginTop: 16, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.18em', color: C.subtle }}>In fines, one FINRA sweep</p>
              <div style={{ marginTop: 20, height: 1, width: 64, background: C.border }} aria-hidden="true" />
              <p style={{ marginTop: 16, fontSize: 13, color: C.subtle, fontStyle: 'italic' }}>FINRA enforcement data, 2023</p>
            </Reveal>
            <Reveal delay={120}>
              <Eyebrow color={C.mandarin}>The Cost of Getting It Wrong</Eyebrow>
              <h2 style={{ fontSize: 'clamp(1.6rem,2.8vw,2.2rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.22, margin: 0 }}>
                In 2023, FINRA collected about $71 million in fines tied to billing errors and misaligned compensation, putting fee accuracy firmly in regulators&rsquo; crosshairs.
              </h2>
              <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                A UK-headquartered Tier-1 Asset Manager consolidated billing across 11 global
                sites onto Fees and Billing, replacing fragmented spreadsheet workflows
                with a single automated platform.
              </p>
              <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
                {[
                  { value: '>30%', label: 'Reduction in billing cycle time',  color: C.mandarin },
                  { value: '11',   label: 'Global sites consolidated',         color: C.mandarin },
                  { value: '100%', label: 'Spreadsheet dependency eliminated', color: C.text },
                ].map(s => (
                  <div key={s.label}>
                    <p style={{ fontSize: 'clamp(1.35rem,2.4vw,1.8rem)', fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
                    <p style={{ marginTop: 4, fontSize: 13, color: C.body, lineHeight: 1.6 }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24 }}>
                <Link href="/case-study/asset-manager-billing-cycle-time" className="btn-orange">Read the case study</Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 5. THE PUREFACTS APPROACH ── */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="The PureFacts approach to collection">
        <div aria-hidden="true" style={{ position: 'absolute', top: '5%', left: '0%', width: 550, height: 450, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(251,86,7,0.06) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '5%', right: '5%', width: 600, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'center' }}>
            <div>
              <Reveal>
                <Eyebrow color={C.mandarin}>The PureFacts Approach</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                  A Governed Revenue Process That Makes Accurate Billing{' '}
                  <span style={{ color: C.mandarin }}>Easier To Execute At Scale</span>
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                  Firms that improve collection build a connected billing foundation, a
                  single source of truth for every household, account, asset, and contract,
                  with consistent rule execution and full visibility into what has been billed,
                  collected, and what is still at risk. PureFacts delivers that foundation as a
                  unified platform across Fees &amp; Billing, Compensation, and Practice Management,
                  all anchored to a Revenue Book of Record so your numbers are never in question.
                </p>
              </Reveal>
              <Reveal delay={130}>
                <div style={{ marginTop: 32 }}>
                  <Link href="/platform" className="btn-orange">Explore the platform</Link>
                </div>
              </Reveal>
            </div>
            <div ref={approachRef} style={{ minHeight: 380, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlatformDiagram visible={approachVisible} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. RELATED CHALLENGES ── */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Related revenue challenges">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 350, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <Reveal>
            <h2 style={{ fontSize: 'clamp(1.5rem,2.5vw,2rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
              Collection Is{' '}<span style={{ color: C.mandarin }}>One Piece</span>{' '}Of The Revenue Puzzle
            </h2>
            <p style={{ fontSize: 15, color: C.body, maxWidth: 560, margin: '0 0 36px' }}>
              Fixing collection is essential, but the full picture includes how you price, bill, and manage the complexity underneath.
            </p>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: relatedCols, gap: 16, alignItems: 'stretch' }}>
            {[
              { icon: 'fa-compress', color: C.azure,    label: 'Compression', href: '/why-purefacts/compression', desc: 'Fee pressure is rising while cost to serve expands. See how firms protect margin without sacrificing growth.', isPlatform: false },
              { icon: 'fa-sitemap',  color: C.honey,    label: 'Complexity',  href: '/why-purefacts/complexity',  desc: 'As fee structures and exceptions multiply, productive capacity shrinks. Learn how to govern it.', isPlatform: false },
              { icon: null,          color: C.azure,    label: 'Secure Your Revenue Lifecycle', href: '/platform', desc: 'Compression, collection, and complexity are connected problems. The PureFacts platform addresses all three.', isPlatform: true },
            ].map((card, i) => (
              <Reveal key={card.label} delay={i * 70} style={{ display: 'flex' }}>
                {card.isPlatform ? (
                  <Link
                    href={card.href}
                    className="cl-gradient-border"
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 26px', textDecoration: 'none', position: 'relative', overflow: 'hidden' }}
                    aria-label={`${card.label}: ${card.desc}`}
                  >
                    <div style={{ width: 180, height: 40, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Image src="/PureRevenueWhite.svg" alt="PureRevenue" width={200} height={50} style={{ objectFit: 'contain' }} />
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: C.text, margin: '0 0 10px' }}>{card.label}</h3>
                    <p style={{ fontSize: 14, color: C.body, lineHeight: 1.7, margin: '0 0 20px', flex: 1 }}>{card.desc}</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'rgb(6,91,191)' }}>
                      Explore the platform <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} aria-hidden="true" />
                    </span>
                  </Link>
                ) : (
                  <Link href={card.href} className="cl-related-card" style={{ flex: 1, border: `1px solid ${card.color}` }} aria-label={`${card.label}: ${card.desc}`}>
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
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Talk to a PureFacts expert">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 1000, height: 600, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(251,86,7,0.06) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '0%', left: '5%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.04) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', top: '20%', right: '0%', width: 400, height: 350, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.04) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'center' }}>
            <div>
              {[
                { icon: 'fa-database',               color: C.azure,    title: 'Single Source of Truth',    desc: 'Unified household, account, asset, pricing, and contract data so billing reflects the full reality of every client relationship.' },
                { icon: 'fa-arrows-rotate',           color: C.mandarin, title: 'Consistent Rule Execution', desc: 'Apply billing rules reliably across households, breakpoints, exceptions, and asset classes without relying on human memory or manual reconciliation.' },
                { icon: 'fa-magnifying-glass-dollar', color: C.honey,    title: 'Full Revenue Visibility',   desc: 'Give finance, operations, and leadership a clearer view of what has been billed, collected, and where leakage risk still sits.' },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 70}>
                  <div className="cl-cta-row">
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
                Collection Should Not Be{' '}<GradientText>Where Value Disappears.</GradientText>
              </h2>
              <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                See how PureFacts helps wealth management firms improve billing
                accuracy, reduce leakage, and protect the margin they have already
                worked to earn.
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