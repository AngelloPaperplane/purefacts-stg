'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity/client'
import { type ClientLogo } from '@/components/sections/LogoCarousel'
import { motion, useInView as useFramerInView } from 'framer-motion'

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
}
const SUNSET = 'linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%)'
const ACCENT = '#ffb30c'
const A_RGB  = '255,179,12'

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

// ─── Hero Canvas: Topographic terrain lines (honey accent) ────────────────────
function TopoCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    let raf: number, t = 0, W = 0, H = 0
    function resize() { W = canvas!.width = canvas!.parentElement!.offsetWidth; H = canvas!.height = canvas!.parentElement!.offsetHeight }
    resize()
    const ro = new ResizeObserver(resize); ro.observe(canvas.parentElement!)
    const LINES = 18
    function noiseVal(x: number, y: number, t2: number) {
      return Math.sin(x * 0.018 + t2 * 0.3) * Math.cos(y * 0.025 + t2 * 0.18) +
             Math.sin(x * 0.031 + y * 0.019 + t2 * 0.22) * 0.6 +
             Math.cos(x * 0.009 + y * 0.041 + t2 * 0.15) * 0.4
    }
    function draw() {
      ctx!.clearRect(0, 0, W, H); t += 0.007
      for (let li = 0; li < LINES; li++) {
        const norm = li / (LINES - 1), baseY = H * 0.12 + norm * H * 0.76
        const isCenter = Math.abs(norm - 0.5) < 0.08, isNearCenter = Math.abs(norm - 0.5) < 0.22
        const brightness = isCenter ? 0.55 : isNearCenter ? 0.12 + (0.22 - Math.abs(norm - 0.5)) * 1.5 : 0.05 + norm * 0.18
        const lineWidth = isCenter ? 1.5 : isNearCenter ? 0.9 : 0.5
        let strokeColor: string
        if (isCenter) strokeColor = `rgba(${A_RGB},${brightness})`
        else if (isNearCenter) strokeColor = `rgba(${A_RGB},${brightness * 0.7})`
        else strokeColor = `rgba(180,150,80,${brightness * 0.5})`
        const SEGS = 120
        ctx!.beginPath(); let first = true
        for (let s = 0; s <= SEGS; s++) {
          const x = (s / SEGS) * W, nx = (s / SEGS) * 6
          const noise = noiseVal(nx * 18, baseY / H * 12, t + li * 0.4)
          const amp = 30 * (1 - Math.abs(norm - 0.5) * 0.7), y = baseY + noise * amp
          const xFraction = x / W, leftAlpha = xFraction < 0.44 ? Math.max(0, xFraction / 0.44 - 0.3) : 1.0
          if (leftAlpha < 0.05) { first = true; continue }
          if (first) { ctx!.moveTo(x, y); first = false } else ctx!.lineTo(x, y)
        }
        ctx!.strokeStyle = strokeColor; ctx!.lineWidth = lineWidth; ctx!.stroke()
        if (isCenter) {
          ctx!.beginPath()
          for (let s = 0; s <= SEGS; s++) {
            const x = (s / SEGS) * W, nx = (s / SEGS) * 6
            const noise = noiseVal(nx * 18, baseY / H * 12, t + li * 0.4), y = baseY + noise * 30 * 0.6
            if (s === 0) ctx!.moveTo(x, y); else ctx!.lineTo(x, y)
          }
          ctx!.lineTo(W, H); ctx!.lineTo(0, H); ctx!.closePath(); ctx!.fillStyle = `rgba(${A_RGB},0.018)`; ctx!.fill()
        }
      }
      const vig = ctx!.createLinearGradient(0, 0, W * 0.52, 0); vig.addColorStop(0, 'rgba(20,15,12,0.97)'); vig.addColorStop(0.42, 'rgba(20,15,12,0.85)'); vig.addColorStop(0.55, 'rgba(20,15,12,0.40)'); vig.addColorStop(1, 'transparent'); ctx!.fillStyle = vig; ctx!.fillRect(0, 0, W * 0.55, H)
      const top = ctx!.createLinearGradient(0, 0, 0, H * 0.18); top.addColorStop(0, 'rgba(20,15,12,0.7)'); top.addColorStop(1, 'transparent'); ctx!.fillStyle = top; ctx!.fillRect(0, 0, W, H * 0.18)
      const bot = ctx!.createLinearGradient(0, H * 0.75, 0, H); bot.addColorStop(0, 'transparent'); bot.addColorStop(1, 'rgba(20,15,12,0.95)'); ctx!.fillStyle = bot; ctx!.fillRect(0, H * 0.75, W, H * 0.25)
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])
  return <canvas ref={ref} aria-hidden="true" style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} />
}

// ─── 1. Hero ──────────────────────────────────────────────────────────────────
function Hero() {
  const { isMobile, isTablet } = useBreakpoint()
  const heroPad = isMobile ? '40px 20px 36px' : isTablet ? '56px 32px' : '64px 48px'
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 80) }, [])
  return (
    <section style={{ position:'relative', overflow:'hidden', background:C.bg, padding:heroPad, display:'flex', alignItems:'center' }}>
      <TopoCanvas />
      <div style={{position:'absolute',top:'-10%',right:'5%',width:600,height:550,pointerEvents:'none',background:`radial-gradient(ellipse, rgba(${A_RGB},0.06) 0%, transparent 60%)`,zIndex:0}} aria-hidden="true" />
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:200,background:`linear-gradient(to bottom, transparent, ${C.bg})`,pointerEvents:'none',zIndex:2}} aria-hidden="true" />
      <div style={{maxWidth:1280,margin:'0 auto',padding:isMobile?'0 20px':isTablet?'0 32px':'0 48px',width:'100%',position:'relative',zIndex:3}}>
        <div style={{maxWidth:580,opacity:mounted?1:0,transform:mounted?'translateY(0)':'translateY(24px)',transition:'opacity 0.7s ease, transform 0.7s ease'}}>
          <div style={{marginBottom:20}}><span style={{fontSize:11,fontWeight:700,color:ACCENT,textTransform:'uppercase',letterSpacing:'0.20em'}}>Asset Servicing</span></div>
          <h1 style={{fontSize:'clamp(2rem, 4vw, 3.25rem)',fontWeight:700,lineHeight:1.08,letterSpacing:'-0.028em',color:C.text,maxWidth:560,marginBottom:24}}>
            Make fee and rebate operations a{' '}<span style={{color:ACCENT}}>client retention advantage.</span>
          </h1>
          <p style={{fontSize:'1.0625rem',color:C.muted,lineHeight:1.75,maxWidth:480,marginBottom:40}}>
            PureFacts helps asset servicers standardize fee and rebate operations, automate manual workflows, reduce exception-driven risk, and deliver audit-ready revenue outcomes across complex platforms.
          </p>
          <Link href="/contact" className="btn-primary" style={{borderColor:ACCENT}}>Get in contact</Link>
        </div>
      </div>
    </section>
  )
}

// ─── 2. Three Forces ──────────────────────────────────────────────────────────
const THREE_FORCES = [
  { number:'01', title:'Complexity', desc:'Multi-fund, multi-entity, multi-domicile servicing platforms multiply fee logic variants. Without centralized governance, each new client or structure adds fragility.', href:'/industry/challenges' },
  { number:'02', title:'Collection', desc:'Rebate and trailer fee flows across distributors and entities create reconciliation burdens that manual processes and legacy systems cannot reliably contain.', href:'/industry/challenges' },
  { number:'03', title:'Compliance', desc:'Clients and regulators increasingly demand transparent, defensible fee evidence. Fragmented workflows and spreadsheet trails carry structural governance risk.', href:'/industry/challenges' },
]

