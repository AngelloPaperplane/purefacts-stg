'use client'

import { useEffect, useRef, useState } from 'react'
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

function Reveal({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(22px)', transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`, ...style }}>
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   COMPRESSION DOTS CANVAS
───────────────────────────────────────────────────────────── */
function CompressionDotsCanvas() {
  const { isMobile } = useBreakpoint()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    let W = 0, H = 0, tick = 0

    const COLORS = ['#3b84ff', '#fb5607', '#ffb30c', '#3b84ff', '#fb5607', '#3b84ff', '#ffb30c', '#fb5607']

    type Dot = {
      x: number; y: number
      vx: number; vy: number
      r: number
      color: string
      alpha: number
      phase: number
      homeY: number
    }

    let dots: Dot[] = []

    function init() {
      W = canvas!.offsetWidth
      H = canvas!.offsetHeight
      canvas!.width = W
      canvas!.height = H
      tick = 0
      dots = []
      for (let i = 0; i < 60; i++) {
        const homeY = H * 0.12 + Math.random() * H * 0.76
        dots.push({
          x: W * 0.06 + Math.random() * W * 0.88,
          y: homeY,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: Math.random() * 3.2 + 1.2,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          alpha: 0.35 + Math.random() * 0.55,
          phase: Math.random() * Math.PI * 2,
          homeY,
        })
      }
    }

    function ha(hex: string, a: number) {
      return `${hex}${Math.round(a * 255).toString(16).padStart(2, '0')}`
    }

    function draw() {
      tick++
      ctx!.clearRect(0, 0, W, H)

      const cycleTicks = 420
      const t = (tick % cycleTicks) / cycleTicks
      let compression: number
      if (t < 0.45) {
        compression = t / 0.45
        compression = 1 - Math.pow(1 - compression, 2.5)
      } else if (t < 0.65) {
        compression = 1
      } else {
        const rel = (t - 0.65) / 0.35
        compression = 1 - Math.pow(rel, 1.8)
      }

      const scatterH = H * 0.76
      const centreY = H * 0.5
      const halfBand = scatterH * 0.5 * (1 - compression * 0.80)
      const bandTop = centreY - halfBand
      const bandBot = centreY + halfBand

      if (compression > 0.05) {
        const bandAlpha = compression * 0.07
        ctx!.fillStyle = `rgba(59,132,255,${bandAlpha})`
        ctx!.fillRect(0, bandTop, W, bandBot - bandTop)
      }

      dots.forEach(d => {
        d.phase += 0.007
        d.x += d.vx
        d.y += d.vy
        if (d.x < d.r) { d.x = d.r; d.vx *= -1 }
        if (d.x > W - d.r) { d.x = W - d.r; d.vx *= -1 }

        const targetY = bandTop + (d.homeY / H) * (bandBot - bandTop)
        const pullStrength = 0.03 + compression * 0.07
        d.y += (targetY - d.y) * pullStrength
        if (d.y < bandTop) d.y = bandTop
        if (d.y > bandBot) d.y = bandBot

        const pulse = 0.85 + 0.15 * Math.sin(d.phase)

        const g = ctx!.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 5)
        g.addColorStop(0, ha(d.color, d.alpha * 0.38 * pulse))
        g.addColorStop(1, ha(d.color, 0))
        ctx!.beginPath(); ctx!.arc(d.x, d.y, d.r * 5, 0, Math.PI * 2)
        ctx!.fillStyle = g; ctx!.fill()

        ctx!.beginPath(); ctx!.arc(d.x, d.y, d.r * pulse, 0, Math.PI * 2)
        ctx!.fillStyle = ha(d.color, Math.min(d.alpha * 1.3, 0.95))
        ctx!.fill()
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    init(); draw()
    const ro = new ResizeObserver(() => init()); ro.observe(canvas)
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect() }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ display: 'block', width: '100%', height: '100%', minHeight: isMobile ? 240 : 300 }}
    />
  )
}

