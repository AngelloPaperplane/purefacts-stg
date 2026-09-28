'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

// ─── Brand tokens ──────────────────────────────────────────────────────────────
const C = {
  bg:       '#140f0c',
  surface:  '#1a1410',
  azure:    '#3b84ff',
  mandarin: '#fb5607',
  honey:    '#ffb30c',
  text:     '#f4f4f4',
  muted:    'rgba(244,244,244,0.75)',
  subtle:   'rgba(244,244,244,0.45)',
  border:   'rgba(255,255,255,0.07)',
  borderMd: 'rgba(255,255,255,0.10)',
}
const SUNSET = 'linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%)'

// ─── Sanity types ─────────────────────────────────────────────────────────────
import type { WhoWeServeCard } from '@/lib/sanity/queries'
export type WhoWeServeProps = { industryCards?: WhoWeServeCard[]; personaCards?: WhoWeServeCard[] }

// ─── Shared: useInView ────────────────────────────────────────────────────────
function useInView(threshold = 0.08) {
  const ref = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    obs.observe(el); return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
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

// ─── Hero canvas — Finance lines verbatim, but parametrised bottom→top-right ──
// Each line is defined by where it starts at the bottom (xStart fraction of W)
// and travels upward-right. pct=0 is bottom, pct=1 is top. x increases with pct
// (rightward travel) plus a sine wave. This gives the opposite diagonal to Finance.
function WhoWeServeCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    let raf: number, t = 0
    let W = 0, H = 0

    // Same 4 lines as Finance, colours identical, just reinterpreted as bottom-start
    const LINES = [
      { color: '59,132,255',  phase: 0,    amp: 0.18, freq: 0.7,  xStart: 0.05, speed: 0.6,  lw: 1.8 },
      { color: '251,86,7',    phase: 1.1,  amp: 0.13, freq: 0.9,  xStart: 0.22, speed: 0.45, lw: 1.3 },
      { color: '255,179,12',  phase: 2.3,  amp: 0.10, freq: 1.1,  xStart: 0.38, speed: 0.5,  lw: 1.3 },
      { color: '59,132,255',  phase: 0.6,  amp: 0.08, freq: 0.5,  xStart: 0.55, speed: 0.35, lw: 1.3 },
    ]

    function resize() {
      W = canvas!.width  = canvas!.parentElement!.offsetWidth
      H = canvas!.height = canvas!.parentElement!.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize); ro.observe(canvas.parentElement!)

    function draw() {
      t += 0.008
      ctx!.clearRect(0, 0, W, H)

      LINES.forEach((line, li) => {
        const pts: [number, number][] = []
        const steps = 120

        for (let i = 0; i <= steps; i++) {
          const pct = i / steps                          // 0=bottom, 1=top
          // x: starts at xStart, drifts rightward across the full canvas width as it rises
          const xTravel = pct * W * 0.95               // travel ~full width going up
          const xWave   = Math.sin(pct * Math.PI * 2 * line.freq + t * line.speed + line.phase) * W * line.amp
          const x = line.xStart * W + xTravel + xWave
          const y = H - pct * H                         // bottom=H, top=0
          pts.push([x, Math.max(0, Math.min(H, y))])
        }

        // Opacity: full brightness across most of the span, fade at very bottom and top
        for (let i = 1; i < pts.length; i++) {
          const pct = i / pts.length
          // Fade bottom 15% in, fade top 10% out — bright through the middle
          const fade = Math.min(pct / 0.15, 1) * Math.min((1 - pct) / 0.10, 1)
          const baseAlpha = li === 0 ? 0.55 : li === 1 ? 0.42 : 0.35
          const a = fade * baseAlpha
          if (a < 0.005) continue
          ctx!.beginPath()
          ctx!.moveTo(pts[i - 1][0], pts[i - 1][1])
          ctx!.lineTo(pts[i][0],     pts[i][1])
          ctx!.strokeStyle = `rgba(${line.color},${a})`
          ctx!.lineWidth   = line.lw
          ctx!.stroke()
        }

        // Glow dot near the top of each line
        const tip = pts[Math.floor(pts.length * 0.88)]
        if (tip) {
          const g = ctx!.createRadialGradient(tip[0], tip[1], 0, tip[0], tip[1], 8)
          g.addColorStop(0, `rgba(${line.color},0.55)`)
          g.addColorStop(1, `rgba(${line.color},0)`)
          ctx!.beginPath(); ctx!.arc(tip[0], tip[1], 8, 0, Math.PI * 2)
          ctx!.fillStyle = g; ctx!.fill()
          ctx!.beginPath(); ctx!.arc(tip[0], tip[1], 2, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(${line.color},0.8)`; ctx!.fill()
        }
      })

      // Left-side text vignette — lines are faint but still visible behind copy
      const textVig = ctx!.createLinearGradient(0, 0, W * 0.55, 0)
      textVig.addColorStop(0,    'rgba(20,15,12,0.82)')
      textVig.addColorStop(0.50, 'rgba(20,15,12,0.52)')
      textVig.addColorStop(1,    'rgba(20,15,12,0.0)')
      ctx!.fillStyle = textVig; ctx!.fillRect(0, 0, W * 0.55, H)

      // Bottom fade
      const bot = ctx!.createLinearGradient(0, H * 0.75, 0, H)
      bot.addColorStop(0, 'transparent'); bot.addColorStop(1, 'rgba(20,15,12,0.95)')
      ctx!.fillStyle = bot; ctx!.fillRect(0, H * 0.75, W, H * 0.25)

      // Top fade
      const top = ctx!.createLinearGradient(0, 0, 0, H * 0.15)
      top.addColorStop(0, 'rgba(20,15,12,0.65)'); top.addColorStop(1, 'transparent')
      ctx!.fillStyle = top; ctx!.fillRect(0, 0, W, H * 0.15)

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return (
    <canvas ref={ref} aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
  )
}

// ─── 1. Hero ──────────────────────────────────────────────────────────────────
function Hero() {
  const { isMobile, isTablet } = useBreakpoint()
  const heroPad = isMobile ? '48px 20px 48px' : isTablet ? '72px 32px' : '90px 48px'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 80) }, [])

  return (
    <section style={{
      position: 'relative', overflow: 'hidden', background: C.bg,
      padding: heroPad, display: 'flex', alignItems: 'center',
    }}>
      {/* Full-bleed canvas behind everything */}
      <WhoWeServeCanvas />

      {/* Ambient glows */}
      <div style={{ position: 'absolute', top: '-10%', right: '5%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.06) 0%, transparent 60%)', zIndex: 0 }} aria-hidden="true" />
      <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(251,86,7,0.04) 0%, transparent 60%)', zIndex: 0 }} aria-hidden="true" />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 140, background: `linear-gradient(to bottom, transparent, ${C.bg})`, pointerEvents: 'none', zIndex: 1 }} aria-hidden="true" />

      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: innerPad,
        width: '100%', position: 'relative', zIndex: 2,
      }}>
        {/* Text: left half only, lines visible through right half */}
        <div style={{
          maxWidth: 580,
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.mandarin, textTransform: 'uppercase', letterSpacing: '0.20em' }}>
              Who We Serve
            </span>
          </div>
          <h1 style={{
            fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
            fontWeight: 700, lineHeight: 1.06,
            letterSpacing: '-0.028em', color: C.text,
            maxWidth: 560, marginBottom: 24,
          }}>
            Built for the world&rsquo;s leading{' '}
            <span style={{
              background: SUNSET,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              financial firms
            </span>.
          </h1>
          <p style={{ fontSize: '1.0625rem', color: C.muted, lineHeight: 1.75, maxWidth: 480, marginBottom: 40 }}>
            Built for those responsible for growth, profitability, and enterprise value. PureFacts connects every dimension of revenue performance into one platform.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/contact" className="btn-primary">Get in contact</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── 2. Firm Types — hardcoded, all-sides colour border ──────────────────────
const FIRM_CARDS = [
  {
    _key: 'wm',
    icon: 'fa-building-columns',
    heading: 'Wealth Management',
    tagline: 'Scale without operational drag.',
    body: 'Automate complex fee billing, optimize advisor compensation, and reduce revenue leakage. PureFacts helps wealth management firms improve accuracy, cut manual effort, and support growth with control.',
    color: C.azure,
    href: '/who-we-serve/wealth-management',
  },
  {
    _key: 'am',
    icon: 'fa-chart-line',
    heading: 'Asset Management',
    tagline: 'Protect margin. Improve visibility.',
    body: 'Automate fee calculations and invoicing while eliminating revenue leakage. PureFacts helps asset managers standardize controls, reduce friction, and improve forecasting confidence.',
    color: C.mandarin,
    href: '/who-we-serve/asset-management',
  },
  {
    _key: 'as',
    icon: 'fa-server',
    heading: 'Asset Servicing',
    tagline: 'Control complexity at scale.',
    body: 'Strengthen revenue and billing controls across high-volume client relationships. PureFacts helps asset servicers standardize processes, improve auditability, and reduce operational risk.',
    color: C.honey,
    href: '/who-we-serve/asset-servicing',
  },
]

function FirmTypes({ industryCards }: { industryCards?: WhoWeServeCard[] }) {
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '56px 0' : '90px 0'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const cardCols = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'
  const { ref, inView } = useInView(0.08)

  return (
    <section ref={ref as React.RefObject<HTMLElement>} style={{ background: C.bg, padding: sectionPad, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.06) 0%, transparent 60%)' }} aria-hidden="true" />
      <div style={{ position: 'absolute', top: '-5%', right: '-6%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.05) 0%, transparent 58%)' }} aria-hidden="true" />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
        <div style={{
          marginBottom: 56,
          opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.mandarin, textTransform: 'uppercase', letterSpacing: '0.20em', display: 'block', marginBottom: 14 }}>
            Your Business Model
          </span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.025em', color: C.text, maxWidth: 600, marginBottom: 16 }}>
            See how PureFacts supports your business model.
          </h2>
          <p style={{ fontSize: '1rem', color: C.muted, lineHeight: 1.75, maxWidth: 560 }}>
            Every financial institution operates within a distinct revenue model. PureFacts is purpose-built to support the scale, complexity, and regulatory demands of your market.
          </p>
        </div>

        <style>{`
          .firm-card:hover { transform: translateY(-3px); border-color: var(--card-color) !important; }
          .firm-card:hover .firm-card-link { gap: 8px; }
        `}</style>
        <div style={{ display: 'grid', gridTemplateColumns: cardCols, gap: 16 }}>
          {FIRM_CARDS.map((card, i) => (
            <Link
              key={card._key}
              href={card.href}
              className="firm-card"
              style={{
                '--card-color': card.color,
                padding: isMobile ? '28px 24px' : '36px 32px',
                background: C.surface,
                border: `1px solid ${card.color}40`,
                display: 'flex', flexDirection: 'column',
                textDecoration: 'none',
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.5s ease ${0.1 + i * 0.1}s, transform 0.35s ease, border-color 0.25s ease`,
              } as React.CSSProperties}
            >
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: C.text, marginBottom: 6, letterSpacing: '-0.015em' }}>
                {card.heading}
              </h3>
              <p style={{ fontSize: 11, fontWeight: 700, color: card.color, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>
                {card.tagline}
              </p>
              <p style={{ fontSize: '0.9375rem', color: C.muted, lineHeight: 1.75, flex: 1 }}>
                {card.body}
              </p>
              <div className="firm-card-link" style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: card.color, transition: 'gap 0.2s ease' }}>
                Learn more
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke={card.color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Scroll count-up hook ─────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1600, active = false) {
  const [val, setVal] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    if (!active || started.current) return
    started.current = true
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(target * eased))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [active, target, duration])
  return val
}

