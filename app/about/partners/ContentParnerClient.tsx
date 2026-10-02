
'use client'


import { useEffect, useRef, useState, useCallback } from 'react'
import HubspotModal from '@/components/resources/HubspotModal';

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

const C = {
  bg:      '#140f0c',
  surface: '#1a1410',
  azure:   '#3b84ff',
  mand:    '#fb5607',
  honey:   '#ffb30c',
  indigo:  '#4760FF',
  text:    '#f4f4f4',
  mandarin:'#fb5607',
  body:    'rgba(244,244,244,0.75)',
  muted:   'rgba(244,244,244,0.75)',
  subtle:  'rgba(244,244,244,0.45)',
  border:  'rgba(255,255,255,0.07)',
  pink:    '#ED65D0'
}

const SUNSET = 'linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%)'

/*
function Hero() {
  const { isMobile, isTablet } = useBreakpoint()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 80) }, [])
  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: 'radial-gradient(ellipse 120% 80% at 50% 10%, #1a1e2e 0%, #140f0c 55%)', minHeight: isMobile ? 'auto' : '65vh', display: 'flex', alignItems: 'flex-start', backgroundImage: 'url("/background/fondo_35.jpg")', backgroundPosition: 'center center', backgroundSize: 'cover' }}>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 180, background: `linear-gradient(to bottom, transparent, ${C.bg})`, pointerEvents: 'none', zIndex: 1 }} aria-hidden="true" />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 2, paddingTop: isMobile ? 112 : 160, paddingBottom: isMobile ? 96 : 130 }}>
        <div style={{ fontSize:14, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:C.azure, marginBottom:14 }}>Connected by design</div>
        <h1 style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.028em', color: C.text, maxWidth: 820, margin: '0 auto 24px', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.7s ease 0.08s, transform 0.7s ease 0.08s' }}>
          Stronger together.<br />
          <span style={{ background: SUNSET, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Built for impact.</span>
        </h1>
        <p style={{ fontSize: isMobile ? '1.125rem' : '1.5rem', color: C.text, lineHeight: 1.75, maxWidth: 600, margin: '0 auto 44px', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.7s ease 0.16s, transform 0.7s ease 0.16s' }}>
          The PureFacts Partner Program empowers organizations to create more value, accelerate growth, and deliver exceptional results-together.
        </p>
        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.7s ease 0.24s, transform 0.7s ease 0.24s' }}>
          <Link href="/contact" className="btn-primary">Become a Partner</Link>
        </div>
      </div>
    </section>
  )
}
*/

