'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import LogoCarousel, { type ClientLogo } from '@/components/sections/LogoCarousel'
import { urlFor } from '@/lib/sanity/client'

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
   REVENUE LIFT CHART VISUAL
   Animation sequence:
   0–1800ms  : bars pop in staggered, blue only (mild YoY growth)
   1800–2500ms: pause — user reads the baseline
   2500ms    : toggle flips gray→orange ("With PureFacts")
   2600–4000ms: orange lift segments rise on years 3–6
   4000ms+   : lift badge fades in, animation idles
───────────────────────────────────────────────────────────── */
function RevenueChartVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  type Phase = 'bars' | 'pause' | 'lift' | 'done'
  const stateRef = useRef<{
    phase: Phase
    phaseStart: number
    barProgress: number[]
    liftProgress: number[]
    toggleActive: boolean
    badgeOpacity: number
  }>({
    phase: 'bars',
    phaseStart: 0,
    barProgress: [0, 0, 0, 0, 0, 0],
    liftProgress: [0, 0, 0, 0],
    toggleActive: false,
    badgeOpacity: 0,   // ← add this
  })


  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = 0, H = 0
    const DPR = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1

    // Bar heights (fraction of chart area) and lift on top
    const BASE  = [0.36, 0.42, 0.48, 0.53, 0.57, 0.61]
    const LIFT  = [0,    0,    0.14, 0.19, 0.23, 0.28]
    const LABELS = ['Yr 1', 'Yr 2', 'Yr 3', 'Yr 4', 'Yr 5', 'Yr 6']

    const AZURE    = '#3b84ff'
    const MANDARIN = '#fb5607'
    const HONEY    = '#facc22'
    const SUBTLE   = 'rgba(244,244,244,0.30)'
    const GRID     = 'rgba(255,255,255,0.055)'

    function ha(hex: string, a: number) {
      return `${hex}${Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0')}`
    }
    function easeOut3(t: number) { return 1 - Math.pow(1 - t, 3) }
    function easeOutBack(t: number) {
      const c1 = 1.20158, c3 = c1 + 1
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
    }

    function init() {
      W = canvas!.offsetWidth
      H = canvas!.offsetHeight
      canvas!.width  = Math.round(W * DPR)
      canvas!.height = Math.round(H * DPR)
      ctx!.scale(DPR, DPR)
    }

    function draw(now: number) {
      const s = stateRef.current
      if (s.phaseStart === 0) s.phaseStart = now

      ctx!.clearRect(0, 0, W, H)

      // ── Layout ──
      const PAD_L   = 14
      const PAD_R   = 16
      const PAD_TOP = 36
      const PAD_BOT = 44
      const chartW  = W - PAD_L - PAD_R
      const chartH  = H - PAD_TOP - PAD_BOT
      const N       = 6
      const groupW  = chartW / N
      const barW    = groupW * 0.54
      const barGap  = (groupW - barW) / 2

      // ── Grid lines ──
      const GRID_LINES = 4
      ctx!.strokeStyle = GRID
      ctx!.lineWidth = 1
      for (let i = 0; i <= GRID_LINES; i++) {
        const y = PAD_TOP + (chartH / GRID_LINES) * i
        ctx!.beginPath()
        ctx!.moveTo(PAD_L, y)
        ctx!.lineTo(W - PAD_R, y)
        ctx!.stroke()
      }

      // ── Phase transitions ──
      const BAR_STAGGER      = 190
      const BAR_DUR          = 420
      const PHASE_BARS_END   = BAR_STAGGER * (N - 1) + BAR_DUR
      const PHASE_PAUSE_DUR  = 750
      const LIFT_STAGGER     = 110
      const LIFT_DUR         = 520
      const PHASE_LIFT_END   = 140 + LIFT_STAGGER * 3 + LIFT_DUR

      const elapsed = now - s.phaseStart

      if (s.phase === 'bars') {
        for (let i = 0; i < N; i++) {
          const t = (elapsed - i * BAR_STAGGER) / BAR_DUR
          s.barProgress[i] = Math.min(1, Math.max(0, t))
        }
        if (elapsed > PHASE_BARS_END) { s.phase = 'pause'; s.phaseStart = now }

      } else if (s.phase === 'pause') {
        if (elapsed > PHASE_PAUSE_DUR) { s.phase = 'lift'; s.phaseStart = now; s.toggleActive = true }

      } else if (s.phase === 'lift') {
        for (let i = 0; i < 4; i++) {
          const t = (elapsed - (140 + i * LIFT_STAGGER)) / LIFT_DUR
          s.liftProgress[i] = Math.min(1, Math.max(0, t))
        }
        if (elapsed > PHASE_LIFT_END + 200) { s.phase = 'done'; s.phaseStart = now }

      } else {
        // done — idle
      }

      // ── Draw bars ──
      for (let i = 0; i < N; i++) {
        const p  = easeOutBack(Math.min(s.barProgress[i], 1))
        const x  = PAD_L + i * groupW + barGap
        const bH = BASE[i] * chartH * p
        const bY = PAD_TOP + chartH - bH

        if (p <= 0) continue

        // Blue bar
        const blueGrad = ctx!.createLinearGradient(x, bY, x, PAD_TOP + chartH)
        blueGrad.addColorStop(0, ha(AZURE, 0.88))
        blueGrad.addColorStop(1, ha(AZURE, 0.28))
        ctx!.fillStyle = blueGrad
        ctx!.fillRect(x, bY, barW, bH)

        // Top cap
        ctx!.fillStyle = ha(AZURE, 0.95)
        ctx!.fillRect(x, bY, barW, 2)

        // Orange lift (bars 2–5, lift index 0–3)
        if (i >= 2 && s.liftProgress[i - 2] > 0) {
          const lp  = easeOut3(s.liftProgress[i - 2])
          const lH  = LIFT[i] * chartH * lp
          const lY  = bY - lH

          const orangeGrad = ctx!.createLinearGradient(x, lY, x, bY)
          orangeGrad.addColorStop(0, ha(MANDARIN, 0.95))
          orangeGrad.addColorStop(1, ha(MANDARIN, 0.50))
          ctx!.fillStyle = orangeGrad
          ctx!.fillRect(x, lY, barW, lH)

          // Orange top cap
          ctx!.fillStyle = ha(HONEY, 0.95)
          ctx!.fillRect(x, lY, barW, 2)
        }

        // X label
        ctx!.fillStyle = SUBTLE
        ctx!.font = `500 9.5px Carlito, sans-serif`
        ctx!.textAlign = 'center'
        ctx!.textBaseline = 'top'
        ctx!.fillText(LABELS[i], x + barW / 2, PAD_TOP + chartH + 9)
      }

      // ── Toggle legend (bottom left) ──
      const lX = PAD_L
      const lY = H - 10
      const isOn = s.toggleActive

      ctx!.font = `600 9px Carlito, sans-serif`
      ctx!.textBaseline = 'bottom'

      // "Without PureFacts" swatch + label
      const wAlpha = isOn ? 0.28 : 0.75
      ctx!.fillStyle = `rgba(140,140,140,${wAlpha})`
      ctx!.fillRect(lX, lY - 10, 8, 8)
      ctx!.fillStyle = `rgba(200,200,200,${wAlpha})`
      ctx!.textAlign = 'left'
      ctx!.fillText('Without PureFacts', lX + 12, lY)

      // separator
      const sepX = lX + 114
      ctx!.strokeStyle = `rgba(255,255,255,0.08)`
      ctx!.lineWidth = 1
      ctx!.beginPath()
      ctx!.moveTo(sepX, lY - 12)
      ctx!.lineTo(sepX, lY - 1)
      ctx!.stroke()

      // "With PureFacts" swatch + label
      const wPAlpha = isOn ? 0.92 : 0.28
      ctx!.fillStyle = ha(MANDARIN, wPAlpha)
      ctx!.fillRect(sepX + 8, lY - 10, 8, 8)
      ctx!.fillStyle = `rgba(251,86,7,${wPAlpha})`
      ctx!.fillText('With PureFacts', sepX + 20, lY)


      // ── Y-axis label ──
      ctx!.save()
      ctx!.translate(9, PAD_TOP + chartH / 2)
      ctx!.rotate(-Math.PI / 2)
      ctx!.fillStyle = SUBTLE
      ctx!.font = `500 8.5px Carlito, sans-serif`
      ctx!.textAlign = 'center'
      ctx!.textBaseline = 'middle'
      ctx!.fillText('Fee Revenue Captured', 0, 0)
      ctx!.restore()

      // ── Chart title ──
      ctx!.fillStyle = 'rgba(244,244,244,0.18)'
      ctx!.font = `600 9px Carlito, sans-serif`
      ctx!.textAlign = 'left'
      ctx!.textBaseline = 'top'
      ctx!.fillText('FEE CAPTURE — ANNUAL PERFORMANCE', PAD_L, 8)

      rafRef.current = requestAnimationFrame(draw)
    }

    init()
    stateRef.current = {
      phase: 'bars',
      phaseStart: 0,
      barProgress: [0, 0, 0, 0, 0, 0],
      liftProgress: [0, 0, 0, 0],
      toggleActive: false,
      badgeOpacity: 0,
    }
    rafRef.current = requestAnimationFrame(draw)

    const ro = new ResizeObserver(() => { init() })
    ro.observe(canvas)
    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 320 }}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   STAT COUNT
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
  return <div ref={ref} style={{ fontSize: 'clamp(2.4rem,4.5vw,3.4rem)', fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.02em' }}>{prefix}{count}{suffix}</div>
}

/* ─────────────────────────────────────────────────────────────
   PROOF BAND — logo columns (from Fees & Billing pattern)
───────────────────────────────────────────────────────────── */
function LogoCard({ logo, onPause, onResume }: { logo: ClientLogo; onPause: () => void; onResume: () => void }) {
  return (
    <div
      style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f4f4f4', padding: 24, width: '100%', aspectRatio: '1', overflow: 'hidden', borderRadius: 10 }}
      onMouseEnter={onPause}
      onMouseLeave={onResume}
    >
      <div style={{ position: 'relative', width: '100%', height: 64 }}>
        <Image
          src={urlFor(logo.logo).width(480).url()}
          alt={logo.name}
          fill
          style={{ objectFit: 'contain' }}
          draggable={false}
          sizes="160px"
        />
      </div>
      {logo.caseStudyUrl ? (
        <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          {logo.caseStudyUrl.startsWith('http')
            ? <a href={logo.caseStudyUrl} target="_blank" rel="noopener noreferrer" style={{ borderRadius: 999, background: '#eff6ff', padding: '2px 12px', fontSize: 12, fontWeight: 600, color: '#1d4ed8', textDecoration: 'none', whiteSpace: 'nowrap' }}>Case study →</a>
            : <Link href={logo.caseStudyUrl} style={{ borderRadius: 999, background: '#eff6ff', padding: '2px 12px', fontSize: 12, fontWeight: 600, color: '#1d4ed8', textDecoration: 'none', whiteSpace: 'nowrap' }}>Case study →</Link>
          }
        </div>
      ) : null}
    </div>
  )
}

function LogoColumn({ logos, direction }: { logos: ClientLogo[]; direction: 'up' | 'down' }) {
  const innerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const pausedRef = useRef(false)
  useEffect(() => {
    const inner = innerRef.current; if (!inner) return
    const getH = () => inner.scrollHeight / 2
    let offset = direction === 'down' ? -getH() : 0
    inner.style.transform = `translateY(${offset}px)`
    const tick = () => {
      const h = getH(); if (h === 0) { rafRef.current = requestAnimationFrame(tick); return }
      if (!pausedRef.current) {
        if (direction === 'up') { offset -= 0.8; if (offset <= -h) offset += h } else { offset += 0.8; if (offset >= 0) offset -= h }
        inner.style.transform = `translateY(${offset}px)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [direction, logos.length])
  const items = [...logos, ...logos]
  return (
    <div style={{ position: 'relative', overflow: 'hidden', height: 520 }}>
      <div ref={innerRef} style={{ display: 'flex', flexDirection: 'column', gap: 12, willChange: 'transform' }}>
        {items.map((logo, i) => (
          <LogoCard key={`${logo._id}-${i}`} logo={logo}
            onPause={() => { pausedRef.current = true }}
            onResume={() => { pausedRef.current = false }}
          />
        ))}
      </div>
      <div style={{ pointerEvents: 'none', position: 'absolute', inset: '0 0 auto 0', height: 80, background: `linear-gradient(to bottom, ${C.bg}, transparent)`, zIndex: 10 }} aria-hidden="true" />
      <div style={{ pointerEvents: 'none', position: 'absolute', inset: 'auto 0 0 0', height: 80, background: `linear-gradient(to top, ${C.bg}, transparent)`, zIndex: 10 }} aria-hidden="true" />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   WHY CHOOSE — CAROUSEL (mirrored from Fees & Billing)
───────────────────────────────────────────────────────────── */
const WHY_ITEMS = [
  { number: '01', icon: 'fa-industry', title: 'We understand the realities, not just the theory.', body: 'Complex household structures, multi-tier fee schedules, advisor payout rules, legacy system constraints. We have seen all of it, in production, at scale.' },
  { number: '02', icon: 'fa-diagram-project', title: 'We connect the dots other vendors leave disconnected.', body: 'Billing, compensation, and reporting are not separate problems. They are parts of the same revenue system. We treat them that way.' },
  { number: '03', icon: 'fa-medal', title: 'We have earned trust at the highest stakes.', body: 'The firms running $15T in AuA on PureRevenue did not get there by accident. They chose a platform they could depend on when errors have real consequences.' },
  { number: '04', icon: 'fa-brain', title: 'Our AI is grounded in domain knowledge.', body: 'Intelligence built on top of bad logic is still bad logic. Our AI-fueled approach starts from a deep understanding of how revenue actually works in this industry.' },
  { number: '05', icon: 'fa-timeline', title: 'We build for durable outcomes, not fast demos.', body: 'Our process is designed for complex organizations where adoption matters as much as implementation. We focus on what the business looks like six months after go-live.' },
  { number: '06', icon: 'fa-handshake', title: 'We grow with the firms we work with.', body: 'The relationship does not end at deployment. It deepens as the platform evolves, the business grows, and the problems worth solving get more interesting.' },
]

const WHY_CAROUSEL_DURATION = 3800

function WhyCarousel() {
  const { ref: sectionRef, visible: sectionVisible } = useReveal(0.05)
  const N = WHY_ITEMS.length
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
      const pct = Math.min(100, (elapsed / WHY_CAROUSEL_DURATION) * 100)
      setFillPct(pct)
      if (elapsed >= WHY_CAROUSEL_DURATION) {
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
  const step = cardWidth + cardGap
  const WINDOW = 4
  const cardSlots = Array.from({ length: WINDOW * 2 + 1 }, (_, k) => k - WINDOW)

  return (
    <section aria-label="Why firms choose PureFacts" style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: 'clamp(5rem,7vw,8rem) 0' }}>
      <div aria-hidden="true" style={{ position: 'absolute', top: '20%', right: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 60%)' }} />
      <div aria-hidden="true" style={{ position: 'absolute', bottom: '10%', left: '0%', width: 550, height: 450, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.04) 0%, transparent 60%)' }} />

      <div ref={sectionRef} style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(1.5rem,5vw,3rem)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px,1fr) minmax(280px,1.55fr)', gap: 'clamp(2rem,4vw,4rem)', alignItems: 'center' }}>

          {/* Left: heading + controls */}
          <div style={{ opacity: sectionVisible ? 1 : 0, transform: sectionVisible ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
            <Eyebrow color={C.azure}>Why PureFacts</Eyebrow>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.03em', color: C.text, margin: '0 0 20px' }}>
              Why firms who have tried everything else{' '}
              <span style={{ color: C.azure }}>choose PureFacts.</span>
            </h2>
            <p style={{ fontSize: '0.9375rem', color: C.body, lineHeight: 1.75, maxWidth: 360, marginBottom: 40 }}>
              Revenue management in this industry is not a generic problem. It is shaped by complexity that most platforms were never designed to handle. PureFacts was built specifically for it.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[{ label: '←', fn: prev }, { label: '→', fn: next }].map(({ label, fn }) => (
                <button key={label} onClick={() => { fn(); setPaused(true); setTimeout(() => setPaused(false), 4000) }}
                  style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: `1px solid ${C.border}`, color: C.body, fontSize: 16, cursor: 'pointer', transition: 'border-color 0.2s, color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.azure; (e.currentTarget as HTMLElement).style.color = C.azure }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.body }}
                  aria-label={label === '←' ? 'Previous reason' : 'Next reason'}
                >{label}</button>
              ))}
            </div>
          </div>

          {/* Right: infinite carousel */}
          <div style={{ overflow: 'hidden', position: 'relative', cursor: 'grab', height: 320 }}
            onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
            onMouseEnter={() => setPaused(true)} onMouseLeave={() => { setFillPct(0); startRef.current = Date.now(); setPaused(false) }}>
            {cardSlots.map(offset => {
              const featureIndex = ((active + offset) % N + N) % N
              const f = WHY_ITEMS[featureIndex]
              const isCenter = offset === 0
              const xPos = offset * step
              return (
                <div key={`slot-${offset}`}
                  onClick={() => { if (!dragRef.current.moved && !isCenter) setActive(a => a + offset) }}
                  style={{
                    position: 'absolute', top: 0, left: 0,
                    width: cardWidth, height: '100%',
                    padding: '32px 28px 20px',
                    background: isCenter ? `rgba(59,132,255,0.07)` : C.surface,
                    border: `1px solid ${isCenter ? C.azure : C.border}`,
                    overflow: 'hidden',
                    opacity: Math.abs(offset) <= 1 ? (isCenter ? 1 : 0.5) : 0,
                    transform: `translateX(${xPos}px)`,
                    transition: 'opacity 0.35s ease, border-color 0.35s ease, background 0.35s ease, transform 0.45s cubic-bezier(0.4,0,0.2,1)',
                    cursor: isCenter ? 'default' : 'pointer',
                    pointerEvents: Math.abs(offset) > 2 ? 'none' : 'auto',
                    boxSizing: 'border-box' as const,
                  }}>
                  {isCenter && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: C.azure }} aria-hidden="true" />}
                  <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    <i className={`fa-solid ${f.icon}`} style={{ color: C.azure, fontSize: 15 }} aria-hidden="true" />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 10, lineHeight: 1.3 }}>{f.title}</div>
                  <p style={{ fontSize: 13, color: C.body, lineHeight: 1.7, margin: 0 }}>{f.body}</p>
                  {isCenter && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `rgba(59,132,255,0.12)` }} aria-hidden="true">
                      <div style={{ height: '100%', width: `${fillPct}%`, background: C.azure, transition: 'none' }} />
                    </div>
                  )}
                </div>
              )
            })}
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 80, background: `linear-gradient(to right, transparent, ${C.bg})`, pointerEvents: 'none', zIndex: 10 }} aria-hidden="true" />
          </div>

        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
export default function WorkWithUsClient({ logos }: { logos: ClientLogo[] }) {
  const STEP_COLORS = [C.azure, C.mandarin, C.honey, `rgba(244,244,244,0.55)`]
  const STEP_BORDER = 'rgba(255,255,255,0.18)'

  const STEPS = [
    { label: 'Diagnose',  body: 'Understand the revenue model, friction points, and the outcomes that matter most to the business.' },
    { label: 'Align',     body: 'Bring stakeholders together around priorities, success criteria, and a shared path forward.' },
    { label: 'Configure', body: 'Implement with the rigor that complex revenue environments demand. No shortcuts on sensitive flows.' },
    { label: 'Optimize',  body: 'Support adoption, measure outcomes, and continue improving performance over time.' },
  ]

  // Pad logos into 3 columns for ProofBand
  const col1 = logos.filter((_, i) => i % 3 === 0)
  const col2 = logos.filter((_, i) => i % 3 === 1)
  const col3 = logos.filter((_, i) => i % 3 === 2)
  const pad = (arr: ClientLogo[]) => { let out = [...arr]; while (out.length < 4) out = [...out, ...(arr.length ? arr : logos)]; return out }

  return (
    <>
      <style>{`
        .wwu-pillar-card {
          display: flex; flex-direction: column;
          background: ${C.surface}; border: 1px solid ${C.border};
          padding: 36px 32px; text-decoration: none; position: relative;
          transition: border-color 0.3s ease, transform 0.3s ease;
        }
        .wwu-pillar-card:hover { border-color: rgba(255,255,255,0.14); transform: translateY(-4px); }
        .wwu-cta-row { display: flex; gap: 18px; align-items: flex-start; padding: 18px 0; border-bottom: 1px solid ${C.border}; }
        .wwu-cta-row:last-child { border-bottom: none; }
        @keyframes lightTravel {
          0%   { left: -20%; opacity: 0; }
          6%   { opacity: 1; }
          94%  { opacity: 1; }
          100% { left: 110%; opacity: 0; }
        }
        .wwu-light-line {
          position: absolute;
          top: 0; height: 1px; width: 16%;
          background: linear-gradient(to right, transparent, rgba(59,132,255,0.9), transparent);
          animation: lightTravel 4.8s ease-in-out infinite;
          pointer-events: none;
          z-index: 2;
        }
        .wwu-light-line-2 {
          animation-delay: 2.1s;
          opacity: 0.65;
        }
        .wwu-light-line-3 {
          animation-delay: 4.0s;
          opacity: 0.4;
        }
      `}</style>

      {/* ══════════════════════════════════
          1. HERO
      ══════════════════════════════════ */}
      <section
        style={{ background: C.bg, position: 'relative', overflow: 'hidden', minHeight: 'clamp(420px, 68vh, 720px)', display: 'flex', alignItems: 'center' }}
        aria-label="Working With Us hero"
      >
        <div aria-hidden="true" style={{ position: 'absolute', top: '5%', left: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.07) 0%, transparent 62%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '5%', right: '5%', width: 700, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.05) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, pointerEvents: 'none', background: `linear-gradient(to bottom, transparent, ${C.bg})` }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(3rem,5vw,4.5rem) clamp(1.5rem,5vw,3rem)', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(3rem,6vw,6rem)', alignItems: 'center' }}>

            <div style={{ maxWidth: 560 }}>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                <Eyebrow color={C.azure}>Work With Us</Eyebrow>
              </motion.div>
              <h1 style={{ fontSize: 'clamp(2.25rem,5vw,4rem)', fontWeight: 700, color: C.text, lineHeight: 1.05, letterSpacing: '-0.028em', margin: 0 }}>
                <motion.span style={{ display: 'block' }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                  The Partner Behind
                </motion.span>
                <motion.span style={{ display: 'block' }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}>
                  <GradientText>Better Revenue Outcomes</GradientText>
                </motion.span>
              </h1>
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.75 }}
                style={{ marginTop: 24, fontSize: 18, color: C.body, lineHeight: 1.75, maxWidth: 500 }}>
                Technology matters. But in a category this complex, technology alone is not enough. For more than 15 years, PureFacts has helped some of the world&rsquo;s largest and most respected financial institutions bring more discipline, visibility, and performance to revenue operations.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.95 }} style={{ marginTop: 36 }}>
                <Link href="/contact" className="btn-primary">Talk to an expert</Link>
              </motion.div>
            </div>

            {/* ── Revenue Lift Chart Visual (replaces ScaleCanvas) ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.0, delay: 0.7 }}
              style={{ minHeight: 380, display: 'flex', alignItems: 'stretch' }}
            >
              <div style={{ flex: 1, position: 'relative' }}>
                <RevenueChartVisual />
                <p style={{ position: 'absolute', bottom: -28, left: 0, right: 0, textAlign: 'center', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.subtle }}>
                  Enterprise scale. Every billing cycle.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          2. PROOF BAND (stats left + logos right)
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden' }} aria-label="Built for firms that cannot afford to get revenue wrong">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 300, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(4rem,7vw,6rem) clamp(1.5rem,5vw,3rem)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* Two-col layout: headline+copy+stats left, logos right */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(3rem,6vw,6rem)', width: '100%', alignItems: 'start' }}>

              {/* Left: headline + copy + stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <Reveal style={{ marginBottom: 'clamp(1.5rem,3vw,2.5rem)' }}>
                  <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.4rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.15, margin: '0 0 20px' }}>
                    Built For The Firms That Cannot Afford To Get Revenue Wrong
                  </h2>
                  <p style={{ fontSize: 16, color: C.body, lineHeight: 1.75, margin: 0 }}>
                    Don&rsquo;t just take our word for it. The world&rsquo;s most demanding financial firms rely on PureFacts to protect and grow their fee revenue every day.
                  </p>
                </Reveal>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
                  {([
                    { prefix: '$', value: 15,  suffix: 'T+',  color: C.text,    label: 'Assets Under Administration' },
                    { prefix: '$', value: 3,   suffix: 'B+',  color: C.text, label: 'Fees Calculated Annually' },
                    { prefix: '',  value: 200, suffix: 'M+',  color: C.text,    label: 'Actions Run Per Year' },
                  ] as const).map((s, i) => (
                    <Reveal key={s.label} delay={i * 90}>
                      <div style={{ paddingTop: 'clamp(1.2rem,2vw,1.5rem)', paddingBottom: 'clamp(1.2rem,2vw,1.5rem)', paddingLeft: i === 0 ? 0 : 'clamp(0.75rem,1.5vw,1.25rem)', paddingRight: 'clamp(0.75rem,1.5vw,1.25rem)' }}>
                        <StatCount prefix={s.prefix} value={s.value} suffix={s.suffix} color={s.color} />
                        <p style={{ marginTop: 8, fontSize: 10, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: C.subtle, lineHeight: 1.4, margin: '8px 0 0' }}>{s.label}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>

              {/* Right: logo columns */}
              {logos.length > 0 && (
                <Reveal delay={120} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, overflow: 'hidden' }}>
                  <LogoColumn logos={pad(col1)} direction="down" />
                  <LogoColumn logos={pad(col2)} direction="up" />
                  <LogoColumn logos={pad(col3)} direction="down" />
                </Reveal>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          3. WHY CHOOSE — CAROUSEL
      ══════════════════════════════════ */}
      <WhyCarousel />

      {/* ══════════════════════════════════
          4. THREE PILLARS
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: 'clamp(5rem,7vw,8rem) 0' }} aria-label="How PureFacts makes the difference">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(1.5rem,5vw,3rem)' }}>
          <Reveal>
            <div style={{ marginBottom: 48 }}>
              <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', margin: '0 0 14px' }}>
                How PureFacts <span style={{ color: C.azure }}>Makes the Difference</span>
              </h2>
              <p style={{ fontSize: 16, color: C.body, maxWidth: 560, margin: 0 }}>
                Most firms that struggle with revenue management have the effort. They are missing the platform, the expertise, or the process to make it stick. PureFacts brings all three.
              </p>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, alignItems: 'stretch' }}>
            {[
              { icon: 'fa-microchip', title: 'AI-Fueled Platform Approach', href: '/why-purefacts/platform-approach',     body: 'Built to bring intelligence, automation, and better coordination to revenue operations over time. Not as an afterthought, but by design.' },
              { icon: 'fa-book-open',    title: 'Deep Domain Expertise',       href: '/why-purefacts/deep-domain-expertise', body: 'Grounded in the complexity of wealth and asset management. Not generic software theory. Real experience earned across 15+ years of category-specific work.' },
              { icon: 'fa-route',        title: 'Our Process',                 href: '/why-purefacts/our-process',           body: 'Structured to move from diagnosis to execution with rigor, alignment, and measurable progress. Built for complex environments and high-stakes revenue flows.' },
            ].map((card, i) => (
              <Reveal key={card.title} delay={i * 80} style={{ display: 'flex' }}>
                <Link href={card.href} className="wwu-pillar-card" style={{ flex: 1 }} aria-label={`${card.title}: ${card.body}`}>
                  <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }} aria-hidden="true">
                    <i className={`fa-solid ${card.icon}`} style={{ color: C.azure, fontSize: 18 }} aria-hidden="true" />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: C.text, margin: '0 0 12px' }}>{card.title}</h3>
<p style={{ fontSize: 15, color: C.body, lineHeight: 1.72, margin: '0 0 24px', flex: 1 }}>{card.body}</p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: C.azure }}>
                    Learn more <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} aria-hidden="true" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          5. PROCESS TIMELINE
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden',  }} aria-label="From complexity to control: our process">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(251,86,7,0.05) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(1.5rem,5vw,3rem)' }}>
          <Reveal>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 52 }}>
              <div>
                <Eyebrow color={C.azure}>Our Process</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', margin: '0 0 10px' }}>
                  From Complexity <span style={{ color: C.azure }}>To Control</span>
                </h2>
                <p style={{ fontSize: 16, color: C.body, margin: 0 }}>A structured path that turns diagnosis into durable improvement.</p>
              </div>
              <Link href="/why-purefacts/our-process" className="btn-primary" style={{ flexShrink: 0 }}>Explore Our Process</Link>
            </div>
          </Reveal>

          <style>{`
            @media (min-width: 768px) {
              .wwu-timeline-mobile { display: none !important; }
              .wwu-timeline-desktop { display: block !important; }
            }
            @media (max-width: 767px) {
              .wwu-timeline-mobile { display: flex !important; }
              .wwu-timeline-desktop { display: none !important; }
            }
          `}</style>

          {/* Desktop */}
          <div className="wwu-timeline-desktop" style={{ display: 'block' }}>
            {/* Step labels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 8 }}>
              {STEPS.map((s, i) => (
                <Reveal key={s.label} delay={i * 80}>
                  <p style={{ textAlign: 'center', fontSize: 15, fontWeight: 700, color: STEP_COLORS[i] !== `rgba(244,244,244,0.55)` ? STEP_COLORS[i] : C.text, margin: 0 }}>{s.label}</p>
                </Reveal>
              ))}
            </div>

            {/* Node row with connector */}
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 0 }}>
              {/* Base connector line — gradient across all four step colors */}
              <div style={{ position: 'absolute', top: 27, left: '12.5%', right: '12.5%', height: 1, background: `linear-gradient(to right, ${STEP_COLORS[0]}, ${STEP_COLORS[1]}, ${STEP_COLORS[2]}, ${STEP_COLORS[3]})`, opacity: 0.4 }} aria-hidden="true" />
              {/* Animated light lines */}
              <div style={{ position: 'absolute', top: 27, left: '12.5%', right: '12.5%', height: 1, overflow: 'hidden' }} aria-hidden="true">
                <span className="wwu-light-line" />
                <span className="wwu-light-line wwu-light-line-2" />
                <span className="wwu-light-line wwu-light-line-3" />
              </div>
              {STEPS.map((s, i) => (
                <Reveal key={s.label} delay={80 + i * 80}>
                  <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{
                      width: 56, height: 56, border: `1px solid ${STEP_COLORS[i]}`,
                      background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 20, fontWeight: 900, color: STEP_COLORS[i] }}>{i + 1}</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Description cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {STEPS.map((s, i) => (
                <Reveal key={s.label} delay={160 + i * 80}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 1, height: 24, background: STEP_COLORS[i], opacity: 0.6 }} aria-hidden="true" />
                    <div style={{ width: '100%', border: `1px solid ${STEP_COLORS[i]}`, padding: 24, background: C.surface }}>
                      <p style={{ fontSize: 15, color: C.body, lineHeight: 1.72, margin: 0 }}>{s.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Mobile */}
          <div className="wwu-timeline-mobile" style={{ flexDirection: 'column', gap: 16, display: 'flex' }}>
            {STEPS.map((s, i) => (
              <Reveal key={s.label} delay={i * 80}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ width: 48, height: 48, flexShrink: 0, border: `1px solid ${STEP_COLORS[i]}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: STEP_COLORS[i] }}>{i + 1}</span>
                  </div>
                  <div style={{ flex: 1, border: `1px solid ${STEP_COLORS[i]}`, padding: 20, background: C.surface }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: STEP_COLORS[i] !== `rgba(244,244,244,0.55)` ? STEP_COLORS[i] : C.text, margin: '0 0 8px' }}>{s.label}</h3>
                    <p style={{ fontSize: 15, color: C.body, lineHeight: 1.72, margin: 0 }}>{s.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          6. FINAL CTA
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: 'clamp(5rem,7vw,8rem) 0' }} aria-label="Call to action">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 1000, height: 600, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.07) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '0%', left: '5%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(251,86,7,0.05) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', top: '20%', right: '0%', width: 400, height: 350, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.04) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(1.5rem,5vw,3rem)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(2.5rem,5vw,5rem)', alignItems: 'center' }}>

            <div>
              {[
                { icon: 'fa-brain',            color: C.azure,    title: 'Expertise Earned in This Category', desc: 'Over 15 years of category-specific work across the most complex revenue environments in wealth and asset management: not generic software theory.' },
                { icon: 'fa-diagram-project',  color: C.mandarin, title: 'A Process Built for Complexity',     desc: 'From diagnosis through optimization, a structured path designed for high-stakes revenue flows where adoption matters as much as implementation.' },
                { icon: 'fa-handshake',        color: C.honey,    title: 'A Partner That Grows With You',      desc: 'The relationship deepens after deployment: as the platform evolves, the business grows, and the problems worth solving get more interesting.' },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 70}>
                  <div className="wwu-cta-row">
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
                More Than A Platform.{' '}
                <GradientText>A Partner Built For This Work.</GradientText>
              </h2>
              <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                When firms choose PureFacts, they are choosing a platform approach shaped by where the market is going, expertise earned through years of category-specific work, and a process designed to deliver durable results in complex environments.
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