// ─── 3. Revenue Leakage Stat Panel ────────────────────────────────────────────
function LeakageStatPanel() {
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '56px 0' : '90px 0'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const cols = isTablet ? '1fr' : '1fr 1.4fr'
  const gap = isMobile ? '24px' : isTablet ? '32px' : '80px'
  const statCols = isMobile ? '1fr' : '1fr 1fr'
  const { ref, inView } = useInView(0.08)
  const count = useCountUp(5, 1400, inView)

  return (
    <section ref={ref as React.RefObject<HTMLElement>} style={{ background: C.bg, padding: sectionPad, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', bottom: '-5%', left: '-5%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(251,86,7,0.06) 0%, transparent 60%)' }} aria-hidden="true" />
      <div style={{ position: 'absolute', top: '20%', right: '-4%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 58%)' }} aria-hidden="true" />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: cols,
          gap,
          alignItems: 'center',
        }}>

          {/* Left: big stat with count-up */}
          <div style={{
            opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}>
            <div
              style={{
                fontSize: 'clamp(4rem,10vw,7.5rem)',
                fontWeight: 900, lineHeight: 1,
                letterSpacing: '-0.04em',
                color: C.text,
              }}
              aria-label="1 to 5 percent of EBITDA"
            >
              1<span style={{ color: C.text }}>–</span>{count}<span style={{ color: C.text, fontSize: '0.6em' }}>%</span>
            </div>
            <p style={{
              marginTop: 16, fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.18em',
              color: C.subtle,
            }}>
              Of EBITDA lost to revenue leakage
            </p>
            <div style={{ marginTop: 20, height: 1, width: 64, background: C.border }} aria-hidden="true" />
            <p style={{ marginTop: 16, fontSize: 13, color: C.subtle, fontStyle: 'italic' }}>
              EY revenue-leakage analysis
            </p>
          </div>

          {/* Right: content */}
          <div style={{
            opacity: inView ? 1 : 0, transform: inView ? 'translateX(0)' : 'translateX(20px)',
            transition: 'opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.azure, textTransform: 'uppercase', letterSpacing: '0.20em', display: 'block', marginBottom: 16 }}>
              The Cost of Revenue Leakage
            </span>
            <h2 style={{
              fontSize: 'clamp(1.6rem,2.8vw,2.2rem)', fontWeight: 700, color: C.text,
              letterSpacing: '-0.025em', lineHeight: 1.22, margin: '0 0 18px',
            }}>
              Firms routinely lose a measurable share of EBITDA before they know it is gone.
            </h2>
            <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.75, marginBottom: 14 }}>
              Billing errors, mis-priced mandates, and fragmented data gaps compound quietly across thousands of accounts and billing cycles. EY research estimates firms lose 1 to 5% of EBITDA annually to these structural leaks.
            </p>
            <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.75, marginBottom: 28 }}>
              For wealth and asset management firms, the exposure is structural: fee leakage, compensation disputes, and pricing gaps that compound before they surface in the financials.
            </p>

            {/* Stat figures — no border or background card treatment */}
            <div style={{ display: 'grid', gridTemplateColumns: statCols, gap: 24, marginBottom: 32 }}>
              <div>
                <p style={{ fontSize: 'clamp(1.85rem,2.8vw,2.45rem)', fontWeight: 800, color: C.text, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 6px' }}>$13M+</p>
                <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, margin: 0 }}>Annual value unlocked for clients</p>
              </div>
              <div>
                <p style={{ fontSize: 'clamp(1.85rem,2.8vw,2.45rem)', fontWeight: 800, color: C.text, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 6px' }}>&lt;1 yr</p>
                <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, margin: 0 }}>Typical payback period on direct savings</p>
              </div>
            </div>

            <Link
              href="/case-study/how-a-leading-wealth-manager-unlocked-over-13m-in-annual-value-by-replacing-legacy-infrastructure"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: C.azure, textDecoration: 'none' }}
            >
              Read the case study
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke={C.azure} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}

