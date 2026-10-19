'use client'

import { useEffect, useRef, useState, useCallback, CSSProperties } from 'react'
import HubspotModal from '@/components/resources/HubspotModal';
import Link from 'next/link'
import Image from 'next/image'

// --- TYPES - INTERFACES ----
export interface ThemeConfig {
  bg: string; surface: string; azure: string; mandarin: string;
  honey: string; text: string; muted: string; subtle: string;
  border: string; borderMd: string; aRgb: string; accent: string; heroIcon: string;
}

export interface PartnerPageData {
  theme: Partial<ThemeConfig>;
  hubspot: { portalId: string; formId: string };
  hero: { eyebrow: string; titleLine1: string; titleAccent: string; description: string; cta: string; contactText: string; contactLink: string; };
  overview: { eyebrow: string; title: string; description: string; bullets: { label: string; icon: string; }[]; };
  expertise: { title: string; cards: { icon?: string; label: string; desc: string; href: string; isPlatform?: boolean }[]; };
  features: { eyebrow: string; titleLine1: string; titleAccent: string; description: string; steps: { icon: string; title: string; body: string; count: string }[]; };
  lastBlock: { titleLine1: string; titleHighlight: string; description: string; cta: string; };
}

// --- BASE THEME ---
const DEFAULT_THEME: ThemeConfig = {
  bg: '#140f0c', surface: '#1a1410', azure: '#3b84ff', mandarin: '#fb5607',
  honey: '#ffb30c', text: '#f4f4f4', muted: 'rgba(244,244,244,0.75)',
  subtle: 'rgba(244,244,244,0.45)', border: 'rgba(255,255,255,0.07)',
  borderMd: 'rgba(255,255,255,0.10)', aRgb: '59,132,255', accent: '#3b84ff', heroIcon: '/icons/azul.png'
}
const SUNSET = 'linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%)'

// --- HOOKS ---
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

// --- UTILS COMPONENT ---
function Reveal({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: CSSProperties }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(22px)', transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`, ...style }}>
      {children}
    </div>
  )
}

function Eyebrow({ children, color }: { children: React.ReactNode; color: string }) {
  return <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.20em', color, margin: '0 0 14px' }}>{children}</p>
}

