
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import HubspotModal from '@/components/resources/HubspotModal';
import Link from 'next/link'
import Image from 'next/image'

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
  aRgb :    '59,132,255',
  accent:   '#3b84ff'
}
const SUNSET = 'linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%)'

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

function RevenueLedgerCanvas({aRgb}:{aRgb:string}) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current as HTMLCanvasElement; if (!cv) return
    const ctx = cv.getContext('2d') as CanvasRenderingContext2D; if (!ctx) return
    let raf: number
    const [FR,FG,FB] = aRgb.split(',').map(Number)
    function resize(){cv.width=cv.parentElement!.offsetWidth;cv.height=cv.parentElement!.offsetHeight}
    resize()
    const ro=new ResizeObserver(resize);ro.observe(cv.parentElement!)
    const SERIES=[
      {alphaMult:1.00,lineW:2.0,volatility:0.055,speedMult:1.0,phase:0.0,  isPrimary:true },
      {alphaMult:0.40,lineW:1.2,volatility:0.080,speedMult:1.3,phase:1.2,  isPrimary:false},
      {alphaMult:0.22,lineW:0.8,volatility:0.110,speedMult:0.8,phase:2.7,  isPrimary:false},
      {alphaMult:0.14,lineW:0.6,volatility:0.045,speedMult:1.5,phase:4.1,  isPrimary:false},
    ]
    const SEGS=160
    function lineNoise(xf:number,tt:number,ph:number,vol:number){
      return Math.sin(xf*6.2+tt*1.8+ph)*vol+Math.sin(xf*14.5+tt*2.6+ph*1.3)*vol*0.55+Math.sin(xf*3.1+tt*1.1+ph*0.7)*vol*0.35+Math.cos(xf*9.8+tt*3.2+ph*2.1)*vol*0.25
    }
    function trendFrac(xf:number){return Math.pow(xf,0.75)*0.82}
    function getY(xf:number,tt:number,ph:number,vol:number,H:number){
      const yf=Math.max(0.04,Math.min(0.98,1.0-trendFrac(xf)+lineNoise(xf,tt,ph,vol)))
      return yf*H
    }
    let t=0
    function draw(){
      const W=cv.width,H=cv.height
      if(W===0||H===0){raf=requestAnimationFrame(draw);return}
      ctx.clearRect(0,0,W,H);t+=0.006
      SERIES.forEach(s=>{
        const pts=Array.from({length:SEGS+1},(_,i)=>{const xf=i/SEGS;return{x:xf*W,y:getY(xf,t*s.speedMult,s.phase,s.volatility,H)}})
        if(s.isPrimary){
          ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(pts[0].x,pts[0].y)
          pts.forEach(p=>ctx.lineTo(p.x,p.y));ctx.lineTo(W,H);ctx.closePath()
          const fill=ctx.createLinearGradient(0,H*0.1,0,H)
          fill.addColorStop(0,`rgba(${FR},${FG},${FB},0.14)`);fill.addColorStop(0.6,`rgba(${FR},${FG},${FB},0.06)`);fill.addColorStop(1,`rgba(${FR},${FG},${FB},0.01)`)
          ctx.fillStyle=fill;ctx.fill()
        }
        ctx.beginPath();pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y))
        const lg=ctx.createLinearGradient(0,0,W,0)
        const a=s.alphaMult
        lg.addColorStop(0,   `rgba(${FR},${FG},${FB},${a*0.08})`)
        lg.addColorStop(0.30,`rgba(${FR},${FG},${FB},${a*0.14})`)
        lg.addColorStop(0.50,`rgba(${FR},${FG},${FB},${a*0.28})`)
        lg.addColorStop(0.65,`rgba(${FR},${FG},${FB},${a*0.72})`)
        lg.addColorStop(1.0, `rgba(${FR},${FG},${FB},${a*0.90})`)
        ctx.strokeStyle=lg;ctx.lineWidth=s.lineW;ctx.stroke()
        if(s.isPrimary){
          let peak=pts[SEGS]
          for(let i=Math.floor(SEGS*0.75);i<=SEGS;i++)if(pts[i].y<peak.y)peak=pts[i]
          const glo=ctx.createRadialGradient(peak.x,peak.y,0,peak.x,peak.y,24)
          glo.addColorStop(0,`rgba(${FR},${FG},${FB},0.55)`);glo.addColorStop(1,'rgba(0,0,0,0)')
          ctx.beginPath();ctx.arc(peak.x,peak.y,24,0,Math.PI*2);ctx.fillStyle=glo;ctx.fill()
          ctx.beginPath();ctx.arc(peak.x,peak.y,4,0,Math.PI*2);ctx.fillStyle=`rgba(${FR},${FG},${FB},0.95)`;ctx.fill()
        }
      })
      for(let i=1;i<=5;i++){const gy=H*(1-i*0.16);ctx.beginPath();ctx.moveTo(W*0.42,gy);ctx.lineTo(W+10,gy);ctx.strokeStyle=`rgba(${FR},${FG},${FB},0.05)`;ctx.lineWidth=0.6;ctx.stroke()}
      const lv=ctx.createLinearGradient(0,0,W*0.60,0)
      lv.addColorStop(0,'rgba(12,15,20,0.92)');lv.addColorStop(0.36,'rgba(12,15,20,0.75)');lv.addColorStop(0.54,'rgba(12,15,20,0.28)');lv.addColorStop(1,'transparent')
      ctx.fillStyle=lv;ctx.fillRect(0,0,W*0.60,H)
      const tf=ctx.createLinearGradient(0,0,0,H*0.13);tf.addColorStop(0,'rgba(12,15,20,0.75)');tf.addColorStop(1,'transparent');ctx.fillStyle=tf;ctx.fillRect(0,0,W,H*0.13)
      const bf=ctx.createLinearGradient(0,H*0.82,0,H);bf.addColorStop(0,'transparent');bf.addColorStop(1,'rgba(12,15,20,0.60)');ctx.fillStyle=bf;ctx.fillRect(0,H*0.82,W,H*0.18)
      raf=requestAnimationFrame(draw)
    }
    draw()
    return()=>{cancelAnimationFrame(raf);ro.disconnect()}
  },[aRgb])
  return <canvas ref={ref} aria-hidden="true" style={{position:'absolute',inset:0,width:'100%',height:'100%',display:'block',pointerEvents:'none'}} />
}