// ─── 4. Built For Your Role ───────────────────────────────────────────────────
const PERSONA_ACCENT = [C.azure, C.mandarin, C.honey, C.azure, C.mandarin]

const DEFAULT_PERSONAS = [
  {
    _key: 'ceo',
    icon: 'fa-building-columns',
    role: 'CEOs and Heads of Wealth',
    tagline: 'Enterprise visibility',
    value: 'See where pricing discipline, advisor behavior, and practice performance are creating or eroding enterprise value across the whole organization.',
    bullets: ['Firm-level pricing performance vs. peers', 'Advisor and branch benchmarking', 'Revenue capture vs. value delivered', 'Enterprise value impact of pricing behavior'],
    link: '/who-we-serve/head-of-wealth',
    linkLabel: 'See solutions for Heads of Wealth',
  },
  {
    _key: 'cfo',
    icon: 'fa-chart-line',
    role: 'CFOs and Finance Leaders',
    tagline: 'Revenue and margin clarity',
    value: 'Connect pricing decisions directly to revenue capture, profitability, and firm economics. See where margin is created and where it quietly erodes.',
    bullets: ['Pricing gaps mapped to revenue impact', 'Discount pattern analysis by segment', 'Revenue captured vs. value delivered', 'EBITDA margin improvement opportunities'],
    link: '/who-we-serve/finance',
    linkLabel: 'See solutions for Finance',
  },
  {
    _key: 'ops',
    icon: 'fa-gears',
    role: 'Operations Leaders',
    tagline: 'Workflow and scale',
    value: 'Eliminate manual reconciliation, automate billing cycles at scale, and maintain full audit-readiness across every client and entity relationship.',
    bullets: ['Automated billing at enterprise scale', 'Full audit trail at every stage', 'Exception management and escalation', 'System integrations consolidated'],
    link: '/who-we-serve/operations',
    linkLabel: 'See solutions for Operations',
  },
  {
    _key: 'advisors',
    icon: 'fa-user-tie',
    role: 'Advisor Teams',
    tagline: 'Clear next steps',
    value: 'Know exactly which clients, accounts, and relationships deserve attention next. No interpretation required. Specific, timely actions tied to your book.',
    bullets: ['AI-native next-best actions by client', 'Loyalty risk alerts before clients leave', 'Wallet share opportunities surfaced', 'Peer comparison to guide conversations'],
    link: null,
    linkLabel: null,
  },
  {
    _key: 'compliance',
    icon: 'fa-shield-halved',
    role: 'Compliance and Operations',
    tagline: 'Oversight and control',
    value: 'Improve visibility into pricing patterns, fee exceptions, and review opportunities. Escalate what needs attention before it becomes a problem.',
    bullets: ['Fee exception tracking and escalation', 'Pricing pattern monitoring at scale', 'Audit-ready pricing records', 'Compliance review queue prioritization'],
    link: null,
    linkLabel: null,
  },
]