function Hero() {
  const { isMobile, isTablet } = useBreakpoint()
  const [mounted, setMounted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => { 
    setTimeout(() => setMounted(true), 80) 
  }, [])

  return (
    <>
      <section style={{ position: 'relative', overflow: 'hidden', background: 'radial-gradient(ellipse 120% 80% at 50% 10%, #1a1e2e 0%, #140f0c 55%)', minHeight: isMobile ? 'auto' : '65vh', display: 'flex', alignItems: 'flex-start', backgroundImage: 'url("/background/fondo_35.jpg")', backgroundPosition: 'center center', backgroundSize: 'cover' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 180, background: `linear-gradient(to bottom, transparent, ${C.bg})`, pointerEvents: 'none', zIndex: 1 }} aria-hidden="true" />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 2, paddingTop: isMobile ? 112 : 160, paddingBottom: isMobile ? 96 : 130 }}>
          <div style={{ fontSize:14, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:C.azure, marginBottom:14 }}>Connected by design</div>
          <h1 style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.028em', color: C.text, maxWidth: 820, margin: '0 auto 24px', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.7s ease 0.08s, transform 0.7s ease 0.08s' }}>
            Stronger together.<br />
            <span style={{ background: SUNSET, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Built for impact.</span>
          </h1>
          <p style={{ fontSize: isMobile ? '1.125rem' : '1.5rem', color: C.text, lineHeight: 1.75, maxWidth: 600, margin: '0 auto 44px', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.7s ease 0.16s, transform 0.7s ease 0.16s' }}>
            The PureFacts Partner Program empowers organizations to create more value, accelerate growth, and deliver exceptional results-together.
          </p>
          <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.7s ease 0.24s, transform 0.7s ease 0.24s' }}>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="btn-primary"
              style={{ cursor: 'pointer' }}
            >
              Become a Partner
            </button>
          </div>
        </div>
      </section>

      <HubspotModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        portalId="3218774" 
        formId="647e0e88-54fc-4271-86ed-33f5b6cb2c65"
      />
    </>
  )
}

function useInView(threshold = 0.08) {
  const ref = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true) }, { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function ChooseYourPath(){
  const { isMobile, isTablet } = useBreakpoint()
  const { ref, inView } = useInView()
  const ITEMS = [
    { label:'Referral Partner',  stat:'fa-solid fa-user-plus',    statSub:'', body:'Refer PureFacts and earn rewards for opportunities that convert.', points:[] },
    { label:'Implementation Partner',   stat:'fa-solid fa-user-gear', statSub:'',   body:'Deliver successful PureFacts implementations and drive customer outcomes.', points:[] },
    { label:'Technology & Integration Partner',stat:'fa-solid fa-user-shield', statSub:'',       body:'Build integrations and extensions that enhance the PureFacts platform.',  points:[] },
  ]
  return (
    <section ref={ref as React.RefObject<HTMLElement>} style={{ background:C.bg, padding:isMobile ? '64px 0' : '100px 0', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'-5%', left:'15%', width:700, height:400, pointerEvents:'none', background:'radial-gradient(ellipse, rgba(59,132,255,0.07) 0%, transparent 60%)' }} aria-hidden="true" />
      <div style={{ position:'absolute', top:'30%', right:'-8%', width:550, height:450, pointerEvents:'none', background:'radial-gradient(ellipse, rgba(255,179,12,0.06) 0%, transparent 58%)' }} aria-hidden="true" />
      <div style={{ position:'absolute', bottom:'-5%', left:'-6%', width:500, height:400, pointerEvents:'none', background:'radial-gradient(ellipse, rgba(237,101,208,0.05) 0%, transparent 58%)' }} aria-hidden="true" />
      <div style={{ position:'absolute', top:'50%', left:'40%', width:500, height:380, pointerEvents:'none', background:'radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 60%)' }} aria-hidden="true" />
      <div style={{ position:'absolute', top:'-2%', right:'20%', width:380, height:300, pointerEvents:'none', background:'radial-gradient(ellipse, rgba(255,0,110,0.04) 0%, transparent 58%)' }} aria-hidden="true" />

      <div style={{ maxWidth:1280, margin:'0 auto', padding:isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px' }}>
        <div style={{ marginBottom:isMobile ? 36 : 56, opacity:inView?1:0, transform:inView?'translateY(0)':'translateY(16px)', transition:'opacity 0.6s ease, transform 0.6s ease' }}>
          <div style={{ fontSize:14, fontWeight:700, letterSpacing:'0.18em',textAlign:'center', textTransform:'uppercase', color:C.azure, marginBottom:14 }}>CHOOSE YOUR PATH</div>
          <h2 style={{ fontSize:'clamp(1.8rem, 3vw, 2.6rem)', fontWeight:700, lineHeight:1.12, letterSpacing:'-0.025em', color:C.text, maxWidth:640, margin:'14px auto', textAlign:'center' }}>
            Partnerships{' '}
            <span style={{ color:C.azure }}>designed</span><br/>for the way you work
          </h2>
          <p style={{ textAlign: 'center', fontSize:'1rem', color:C.muted, lineHeight:1.7, maxWidth:560, margin:'0 auto' }}>
            When firms capture more earned revenue, improve pricing discipline, and align advisor behavior, the impact compounds across top-line growth, EBITDA, and enterprise value.
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap:'16px' }}>
          {ITEMS.map((item, i) => (
            <div key={item.label} style={{ padding:isMobile ? '32px 24px' : '48px 40px', background:'rgba(59,132,255,0.06)', border:`1px solid rgba(59,132,255,0.18)`, position:'relative', overflow:'hidden', opacity:inView?1:0, transform:inView?'translateY(0)':'translateY(24px)', transition:`opacity 0.55s ease ${0.1+i*0.1}s, transform 0.55s ease ${0.1+i*0.1}s` }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:C.azure }} aria-hidden="true" />
              <div className={item.stat} style={{ fontSize:'clamp(2.5rem, 5vw, 3.75rem)', fontWeight:800, color:C.azure, letterSpacing:'-0.05em', lineHeight:1, marginBottom:6 }}></div>
              <div style={{ fontSize:11, color:'rgba(59,132,255,0.7)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:24 }}>{item.statSub}</div>
              <div style={{ fontSize:14, fontWeight:700, color:C.text, letterSpacing:'-0.01em', marginBottom:12 }}>{item.label}</div>
              <p style={{ fontSize:'0.875rem', color:C.muted, lineHeight:1.7, marginBottom:24 }}>{item.body}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                {item.points.map((pt,j) => (
                  <div key={j} style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:5, height:5, borderRadius:'50%', background:'rgba(59,132,255,0.5)', flexShrink:0 }} aria-hidden="true" />
                    <span style={{ fontSize:12.5, color:C.muted, lineHeight:1.5 }}>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
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
function Eyebrow({ children, color = C.azure }: { children: React.ReactNode; color?: string }) {
  return <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.20em', color, margin: '0 0 14px' }}>{children}</p>
}

function WhyPartners(){
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '56px 0' : '90px 0'
  const heroPad = isMobile ? '48px 0 48px' : '90px 0 72px'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const twoCols = isTablet ? '1fr' : 'repeat(2, minmax(0, 1fr))'
  const heroGap = isMobile ? '24px' : isTablet ? '32px' : '80px'
  const sectionGap = isMobile ? '24px' : isTablet ? '32px' : '80px'
  const cardGridCols = isMobile ? '1fr' : '1fr 1fr'

  return(
    <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Why a connected platform matters">
        <div aria-hidden="true" style={{ position: 'absolute', top: '10%', right: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.06) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'start' }}>

            {/* Left: eyebrow, H2, body */}
            <div>
              <Reveal>
                <Eyebrow color={C.mandarin}>WHY PARTNER WITH PUREFACTS</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                  More value for your<br />
                  <span style={{ color: C.mandarin }}>business and your customers</span>
                </h2>
              </Reveal>
              <Reveal delay={70}>
                <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}></p>
              </Reveal>
            </div>

            {/* Right: icons list (moved from below body, graphic removed) */}
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', alignSelf: 'start' }}>
              {[
                { label: 'Share opportunities', color: C.mandarin,    icon: 'fa-share',                      detail: 'Unlock new streams and expand your market reach.' },
                { label: 'Win together',        color: C.mandarin,    icon: 'fa-people-arrows',              detail: 'Access co-selling opportunities and partner incentives.' },
                { label: 'Enable success',      color: C.mandarin,    icon: 'fa-person-arrow-up-from-line',  detail: 'Leverage training, tools, and dedicated partner support.' },
                { label: 'Innovate together',   color: C.mandarin,    icon: 'fa-lightbulb',                  detail: 'Build, integrate, and shape the future of data intelligence.' },
              ].map((item, i) => (
                <Reveal key={item.label} delay={i * 70}>
                  <li className="pa-bullet-row">
                    <i className={`fa-solid ${item.icon}`} style={{ color: item.color, fontSize: 18, flexShrink: 0, width: 20, textAlign: 'center' as const, marginTop: 2 }} aria-hidden="true" />
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
      </section>
  )
}

const ACCENT = '#ED65D0'
const FEATURES = [
  { icon: 'fa-check-to-slot', title: 'Apply', body: 'Tell us about your business and goals.', count: '01' },
  { icon: 'fa-magnifying-glass-chart', title: 'Review', body: 'Our team reviews your submission and follows up.', count: '02' },
  { icon: 'fa-plane-departure', title: 'Onboard', body: 'Complete orboarding and gain partner access.', count: '03' },
  { icon: 'fa-angles-up', title: 'Grow', body: 'Start colaborating, diving value and growing together.', count: '04' },
]
const CAROUSEL_DURATION = 3200

function FeaturesCarousel({ accent }: { accent: string }) {
  const { ref, inView } = useInView(0.05)
  const { isMobile, isTablet } = useBreakpoint()
  const N = FEATURES.length
  const [active, setActive] = useState(0)
  const [fillPct, setFillPct] = useState(0)
  const [paused, setPaused] = useState(false)
  const rafRef   = useRef<number>(0)
  const startRef = useRef<number>(Date.now())
  const dragRef  = useRef({ down: false, startX: 0, moved: false })
  const aRgb = '237,101,208'

  const prev = useCallback(() => { setActive(a => a - 1); setFillPct(0); startRef.current = Date.now() }, [])
  const next = useCallback(() => { setActive(a => a + 1); setFillPct(0); startRef.current = Date.now() }, [])

  useEffect(() => {
    return;
    if (paused) { cancelAnimationFrame(rafRef.current); return }
    startRef.current = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startRef.current
      setFillPct(Math.min(100, (elapsed / CAROUSEL_DURATION) * 100))
      //if (elapsed >= CAROUSEL_DURATION) { setActive(a => a + 1); setFillPct(0); startRef.current = Date.now() }
      if (elapsed >= CAROUSEL_DURATION) { setFillPct(0); startRef.current = Date.now() }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [paused, active])

  const onPointerDown = (e: React.PointerEvent) => { dragRef.current = { down: true, startX: e.clientX, moved: false }; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); setPaused(true) }
  const onPointerMove = (e: React.PointerEvent) => { if (!dragRef.current.down) return; if (Math.abs(e.clientX - dragRef.current.startX) > 8) dragRef.current.moved = true }
  const onPointerUp = (e: React.PointerEvent) => { if (!dragRef.current.down) return; const dx = e.clientX - dragRef.current.startX; if (Math.abs(dx) > 40) dx < 0 ? next() : prev(); dragRef.current.down = false; setFillPct(0); startRef.current = Date.now(); setPaused(false) }

  const f = FEATURES[((active % N) + N) % N]
  const sectionPad = isMobile ? '64px 0' : '100px 0'
  const innerPad   = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const gridCols   = isTablet ? '1fr' : '1.04fr 1.55fr'

  return (
    <section ref={ref as React.RefObject<HTMLElement>} aria-label="Platform features" style={{ background: C.bg, padding: sectionPad, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-5%', left: '20%', width: 700, height: 400, pointerEvents: 'none', background: `radial-gradient(ellipse, ${accent}0f 0%, transparent 60%)` }} aria-hidden="true" />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: isTablet ? '32px' : '40px', alignItems: 'center' }}>
          <div style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
            <Eyebrow color={C.pink}>HOW IT WORKS</Eyebrow>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.03em', color: C.text, marginBottom: 16 }}>
              Your journey<br /><span style={{ color: C.pink }}>to partnership</span>
            </h2>
            <p style={{ fontSize: '0.9375rem', color: C.muted, lineHeight: 1.75, maxWidth: 360, marginBottom: 32 }}>A simple process to get started and set your partnership in motion.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[{ html: '&#8592;', fn: prev, aria: 'Previous feature' }, { html: '&#8594;', fn: next, aria: 'Next feature' }].map(({ html, fn, aria }) => (
                <button key={aria} onClick={() => { fn(); setPaused(true); setTimeout(() => setPaused(false), 4000) }}
                  style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: `1px solid ${C.border}`, color: C.muted, fontSize: 16, cursor: 'pointer', transition: 'border-color 0.2s, color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = accent; (e.currentTarget as HTMLElement).style.color = accent }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.muted }}
                  aria-label={aria} dangerouslySetInnerHTML={{ __html: html }} />
              ))}
            </div>
          </div>

          {isTablet ? (
            // tablet: no top accent bar, no icon bg/border
            <div style={{ background: `rgba(${aRgb},0.07)`, border: `1px solid ${accent}`, padding: '28px 24px 24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', marginBottom: 18 }}>
                <i className={`fa-solid ${f.icon}`} style={{ color: accent, fontSize: 20 }} aria-hidden="true" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 10 }}>{f.title}</div>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: 0 }}>{f.body}</p>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `rgba(${aRgb},0.12)` }} aria-hidden="true">
                <div style={{ height: '100%', width: `${fillPct}%`, background: accent, transition: 'none' }} />
              </div>
            </div>
          ) : (
            // desktop: carousel, no top accent bar, no icon bg/border, icon fontSize 20
            <div role="region" aria-label="Features carousel" aria-live="polite"
              style={{ overflow: 'hidden', position: 'relative', cursor: 'grab', height: 320 }}
              onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
              onMouseEnter={() => setPaused(true)} onMouseLeave={() => { setFillPct(0); startRef.current = Date.now(); setPaused(false) }}>
              {Array.from({ length: 9 }, (_, k) => k - 4).map((offset, index) => {
                const fi = ((active + offset) % N + N) % N
                const feat = FEATURES[fi]
                const isCenter = offset === 0
                const CARD_W = 340, CARD_GAP = 20
                return (
                  <div key={`slot-${offset}`}
                    onClick={() => { if (!dragRef.current.moved && !isCenter) setActive(a => a + offset) }}
                    aria-hidden={!isCenter}
                    style={{ position: 'absolute', top: 0, left: 0, width: CARD_W, height: '100%', padding: '32px 28px 20px', boxSizing: 'border-box', background: isCenter ? `rgba(${aRgb},0.07)` : C.surface, border: `1px solid ${isCenter ? accent : C.border}`, overflow: 'hidden', opacity: Math.abs(offset) <= 1 ? (isCenter ? 1 : 0.5) : 0, transform: `translateX(${offset * (CARD_W + CARD_GAP)}px)`, transition: 'opacity 0.35s ease, border-color 0.35s ease, background 0.35s ease, transform 0.45s cubic-bezier(0.4,0,0.2,1)', cursor: isCenter ? 'default' : 'pointer', pointerEvents: Math.abs(offset) > 2 ? 'none' : 'auto' }}>
                    {/* no top accent bar */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', marginBottom: 20 }}>
                      <i className={`fa-solid ${feat.icon}`} style={{ color: accent, fontSize: 20 }} aria-hidden="true" />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 10, lineHeight: 1.3 }}>{feat.title}</div>
                    <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: 0 }}>{feat.body}</p>
                    <div style={{ fontSize: 'clamp(6rem,15vw,10rem)', fontWeight: 100, paddingTop: '3vh', float: 'right', lineHeight: 1, letterSpacing: '-0.04em', color: C.pink, margin: 0 }} aria-label={feat.count}>{feat.count}</div>
                    {isCenter && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `rgba(${aRgb},0.12)` }} aria-hidden="true">
                        <div style={{ height: '100%', width: `${fillPct}%`, background: accent, transition: 'none' }} />
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


function LastBlock() {
  const { isMobile, isTablet } = useBreakpoint()
  const [mounted, setMounted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 80) }, [])
  return (
    <>
    <section style={{ position: 'relative', overflow: 'hidden', background: 'radial-gradient(ellipse 120% 80% at 50% 10%, #1a1e2e 0%, #140f0c 55%)', minHeight: isMobile ? 'auto' : '65vh', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '20px' : isTablet ? '32px' : '48px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 2, paddingTop: isMobile ? 112 : 160, paddingBottom: isMobile ? 96 : 130 }}>
        <h2 style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.028em', color: C.text, maxWidth: 820, margin: '0 auto 24px', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.7s ease 0.08s, transform 0.7s ease 0.08s' }}>
          Let’s build<br />
          <span style={{ background: SUNSET, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>what’s next</span>
        </h2>
        <p style={{ fontSize: isMobile ? '1rem' : '1.125rem', color: C.muted, lineHeight: 1.75, maxWidth: 600, margin: '0 auto 44px', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.7s ease 0.16s, transform 0.7s ease 0.16s' }}>
          Join the PureFacts Partner Program and be part of an ecosystem that's transforming how the world works with data.
        </p>
        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.7s ease 0.24s, transform 0.7s ease 0.24s' }}>
          <button 
              onClick={() => setIsModalOpen(true)} 
              className="btn-primary"
              style={{ cursor: 'pointer' }}
            >
              Become a Partner
            </button>
        </div>
      </div>
    </section>
    <HubspotModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        portalId="3218774" 
        formId="647e0e88-54fc-4271-86ed-33f5b6cb2c65"
      />
    </>
  )
}

export default function ContentParnerClient() {

  return (
    <div style={{ background:C.bg, fontFamily:"'Carlito','Segoe UI',sans-serif", position:'relative' }}>
      <Hero />
      <ChooseYourPath />
      <WhyPartners />
      <FeaturesCarousel accent={ACCENT}/>
      <LastBlock />
    </div>
  )
}