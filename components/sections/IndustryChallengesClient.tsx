'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

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
   HERO CANVAS — three streams DISPERSING outward from center
───────────────────────────────────────────────────────────── */
function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return

    type Particle = {
      x: number; y: number; originX: number; originY: number
      targetX: number; targetY: number
      color: string; alpha: number; speed: number; size: number
      progress: number; offset: number
    }

    let W = 0, H = 0
    let particles: Particle[] = []

    const STREAMS = [
      { color: C.azure,    tx: 0.18, ty: 0.02 },
      { color: C.mandarin, tx: 0.98, ty: 0.57 },
      { color: C.honey,    tx: 0.40, ty: 0.98 },
    ]

    function init() {
      W = canvas!.offsetWidth; H = canvas!.offsetHeight
      canvas!.width = W; canvas!.height = H
      particles = []
      const cx = W * 0.72
      const cy = H * 0.48
      STREAMS.forEach(s => {
        for (let i = 0; i < 78; i++) {
          const ox = cx + (Math.random() - 0.5) * 90
          const oy = cy + (Math.random() - 0.5) * 90
          const tx = s.tx * W + (Math.random() - 0.5) * W * 0.14
          const ty = s.ty * H + (Math.random() - 0.5) * H * 0.16
          particles.push({
            x: ox, y: oy, originX: ox, originY: oy,
            targetX: tx, targetY: ty,
            color: s.color,
            alpha: 0.18 + Math.random() * 0.32,
            speed: 0.0010 + Math.random() * 0.0016,
            size: Math.random() * 2.4 + 0.8,
            progress: Math.random(),
            offset: Math.random(),
          })
        }
      })
    }

    function ha(hex: string, a: number) {
      return `${hex}${Math.round(a * 255).toString(16).padStart(2, '0')}`
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H)
      const now = Date.now() * 0.001

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          if (particles[i].color !== particles[j].color) continue
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 85) {
            ctx!.beginPath()
            ctx!.moveTo(particles[i].x, particles[i].y)
            ctx!.lineTo(particles[j].x, particles[j].y)
            ctx!.strokeStyle = ha(particles[i].color, (1 - dist / 85) * 0.14)
            ctx!.lineWidth = 0.6; ctx!.stroke()
          }
        }
      }

      particles.forEach(p => {
        p.progress += p.speed
        if (p.progress > 1) { p.progress = 0; p.x = p.originX; p.y = p.originY }
        const t = p.progress
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
        p.x = p.originX + (p.targetX - p.originX) * eased + Math.sin(now * 0.8 + p.offset * 6) * 10
        p.y = p.originY + (p.targetY - p.originY) * eased + Math.cos(now * 0.6 + p.offset * 4) * 8
        const fa = p.alpha * Math.sin(t * Math.PI)
        const g = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5)
        g.addColorStop(0, ha(p.color, fa * 0.55)); g.addColorStop(1, ha(p.color, 0))
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2)
        ctx!.fillStyle = g; ctx!.fill()
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx!.fillStyle = ha(p.color, fa * 1.4); ctx!.fill()
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    init(); draw()
    const ro = new ResizeObserver(() => init())
    ro.observe(canvas)
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect() }
  }, [])

  return (
    <canvas ref={canvasRef} aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 1, pointerEvents: 'none' }} />
  )
}