function Hero(){
  const [mounted,setMounted]=useState(false)
  const { isMobile, isTablet } = useBreakpoint()
  useEffect(()=>{setTimeout(()=>setMounted(true),80)},[])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const bg = C.bg
  const stylesHeroIconDesk = { 
    position: 'absolute', 
    right: '20%', 
    top: '5%'
  } as const;

  const stylesHeroIconMob = {
    position: 'relative', 
    left: '0', 
    top: '0',
    marginBottom: '30px'
  } as const;

  return (
    <>
      <section style={{position:'relative',overflow:'hidden',background:bg,padding:isMobile?'48px 0':isTablet?'72px 0':'90px 0 72px',display:'flex',alignItems:'center'}}>
        <RevenueLedgerCanvas  aRgb={C.aRgb} />
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:160,background:`linear-gradient(to bottom, transparent, ${bg})`,pointerEvents:'none',zIndex:2}} aria-hidden="true" />
        <div style={{maxWidth:1280,margin:'0 auto',padding:isMobile?'0 20px':isTablet?'0 32px':'0 48px',width:'100%',position:'relative',zIndex:3}}>
          <div style={isTablet ? stylesHeroIconMob : stylesHeroIconDesk}>
            <Image src="/icons/azul.png" alt="imageLogo" width={150} height={150} style={{ objectFit: 'contain', objectPosition: 'left' }} />
          </div>
          <div style={{maxWidth:640,opacity:mounted?1:0,transform:mounted?'translateY(0)':'translateY(24px)',transition:'opacity 0.7s ease, transform 0.7s ease'}}>
            <div style={{marginBottom:20}}>
              <span style={{fontSize:11,fontWeight:700,color:C.accent,textTransform:'uppercase',letterSpacing:'0.20em'}}>partner type</span>
            </div>
            <h1 style={{fontSize:'clamp(2rem, 4vw, 3.25rem)',fontWeight:700,lineHeight:1.08,letterSpacing:'-0.028em',color:C.text,maxWidth:640,marginBottom:24}}>
              Referral Partner<br /><span style={{color:C.accent}}>Refer. Reward. Repeat.</span>
            </h1>
            <p style={{fontSize:'1.0625rem',color:C.muted,lineHeight:1.75,maxWidth:520,marginBottom:40}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat</p>
            <button 
                onClick={() => setIsModalOpen(true)} 
                className="btn-primary"
                style={{ cursor: 'pointer', backgroundColor: C.accent, zIndex: 'unset', marginRight: '10px', borderColor: C.accent }}
              >
                Become a Partner
              </button>
            <Link href="/contact" className="btn-primary" style={{borderColor:C.accent}}>Contact Us</Link>
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

function Overview_block(){
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '56px 0' : '90px 0'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const twoCols = isTablet ? '1fr' : 'repeat(2, minmax(0, 1fr))'
  const sectionGap = isMobile ? '24px' : isTablet ? '32px' : '80px'
  return(
     <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Collection problems begin with fragmentation">
        <div aria-hidden="true" style={{ position: 'absolute', top: '10%', right: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(251,86,7,0.06) 0%, transparent 60%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '0%', left: '5%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.04) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'start' }}>
            <div>
              <Reveal>
                <Eyebrow color={C.accent}>Partner program</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                  Overview
                </h2>
              </Reveal>
              <Reveal delay={70}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
                  <p style={{ fontSize: 16, color: C.text, lineHeight: 1.75, margin: 0 }}>
                    Client data lives in one system. Assets live in another. Billing rules
                    sit somewhere else. Contract terms may be buried in PDFs, email threads,
                    or static spreadsheets. By quarter-end, finance and operations are forced
                    to stitch the truth together by hand.
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Right: bullet list — bare icons, no backgrounds */}
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {[
                { label: 'Earned But Not Collected', icon: 'fa-circle-check',    detail: 'Revenue leaves the book before it is ever invoiced because billing logic does not reflect the full relationship.' },
                { label: 'EBITDA Impact Is Direct',  icon: 'fa-circle-check' },
                { label: 'Compounding Over Time',    icon: 'fa-circle-check' },
                { label: 'Manual Reconciliation Cost', icon: 'fa-circle-check' },
              ].map((item, i) => (
                <Reveal key={item.label} delay={i * 70}>
                  <li className="cl-bullet-row" style={{display:'flex', gap:'5px'}}>
                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                      <i className={`fa-solid ${item.icon}`} style={{ color: C.accent, fontSize: 16, lineHeight: 1 }} aria-hidden="true" />
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: '15px', lineHeight: 1 }}>{item.label}</p>
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

function Expertise_powers(){
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '56px 0' : '90px 0'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const relatedCols = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'
  return(
   <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Related revenue challenges">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 350, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <Reveal>
            <h2 style={{ fontSize: 'clamp(2.5rem,4vw,3.5rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.02em', margin: '0 0 8px', textAlign: 'center' }}>How it Work</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: relatedCols, gap: 16, alignItems: 'stretch' }}>
            {[
              { icon: 'fa-circle-check',              color: C.azure,    label: 'Compression', href: '/why-purefacts/compression', desc: 'Fee pressure is rising while cost to serve expands. See how firms protect margin without sacrificing growth.', isPlatform: false },
              { icon: 'fa-circle-check', color: C.azure, label: 'Collection',  href: '/why-purefacts/collection',  desc: 'Revenue you earned but did not collect is margin lost. See how firms close the gap between realized and collected value.', isPlatform: false },
              { icon: 'fa-circle-check',                        color: C.azure,    label: 'Secure Your Revenue Lifecycle', href: '/platform', desc: 'Compression, collection, and complexity are connected problems. The PureFacts platform addresses all three.', isPlatform: false },
            ].map((card, i) => (
              <Reveal key={card.label} delay={i * 70} style={{ display: 'flex' }}>
                {card.isPlatform ? (
                  <Link
                    href={card.href}
                    className="cx-gradient-border"
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: isMobile ? '24px 22px' : '28px 26px', textDecoration: 'none', position: 'relative', overflow: 'hidden', transition: 'transform 0.3s ease' }}
                    aria-label={`${card.label}: ${card.desc}`}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    <div style={{ width: 180, height: 40, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Image src="/PureRevenueWhite.svg" alt="PureRevenue" width={200} height={50} style={{ objectFit: 'contain' }} />
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: C.text, margin: '0 0 10px' }}>{card.label}</h3>
                    <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, margin: '0 0 20px', flex: 1 }}>{card.desc}</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: C.honey }}>
                      Explore the platform <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} aria-hidden="true" />
                    </span>
                  </Link>
                ) : (
                  <Link href={card.href} className="cx-related-card" style={{ flex: 1, border: `1px solid ${card.color}`, padding: isMobile ? '24px 22px' : '28px 26px', }} aria-label={`${card.label}: ${card.desc}`}>
                    <div style={{ flexShrink: 0, marginBottom: 16 }}>
                      <i className={`fa-solid ${card.icon}`} style={{ color: card.color, fontSize: 16, lineHeight: 1 }} aria-hidden="true" />
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: C.text, margin: '0 0 10px' }}>{card.label}</h3>
                    <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, margin: '0 0 20px', flex: 1 }}>{card.desc}</p>
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

function Eyebrow({ children, color = C.azure }: { children: React.ReactNode; color?: string }) {
  return <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.20em', color, margin: '0 0 14px' }}>{children}</p>
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
            <Eyebrow color={C.accent}>HOW IT WORKS</Eyebrow>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.03em', color: C.text, marginBottom: 16 }}>
              Your journey<br /><span style={{ color: C.accent }}>to partnership</span>
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
                    <div style={{ fontSize: 'clamp(6rem,15vw,10rem)', fontWeight: 100, paddingTop: '3vh', float: 'right', lineHeight: 1, letterSpacing: '-0.04em', color: C.accent, margin: 0 }} aria-label={feat.count}>{feat.count}</div>
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


export default function ContentReferralParnerClient() {

  return (
    <div style={{ background:C.bg, fontFamily:"'Carlito','Segoe UI',sans-serif", position:'relative' }}>
      <Hero />
      <Overview_block />
      <Expertise_powers />
      <FeaturesCarousel accent={C.accent} />
      <LastBlock />
    </div>
  )
}