function TheProblem() {
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '56px 0' : '90px 0'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const twoCols = isTablet ? '1fr' : '1fr 1fr'
  const sectionGap = isMobile ? '24px' : isTablet ? '32px' : '72px'
  const { ref, inView } = useInView(0.1)
  const [revealed, setRevealed] = useState([false,false,false])
  useEffect(() => { if(!inView)return; THREE_FORCES.forEach((_,i)=>{setTimeout(()=>setRevealed(prev=>{const n=[...prev];n[i]=true;return n}),200+i*200)}) },[inView])
  return (
    <section ref={ref as React.RefObject<HTMLElement>} style={{background:C.bg,padding:sectionPad,position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:'10%',left:'50%',transform:'translateX(-50%)',width:900,height:500,pointerEvents:'none',background:`radial-gradient(ellipse, rgba(${A_RGB},0.05) 0%, transparent 60%)`}} aria-hidden="true" />
      <div style={{maxWidth:1280,margin:'0 auto',padding:innerPad}}>
        <div style={{display:'grid',gridTemplateColumns:twoCols,gap:sectionGap,alignItems:'start'}}>
          <div>
            <h2 style={{fontSize:'clamp(1.8rem, 3vw, 2.75rem)',fontWeight:700,lineHeight:1.1,letterSpacing:'-0.025em',margin:'0 0 24px',opacity:inView?1:0,transform:inView?'translateY(0)':'translateY(16px)',transition:'opacity 0.6s ease, transform 0.6s ease'}}>
              <span style={{color:C.text}}>Three forces are </span><span style={{color:ACCENT}}>squeezing</span><span style={{color:C.text}}> asset servicing </span><span style={{color:ACCENT}}>economics.</span>
            </h2>
            <div style={{opacity:inView?1:0,transform:inView?'translateY(0)':'translateY(12px)',transition:'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s'}}>
              <p style={{fontSize:'1rem',color:C.muted,lineHeight:1.75,margin:'0 0 16px'}}>Compression, collection complexity, and rising transparency demands are converging simultaneously. The servicing infrastructure built for simpler platforms becomes structural risk as client complexity and volume grow.</p>
              <p style={{fontSize:'1rem',color:C.muted,lineHeight:1.75,margin:'0 0 36px'}}>When fee logic is fragmented and exception handling is normalized, every new client or fund structure adds operational exposure rather than revenue confidence.</p>
              <Link href="/industry/challenges" className="btn-alt" style={{borderColor:ACCENT,color:C.text}}>Explore industry challenges</Link>
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:0}}>
            {THREE_FORCES.map((force,i)=>(
              <div key={force.title} style={{opacity:revealed[i]?1:0,transform:revealed[i]?'translateX(0)':'translateX(16px)',transition:'opacity 0.5s ease, transform 0.5s ease'}}>
                <div style={{display:'grid',gridTemplateColumns:'52px 1fr',gap:'20px',paddingBottom:i===2?0:(isMobile?'16px':'28px'),paddingTop:i===0?0:(isMobile?'16px':'28px'),alignItems:'start'}}>
                  <div style={{fontSize:'2.5rem',fontWeight:800,color:`rgba(${A_RGB},0.32)`,letterSpacing:'-0.06em',lineHeight:1,paddingTop:4}}>{force.number}</div>
                  <div>
                    <div style={{fontSize:'1.0625rem',fontWeight:700,color:C.text,letterSpacing:'-0.01em',marginBottom:8}}>{force.title}</div>
                    <p style={{fontSize:13.5,color:C.muted,lineHeight:1.7,margin:'0 0 10px'}}>{force.desc}</p>
                    <a href={force.href} style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:12,fontWeight:600,color:ACCENT,textDecoration:'none',opacity:0.8}}>
                      Learn more <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 5h6M5.5 2.5l2.5 2.5-2.5 2.5" stroke={ACCENT} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── 3. Why Asset Servicers (Carousel) ───────────────────────────────────────
const WHY_FEATURES = [
  { icon:'fa-layer-group', title:'Standardize Fee Logic Across Entities', body:'Apply consistent fee and rebate logic across funds, domiciles, and entities, reducing dependency on spreadsheets and local interpretations that create systematic error risk.' },
  { icon:'fa-shield-halved', title:'Govern Rebate and Trailer Fee Flows', body:'Embedded controls, approval workflows, and transparent oversight ensure consistent calculations and defensible outputs across all distribution relationships.' },
  { icon:'fa-bolt', title:'Automate End-to-End Billing Workflows', body:'Reduce manual effort, key-person risk, and exception-driven operational strain. Scale servicing capacity without scaling headcount.' },
  { icon:'fa-file-lines', title:'Strengthen Client Reporting', body:'Structured, explainable outputs eliminate manual assembly and accelerate client responses. Reporting that builds confidence rather than requiring explanation.' },
  { icon:'fa-magnifying-glass-chart', title:'Audit-Ready Revenue Evidence', body:'Approval history and workflow traceability built into every process. When regulators or clients ask, the evidence already exists, not assembled after the fact.' },
]
const CAROUSEL_DURATION = 3400

function WhyAssetServicers() {
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '56px 0' : '90px 0'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const gridCols = isTablet ? '1fr' : '1.04fr 1.55fr'
  const gridGap = isMobile ? '24px' : isTablet ? '32px' : '40px'
  const { ref, inView } = useInView(0.05)
  const [active, setActive] = useState(0), [fillPct, setFillPct] = useState(0), [paused, setPaused] = useState(false)
  const rafRef = useRef<number>(0), startRef = useRef<number>(Date.now()), dragRef = useRef({down:false,startX:0,moved:false})
  const N = WHY_FEATURES.length
  const prev = useCallback(()=>{setActive(a=>a-1);setFillPct(0);startRef.current=Date.now()},[])
  const next = useCallback(()=>{setActive(a=>a+1);setFillPct(0);startRef.current=Date.now()},[])
  useEffect(()=>{
    if(paused){cancelAnimationFrame(rafRef.current);return}
    startRef.current=Date.now()
    const tick=()=>{const elapsed=Date.now()-startRef.current;setFillPct(Math.min(100,(elapsed/CAROUSEL_DURATION)*100));if(elapsed>=CAROUSEL_DURATION){setActive(a=>a+1);setFillPct(0);startRef.current=Date.now()};rafRef.current=requestAnimationFrame(tick)}
    rafRef.current=requestAnimationFrame(tick);return()=>cancelAnimationFrame(rafRef.current)
  },[paused,active])
  const onPointerDown=(e:React.PointerEvent)=>{dragRef.current={down:true,startX:e.clientX,moved:false};(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);setPaused(true)}
  const onPointerMove=(e:React.PointerEvent)=>{if(!dragRef.current.down)return;if(Math.abs(e.clientX-dragRef.current.startX)>8)dragRef.current.moved=true}
  const onPointerUp=(e:React.PointerEvent)=>{if(!dragRef.current.down)return;const dx=e.clientX-dragRef.current.startX;if(Math.abs(dx)>40)dx<0?next():prev();dragRef.current.down=false;setFillPct(0);startRef.current=Date.now();setPaused(false)}
  const cardWidth=340,cardGap=20,WINDOW=4,cardSlots=Array.from({length:WINDOW*2+1},(_,k)=>k-WINDOW)
  return (
    <section ref={ref as React.RefObject<HTMLElement>} style={{background:C.bg,padding:sectionPad,position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:'-5%',left:'20%',width:700,height:400,pointerEvents:'none',background:`radial-gradient(ellipse, rgba(${A_RGB},0.06) 0%, transparent 60%)`}} aria-hidden="true" />
      <div style={{maxWidth:1280,margin:'0 auto',padding:innerPad}}>
        <div style={{display:'grid',gridTemplateColumns:gridCols,gap:gridGap,alignItems:'center'}}>
          <div style={{position:isTablet?'relative':'sticky',top:isTablet?'auto':96,opacity:inView?1:0,transform:inView?'translateY(0)':'translateY(16px)',transition:'opacity 0.6s ease, transform 0.6s ease'}}>
            <h2 style={{fontSize:'clamp(2rem, 3.5vw, 3rem)',fontWeight:700,lineHeight:1.08,letterSpacing:'-0.03em',color:C.text,marginBottom:20}}>Why asset servicers<br/><span style={{color:ACCENT}}>choose PureFacts.</span></h2>
            <p style={{fontSize:'0.9375rem',color:C.muted,lineHeight:1.75,maxWidth:340,marginBottom:40}}>PureFacts is purpose-built to help asset servicers strengthen revenue integrity across complex, multi-entity operating models. Embedding revenue governance directly into your servicing platform so scale improves resilience rather than increasing risk.</p>
            <div style={{display:'flex',gap:12}}>
              {[{label:'←',fn:prev},{label:'→',fn:next}].map(({label,fn})=>(
                <button key={label} onClick={()=>{fn();setPaused(true);setTimeout(()=>setPaused(false),4000)}} style={{width:44,height:44,display:'flex',alignItems:'center',justifyContent:'center',background:'transparent',border:`1px solid ${C.border}`,color:C.muted,fontSize:16,cursor:'pointer',transition:'border-color 0.2s, color 0.2s'}} onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=ACCENT;(e.currentTarget as HTMLElement).style.color=ACCENT}} onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=C.border;(e.currentTarget as HTMLElement).style.color=C.muted}} aria-label={label==='←'?'Previous':'Next'}>{label}</button>
              ))}
            </div>
          </div>
          <div className="industry-carousel-track" style={{overflow:'hidden',position:'relative',cursor:'grab',height:280}} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>{setFillPct(0);startRef.current=Date.now();setPaused(false)}}>
            {cardSlots.map(offset=>{
              const featureIndex=((active+offset)%N+N)%N,f=WHY_FEATURES[featureIndex],isCenter=offset===0,xPos=offset*(cardWidth+cardGap)
              return (
                <div key={`slot-${offset}`} data-active-card={isCenter?'true':undefined} onClick={()=>{if(!dragRef.current.moved&&!isCenter)setActive(a=>a+offset)}}
                  style={{position:'absolute',top:0,left:0,width:cardWidth,height:'100%',padding:'32px 28px 28px',background:isCenter?`rgba(${A_RGB},0.07)`:C.surface,border:`1px solid ${isCenter?ACCENT:C.border}`,overflow:'hidden',opacity:Math.abs(offset)<=1?(isCenter?1:0.5):0,transform:`translateX(${xPos}px)`,transition:'opacity 0.35s ease, border-color 0.35s ease, background 0.35s ease, transform 0.45s cubic-bezier(0.4,0,0.2,1)',cursor:isCenter?'default':'pointer',pointerEvents:Math.abs(offset)>2?'none':'auto',boxSizing:'border-box'}}>
                  {/* icon: no bg/border, fontSize 20 */}
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'flex-start',marginBottom:20}}>
                    <i className={`fa-solid ${f.icon}`} style={{color:ACCENT,fontSize:20}} aria-hidden="true" />
                  </div>
                  <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:10,lineHeight:1.3}}>{f.title}</div>
                  <p style={{fontSize:13,color:C.muted,lineHeight:1.7,margin:0}}>{f.body}</p>
                  {isCenter&&(<div style={{position:'absolute',bottom:0,left:0,right:0,height:2,background:`rgba(${A_RGB},0.12)`}} aria-hidden="true"><div style={{height:'100%',width:`${fillPct}%`,background:ACCENT,transition:'none'}} /></div>)}
                </div>
              )
            })}
            <div style={{position:'absolute',top:0,right:0,bottom:0,width:80,background:`linear-gradient(to right, transparent, ${C.bg})`,pointerEvents:'none',zIndex:10}} aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── 4. What PureFacts Delivers (two-col tab+panel) ───────────────────────────