/* ─────────────────────────────────────────────────────────────
   MARGIN SQUEEZE DIAGRAM
───────────────────────────────────────────────────────────── */
function MarginSqueezeDiagram() {
  const { isMobile } = useBreakpoint()
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number>(0)
  const startRef = useRef(0)
  const visibleRef = useRef(false)

  useEffect(() => {
    const c = containerRef.current; if (!c) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !visibleRef.current) {
        visibleRef.current = true; startRef.current = Date.now(); obs.disconnect()
        const animate = () => {
          const p = Math.min((Date.now() - startRef.current) / 1600, 1)
          const eased = 1 - Math.pow(1 - p, 3)
          setProgress(eased)
          if (p < 1) rafRef.current = requestAnimationFrame(animate)
        }
        rafRef.current = requestAnimationFrame(animate)
      }
    }, { threshold: 0.3 })
    obs.observe(c)
    return () => { obs.disconnect(); cancelAnimationFrame(rafRef.current) }
  }, [])

  const BARS = [
    { label: 'Revenue',      then: 0.72, now: 0.80, thenText: '$4.2M', nowText: '$4.9M', color: C.azure,    change: '+17%', changeUp: true  },
    { label: 'Cost to Serve',then: 0.44, now: 0.68, thenText: '$2.6M', nowText: '$4.1M', color: C.mandarin, change: '+58%', changeUp: false },
    { label: 'Net Margin',   then: 0.60, now: 0.22, thenText: '$1.6M', nowText: '$0.8M', color: '#ff3b3b',  change: '−50%', changeUp: false },
  ]

  return (
    <div ref={containerRef} style={{ background: C.surface, border: `1px solid ${C.border}`, padding: isMobile ? 16 : 20 }}>
      <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: C.subtle }}>Firm Economics</span>
        <div style={{ display: 'flex', gap: 16 }}>
          {['2 Years Ago', 'Today'].map((l, i) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 20, height: 3, background: i === 0 ? `rgba(244,244,244,0.25)` : `rgba(244,244,244,0.55)` }} />
              <span style={{ fontSize: 9, color: C.subtle, fontWeight: 500 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {BARS.map((bar) => {
          const thenW = bar.then * progress
          const nowW = bar.now * progress
          return (
            <div key={bar.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{bar.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: bar.changeUp ? C.azure : '#ff3b3b' }}>{bar.change}</span>
              </div>
              <div style={{ position: 'relative', height: 20, background: `rgba(255,255,255,0.04)`, marginBottom: 5 }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${thenW * 100}%`, background: `${bar.color}28`, border: `1px solid ${bar.color}30` }} />
                <span style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: C.subtle, fontWeight: 500 }}>{bar.thenText}</span>
              </div>
              <div style={{ position: 'relative', height: 20, background: `rgba(255,255,255,0.04)` }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${nowW * 100}%`, background: `${bar.color}55`, border: `1px solid ${bar.color}70` }} />
                <div style={{ position: 'absolute', left: 0, top: 0, width: `${nowW * 100}%`, height: 2, background: bar.color, opacity: 0.75 }} />
                <span style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: C.text, fontWeight: 700 }}>{bar.nowText}</span>
              </div>
            </div>
          )
        })}
      </div>
      <p style={{ textAlign: 'center', fontSize: 11, color: C.subtle, letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontWeight: 600, marginTop: 16, marginBottom: 0 }}>
        Same growth. Less margin. That is compression.
      </p>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   PLATFORM DIAGRAM