// --- CANVAS COMPONENT ---
function RevenueLedgerCanvas({ aRgb }: { aRgb: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current as HTMLCanvasElement; 
    if (!cv) return;
    const ctx = cv.getContext('2d') as CanvasRenderingContext2D; 
    if (!ctx) return;
    let raf = 0;
    const [FR, FG, FB] = aRgb.split(',').map(Number)
    function resize() { cv.width = cv.parentElement!.offsetWidth; cv.height = cv.parentElement!.offsetHeight }
    resize()
    const ro = new ResizeObserver(resize); ro.observe(cv.parentElement!)
    const SERIES = [
      { alphaMult: 1.00, lineW: 2.0, volatility: 0.055, speedMult: 1.0, phase: 0.0, isPrimary: true },
      { alphaMult: 0.40, lineW: 1.2, volatility: 0.080, speedMult: 1.3, phase: 1.2, isPrimary: false },
      { alphaMult: 0.22, lineW: 0.8, volatility: 0.110, speedMult: 0.8, phase: 2.7, isPrimary: false },
      { alphaMult: 0.14, lineW: 0.6, volatility: 0.045, speedMult: 1.5, phase: 4.1, isPrimary: false },
    ]
    const SEGS = 160
    function lineNoise(xf: number, tt: number, ph: number, vol: number) { return Math.sin(xf * 6.2 + tt * 1.8 + ph) * vol + Math.sin(xf * 14.5 + tt * 2.6 + ph * 1.3) * vol * 0.55 + Math.sin(xf * 3.1 + tt * 1.1 + ph * 0.7) * vol * 0.35 + Math.cos(xf * 9.8 + tt * 3.2 + ph * 2.1) * vol * 0.25 }
    function trendFrac(xf: number) { return Math.pow(xf, 0.75) * 0.82 }
    function getY(xf: number, tt: number, ph: number, vol: number, H: number) { const yf = Math.max(0.04, Math.min(0.98, 1.0 - trendFrac(xf) + lineNoise(xf, tt, ph, vol))); return yf * H }
    let t = 0
    function draw() {
      const W = cv?.width, H = cv?.height
      if (W === 0 || H === 0) { raf = requestAnimationFrame(draw); return }
      ctx.clearRect(0, 0, W, H); t += 0.006
      SERIES.forEach(s => {
        const pts = Array.from({ length: SEGS + 1 }, (_, i) => { const xf = i / SEGS; return { x: xf * W, y: getY(xf, t * s.speedMult, s.phase, s.volatility, H) } })
        if (s.isPrimary) {
          ctx?.beginPath(); ctx.moveTo(0, H); ctx.lineTo(pts[0].x, pts[0].y)
          pts.forEach(p => ctx.lineTo(p.x, p.y)); ctx.lineTo(W, H); ctx.closePath()
          const fill = ctx.createLinearGradient(0, H * 0.1, 0, H)
          fill.addColorStop(0, `rgba(${FR},${FG},${FB},0.14)`); fill.addColorStop(0.6, `rgba(${FR},${FG},${FB},0.06)`); fill.addColorStop(1, `rgba(${FR},${FG},${FB},0.01)`)
          ctx.fillStyle = fill; ctx.fill()
        }
        ctx.beginPath(); pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
        const lg = ctx.createLinearGradient(0, 0, W, 0)
        const a = s.alphaMult
        lg.addColorStop(0, `rgba(${FR},${FG},${FB},${a * 0.08})`)
        lg.addColorStop(0.30, `rgba(${FR},${FG},${FB},${a * 0.14})`)
        lg.addColorStop(0.50, `rgba(${FR},${FG},${FB},${a * 0.28})`)
        lg.addColorStop(0.65, `rgba(${FR},${FG},${FB},${a * 0.72})`)
        lg.addColorStop(1.0, `rgba(${FR},${FG},${FB},${a * 0.90})`)
        ctx.strokeStyle = lg; ctx.lineWidth = s.lineW; ctx.stroke()
        if (s.isPrimary) {
          let peak = pts[SEGS]
          for (let i = Math.floor(SEGS * 0.75); i <= SEGS; i++) if (pts[i].y < peak.y) peak = pts[i]
          const glo = ctx.createRadialGradient(peak.x, peak.y, 0, peak.x, peak.y, 24)
          glo.addColorStop(0, `rgba(${FR},${FG},${FB},0.55)`); glo.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.beginPath(); ctx.arc(peak.x, peak.y, 24, 0, Math.PI * 2); ctx.fillStyle = glo; ctx.fill()
          ctx.beginPath(); ctx.arc(peak.x, peak.y, 4, 0, Math.PI * 2); ctx.fillStyle = `rgba(${FR},${FG},${FB},0.95)`; ctx.fill()
        }
      })
      for (let i = 1; i <= 5; i++) { const gy = H * (1 - i * 0.16); ctx.beginPath(); ctx.moveTo(W * 0.42, gy); ctx.lineTo(W + 10, gy); ctx.strokeStyle = `rgba(${FR},${FG},${FB},0.05)`; ctx.lineWidth = 0.6; ctx.stroke() }
      const lv = ctx.createLinearGradient(0, 0, W * 0.60, 0)
      lv.addColorStop(0, 'rgba(12,15,20,0.92)'); lv.addColorStop(0.36, 'rgba(12,15,20,0.75)'); lv.addColorStop(0.54, 'rgba(12,15,20,0.28)'); lv.addColorStop(1, 'transparent')
      ctx.fillStyle = lv; ctx.fillRect(0, 0, W * 0.60, H)
      const tf = ctx.createLinearGradient(0, 0, 0, H * 0.13); tf.addColorStop(0, 'rgba(12,15,20,0.75)'); tf.addColorStop(1, 'transparent'); ctx.fillStyle = tf; ctx.fillRect(0, 0, W, H * 0.13)
      const bf = ctx.createLinearGradient(0, H * 0.82, 0, H); bf.addColorStop(0, 'transparent'); bf.addColorStop(1, 'rgba(12,15,20,0.60)'); ctx.fillStyle = bf; ctx.fillRect(0, H * 0.82, W, H * 0.18)
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [aRgb])
  return <canvas ref={ref} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }} />
}

// --- MAIN SECTIONS ---