interface DeliverItem { number: string; icon: string; title: string; body: string; bullets: string[]; stat: { value: string; label: string } }
const DELIVERS_ITEMS: DeliverItem[] = [
  { number:'01', icon:'fa-layer-group', title:'Standardized Fee Operations', body:'Apply consistent fee models across funds, domiciles, and entities with governed logic that scales as client complexity grows, without multiplying operational fragmentation.', bullets:['Single fee engine across all fund structures','Domicile-specific rule governance','Eliminates local spreadsheet interpretation','Version-controlled schedule management'], stat:{value:'1–5%',label:'EBITDA recovered from operational consistency'} },
  { number:'02', icon:'fa-money-bill-transfer', title:'Governed Rebate Controls', body:'Validate and control rebate and trailer fee flows with embedded approvals and transparent oversight. Every payment governed, traceable, and defensible.', bullets:['Rebate calculation validation at source','Approval gates before distributor payments','Full audit trail on every rebate run','Exception queue with root-cause tracing'], stat:{value:'99.9%',label:'rebate accuracy rate across entities'} },
  { number:'03', icon:'fa-bolt', title:'Automated Billing Workflows', body:'Replace manual cycles and exception-driven processing with automated, rules-based billing that produces accurate results and flags anomalies before they become breaks.', bullets:['Rules-based billing runs at enterprise scale','Pre-billing anomaly detection and routing','Automated exception queue management','No manual intervention for standard runs'], stat:{value:'30%',label:'reduction in billing cycle time'} },
  { number:'04', icon:'fa-file-lines', title:'Structured Client Reporting', body:'Explainable, structured outputs that reduce manual assembly time and give clients the transparency they need. Reporting that builds confidence rather than requiring qualification.', bullets:['Automated fee disclosure generation','Client-facing transparency on every charge','Reduces manual report assembly time','Audit-ready client statement trail'], stat:{value:'100%',label:'of billing runs fully documented'} },
  { number:'05', icon:'fa-file-shield', title:'Built-In Audit Evidence', body:'Approval trails and workflow traceability are embedded in every process by design. Evidence exists when it is needed, not assembled after the fact.', bullets:['Immutable approval history on every run','Data lineage from source to output','Regulator-ready evidence packages','No post-hoc assembly required'], stat:{value:'€150B+',label:'AUA governed for a European fund administrator'} },
  { number:'06', icon:'fa-magnifying-glass-chart', title:'Data-Driven Pricing Decisions', body:'Connect fee governance with operational metrics and client-level profitability to enable structured pricing reviews and confident repricing decisions.', bullets:['Client-level profitability analysis','Fee schedule performance by segment','Pricing gap identification at scale','Structured repricing workflow support'], stat:{value:'$15T+',label:'AUA governed on the platform today'} },
]

