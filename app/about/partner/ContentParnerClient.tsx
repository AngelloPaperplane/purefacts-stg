
'use client'


import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

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
  muted:   'rgba(244,244,244,0.75)',
  subtle:  'rgba(244,244,244,0.45)',
  border:  'rgba(255,255,255,0.07)',
}

const SUNSET = 'linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%)'

function Hero() {
  const { isMobile, isTablet } = useBreakpoint()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 80) }, [])
  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: 'radial-gradient(ellipse 120% 80% at 50% 10%, #1a1e2e 0%, #140f0c 55%)', minHeight: isMobile ? 'auto' : '65vh', display: 'flex', alignItems: 'flex-start' }}>
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
    { label:'Organic Growth',  stat:'2x',    statSub:'organic growth rate potential', body:'Help advisors make better pricing, retention, and growth decisions. Every interaction becomes an opportunity to deepen the relationship and expand wallet share.',                  points:['Better advisor pricing discipline','Reduced client churn','Wallet share expansion','Advisor-level growth actions'] },
    { label:'EBITDA Margin',   stat:'4 bps', statSub:'efficiency gains documented',   body:'Capture more earned revenue, reduce leakage, and improve pricing discipline. The opportunity is already inside the business, waiting to be surfaced.',                              points:['Revenue leakage elimination','Billing accuracy at scale','Pricing gap closure','Operational drag reduction'] },
    { label:'Enterprise Value',stat:'100%', statSub:'Gross Profit',       body:'Turn better revenue performance into stronger EBITDA and higher firm value. When revenue performance compounds, so does the valuation multiple.',                                    points:['EBITDA margin improvement','Scalable revenue infrastructure','Governance and auditability','Board-level performance visibility'] },
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
          <h2 style={{ fontSize:'clamp(1.8rem, 3vw, 2.6rem)', fontWeight:700, lineHeight:1.12, letterSpacing:'-0.025em', color:C.text, maxWidth:640, marginBottom:14 }}>
            Better revenue performance compounds into{' '}
            <span style={{ color:C.azure }}>enterprise value.</span>
          </h2>
          <p style={{ fontSize:'1rem', color:C.muted, lineHeight:1.7, maxWidth:560 }}>
            When firms capture more earned revenue, improve pricing discipline, and align advisor behavior, the impact compounds across top-line growth, EBITDA, and enterprise value.
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap:'16px' }}>
          {ITEMS.map((item, i) => (
            <div key={item.label} style={{ padding:isMobile ? '32px 24px' : '48px 40px', background:'rgba(59,132,255,0.06)', border:`1px solid rgba(59,132,255,0.18)`, position:'relative', overflow:'hidden', opacity:inView?1:0, transform:inView?'translateY(0)':'translateY(24px)', transition:`opacity 0.55s ease ${0.1+i*0.1}s, transform 0.55s ease ${0.1+i*0.1}s` }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:C.azure }} aria-hidden="true" />
              <div style={{ fontSize:'clamp(2.5rem, 5vw, 3.75rem)', fontWeight:800, color:C.azure, letterSpacing:'-0.05em', lineHeight:1, marginBottom:6 }}>{item.stat}</div>
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

export default function ContentParnerClient() {

  return (
    <div style={{ background:C.bg, fontFamily:"'Carlito','Segoe UI',sans-serif", position:'relative' }}>
      <Hero />
      <ChooseYourPath />
    </div>
  )
}