'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { PointerEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity/client'
import { type ClientLogo } from '@/components/sections/LogoCarousel'
import { motion, useInView as useFramerInView } from 'framer-motion'

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
  fees:     '#ED65D0',
  comp:     '#FF006E',
  practice: '#ffb30c',
}
const SUNSET = 'linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%)'
const ACCENT = '#FF006E'

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

function useInView(threshold = 0.08) {
  const ref = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

// ─── 1. Hero ──────────────────────────────────────────────────────────────────
function Hero({ heroImage }: { heroImage: any | null }) {
  const [mounted, setMounted] = useState(false)
  const { isMobile, isTablet } = useBreakpoint()
  useEffect(() => { setTimeout(() => setMounted(true), 80) }, [])

  const sectionPad = isMobile ? '40px 0 32px' : isTablet ? '56px 0 40px' : '64px 0 40px'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const cols = isTablet ? '1fr' : '1fr 1fr'
  const gap = isMobile ? '24px' : isTablet ? '32px' : '80px'

  const imageEl = heroImage ? (
    <div style={{ position: 'relative', width: '100%', minHeight: isMobile ? 220 : 340 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(255,0,110,0.10) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }} aria-hidden="true" />
      <img src={urlFor(heroImage).width(900).url()} alt="Compensation platform dashboard" style={{ width: '100%', height: 'auto', display: 'block', position: 'relative', zIndex: 2 }} />
    </div>
  ) : (
    <div style={{ width: '100%', height: isMobile ? 220 : 340, background: C.surface, border: `1px solid rgba(255,0,110,0.18)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: C.subtle, fontSize: 13 }}>Dashboard preview</span>
    </div>
  )

  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: `radial-gradient(ellipse 120% 80% at 60% 20%, rgba(255,0,110,0.07) 0%, #140f0c 55%)`, minHeight: isMobile ? 'auto' : isTablet ? '70vh' : '72vh', display: 'flex', alignItems: 'center' }}>
      <div style={{ position: 'absolute', top: '-10%', right: '-6%', width: 700, height: 600, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,0,110,0.08) 0%, transparent 60%)' }} aria-hidden="true" />
      <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 60%)' }} aria-hidden="true" />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 160, background: `linear-gradient(to bottom, transparent, ${C.bg})`, pointerEvents: 'none', zIndex: 1 }} aria-hidden="true" />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: sectionPad, width: '100%', position: 'relative', zIndex: 2, boxSizing: 'border-box' }}>
        <div style={{ padding: innerPad }}>
          {isTablet && (<div style={{ marginBottom: 28, opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease' }}>{imageEl}</div>)}
          <div style={{ display: 'grid', gridTemplateColumns: cols, gap, alignItems: 'center' }}>
            <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
              <div style={{ marginBottom: 16 }}><span style={{ fontSize: 11, fontWeight: 700, color: C.comp, textTransform: 'uppercase', letterSpacing: '0.20em' }}>Compensation</span></div>
              <h1 style={{ fontSize: isMobile ? 'clamp(1.75rem, 7vw, 2.5rem)' : 'clamp(2rem, 4vw, 3.25rem)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.028em', color: C.text, maxWidth: 560, marginBottom: 20 }}>
                Advisor compensation software that <span style={{ color: C.comp }}>improves profitability and scalability.</span>
              </h1>
              <p style={{ fontSize: isMobile ? '0.9375rem' : '1.0625rem', color: C.muted, lineHeight: 1.75, maxWidth: 480, marginBottom: 32 }}>
                Attract and retain top talent with strategic compensation programs that drive results, reduce errors, and align advisor performance with firm growth. Built for the scale and complexity of modern wealth and asset management.
              </p>
              <Link href="/contact" className="btn-primary" style={{ borderColor: C.comp }}>Request a Demo</Link>
            </div>
            {!isTablet && (<div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateX(0)' : 'translateX(32px)', transition: 'opacity 0.8s ease 0.15s, transform 0.8s ease 0.15s', position: 'relative', minHeight: 340 }}>{imageEl}</div>)}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── 2. The Problem ────────────────────────────────────────────────────────────
const PAIN_CARDS = [
  { icon: 'fa-calculator',                   title: 'Payout errors',             desc: 'Multi-variable compensation calculations fail under manual processes, producing errors that erode advisor trust and trigger costly reconciliation cycles.' },
  { icon: 'fa-code-branch',                  title: 'Misaligned incentives',     desc: 'Compensation plans disconnected from strategic goals reward the wrong behaviors, quietly compressing margins and reducing firm-wide profitability.' },
  { icon: 'fa-hourglass-half',               title: 'Manual complexity',         desc: 'Spreadsheet-driven payout runs create bottlenecks at every cycle. As advisor networks grow, the manual approach simply cannot scale.' },
  { icon: 'fa-eye-slash',                    title: 'No performance visibility', desc: 'Without a connected view of compensation and revenue, leaders cannot see which advisors, plans, or regions are creating or destroying value.' },
  { icon: 'fa-person-walking-arrow-right',   title: 'Advisor attrition',         desc: 'Inaccurate or opaque compensation erodes advisor confidence. When payouts are wrong or unexplained, high performers look elsewhere.' },
]

function TheProblem() {
  const { ref, inView } = useInView(0.1)
  const { isMobile, isTablet } = useBreakpoint()
  const [revealed, setRevealed] = useState<boolean[]>(new Array(PAIN_CARDS.length).fill(false))
  const [dotsLit, setDotsLit] = useState<boolean[]>(new Array(PAIN_CARDS.length - 1).fill(false))

  useEffect(() => {
    if (!inView) return
    PAIN_CARDS.forEach((_, i) => {
      setTimeout(() => {
        setRevealed(prev => { const n = [...prev]; n[i] = true; return n })
        if (i < PAIN_CARDS.length - 1) setTimeout(() => { setDotsLit(prev => { const n = [...prev]; n[i] = true; return n }) }, 160)
      }, 150 + i * 250)
    })
  }, [inView])

  const sectionPad = isMobile ? '64px 0' : '80px 0'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const headerCols = isTablet ? '1fr' : '1fr 1fr'
  const headerGap = isMobile ? '16px' : isTablet ? '24px' : '80px'
  const cardGridCols = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : undefined

  return (
    <section ref={ref as React.RefObject<HTMLElement>} style={{ background: C.bg, padding: sectionPad, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,0,110,0.06) 0%, transparent 60%)' }} aria-hidden="true" />
      <div style={{ position: 'absolute', bottom: '-5%', right: '-8%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(251,86,7,0.05) 0%, transparent 60%)' }} aria-hidden="true" />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad, boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: headerCols, gap: headerGap, marginBottom: isMobile ? 40 : 56, alignItems: 'start' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.75rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.025em', margin: 0, opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
            <span style={{ color: C.text }}>Compensation complexity is costing you </span><span style={{ color: C.comp }}>more than errors.</span>
          </h2>
          <div style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s' }}>
            <p style={{ fontSize: '1rem', color: C.muted, lineHeight: 1.75, margin: '0 0 16px' }}>Complex plans, manual adjustments, opaque payout logic, and recurring disputes create friction between the firm and the advisors it depends on to grow. The result is a compensation process that consumes operational capacity, erodes trust, and leaves firms with less control over the behaviors they are trying to encourage.</p>
          </div>
        </div>
        {isTablet ? (
          <div style={{ display: 'grid', gridTemplateColumns: cardGridCols!, gap: 12 }}>
            {PAIN_CARDS.map((card, i) => (
              <div key={card.title} style={{ padding: '24px 20px 22px', background: revealed[i] ? 'rgba(251,86,7,0.06)' : 'rgba(255,255,255,0.01)', border: `1px solid ${revealed[i] ? 'rgba(251,86,7,0.28)' : C.border}`, position: 'relative', overflow: 'hidden', opacity: revealed[i] ? 1 : 0, transform: revealed[i] ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.5s ease, transform 0.5s ease, background 0.3s, border-color 0.3s', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* icon: no top accent bar, no bg/border */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }} aria-hidden="true">
                  <i className={`fa-solid ${card.icon}`} style={{ color: 'rgba(251,86,7,0.85)', fontSize: 16 }} aria-hidden="true" />
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>{card.title}</div>
                <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.65, margin: 0, flex: 1 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
            {PAIN_CARDS.map((card, i) => (
              <div key={card.title} style={{ display: 'flex', alignItems: 'stretch', flex: 1, minWidth: 0 }}>
                <div style={{ flex: 1, padding: '28px 22px 26px', background: revealed[i] ? 'rgba(251,86,7,0.06)' : 'rgba(255,255,255,0.01)', border: `1px solid ${revealed[i] ? 'rgba(251,86,7,0.28)' : C.border}`, position: 'relative', overflow: 'hidden', opacity: revealed[i] ? 1 : 0, transform: revealed[i] ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.5s ease, transform 0.5s ease, background 0.3s, border-color 0.3s', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* icon: no top accent bar, no bg/border */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }} aria-hidden="true">
                    <i className={`fa-solid ${card.icon}`} style={{ color: 'rgba(251,86,7,0.85)', fontSize: 16 }} aria-hidden="true" />
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>{card.title}</div>
                  <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.65, margin: 0, flex: 1 }}>{card.desc}</p>
                </div>
                {i < PAIN_CARDS.length - 1 && (
                  <div style={{ width: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, flexDirection: 'column' }}>
                    {Array.from({ length: 3 }).map((_, di) => <div key={di} style={{ width: 3, height: 3, borderRadius: '50%', background: dotsLit[i] ? 'rgba(251,86,7,0.6)' : 'rgba(255,255,255,0.08)', opacity: dotsLit[i] ? 1 : 0.3, transform: dotsLit[i] ? 'scale(1)' : 'scale(0.5)', transition: `all 0.3s ease ${di * 0.08}s` }} aria-hidden="true" />)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── 3. Features Carousel ─────────────────────────────────────────────────────
const FEATURES = [
  { icon: 'fa-bullseye',        title: 'Goal Alignment',       body: 'Design compensation plans that match strategic goals. Connect advisor performance to firm-wide growth and create structures that reinforce the right behaviors across every role and region.' },
  { icon: 'fa-gears',           title: 'Calculation Engine',   body: 'Streamline manual compensation processes and eliminate errors in multi-variable payout calculations. Deliver accurate results, every cycle, at any scale.' },
  { icon: 'fa-sliders',         title: 'Oversight Simplified', body: 'Build and modify incentive programs with ease. Adjust participants and parameters on demand, and manage programs through a simple, intuitive interface.' },
  { icon: 'fa-handshake',       title: 'Advisor Trust',        body: 'Recruit, onboard, and retain high-performing advisors. Increase transparency with clear compensation statements and drive satisfaction through accurate, timely payouts.' },
  { icon: 'fa-arrow-trend-up',  title: 'Revenue Boost',        body: 'Use KPIs and real-time data to link payouts directly to results. Incentivize the behaviors that grow revenue and create data-driven performance targets that compound over time.' },
  { icon: 'fa-rotate',          title: 'Optimized Workflows',  body: 'Modernize outdated or manual compensation plans. Reconcile legacy systems, remove friction from payout operations, and build alignment across teams and regions.' },
]
const CAROUSEL_DURATION = 3200

function FeaturesCarousel({ accent }: { accent: string }) {
  const { ref, inView } = useInView(0.05)
  const { isMobile, isTablet } = useBreakpoint()
  const N = FEATURES.length
  const [active, setActive] = useState(0), [fillPct, setFillPct] = useState(0), [paused, setPaused] = useState(false)
  const rafRef = useRef<number>(0), startRef = useRef<number>(Date.now()), dragRef = useRef({ down: false, startX: 0, moved: false })
  const aRgb = '255,0,110'

  const prev = useCallback(() => { setActive(a => a - 1); setFillPct(0); startRef.current = Date.now() }, [])
  const next = useCallback(() => { setActive(a => a + 1); setFillPct(0); startRef.current = Date.now() }, [])

  useEffect(() => {
    if (paused) { cancelAnimationFrame(rafRef.current); return }
    startRef.current = Date.now()
    const tick = () => { const elapsed = Date.now() - startRef.current; setFillPct(Math.min(100, (elapsed / CAROUSEL_DURATION) * 100)); if (elapsed >= CAROUSEL_DURATION) { setActive(a => a + 1); setFillPct(0); startRef.current = Date.now() }; rafRef.current = requestAnimationFrame(tick) }
    rafRef.current = requestAnimationFrame(tick); return () => cancelAnimationFrame(rafRef.current)
  }, [paused, active])

  const onPointerDown = (e: React.PointerEvent) => { dragRef.current = { down: true, startX: e.clientX, moved: false }; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); setPaused(true) }
  const onPointerMove = (e: React.PointerEvent) => { if (!dragRef.current.down) return; if (Math.abs(e.clientX - dragRef.current.startX) > 8) dragRef.current.moved = true }
  const onPointerUp = (e: React.PointerEvent) => { if (!dragRef.current.down) return; const dx = e.clientX - dragRef.current.startX; if (Math.abs(dx) > 40) dx < 0 ? next() : prev(); dragRef.current.down = false; setFillPct(0); startRef.current = Date.now(); setPaused(false) }

  const cardWidth = 340, cardGap = 20, step = cardWidth + cardGap, WINDOW = 4, cardSlots = Array.from({ length: WINDOW * 2 + 1 }, (_, k) => k - WINDOW)
  const f = FEATURES[((active % N) + N) % N]
  const sectionPad = isMobile ? '64px 0' : '80px 0', innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const cols = isTablet ? '1fr' : '1.04fr 1.55fr'

  return (
    <section ref={ref as React.RefObject<HTMLElement>} style={{ background: C.bg, padding: sectionPad, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-5%', left: '20%', width: 700, height: 400, pointerEvents: 'none', background: `radial-gradient(ellipse, rgba(${aRgb},0.06) 0%, transparent 60%)` }} aria-hidden="true" />
      <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: 550, height: 450, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 58%)' }} aria-hidden="true" />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad, boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: isTablet ? '32px' : '40px', alignItems: 'center' }}>
          <div style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.03em', color: C.text, marginBottom: 20 }}>Turn compensation into a <span style={{ color: accent }}>competitive edge.</span></h2>
            <p style={{ fontSize: '0.9375rem', color: C.muted, lineHeight: 1.75, maxWidth: 460, marginBottom: 40 }}>Compensation should do more than calculate payouts. It should create alignment between the firm&apos;s strategy and the advisor behaviors that drive growth. PureFacts helps firms manage complex compensation plans with accuracy, transparency, and auditability, reducing manual effort and payout friction so advisors can spend less time questioning compensation and more time serving clients.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[{ label: '←', fn: prev }, { label: '→', fn: next }].map(({ label, fn }) => (
                <button key={label} onClick={() => { fn(); setPaused(true); setTimeout(() => setPaused(false), 4000) }}
                  style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: `1px solid ${C.border}`, color: C.muted, fontSize: 16, cursor: 'pointer', transition: 'border-color 0.2s, color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = accent; (e.currentTarget as HTMLElement).style.color = accent }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.muted }}
                  aria-label={label === '←' ? 'Previous feature' : 'Next feature'}>{label}</button>
              ))}
            </div>
          </div>

          {isTablet ? (
            // tablet: no top accent bar, no icon bg/border
            <div style={{ padding: '32px 28px 24px', background: `rgba(${aRgb},0.07)`, border: `1px solid ${accent}`, position: 'relative', overflow: 'hidden' }}
              onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', marginBottom: 20 }}>
                <i className={`fa-solid ${f.icon}`} style={{ color: accent, fontSize: 20 }} aria-hidden="true" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 10, lineHeight: 1.3 }}>{f.title}</div>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: 0 }}>{f.body}</p>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `rgba(${aRgb},0.12)` }} aria-hidden="true">
                <div style={{ height: '100%', width: `${fillPct}%`, background: accent, transition: 'none' }} />
              </div>
            </div>
          ) : (
            // desktop: no top accent bar, no icon bg/border, fontSize 20
            <div style={{ overflow: 'hidden', position: 'relative', cursor: 'grab', height: 320 }}
              onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
              onMouseEnter={() => setPaused(true)} onMouseLeave={() => { setFillPct(0); startRef.current = Date.now(); setPaused(false) }}>
              {cardSlots.map(offset => {
                const featureIndex = ((active + offset) % N + N) % N, feat = FEATURES[featureIndex], isCenter = offset === 0
                return (
                  <div key={`slot-${offset}`}
                    onClick={() => { if (!dragRef.current.moved && !isCenter) setActive(a => a + offset) }}
                    style={{ position: 'absolute', top: 0, left: 0, width: cardWidth, height: '100%', padding: '32px 28px 20px', background: isCenter ? `rgba(${aRgb},0.07)` : C.surface, border: `1px solid ${isCenter ? accent : C.border}`, overflow: 'hidden', opacity: Math.abs(offset) <= 1 ? (isCenter ? 1 : 0.5) : 0, transform: `translateX(${offset * step}px)`, transition: 'opacity 0.35s ease, border-color 0.35s ease, background 0.35s ease, transform 0.45s cubic-bezier(0.4,0,0.2,1)', cursor: isCenter ? 'default' : 'pointer', pointerEvents: Math.abs(offset) > 2 ? 'none' : 'auto', boxSizing: 'border-box' }}>
                    {/* no top accent bar */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', marginBottom: 20 }}>
                      <i className={`fa-solid ${feat.icon}`} style={{ color: accent, fontSize: 20 }} aria-hidden="true" />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 10, lineHeight: 1.3 }}>{feat.title}</div>
                    <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: 0 }}>{feat.body}</p>
                    {isCenter && (<div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `rgba(${aRgb},0.12)` }} aria-hidden="true"><div style={{ height: '100%', width: `${fillPct}%`, background: accent, transition: 'none' }} /></div>)}
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

// ─── 4. Platform Connection ───────────────────────────────────────────────────
const DIAGRAM_WEDGES = [
  { id: 'practice', label: 'Practice Management', startAngle: -60, endAngle: 60,  fill: 'none', stroke: '#ffb30c', faUnicode: '\uf201' },
  { id: 'comp',     label: 'Compensation',         startAngle: 60,  endAngle: 180, fill: 'none', stroke: '#FF006E', faUnicode: '\uf51e' },
  { id: 'fees',     label: 'Fees & Billing',        startAngle: 180, endAngle: 300, fill: 'none', stroke: '#ED65D0', faUnicode: '\uf571' },
]
function diagramPolarToXY(cx: number, cy: number, r: number, angleDeg: number) { const rad = (angleDeg - 90) * Math.PI / 180; return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) } }
function diagramWedgePath(cx: number, cy: number, outerR: number, innerR: number, s: number, e: number) {
  const o1 = diagramPolarToXY(cx, cy, outerR, s), o2 = diagramPolarToXY(cx, cy, outerR, e), i2 = diagramPolarToXY(cx, cy, innerR, e), i1 = diagramPolarToXY(cx, cy, innerR, s), lg = e - s > 180 ? 1 : 0
  return `M${o1.x} ${o1.y} A${outerR} ${outerR} 0 ${lg} 1 ${o2.x} ${o2.y} L${i2.x} ${i2.y} A${innerR} ${innerR} 0 ${lg} 0 ${i1.x} ${i1.y}Z`
}
function PureRevenueDiagram({ visible }: { visible: boolean }) {
  const { isMobile } = useBreakpoint()
  const VB = 200, CX = 100, CY = 100, INNER = 43, OUTER = 84, WEDGE_INNER = INNER + 2, LABEL_R = OUTER + 18, HUB_R = INNER
  const wrapSize = isMobile ? 'min(220px, 78vw)' : 'min(340px, 88%)'
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', width: 'min(260px, 70%)', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,132,255,0.13) 0%, transparent 70%)', pointerEvents: 'none' }} aria-hidden="true" />
      <div style={{ position: 'relative', width: wrapSize, aspectRatio: '1' }}>
        <svg viewBox={`0 0 ${VB} ${VB}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs><radialGradient id="hub-grad-ic" cx="40%" cy="35%" r="60%"><stop offset="0%" stopColor="rgba(59,132,255,0.20)" /><stop offset="100%" stopColor="rgba(59,132,255,0.05)" /></radialGradient></defs>
          {DIAGRAM_WEDGES.map((w, wi) => {
            const path = diagramWedgePath(CX, CY, OUTER, WEDGE_INNER, w.startAngle, w.endAngle), mid = (w.startAngle + w.endAngle) / 2
            const iconPt = diagramPolarToXY(CX, CY, (OUTER + WEDGE_INNER) / 2, mid), labelPt = diagramPolarToXY(CX, CY, LABEL_R, mid)
            const textAnchor = labelPt.x < CX - 5 ? 'end' : labelPt.x > CX + 5 ? 'start' : 'middle', words = w.label.split(' '), half = Math.ceil(words.length / 2)
            return (<g key={w.id}><path d={path} fill={w.fill} stroke={w.stroke} strokeWidth="1.5" opacity={visible ? 1 : 0} style={{ transformOrigin: `${CX}px ${CY}px`, transform: visible ? 'scale(1)' : 'scale(0.88)', transition: `opacity 0.55s ease ${wi * 0.18}s, transform 0.55s ease ${wi * 0.18}s` }} /><text x={iconPt.x} y={iconPt.y} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="900" fontFamily="'Font Awesome 6 Free', 'Font Awesome 6 Pro', 'Font Awesome 5 Free'" fill={w.stroke} opacity={visible ? 1 : 0} style={{ transition: `opacity 0.4s ease ${wi * 0.18 + 0.18}s` }}>{w.faUnicode}</text><text x={labelPt.x} y={labelPt.y} textAnchor={textAnchor} dominantBaseline="middle" fontSize="8.5" fontWeight="700" fill={w.stroke} style={{ letterSpacing: '0.02em', opacity: visible ? 1 : 0, transition: `opacity 0.4s ease ${wi * 0.18 + 0.30}s` }}>{words.length > 1 ? (<><tspan x={labelPt.x} dy="-0.6em">{words.slice(0, half).join(' ')}</tspan><tspan x={labelPt.x} dy="1.3em">{words.slice(half).join(' ')}</tspan></>) : w.label}</text></g>)
          })}
          <circle cx={CX} cy={CY} r={HUB_R + 2} fill="#140f0c" /><circle cx={CX} cy={CY} r={HUB_R} fill="none" stroke="rgba(59,132,255,0.18)" strokeWidth="1.5" /><circle cx={CX} cy={CY} r={HUB_R} fill="none" opacity={visible ? 1 : 0} style={{ transformOrigin: `${CX}px ${CY}px`, transform: visible ? 'scale(1)' : 'scale(0.7)', transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s' }} /><circle cx={CX} cy={CY} r={HUB_R} fill="none" stroke="rgba(59,132,255,0.45)" strokeWidth="1.5" />
          <text x={CX} y={CY} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="600" fill="#f4f4f4" style={{ letterSpacing: '0.02em', opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease 0.38s' }}><tspan x={CX} dy="-5">Revenue Book</tspan><tspan x={CX} dy="11">of Record</tspan></text>
        </svg>
      </div>
    </div>
  )
}

const LEFT_NODES = [{ label: 'Custodians', sub: 'Holdings and transactions' }, { label: 'Portfolio Management', sub: 'AUM, accounts, positions' }, { label: 'CRM', sub: 'Client and advisor data' }, { label: 'Trading Platform', sub: 'Order and execution data' }]
const RIGHT_NODES = [{ label: 'Accounting Systems', sub: 'GL, reconciliation' }, { label: 'Billing Systems', sub: 'Invoicing and collections' }, { label: 'Compensation Systems', sub: 'Payout structures' }, { label: 'Customer Data Lakes', sub: 'Enterprise data sources' }]

function FoundationVisual({ visible, accent }: { visible: boolean; accent: string }) {
  const containerRef = useRef<HTMLDivElement>(null), [size, setSize] = useState({ w: 600, h: 420 })
  useEffect(() => { const el = containerRef.current; if (!el) return; const ro = new ResizeObserver(e => setSize({ w: e[0].contentRect.width, h: e[0].contentRect.height })); ro.observe(el); return () => ro.disconnect() }, [])
  const { w } = size, NODE_W = 162, NODE_H = 44, LEFT_X = 24, RIGHT_X = w - 24 - NODE_W, NODE_TOPS = [88, 160, 232, 304], HUB_R = 62, cx = w / 2, cy = (NODE_TOPS[0] + NODE_TOPS[3] + NODE_H) / 2
  const leftConns = NODE_TOPS.map(top => ({ fromX: LEFT_X + NODE_W, fromY: top + NODE_H / 2 })), rightConns = NODE_TOPS.map(top => ({ fromX: RIGHT_X, fromY: top + NODE_H / 2 }))
  const aRgb = '255,0,110'
  function hubEntry(fromX: number, fromY: number) { const dx = cx - fromX, dy = cy - fromY, dist = Math.sqrt(dx * dx + dy * dy); return { x: cx - (dx / dist) * HUB_R, y: cy - (dy / dist) * HUB_R } }
  function nodePath(fromX: number, fromY: number) { const e = hubEntry(fromX, fromY), midX = (fromX + cx) / 2; return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${e.y}, ${e.x} ${e.y}` }
  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: cx - HUB_R * 2.2, top: cy - HUB_R * 2.2, width: HUB_R * 4.4, height: HUB_R * 4.4, borderRadius: '50%', pointerEvents: 'none', background: `radial-gradient(circle, rgba(${aRgb},0.10) 0%, transparent 70%)` }} aria-hidden="true" />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} aria-hidden="true">
        {leftConns.map((c, i) => <path key={`l${i}`} d={nodePath(c.fromX, c.fromY)} fill="none" stroke={accent} strokeWidth="1.5" strokeOpacity={visible ? 0.55 : 0} style={{ transition: `stroke-opacity 0.5s ease ${0.4 + i * 0.1}s` }} />)}
        {rightConns.map((c, i) => <path key={`r${i}`} d={nodePath(c.fromX, c.fromY)} fill="none" stroke={accent} strokeWidth="1.5" strokeOpacity={visible ? 0.55 : 0} style={{ transition: `stroke-opacity 0.5s ease ${0.5 + i * 0.1}s` }} />)}
        {visible && leftConns.map((c, i) => <circle key={`lp${i}`} r="2.5" fill={accent} opacity="0.9"><animateMotion dur={`${1.8 + i * 0.25}s`} repeatCount="indefinite" begin={`${i * 0.4}s`} path={nodePath(c.fromX, c.fromY)} /></circle>)}
        {visible && rightConns.map((c, i) => <circle key={`rp${i}`} r="2.5" fill={accent} opacity="0.9"><animateMotion dur={`${1.8 + i * 0.25}s`} repeatCount="indefinite" begin={`${i * 0.4 + 0.3}s`} path={nodePath(c.fromX, c.fromY)} /></circle>)}
        <circle cx={cx} cy={cy} r={HUB_R} fill="none" stroke={`rgba(${aRgb},0.45)`} strokeWidth="1.5" />
      </svg>
      {LEFT_NODES.map((node, i) => <div key={node.label} style={{ position: 'absolute', left: LEFT_X, top: NODE_TOPS[i], width: NODE_W, height: NODE_H, background: C.surface, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-12px)', transition: `opacity 0.45s ease ${i * 0.09}s, transform 0.45s ease ${i * 0.09}s` }}><span style={{ fontSize: 12, fontWeight: 600, color: C.text, textAlign: 'center', padding: '0 8px' }}>{node.label}</span></div>)}
      {RIGHT_NODES.map((node, i) => <div key={node.label} style={{ position: 'absolute', left: RIGHT_X, top: NODE_TOPS[i], width: NODE_W, height: NODE_H, background: C.surface, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(12px)', transition: `opacity 0.45s ease ${0.12 + i * 0.09}s, transform 0.45s ease ${0.12 + i * 0.09}s` }}><span style={{ fontSize: 12, fontWeight: 600, color: C.text, textAlign: 'center', padding: '0 8px' }}>{node.label}</span></div>)}
      <div style={{ position: 'absolute', left: cx - HUB_R, top: cy - HUB_R, width: HUB_R * 2, height: HUB_R * 2, borderRadius: '50%', border: `2px solid rgba(${aRgb},0.75)`, background: `radial-gradient(circle at 40% 35%, rgba(${aRgb},0.35), rgba(${aRgb},0.10))`, backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 5, opacity: visible ? 1 : 0, transform: visible ? 'scale(1)' : 'scale(0.7)', transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.text, lineHeight: 1.35, textAlign: 'center', padding: '0 10px' }}>Revenue Book<br />of Record</span>
      </div>
    </div>
  )
}

const MODULES = [
  { id: 'fees', name: 'Fees and Billing', tagline: 'Fee Management', color: '#ED65D0', colorMuted: 'rgba(237,101,208,0.09)', border: 'rgba(237,101,208,0.28)', href: '/platform/fees-and-billing', active: false, points: ['Complex fee schedule management', 'Automated billing runs at scale', 'Zero tolerance for calculation errors'], stat: { value: '$3B+', label: 'fees calculated annually' } },
  { id: 'comp', name: 'Compensation', tagline: 'Advisor Compensation', color: '#FF006E', colorMuted: 'rgba(255,0,110,0.09)', border: 'rgba(255,0,110,0.28)', href: '#', active: true, points: ['Sophisticated payout structures', 'Incentive and governance controls', 'Transparency that builds advisor trust'], stat: { value: '100%', label: 'payout accuracy' } },
  { id: 'practice', name: 'Practice Management', tagline: 'Revenue Intelligence', color: '#ffb30c', colorMuted: 'rgba(255,179,12,0.09)', border: 'rgba(255,179,12,0.28)', href: '/platform/practice-management', active: false, points: ['Pricing gap identification at scale', 'AI-native next-best advisor actions', 'Connected to Revenue Book of Record'], stat: { value: 'Real-time', label: 'pricing intelligence' } },
]

function ModuleCard({ mod, index, visible }: { mod: typeof MODULES[0]; index: number; visible: boolean }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }} transition={{ duration: 0.55, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ flex: 1, minWidth: 220, padding: '28px 28px 24px', border: `1px solid ${mod.border}`, background: mod.active ? mod.colorMuted : (hovered ? mod.colorMuted : C.surface), borderRadius: 12, display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s, background 0.2s', position: 'relative', overflow: 'hidden' }}>
      {mod.active && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse at top left, rgba(255,0,110,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} aria-hidden="true" />}
      <div style={{ marginBottom: 18 }}><div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: mod.color, marginBottom: 5 }}>{mod.active ? 'Current Module' : mod.tagline}</div><div style={{ fontSize: 21, fontWeight: 700, color: C.text, letterSpacing: '-0.02em' }}>{mod.name}</div></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>{mod.points.map((pt, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 5, height: 5, borderRadius: '50%', background: mod.color, flexShrink: 0 }} aria-hidden="true" /><span style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6 }}>{pt}</span></div>)}</div>
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'baseline', gap: 6 }}><span style={{ fontSize: 24, fontWeight: 700, color: mod.color, letterSpacing: '-0.03em' }}>{mod.stat.value}</span><span style={{ fontSize: 13, color: C.muted }}>{mod.stat.label}</span></div>
      {!mod.active && (<Link href={mod.href} style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: mod.color, textDecoration: 'none', opacity: hovered ? 1 : 0.7, transition: 'opacity 0.2s' }}>Explore {mod.name}<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 6h7M6.5 3l3 3-3 3" stroke={mod.color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg></Link>)}
    </motion.div>
  )
}

function RboRLink({ accent }: { accent: string }) {
  const [hov, setHov] = useState(false)
  return (<a href="/platform/revenue-book-of-record" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: hov ? accent + 'cc' : accent, textDecoration: 'none', transition: 'color 0.2s' }}>Learn about the Revenue Book of Record<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 6h7M6.5 3l3 3-3 3" stroke={accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg></a>)
}
function PlatformLinkBtn({ href, label, accent }: { href: string; label: string; accent: string }) {
  const [hov, setHov] = useState(false)
  return (<Link href={href} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', maxWidth: 220, color: hov ? accent : undefined, borderColor: hov ? accent : undefined, transition: 'color 0.2s, border-color 0.2s' }}>{label}</Link>)
}

function PlatformConnection() {
  const { isMobile, isTablet } = useBreakpoint()
  const row0Ref = useRef<HTMLDivElement>(null), row1Ref = useRef<HTMLDivElement>(null), row2Ref = useRef<HTMLDivElement>(null)
  const row0Visible = useFramerInView(row0Ref, { once: true, margin: '-80px 0px -80px 0px' })
  const row1Visible = useFramerInView(row1Ref, { once: true, margin: '-80px 0px -80px 0px' })
  const row2Visible = useFramerInView(row2Ref, { once: true, margin: '-80px 0px -80px 0px' })
  const sp = isMobile ? '64px 0' : '80px 0', ip = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const twoCols = isTablet ? '1fr' : '1fr 1fr'
  return (
    <section style={{ background: C.bg, padding: sp, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-5%', left: '-8%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,0,110,0.07) 0%, transparent 55%)' }} aria-hidden="true" />
      <div style={{ position: 'absolute', bottom: '5%', right: '-6%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 55%)' }} aria-hidden="true" />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: ip, boxSizing: 'border-box' }}>
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ marginBottom: isMobile ? 40 : 56 }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: C.text, lineHeight: 1.12, letterSpacing: '-0.03em', margin: 0, maxWidth: 640 }}>One platform.<br /><span style={{ color: C.comp }}>Compensation is where performance connects.</span></h2>
        </motion.div>
        <div ref={row0Ref} style={{ display: 'grid', gridTemplateColumns: twoCols, marginBottom: 2, border: `1px solid ${C.border}` }}>
          <div style={{ padding: isMobile ? '32px 20px' : isTablet ? '40px 28px' : '52px 48px', background: C.surface, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={row0Visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.azure, marginBottom: 14 }}>The Platform</div>
              <h3 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', fontWeight: 700, color: C.text, lineHeight: 1.2, letterSpacing: '-0.025em', margin: '0 0 16px' }}>One operating system for revenue.</h3>
              <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, margin: '0 0 28px', maxWidth: 400 }}>Fees and Billing, Compensation, and Practice Management sit on top of the Revenue Book of Record, each pulling from the same data. No reconciliation gaps. One consistent view of revenue performance across the full firm.</p>
              <PlatformLinkBtn href="/platform/" label="Explore the Platform" accent={C.comp} />
            </motion.div>
          </div>
          <div style={{ background: C.bg, minHeight: isTablet ? 280 : 420, display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: isTablet ? 'none' : `1px solid ${C.border}`, borderTop: isTablet ? `1px solid ${C.border}` : 'none' }}>
            <PureRevenueDiagram visible={row0Visible} />
          </div>
        </div>
        <div ref={row1Ref} style={{ border: `1px solid ${C.border}`, borderTop: 'none', overflow: 'hidden', background: C.bg }}>
          <div style={{ padding: isMobile ? '28px 20px 0' : isTablet ? '32px 28px 0' : '40px 48px 0' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.azure, marginBottom: 10 }}>The Modules</div>
            <h3 style={{ fontSize: 'clamp(1.3rem, 2.2vw, 1.75rem)', fontWeight: 700, color: C.text, lineHeight: 1.2, letterSpacing: '-0.025em', margin: 0 }}>Built for every dimension of revenue.</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: isTablet ? 'column' : 'row', gap: 16, padding: isMobile ? '24px 20px 32px' : isTablet ? '24px 28px 32px' : '32px 48px 40px' }}>
            {MODULES.map((mod, i) => <ModuleCard key={mod.id} mod={mod} index={i} visible={row1Visible} />)}
          </div>
        </div>
        <div ref={row2Ref} style={{ display: 'grid', gridTemplateColumns: twoCols, marginTop: 2, overflow: 'hidden', border: `1px solid ${C.border}`, borderTop: 'none' }}>
          <div style={{ padding: isMobile ? '32px 20px' : isTablet ? '40px 28px' : '52px 48px', background: C.surface, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={row2Visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.comp, marginBottom: 14 }}>The Foundation</div>
              <h3 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', fontWeight: 700, color: C.text, lineHeight: 1.2, letterSpacing: '-0.025em', margin: '0 0 16px' }}>Revenue data, unified into one source of truth.</h3>
              <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, margin: '0 0 28px', maxWidth: 400 }}>The Revenue Book of Record consolidates every client, account, contract, and pricing rule across the firm. Every compensation calculation and payout flows from one authoritative, always-current foundation, so your advisors never question the numbers.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {['Custodians, CRM, and portfolio data connected', 'Contracts and pricing logic centralized', 'Audit-ready at every stage'].map((pt, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={row2Visible ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.comp, flexShrink: 0 }} aria-hidden="true" />
                    <span style={{ fontSize: 13.5, color: C.muted }}>{pt}</span>
                  </motion.div>
                ))}
              </div>
              <RboRLink accent={C.comp} />
            </motion.div>
          </div>
          {!isMobile && (<div style={{ background: C.bg, minHeight: isTablet ? 320 : 420, display: 'flex', alignItems: 'stretch', borderLeft: isTablet ? 'none' : `1px solid ${C.border}`, borderTop: isTablet ? `1px solid ${C.border}` : 'none' }}><FoundationVisual visible={row2Visible} accent={C.comp} /></div>)}
        </div>
      </div>
    </section>
  )
}

// ─── 5. Who Benefits ──────────────────────────────────────────────────────────
const PERSONAS = [
  { role: 'Advisors', icon: 'fa-user-tie', tagline: 'Accurate and transparent pay', value: 'Know exactly how your compensation is calculated. Clear statements, accurate payouts, and full transparency give advisors confidence in their numbers and more time to focus on clients.', bullets: ['On-demand compensation statements', 'Accurate payouts every cycle', 'Clear visibility into plan structures', 'Faster onboarding to new programs'] },
  { role: 'Finance Leaders and CFOs', icon: 'fa-chart-line', tagline: 'Revenue and margin clarity', value: 'Connect compensation spend directly to revenue outcomes. See which plans are driving profitable behavior and which are eroding margin, with the data to make confident decisions at the board level.', bullets: ['Compensation tied to revenue KPIs', 'Payout variance analysis', 'Margin impact by plan and region', 'Audit-ready financial records'] },
  { role: 'CEOs and Heads of Wealth', icon: 'fa-building-columns', tagline: 'Retention and growth', value: 'Compensation is a strategic tool. Use it to attract top advisors, reinforce the behaviors that drive firm growth, and build a culture where high performance is recognized and rewarded consistently.', bullets: ['Incentives aligned to firm goals', 'Advisor recruitment and retention', 'Performance-linked payout structures', 'Scalable as the firm grows'] },
  { role: 'Compliance and Operations', icon: 'fa-shield-halved', tagline: 'Oversight and auditability', value: 'Maintain a complete, auditable record of every compensation decision. Flag exceptions early, manage governance controls, and give regulators and internal audit teams the documentation they need.', bullets: ['Full payout audit trail', 'Governance and exception controls', 'Regulatory-grade record keeping', 'Straight-through processing'] },
  { role: 'HR and Compensation Teams', icon: 'fa-people-group', tagline: 'Efficiency and control', value: 'Build, modify, and manage incentive programs without depending on engineering or manual spreadsheet runs. Configure payout structures, adjust participants, and roll out changes on demand.', bullets: ['Intuitive program configuration', 'Participant management at scale', 'Automated calculation and validation', 'Error detection before payout'] },
]
const PERSONA_DURATION = 4500

function WhoItBenefits({ accent }: { accent: string }) {
  const { isMobile, isTablet } = useBreakpoint()
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false), [active, setActive] = useState(0), [fillPct, setFillPct] = useState(0), [paused, setPaused] = useState(false)
  const startRef = useRef<number>(Date.now()), rafRef = useRef<number>(0)
  const aRgb = '255,0,110'

  useEffect(() => { const el = ref.current; if (!el) return; const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.05 }); obs.observe(el); return () => obs.disconnect() }, [])
  useEffect(() => {
    if (!visible || paused) { cancelAnimationFrame(rafRef.current); return }
    startRef.current = Date.now()
    const tick = () => { const elapsed = Date.now() - startRef.current; setFillPct(Math.min(100, (elapsed / PERSONA_DURATION) * 100)); if (elapsed >= PERSONA_DURATION) { setActive(a => (a + 1) % PERSONAS.length); startRef.current = Date.now(); setFillPct(0) }; rafRef.current = requestAnimationFrame(tick) }
    rafRef.current = requestAnimationFrame(tick); return () => cancelAnimationFrame(rafRef.current)
  }, [visible, paused, active])

  const goTo = (i: number) => { setActive(i); setFillPct(0); startRef.current = Date.now() }
  const p = PERSONAS[active]
  const sp = isMobile ? '64px 0' : '80px 0', ip = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'

  return (
    <section ref={ref} style={{ background: C.bg, padding: sp, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '30%', right: '-5%', width: 600, height: 500, pointerEvents: 'none', background: `radial-gradient(ellipse, rgba(${aRgb},0.06) 0%, transparent 60%)` }} aria-hidden="true" />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: ip, boxSizing: 'border-box' }}>
        <div style={{ marginBottom: isMobile ? 32 : 56, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.025em', maxWidth: 640, color: C.text }}>Everyone gets a clearer view of <span style={{ color: accent }}>how compensation affects performance.</span></h2>
        </div>
        {isTablet ? (
          <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.7s ease 0.2s' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              {PERSONAS.map((persona, i) => { const isActive = active === i; return (
                <button key={persona.role} onClick={() => goTo(i)}
                  style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 18px', textAlign: 'left', background: isActive ? `rgba(${aRgb},0.18)` : 'rgba(255,255,255,0.02)', border: `1px solid ${isActive ? `rgba(${aRgb},0.30)` : C.border}`, cursor: 'pointer', transition: 'background 0.25s, border-color 0.25s' }}>
                  {isActive && !paused && <div style={{ position: 'absolute', bottom: 0, left: 0, height: 2, width: `${fillPct}%`, background: accent, transition: 'none' }} aria-hidden="true" />}
                  {/* tab icon: no bg/border */}
                  <div style={{ width: 36, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden="true">
                    <i className={`fa-solid ${persona.icon}`} style={{ color: isActive ? accent : 'rgba(244,244,244,0.28)', fontSize: 13, transition: 'color 0.25s' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? C.text : C.muted, transition: 'color 0.25s' }}>{persona.role}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: isActive ? accent : 'rgba(244,244,244,0.28)', transition: 'color 0.25s' }}>{persona.tagline}</div>
                  </div>
                </button>
              )})}
            </div>
            <div style={{ overflow: 'hidden', background: 'rgba(26,20,16,0.6)', border: '1px solid rgba(255,255,255,0.09)' }}>
              <div style={{ height: 1, width: '100%', background: `linear-gradient(to right, ${accent}, rgba(${aRgb},0.35), transparent)` }} aria-hidden="true" />
              <div style={{ padding: isMobile ? '28px 20px' : '36px 32px' }}>
                {/* detail card: inline icon + title, no eyebrow, no bg/border */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <i className={`fa-solid ${p.icon}`} style={{ color: accent, fontSize: 17, flexShrink: 0 }} aria-hidden="true" />
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: C.text, lineHeight: 1.25, letterSpacing: '-0.02em', margin: 0 }}>{p.role}</h3>
                </div>
                <p style={{ fontSize: '0.9375rem', color: C.muted, lineHeight: 1.75, marginBottom: 24 }}>{p.value}</p>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8 }}>
                  {p.bullets.map((b, i) => (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}><span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: accent, boxShadow: `0 0 5px ${accent}` }} aria-hidden="true" /><span style={{ fontSize: 13, color: C.muted, lineHeight: 1.4 }}>{b}</span></div>))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => { startRef.current = Date.now(); setFillPct(0); setPaused(false) }}
            style={{ display: 'flex', gap: '32px', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s' }}>
            <div style={{ width: '45%', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PERSONAS.map((persona, i) => { const isActive = active === i; return (
                <button key={persona.role} onClick={() => goTo(i)} onMouseEnter={() => goTo(i)}
                  style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 16, width: '100%', padding: '18px 22px', textAlign: 'left', background: isActive ? `rgba(${aRgb},0.18)` : 'rgba(255,255,255,0.02)', border: `1px solid ${isActive ? `rgba(${aRgb},0.30)` : C.border}`, cursor: 'pointer', transition: 'background 0.25s, border-color 0.25s' }}>
                  {isActive && !paused && <div style={{ position: 'absolute', bottom: 0, left: 0, height: 2, width: `${fillPct}%`, background: accent, transition: 'none' }} aria-hidden="true" />}
                  {/* tab icon: no bg/border */}
                  <div style={{ width: 40, height: 40, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden="true">
                    <i className={`fa-solid ${persona.icon}`} style={{ color: isActive ? accent : 'rgba(244,244,244,0.28)', fontSize: 14, transition: 'color 0.25s' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3, color: isActive ? C.text : C.muted, transition: 'color 0.25s', marginBottom: 2 }}>{persona.role}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: isActive ? accent : 'rgba(244,244,244,0.28)', transition: 'color 0.25s' }}>{persona.tagline}</div>
                  </div>
                  <span style={{ fontSize: 14, marginLeft: 'auto', color: isActive ? accent : 'rgba(244,244,244,0.15)', transform: isActive ? 'translateX(3px)' : 'none', transition: 'color 0.25s, transform 0.25s' }} aria-hidden="true">→</span>
                </button>
              )})}
            </div>
            <div style={{ width: '55%' }}>
              <div style={{ position: 'sticky', top: 96, overflow: 'hidden', background: 'rgba(26,20,16,0.6)', border: '1px solid rgba(255,255,255,0.09)', boxShadow: `0 0 50px rgba(${aRgb},0.06), inset 0 1px 0 rgba(255,255,255,0.06)`, minHeight: 380 }}>
                <div style={{ height: 1, width: '100%', background: `linear-gradient(to right, ${accent}, rgba(${aRgb},0.35), transparent)` }} aria-hidden="true" />
                <div style={{ position: 'absolute', top: -32, right: -32, width: 176, height: 176, pointerEvents: 'none', background: `radial-gradient(circle, rgba(${aRgb},0.12) 0%, transparent 70%)`, filter: 'blur(40px)' }} aria-hidden="true" />
                <div style={{ position: 'relative', padding: '40px 44px' }}>
                  {/* detail card: inline icon + title, no eyebrow, no bg/border */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                    <i className={`fa-solid ${p.icon}`} style={{ color: accent, fontSize: 17, flexShrink: 0 }} aria-hidden="true" />
                    <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, color: C.text, lineHeight: 1.25, letterSpacing: '-0.02em', margin: 0 }}>{p.role}</h3>
                  </div>
                  <p style={{ fontSize: '0.9375rem', color: C.muted, lineHeight: 1.75, marginBottom: 32 }}>{p.value}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {p.bullets.map((b, i) => (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}><span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: accent, boxShadow: `0 0 5px ${accent}` }} aria-hidden="true" /><span style={{ fontSize: 13, color: C.muted, lineHeight: 1.4 }}>{b}</span></div>))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// ─── 6. Proof Band ─────────────────────────────────────────────────────────────