function WhatWeDeliver() {
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '56px 0' : '90px 0'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const topCols = isTablet ? '1fr' : '1fr 1fr'
  const stackTabs = isTablet
  const { ref, inView } = useInView(0.05)
  const [active, setActive] = useState(0), [paused, setPaused] = useState(false), [fillPct, setFillPct] = useState(0)
  const startRef = useRef<number>(Date.now()), rafRef = useRef<number>(0)
  const N = DELIVERS_ITEMS.length, DURATION = 4500
  useEffect(()=>{
    if(!inView||paused){cancelAnimationFrame(rafRef.current);return}
    startRef.current=Date.now()
    const tick=()=>{const elapsed=Date.now()-startRef.current;setFillPct(Math.min(100,(elapsed/DURATION)*100));if(elapsed>=DURATION){setActive(a=>(a+1)%N);setFillPct(0);startRef.current=Date.now()};rafRef.current=requestAnimationFrame(tick)}
    rafRef.current=requestAnimationFrame(tick);return()=>cancelAnimationFrame(rafRef.current)
  },[inView,paused,active])
  const goTo=(i:number)=>{setActive(i);setFillPct(0);startRef.current=Date.now()}
  const p=DELIVERS_ITEMS[active]
  return (
    <section ref={ref as React.RefObject<HTMLElement>} style={{background:C.bg,padding:sectionPad,position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:'-5%',left:'20%',width:700,height:400,pointerEvents:'none',background:`radial-gradient(ellipse, rgba(${A_RGB},0.05) 0%, transparent 60%)`}} aria-hidden="true" />
      <div style={{maxWidth:1280,margin:'0 auto',padding:innerPad}}>
        <div style={{display:'grid',gridTemplateColumns:topCols,gap:isMobile?'24px':'64px',marginBottom:56,alignItems:'end',opacity:inView?1:0,transform:inView?'translateY(0)':'translateY(16px)',transition:'opacity 0.6s ease, transform 0.6s ease'}}>
          <div>
            <div style={{marginBottom:14}}><span style={{fontSize:11,fontWeight:700,color:ACCENT,textTransform:'uppercase',letterSpacing:'0.20em'}}>Revenue Integrity</span></div>
            <h2 style={{fontSize:'clamp(1.8rem, 3vw, 2.6rem)',fontWeight:700,lineHeight:1.12,letterSpacing:'-0.025em',color:C.text,margin:0}}>What <span style={{color:ACCENT}}>revenue integrity</span> looks like in practice.</h2>
          </div>
          <p style={{fontSize:'1rem',color:C.muted,lineHeight:1.75,margin:0}}>When revenue logic, workflows, and reporting live in one governed environment, exceptions become manageable events instead of the operating model.</p>
        </div>
        <div onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>{startRef.current=Date.now();setFillPct(0);setPaused(false)}} style={{display:stackTabs?'grid':'flex',gridTemplateColumns:stackTabs?'1fr':undefined,gap:isMobile?'16px':'32px',opacity:inView?1:0,transform:inView?'translateY(0)':'translateY(16px)',transition:'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s'}}>
          <div style={{width:stackTabs?'100%':'45%',display:'flex',flexDirection:'column',gap:8}}>
            {DELIVERS_ITEMS.map((item,i)=>{const isActive=active===i;return(
              <button key={item.number} onClick={()=>goTo(i)} onMouseEnter={()=>goTo(i)} style={{position:'relative',overflow:'hidden',display:'flex',alignItems:'center',gap:16,width:'100%',padding:'16px 20px',textAlign:'left',background:isActive?`rgba(${A_RGB},0.08)`:'rgba(255,255,255,0.02)',border:`1px solid ${isActive?`rgba(${A_RGB},0.28)`:C.border}`,cursor:'pointer',transition:'background 0.25s, border-color 0.25s'}}>
                {isActive&&!paused&&<div style={{position:'absolute',bottom:0,left:0,height:2,width:`${fillPct}%`,background:ACCENT,transition:'none'}} aria-hidden="true" />}
                {/* tab icon: no bg/border */}
                <div style={{width:36,height:36,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}} aria-hidden="true">
                  <i className={`fa-solid ${item.icon}`} style={{color:isActive?ACCENT:'rgba(244,244,244,0.28)',fontSize:13,transition:'color 0.25s'}} />
                </div>
                <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:700,lineHeight:1.3,color:isActive?C.text:C.muted,transition:'color 0.25s'}}>{item.title}</div></div>
                <span style={{fontSize:14,color:isActive?ACCENT:'rgba(244,244,244,0.15)',transform:isActive?'translateX(3px)':'none',transition:'color 0.25s, transform 0.25s'}} aria-hidden="true">→</span>
              </button>
            )})}
          </div>
          <div style={{width:stackTabs?'100%':'55%'}}>
            <div style={{position:stackTabs?'relative':'sticky',top:stackTabs?'auto':96,overflow:'hidden',background:'rgba(26,20,16,0.6)',border:`1px solid rgba(255,255,255,0.09)`,boxShadow:`0 0 50px rgba(${A_RGB},0.06), inset 0 1px 0 rgba(255,255,255,0.06)`}}>
              <div style={{height:1,width:'100%',background:`linear-gradient(to right, ${ACCENT}, rgba(${A_RGB},0.35), transparent)`}} aria-hidden="true" />
              <div style={{position:'absolute',top:-32,right:-32,width:176,height:176,pointerEvents:'none',background:`radial-gradient(circle, rgba(${A_RGB},0.12) 0%, transparent 70%)`,filter:'blur(40px)'}} aria-hidden="true" />
              <div style={{position:'relative',padding:isMobile?'28px 24px':'32px 36px 28px'}}>
                {/* detail card: inline icon + title, no eyebrow, no bg/border on icon */}
                <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16}}>
                  <i className={`fa-solid ${p.icon}`} style={{color:ACCENT,fontSize:17,flexShrink:0}} aria-hidden="true" />
                  <h3 style={{fontSize:'1.0625rem',fontWeight:700,color:C.text,lineHeight:1.25,letterSpacing:'-0.02em',margin:0}}>{p.title}</h3>
                </div>
                <p style={{fontSize:'0.875rem',color:C.muted,lineHeight:1.75,margin:'0 0 20px'}}>{p.body}</p>
                {/* 2×2 callout grid using bullets */}
                <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:8,marginBottom:20}}>
                  {p.bullets.map((b,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',border:`1px solid rgba(${A_RGB},0.14)`,background:`rgba(${A_RGB},0.04)`}}>
                      <div style={{width:5,height:5,borderRadius:'50%',background:ACCENT,flexShrink:0}} aria-hidden="true" />
                      <span style={{fontSize:12.5,color:C.muted,lineHeight:1.4,fontWeight:500}}>{b}</span>
                    </div>
                  ))}
                </div>
                <div style={{borderTop:'1px solid rgba(255,255,255,0.07)',paddingTop:16,display:'flex',alignItems:'baseline',gap:8}}>
                  <span style={{fontSize:'1.5rem',fontWeight:800,color:ACCENT,letterSpacing:'-0.04em',lineHeight:1}}>{p.stat.value}</span>
                  <span style={{fontSize:12,color:C.muted}}>{p.stat.label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── 5. Platform Connection ───────────────────────────────────────────────────
const DIAGRAM_WEDGES = [
  { id:'practice', label:'Practice Management', startAngle:-60, endAngle:60, fill:'none', stroke:'#ffb30c', faUnicode:'\uf201' },
  { id:'comp', label:'Compensation', startAngle:60, endAngle:180, fill:'none', stroke:'#FF006E', faUnicode:'\uf51e' },
  { id:'fees', label:'Fees & Billing', startAngle:180, endAngle:300, fill:'none', stroke:'#ED65D0', faUnicode:'\uf571' },
]
function diagramPolarToXY(cx:number,cy:number,r:number,angleDeg:number){const rad=(angleDeg-90)*Math.PI/180;return{x:cx+r*Math.cos(rad),y:cy+r*Math.sin(rad)}}
function diagramWedgePath(cx:number,cy:number,outerR:number,innerR:number,s:number,e:number){const o1=diagramPolarToXY(cx,cy,outerR,s),o2=diagramPolarToXY(cx,cy,outerR,e),i2=diagramPolarToXY(cx,cy,innerR,e),i1=diagramPolarToXY(cx,cy,innerR,s),lg=e-s>180?1:0;return`M${o1.x} ${o1.y} A${outerR} ${outerR} 0 ${lg} 1 ${o2.x} ${o2.y} L${i2.x} ${i2.y} A${innerR} ${innerR} 0 ${lg} 0 ${i1.x} ${i1.y}Z`}

function PureRevenueDiagram({visible}:{visible:boolean}){
  const { isMobile } = useBreakpoint()
  const VB=200,CX=100,CY=100,INNER=43,OUTER=84,WEDGE_INNER=INNER+2,LABEL_R=OUTER+18
  return (
    <div style={{position:'relative',width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{position:'absolute',width:'min(260px,70%)',aspectRatio:'1',borderRadius:'50%',pointerEvents:'none',background:`radial-gradient(circle, rgba(59,132,255,0.13) 0%, transparent 70%)`}} aria-hidden="true" />
      <div style={{position:'relative',width:isMobile?'min(194px,67vw)':'min(340px,88%)',aspectRatio:'1'}}>
        <svg viewBox={`0 0 ${VB} ${VB}`} style={{width:'100%',height:'100%',overflow:'visible'}}>
          <defs><radialGradient id="hub-grad-as2-azure" cx="40%" cy="35%" r="60%"><stop offset="0%" stopColor="rgba(59,132,255,0.20)"/><stop offset="100%" stopColor="rgba(59,132,255,0.05)"/></radialGradient></defs>
          {DIAGRAM_WEDGES.map((w,wi)=>{
            const path=diagramWedgePath(CX,CY,OUTER,WEDGE_INNER,w.startAngle,w.endAngle),mid=(w.startAngle+w.endAngle)/2,iconPt=diagramPolarToXY(CX,CY,(OUTER+WEDGE_INNER)/2,mid),labelPt=diagramPolarToXY(CX,CY,LABEL_R,mid),textAnchor=labelPt.x<CX-5?'end':labelPt.x>CX+5?'start':'middle',words=w.label.split(' '),half=Math.ceil(words.length/2)
            return (<g key={w.id}><path d={path} fill={w.fill} stroke={w.stroke} strokeWidth="1.5" opacity={visible?1:0} style={{transformOrigin:`${CX}px ${CY}px`,transform:visible?'scale(1)':'scale(0.88)',transition:`opacity 0.55s ease ${wi*0.18}s, transform 0.55s ease ${wi*0.18}s`}} /><text x={iconPt.x} y={iconPt.y} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="900" fontFamily="'Font Awesome 6 Free', 'Font Awesome 6 Pro', 'Font Awesome 5 Free'" fill={w.stroke} opacity={visible?1:0} style={{transition:`opacity 0.4s ease ${wi*0.18+0.18}s`}}>{w.faUnicode}</text><text x={labelPt.x} y={labelPt.y} textAnchor={textAnchor} dominantBaseline="middle" fontSize="8.5" fontWeight="700" fill={w.stroke} style={{letterSpacing:'0.02em',opacity:visible?1:0,transition:`opacity 0.4s ease ${wi*0.18+0.30}s`}}>{words.length>1?(<><tspan x={labelPt.x} dy="-0.6em">{words.slice(0,half).join(' ')}</tspan><tspan x={labelPt.x} dy="1.3em">{words.slice(half).join(' ')}</tspan></>):w.label}</text></g>)
          })}
          <circle cx={CX} cy={CY} r={INNER+2} fill="#140f0c" /><circle cx={CX} cy={CY} r={INNER} fill="none" stroke="rgba(59,132,255,0.18)" strokeWidth="1.5" /><circle cx={CX} cy={CY} r={INNER} fill="none" stroke="rgba(59,132,255,0.45)" strokeWidth="1.5" />
          <text x={CX} y={CY} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="600" fill={C.text} style={{letterSpacing:'0.02em',opacity:visible?1:0,transition:'opacity 0.5s ease 0.38s'}}><tspan x={CX} dy="-5">Revenue Book</tspan><tspan x={CX} dy="11">of Record</tspan></text>
        </svg>
      </div>
    </div>
  )
}

const LEFT_NODES=[{label:'Custodians'},{label:'Portfolio Management'},{label:'CRM'},{label:'Trading Platform'}]
const RIGHT_NODES=[{label:'Accounting Systems'},{label:'Billing Systems'},{label:'Compensation Systems'},{label:'Customer Data Lakes'}]

function FoundationVisual({visible}:{visible:boolean}){
  const { isMobile } = useBreakpoint()
  const containerRef=useRef<HTMLDivElement>(null),[size,setSize]=useState({w:600,h:420})
  useEffect(()=>{const el=containerRef.current;if(!el)return;const ro=new ResizeObserver(e=>setSize({w:e[0].contentRect.width,h:e[0].contentRect.height}));ro.observe(el);return()=>ro.disconnect()},[])
  const {w}=size,NODE_W=isMobile?118:162,NODE_H=44,LEFT_X=isMobile?8:24,RIGHT_X=w-(isMobile?8:24)-NODE_W,NODE_TOPS=[88,160,232,304],HUB_R=62,cx=w/2,cy=(NODE_TOPS[0]+NODE_TOPS[3]+NODE_H)/2
  const leftConns=NODE_TOPS.map(top=>({fromX:LEFT_X+NODE_W,fromY:top+NODE_H/2})),rightConns=NODE_TOPS.map(top=>({fromX:RIGHT_X,fromY:top+NODE_H/2}))
  function hubEntry(fx:number,fy:number){const dx=cx-fx,dy=cy-fy,d=Math.sqrt(dx*dx+dy*dy);return{x:cx-(dx/d)*HUB_R,y:cy-(dy/d)*HUB_R}}
  function nodePath(fx:number,fy:number){const e=hubEntry(fx,fy),mx=(fx+cx)/2;return`M ${fx} ${fy} C ${mx} ${fy}, ${mx} ${e.y}, ${e.x} ${e.y}`}
  return (
    <div ref={containerRef} style={{position:'relative',width:'100%',height:'100%',overflow:'hidden'}}>
      <div style={{position:'absolute',left:cx-HUB_R*2.2,top:cy-HUB_R*2.2,width:HUB_R*4.4,height:HUB_R*4.4,borderRadius:'50%',pointerEvents:'none',background:`radial-gradient(circle, rgba(59,132,255,0.09) 0%, transparent 70%)`}} aria-hidden="true" />
      <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}} aria-hidden="true">
        {leftConns.map((c,i)=><path key={`l${i}`} d={nodePath(c.fromX,c.fromY)} fill="none" stroke={C.azure} strokeWidth="1.5" strokeOpacity={visible?0.55:0} style={{transition:`stroke-opacity 0.5s ease ${0.4+i*0.1}s`}} />)}
        {rightConns.map((c,i)=><path key={`r${i}`} d={nodePath(c.fromX,c.fromY)} fill="none" stroke={C.azure} strokeWidth="1.5" strokeOpacity={visible?0.55:0} style={{transition:`stroke-opacity 0.5s ease ${0.5+i*0.1}s`}} />)}
        {visible&&leftConns.map((c,i)=><circle key={`lp${i}`} r="2.5" fill={C.azure} opacity="0.9"><animateMotion dur={`${1.8+i*0.25}s`} repeatCount="indefinite" begin={`${i*0.4}s`} path={nodePath(c.fromX,c.fromY)} /></circle>)}
        {visible&&rightConns.map((c,i)=><circle key={`rp${i}`} r="2.5" fill={C.azure} opacity="0.9"><animateMotion dur={`${1.8+i*0.25}s`} repeatCount="indefinite" begin={`${i*0.4+0.3}s`} path={nodePath(c.fromX,c.fromY)} /></circle>)}
        <circle cx={cx} cy={cy} r={HUB_R} fill="none" stroke="rgba(59,132,255,0.45)" strokeWidth="1.5" />
      </svg>
      {LEFT_NODES.map((node,i)=><div key={node.label} style={{position:'absolute',left:LEFT_X,top:NODE_TOPS[i],width:NODE_W,height:NODE_H,background:C.surface,border:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'center',opacity:visible?1:0,transform:visible?'translateX(0)':'translateX(-12px)',transition:`opacity 0.45s ease ${i*0.09}s, transform 0.45s ease ${i*0.09}s`}}><span style={{fontSize:12,fontWeight:600,color:C.text,textAlign:'center',padding:'0 8px'}}>{node.label}</span></div>)}
      {RIGHT_NODES.map((node,i)=><div key={node.label} style={{position:'absolute',left:RIGHT_X,top:NODE_TOPS[i],width:NODE_W,height:NODE_H,background:C.surface,border:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'center',opacity:visible?1:0,transform:visible?'translateX(0)':'translateX(12px)',transition:`opacity 0.45s ease ${0.12+i*0.09}s, transform 0.45s ease ${0.12+i*0.09}s`}}><span style={{fontSize:12,fontWeight:600,color:C.text,textAlign:'center',padding:'0 8px'}}>{node.label}</span></div>)}
      <div style={{position:'absolute',left:cx-HUB_R,top:cy-HUB_R,width:HUB_R*2,height:HUB_R*2,borderRadius:'50%',border:'2px solid rgba(59,132,255,0.75)',background:'radial-gradient(circle at 40% 35%, rgba(59,132,255,0.28), rgba(59,132,255,0.08))',backdropFilter:'blur(12px)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:5,opacity:visible?1:0,transform:visible?'scale(1)':'scale(0.7)',transition:'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s'}}>
        <span style={{fontSize:12,fontWeight:600,color:C.text,lineHeight:1.35,textAlign:'center',padding:'0 10px'}}>Revenue Book<br/>of Record</span>
      </div>
    </div>
  )
}

const MODULES=[
  { id:'fees', name:'Fees and Billing', tagline:'Fee Management', color:'#ED65D0', colorMuted:'rgba(237,101,208,0.09)', border:'rgba(237,101,208,0.28)', borderHover:'rgba(237,101,208,0.45)', href:'/platform/fees-and-billing', points:['Complex fee schedule management','Automated billing runs at scale','Zero tolerance for calculation errors'], stat:{value:'$3B+',label:'fees calculated annually'} },
  { id:'comp', name:'Compensation', tagline:'Advisor Compensation', color:'#FF006E', colorMuted:'rgba(255,0,110,0.09)', border:'rgba(255,0,110,0.28)', borderHover:'rgba(255,0,110,0.45)', href:'/platform/compensation', points:['Sophisticated payout structures','Incentive and governance controls','Transparency that builds advisor trust'], stat:{value:'100%',label:'payout accuracy'} },
  { id:'practice', name:'Practice Management', tagline:'Revenue Intelligence', color:'#ffb30c', colorMuted:'rgba(255,179,12,0.09)', border:'rgba(255,179,12,0.28)', borderHover:'rgba(255,179,12,0.45)', href:'/platform/practice-management', points:['Pricing gap identification at scale','AI-native next-best advisor actions','Connected to Revenue Book of Record'], stat:{value:'Real-time',label:'pricing intelligence'} },
]

function ModuleCard({mod,index,visible}:{mod:typeof MODULES[0];index:number;visible:boolean}){
  const {isMobile}=useBreakpoint()
  const [hovered,setHovered]=useState(false)
  return (
    <motion.div initial={{opacity:0,y:24}} animate={visible?{opacity:1,y:0}:{opacity:0,y:24}} transition={{duration:0.55,delay:index*0.12,ease:[0.16,1,0.3,1]}} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{padding:isMobile?'20px 20px 18px':'28px 28px 24px',border:`1px solid ${hovered?mod.borderHover:mod.border}`,borderRadius:12,background:hovered?mod.colorMuted:C.surface,display:'flex',flexDirection:'column',transition:'border-color 0.2s, background 0.2s',position:'relative',overflow:'hidden'}}>
      {/* no top accent bar */}
      <div style={{marginBottom:18}}><div style={{fontSize:11,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:mod.color,marginBottom:5}}>{mod.tagline}</div><div style={{fontSize:21,fontWeight:700,color:C.text,letterSpacing:'-0.02em'}}>{mod.name}</div></div>
      <div style={{display:'flex',flexDirection:'column',gap:9,flex:1}}>{mod.points.map((pt,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:10}}><div style={{width:5,height:5,borderRadius:'50%',background:mod.color,flexShrink:0}} aria-hidden="true" /><span style={{fontSize:13.5,color:C.muted,lineHeight:1.6}}>{pt}</span></div>)}</div>
      <div style={{marginTop:20,paddingTop:16,borderTop:`1px solid ${C.border}`,display:'flex',alignItems:'baseline',gap:6}}><span style={{fontSize:isMobile?20:24,fontWeight:700,color:mod.color,letterSpacing:'-0.03em'}}>{mod.stat.value}</span><span style={{fontSize:13,color:C.muted}}>{mod.stat.label}</span></div>
      <Link href={mod.href} style={{marginTop:14,display:'inline-flex',alignItems:'center',gap:6,fontSize:13,fontWeight:600,color:mod.color,textDecoration:'none',opacity:hovered?1:0.7,transition:'opacity 0.2s'}}>Explore {mod.name}<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 6h7M6.5 3l3 3-3 3" stroke={mod.color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></Link>
    </motion.div>
  )
}