// ---- HERO ----
function Hero({ data, theme, hubspot }: { data: PartnerPageData['hero'], theme: ThemeConfig, hubspot: PartnerPageData['hubspot'] }) {
  const [mounted, setMounted] = useState(false)
  const { isMobile, isTablet } = useBreakpoint()
  const [isModalOpen, setIsModalOpen] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 80) }, [])

  const stylesHeroIconDesk: CSSProperties = { position: 'absolute', right: '20%', top: '5%' };
  const stylesHeroIconMob: CSSProperties = { position: 'relative', left: '0', top: '0', marginBottom: '30px' };

  return (
    <>
      <section style={{ position: 'relative', overflow: 'hidden', background: theme.bg, padding: isMobile ? '48px 0' : isTablet ? '72px 0' : '90px 0 72px', display: 'flex', alignItems: 'center' }}>
        <RevenueLedgerCanvas aRgb={theme.aRgb} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 160, background: `linear-gradient(to bottom, transparent, ${theme.bg})`, pointerEvents: 'none', zIndex: 2 }} aria-hidden="true" />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px', width: '100%', position: 'relative', zIndex: 3 }}>
          <div style={isTablet ? stylesHeroIconMob : stylesHeroIconDesk}>
            <Image src={theme.heroIcon} alt="imageLogo" width={150} height={150} style={{ objectFit: 'contain', objectPosition: 'left' }} />
          </div>
          <div style={{ maxWidth: 640, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: theme.accent, textTransform: 'uppercase', letterSpacing: '0.20em' }}>{data.eyebrow}</span>
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.028em', color: theme.text, maxWidth: 640, marginBottom: 24 }}>
              {data.titleLine1}<br /><span style={{ color: theme.accent }}>{data.titleAccent}</span>
            </h1>
            <p style={{ fontSize: '1.0625rem', color: theme.text, lineHeight: 1.75, maxWidth: 520, marginBottom: 40 }}>{data.description}</p>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ cursor: 'pointer', backgroundColor: theme.accent, zIndex: 'unset', marginRight: '10px', borderColor: theme.accent }}>
              {data.cta}
            </button>
            <Link href={data.contactLink} className="btn-primary" style={{ borderColor: theme.accent }}>{data.contactText}</Link>
          </div>
        </div>
      </section>
      <HubspotModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} portalId={hubspot.portalId} formId={hubspot.formId} />
    </>
  )
}