const PERSONA_DURATION = 4500

function BuiltForRole({ personaCards }: { personaCards?: WhoWeServeCard[] }) {
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '56px 0' : '90px 0'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const stackTabs = isTablet
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const [active, setActive]   = useState(0)
  const [fillPct, setFillPct] = useState(0)
  const [paused, setPaused]   = useState(false)
  const startRef = useRef<number>(Date.now())
  const rafRef   = useRef<number>(0)

  const personas = DEFAULT_PERSONAS

  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.05 })
    obs.observe(el); return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || paused) { cancelAnimationFrame(rafRef.current); return }
    startRef.current = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startRef.current
      const pct = Math.min(100, (elapsed / PERSONA_DURATION) * 100)
      setFillPct(pct)
      if (elapsed >= PERSONA_DURATION) {
        setActive(a => (a + 1) % personas.length)
        startRef.current = Date.now(); setFillPct(0)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [visible, paused, active, personas.length])

  const goTo = (i: number) => { setActive(i); setFillPct(0); startRef.current = Date.now() }
  const p = personas[active]
  const accent = PERSONA_ACCENT[active]

  return (
    <section ref={ref} style={{ background: C.bg, padding: sectionPad, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '30%', right: '-5%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.06) 0%, transparent 60%)' }} aria-hidden="true" />
      <div style={{ position: 'absolute', bottom: '5%', left: '-4%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.05) 0%, transparent 58%)' }} aria-hidden="true" />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
        <div style={{
          marginBottom: 56,
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.mandarin, textTransform: 'uppercase', letterSpacing: '0.20em', display: 'block', marginBottom: 14 }}>
            Solutions for Your Role
          </span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.025em', color: C.text, maxWidth: 600 }}>
            Your mandate demands precision, transparency, and scalability.
          </h2>
        </div>

        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => { startRef.current = Date.now(); setFillPct(0); setPaused(false) }}
          style={{
            display: stackTabs ? 'grid' : 'flex', gridTemplateColumns: stackTabs ? '1fr' : undefined, gap: isMobile ? 16 : 32,
            opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
          }}
        >
          {/* Tab list */}
          <div style={{ width: stackTabs ? '100%' : '42%', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {personas.map((persona, i) => {
              const isActive = active === i
              const tabAccent = PERSONA_ACCENT[i]
              return (
                <button
                  key={persona._key}
                  onClick={() => goTo(i)}
                  onMouseEnter={() => goTo(i)}
                  style={{
                    position: 'relative', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', gap: 14,
                    width: '100%', padding: '16px 20px', textAlign: 'left',
                    background: isActive ? `${tabAccent}12` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isActive ? `${tabAccent}30` : C.border}`,
                    cursor: 'pointer',
                    transition: 'background 0.25s, border-color 0.25s',
                  }}
                >
                  {isActive && !paused && (
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0,
                      height: 2, width: `${fillPct}%`,
                      background: tabAccent, transition: 'none',
                    }} aria-hidden="true" />
                  )}
                  <div style={{
                    width: 38, height: 38, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }} aria-hidden="true">
                    <i className={`fa-solid ${persona.icon}`} style={{ color: isActive ? tabAccent : 'rgba(244,244,244,0.25)', fontSize: 14, transition: 'color 0.25s' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? C.text : C.muted, transition: 'color 0.25s', marginBottom: 2 }}>
                      {persona.role}
                    </div>
                    {persona.tagline && (
                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: isActive ? tabAccent : 'rgba(244,244,244,0.25)', transition: 'color 0.25s' }}>
                        {persona.tagline}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 14, color: isActive ? tabAccent : 'rgba(244,244,244,0.15)', transform: isActive ? 'translateX(3px)' : 'none', transition: 'color 0.25s, transform 0.25s' }} aria-hidden="true">
                    →
                  </span>
                </button>
              )
            })}
          </div>

          {/* Detail panel */}
          <div style={{ flex: 1 }}>
            <div style={{
              position: stackTabs ? 'relative' : 'sticky', top: stackTabs ? 'auto' : 96,
              background: 'rgba(26,20,16,0.6)',
              border: `1px solid ${accent}30`,
              overflow: 'hidden', minHeight: isMobile ? 0 : 380,
            }}>
              <div style={{ position: 'absolute', top: -32, right: -32, width: 180, height: 180, pointerEvents: 'none', background: `radial-gradient(circle, ${accent}14 0%, transparent 70%)`, filter: 'blur(40px)' }} aria-hidden="true" />
              <div style={{ position: 'relative', padding: isMobile ? '28px 24px' : '40px 44px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
                  <div style={{ width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }} aria-hidden="true">
                    <i className={`fa-solid ${p.icon}`} style={{ color: accent, fontSize: 17 }} />
                  </div>
                  <div>
                    {p.tagline && (
                      <div style={{ fontSize: 10, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 4 }}>
                        {p.tagline}
                      </div>
                    )}
                    <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, color: C.text, lineHeight: 1.25, letterSpacing: '-0.02em' }}>
                      {p.role}
                    </h3>
                  </div>
                </div>
                <p style={{ fontSize: '0.9375rem', color: C.muted, lineHeight: 1.75, marginBottom: 32 }}>
                  {p.value}
                </p>
                {p.bullets && (
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10, marginBottom: p.link ? 32 : 0 }}>
                    {p.bullets.map((b, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.025)', border: `1px solid ${C.border}` }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: accent, boxShadow: `0 0 5px ${accent}` }} aria-hidden="true" />
                        <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.4 }}>{b}</span>
                      </div>
                    ))}
                  </div>
                )}
                {p.link && p.linkLabel && (
                  <Link
                    href={p.link}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: accent, textDecoration: 'none' }}
                  >
                    {p.linkLabel}
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke={accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── 5. Final CTA — no gradient border, matches homepage ContactRow spacing ───
const CTA_PROPS = [
  { icon: 'fa-users',                   color: C.azure,    title: 'Built for Your Business Model',   desc: 'Purpose-built for wealth managers, asset managers, and asset servicers navigating complex fee and compensation structures.' },
  { icon: 'fa-magnifying-glass-dollar', color: C.mandarin, title: 'Stop Revenue Leakage',             desc: 'Identify and recover the 1 to 5% of EBITDA firms routinely lose to billing errors, mis-priced contracts, and data gaps.' },
  { icon: 'fa-shield-halved',           color: C.honey,    title: 'Enterprise-Scale Control',         desc: 'Maintain full oversight of your revenue lifecycle with real-time data transparency across every entity and relationship.' },
]

function FinalCTA() {
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '56px 0' : '90px 0'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const cols = isTablet ? '1fr' : 'repeat(2, minmax(0, 1fr))'
  const gap = isMobile ? '24px' : isTablet ? '32px' : '80px'
  const { ref, inView } = useInView(0.05)
  return (
    <section ref={ref as React.RefObject<HTMLElement>} style={{ background: C.bg, padding: sectionPad, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 1000, height: 600, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.07) 0%, transparent 60%)' }} aria-hidden="true" />
      <div style={{ position: 'absolute', bottom: '0%', left: '5%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.05) 0%, transparent 60%)' }} aria-hidden="true" />
      <div style={{ position: 'absolute', top: '20%', right: '0%', width: 400, height: 350, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.04) 0%, transparent 60%)' }} aria-hidden="true" />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
        <div style={{ display: 'grid', gridTemplateColumns: cols, gap, alignItems: 'center' }}>

          {/* Left: value props */}
          <div>
            {CTA_PROPS.map((f, i) => (
              <div key={f.title} style={{
                display: 'flex', alignItems: 'flex-start', gap: 16,
                padding: '20px 0',
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateX(0)' : 'translateX(-12px)',
                transition: `opacity 0.5s ease ${0.3 + i * 0.1}s, transform 0.5s ease ${0.3 + i * 0.1}s`,
              }}>
                <div style={{ width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }} aria-hidden="true">
                  <i className={`fa-solid ${f.icon}`} style={{ color: f.color, fontSize: 17 }} />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1 }}>{f.title}</p>
                  <p style={{ marginTop: 6, fontSize: 15, color: C.muted, lineHeight: 1.72, margin: '6px 0 0' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: headline + CTA */}
          <div style={{ opacity: inView ? 1 : 0, transition: 'opacity 0.6s ease 0.2s' }}>
            <h2 style={{
              fontSize: 'clamp(1.8rem,3vw,2.6rem)',
              fontWeight: 700, color: C.text,
              letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0,
            }}>
              Turn revenue operations into a{' '}
              <span style={{
                background: SUNSET,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                strategic advantage.
              </span>
            </h2>
            <p style={{ marginTop: 18, fontSize: 16, color: C.muted, lineHeight: 1.75 }}>
              Schedule a conversation to identify gaps, reduce risk, and strengthen control across your revenue lifecycle at enterprise scale.
            </p>
            <div style={{ marginTop: 30 }}>
              <Link href="/contact" className="btn-primary">Get in contact</Link>
            </div>
            <p style={{ marginTop: 16, fontSize: 13, color: C.subtle }}>Trusted by the top global financial firms.</p>
          </div>

        </div>
      </div>
    </section>
  )
}

// ─── Page export ───────────────────────────────────────────────────────────────
export default function WhoWeServeClient({ industryCards, personaCards }: WhoWeServeProps) {
  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
          }
        }
      `}</style>
      <main id="main-content" style={{ fontFamily: "'Carlito', 'Segoe UI', sans-serif", background: C.bg, overflow: 'hidden' }}>
      <Hero />
      <FirmTypes industryCards={industryCards} />
      <LeakageStatPanel />
      <BuiltForRole personaCards={personaCards} />
      <FinalCTA />
      </main>
    </>
  )
}