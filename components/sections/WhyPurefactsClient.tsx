'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { urlFor } from '@/lib/sanity/client'
import { type ClientLogo } from '@/components/sections/LogoCarousel'

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS
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

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      background: C.sunset,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }}>
      {children}
    </span>
  )
}

function Eyebrow({ children, color = C.mandarin }: { children: React.ReactNode; color?: string }) {
  return (
    <p style={{
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.20em',
      color,
      margin: '0 0 14px',
    }}>
      {children}
    </p>
  )
}

function useReveal(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function useBreakpoint() {
  const [w, setW] = useState(() => (typeof window === 'undefined' ? 1280 : window.innerWidth))
  useEffect(() => {
    const update = () => setW(window.innerWidth)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return { isMobile: w < 640, isTablet: w < 1024, w }
}

function Reveal({
  children, delay = 0, className, style,
}: {
  children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties
}) {
  const { ref, visible } = useReveal()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(22px)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   HERO CANVAS
   Nodes are split L/R by x position at draw time.
   Left half (where the copy lives): very faint.
   Right half: full original vibrancy.
───────────────────────────────────────────────────────────── */
function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const COLORS = [C.azure, C.mandarin, C.honey]
    const NODE_COUNT = 42

    type Node = {
      x: number; y: number; vx: number; vy: number
      r: number; color: string; pulse: number; pulseSpeed: number
    }

    let W = 0, H = 0
    let nodes: Node[] = []

    function init() {
      W = canvas!.offsetWidth
      H = canvas!.offsetHeight
      canvas!.width = W
      canvas!.height = H
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        r: Math.random() * 3 + 1.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.012 + Math.random() * 0.018,
      }))
    }

    function ha(hex: string, alpha: number) {
      return `${hex}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`
    }

    // Returns a 0-1 multiplier: faint on the left, full on the right
    // Fade zone spans from 35% to 65% of canvas width
    function xAlpha(x: number): number {
      const fadeStart = W * 0.35
      const fadeEnd   = W * 0.65
      if (x <= fadeStart) return 0.08
      if (x >= fadeEnd)   return 1.0
      return 0.08 + (1.0 - 0.08) * ((x - fadeStart) / (fadeEnd - fadeStart))
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H)

      // Edges — use midpoint x to determine alpha
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 170) {
            const midX = (nodes[i].x + nodes[j].x) / 2
            const baseAlpha = (1 - dist / 170) * 0.16
            ctx!.beginPath()
            ctx!.moveTo(nodes[i].x, nodes[i].y)
            ctx!.lineTo(nodes[j].x, nodes[j].y)
            ctx!.strokeStyle = ha(nodes[i].color, baseAlpha * xAlpha(midX))
            ctx!.lineWidth = 0.8
            ctx!.stroke()
          }
        }
      }

      // Nodes
      for (const n of nodes) {
        n.pulse += n.pulseSpeed
        const ps = 1 + Math.sin(n.pulse) * 0.25
        const xa = xAlpha(n.x)

        const g = ctx!.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6 * ps)
        g.addColorStop(0, ha(n.color, 0.16 * xa))
        g.addColorStop(1, ha(n.color, 0))
        ctx!.beginPath()
        ctx!.arc(n.x, n.y, n.r * 6 * ps, 0, Math.PI * 2)
        ctx!.fillStyle = g
        ctx!.fill()

        ctx!.beginPath()
        ctx!.arc(n.x, n.y, n.r * ps, 0, Math.PI * 2)
        ctx!.fillStyle = ha(n.color, 0.82 * xa)
        ctx!.fill()

        n.x += n.vx; n.y += n.vy
        if (n.x < -20) n.x = W + 20
        if (n.x > W + 20) n.x = -20
        if (n.y < -20) n.y = H + 20
        if (n.y > H + 20) n.y = -20
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    init()
    draw()
    const ro = new ResizeObserver(() => init())
    ro.observe(canvas)
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect() }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        opacity: 0.7, pointerEvents: 'none',
      }}
    />
  )
}