───────────────────────────────────────────────────────────── */
const DIAGRAM_WEDGES = [
  { id: 'practice', label: 'Practice Management', startAngle: -60,  endAngle: 60,  fill: 'none', stroke: '#ffb30c', faUnicode: '\uf201' },
  { id: 'comp',     label: 'Compensation',         startAngle: 60,   endAngle: 180, fill: 'none', stroke: '#FF006E', faUnicode: '\uf51e' },
  { id: 'fees',     label: 'Fees & Billing',        startAngle: 180,  endAngle: 300, fill: 'none', stroke: '#ED65D0', faUnicode: '\uf571' },
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
  const LABEL_R = isMobile ? OUTER + 10 : OUTER + 18
  const wrapSize = isMobile ? 'min(198px, 70vw)' : 'min(340px, 88%)'

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: isMobile ? 220 : 340, overflow: 'hidden' }}>
      <div aria-hidden="true" style={{ position: 'absolute', width: 'min(260px, 70%)', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,132,255,0.13) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', width: wrapSize, aspectRatio: '1' }}>
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
          <circle cx={CX} cy={CY} r={INNER + 2} fill="#140f0c" />
          <circle cx={CX} cy={CY} r={INNER} fill="none" stroke="rgba(59,132,255,0.18)" strokeWidth="1.5" />
          <motion.circle cx={CX} cy={CY} r={INNER} fill="none"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={visible ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          />
          <circle cx={CX} cy={CY} r={INNER} fill="none" stroke="rgba(59,132,255,0.45)" strokeWidth="1.5" />
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
   LARGE STAT COUNT
───────────────────────────────────────────────────────────── */
function LargeStatCount({ value, prefix = '', suffix = '', color: _color }: { value: number; prefix?: string; suffix?: string; color: string }) {
  const { isMobile } = useBreakpoint()
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
  return <div ref={ref} style={{ fontSize: isMobile ? 'clamp(3.5rem,20vw,5rem)' : 'clamp(4rem,10vw,7rem)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', color: C.text, margin: 0 }} aria-label={`${prefix}${value}${suffix}`}>{prefix}{count}<span style={{ color: C.text }}>{suffix}</span></div>
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
export default function CompressionClient() {
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '64px 0' : 'clamp(4rem,6vw,5.625rem) 0'
  const heroPad = isMobile ? '32px 0 48px' : 'clamp(6rem,10vw,8rem) 0 clamp(4rem,7vw,6rem)'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const twoCol = isTablet ? '1fr' : '1fr 1fr'
  const heroCols = isTablet ? '1fr' : '1fr 1fr'
  const proofCols = isTablet ? '1fr' : '1fr 1.4fr'
  const relatedCols = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'
  const statsCols = isMobile ? '1fr' : '1fr 1fr'
  const wideGap = isMobile ? '24px' : isTablet ? '32px' : '80px'
  const midGap = isMobile ? '24px' : isTablet ? '32px' : '64px'
  const globalStyles = `
        .cp-scenario-card { display: flex; flex-direction: column; background: ${C.surface}; border: 1px solid ${C.border}; padding: 28px 26px 26px; position: relative; transition: border-color 0.3s ease, transform 0.3s ease; }
        .cp-scenario-card:hover { border-color: rgba(255,255,255,0.13); transform: translateY(-3px); }
        .cp-bullet-row { display: flex; gap: 14px; align-items: flex-start; padding: 14px 0; border-bottom: 1px solid ${C.border}; }
        .cp-bullet-row:last-child { border-bottom: none; }
        .cp-benefit-row { display: flex; gap: 16px; align-items: flex-start; padding: 18px 0; border-bottom: 1px solid ${C.border}; }
        .cp-benefit-row:last-child { border-bottom: none; }
        .cp-related-card { display: flex; flex-direction: column; background: ${C.surface}; border: 1px solid rgba(255,255,255,0.07); padding: 28px 26px; text-decoration: none; position: relative; overflow: hidden; transition: border-color 0.3s ease, transform 0.3s ease; }
        .cp-related-card:hover { border-color: rgba(255,255,255,0.14); transform: translateY(-4px); }
        .cp-cta-row { display: flex; gap: 18px; align-items: flex-start; padding: 18px 0; border-bottom: 1px solid ${C.border}; }
        .cp-cta-row:last-child { border-bottom: none; }
        .cp-numbered-item { display: grid; grid-template-columns: 48px 1fr; gap: 20px; align-items: start; padding: 20px 0; border-bottom: 1px solid ${C.border}; }
        .cp-numbered-item:last-child { border-bottom: none; }
        @media (max-width: 639px) {
          .cp-numbered-item { grid-template-columns: 38px 1fr; gap: 12px; padding: 11px 0; }
        }
        .cp-gradient-border { background: ${C.surface}; position: relative; }
        .cp-gradient-border::before { content: ''; position: absolute; inset: 0; border-radius: 0; padding: 1px; background: linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
        }
      `
  const compressionDotsEl = (
    <motion.div
      initial={{ opacity: 0, x: isMobile ? 0 : 24, y: isMobile ? 16 : 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ minHeight: isMobile ? 240 : 300 }}
    >
      <CompressionDotsCanvas />
    </motion.div>
  )

  return (
    <>
      <style>{globalStyles}</style>

      {/* ── 1. HERO ── */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: heroPad }} aria-label="Fee compression in wealth management">
        <div aria-hidden="true" style={{ position: 'absolute', top: '5%', left: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.07) 0%, transparent 62%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '5%', right: '5%', width: 700, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad, width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: heroCols, gap: wideGap, alignItems: 'center' }}>
            {isMobile && compressionDotsEl}
            <div style={{ maxWidth: 560 }}>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                <Eyebrow color={C.azure}>Industry Challenges</Eyebrow>
              </motion.div>
              <h1 style={{ fontSize: 'clamp(2.25rem,5vw,4rem)', fontWeight: 700, color: C.text, lineHeight: 1.05, letterSpacing: '-0.028em', margin: 0 }}>
                <motion.span style={{ display: 'block' }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}>Fee compression is</motion.span>
                <motion.span style={{ display: 'block' }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}>changing the math</motion.span>
                <motion.span style={{ display: 'block' }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.64, ease: [0.16, 1, 0.3, 1] }}>
                  <span style={{ color: C.azure }}>of growth.</span>
                </motion.span>
              </h1>
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.82 }} style={{ marginTop: 24, fontSize: 18, color: C.body, lineHeight: 1.75, maxWidth: 500 }}>
                When every basis point matters, firms need the visibility, control, and revenue discipline to protect margins without slowing growth.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1.0 }} style={{ marginTop: 36 }}>
                <Link href="/contact" className="btn-primary">Talk to an expert</Link>
              </motion.div>
            </div>
            {!isMobile && compressionDotsEl}
          </div>
        </div>
      </section>

      {/* ── 2. THREE PLACES ── */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Where compression shows up">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: wideGap, alignItems: 'start' }}>
            <Reveal>
              <div style={{ maxWidth: 480 }}>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', margin: 0 }}>
                  <span style={{ color: C.azure }}>Compression</span> Shows Up In Three Places
                </h2>
                <p style={{ marginTop: 14, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                  For years, favorable markets helped mask the economics of wealth and asset management. Assets grew, revenue followed, and firms could absorb pricing inconsistency because market appreciation covered the gap. That environment is less forgiving now.
                </p>
              </div>
            </Reveal>
            <div>
              {[
                { n: '01', label: 'Lower Realized Fees',       detail: 'Pricing drifts downward not because strategy demands it, but because discounting becomes habitual across the book.' },
                { n: '02', label: 'Higher Cost To Serve',      detail: 'Clients now expect planning, tax awareness, and alternatives access. Those capabilities are valuable, but not free.' },
                { n: '03', label: 'Changing Growth Economics', detail: 'AUM rises, but without pricing discipline, profitability does not follow. More work, less margin per unit of growth.' },
              ].map((item, i) => (
                <Reveal key={item.label} delay={i * 80}>
                  <div className="cp-numbered-item">
                    <div style={{ fontSize: 'clamp(1.8rem,3vw,2.4rem)', fontWeight: 900, color: C.azure, lineHeight: 1, letterSpacing: '-0.04em', opacity: 0.35, paddingTop: 2 }}>{item.n}</div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>{item.label}</p>
                      <p style={{ marginTop: 6, fontSize: 15, color: C.body, lineHeight: 1.72, margin: '6px 0 0' }}>{item.detail}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. PROBLEM SPLIT ── */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Compression as a business model problem">
        <div aria-hidden="true" style={{ position: 'absolute', top: '10%', right: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.06) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: midGap, alignItems: 'center' }}>
            <div>
              <Reveal>
                <Eyebrow color={C.azure}>The Problem</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>Compression Is A Business Model Problem, Not Just A Pricing One</h2>
              </Reveal>
              <Reveal delay={70}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
                  <p style={{ fontSize: 16, color: C.body, lineHeight: 1.75, margin: 0 }}>It affects revenue quality, advisor behavior, operating leverage, and enterprise value, often at the same time. Firms that address it only at the pricing conversation level are treating the symptom, not the cause.</p>
                  <p style={{ fontSize: 16, color: C.body, lineHeight: 1.75, margin: 0 }}>The cause is usually a combination of habitual discounting, compensation structures that reward volume over yield, and a lack of visibility into where margin is actually going across segments.</p>
                </div>
              </Reveal>
            </div>
            <Reveal delay={100}><MarginSqueezeDiagram /></Reveal>
          </div>
        </div>
      </section>

      {/* ── 4. 89% PROOF MOMENT ── */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Fidelity research and case study">
        <div aria-hidden="true" style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.07) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: proofCols, gap: midGap, alignItems: 'center' }}>
            <Reveal>
              <LargeStatCount value={89} suffix="%" color={C.azure} />
              <p style={{ marginTop: 16, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.18em', color: C.subtle }}>Of firms over $1B now discount stated fees</p>
              <div style={{ marginTop: 20, height: 1, width: 64, background: C.border }} aria-hidden="true" />
              <p style={{ marginTop: 16, fontSize: 13, color: C.subtle, fontStyle: 'italic' }}>Fidelity RIA Benchmarking Study (via PlanAdviser)</p>
            </Reveal>
            <Reveal delay={120}>
              <Eyebrow color={C.azure}>The Scale of the Problem</Eyebrow>
              <h2 style={{ fontSize: 'clamp(1.6rem,2.8vw,2.2rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.22, margin: 0 }}>
                89% of firms over $1 billion in AUM now discount their stated fees, highlighting how common give-away pricing has become.
              </h2>
              <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                A leading European financial institution replaced Excel and Access-based fee operations with Fees and Billing, moving from a reactive billing model to a proactive, automated one.
              </p>
              <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: statsCols, gap: isMobile ? 14 : 16, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
                {[
                  { value: '~€1M',   label: 'In value unlocked',                        color: C.azure },
                  { value: '€200K+', label: 'Direct recurring savings from automation', color: C.azure },
                ].map(s => (
                  <div key={s.label}>
                    <p style={{ fontSize: isMobile ? '1.35rem' : 'clamp(1.45rem,2.2vw,1.8rem)', fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
                    <p style={{ marginTop: 4, fontSize: 13, color: C.body, lineHeight: 1.6 }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24 }}>
                <Link href="/case-study/how-a-leading-european-financial-institution-unlocked-e1m-in-value-and-modernized-fee-operations" className="btn-primary">Read the case study</Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 5. PUREFACTS APPROACH ── */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="The PureFacts approach to defending margin">
        <div aria-hidden="true" style={{ position: 'absolute', top: '5%', left: '0%', width: 550, height: 450, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.06) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: midGap, alignItems: 'center' }}>
            <div>
              <Reveal>
                <Eyebrow color={C.azure}>The PureFacts Approach</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                  <span style={{ color: C.azure }}>Defend Margin With Structure.</span>{' '}Not Willpower
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                  PureFacts helps firms bring structure to pricing strategy, discipline to pricing execution, and visibility into the outcomes that matter. The objective is not simply to resist fee pressure, but to build a stronger revenue foundation that supports better advisor behavior, more confident pricing decisions, and profitable long-term growth.
                </p>
                <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                  By helping firms clearly connect service and outcomes to price, PureFacts enables advisors to defend value with confidence while giving leadership greater control over discounts, compensation alignment, and realized yield. Exceptions and concessions become visible and governable, compensation structures reinforce pricing discipline, and firms gain a clear view of what is actually being collected across the book, not just what appears on the rate card.
                </p>
              </Reveal>
            </div>
            <Reveal delay={100}><PlatformDiagram /></Reveal>
          </div>
        </div>
      </section>

      {/* ── 6. RELATED ── */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: isMobile ? '56px 0' : 'clamp(3rem,5vw,5.625rem) 0' }} aria-label="Related revenue challenges">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 350, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <Reveal>
            <h2 style={{ fontSize: 'clamp(1.5rem,2.5vw,2rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.02em', margin: '0 0 8px' }}>Compression Rarely Arrives Alone</h2>
            <p style={{ fontSize: 15, color: C.body, maxWidth: 560, margin: '0 0 36px' }}>It compounds with collection gaps and operational complexity. Explore the full picture.</p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: relatedCols, gap: 16, alignItems: 'stretch' }}>
            {[
              { icon: 'fa-circle-dollar-to-slot', color: C.mandarin, label: 'Collection', href: '/why-purefacts/collection', desc: 'Revenue you earned but did not collect is margin lost. See how firms close the gap between realized and collected value.', isPlatform: false },
              { icon: 'fa-sitemap',               color: C.honey,    label: 'Complexity',  href: '/why-purefacts/complexity', desc: 'As fee structures, exceptions, and payout rules multiply, productive capacity disappears. Learn how to govern it.', isPlatform: false },
              { icon: null,                        color: C.azure,    label: 'Secure Your Revenue Lifecycle', href: '/platform', desc: 'Compression, collection, and complexity are connected problems. The PureFacts platform addresses all three.', isPlatform: true },
            ].map((card, i) => (
              <Reveal key={card.label} delay={i * 70} style={{ display: 'flex' }}>
                {card.isPlatform ? (
                  <Link
                    href={card.href}
                    className="cp-gradient-border"
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 26px', textDecoration: 'none', position: 'relative', overflow: 'hidden', transition: 'transform 0.3s ease' }}
                    aria-label={`${card.label}: ${card.desc}`}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
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
                  <Link href={card.href} className="cp-related-card" style={{ flex: 1, border: `1px solid ${card.color}` }} aria-label={`${card.label}: ${card.desc}`}>
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
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Build a stronger revenue model">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 1000, height: 600, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.07) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '0%', left: '5%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(251,86,7,0.05) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', top: '20%', right: '0%', width: 400, height: 350, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.04) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: midGap, alignItems: 'center' }}>
            <div>
              {[
                { icon: 'fa-tag',                color: C.azure,    title: 'Defend Value With Confidence',  desc: 'When firms can connect service and outcomes to price, advisors stop defaulting to the bottom of the band and yield stops drifting.' },
                { icon: 'fa-shield-halved',       color: C.mandarin, title: 'Govern Discounts Rigorously',   desc: 'Exceptions and concessions need to be visible, reviewed, and resolved on schedule, not left to quietly compound across the book.' },
                { icon: 'fa-hand-holding-dollar', color: C.honey,    title: 'Align Compensation With Yield', desc: 'Better compensation design reinforces pricing discipline and long-term margin protection across the entire advisor force.' },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 70}>
                  <div className="cp-cta-row">
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
                Build a Revenue Model That Does Not Rely On The Market <GradientText>To Bail You Out.</GradientText>
              </h2>
              <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>See how PureFacts helps wealth management firms respond to compression with stronger pricing discipline, better governance, and a more profitable revenue foundation.</p>
              <div style={{ marginTop: 30 }}><Link href="/contact" className="btn-primary">Talk to an expert</Link></div>
              <p style={{ marginTop: 16, fontSize: 13, color: C.subtle }}>Trusted by the top global financial firms</p>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}