// ---- OVERVIEW -----
function Overview_block({ data, theme }: { data: PartnerPageData['overview'], theme: ThemeConfig }) {
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '56px 0' : '90px 0'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const twoCols = isTablet ? '1fr' : 'repeat(2, minmax(0, 1fr))'
  const sectionGap = isMobile ? '24px' : isTablet ? '32px' : '80px'

  return (
    <section style={{ background: theme.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Overview">
      <div aria-hidden="true" style={{ position: 'absolute', top: '10%', right: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(251,86,7,0.06) 0%, transparent 60%)' }} />
      <div aria-hidden="true" style={{ position: 'absolute', bottom: '0%', left: '5%', width: 500, height: 400, pointerEvents: 'none', background: `radial-gradient(ellipse, rgba(${theme.aRgb},0.04) 0%, transparent 60%)` }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
        <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'start' }}>
          <div>
            <Reveal>
              <Eyebrow color={theme.accent}>{data.eyebrow}</Eyebrow>
              <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: theme.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                {data.title}
              </h2>
            </Reveal>
            <Reveal delay={70}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
                <p style={{ fontSize: 16, color: theme.text, lineHeight: 1.75, margin: 0 }}>{data.description}</p>
              </div>
            </Reveal>
          </div>

          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {data.bullets.map((item, i) => (
              <Reveal key={i} delay={i * 70}>
                <li className="cl-bullet-row" style={{ display: 'flex', gap: '5px' }}>
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                    <i className={`fa-solid ${item.icon}`} style={{ color: theme.accent, fontSize: 16, lineHeight: 1 }} aria-hidden="true" />
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: '15px', lineHeight: 1 }}>{item.label}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

// ---- POWERS -----
function Expertise_powers({ data, theme }: { data: PartnerPageData['expertise'], theme: ThemeConfig }) {
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '56px 0' : '90px 0'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const relatedCols = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'

  return (
    <section style={{ background: theme.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }}>
      <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 350, pointerEvents: 'none', background: `radial-gradient(ellipse, rgba(${theme.aRgb},0.05) 0%, transparent 60%)` }} />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
        <Reveal>
          <h2 style={{ fontSize: 'clamp(2.5rem,4vw,3.5rem)', fontWeight: 700, color: theme.text, letterSpacing: '-0.02em', margin: '0 0 8px', textAlign: 'center' }}>{data.title}</h2>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: relatedCols, gap: 16, alignItems: 'stretch' }}>
          {data.cards.map((card, i) => (
            <Reveal key={i} delay={i * 70} style={{ display: 'flex' }}>
              {card.isPlatform ? (
                <Link href={card.href} className="cx-gradient-border" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: isMobile ? '24px 22px' : '28px 26px', textDecoration: 'none', position: 'relative', overflow: 'hidden', transition: 'transform 0.3s ease' }} onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')} onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                  <div style={{ width: 180, height: 40, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Image src="/PureRevenueWhite.svg" alt="PureRevenue" width={200} height={50} style={{ objectFit: 'contain' }} />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: theme.text, margin: '0 0 10px' }}>{card.label}</h3>
                  <p style={{ fontSize: 14, color: theme.text, lineHeight: 1.7, margin: '0 0 20px', flex: 1 }}>{card.desc}</p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: theme.honey }}>
                    Explore the platform <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} aria-hidden="true" />
                  </span>
                </Link>
              ) : (
                <div className="cx-related-card" style={{ flex: 1, border: `1px solid ${theme.accent}`, padding: isMobile ? '24px 22px' : '28px 26px', }}>
                  <div style={{ flexShrink: 0, marginBottom: 16 }}>
                    <i className={`fa-solid ${card.icon}`} style={{ color: theme.accent, fontSize: 16, lineHeight: 1 }} aria-hidden="true" />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: theme.text, margin: '0 0 10px' }}>{card.label}</h3>
                  <p style={{ fontSize: 14, color: theme.text, lineHeight: 1.7, margin: '0 0 20px', flex: 1 }}>{card.desc}</p>
                </div>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}