function PlatformConnection() {
  const { isMobile, isTablet } = useBreakpoint()
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const twoColGrid = isTablet ? '1fr' : '1fr 1fr'
  const sectionPad = isTablet ? '56px 0' : '90px 0'
  const row0Ref=useRef<HTMLDivElement>(null),row1Ref=useRef<HTMLDivElement>(null),row2Ref=useRef<HTMLDivElement>(null)
  const row0V=useFramerInView(row0Ref,{once:true,margin:'-80px 0px -80px 0px'}),row1V=useFramerInView(row1Ref,{once:true,margin:'-80px 0px -80px 0px'}),row2V=useFramerInView(row2Ref,{once:true,margin:'-80px 0px -80px 0px'})
  return (
    <section style={{background:C.bg,padding:sectionPad,position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:'-5%',left:'-8%',width:600,height:500,pointerEvents:'none',background:`radial-gradient(ellipse, rgba(${A_RGB},0.06) 0%, transparent 55%)`}} aria-hidden="true" />
      <div style={{maxWidth:1280,margin:'0 auto',padding:innerPad}}>
        <motion.div initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5}} style={{marginBottom:56}}>
          <h2 style={{fontSize:'clamp(2rem, 4vw, 3rem)',fontWeight:700,color:C.text,lineHeight:1.12,letterSpacing:'-0.03em',margin:0,maxWidth:640}}>
            One platform.<br/><span style={{color:ACCENT}}>Revenue governance</span><span style={{color:C.text}}> across every fund and entity.</span>
          </h2>
        </motion.div>
        <div ref={row0Ref} style={{display:'grid',gridTemplateColumns:twoColGrid,marginBottom:2,overflow:'hidden',border:`1px solid ${C.border}`}}>
          <div style={{padding:isTablet?'36px 24px':'52px 48px',background:C.surface,display:'flex',flexDirection:'column',justifyContent:'center'}}>
            <motion.div initial={{opacity:0,y:16}} animate={row0V?{opacity:1,y:0}:{}} transition={{duration:0.5}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',color:C.azure,marginBottom:14}}>The Platform</div>
              <h3 style={{fontSize:'clamp(1.4rem, 2.5vw, 1.9rem)',fontWeight:700,color:C.text,lineHeight:1.2,letterSpacing:'-0.025em',margin:'0 0 16px'}}>One operating system for revenue.</h3>
              <p style={{fontSize:15,color:C.muted,lineHeight:1.7,margin:'0 0 28px',maxWidth:400}}>Fees and Billing, Compensation, and Practice Management sit on top of the Revenue Book of Record, each pulling from the same data. One consistent view across every fund, entity, and servicing client.</p>
              <Link href="/platform/" className="btn-primary" style={{display:'inline-flex',maxWidth:200}}>Explore the Platform</Link>
            </motion.div>
          </div>
          <div style={{background:C.bg,minHeight:isTablet?320:420,display:'flex',alignItems:'center',justifyContent:'center',borderLeft:isTablet?'none':`1px solid ${C.border}`,borderTop:isTablet?`1px solid ${C.border}`:'none'}}>
            <PureRevenueDiagram visible={row0V} />
          </div>
        </div>
        <div ref={row1Ref} style={{border:`1px solid ${C.border}`,borderTop:'none',overflow:'hidden',background:C.bg}}>
          <div style={{padding:isTablet?'28px 24px 0':'40px 48px 0'}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',color:C.azure,marginBottom:10}}>The Modules</div>
            <h3 style={{fontSize:'clamp(1.3rem, 2.2vw, 1.75rem)',fontWeight:700,color:C.text,lineHeight:1.2,letterSpacing:'-0.025em',margin:0}}>Built for every dimension of revenue.</h3>
          </div>
          <div style={{display:'grid',gridTemplateColumns:isTablet?'1fr':'repeat(3, 1fr)',gap:16,padding:isTablet?'24px 24px 32px':'32px 48px 40px'}}>
            {MODULES.map((mod,i)=><ModuleCard key={mod.id} mod={mod} index={i} visible={row1V} />)}
          </div>
        </div>
        <div ref={row2Ref} style={{display:'grid',gridTemplateColumns:twoColGrid,marginTop:2,overflow:'hidden',border:`1px solid ${C.border}`,borderTop:'none'}}>
          <div style={{padding:isTablet?'36px 24px':'52px 48px',background:C.surface,display:'flex',flexDirection:'column',justifyContent:'center'}}>
            <motion.div initial={{opacity:0,y:16}} animate={row2V?{opacity:1,y:0}:{}} transition={{duration:0.5}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',color:C.azure,marginBottom:14}}>The Foundation</div>
              <h3 style={{fontSize:'clamp(1.4rem, 2.5vw, 1.9rem)',fontWeight:700,color:C.text,lineHeight:1.2,letterSpacing:'-0.025em',margin:'0 0 16px'}}>Revenue data, unified into one source of truth.</h3>
              <p style={{fontSize:15,color:C.muted,lineHeight:1.7,margin:'0 0 28px',maxWidth:400}}>The Revenue Book of Record consolidates every client, fund, contract, and fee schedule across the servicing platform. Every billing run, rebate calculation, and client report flows from one authoritative, always-current foundation, keeping revenue audit-ready at every stage.</p>
              <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:28}}>
                {['Fund structures, custodians, and client data connected','Fee schedules and rebate logic centralized across entities','Audit-ready evidence at every stage'].map((pt,i)=>(
                  <motion.div key={i} initial={{opacity:0,x:-8}} animate={row2V?{opacity:1,x:0}:{}} transition={{duration:0.4,delay:0.3+i*0.1}} style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:5,height:5,borderRadius:'50%',background:C.azure,flexShrink:0}} aria-hidden="true" />
                    <span style={{fontSize:13.5,color:C.muted}}>{pt}</span>
                  </motion.div>
                ))}
              </div>
              <a href="/platform/revenue-book-of-record" style={{display:'inline-flex',alignItems:'center',gap:6,fontSize:13,fontWeight:700,color:C.azure,textDecoration:'none'}}>
                Learn about the Revenue Book of Record
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 6h7M6.5 3l3 3-3 3" stroke={C.azure} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            </motion.div>
          </div>
          <div style={{background:C.bg,minHeight:isTablet?340:420,display:isMobile?'none':'flex',alignItems:'stretch',borderLeft:isTablet?'none':`1px solid ${C.border}`,borderTop:isTablet?`1px solid ${C.border}`:'none'}}>
            <FoundationVisual visible={row2V} />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── 6. Proof Band ─────────────────────────────────────────────────────────────