/* ─────────────────────────────────────────────────────────────
   FRAGMENTED SYSTEMS GRAPHIC
───────────────────────────────────────────────────────────── */
function FragmentedSystemsGraphic() {
  const { isMobile } = useBreakpoint()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const SYSTEMS = [
      { label: 'Fee Billing',  color: C.azure,    bx: 0.22, by: 0.28 },
      { label: 'Compensation', color: C.mandarin, bx: 0.78, by: 0.22 },
      { label: 'Pricing',      color: C.honey,    bx: 0.50, by: 0.72 },
      { label: 'Incentives',   color: C.azure,    bx: 0.80, by: 0.70 },
      { label: 'Analytics',    color: C.mandarin, bx: 0.20, by: 0.72 },
    ]

    type St = { x: number; y: number; t: number; ts: number }
    let W = 0, H = 0
    let states: St[] = []
    let startTime = 0

    function init() {
      W = canvas!.offsetWidth
      H = canvas!.offsetHeight
      canvas!.width = W
      canvas!.height = H
      startTime = Date.now()
      states = SYSTEMS.map(() => ({
        x: 0, y: 0,
        t: Math.random() * Math.PI * 2,
        ts: 0.006 + Math.random() * 0.006,
      }))
    }

    function ha(hex: string, alpha: number) {
      return `${hex}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H)
      const elapsed = Date.now() - startTime
      const drift = Math.min(elapsed / 4000, 1) * 26

      states.forEach((st, i) => {
        st.t += st.ts
        st.x = SYSTEMS[i].bx * W + Math.sin(st.t) * drift + Math.cos(st.t * 0.7) * drift * 0.4
        st.y = SYSTEMS[i].by * H + Math.cos(st.t * 1.1) * drift * 0.7
      })

      ctx!.setLineDash([4, 8])
      for (let i = 0; i < states.length; i++) {
        for (let j = i + 1; j < states.length; j++) {
          const dx = states[i].x - states[j].x
          const dy = states[i].y - states[j].y
          if (Math.sqrt(dx * dx + dy * dy) < W * 0.55) {
            ctx!.beginPath()
            ctx!.moveTo(states[i].x, states[i].y)
            ctx!.lineTo(states[j].x, states[j].y)
            ctx!.strokeStyle = ha('#f4f4f4', 0.06)
            ctx!.lineWidth = 1; ctx!.stroke()
          }
        }
      }
      ctx!.setLineDash([])

      states.forEach((st, i) => {
        const s = SYSTEMS[i]; const r = 44
        const g = ctx!.createRadialGradient(st.x, st.y, 0, st.x, st.y, r * 2.2)
        g.addColorStop(0, ha(s.color, 0.14)); g.addColorStop(1, ha(s.color, 0))
        ctx!.beginPath(); ctx!.arc(st.x, st.y, r * 2.2, 0, Math.PI * 2)
        ctx!.fillStyle = g; ctx!.fill()
        ctx!.beginPath(); ctx!.arc(st.x, st.y, r, 0, Math.PI * 2)
        ctx!.fillStyle = ha(s.color, 0.08); ctx!.fill()
        ctx!.strokeStyle = ha(s.color, 0.35); ctx!.lineWidth = 1.5; ctx!.stroke()
        ctx!.fillStyle = ha(C.text, 0.75)
        ctx!.font = '600 10.5px Carlito, sans-serif'
        ctx!.textAlign = 'center'; ctx!.textBaseline = 'middle'
        ctx!.fillText(s.label, st.x, st.y)
      })

      const pairs: [number, number][] = [[0, 1], [1, 3], [0, 4], [2, 3]]
      pairs.forEach(([a, b]) => {
        const mx = (states[a].x + states[b].x) / 2
        const my = (states[a].y + states[b].y) / 2
        const sz = 6
        ctx!.strokeStyle = ha(C.mandarin, 0.45); ctx!.lineWidth = 1.5
        ctx!.beginPath(); ctx!.moveTo(mx - sz, my - sz); ctx!.lineTo(mx + sz, my + sz); ctx!.stroke()
        ctx!.beginPath(); ctx!.moveTo(mx + sz, my - sz); ctx!.lineTo(mx - sz, my + sz); ctx!.stroke()
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    init(); draw()
    const ro = new ResizeObserver(() => init())
    ro.observe(canvas)
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect() }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ display: 'block', width: '100%', height: isMobile ? 240 : 300 }}
    />
  )
}

/* ─────────────────────────────────────────────────────────────
   PLATFORM DIAGRAM (orbital / wedge)
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
  const o1 = diagramPolarToXY(cx, cy, outerR, s)
  const o2 = diagramPolarToXY(cx, cy, outerR, e)
  const i2 = diagramPolarToXY(cx, cy, innerR, e)
  const i1 = diagramPolarToXY(cx, cy, innerR, s)
  const lg = e - s > 180 ? 1 : 0
  return `M${o1.x} ${o1.y} A${outerR} ${outerR} 0 ${lg} 1 ${o2.x} ${o2.y} L${i2.x} ${i2.y} A${innerR} ${innerR} 0 ${lg} 0 ${i1.x} ${i1.y}Z`
}

function PlatformDiagram() {
  const { isMobile, isTablet } = useBreakpoint()
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
  const LABEL_R = isMobile ? OUTER + 10 : OUTER + 16
  const HUB_R = INNER

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative', width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: isMobile ? 220 : 340, overflow: 'visible',
      }}
    >
      <div style={{
        position: 'absolute',
        width: 'min(260px, 70%)', aspectRatio: '1',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,132,255,0.13) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', width: isMobile ? 'min(190px, 68vw)' : isTablet ? 'min(260px, 76vw)' : 'min(300px, 82%)', aspectRatio: '1' }}>
        <svg viewBox={`0 0 ${VB} ${VB}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
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
                <motion.path
                  d={path}
                  fill={w.fill}
                  stroke={w.stroke}
                  strokeWidth="1.5"
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
   LOGO COLUMN (from ProofBand) — vertical scrolling logos
───────────────────────────────────────────────────────────── */
function LogoCard({ logo }: { logo: ClientLogo }) {
  const isExternal = logo.caseStudyUrl?.startsWith('http')
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f4f4f4',
      padding: '20px 16px',
      width: '100%',
      aspectRatio: '1',
      overflow: 'hidden',
      borderRadius: 10,
    }}>
      <div style={{ position: 'relative', width: '100%', height: 56 }}>
        <Image
          src={urlFor(logo.logo).width(480).height(192).url()}
          alt={logo.name}
          fill
          style={{ objectFit: 'contain' }}
          draggable={false}
          sizes="180px"
        />
      </div>
      {logo.caseStudyUrl ? (
        <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          {isExternal ? (
            <a
              href={logo.caseStudyUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'rgba(59,132,255,0.10)',
                color: '#3b84ff',
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 10px',
                borderRadius: 999,
                textDecoration: 'none',
                whiteSpace: 'nowrap' as const,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              Case study &rarr;
            </a>
          ) : (
            <Link
              href={logo.caseStudyUrl}
              style={{
                background: 'rgba(59,132,255,0.10)',
                color: '#3b84ff',
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 10px',
                borderRadius: 999,
                textDecoration: 'none',
                whiteSpace: 'nowrap' as const,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              Case study &rarr;
            </Link>
          )}
        </div>
      ) : (
        <div style={{ height: 20 }} />
      )}
    </div>
  )
}

function LogoColumn({ logos, direction }: { logos: ClientLogo[]; direction: 'up' | 'down' }) {
  const innerRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const rafRef = useRef<number>(0)
  const pausedRef = useRef(false)
  const SPEED = 0.7

  useEffect(() => {
    const inner = innerRef.current
    if (!inner) return
    const getSetHeight = () => inner.scrollHeight / 2
    offsetRef.current = direction === 'down' ? -getSetHeight() : 0
    inner.style.transform = `translateY(${offsetRef.current}px)`

    const tick = () => {
      const setH = getSetHeight()
      if (setH === 0) { rafRef.current = requestAnimationFrame(tick); return }
      if (!pausedRef.current) {
        if (direction === 'up') {
          offsetRef.current -= SPEED
          if (offsetRef.current <= -setH) offsetRef.current += setH
        } else {
          offsetRef.current += SPEED
          if (offsetRef.current >= 0) offsetRef.current -= setH
        }
        inner.style.transform = `translateY(${offsetRef.current}px)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [direction, logos.length])

  const items = [...logos, ...logos]

  return (
    <div style={{ position: 'relative', overflow: 'hidden', height: 480 }}>
      <div
        ref={innerRef}
        style={{ display: 'flex', flexDirection: 'column', gap: 10, willChange: 'transform' }}
        onMouseEnter={() => { pausedRef.current = true }}
        onMouseLeave={() => { pausedRef.current = false }}
      >
        {items.map((logo, i) => (
          <LogoCard key={`${logo._id}-${i}`} logo={logo} />
        ))}
      </div>
      <div style={{
        pointerEvents: 'none', position: 'absolute', inset: '0 0 auto 0', height: 60, zIndex: 10,
        background: 'linear-gradient(to bottom, #140f0c, transparent)',
      }} />
      <div style={{
        pointerEvents: 'none', position: 'absolute', inset: 'auto 0 0 0', height: 60, zIndex: 10,
        background: 'linear-gradient(to top, #140f0c, transparent)',
      }} />
    </div>
  )
}


function MobileLogoCarousel({ logos }: { logos: ClientLogo[] }) {
  const railRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const offsetRef = useRef(0)
  const pausedRef = useRef(false)
  const items = logos.length ? [...logos, ...logos, ...logos] : []

  useEffect(() => {
    const rail = railRef.current
    if (!rail || items.length === 0) return
    const tick = () => {
      if (!pausedRef.current) {
        offsetRef.current -= 0.55
        const resetAt = rail.scrollWidth / 3
        if (resetAt > 0 && Math.abs(offsetRef.current) >= resetAt) offsetRef.current += resetAt
        rail.style.transform = `translateX(${offsetRef.current}px)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [items.length])

  if (!items.length) return null

  return (
    <div
      style={{ position: 'relative', width: '100%', overflow: 'hidden', padding: '4px 0' }}
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false }}
      onTouchStart={() => { pausedRef.current = true }}
      onTouchEnd={() => { pausedRef.current = false }}
      aria-label="Client logo carousel"
    >
      <div ref={railRef} style={{ display: 'flex', gap: 12, willChange: 'transform' }}>
        {items.map((logo, i) => (
          <div key={`${logo._id}-${i}`} style={{ flex: '0 0 148px' }}>
            <LogoCard logo={logo} />
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 40, pointerEvents: 'none', background: `linear-gradient(to right, ${C.bg}, transparent)` }} aria-hidden="true" />
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 40, pointerEvents: 'none', background: `linear-gradient(to left, ${C.bg}, transparent)` }} aria-hidden="true" />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   LARGE STAT COUNT
───────────────────────────────────────────────────────────── */
function LargeStatCount({ value, prefix = '', suffix = '', color }: {
  value: number; prefix?: string; suffix?: string; color: string
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
    <div
      ref={ref}
      style={{
        fontSize: 'clamp(3.5rem,10vw,7.5rem)',
        fontWeight: 900, lineHeight: 1,
        letterSpacing: '-0.04em',
        color: C.text, margin: 0,
      }}
      aria-label={`${prefix}${value}${suffix}`}
    >
      {prefix}{count}<span style={{ color }}>{suffix}</span>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
export default function WhyPurefactsClient({ logos = [] }: { logos?: ClientLogo[] }) {
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '56px 0' : 'clamp(4rem,6vw,6rem) 0'
  const heroPad = isMobile ? '40px 0 48px' : 'clamp(4rem, 7vw, 6rem) 0 clamp(3rem, 5vw, 4.5rem)'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 clamp(1.5rem,5vw,3rem)'
  const twoCols = isTablet ? '1fr' : 'repeat(2, minmax(0, 1fr))'
  const problemCols = isTablet ? '1fr' : 'repeat(2, minmax(0, 1fr))'
  const caseCols = isTablet ? '1fr' : 'minmax(0, 1fr) minmax(0, 1.4fr)'
  const sectionGap = isMobile ? '28px' : isTablet ? '36px' : 'clamp(2.5rem,5vw,5rem)'

  // Split logos into 3 columns, with fallback padding
  const pad = (arr: ClientLogo[]): ClientLogo[] => {
    if (arr.length === 0) return logos.slice(0, 4)
    let out = [...arr]
    while (out.length < 4) out = [...out, ...arr]
    return out
  }
  const col1 = pad(logos.filter((_, i) => i % 3 === 0))
  const col2 = pad(logos.filter((_, i) => i % 3 === 1))
  const col3 = pad(logos.filter((_, i) => i % 3 === 2))

  return (
    <>
      <style>{`
        .wpf-cta-row {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          padding: 20px 0;
          border-bottom: 1px solid ${C.border};
        }
        .wpf-cta-row:last-child {
          border-bottom: none;
        }
      `}</style>

      {/* ══════════════════════════════════
          1. HERO
      ══════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: C.bg,
          padding: heroPad,
        }}
        aria-label="Why PureFacts: revenue engineered for growth"
      >
        <HeroCanvas />

        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 90% at 28% 50%, rgba(20,15,12,0.90) 0%, rgba(20,15,12,0.60) 50%, transparent 100%)',
        }} />

        <div aria-hidden="true" style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, pointerEvents: 'none',
          background: `linear-gradient(to bottom, transparent, ${C.bg})`,
        }} />

        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: 1280, width: '100%',
          margin: '0 auto',
          padding: innerPad, boxSizing: 'border-box',
        }}>
          <div style={{ maxWidth: 680 }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Eyebrow color={C.mandarin}>Why PureFacts</Eyebrow>
            </motion.div>

            <h1 style={{
              fontSize: 'clamp(2.25rem, 5vw, 4rem)',
              fontWeight: 700, color: C.text, lineHeight: 1.05,
              letterSpacing: '-0.028em', margin: 0,
            }}>
              <motion.span
                style={{ display: 'block' }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                Revenue, Engineered For
              </motion.span>
              <motion.span
                style={{ display: 'block' }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <GradientText>Growth and Scale</GradientText>
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.75 }}
              style={{ marginTop: 24, fontSize: 18, color: C.body, lineHeight: 1.75, maxWidth: 520 }}
            >
              PureFacts is the only enterprise-grade revenue management platform
              built to optimize fee billing, compensation, and practice management 
              for global wealth and asset management firms.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.95 }}
              style={{ marginTop: 36, display: 'flex', gap: 12, flexWrap: 'wrap' as const }}
            >
              <Link href="/contact" className="btn-primary">Get in contact</Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          2. THE PROBLEM
      ══════════════════════════════════ */}
      <section
        style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }}
        aria-label="The revenue management problem"
      >
        <div aria-hidden="true" style={{
          position: 'absolute', top: '10%', right: '0%',
          width: 600, height: 500, pointerEvents: 'none',
          background: 'radial-gradient(ellipse, rgba(251,86,7,0.06) 0%, transparent 60%)',
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: '0%', left: '5%',
          width: 500, height: 400, pointerEvents: 'none',
          background: 'radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 60%)',
        }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad, boxSizing: 'border-box' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: problemCols,
            gap: sectionGap,
            alignItems: 'center',
          }}>
            <div>
              <Reveal>
                <Eyebrow color={C.mandarin}>The Problem</Eyebrow>
                <h2 style={{
                  fontSize: 'clamp(1.65rem,7vw,2.6rem)', fontWeight: 700, color: C.text,
                  letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0, overflowWrap: 'anywhere',
                }}>
                  Revenue Systems Were Never Designed For{' '}
                  <span style={{ color: C.azure }}>Today&rsquo;s Reality</span>
                </h2>
              </Reveal>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 22 }}>
                {[
                  'Most revenue environments were assembled, not designed. Fee billing, advisor compensation, pricing, and incentives operate across disconnected systems, each optimized locally but misaligned globally.',
                  'That architecture was sufficient when complexity was manageable and scrutiny was lower. It no longer is sustainable.',
                  'Today, revenue accuracy affects margin. Transparency affects trust. Control affects regulatory confidence. Revenue is no longer just a back-office outcome. It has become a strategic lever.',
                  'PureFacts exists because the market never had a platform built to manage revenue as an enterprise discipline.',
                ].map((p, i) => (
                  <Reveal key={i} delay={i * 70}>
                    <p style={{ fontSize: 16, color: C.body, lineHeight: 1.75, margin: 0 }}>{p}</p>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal delay={100}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: 8 }}>
                <FragmentedSystemsGraphic />
                <p style={{
                  textAlign: 'center', fontSize: 11, color: C.subtle,
                  letterSpacing: '0.12em', textTransform: 'uppercase' as const,
                  fontWeight: 600, padding: '8px 0 12px', margin: 0,
                }}>
                  Disconnected systems, misaligned outcomes
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          3. WHY REVENUE LEADERS CHOOSE PUREFACTS
          Two-column: left = heading + expanded copy,
          right = platform diagram
      ══════════════════════════════════ */}
      <section
        style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }}
        aria-label="Why revenue leaders choose PureFacts"
      >
        <div aria-hidden="true" style={{
          position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)',
          width: 900, height: 400, pointerEvents: 'none',
          background: 'radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 60%)',
        }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad, boxSizing: 'border-box' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: problemCols,
            gap: isMobile ? '28px' : isTablet ? '36px' : 'clamp(3rem,6vw,6rem)',
            alignItems: 'center',
          }}>
            {/* Left: heading + expanded copy */}
            <div>
              <Reveal>
                <Eyebrow color={C.mandarin}>Why PureFacts</Eyebrow>
                <h2 style={{
                  fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text,
                  letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0,
                }}>
                  Why Revenue Leaders{' '}
                  <span style={{ color: C.azure }}>Choose PureFacts</span>
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <p style={{ marginTop: 22, fontSize: 16, color: C.body, lineHeight: 1.8 }}>
                  PureFacts connects fee billing, advisor compensation, and practice management
                  into a single operating system built on a Revenue Book of Record. Every
                  calculation is explainable and auditable, pricing operates within controlled
                  guardrails, and exceptions are governed before they become disputes.
                </p>
              </Reveal>
              <Reveal delay={130}>
                <p style={{ marginTop: 14, fontSize: 16, color: C.body, lineHeight: 1.8 }}>
                  Trusted across $15T+ in assets under administration, it is the enterprise-grade
                  control wealth and asset management firms need to protect yield and grow
                  with confidence.
                </p>
              </Reveal>
              <Reveal delay={220}>
                <div style={{ marginTop: 32 }}>
                  <Link href="/platform" className="btn-primary">See the platform</Link>
                </div>
              </Reveal>
            </div>

            {/* Right: platform diagram */}
            <Reveal delay={100}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <PlatformDiagram />
                <p style={{
                  textAlign: 'center', fontSize: 11, color: C.subtle,
                  letterSpacing: '0.12em', textTransform: 'uppercase' as const,
                  fontWeight: 600, marginTop: 8, marginBottom: 0,
                }}>
                  One operating system for revenue
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          4. COST OF INACTION
      ══════════════════════════════════ */}
      <section
        style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }}
        aria-label="The cost of legacy revenue systems"
      >
        <div aria-hidden="true" style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: 900, height: 500, pointerEvents: 'none',
          background: 'radial-gradient(ellipse, rgba(59,132,255,0.07) 0%, transparent 60%)',
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: '0%', left: '0%',
          width: 500, height: 400, pointerEvents: 'none',
          background: 'radial-gradient(ellipse, rgba(251,86,7,0.05) 0%, transparent 60%)',
        }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad, boxSizing: 'border-box' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: caseCols,
            gap: isMobile ? '28px' : 'clamp(2rem,4vw,5rem)',
            alignItems: 'center',
          }}>
            <Reveal>
              <div>
                <LargeStatCount value={13} prefix="$" suffix="M" color={C.text} />
                <p style={{
                  marginTop: 16, fontSize: 11, fontWeight: 700,
                  textTransform: 'uppercase' as const, letterSpacing: '0.18em',
                  color: C.subtle,
                }}>
                  Annual Value Unlocked
                </p>
                
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div>
                {/* Changed to azure */}
                <Eyebrow color={C.azure}>The Cost of Inaction</Eyebrow>
                <h2 style={{
                  fontSize: 'clamp(1.6rem,2.8vw,2.2rem)', fontWeight: 700, color: C.text,
                  letterSpacing: '-0.025em', lineHeight: 1.22, margin: 0,
                }}>
                  Legacy systems and technical debt quietly compound into a strategic liability.
                </h2>
                <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                  The average large enterprise wastes millions every year because
                  disconnected revenue systems slow modernization, introduce errors, and obscure
                  where value is being lost.
                </p>
                <p style={{ marginTop: 14, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                  For wealth and asset management firms, the exposure is structural: fee leakage,
                  compensation disputes, and pricing gaps that compound across every billing cycle.
                </p>
                <div style={{ marginTop: 28 }}>
                  <Link
                    href="/case-study/how-a-leading-wealth-manager-unlocked-over-13m-in-annual-value-by-replacing-legacy-infrastructure"
                    className="btn-primary"
                  >
                    See a real example
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          5. THE SHIFT
          Left: heading + prose (concise)
          Right: scrolling logo carousels
      ══════════════════════════════════ */}
      <section
        style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }}
        aria-label="Trusted by leading financial firms worldwide"
      >
        <div aria-hidden="true" style={{
          position: 'absolute', top: '5%', left: '0%',
          width: 550, height: 450, pointerEvents: 'none',
          background: 'radial-gradient(ellipse, rgba(255,179,12,0.05) 0%, transparent 60%)',
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', top: '5%', right: '5%',
          width: 600, height: 400, pointerEvents: 'none',
          background: 'radial-gradient(ellipse, rgba(59,132,255,0.06) 0%, transparent 60%)',
        }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad, boxSizing: 'border-box' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : twoCols,
            gap: isMobile ? '24px' : 'clamp(2.5rem,5vw,4rem)',
            alignItems: isMobile ? 'start' : 'center',
            width: '100%',
            minWidth: 0,
          }}>
            {/* Left: prose */}
            <div style={{ minWidth: 0, width: '100%' }}>
              <Reveal>
                <Eyebrow color={C.mandarin}>The Shift</Eyebrow>
                <h2 style={{
                  fontSize: isMobile ? 'clamp(1.6rem,7vw,2.1rem)' : 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text,
                  letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0, overflowWrap: 'anywhere', maxWidth: '100%',
                }}>
                  What Changes When Revenue Is Treated{' '}
                  <span style={{ color: C.azure }}>As Infrastructure</span>
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <p style={{ marginTop: 18, fontSize: isMobile ? 15 : 16, color: C.body, lineHeight: 1.75, overflowWrap: 'anywhere', maxWidth: '100%' }}>
                  When revenue is managed as infrastructure rather than assembled from point
                  solutions, pricing and compensation operate within controlled guardrails,
                  exceptions are governed before they become disputes, and every calculation
                  is transparent and explainable.
                </p>
              </Reveal>
              <Reveal delay={130}>
                <p style={{ marginTop: 12, fontSize: isMobile ? 15 : 16, color: C.body, lineHeight: 1.75, overflowWrap: 'anywhere', maxWidth: '100%' }}>
                  The result is audit readiness embedded by design, not retrofitted at
                  year-end, and a revenue environment that global financial firms can
                  rely on every billing cycle.
                </p>
              </Reveal>
              <Reveal delay={180}>
                <p
                  style={{
                    marginTop: 18,
                    marginBottom: 18,
                    fontSize: isMobile ? '1rem' : '1.15rem',
                    fontWeight: 700,
                    color: '#f4f4f4',
                    lineHeight: 1.4,
                  }}
                >
                  Trusted by the world's leading financial organizations
                </p>
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { stat: '$15T+',  label: 'In assets under administration' },
                    { stat: '$3B+',   label: 'In fees calculated annually'    },
                    { stat: '200M+',  label: 'Automated actions per year'     },
                  ].map((item) => (
                    <div key={item.stat} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: C.azure, letterSpacing: '-0.02em', flexShrink: 0 }}>
                        {item.stat}
                      </span>
                      <span style={{ fontSize: 13, color: C.body }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* Right: three scrolling logo columns */}
            <Reveal delay={100}>
              {isMobile ? (
                <div style={{ width: '100%', minWidth: 0, marginTop: 8 }}>
                  <MobileLogoCarousel logos={logos} />
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 10,
                  overflow: 'hidden',
                  width: '100%',
                  minWidth: 0,
                }}>
                  <LogoColumn logos={col1} direction="down" />
                  <LogoColumn logos={col2} direction="up"   />
                  <LogoColumn logos={col3} direction="down" />
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          6. FINAL CTA
      ══════════════════════════════════ */}
      <section
        style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }}
        aria-label="Get a free revenue assessment"
      >
        <div aria-hidden="true" style={{
          position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)',
          width: 1000, height: 600, pointerEvents: 'none',
          background: 'radial-gradient(ellipse, rgba(59,132,255,0.07) 0%, transparent 60%)',
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: '0%', left: '5%',
          width: 500, height: 400, pointerEvents: 'none',
          background: 'radial-gradient(ellipse, rgba(251,86,7,0.05) 0%, transparent 60%)',
        }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad, boxSizing: 'border-box' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isTablet ? '1fr' : 'repeat(2, minmax(0, 1fr))',
            gap: sectionGap,
            alignItems: 'center',
          }}>
            <div>
              {[
                { icon: 'fa-chart-line',   color: C.azure,    title: 'Treat Revenue as Infrastructure', desc: 'Move beyond back-office billing to a platform that manages revenue as an enterprise discipline with guardrails, controls, and full traceability.' },
                { icon: 'fa-scissors',      color: C.mandarin, title: 'Stop Leakage Before It Starts',   desc: 'Pricing exceptions, compensation drift, and billing gaps quietly erode margin. PureFacts closes those gaps systematically.' },
                { icon: 'fa-shield-halved', color: C.honey,    title: 'Audit Readiness Built In',         desc: 'Embedded controls and calculation transparency reduce disputes, satisfy regulators, and give leadership confidence in every number.' },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 70}>
                  <div className="wpf-cta-row">
                    <div style={{
                      width: 44, height: 44, flexShrink: 0,
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start',
                    }}>
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
              <h2 style={{
                fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text,
                letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0,
              }}>
                Understand How Your Revenue Is{' '}
                <GradientText>Really Performing.</GradientText>
              </h2>
              <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                A Revenue Performance Analysis helps quantify where revenue is leaking,
                controls are breaking down, and structural improvements can unlock
                measurable value.
              </p>
              <div style={{ marginTop: 30 }}>
                <Link href="/contact" className="btn-primary">Get a free assessment</Link>
              </div>
              <p style={{ marginTop: 16, fontSize: 13, color: C.subtle }}>
                Trusted by the top global financial firms
              </p>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}