//---FEATURES-----
function FeaturesCarousel({ data, theme }: { data: PartnerPageData['features'], theme: ThemeConfig }) {
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '56px 0' : '90px 0'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const twoCols = isTablet ? '1fr' : 'repeat(2, minmax(0, 1fr))'
  const sectionGap = isMobile ? '24px' : isTablet ? '32px' : '80px'

  return (
    <section style={{ background: theme.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Overview">
      <div aria-hidden="true" style={{ position: 'absolute', top: '10%', right: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(251,86,7,0.06) 0%, transparent 60%)' }} />
      <div aria-hidden="true" style={{ position: 'absolute', bottom: '0%', left: '5%', width: 500, height: 400, pointerEvents: 'none', background: `radial-gradient(ellipse, rgba(${theme.aRgb},0.04) 0%, transparent 60%)` }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
        <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'start' }}>
          <div>
            <Reveal>
              <Eyebrow color={theme.accent}>{data.eyebrow}</Eyebrow>
              <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: theme.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                {data.titleLine1}<br /><span style={{ color: theme.accent }}>{data.titleAccent}</span>
              </h2>
            </Reveal>
            <Reveal delay={70}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
                <p style={{ fontSize: 16, color: theme.text, lineHeight: 1.75, margin: 0 }}>{data.description}</p>
              </div>
            </Reveal>
          </div>

          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {data.steps.map((item, i) => (
              <Reveal key={i} delay={i * 70}>
                <li className="cl-bullet-row" style={{ display: 'flex', gap: '5px' }}>
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                    <i className={`fa-solid ${item.icon}`} style={{ color: theme.accent, fontSize: 16, lineHeight: 1 }} aria-hidden="true" />
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: '15px', lineHeight: 1 }}>{item.title}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/*
// ---- FEATURES -----
function FeaturesCarousel({ data, theme }: { data: PartnerPageData['features'], theme: ThemeConfig }) {
  const { ref, inView } = useInView(0.05)
  const { isMobile, isTablet } = useBreakpoint()
  const N = data.steps.length
  const [active, setActive] = useState(0)
  const [fillPct, setFillPct] = useState(0)
  const [paused, setPaused] = useState(false)
  const rafRef = useRef<number>(0)
  const startRef = useRef<number>(Date.now())
  const dragRef = useRef({ down: false, startX: 0, moved: false })
  const CAROUSEL_DURATION = 3200

  const prev = useCallback(() => { setActive(a => a - 1); setFillPct(0); startRef.current = Date.now() }, [])
  const next = useCallback(() => { setActive(a => a + 1); setFillPct(0); startRef.current = Date.now() }, [])

  useEffect(() => {
    return; // Tu código original tiene este return; aquí
  }, [paused, active])

  const onPointerDown = (e: React.PointerEvent) => { dragRef.current = { down: true, startX: e.clientX, moved: false }; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); setPaused(true) }
  const onPointerMove = (e: React.PointerEvent) => { if (!dragRef.current.down) return; if (Math.abs(e.clientX - dragRef.current.startX) > 8) dragRef.current.moved = true }
  const onPointerUp = (e: React.PointerEvent) => { if (!dragRef.current.down) return; const dx = e.clientX - dragRef.current.startX; if (Math.abs(dx) > 40) dx < 0 ? next() : prev(); dragRef.current.down = false; setFillPct(0); startRef.current = Date.now(); setPaused(false) }

  const f = data.steps[((active % N) + N) % N]
  const sectionPad = isMobile ? '64px 0' : '100px 0'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const gridCols = isTablet ? '1fr' : '1.04fr 1.55fr'

  return (
    <section ref={ref as React.RefObject<HTMLElement>} style={{ background: theme.bg, padding: sectionPad, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-5%', left: '20%', width: 700, height: 400, pointerEvents: 'none', background: `radial-gradient(ellipse, ${theme.accent}0f 0%, transparent 60%)` }} aria-hidden="true" />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: isTablet ? '32px' : '40px', alignItems: 'center' }}>
          <div style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
            <Eyebrow color={theme.accent}>{data.eyebrow}</Eyebrow>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.03em', color: theme.text, marginBottom: 16 }}>
              {data.titleLine1}<br /><span style={{ color: theme.accent }}>{data.titleAccent}</span>
            </h2>
            <p style={{ fontSize: '0.9375rem', color: theme.muted, lineHeight: 1.75, maxWidth: 360, marginBottom: 32 }}>{data.description}</p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[{ html: '&#8592;', fn: prev, aria: 'Previous feature' }, { html: '&#8594;', fn: next, aria: 'Next feature' }].map(({ html, fn, aria }) => (
                <button key={aria} onClick={() => { fn(); setPaused(true); setTimeout(() => setPaused(false), 4000) }}
                  style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: `1px solid ${theme.border}`, color: theme.muted, fontSize: 16, cursor: 'pointer', transition: 'border-color 0.2s, color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.muted }}
                  aria-label={aria} dangerouslySetInnerHTML={{ __html: html }} />
              ))}
            </div>
          </div>

          {isTablet ? (
            <div style={{ background: `rgba(${theme.aRgb},0.07)`, border: `1px solid ${theme.accent}`, padding: '28px 24px 24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', marginBottom: 18 }}>
                <i className={`fa-solid ${f.icon}`} style={{ color: theme.accent, fontSize: 20 }} aria-hidden="true" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 10 }}>{f.title}</div>
              <p style={{ fontSize: 13, color: theme.muted, lineHeight: 1.7, margin: 0 }}>{f.body}</p>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `rgba(${theme.aRgb},0.12)` }} aria-hidden="true">
                <div style={{ height: '100%', width: `${fillPct}%`, background: theme.accent, transition: 'none' }} />
              </div>
            </div>
          ) : (
            <div role="region" aria-label="Features carousel" aria-live="polite" style={{ overflow: 'hidden', position: 'relative', cursor: 'grab', height: 320 }}
              onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
              onMouseEnter={() => setPaused(true)} onMouseLeave={() => { setFillPct(0); startRef.current = Date.now(); setPaused(false) }}>
              {Array.from({ length: 9 }, (_, k) => k - 4).map((offset, index) => {
                const fi = ((active + offset) % N + N) % N
                const feat = data.steps[fi]
                const isCenter = offset === 0
                const CARD_W = 340, CARD_GAP = 20
                return (
                  <div key={`slot-${offset}`} onClick={() => { if (!dragRef.current.moved && !isCenter) setActive(a => a + offset) }} aria-hidden={!isCenter}
                    style={{ display: 'flex', flexDirection: 'column', position: 'absolute', top: 0, left: 0, width: CARD_W, height: '100%', padding: '32px 28px 20px', boxSizing: 'border-box', background: isCenter ? `rgba(${theme.aRgb},0.07)` : theme.surface, border: `1px solid ${isCenter ? theme.accent : theme.border}`, overflow: 'hidden', opacity: Math.abs(offset) <= 1 ? (isCenter ? 1 : 0.5) : 0, transform: `translateX(${offset * (CARD_W + CARD_GAP)}px)`, transition: 'opacity 0.35s ease, border-color 0.35s ease, background 0.35s ease, transform 0.45s cubic-bezier(0.4,0,0.2,1)', cursor: isCenter ? 'default' : 'pointer', pointerEvents: Math.abs(offset) > 2 ? 'none' : 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', marginBottom: 20 }}>
                      <i className={`fa-solid ${feat.icon}`} style={{ color: theme.accent, fontSize: 50 }} aria-hidden="true" />
                    </div>
                    <div style={{ fontSize: 40, fontWeight: 700, color: theme.text, marginBottom: 10, lineHeight: 1.3 }}>{feat.title}</div>
                    <p style={{ fontSize: 18, color: theme.text, lineHeight: 1.7, marginTop: 'auto' }}>{feat.body}</p>
                    {isCenter && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `rgba(${theme.aRgb},0.12)` }} aria-hidden="true">
                        <div style={{ height: '100%', width: `${fillPct}%`, background: theme.accent, transition: 'none' }} />
                      </div>
                    )}
                  </div>
                )
              })}
              <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 80, background: `linear-gradient(to right, transparent, ${theme.bg})`, pointerEvents: 'none', zIndex: 10 }} aria-hidden="true" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
*/

// ---- LAST -----
function LastBlock({ data, theme, hubspot }: { data: PartnerPageData['lastBlock'], theme: ThemeConfig, hubspot: PartnerPageData['hubspot'] }) {
  const { isMobile, isTablet } = useBreakpoint()
  const [mounted, setMounted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 80) }, [])

  return (
    <>
      <section style={{ position: 'relative', overflow: 'hidden', background: theme.bg, minHeight: isMobile ? 'auto' : '65vh', display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '20px' : isTablet ? '32px' : '48px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 2, paddingTop: isMobile ? 112 : 160, paddingBottom: isMobile ? 96 : 130 }}>
          <h2 style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.028em', color: theme.text, maxWidth: 820, margin: '0 auto 24px', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.7s ease 0.08s, transform 0.7s ease 0.08s' }}>
            {data.titleLine1}<br />
            <span style={{ background: SUNSET, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{data.titleHighlight}</span>
          </h2>
          <p style={{ fontSize: isMobile ? '1rem' : '1.125rem', color: theme.text, lineHeight: 1.75, maxWidth: 600, margin: '0 auto 44px', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.7s ease 0.16s, transform 0.7s ease 0.16s' }}>
            {data.description}
          </p>
          <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.7s ease 0.24s, transform 0.7s ease 0.24s' }}>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ cursor: 'pointer' }}>
              {data.cta}
            </button>
          </div>
        </div>
      </section>
      <HubspotModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} portalId={hubspot.portalId} formId={hubspot.formId} />
    </>
  )
}

export default function InternalPartnercontent({ data }: { data: PartnerPageData }) {
  const theme: ThemeConfig = { ...DEFAULT_THEME, ...data.theme };
  return (
    <div style={{ background: theme.bg, fontFamily: "'Carlito','Segoe UI',sans-serif", position: 'relative' }}>
      <Hero data={data.hero} theme={theme} hubspot={data.hubspot} />
      <Overview_block data={data.overview} theme={theme} />
      <Expertise_powers data={data.expertise} theme={theme} />
      <FeaturesCarousel data={data.features} theme={theme} />
      <LastBlock data={data.lastBlock} theme={theme} hubspot={data.hubspot} />
    </div>
  )
}