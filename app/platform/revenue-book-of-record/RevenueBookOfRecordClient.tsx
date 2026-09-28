'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const AZURE = '#3b84ff'

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

// ─── Animated counter ─────────────────────────────────────────────────────────
function useCounter(target: number, duration = 1600, start = false) {
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

function IlluminatedHeading({
  white,
  dim,
  className = '',
  azureRanges = [],
}: {
  white: string
  dim: string
  className?: string
  azureRanges?: Array<[number, number]>
}) {
  const ref = useRef<HTMLHeadingElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
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
      {words.map((word, i) => {
        const threshold = i / total
        const raw =
          progress > threshold
            ? Math.min(1, 0.2 + ((progress - threshold) / (1 / total)) * 0.8)
            : 0.2
        const isAzure = azureRanges.some(([start, end]) => i >= start && i <= end)
        return (
          <span
            key={i}
            style={{
              color: isAzure
                ? `rgba(59,132,255,${Math.min(1, raw).toFixed(3)})`
                : `rgba(244,244,244,${Math.min(1, raw).toFixed(3)})`,
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

// ─── Animated data-stream hero background ────────────────────────────────────
function AnimatedDataStreams() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0, h = 0
    const resize = () => {
      w = canvas.width = canvas.offsetWidth
      h = canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const STREAM_COUNT = 18
    const streams = Array.from({ length: STREAM_COUNT }, (_, i) => ({
      yFrac: (i + 0.5) / STREAM_COUNT,
      speed: 0.18 + (i % 5) * 0.07,
      phase: i * 0.37,
      side: (i % 2 === 0 ? 'left' : 'right') as 'left' | 'right',
      color: ['#FACC22', '#FB5607', '#4760FF', '#0DCCFF', '#3b84ff'][i % 5],
      length: 0.12 + (i % 4) * 0.04,
      opacity: 0.06 + (i % 3) * 0.03,
    }))

    let t = 0

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      const cx = w / 2

      const glow = ctx.createRadialGradient(cx, h * 0.5, 0, cx, h * 0.5, w * 0.4)
      glow.addColorStop(0, 'rgba(71,96,255,0.05)')
      glow.addColorStop(1, 'rgba(71,96,255,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, w, h)

      streams.forEach((s) => {
        const y = s.yFrac * h
        const progress = ((t * s.speed + s.phase) % 1)
        let headX: number
        if (s.side === 'left') {
          headX = progress * cx
        } else {
          headX = w - progress * cx
        }
        const tailX = s.side === 'left'
          ? headX - s.length * cx
          : headX + s.length * cx

        const fadeNear = Math.min(1, (1 - progress) / 0.15)
        const alpha = s.opacity * fadeNear

        const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0')
        const grad = ctx.createLinearGradient(tailX, y, headX, y)
        if (s.side === 'left') {
          grad.addColorStop(0, `${s.color}00`)
          grad.addColorStop(1, `${s.color}${alphaHex}`)
        } else {
          grad.addColorStop(0, `${s.color}${alphaHex}`)
          grad.addColorStop(1, `${s.color}00`)
        }

        ctx.beginPath()
        ctx.moveTo(tailX, y)
        ctx.lineTo(headX, y)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1
        ctx.stroke()

        const dotAlphaHex = Math.round(Math.min(alpha * 3, 0.6) * 255).toString(16).padStart(2, '0')
        ctx.beginPath()
        ctx.arc(headX, y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = `${s.color}${dotAlphaHex}`
        ctx.fill()
      })

      t += 0.004
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
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ display: 'block' }}
      aria-hidden="true"
    />
  )
}

// ─── Gravity Well Diagram ─────────────────────────────────────────────────────
const LEFT_SOURCES = [
  { label: 'Custodians' },
  { label: 'Portfolio Management' },
  { label: 'CRM' },
  { label: 'Trading Platforms' },
]
const RIGHT_SOURCES = [
  { label: 'Accounting Systems' },
  { label: 'Billing Systems' },
  { label: 'Compensation Systems' },
  { label: 'Customer Data Lakes' },
]
const ALL_SOURCES = [...LEFT_SOURCES.map(s => ({ ...s, color: '#3b84ff' })), ...RIGHT_SOURCES.map(s => ({ ...s, color: '#3b84ff' }))]

const SVG_W = 1000
const SVG_H = 480
const CX = 500
const CY = 240
const NODE_R = 72
const COL_GAP = 92
const PILL_ANCHOR_X_LEFT  = 210
const PILL_ANCHOR_X_RIGHT = 790

function pillAnchorY(idx: number) {
  return CY + (idx - 1.5) * COL_GAP
}

function buildCurve(side: 'left' | 'right', idx: number): string {
  const py   = pillAnchorY(idx)
  const px   = side === 'left' ? PILL_ANCHOR_X_LEFT : PILL_ANCHOR_X_RIGHT
  const angle = Math.atan2(py - CY, px - CX)
  const nx   = CX + Math.cos(angle) * NODE_R
  const ny   = CY + Math.sin(angle) * NODE_R
  const midX = (px + nx) / 2
  const cp1x = midX
  const cp1y = py
  const cp2x = midX
  const cp2y = ny
  return `M ${px} ${py} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${nx} ${ny}`
}

function cubicBezierPt(
  p1x: number, p1y: number,
  cp1x: number, cp1y: number,
  cp2x: number, cp2y: number,
  p2x: number, p2y: number,
  bt: number
) {
  const t1 = 1 - bt
  return {
    x: t1*t1*t1*p1x + 3*t1*t1*bt*cp1x + 3*t1*bt*bt*cp2x + bt*bt*bt*p2x,
    y: t1*t1*t1*p1y + 3*t1*t1*bt*cp1y + 3*t1*bt*bt*cp2y + bt*bt*bt*p2y,
  }
}

const PILL_W = 220
const PILL_H = 40

function GravityWell() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)
  const wrapRef   = useRef<HTMLDivElement>(null)
  const { ref: inViewRef, inView } = useInView(0.2)
  const setRef = (el: HTMLDivElement | null) => {
    (wrapRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    (inViewRef as React.MutableRefObject<HTMLDivElement | null>).current = el
  }

  useEffect(() => {
    if (!inView) return
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

    const startTime = Date.now()
    const FILL_DURATION = 1800
    let t = 0

    const getScale = () => {
      const scaleX = w / SVG_W
      const scaleY = h / SVG_H
      const scale  = Math.min(scaleX, scaleY)
      const offsetX = (w - SVG_W * scale) / 2
      const offsetY = (h - SVG_H * scale) / 2
      return { scale, offsetX, offsetY }
    }
    const sx = (x: number) => { const { scale, offsetX } = getScale(); return offsetX + x * scale }
    const sy = (y: number) => { const { scale, offsetY } = getScale(); return offsetY + y * scale }
    const ss = (v: number) => { const { scale } = getScale(); return v * scale }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      const elapsed = Date.now() - startTime
      const fillP = Math.min(1, elapsed / FILL_DURATION)

      const cx = sx(CX), cy = sy(CY)
      const nodeR = ss(NODE_R)

      for (let ring = 3; ring >= 1; ring--) {
        const g = ctx.createRadialGradient(cx, cy, nodeR * 1.05, cx, cy, nodeR * ring * 2.4)
        g.addColorStop(0, `rgba(59,132,255,${0.04 / ring})`)
        g.addColorStop(1, 'rgba(59,132,255,0)')
        ctx.beginPath()
        ctx.arc(cx, cy, nodeR * ring * 2.4, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
      }

      ALL_SOURCES.forEach((src, i) => {
        const side  = i < 4 ? 'left' : 'right'
        const idx   = i < 4 ? i : i - 4
        const py    = sy(pillAnchorY(idx))
        const px    = side === 'left' ? sx(PILL_ANCHOR_X_LEFT) : sx(PILL_ANCHOR_X_RIGHT)
        const angle = Math.atan2(sy(pillAnchorY(idx)) - cy, px - cx)
        const nx    = cx + Math.cos(angle) * nodeR
        const ny    = cy + Math.sin(angle) * nodeR
        const midX  = (px + nx) / 2
        const cp1x  = midX
        const cp1y  = py
        const cp2x  = midX
        const cp2y  = ny

        const dotDelay = i * 0.06
        const dotP = Math.max(0, (fillP - dotDelay) / (1 - dotDelay + 0.01))
        if (dotP < 0.3) return

        for (let d = 0; d < 2; d++) {
          const bt = ((t * 0.55 + i * 0.18 + d * 0.5) % 1)
          const pt = cubicBezierPt(px, py, cp1x, cp1y, cp2x, cp2y, nx, ny, bt)
          const alpha = Math.min(dotP, 0.85)

          const glowR = ss(10)
          const dotR  = ss(3)
          const glow = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, glowR)
          glow.addColorStop(0, `${src.color}${Math.round(alpha * 0.6 * 255).toString(16).padStart(2,'00')}`)
          glow.addColorStop(1, `${src.color}00`)
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, glowR, 0, Math.PI * 2)
          ctx.fillStyle = glow
          ctx.fill()

          ctx.beginPath()
          ctx.arc(pt.x, pt.y, dotR, 0, Math.PI * 2)
          ctx.fillStyle = `${src.color}${Math.round(alpha * 255).toString(16).padStart(2,'00')}`
          ctx.fill()
        }
      })

      ctx.beginPath()
      ctx.arc(cx, cy, nodeR, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(18,13,11,1)'
      ctx.fill()

      const glowP = Math.max(0, (fillP - 0.6) / 0.4)
      if (glowP > 0) {
        const lg = ctx.createRadialGradient(cx, cy, 0, cx, cy, nodeR * 0.85)
        lg.addColorStop(0, `rgba(59,132,255,${0.18 * glowP})`)
        lg.addColorStop(0.5, `rgba(59,132,255,${0.08 * glowP})`)
        lg.addColorStop(1, `rgba(59,132,255,0)`)
        ctx.beginPath()
        ctx.arc(cx, cy, nodeR * 0.85, 0, Math.PI * 2)
        ctx.fillStyle = lg
        ctx.fill()
      }

      for (let p = 0; p < 3; p++) {
        const pulseT = ((t * 0.35 + p * 0.33) % 1)
        const pulseA = (1 - pulseT) * 0.12 * glowP
        ctx.beginPath()
        ctx.arc(cx, cy, nodeR * (1 + pulseT * 0.9), 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(59,132,255,${pulseA})`
        ctx.lineWidth = ss(1)
        ctx.stroke()
      }

      ctx.beginPath()
      ctx.arc(cx, cy, nodeR, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(59,132,255,${(0.75 * fillP).toFixed(3)})`
      ctx.lineWidth = ss(1.5)
      ctx.stroke()

      t += 0.012
      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [inView])

  return (
    <div
      ref={setRef}
      className="relative mx-auto w-full"
      style={{ maxWidth: '960px' }}
      aria-label="Data sources flowing into Revenue Book of Record"
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full"
        style={{ display: 'block', overflow: 'visible' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {ALL_SOURCES.map((src, i) => {
            const side = i < 4 ? 'left' : 'right'
            const gradId = `lg-${i}`
            return (
              <linearGradient
                key={gradId}
                id={gradId}
                gradientUnits="userSpaceOnUse"
                x1={side === 'left' ? PILL_ANCHOR_X_LEFT : PILL_ANCHOR_X_RIGHT}
                y1={pillAnchorY(i < 4 ? i : i - 4)}
                x2={CX}
                y2={CY}
              >
                <stop offset="0%"   stopColor={src.color} stopOpacity="0.12" />
                <stop offset="55%"  stopColor={src.color} stopOpacity="0.28" />
                <stop offset="100%" stopColor={src.color} stopOpacity="0.04" />
              </linearGradient>
            )
          })}
        </defs>

        {ALL_SOURCES.map((src, i) => {
          const side = i < 4 ? 'left' : 'right'
          const idx  = i < 4 ? i : i - 4
          return (
            <path
              key={src.label}
              d={buildCurve(side, idx)}
              fill="none"
              stroke={`url(#lg-${i})`}
              strokeWidth="1.5"
            />
          )
        })}

        {LEFT_SOURCES.map((src, idx) => {
          const py = pillAnchorY(idx)
          return (
            <foreignObject
              key={src.label}
              x={PILL_ANCHOR_X_LEFT - PILL_W}
              y={py - PILL_H / 2}
              width={PILL_W}
              height={PILL_H}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                <span style={{
                  color: '#3b84ff',
                  background: 'rgba(59,132,255,0.10)',
                  border: '1px solid rgba(59,132,255,0.28)',
                  padding: '5px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>
                  {src.label}
                </span>
              </div>
            </foreignObject>
          )
        })}

        {RIGHT_SOURCES.map((src, idx) => {
          const py = pillAnchorY(idx)
          return (
            <foreignObject
              key={src.label}
              x={PILL_ANCHOR_X_RIGHT}
              y={py - PILL_H / 2}
              width={PILL_W}
              height={PILL_H}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%' }}>
                <span style={{
                  color: '#3b84ff',
                  background: 'rgba(59,132,255,0.10)',
                  border: '1px solid rgba(59,132,255,0.28)',
                  padding: '5px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>
                  {src.label}
                </span>
              </div>
            </foreignObject>
          )
        })}

      </svg>

      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />

      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 10 }}
        aria-hidden="true"
      >
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#f4f4f4',
          lineHeight: 1.35,
          textAlign: 'center',
          display: 'block',
          letterSpacing: '0.02em',
        }}>
          Revenue Book<br />of Record
        </span>
      </div>
    </div>
  )
}

// ─── Fragmentation stats ──────────────────────────────────────────────────────
const FRAG_STATS = [
  { target: 73, suffix: '%', label: 'of wealth firms report revenue leakage from fragmented data sources', color: AZURE },
  { target: 6,  suffix: '+', label: 'disconnected systems the average firm uses to manage revenue end-to-end', color: AZURE },
  { target: 40, suffix: '%', label: 'of finance team time spent reconciling data that should already agree', color: AZURE },
]

function AnimatedStat({ stat, index, inView }: { stat: typeof FRAG_STATS[0]; index: number; inView: boolean }) {
  const count = useCounter(stat.target, 1600, inView)
  return (
    <div
      className="flex items-start gap-5 px-5 py-5 transition-all duration-700"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateX(0)' : 'translateX(20px)',
        transitionDelay: `${index * 100}ms`,
      }}
    >
      <span className="shrink-0 text-3xl font-black tabular-nums sm:text-4xl" style={{ color: stat.color }}>
        {inView ? count : 0}{stat.suffix}
      </span>
      <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'rgba(244,244,244,0.52)' }}>
        {stat.label}
      </p>
    </div>
  )
}

// ─── Glass card ───────────────────────────────────────────────────────────────
function GlassCard({
  title, body, tags, icon, color, wide, delay, inView,
}: {
  title: string; body: string; tags: string[] | null; icon: string; color: string
  wide: boolean; delay: number; inView: boolean
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="group relative overflow-hidden transition-all duration-700"
      style={{
        flex: wide ? '2 1 0%' : '1 1 0%',
        minHeight: '200px',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transitionDelay: `${delay}ms`,
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${hovered ? `${color}35` : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '0px',
        boxShadow: hovered
          ? `0 8px 40px ${color}0e, 0 0 0 1px ${color}18, inset 0 1px 0 rgba(255,255,255,0.08)`
          : 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="absolute left-0 top-0 h-px transition-all duration-500" style={{ background: `linear-gradient(to right, ${color}, transparent)`, width: hovered ? '100%' : '35%' }} aria-hidden="true" />
      <div className="pointer-events-none absolute -top-8 left-0 h-28 w-full opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `radial-gradient(ellipse 50% 90% at 30% 0%, ${color}0c, transparent)` }} aria-hidden="true" />
      <div className="relative p-6 sm:p-9">
        {/* icon — no background, left-aligned */}
        <div
          className="mb-5 flex h-5 w-10 items-start justify-start transition-all duration-300"
          aria-hidden="true"
        >
          <i className={`fa-solid ${icon} text-base`} style={{ color }} />
        </div>
        <h3 className="mb-3 text-lg font-bold sm:text-xl" style={{ color: '#f4f4f4' }}>{title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(244,244,244,0.52)' }}>{body}</p>
        {tags && (
          <div className="mt-5 flex flex-wrap gap-2">
            {tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 text-[10px] font-bold tracking-widest" style={{ background: `${color}12`, border: `1px solid ${color}2e`, color }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Pillars mosaic ───────────────────────────────────────────────────────────
const PILLARS = [
  {
    title: 'Data Unification',
    body: 'Aggregate and normalize revenue-related data from custodians, CRMs, pricing tools, and legacy systems into a single canonical commercial model. One governed source of truth from intake to export.',
    tags: ['CANONICAL MODEL', 'NORMALIZED', 'GOVERNED'],
    icon: 'fa-layer-group',
    color: AZURE,
    wide: true,
  },
  {
    title: 'Calculation Authority',
    body: 'Standardize revenue calculations across all systems and use cases. Consistent logic applied at every layer: fees, compensation, entitlements, and more.',
    icon: 'fa-square-root-variable',
    color: AZURE,
    wide: false,
    tags: null,
  },
  {
    title: 'Explainability by Design',
    body: 'Every calculation is traceable, timestamped, and auditable. Finance teams can prove every number, back to the source data that produced it.',
    icon: 'fa-magnifying-glass-chart',
    color: AZURE,
    wide: false,
    tags: null,
  },
  {
    title: 'Built for Scale',
    body: 'Handle growing volume and complexity without sacrificing accuracy, control, or performance. Temporal versioning keeps historical integrity intact as your business evolves.',
    icon: 'fa-chart-line',
    color: AZURE,
    wide: true,
    tags: null,
  },
]

function PillarsMosaic() {
  const { ref, inView } = useInView(0.1)
  return (
    <div ref={ref} className="mx-auto max-w-7xl px-6">
      <div className="flex flex-col gap-4 lg:flex-row">
        {PILLARS.slice(0, 2).map((p, i) => (
          <GlassCard key={p.title} {...p} delay={i * 80} inView={inView} />
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row">
        {PILLARS.slice(2, 4).map((p, i) => (
          <GlassCard key={p.title} {...p} delay={160 + i * 80} inView={inView} />
        ))}
      </div>
    </div>
  )
}

// ─── Capability selector ──────────────────────────────────────────────────────
const CAPABILITIES = [
  {
    id: 'unification',
    title: 'Data Normalization',
    subtitle: 'One canonical model. Zero spreadsheet bridges.',
    tag: '01',
    body: 'Ingest and normalize data from custodians, portfolio systems, CRMs, and legacy billing engines into a unified commercial data model. Eliminate the spreadsheet bridges and silent reconciliation failures.',
    points: ['Multi-source ingestion', 'Canonical data model', 'Automated validation', 'Exception flagging'],
    color: '#FACC22',
  },
  {
    id: 'pricing',
    title: 'Pricing Authority',
    subtitle: 'One source of pricing truth across every product and geography.',
    tag: '02',
    body: 'Establish a single source of pricing truth across all products, clients, and geographies. Configurable fee schedules, tiered structures, and complex pricing logic governed in one place.',
    points: ['Fee schedules and tiers', 'Multi-currency support', 'Product catalog governance', 'Pricing change history'],
    color: '#FB5607',
  },
  {
    id: 'entitlements',
    title: 'Entitlements Engine',
    subtitle: 'Every client gets exactly what they contracted for.',
    tag: '03',
    body: 'Define and enforce commercial entitlements across the client base. Ensure every client receives exactly what they are contracted for, with automatic detection of over- and under-delivery.',
    points: ['Contract entitlements', 'Entitlement enforcement', 'Over/under-delivery detection', 'Exception workflows'],
    color: '#4760FF',
  },
  {
    id: 'exceptions',
    title: 'Exception Management',
    subtitle: 'Anomalies caught before they reach the ledger.',
    tag: '04',
    body: 'Surface anomalies before they hit the ledger. Configurable tolerance thresholds, break detection, and resolution workflows keep every exception tracked, documented, and closed.',
    points: ['Tolerance thresholds', 'Break detection', 'Resolution workflows', 'Full audit trail'],
    color: '#0DCCFF',
  },
  {
    id: 'calc',
    title: 'Calculation Engine',
    subtitle: 'Traceable logic from raw data to final output.',
    tag: '05',
    body: 'Run revenue calculations with consistent, governed logic across fees, compensation, rebates, and retrocessions. Full traceability from input data to output number, every time.',
    points: ['Fees and compensation', 'Rebates and retrocessions', 'Traceability to source', 'Reprocessing support'],
    color: '#FACC22',
  },
  {
    id: 'intelligence',
    title: 'Commercial Intelligence',
    subtitle: 'Revenue insight that fragmented systems never surface.',
    tag: '06',
    body: 'Transform revenue data into commercial insight. Identify leakage, model margin scenarios, and surface commercial opportunities across the client book that fragmented systems could never reveal.',
    points: ['Leakage identification', 'Margin modeling', 'Commercial opportunity signals', 'BI-ready exports'],
    color: '#FB5607',
  },
]

const AUTOPLAY_DURATION = 4000

function CapabilitySelector() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [fillPct, setFillPct] = useState(0)
  const startRef = useRef<number>(Date.now())
  const rafRef = useRef<number>(0)
  const feat = CAPABILITIES[active]

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
        setActive(a => (a + 1) % CAPABILITIES.length)
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
        <div className="flex flex-col gap-2 lg:w-[45%]" role="tablist" aria-label="RBoR capabilities">
          {CAPABILITIES.map((f, i) => {
            const isActive = active === i
            return (
              <button
                key={f.id}
                onClick={() => goTo(i)}
                onMouseEnter={() => goTo(i)}
                className="relative flex w-full items-center gap-4 overflow-hidden px-5 py-4 text-left transition-all duration-300 sm:px-6 sm:py-5"
                role="tab"
                aria-selected={isActive}
                style={{
                  background: isActive ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: `1px solid ${isActive ? `${f.color}3a` : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: '0px',
                  boxShadow: isActive ? `inset 0 0 20px ${f.color}05` : 'none',
                }}
              >
                {isActive && !paused && (
                  <div
                    className="pointer-events-none absolute bottom-0 left-0 h-[2px]"
                    style={{ width: `${fillPct}%`, background: f.color, boxShadow: `0 0 6px ${f.color}`, transition: 'none' }}
                    aria-hidden="true"
                  />
                )}
                <span className="shrink-0 text-xs font-black tabular-nums tracking-widest" style={{ color: isActive ? f.color : 'rgba(244,244,244,0.18)', minWidth: '24px' }} aria-hidden="true">
                  {f.tag}
                </span>
                <div className="h-5 w-0.5 shrink-0 transition-all duration-300" style={{ background: isActive ? f.color : 'rgba(255,255,255,0.1)', boxShadow: isActive ? `0 0 6px ${f.color}` : 'none' }} aria-hidden="true" />
                <span className="flex-1 text-left">
                  <span className="block text-sm font-semibold transition-colors duration-300" style={{ color: isActive ? '#f4f4f4' : 'rgba(244,244,244,0.42)' }}>
                    {f.title}
                  </span>
                  {isActive && (
                    <span className="mt-0.5 block text-xs leading-snug" style={{ color: `${f.color}bb` }}>
                      {f.subtitle}
                    </span>
                  )}
                </span>
                <span className="ml-auto text-base transition-all duration-300" style={{ color: isActive ? f.color : 'rgba(244,244,244,0.15)', transform: isActive ? 'translateX(3px)' : 'none' }} aria-hidden="true">
                  &rarr;
                </span>
              </button>
            )
          })}
        </div>

        <div className="lg:w-[55%]">
          <div
            className="sticky top-24 relative overflow-hidden transition-all duration-500"
            style={{
              background: 'rgba(26,20,16,0.8)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: `1px solid ${feat.color}20`,
              borderRadius: '0px',
              boxShadow: `0 0 60px ${feat.color}08, inset 0 1px 0 rgba(255,255,255,0.06)`,
              minHeight: '420px',
            }}
          >
            <div className="h-px w-full transition-all duration-500" style={{ background: `linear-gradient(to right, ${feat.color}, ${feat.color}44, transparent)` }} aria-hidden="true" />
            <div className="pointer-events-none absolute inset-0 transition-all duration-700" style={{ background: `radial-gradient(ellipse 70% 60% at 70% 30%, ${feat.color}0c, transparent 70%)` }} aria-hidden="true" />
            <CapabilityGraphic feat={feat} />
          </div>
        </div>
      </div>
    </div>
  )
}

function CapabilityGraphic({ feat }: { feat: typeof CAPABILITIES[0] }) {
  const color = feat.color
  if (feat.id === 'unification') return <UnificationGraphic color={color} />
  if (feat.id === 'pricing') return <PricingGraphic color={color} />
  if (feat.id === 'entitlements') return <EntitlementsGraphic color={color} />
  if (feat.id === 'exceptions') return <ExceptionsGraphic color={color} />
  if (feat.id === 'calc') return <CalcGraphic color={color} />
  return <IntelligenceGraphic color={color} />
}

function UnificationGraphic({ color }: { color: string }) {
  const sources = ['Custodians', 'CRM', 'Billing', 'Portfolio', 'Trading']
  const [active, setActive] = useState<number | null>(null)
  return (
    <div className="relative flex h-full min-h-[420px] flex-col justify-center overflow-hidden p-8">
      <p className="mb-1 text-[10px] font-bold tracking-widest uppercase" style={{ color }}>Data Sources</p>
      <p className="mb-5 text-xs" style={{ color: 'rgba(244,244,244,0.3)' }}>Click a source to see it normalize</p>
      <div className="flex flex-col gap-2">
        {sources.map((src, i) => (
          <button key={src} onClick={() => setActive(active === i ? null : i)} className="flex items-center gap-3 px-4 py-3 text-left transition-all duration-300" style={{ background: active === i ? `${color}14` : 'rgba(255,255,255,0.025)', border: `1px solid ${active === i ? `${color}45` : 'rgba(255,255,255,0.07)'}`, borderRadius: '0px' }}>
            <span className="h-2 w-2 transition-all" style={{ background: active === i ? color : 'rgba(255,255,255,0.2)', boxShadow: active === i ? `0 0 6px ${color}` : 'none' }} />
            <span className="flex-1 text-sm" style={{ color: active === i ? '#f4f4f4' : 'rgba(244,244,244,0.5)' }}>{src}</span>
            {active === i && <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color }}>Normalized</span>}
          </button>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-center gap-3 px-6 py-4 transition-all duration-500" style={{ background: active !== null ? `${color}18` : 'rgba(255,255,255,0.02)', border: `1px solid ${active !== null ? `${color}45` : 'rgba(255,255,255,0.06)'}`, borderRadius: '0px' }}>
        <span className="h-2 w-2" style={{ background: active !== null ? color : 'rgba(255,255,255,0.2)', boxShadow: active !== null ? `0 0 8px ${color}` : 'none' }} />
        <span className="text-sm font-bold" style={{ color: active !== null ? color : 'rgba(244,244,244,0.3)' }}>
          {active !== null ? `${sources[active]} ingested into canonical model` : 'Canonical Commercial Model'}
        </span>
      </div>
      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3" style={{ background: `radial-gradient(ellipse at right, ${color}06, transparent 70%)` }} />
    </div>
  )
}

function PricingGraphic({ color }: { color: string }) {
  const tiers = [
    { label: '< $1M',   rate: '0.85%', basis: 'Standard' },
    { label: '$1–10M',  rate: '0.65%', basis: 'Growth' },
    { label: '$10–50M', rate: '0.45%', basis: 'Premium' },
    { label: '> $50M',  rate: '0.25%', basis: 'Institutional' },
  ]
  const [selected, setSelected] = useState(2)
  const currencies = ['USD', 'GBP', 'EUR', 'JPY']
  const [ccy, setCcy] = useState(0)
  return (
    <div className="relative flex h-full min-h-[420px] flex-col justify-center overflow-hidden p-8">
      <p className="mb-1 text-[10px] font-bold tracking-widest uppercase" style={{ color }}>Fee Schedule</p>
      <p className="mb-4 text-xs" style={{ color: 'rgba(244,244,244,0.3)' }}>Select an AUM bracket</p>
      <div className="mb-4 flex flex-col gap-2">
        {tiers.map((t, i) => (
          <button key={t.label} onClick={() => setSelected(i)} className="flex items-center justify-between px-4 py-2.5 text-left transition-all duration-200" style={{ background: selected === i ? `${color}12` : 'rgba(255,255,255,0.02)', border: `1px solid ${selected === i ? `${color}40` : 'rgba(255,255,255,0.06)'}`, borderRadius: '0px' }}>
            <span className="text-sm" style={{ color: selected === i ? '#f4f4f4' : 'rgba(244,244,244,0.45)' }}>{t.label}</span>
            <span className="text-sm font-bold tabular-nums" style={{ color: selected === i ? color : 'rgba(244,244,244,0.3)' }}>{t.rate}</span>
          </button>
        ))}
      </div>
      <div className="mb-3 px-4 py-3" style={{ background: `${color}0e`, border: `1px solid ${color}30`, borderRadius: '0px' }}>
        <p className="text-[10px] tracking-widest uppercase" style={{ color: 'rgba(244,244,244,0.35)' }}>Active Tier</p>
        <p className="mt-0.5 text-lg font-black" style={{ color }}>{tiers[selected].rate} · {tiers[selected].basis}</p>
      </div>
      <div className="flex gap-2">
        {currencies.map((c, i) => (
          <button key={c} onClick={() => setCcy(i)} className="px-2.5 py-1 text-[10px] font-bold transition-all" style={{ background: ccy === i ? `${color}18` : `${color}08`, border: `1px solid ${ccy === i ? `${color}45` : `${color}20`}`, color: ccy === i ? color : `${color}88`, borderRadius: '0px' }}>{c}</button>
        ))}
      </div>
      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2" style={{ background: `radial-gradient(ellipse at right, ${color}06, transparent 70%)` }} />
    </div>
  )
}

function EntitlementsGraphic({ color }: { color: string }) {
  const rows = [
    { type: 'Research + Advisory', status: 'ok',    pct: 100 },
    { type: 'Advisory Only',       status: 'over',  pct: 118 },
    { type: 'Research Only',       status: 'ok',    pct: 94  },
    { type: 'Full Platform',       status: 'under', pct: 61  },
  ]
  const statusColor = { ok: '#0DCCFF', over: '#FACC22', under: '#FB5607' }
  const [hovered, setHovered] = useState<number | null>(null)
  return (
    <div className="relative flex h-full min-h-[420px] flex-col justify-center overflow-hidden p-8">
      <p className="mb-1 text-[10px] font-bold tracking-widest uppercase" style={{ color }}>Entitlement Monitor</p>
      <p className="mb-5 text-xs" style={{ color: 'rgba(244,244,244,0.3)' }}>Hover a row to inspect</p>
      <div className="flex flex-col gap-3">
        {rows.map((r, i) => {
          const sc = statusColor[r.status as keyof typeof statusColor]
          const isH = hovered === i
          return (
            <div key={r.type} className="cursor-pointer px-4 py-3 transition-all duration-200" style={{ background: isH ? `${sc}0e` : 'rgba(255,255,255,0.025)', border: `1px solid ${isH ? `${sc}35` : 'rgba(255,255,255,0.06)'}`, borderRadius: '0px' }} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm" style={{ color: '#f4f4f4' }}>{r.type}</span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5" style={{ background: `${sc}15`, border: `1px solid ${sc}30`, color: sc, borderRadius: '0px' }}>
                  {r.status === 'ok' ? 'On Track' : r.status === 'over' ? 'Over' : 'Under'}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full transition-all duration-700" style={{ width: `${Math.min(r.pct, 100)}%`, background: sc, boxShadow: `0 0 6px ${sc}` }} />
              </div>
              {isH && <p className="mt-1.5 text-right text-[10px] tabular-nums" style={{ color: sc }}>{r.pct}% of entitlement utilized</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ExceptionsGraphic({ color }: { color: string }) {
  const initial = [
    { id: 'EX-4821', type: 'Fee Mismatch',         sev: 'HIGH',   age: '2m ago'  },
    { id: 'EX-4819', type: 'Missing Rate Card',     sev: 'HIGH',   age: '14m ago' },
    { id: 'EX-4812', type: 'Tolerance Breach',      sev: 'MEDIUM', age: '1h ago'  },
    { id: 'EX-4808', type: 'Duplicate Calculation', sev: 'LOW',    age: '3h ago'  },
  ]
  const sevColor = { HIGH: '#FB5607', MEDIUM: '#FACC22', LOW: '#0DCCFF' }
  const [resolved, setResolved] = useState<string[]>([])
  return (
    <div className="relative flex h-full min-h-[420px] flex-col justify-center overflow-hidden p-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color }}>Exception Queue</p>
          <p className="text-xs" style={{ color: 'rgba(244,244,244,0.3)' }}>Click to resolve</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1" style={{ background: '#FB560715', border: '1px solid #FB560730', borderRadius: '0px' }}>
          <span className="h-1.5 w-1.5" style={{ background: '#FB5607', boxShadow: '0 0 5px #FB5607' }} />
          <span className="text-[10px] font-bold" style={{ color: '#FB5607' }}>{initial.length - resolved.length} OPEN</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {initial.map(ex => {
          const isResolved = resolved.includes(ex.id)
          const sc = sevColor[ex.sev as keyof typeof sevColor]
          return (
            <button key={ex.id} onClick={() => !isResolved && setResolved(r => [...r, ex.id])} className="flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-300" style={{ background: isResolved ? 'rgba(255,255,255,0.015)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isResolved ? 'rgba(255,255,255,0.04)' : `${sc}22`}`, opacity: isResolved ? 0.4 : 1, borderRadius: '0px', cursor: isResolved ? 'default' : 'pointer' }}>
              <span className="h-2 w-2 shrink-0" style={{ background: isResolved ? 'rgba(255,255,255,0.15)' : sc, boxShadow: isResolved ? 'none' : `0 0 5px ${sc}` }} />
              <span className="text-[10px] tabular-nums" style={{ color: 'rgba(244,244,244,0.3)' }}>{ex.id}</span>
              <span className="flex-1 text-xs font-medium" style={{ color: isResolved ? 'rgba(244,244,244,0.3)' : '#f4f4f4' }}>{ex.type}</span>
              <span className="text-[10px] font-bold tracking-wider" style={{ color: isResolved ? 'rgba(255,255,255,0.15)' : sc }}>{isResolved ? 'RESOLVED' : ex.sev}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CalcGraphic({ color }: { color: string }) {
  const [aum, setAum] = useState(48200000)
  const rate = 0.0045
  const days = 92
  const result = (aum * rate * days / 365)
  const fmt = (n: number) => n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : `$${(n/1e3).toFixed(0)}K`
  return (
    <div className="relative flex h-full min-h-[420px] flex-col justify-center overflow-hidden p-8">
      <p className="mb-1 text-[10px] font-bold tracking-widest uppercase" style={{ color }}>Live Calculation</p>
      <p className="mb-6 text-xs" style={{ color: 'rgba(244,244,244,0.3)' }}>Drag to change AUM</p>
      <div className="mb-4 px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0px' }}>
        <p className="mb-3 text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(244,244,244,0.3)' }}>AUM</p>
        <p className="mb-3 text-2xl font-black tabular-nums" style={{ color: '#f4f4f4' }}>{fmt(aum)}</p>
        <input type="range" min={1000000} max={200000000} step={1000000} value={aum} onChange={e => setAum(Number(e.target.value))} className="w-full cursor-pointer appearance-none" style={{ accentColor: color }} />
      </div>
      <div className="mb-3 px-4 py-3" style={{ background: `${color}0a`, border: `1px solid ${color}25`, borderRadius: '0px' }}>
        <p className="mb-1 text-[10px] font-bold tracking-widest uppercase" style={{ color }}>Formula</p>
        <p className="font-mono text-xs" style={{ color: 'rgba(244,244,244,0.5)' }}>AUM × 0.45% × (92 / 365)</p>
      </div>
      <div className="px-4 py-4" style={{ background: `${color}12`, border: `1px solid ${color}40`, borderRadius: '0px' }}>
        <p className="mb-0.5 text-[10px] font-bold tracking-widest uppercase" style={{ color }}>Calculated Fee</p>
        <p className="text-3xl font-black tabular-nums" style={{ color }}>${result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p className="mt-1 text-[10px]" style={{ color: 'rgba(244,244,244,0.3)' }}>Timestamped · Signed · Audit-ready</p>
      </div>
      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3" style={{ background: `radial-gradient(ellipse at right, ${color}06, transparent 70%)` }} />
    </div>
  )
}

function IntelligenceGraphic({ color }: { color: string }) {
  const signals = [
    { type: 'Leakage',     desc: 'Fee gap detected across account group', value: '$88K',   trend: 'warn' as const },
    { type: 'Opportunity', desc: 'Wallet share below contract ceiling',   value: '+$420K', trend: 'up' as const },
    { type: 'Opportunity', desc: 'Add-on product under-penetrated',       value: '+$210K', trend: 'up' as const },
    { type: 'Leakage',     desc: 'Billing lag across multi-entity group', value: '$34K',   trend: 'warn' as const },
  ]
  const [filter, setFilter] = useState<'all' | 'Leakage' | 'Opportunity'>('all')
  const filtered = signals.filter(s => filter === 'all' || s.type === filter)
  const total = filtered.reduce((acc, s) => acc + parseInt(s.value.replace(/[^0-9]/g, '')), 0)
  return (
    <div className="relative flex h-full min-h-[420px] flex-col justify-center overflow-hidden p-8">
      <p className="mb-1 text-[10px] font-bold tracking-widest uppercase" style={{ color }}>Commercial Signals</p>
      <div className="mb-4 flex gap-2">
        {(['all', 'Leakage', 'Opportunity'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className="px-3 py-1 text-[10px] font-bold capitalize transition-all" style={{ background: filter === f ? `${color}18` : 'rgba(255,255,255,0.04)', border: `1px solid ${filter === f ? `${color}45` : 'rgba(255,255,255,0.08)'}`, color: filter === f ? color : 'rgba(244,244,244,0.45)', borderRadius: '0px' }}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {filtered.map((s, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3" style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${color}15`, borderRadius: '0px' }}>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: s.trend === 'warn' ? '#FACC22' : color }}>{s.type}</span>
              <p className="mt-0.5 text-xs leading-relaxed" style={{ color: 'rgba(244,244,244,0.5)' }}>{s.desc}</p>
            </div>
            <span className="ml-4 shrink-0 text-base font-black tabular-nums" style={{ color: s.trend === 'warn' ? '#FACC22' : color }}>{s.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between px-4 py-3" style={{ background: `${color}0e`, border: `1px solid ${color}30`, borderRadius: '0px' }}>
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'rgba(244,244,244,0.5)' }}>Identified</span>
        <span className="text-xl font-black tabular-nums" style={{ color }}>${total.toLocaleString()}K</span>
      </div>
    </div>
  )
}

// ─── Module cards ─────────────────────────────────────────────────────────────
const C_bg      = '#140f0c'
const C_surface = '#1a1410'
const C_text    = '#f4f4f4'
const C_muted   = 'rgba(244,244,244,0.75)'
const C_border  = 'rgba(255,255,255,0.07)'

const URE_MODULES = [
  {
    id: 'fees',
    name: 'Fees and Billing',
    tagline: 'Fee Management',
    color: '#ED65D0',
    colorMuted: 'rgba(237,101,208,0.09)',
    border: 'rgba(237,101,208,0.28)',
    href: '/platform/fees-and-billing',
    points: ['Complex fee schedule management', 'Automated billing runs at scale', 'Zero tolerance for calculation errors'],
    stat: { value: '$3B+', label: 'fees calculated annually' },
  },
  {
    id: 'comp',
    name: 'Compensation',
    tagline: 'Advisor Compensation',
    color: '#FF006E',
    colorMuted: 'rgba(255,0,110,0.09)',
    border: 'rgba(255,0,110,0.28)',
    href: '/platform/compensation',
    points: ['Sophisticated payout structures', 'Incentive and governance controls', 'Transparency that builds advisor trust'],
    stat: { value: '100%', label: 'payout accuracy' },
  },
  {
    id: 'practice',
    name: 'Practice Management',
    tagline: 'Revenue Intelligence',
    color: '#ffb30c',
    colorMuted: 'rgba(255,179,12,0.09)',
    border: 'rgba(255,179,12,0.28)',
    href: '/platform/practice-management',
    points: ['Pricing gap identification at scale', 'AI-native next-best advisor actions', 'Connected to Revenue Book of Record'],
    stat: { value: 'Real-time', label: 'pricing intelligence' },
  },
]

function ModuleCard({ mod, index, visible }: { mod: typeof URE_MODULES[0]; index: number; visible: boolean }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        minWidth: 220,
        padding: '28px 24px 24px',
        borderRadius: 12,
        border: `1px solid ${hovered ? mod.border : mod.border}`,
        background: hovered ? mod.colorMuted : C_surface,
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.2s, background 0.2s',
        position: 'relative',
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transitionProperty: 'opacity, transform, border-color, background',
        transitionDuration: '0.5s, 0.5s, 0.2s, 0.2s',
        transitionDelay: `${index * 0.1}s, ${index * 0.1}s, 0s, 0s`,
        transitionTimingFunction: 'ease, ease, ease, ease',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: mod.color, marginBottom: 4 }}>{mod.tagline}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: C_text, letterSpacing: '-0.02em' }}>{mod.name}</div>
      </div>
      <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, listStyle: 'none', margin: 0, padding: 0 }}>
        {mod.points.map((pt, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: mod.color, flexShrink: 0 }} aria-hidden="true" />
            <span style={{ fontSize: 13, color: C_muted, lineHeight: 1.55 }}>{pt}</span>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${C_border}`, display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: mod.color, letterSpacing: '-0.03em' }}>{mod.stat.value}</span>
        <span style={{ fontSize: 12, color: C_muted }}>{mod.stat.label}</span>
      </div>
      <Link href={mod.href} style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: mod.color, textDecoration: 'none', opacity: hovered ? 1 : 0.7, transition: 'opacity 0.2s' }}>
        Explore {mod.name}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 6h7M6.5 3l3 3-3 3" stroke={mod.color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </Link>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function RevenueBookOfRecordClient() {
  const [heroVisible, setHeroVisible] = useState(false)
  const { ref: statsRef, inView: statsInView } = useInView(0.2)
  const { ref: modulesRef, inView: modulesInView } = useInView(0.1)

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <main style={{ background: '#140f0c', color: '#f4f4f4' }}>

      {/* ── 1. Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-4 sm:pt-20" style={{ background: '#140f0c' }} aria-label="Revenue Book of Record">
        <AnimatedDataStreams />
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(71,96,255,0.14) 0%, transparent 65%)' }} aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-8 text-center sm:pb-28 sm:pt-20">
          <div className="mb-8 flex justify-center" style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(10px)', transition: 'all 0.6s ease' }}>
            <Image src="/logos/revenue-book-of-record-white.svg" alt="Revenue Book of Record by PureFacts" width={200} height={40} className="h-10 w-auto" />
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-7xl" style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.7s ease 0.1s' }}>
            The Single Source of{' '}
            <br />
            <span style={{ color: AZURE }}>
              Commercial Truth.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed sm:mt-7 sm:text-lg" style={{ color: 'rgba(244,244,244,0.52)', opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.7s ease 0.2s' }}>
            The Revenue Book of Record is the authoritative commercial data layer that
            unifies pricing, entitlements, revenue calculations, and compensation logic
            across the enterprise. It powers the Unified Revenue Engine: eliminating
            leakage, capturing spillage, and enabling data-driven commercial control.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:mt-10" style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.7s ease 0.3s' }}>
            <Link href="/contact" className="btn-primary">Book a Demo</Link>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32" style={{ background: 'linear-gradient(to bottom, transparent, #140f0c)' }} aria-hidden="true" />
      </section>

      {/* ── 2. The Gravity Well ───────────────────────────────── */}
      <section className="relative py-16 sm:py-24" style={{ background: '#140f0c' }} aria-label="Revenue Book of Record data architecture">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: '800px', height: '600px', background: 'radial-gradient(ellipse, rgba(59,132,255,0.08) 0%, rgba(59,132,255,0.02) 50%, transparent 70%)', filter: 'blur(80px)' }} />
        </div>
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mb-8 text-center sm:mb-10">
            <p className="mb-3 text-xs font-bold tracking-widest uppercase" style={{ color: AZURE }}>The Architecture</p>
            <h2 className="text-2xl font-bold sm:text-3xl lg:text-5xl" style={{ color: '#f4f4f4' }}>Everything Flows Through <span style={{ color: AZURE }}>One Layer</span></h2>
            <p className="mx-auto mt-4 max-w-xl text-base sm:mt-5" style={{ color: 'rgba(244,244,244,0.42)' }}>
              Fragmented data sources converge into a single authoritative commercial foundation, powering every revenue operation downstream.
            </p>
          </div>
          <GravityWell />
        </div>
      </section>

      {/* ── 3. Fragmentation problem ──────────────────────────── */}
      <section className="py-16 sm:py-24" style={{ background: '#140f0c' }} aria-label="Revenue fragmentation problem">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-3 text-xs font-bold tracking-widest uppercase" style={{ color: AZURE }}>The Problem</p>
          <IlluminatedHeading white="Revenue fragmentation is not" dim="a data problem. It is a risk." azureRanges={[[9, 10]]} className="mb-10 max-w-4xl text-2xl font-bold sm:mb-12 sm:text-3xl lg:text-4xl" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-base leading-relaxed" style={{ color: 'rgba(244,244,244,0.6)' }}>
                Revenue in wealth and asset management is managed through a patchwork of custodial datasets, accounting systems, pricing spreadsheets, product catalogs, legacy billing engines, and human workarounds. This fragmentation creates revenue leakage, inconsistent pricing, compliance exposure, margin erosion, and opaque commercial governance.
              </p>
              <div className="mt-8 border-l-2 py-4 pl-5" style={{ borderColor: AZURE }}>
                <p className="text-base font-semibold leading-relaxed" style={{ color: 'rgba(244,244,244,0.85)' }}>
                  When revenue lacks a single source of truth, risk, leakage, and ambiguity become embedded in the business.
                </p>
              </div>
            </div>
            <div ref={statsRef} className="flex flex-col gap-4">
              {FRAG_STATS.map((stat, i) => (
                <AnimatedStat key={stat.target} stat={stat} index={i} inView={statsInView} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Pillars mosaic ─────────────────────────────────── */}
      <section className="py-16 sm:py-24" style={{ background: '#140f0c' }} aria-label="RBoR pillars">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-3 text-xs font-bold tracking-widest uppercase" style={{ color: AZURE }}>What It Delivers</p>
          <IlluminatedHeading white="Built to be the backbone" dim="of your revenue engine" azureRanges={[[7, 8]]} className="mb-10 text-2xl font-bold sm:mb-12 sm:text-3xl lg:text-4xl" />
        </div>
        <PillarsMosaic />
      </section>

      {/* ── 5. Capability selector ────────────────────────────── */}
      <section className="py-16 sm:py-24" style={{ background: '#140f0c' }} aria-label="RBoR capabilities">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-3 text-xs font-bold tracking-widest uppercase" style={{ color: AZURE }}>Platform Capabilities</p>
          <IlluminatedHeading white="Six layers that make" dim="commercial truth possible" className="mb-12 text-2xl font-bold sm:mb-16 sm:text-3xl lg:text-4xl" />
        </div>
        <CapabilitySelector />
      </section>

      {/* ── 6. Unified Revenue Engine — standardized module cards */}
      <section className="py-16 sm:py-24" style={{ background: '#140f0c' }} aria-label="Unified Revenue Engine">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-3 text-xs font-bold tracking-widest uppercase" style={{ color: AZURE }}>Powered By RBoR</p>
          <h2 className="mb-4 text-2xl font-bold sm:text-3xl lg:text-4xl" style={{ color: '#f4f4f4' }}>The Unified Revenue Engine</h2>
          <p className="mb-10 max-w-xl text-base" style={{ color: 'rgba(244,244,244,0.42)' }}>One engine. Multiple outcomes. Total precision.</p>
          <div ref={modulesRef} style={{ display: 'flex', flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
            {URE_MODULES.map((mod, i) => (
              <ModuleCard key={mod.id} mod={mod} index={i} visible={modulesInView} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. CTA band ───────────────────────────────────────── */}
      <section className="bg-[#140f0c] py-16 sm:py-24" aria-label="Get started with Revenue Book of Record">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
            <div className="flex flex-col gap-6 sm:gap-8 lg:w-1/2">
              {[
                { icon: 'fa-database',               iconColor: '#FACC22', title: 'One Source of Truth',        desc: 'Unify pricing, entitlements, calculations, and compensation logic in a single governed data layer. No more reconciling systems that should already agree.' },
                { icon: 'fa-magnifying-glass-chart',  iconColor: '#FB5607', title: 'Eliminate Leakage',          desc: 'Detect and close revenue gaps across fees, compensation, and entitlements that fragmented systems leave permanently invisible.' },
                { icon: 'fa-shield-halved',           iconColor: '#0DCCFF', title: 'Compliance-Ready by Design', desc: 'Full audit trail from data intake to calculation output. Every number traceable, every decision documented.' },
              ].map(({ icon, iconColor, title, desc }) => (
                <div key={title} className="flex items-start gap-4 sm:gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-start justify-start" aria-hidden="true">
                    <i className={`fa-solid ${icon} text-lg`} style={{ color: iconColor }} />
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
                Ready to Build Your{' '}
                <span style={{ background: 'linear-gradient(135deg, #FACC22, #FB5607, #4760FF, #0DCCFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Commercial Foundation?
                </span>
              </h2>
              <p className="mt-4 text-base leading-relaxed" style={{ color: 'rgba(244,244,244,0.52)' }}>
                Join the world&apos;s most sophisticated finance teams building their commercial truth layer with PureFacts.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 sm:mt-8">
                <Link href="/contact" className="btn-alt">Book a Demo</Link>
              </div>
              <p className="mt-5 text-sm" style={{ color: 'rgba(244,244,244,0.3)' }}>
                Trusted by the world&apos;s top financial institutions
              </p>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}