function LogoCard({logo,onPause,onResume}:{logo:ClientLogo;onPause:()=>void;onResume:()=>void}){
  return (<div className="relative flex flex-col items-center justify-center bg-[#f4f4f4] p-6 w-full aspect-square overflow-hidden rounded-[10px]" onMouseEnter={onPause} onMouseLeave={onResume}><div className="relative w-full h-16"><Image src={urlFor(logo.logo).width(480).height(192).url()} alt={logo.name} fill className="object-contain" draggable={false} sizes="160px" /></div>{logo.caseStudyUrl?(<div className="absolute bottom-3 inset-x-0 flex justify-center">{logo.caseStudyUrl.startsWith('http')?<a href={logo.caseStudyUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 whitespace-nowrap">Case study →</a>:<Link href={logo.caseStudyUrl} className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 whitespace-nowrap">Case study →</Link>}</div>):null}</div>)
}
function LogoColumn({logos,direction}:{logos:ClientLogo[];direction:'up'|'down'}){
  const innerRef=useRef<HTMLDivElement>(null),rafRef=useRef<number>(0),pausedRef=useRef(false)
  useEffect(()=>{const inner=innerRef.current;if(!inner)return;const getH=()=>inner.scrollHeight/2;let offset=direction==='down'?-getH():0;inner.style.transform=`translateY(${offset}px)`;const tick=()=>{const h=getH();if(h===0){rafRef.current=requestAnimationFrame(tick);return}if(!pausedRef.current){if(direction==='up'){offset-=0.8;if(offset<=-h)offset+=h}else{offset+=0.8;if(offset>=0)offset-=h}inner.style.transform=`translateY(${offset}px)`}rafRef.current=requestAnimationFrame(tick)};rafRef.current=requestAnimationFrame(tick);return()=>cancelAnimationFrame(rafRef.current)},[direction,logos.length])
  const items=[...logos,...logos]
  return (<div className="relative overflow-hidden" style={{height:520}}><div ref={innerRef} className="flex flex-col gap-3 will-change-transform">{items.map((logo,i)=><LogoCard key={`${logo._id}-${i}`} logo={logo} onPause={()=>{pausedRef.current=true}} onResume={()=>{pausedRef.current=false}} />)}</div><div className="pointer-events-none absolute inset-x-0 top-0 h-20 z-10" style={{background:`linear-gradient(to bottom, ${C.bg}, transparent)`}} /><div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 z-10" style={{background:`linear-gradient(to top, ${C.bg}, transparent)`}} /></div>)
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
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => { draggingRef.current = true; pausedRef.current = true; lastClientXRef.current = e.clientX; e.currentTarget.setPointerCapture(e.pointerId) }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => { const track = trackRef.current; if (!draggingRef.current || !track) return; const dx = e.clientX - lastClientXRef.current; lastClientXRef.current = e.clientX; xRef.current += dx; const setW = track.scrollWidth / 3; if (setW) { if (xRef.current <= -setW) xRef.current += setW; if (xRef.current > 0) xRef.current -= setW }; track.style.transform = `translateX(${xRef.current}px)` }
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => { draggingRef.current = false; pausedRef.current = false; e.currentTarget.releasePointerCapture(e.pointerId) }
  return (
    <div className="relative overflow-hidden" style={{ touchAction: 'pan-y', cursor: 'grab' }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onMouseEnter={() => { pausedRef.current = true }} onMouseLeave={() => { if (!draggingRef.current) pausedRef.current = false }}>
      <div ref={trackRef} className="flex gap-3 will-change-transform">
        {items.map((logo, i) => (<div key={`${logo._id}-${i}`} className="shrink-0" style={{ width: 'min(44vw, 168px)' }}><LogoCard logo={logo} onPause={() => { pausedRef.current = true }} onResume={() => { if (!draggingRef.current) pausedRef.current = false }} /></div>))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 z-10" style={{ background: `linear-gradient(to right, ${C.bg}, transparent)` }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 z-10" style={{ background: `linear-gradient(to left, ${C.bg}, transparent)` }} />
    </div>
  )
}
function ProofBand({logos}:{logos:ClientLogo[]}){
  const {isMobile}=useBreakpoint()
  const col1=logos.filter((_,i)=>i%3===0),col2=logos.filter((_,i)=>i%3===1),col3=logos.filter((_,i)=>i%3===2)
  const pad=(arr:ClientLogo[])=>{let out=[...arr];while(out.length<4)out=[...out,...(arr.length?arr:logos)];return out}
  return (
    <section style={{background:C.bg,position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:'20%',left:'50%',transform:'translateX(-50%)',width:800,height:500,pointerEvents:'none',background:`radial-gradient(ellipse, rgba(${A_RGB},0.05) 0%, transparent 60%)`}} aria-hidden="true" />
      {/* standardized proof band padding */}
      <div style={{maxWidth:1280,margin:'0 auto',padding:isMobile?'56px 20px':'90px 48px'}}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16 xl:gap-24">
          <div className="lg:w-[42%] flex-shrink-0 mb-16 lg:mb-0">
            <motion.h2 initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6}} className="text-3xl lg:text-4xl xl:text-5xl font-bold leading-[1.06] mb-5" style={{color:C.text}}>Trusted by leading asset servicers worldwide</motion.h2>
            <motion.p initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5,delay:0.1}} className="text-base leading-relaxed mb-10" style={{color:C.muted}}>The world&rsquo;s most demanding fund administrators and asset servicers rely on PureFacts to govern revenue with precision across complex, multi-entity platforms.</motion.p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',paddingTop:24,gap:16}}>
              {[{value:'€150B+',label:'AUA European Fund Administrator'},{value:'100%',label:'Fee Schedules Centralized'},{value:'Data-driven',label:'Pricing Decisions Enabled'}].map((s,i)=>(
                <motion.div key={s.label} initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5,delay:0.15+i*0.1}}>
                  <div style={{fontSize:'clamp(1.3rem, 2vw, 1.75rem)',fontWeight:800,color:C.honey,letterSpacing:'-0.03em',lineHeight:1,marginBottom:6}}>{s.value}</div>
                  <div style={{fontSize:10,color:C.subtle,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.12em',lineHeight:1.4}}>{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
          {isMobile ? (
            <MobileLogoCarousel logos={logos} />
          ) : (
            <div className="lg:w-[58%] grid grid-cols-3 gap-3 overflow-hidden">
              <LogoColumn logos={pad(col1)} direction="down" /><LogoColumn logos={pad(col2)} direction="up" /><LogoColumn logos={pad(col3)} direction="down" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── 7. Final CTA ─────────────────────────────────────────────────────────────
const CTA_FEATURES=[
  {icon:'fa-layer-group', color:C.azure, title:'Standardize Fee Operations', desc:'Apply consistent fee and rebate logic across funds, domiciles, and entities, replacing spreadsheets with governed controls.'},
  {icon:'fa-gear', color:C.mandarin, title:'Automate End-to-End Workflows', desc:'Reduce manual effort, key-person risk, and exception-driven strain by automating billing workflows at enterprise scale.'},
  {icon:'fa-file-shield', color:C.honey, title:'Deliver Audit-Ready Outcomes', desc:'Build approval trails and workflow traceability into every process so evidence is available by design, not assembled after the fact.'},
]
function FinalCTA(){
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '56px 0' : '80px 0 100px'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const ctaCols = isTablet ? '1fr' : 'repeat(2, minmax(0, 1fr))'
  const ctaGap = isMobile ? '32px' : isTablet ? '48px' : '80px'
  const {ref,inView}=useInView()
  return (
    <section ref={ref as React.RefObject<HTMLElement>} style={{background:C.bg,padding:sectionPad,position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:'0%',left:'50%',transform:'translateX(-50%)',width:800,height:500,pointerEvents:'none',background:`radial-gradient(ellipse, rgba(${A_RGB},0.07) 0%, transparent 60%)`}} aria-hidden="true" />
      <div style={{maxWidth:1280,margin:'0 auto',padding:innerPad}}>
        <div style={{display:'grid',gridTemplateColumns:ctaCols,alignItems:'center',gap:ctaGap}}>
          <div style={{flex:1,display:'flex',flexDirection:'column',gap:32}}>
            {CTA_FEATURES.map((f,i)=>(
              <div key={f.title} style={{display:'flex',alignItems:'flex-start',gap:20,opacity:inView?1:0,transform:inView?'translateX(0)':'translateX(-12px)',transition:`opacity 0.5s ease ${0.3+i*0.1}s, transform 0.5s ease ${0.3+i*0.1}s`}}>
                {/* icon: no background, flex-start */}
                <div style={{width:48,height:48,flexShrink:0,display:'flex',alignItems:'flex-start',justifyContent:'flex-start'}}>
                  <i className={`fa-solid ${f.icon}`} style={{color:f.color,fontSize:17}} aria-hidden="true" />
                </div>
                <div>
                  {/* title: lineHeight 1 */}
                  <p style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:4,lineHeight:1}}>{f.title}</p>
                  <p style={{fontSize:13,color:C.muted,lineHeight:1.65,margin:0}}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{flex:1}}>
            <h2 style={{fontSize:'clamp(1.8rem, 3.5vw, 2.8rem)',fontWeight:700,lineHeight:1.06,color:C.text,letterSpacing:'-0.025em',marginBottom:16,opacity:inView?1:0,transition:'opacity 0.6s ease 0.2s'}}>
              See what is hiding in your{' '}<span style={{background:SUNSET,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>revenue operations.</span>
            </h2>
            <p style={{fontSize:14,color:C.muted,lineHeight:1.7,maxWidth:400,marginBottom:36,opacity:inView?1:0,transition:'opacity 0.6s ease 0.3s'}}>PureFacts works with asset servicers to identify where leakage, exception risk, and reporting friction are most likely, and how to standardize revenue governance without disrupting your operations.</p>
            <div style={{opacity:inView?1:0,transition:'opacity 0.6s ease 0.4s'}}>
              <Link href="/contact" className="btn-primary">Get a free assessment</Link>
              <p style={{fontSize:12,color:C.subtle,fontWeight:500,marginTop:16}}>Trusted by the top global financial firms.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function AssetServicingClient({logos}:{logos:ClientLogo[]}){
  return (
    <>
      <style>{`
        @media (max-width: 1023px) {
          .industry-carousel-track { height: auto !important; overflow: visible !important; cursor: default !important; }
          .industry-carousel-track > div:not([data-active-card="true"]) { display: none !important; }
          .industry-carousel-track > div[data-active-card="true"] { position: relative !important; width: 100% !important; min-height: 0 !important; height: auto !important; transform: none !important; opacity: 1 !important; }
        }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; } }
      `}</style>
      <main id="main-content" style={{fontFamily:"'Carlito', 'Segoe UI', sans-serif",background:C.bg,overflow:'hidden'}}>
        <Hero /><TheProblem /><WhyAssetServicers /><WhatWeDeliver /><PlatformConnection /><ProofBand logos={logos} /><FinalCTA />
      </main>
    </>
  )
}