function LogoCard({ logo, onPause, onResume }: { logo: ClientLogo; onPause: () => void; onResume: () => void }) {
  return (<div className="relative flex flex-col items-center justify-center bg-[#f4f4f4] p-6 w-full aspect-square overflow-hidden rounded-[10px]" onMouseEnter={onPause} onMouseLeave={onResume}><div className="relative w-full h-16"><Image src={urlFor(logo.logo).width(480).height(192).url()} alt={logo.name} fill className="object-contain" draggable={false} sizes="160px" /></div>{logo.caseStudyUrl ? (<div className="absolute bottom-3 inset-x-0 flex justify-center">{logo.caseStudyUrl.startsWith('http') ? <a href={logo.caseStudyUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 whitespace-nowrap">Case study →</a> : <Link href={logo.caseStudyUrl} className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 whitespace-nowrap">Case study →</Link>}</div>) : null}</div>)
}
function LogoColumn({ logos, direction }: { logos: ClientLogo[]; direction: 'up' | 'down' }) {
  const innerRef = useRef<HTMLDivElement>(null), rafRef = useRef<number>(0), pausedRef = useRef(false)
  useEffect(() => {
    const inner = innerRef.current; if (!inner) return
    const getH = () => inner.scrollHeight / 2; let offset = direction === 'down' ? -getH() : 0; inner.style.transform = `translateY(${offset}px)`
    const tick = () => { const h = getH(); if (h === 0) { rafRef.current = requestAnimationFrame(tick); return }; if (!pausedRef.current) { if (direction === 'up') { offset -= 0.8; if (offset <= -h) offset += h } else { offset += 0.8; if (offset >= 0) offset -= h }; inner.style.transform = `translateY(${offset}px)` }; rafRef.current = requestAnimationFrame(tick) }
    rafRef.current = requestAnimationFrame(tick); return () => cancelAnimationFrame(rafRef.current)
  }, [direction, logos.length])
  const items = [...logos, ...logos]
  return (<div className="relative overflow-hidden" style={{ height: 520 }}><div ref={innerRef} className="flex flex-col gap-3 will-change-transform">{items.map((logo, i) => <LogoCard key={`${logo._id}-${i}`} logo={logo} onPause={() => { pausedRef.current = true }} onResume={() => { pausedRef.current = false }} />)}</div><div className="pointer-events-none absolute inset-x-0 top-0 h-20 z-10" style={{ background: `linear-gradient(to bottom, ${C.bg}, transparent)` }} /><div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 z-10" style={{ background: `linear-gradient(to top, ${C.bg}, transparent)` }} /></div>)
}
function MobileLogoCarousel({ logos }: { logos: ClientLogo[] }) {
  const trackRef = useRef<HTMLDivElement>(null), xRef = useRef(0), rafRef = useRef<number>(0), pausedRef = useRef(false), draggingRef = useRef(false), lastClientXRef = useRef(0)
  const SPEED = 0.55, items = [...logos, ...logos, ...logos]
  useEffect(() => {
    const track = trackRef.current; if (!track) return
    const getSetWidth = () => track.scrollWidth / 3
    const normalize = () => { const setW = getSetWidth(); if (!setW) return; if (xRef.current <= -setW) xRef.current += setW; if (xRef.current > 0) xRef.current -= setW }
    const tick = () => { if (!pausedRef.current && !draggingRef.current) { xRef.current -= SPEED; normalize(); track.style.transform = `translateX(${xRef.current}px)` }; rafRef.current = requestAnimationFrame(tick) }
    rafRef.current = requestAnimationFrame(tick); return () => cancelAnimationFrame(rafRef.current)
  }, [logos.length])
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => { draggingRef.current = true; pausedRef.current = true; lastClientXRef.current = e.clientX; e.currentTarget.setPointerCapture(e.pointerId) }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => { const track = trackRef.current; if (!draggingRef.current || !track) return; const dx = e.clientX - lastClientXRef.current; lastClientXRef.current = e.clientX; xRef.current += dx; const setW = track.scrollWidth / 3; if (setW) { if (xRef.current <= -setW) xRef.current += setW; if (xRef.current > 0) xRef.current -= setW }; track.style.transform = `translateX(${xRef.current}px)` }
  const endDrag = (e: PointerEvent<HTMLDivElement>) => { draggingRef.current = false; pausedRef.current = false; e.currentTarget.releasePointerCapture(e.pointerId) }
  return (
    <div className="relative overflow-hidden" style={{ touchAction: 'pan-y', cursor: 'grab', width: '100%' }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onMouseEnter={() => { pausedRef.current = true }} onMouseLeave={() => { if (!draggingRef.current) pausedRef.current = false }}>
      <div ref={trackRef} className="flex gap-3 will-change-transform">{items.map((logo, i) => (<div key={`${logo._id}-${i}`} className="shrink-0" style={{ width: 'min(44vw, 168px)' }}><LogoCard logo={logo} onPause={() => { pausedRef.current = true }} onResume={() => { if (!draggingRef.current) pausedRef.current = false }} /></div>))}</div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 z-10" style={{ background: `linear-gradient(to right, ${C.bg}, transparent)` }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 z-10" style={{ background: `linear-gradient(to left, ${C.bg}, transparent)` }} />
    </div>
  )
}
function ProofBand({ logos, accent }: { logos: ClientLogo[]; accent: string }) {
  const { isMobile } = useBreakpoint()
  const col1 = logos.filter((_, i) => i % 3 === 0), col2 = logos.filter((_, i) => i % 3 === 1), col3 = logos.filter((_, i) => i % 3 === 2)
  const pad = (arr: ClientLogo[]) => { let out = [...arr]; while (out.length < 4) out = [...out, ...(arr.length ? arr : logos)]; return out }
  return (
    <section style={{ background: C.bg, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,0,110,0.06) 0%, transparent 60%)' }} aria-hidden="true" />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '64px 20px' : '80px 48px' }}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16 xl:gap-24">
          <div className="lg:w-[42%] flex-shrink-0 mb-16 lg:mb-0">
            <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-3xl lg:text-4xl xl:text-5xl font-bold leading-[1.06] mb-5" style={{ color: C.text }}>Trusted by leading financial firms worldwide</motion.h2>
            <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="text-base leading-relaxed" style={{ color: C.muted, marginBottom: isMobile ? 18 : 40 }}>The world&rsquo;s most demanding financial firms rely on PureFacts to keep their advisors paid accurately and on time, every cycle.</motion.p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', paddingTop: isMobile ? 0 : 24, gap: isMobile ? 10 : 16 }}>
              {[{ value: '~$10B', label: 'Revenue Processed Annually' }, { value: '8.5M', label: 'Records Per Month' }, { value: '17K', label: 'Pay Recipients' }].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}>
                  <div style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 800, color: accent, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: C.subtle, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', lineHeight: 1.4 }}>{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
          {isMobile ? <MobileLogoCarousel logos={logos} /> : (<div className="lg:w-[58%] grid grid-cols-3 gap-3 overflow-hidden"><LogoColumn logos={pad(col1)} direction="down" /><LogoColumn logos={pad(col2)} direction="up" /><LogoColumn logos={pad(col3)} direction="down" /></div>)}
        </div>
      </div>
    </section>
  )
}

// ─── 7. Final CTA ─────────────────────────────────────────────────────────────
const CTA_FEATURES = [
  { icon: 'fa-bullseye',    color: C.comp,     title: 'Incentives Aligned to Growth',   desc: 'Design compensation plans that connect advisor behavior to firm-wide strategic goals, reinforcing the actions that build recurring, profitable revenue.' },
  { icon: 'fa-gears',       color: C.azure,    title: 'Accurate Payouts, Every Cycle',  desc: 'Eliminate errors in multi-variable compensation calculations. Every advisor paid correctly, on time, with full transparency into how their payout was calculated.' },
  { icon: 'fa-user-check',  color: C.mandarin, title: 'Advisor Retention Strengthened', desc: 'Transparent, accurate compensation is one of the most effective tools for retaining high-performing advisors and reducing costly, unplanned attrition.' },
]

function FinalCTA() {
  const { ref, inView } = useInView()
  const { isMobile, isTablet } = useBreakpoint()
  const sp = isMobile ? '64px 0 80px' : '80px 0 80px', ip = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  return (
    <section ref={ref as React.RefObject<HTMLElement>} style={{ background: C.bg, padding: sp, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,0,110,0.07) 0%, transparent 60%)' }} aria-hidden="true" />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 58%)' }} aria-hidden="true" />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: ip, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexDirection: isTablet ? 'column' : 'row', alignItems: isTablet ? 'stretch' : 'center', gap: isTablet ? '40px' : '80px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: isMobile ? 24 : 32 }}>
            {CTA_FEATURES.map((f, i) => (
              <div key={f.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 20, opacity: inView ? 1 : 0, transform: inView ? 'translateX(0)' : 'translateX(-12px)', transition: `opacity 0.5s ease ${0.3 + i * 0.1}s, transform 0.5s ease ${0.3 + i * 0.1}s` }}>
                {/* icon: no background, flex-start */}
                <div style={{ width: 48, height: 48, flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                  <i className={`fa-solid ${f.icon}`} style={{ color: f.color, fontSize: 17 }} aria-hidden="true" />
                </div>
                <div>
                  {/* title: lineHeight 1 */}
                  <p style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4, lineHeight: 1 }}>{f.title}</p>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 700, lineHeight: 1.06, color: C.text, letterSpacing: '-0.025em', marginBottom: 16, opacity: inView ? 1 : 0, transition: 'opacity 0.6s ease 0.2s' }}>
              <span style={{ background: SUNSET, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Find the compensation</span>{' '}opportunity inside your firm.
            </h2>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, maxWidth: 400, marginBottom: 36, opacity: inView ? 1 : 0, transition: 'opacity 0.6s ease 0.3s' }}>A Revenue Performance Assessment helps identify where misaligned incentives, payout errors, and manual complexity may be costing you advisors, margin, and enterprise value.</p>
            <div style={{ opacity: inView ? 1 : 0, transition: 'opacity 0.6s ease 0.4s' }}>
              <Link href="/contact" className="btn-primary">Schedule an Assessment</Link>
              <p style={{ fontSize: 12, color: C.subtle, fontWeight: 500, marginTop: 16 }}>Trusted by leading financial firms worldwide.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const globalStyles = `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; } }`

export default function CompensationClient({ heroImage, logos }: { heroImage: any | null; logos: ClientLogo[] }) {
  return (
    <main id="main-content" style={{ fontFamily: "'Carlito', 'Segoe UI', sans-serif", background: C.bg, overflow: 'hidden' }}>
      <style>{globalStyles}</style>
      <Hero heroImage={heroImage} />
      <TheProblem />
      <FeaturesCarousel accent={ACCENT} />
      <PlatformConnection />
      <WhoItBenefits accent={ACCENT} />
      <ProofBand logos={logos} accent={ACCENT} />
      <FinalCTA />
    </main>
  )
}