/* ─────────────────────────────────────────────────────────────
   COMPRESSION GRAPHIC
───────────────────────────────────────────────────────────── */
function CompressionGraphic() {
  const { isMobile } = useBreakpoint()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const startedRef = useRef(false)

  useEffect(() => {
    const container = containerRef.current; if (!container) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !startedRef.current) {
        startedRef.current = true
        startTimeRef.current = Date.now()
        obs.disconnect()
      }
    }, { threshold: 0.3 })
    obs.observe(container)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    let W = 0, H = 0

    function ha(hex: string, a: number) {
      return `${hex}${Math.round(a * 255).toString(16).padStart(2, '0')}`
    }

    const CURVE = [
      { x: 0.00, y: 0.15 },
      { x: 0.15, y: 0.18 },
      { x: 0.28, y: 0.28 },
      { x: 0.42, y: 0.42 },
      { x: 0.56, y: 0.54 },
      { x: 0.70, y: 0.63 },
      { x: 0.84, y: 0.70 },
      { x: 1.00, y: 0.75 },
    ]
    const TARGET_Y = 0.14

    function getPointAtProgress(progress: number, gW: number, gH: number, pl: number, pt: number) {
      const totalLen = CURVE.length - 1
      const idx = Math.min(progress * totalLen, totalLen - 0.0001)
      const lo = Math.floor(idx)
      const hi = Math.min(lo + 1, totalLen)
      const frac = idx - lo
      const xa = CURVE[lo].x + (CURVE[hi].x - CURVE[lo].x) * frac
      const ya = CURVE[lo].y + (CURVE[hi].y - CURVE[lo].y) * frac
      return { x: pl + xa * gW, y: pt + ya * gH }
    }

    function init() {
      W = canvas!.offsetWidth; H = canvas!.offsetHeight
      canvas!.width = W; canvas!.height = H
    }

    const DURATION = 2200

    function draw() {
      if (!startedRef.current) { rafRef.current = requestAnimationFrame(draw); return }

      const elapsed = Date.now() - startTimeRef.current
      const rawP = Math.min(elapsed / DURATION, 1)
      const p = 1 - Math.pow(1 - rawP, 3)

      ctx!.clearRect(0, 0, W, H)

      const PAD = { l: 58, r: 28, t: 36, b: 48 }
      const gW = W - PAD.l - PAD.r
      const gH = H - PAD.t - PAD.b

      for (let i = 0; i <= 4; i++) {
        const y = PAD.t + (i / 4) * gH
        ctx!.beginPath(); ctx!.moveTo(PAD.l, y); ctx!.lineTo(PAD.l + gW, y)
        ctx!.strokeStyle = ha('#f4f4f4', 0.06); ctx!.lineWidth = 1; ctx!.stroke()
      }

      const ty = PAD.t + TARGET_Y * gH
      ctx!.setLineDash([6, 6])
      ctx!.beginPath(); ctx!.moveTo(PAD.l, ty); ctx!.lineTo(PAD.l + gW * p, ty)
      ctx!.strokeStyle = ha(C.azure, 0.45); ctx!.lineWidth = 1.5; ctx!.stroke()
      ctx!.setLineDash([])

      if (p > 0.25) {
        const labelAlpha = Math.min((p - 0.25) / 0.2, 1)
        ctx!.fillStyle = ha(C.azure, 0.7 * labelAlpha)
        ctx!.font = '600 13px Carlito, sans-serif'
        ctx!.textAlign = 'left'
        ctx!.fillText('Expected', PAD.l + 8, ty - 8)
      }

      ctx!.save()
      ctx!.beginPath()
      ctx!.rect(PAD.l, PAD.t - 10, gW * p, gH + 20)
      ctx!.clip()

      ctx!.beginPath()
      ctx!.moveTo(PAD.l + CURVE[0].x * gW, ty)
      CURVE.forEach(pt => ctx!.lineTo(PAD.l + pt.x * gW, PAD.t + pt.y * gH))
      ctx!.lineTo(PAD.l + CURVE[CURVE.length - 1].x * gW, ty)
      ctx!.closePath()
      const fillG = ctx!.createLinearGradient(0, ty, 0, PAD.t + gH)
      fillG.addColorStop(0, ha(C.mandarin, 0.15))
      fillG.addColorStop(1, ha(C.mandarin, 0.03))
      ctx!.fillStyle = fillG; ctx!.fill()

      ctx!.beginPath()
      CURVE.forEach((pt, i) => {
        const x = PAD.l + pt.x * gW; const y = PAD.t + pt.y * gH
        if (i === 0) ctx!.moveTo(x, y); else ctx!.lineTo(x, y)
      })
      const lineG = ctx!.createLinearGradient(PAD.l, 0, PAD.l + gW, 0)
      lineG.addColorStop(0, ha(C.azure, 0.95))
      lineG.addColorStop(1, ha(C.mandarin, 0.95))
      ctx!.strokeStyle = lineG; ctx!.lineWidth = 2.5
      ctx!.lineJoin = 'round'; ctx!.lineCap = 'round'; ctx!.stroke()

      ctx!.restore()

      const tip = getPointAtProgress(p, gW, gH, PAD.l, PAD.t)
      ctx!.beginPath(); ctx!.arc(tip.x, tip.y, 4.5, 0, Math.PI * 2)
      ctx!.fillStyle = C.mandarin; ctx!.fill()

      ctx!.save(); ctx!.translate(16, PAD.t + gH / 2)
      ctx!.rotate(-Math.PI / 2)
      ctx!.fillText('Realized', 0, 0)
      ctx!.restore()

      if (p < 1) rafRef.current = requestAnimationFrame(draw)
    }

    init(); draw()
    const ro = new ResizeObserver(() => { init(); startedRef.current = false; startTimeRef.current = Date.now(); startedRef.current = true })
    ro.observe(canvas)
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect() }
  }, [])

  return (
    <div ref={containerRef} style={{ background: C.surface, border: `1px solid ${C.border}`, padding: 8 }}>
      <canvas ref={canvasRef} aria-hidden="true" style={{ display: 'block', width: '100%', height: isMobile ? 220 : 260 }} />
      <p style={{ textAlign: 'center', fontSize: 11, color: C.subtle, letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontWeight: 600, padding: '8px 0 12px', margin: 0 }}>
        Fee pressure compounds over time
      </p>
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
        {BARS.map((bar, i) => {
          return (
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
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   COLLECTION GRAPHIC
───────────────────────────────────────────────────────────── */
function CollectionGraphic() {
  const { isMobile } = useBreakpoint()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const visibleRef = useRef(false)

  useEffect(() => {
    const container = containerRef.current; if (!container) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { visibleRef.current = true; obs.disconnect() }
    }, { threshold: 0.3 })
    obs.observe(container)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    let W = 0, H = 0

    let capturedPct = 82.0
    let deltaDisplay: { value: number; alpha: number } | null = null
    let tick = 0
    let nextLeakFrame = 90

    function ha(hex: string, a: number) {
      return `${hex}${Math.round(a * 255).toString(16).padStart(2, '0')}`
    }

    function init() {
      W = canvas!.offsetWidth; H = canvas!.offsetHeight
      canvas!.width = W; canvas!.height = H
    }

    const STAGES = ['Earned', 'Priced', 'Billed', 'Collected']
    const GAPS = ['Stale fees', 'Billing errors', 'System gaps']

    type PipeParticle = { x: number; lane: number; speed: number; alpha: number; leaked: boolean; leakProgress: number; leakStage: number }
    const pipeParticles: PipeParticle[] = []
    for (let i = 0; i < 40; i++) {
      pipeParticles.push({
        x: Math.random(), lane: Math.floor(Math.random() * 3),
        speed: 0.003 + Math.random() * 0.002, alpha: 0.5 + Math.random() * 0.4,
        leaked: false, leakProgress: 0, leakStage: Math.floor(Math.random() * 3),
      })
    }

    function draw() {
      if (!visibleRef.current) { rafRef.current = requestAnimationFrame(draw); return }
      tick++
      ctx!.clearRect(0, 0, W, H)

      const PAD = { l: 20, r: 20, t: 64, b: 24 }
      const pW = W - PAD.l - PAD.r
      const pipeY = PAD.t + (H - PAD.t - PAD.b) * 0.28
      const pipeH = 40
      const stageW = pW / (STAGES.length - 1)
      const nodeR = 9

      ctx!.font = '700 13px Carlito, sans-serif'
      ctx!.textAlign = 'center'
      STAGES.forEach((s, i) => {
        const x = PAD.l + i * stageW
        const isLast = i === STAGES.length - 1
        ctx!.fillStyle = isLast ? C.azure : C.text
        ctx!.fillText(s, x, PAD.t - 12)
        ctx!.beginPath(); ctx!.arc(x, pipeY + pipeH / 2, nodeR, 0, Math.PI * 2)
        ctx!.fillStyle = isLast ? ha(C.azure, 0.9) : ha(C.text, 0.35); ctx!.fill()
        ctx!.strokeStyle = isLast ? C.azure : ha(C.text, 0.25)
        ctx!.lineWidth = 1.5; ctx!.stroke()
      })

      for (let i = 0; i < STAGES.length - 1; i++) {
        const x1 = PAD.l + i * stageW + nodeR
        const x2 = PAD.l + (i + 1) * stageW - nodeR
        const gapX = (x1 + x2) / 2
        const gapW2 = 22

        ctx!.beginPath(); ctx!.rect(x1, pipeY, x2 - x1, pipeH)
        ctx!.fillStyle = ha(C.azure, 0.08); ctx!.fill()
        ctx!.strokeStyle = ha(C.azure, 0.25); ctx!.lineWidth = 1; ctx!.stroke()

        const pulseIntensity = 0.5 + 0.5 * Math.sin(tick * 0.06 + i * 1.2)
        ctx!.beginPath(); ctx!.rect(gapX - gapW2, pipeY - 3, gapW2 * 2, pipeH + 6)
        ctx!.fillStyle = ha(C.mandarin, 0.08 + 0.06 * pulseIntensity); ctx!.fill()
        ctx!.strokeStyle = ha(C.mandarin, 0.5 + 0.35 * pulseIntensity)
        ctx!.lineWidth = 1.5; ctx!.setLineDash([3, 3]); ctx!.stroke(); ctx!.setLineDash([])

        ctx!.fillStyle = C.mandarin
        ctx!.font = '700 12px Carlito, sans-serif'
        ctx!.textAlign = 'center'
        ctx!.fillText(GAPS[i], gapX, pipeY - 12)
      }

      pipeParticles.forEach(p => {
        p.x += p.speed
        if (p.x > 1) p.x = 0
        const segIdx = Math.floor(p.x * (STAGES.length - 1))
        const segProgress = (p.x * (STAGES.length - 1)) % 1
        const inLeakZone = segProgress > 0.42 && segProgress < 0.58
        if (inLeakZone && !p.leaked && segIdx < STAGES.length - 1 && Math.random() < 0.015) {
          p.leaked = true; p.leakStage = segIdx
        }
        const x = PAD.l + p.x * pW
        const y = pipeY + pipeH / 2 + (p.lane - 1) * 10
        if (p.leaked) {
          p.leakProgress += 0.04
          const leakY = y + p.leakProgress * 38
          const leakAlpha = p.alpha * (1 - p.leakProgress / 1.2)
          if (leakAlpha > 0.05) {
            ctx!.beginPath(); ctx!.arc(x, leakY, 3.5, 0, Math.PI * 2)
            ctx!.fillStyle = ha(C.mandarin, leakAlpha); ctx!.fill()
          }
          if (p.leakProgress > 1.2) { p.leaked = false; p.leakProgress = 0; p.x = 0 }
        } else {
          if (x > PAD.l + nodeR && x < PAD.l + pW - nodeR) {
            ctx!.beginPath(); ctx!.arc(x, y, 3.5, 0, Math.PI * 2)
            ctx!.fillStyle = ha(C.azure, p.alpha * 0.85); ctx!.fill()
          }
        }
      })

      if (tick >= nextLeakFrame) {
        const drop = Math.floor(Math.random() * 3) + 1
        capturedPct -= drop
        deltaDisplay = { value: drop, alpha: 1.0 }
        nextLeakFrame = tick + 65 + Math.floor(Math.random() * 110)
      }
      if (capturedPct < 82) capturedPct = Math.min(82, capturedPct + 0.028)
      capturedPct = Math.max(71, capturedPct)

      const numTop = pipeY + pipeH + 52

      ctx!.font = '600 11px Carlito, sans-serif'
      ctx!.textAlign = 'center'
      ctx!.fillStyle = ha(C.text, 0.38)
      ctx!.fillText('REVENUE  CAPTURED', W / 2, numTop)

      ctx!.font = '800 52px Carlito, sans-serif'
      ctx!.textAlign = 'center'
      ctx!.fillStyle = C.text
      ctx!.fillText(`${Math.round(capturedPct)}%`, W / 2, numTop + 58)

      if (deltaDisplay) {
        ctx!.font = '700 22px Carlito, sans-serif'
        ctx!.textAlign = 'center'
        ctx!.fillStyle = ha(C.mandarin, deltaDisplay.alpha)
        ctx!.fillText(`−${deltaDisplay.value}`, W / 2 + 68, numTop + 42)
        deltaDisplay.alpha -= 0.016
        if (deltaDisplay.alpha <= 0) deltaDisplay = null
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    init(); draw()
    const ro = new ResizeObserver(() => init())
    ro.observe(canvas)
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect() }
  }, [])

  return (
    <div ref={containerRef} style={{ background: C.surface, border: `1px solid ${C.border}`, padding: 8 }}>
      <canvas ref={canvasRef} aria-hidden="true" style={{ display: 'block', width: '100%', height: isMobile ? 260 : 330 }} />
      <p style={{ textAlign: 'center', fontSize: 11, color: C.subtle, letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontWeight: 600, padding: '8px 0 12px', margin: 0 }}>
        Revenue lost at every handoff
      </p>
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
  const { isMobile, isTablet } = useBreakpoint()
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
            const pool = isMobile ? COMPLEXITY_PANELS.slice(0, 4) : COMPLEXITY_PANELS
            const shuffled = [...pool].sort(() => Math.random() - 0.5)
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
  }, [visible, isMobile])

  const displayedPanels = isMobile ? COMPLEXITY_PANELS.slice(0, 4) : COMPLEXITY_PANELS
  const activeCount = alarmRef.current.activeIds.filter(id => displayedPanels.some(p => p.id === id)).length

  return (
    <div ref={containerRef} style={{ background: C.surface, border: `1px solid ${C.border}`, padding: 14 }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : isTablet ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))', gap: isMobile ? 8 : 8 }}>
        {displayedPanels.map((panel) => {
          const isActive = alarmRef.current.activeIds.includes(panel.id)
          const blink = isActive && tickRef.current % 180 < 90
          const statusColor = STATUS_COLORS[panel.status]

          return (
            <motion.div
              key={panel.id}
              initial={{ opacity: 0, y: 10 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.35, delay: displayedPanels.indexOf(panel) * 0.06 }}
              style={{
                background: C.bg,
                border: `1.5px solid ${isActive && blink ? statusColor : C.border}`,
                padding: '9px 10px',
                position: 'relative',
                transition: 'border-color 0.18s ease',
                boxShadow: isActive && blink ? `0 0 10px ${statusColor}22` : 'none',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: panel.color, opacity: isActive ? 0.85 : 0.3 }} aria-hidden="true" />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: panel.color, letterSpacing: '0.08em', textTransform: 'uppercase' as const, opacity: isActive ? 1 : 0.55 }}>
                  {panel.label}
                </span>
                <span style={{
                  fontSize: 7, fontWeight: 800, letterSpacing: '0.12em',
                  color: statusColor,
                  opacity: isActive ? (blink ? 1 : 0.5) : 0.15,
                  transition: 'opacity 0.18s',
                }}>
                  {panel.status}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                {panel.metrics.map(m => (
                  <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 9, color: C.subtle }}>{m.label}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: isActive ? C.text : C.subtle }}>{m.value}</span>
                  </div>
                ))}
              </div>

              <div style={{
                fontSize: 8, color: statusColor, fontStyle: 'italic',
                opacity: isActive ? (blink ? 0.9 : 0.35) : 0,
                transition: 'opacity 0.18s',
                borderTop: `1px solid ${C.border}`, paddingTop: 5,
              }}>
                ⚠ {panel.errorMsg}
              </div>
            </motion.div>
          )
        })}
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: C.subtle, letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontWeight: 600, marginTop: 14, marginBottom: 0 }}>
        Manual friction at every step
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
  const LABEL_R = isMobile ? OUTER + 9 : OUTER + 14
  const HUB_R = INNER

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: isMobile ? 240 : isTablet ? 300 : 360 }}>
      <div style={{ position: 'absolute', width: 'min(260px, 70%)', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,132,255,0.13) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', width: isMobile ? 'min(220px, 76vw)' : isTablet ? 'min(280px, 82%)' : 'min(310px, 84%)', aspectRatio: '1' }}>
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
   LARGE STAT COUNT
───────────────────────────────────────────────────────────── */
function LargeStatCount({ value, prefix = '', suffix = '', color }: {
  value: number; prefix?: string; suffix?: string; color: string
}) {
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
    <div ref={ref} style={{ fontSize: isMobile ? 'clamp(3rem, 20vw, 4.5rem)' : 'clamp(4rem,10vw,7rem)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', color: C.text, margin: 0 }}
      aria-label={`${prefix}${value}${suffix}`}>
      {prefix}{count}<span style={{ color }}>{suffix}</span>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
export default function IndustryChallengesClient() {
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '56px 0' : isTablet ? '72px 0' : '80px 0'
  const heroPad = isMobile ? '48px 0 56px' : isTablet ? '72px 0' : 'clamp(4.5rem,7vw,6.5rem) 0 clamp(3.75rem,6vw,5.5rem)'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 clamp(1.5rem,5vw,3rem)'
  const twoCols = isTablet ? '1fr' : 'repeat(2, minmax(0, 1fr))'
  const sectionGap = isMobile ? '28px' : isTablet ? '36px' : 'clamp(2.5rem,5vw,5rem)'
  const cardsCols = isMobile ? '1fr' : isTablet ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))'
  const caseCols = isTablet ? '1fr' : '1fr 1.4fr'
  const miniStatsCols = isMobile ? '1fr' : '1fr 1fr'

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        section { max-width: 100vw; }
        canvas, svg { max-width: 100%; }
        @media (max-width: 639px) {
          .ic-force-card { padding: 26px 22px 24px; min-width: 0; }
          .ic-bullet-row, .ic-benefit-row, .ic-cta-row { gap: 12px; }
          .btn-primary, .btn-trim-mandarin, .btn-trim-honey { max-width: 100%; }
        }
        .ic-force-card {
          display: flex; flex-direction: column;
          padding: 36px 32px 32px;
          background: ${C.surface};
          border: 1px solid ${C.border};
          text-decoration: none;
          transition: border-color 0.3s ease, transform 0.3s ease;
          position: relative; overflow: hidden;
        }
        .ic-force-card:hover { border-color: rgba(255,255,255,0.14); transform: translateY(-4px); }
        .ic-bullet-row { display: flex; gap: 10px; align-items: flex-start; padding: 5px 0; }
        .ic-benefit-row { display: flex; gap: 16px; align-items: flex-start; padding: 18px 0; border-bottom: 1px solid ${C.border}; }
        .ic-benefit-row:last-child { border-bottom: none; }
        .ic-cta-row { display: flex; gap: 18px; align-items: flex-start; padding: 18px 0; border-bottom: 1px solid ${C.border}; }
        .ic-cta-row:last-child { border-bottom: none; }
        .btn-trim-mandarin { border: 2px solid ${C.mandarin} !important; }
        .btn-trim-honey    { border: 2px solid ${C.honey} !important; }
      `}</style>

      {/* ══════════════════════════════════
          1. HERO
      ══════════════════════════════════ */}
      <section
        style={{ position: 'relative', overflow: 'hidden', background: C.bg, padding: heroPad, minHeight: isMobile ? 'auto' : 520, display: 'flex', alignItems: 'center' }}
        aria-label="Industry Challenges hero"
      >
        <HeroCanvas />
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 65% 80% at 28% 50%, rgba(20,15,12,0.90) 0%, rgba(20,15,12,0.60) 50%, transparent 100%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 140, pointerEvents: 'none', background: `linear-gradient(to bottom, transparent, ${C.bg})` }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, width: '100%', margin: '0 auto', padding: innerPad }}>
          <div style={{ maxWidth: 680 }}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
              <Eyebrow color={C.mandarin}>Industry Challenges</Eyebrow>
            </motion.div>
            <h1 style={{ fontSize: 'clamp(2.25rem,5vw,4rem)', fontWeight: 700, color: C.text, lineHeight: 1.05, letterSpacing: '-0.028em', margin: 0 }}>
              <motion.span style={{ display: 'block' }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                When Revenue Feels Harder To Earn,
              </motion.span>
              <motion.span style={{ display: 'block' }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}>
                <GradientText>Three Forces Are At Work</GradientText>
              </motion.span>
            </h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.75 }}
              style={{ marginTop: 24, fontSize: 18, color: C.body, lineHeight: 1.75, maxWidth: 540 }}>
              Wealth management firms are operating in a tougher economic reality.
              Markets may still lift reported growth, but underneath the surface most
              firms are fighting the same three problems: more fee pressure, more
              operational drag, and more difficulty turning work into realized revenue.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.95 }}
              style={{ marginTop: 36 }}>
              <Link href="/contact" className="btn-primary">Talk to an expert</Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          2. THREE FORCES
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="The three forces">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <Reveal>
            <div style={{ marginBottom: 52, maxWidth: 620 }}>
              <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', margin: 0, lineHeight: 1.2 }}>
                Three Forces.<br />
                <span style={{ color: C.azure }}>One Connected Problem.</span>
              </h2>
              <p style={{ marginTop: 14, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                Industry pressure is no longer coming from one direction. It is showing
                up simultaneously in pricing, operations, and advisor capacity. Firms that
                address only one of these in isolation usually end up moving the problem
                around rather than solving it.
              </p>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: cardsCols, gap: 20, alignItems: 'stretch' }}>
            {[
              { icon: 'fa-compress',              color: C.azure,    label: 'Compression', href: '/why-purefacts/compression',
                what: 'Fee pressure, rising service expectations, and shrinking yield per client or household.' },
              { icon: 'fa-circle-dollar-to-slot',  color: C.mandarin, label: 'Collection',  href: '/why-purefacts/collection',
                what: 'Revenue that should be earned and billed, but is missed through fragmented systems, stale pricing, or manual processes.' },
              { icon: 'fa-sitemap',                color: C.honey,    label: 'Complexity',  href: '/why-purefacts/complexity',
                what: 'Advisors and operations teams spending too much time navigating friction, spreadsheets, and opaque processes.' },
            ].map((card, i) => (
              <Reveal key={card.label} delay={i * 80} style={{ display: 'flex' }}>
                <Link href={card.href} className="ic-force-card" style={{ flex: 1, border: `1px solid ${card.color}` }} aria-label={`Learn about ${card.label}: ${card.what}`}>
                  <div style={{ flexShrink: 0, marginBottom: 20 }}>
                    <i className={`fa-solid ${card.icon}`} style={{ color: card.color, fontSize: 18, lineHeight: 1 }} aria-hidden="true" />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: C.text, margin: '0 0 12px' }}>{card.label}</h3>
                  <p style={{ fontSize: 15, color: C.body, lineHeight: 1.72, margin: '0 0 20px', flex: 1 }}>{card.what}</p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: card.color }}>
                    Explore {card.label}
                    <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} aria-hidden="true" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          3. COMPRESSION
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Compression: pressure on every basis point">
        <div aria-hidden="true" style={{ position: 'absolute', top: '10%', right: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.06) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'center' }}>
            <div>
              <Reveal>
                <Eyebrow color={C.azure}>Compression</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                  More Pressure On Every Basis Point
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                  Firms are being asked to deliver more planning, more customization, and
                  more service while defending lower realized fees. That creates a dangerous
                  pattern: growth in assets without the same growth in profitability.
                </p>
              </Reveal>
              <ul style={{ margin: '16px 0 0', padding: 0, listStyle: 'none' }}>
                {[
                  'Fee pressure is intensifying, especially in larger households and more competitive segments.',
                  'Service expectations continue to rise: from tax coordination to estate support to alternatives access.',
                  'Without stronger pricing discipline, firms win business while quietly giving away yield they never get back.',
                ].map((item, i) => (
                  <Reveal key={i} delay={i * 60}>
                    <li className="ic-bullet-row">
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.azure, flexShrink: 0, marginTop: 10 }} aria-hidden="true" />
                      <p style={{ fontSize: 15, color: C.body, lineHeight: 1.7, margin: 0 }}>{item}</p>
                    </li>
                  </Reveal>
                ))}
              </ul>
              <Reveal delay={180}>
                <div style={{ marginTop: 24 }}>
                  <Link href="/why-purefacts/compression" className="btn-primary">Explore Compression</Link>
                </div>
              </Reveal>
            </div>
            <Reveal delay={100}><CompressionGraphic /></Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          4. COLLECTION
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Collection: earned revenue that never gets collected">
        <div aria-hidden="true" style={{ position: 'absolute', top: '10%', left: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(251,86,7,0.06) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'center' }}>
            <Reveal delay={100}><div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: isMobile ? 6 : 8, overflow: 'hidden' }}><HeroLeakageChart /><p style={{ textAlign: 'center', fontSize: 11, color: C.subtle, letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontWeight: 600, padding: '8px 0 12px', margin: 0 }}>Revenue lost at every handoff</p></div></Reveal>
            <div>
              <Reveal>
                <Eyebrow color={C.mandarin}>Collection</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                  Earned Revenue That Never Gets Collected
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                  Many firms do the hard work of serving clients, yet still fail to collect
                  all of the revenue they have earned. The problem is rarely one dramatic
                  breakdown. More often it is a steady accumulation of missed billing,
                  unmanaged discounts, stale fee schedules, and householding errors.
                </p>
              </Reveal>
              <ul style={{ margin: '16px 0 0', padding: 0, listStyle: 'none' }}>
                {[
                  'When data does not move cleanly across CRM, portfolio accounting, and billing systems, revenue falls into the gaps.',
                  'Because the cost to serve has already been incurred, missed revenue comes off EBITDA almost dollar for dollar.',
                  'What looks like a back-office issue is often one of the fastest ways to destroy enterprise value.',
                ].map((item, i) => (
                  <Reveal key={i} delay={i * 60}>
                    <li className="ic-bullet-row">
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.mandarin, flexShrink: 0, marginTop: 10 }} aria-hidden="true" />
                      <p style={{ fontSize: 15, color: C.body, lineHeight: 1.7, margin: 0 }}>{item}</p>
                    </li>
                  </Reveal>
                ))}
              </ul>
              <Reveal delay={180}>
                <div style={{ marginTop: 24 }}>
                  <Link href="/why-purefacts/collection" className="btn-primary btn-trim-mandarin">Explore Collection</Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          5. COMPLEXITY
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Complexity: operational friction stealing advisor capacity">
        <div aria-hidden="true" style={{ position: 'absolute', top: '10%', right: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.06) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'center' }}>
            <div>
              <Reveal>
                <Eyebrow color={C.honey}>Complexity</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                  Operational Friction That Steals Advisor Capacity and Limits Growth
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                  Not all value destruction shows up in a billing file. When compensation is opaque, reporting is
                  fragmented, and routine processes depend on spreadsheets and manual checking, advisors and operations
                  teams spend too much time proving what already should be clear.
                </p>
              </Reveal>
              <ul style={{ margin: '16px 0 0', padding: 0, listStyle: 'none' }}>
                {[
                  'Advisors lose time to administration and shadow accounting instead of spending that time with clients and prospects.',
                  'Operations teams get pulled into exception handling and reconciliations that should be automated.',
                  "Over time, complexity weakens confidence in the data, the process, and the firm's ability to scale cleanly.",
                ].map((item, i) => (
                  <Reveal key={i} delay={i * 60}>
                    <li className="ic-bullet-row">
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.honey, flexShrink: 0, marginTop: 10 }} aria-hidden="true" />
                      <p style={{ fontSize: 15, color: C.body, lineHeight: 1.7, margin: 0 }}>{item}</p>
                    </li>
                  </Reveal>
                ))}
              </ul>
              <Reveal delay={180}>
                <div style={{ marginTop: 24 }}>
                  <Link href="/why-purefacts/complexity" className="btn-primary btn-trim-honey">Explore Complexity</Link>
                </div>
              </Reveal>
            </div>
            <Reveal delay={100}><ComplexityGraphic /></Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          6. $13M PROOF MOMENT
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Research and case study">
        <div aria-hidden="true" style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.07) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: caseCols, gap: sectionGap, alignItems: 'center' }}>
            <Reveal>
              <LargeStatCount value={13} prefix="$" suffix="M+" color={C.text} />
              <p style={{ marginTop: 16, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.18em', color: C.subtle }}>Annual value unlocked</p>
              <div style={{ marginTop: 20, height: 1, width: 64, background: C.border }} aria-hidden="true" />
              <p style={{ marginTop: 16, fontSize: 13, color: C.subtle, fontStyle: 'italic' }}>IOFM, Ardent Partners and Deloitte research on finance automation</p>
            </Reveal>
            <Reveal delay={120}>
              <Eyebrow color={C.mandarin}>Real Results</Eyebrow>
              <h2 style={{ fontSize: 'clamp(1.6rem,2.8vw,2.2rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.22, margin: 0 }}>
                Automating billing and document processing can reach 99% accuracy while cutting costs by 60 to 80%.
              </h2>
              <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                A leading wealth manager replaced its legacy billing infrastructure with
                Fees and Billing, eliminating systemic revenue leakage and recovering full ROI in under 12 months.
              </p>
              <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: miniStatsCols, gap: 20, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
                <div>
                  <p style={{ fontSize: 'clamp(1.25rem,2vw,1.5rem)', fontWeight: 800, color: C.azure, margin: 0 }}>$1.1M+</p>
                  <p style={{ marginTop: 4, fontSize: 13, color: C.body, lineHeight: 1.6 }}>Annual costs automated away</p>
                </div>
                <div>
                  <p style={{ fontSize: 'clamp(1.25rem,2vw,1.5rem)', fontWeight: 800, color: C.text, margin: 0 }}>Under 1 Year</p>
                  <p style={{ marginTop: 4, fontSize: 13, color: C.body, lineHeight: 1.6 }}>Payback period on direct savings</p>
                </div>
              </div>
              <div style={{ marginTop: 24 }}>
                <Link href="/case-study/how-a-leading-wealth-manager-unlocked-over-13m-in-annual-value-by-replacing-legacy-infrastructure" className="btn-primary">
                  Read the case study
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          7. HOW PUREFACTS HELPS
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="How PureFacts addresses all three challenges">
        <div aria-hidden="true" style={{ position: 'absolute', top: '5%', left: '0%', width: 550, height: 450, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.05) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', top: '5%', right: '5%', width: 600, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.06) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'center' }}>
            <div>
              <Reveal>
                <Eyebrow color={C.mandarin}>The PureFacts Approach</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                  PureFacts Helps Firms Tackle All Three As One Connected Revenue Problem
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.8 }}>
                  By bringing pricing, billing, compensation, reporting, and governance into a more unified operating model,
                  firms can defend their realized yield with stronger pricing discipline, capture the revenue already being
                  earned before it falls through billing gaps, and eliminate the manual friction that pulls advisors and
                  operations teams away from higher-value work.
                </p>
                <p style={{ marginTop: 16, fontSize: 16, color: C.body, lineHeight: 1.8 }}>
                  The result is a connected revenue foundation that strengthens enterprise value. When pricing governance,
                  billing accuracy, advisor compensation, and reporting all operate from the same source of truth, firms
                  stop moving the problem around and start solving it.
                </p>
              </Reveal>
              <Reveal delay={140}>
                <div style={{ marginTop: 28 }}>
                  <Link href="/platform/" className="btn-primary">Explore the Platform</Link>
                </div>
              </Reveal>
            </div>
            <Reveal delay={120} style={{ minWidth: 0, display: 'flex', justifyContent: 'center' }}>
              <PlatformDiagram />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          8. FINAL CTA
      ══════════════════════════════════ */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Call to action">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 1000, height: 600, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.07) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '0%', left: '5%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(251,86,7,0.05) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', top: '20%', right: '0%', width: 400, height: 350, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.04) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'center' }}>
            <div>
              {[
                { icon: 'fa-compress',              color: C.azure,    title: 'Defend Every Basis Point',      desc: 'Stronger pricing discipline and governance help firms protect realized fees in a lower-fee environment before yield quietly erodes.' },
                { icon: 'fa-circle-dollar-to-slot',  color: C.mandarin, title: 'Capture Revenue Already Earned', desc: 'Improve billing accuracy and close the gaps that let earned revenue fall through disconnected systems and stale fee schedules.' },
                { icon: 'fa-sitemap',                color: C.honey,    title: 'Reduce Operational Friction',    desc: 'Automate the processes that should not require human effort and give advisors and operations teams more time where it matters.' },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 70}>
                  <div className="ic-cta-row">
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
                The Pressure Is Compounding.{' '}
                <GradientText>The Time To Act Is Now.</GradientText>
              </h2>
              <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                PureFacts helps firms build a revenue foundation that does not depend on favorable market conditions to perform.
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