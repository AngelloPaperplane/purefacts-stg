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
  fees:     '#ED65D0',
  comp:     '#FF006E',
  practice: '#ffb30c',
}
const SUNSET  = 'linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%)'
const ACCENT  = '#fb5607'
const A_RGB   = '251,86,7'

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

// ─── Hero Canvas (GridColumnsCanvas) ──────────────────────────────────────────
function GridColumnsCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    let raf: number, t = 0
    type Col = { x:number;targetH:number;currentH:number;speed:number;colourType:'neutral'|'accent'|'azure';coloured:boolean;colourFlash:number;breathPhase:number;staggerDelay:number;zone:'left'|'right' }
    let W=0,H=0,cols:Col[]=[],frame=0
    const COL_W=22,COL_GAP=10,STEP=COL_W+COL_GAP
    function build(){
      cols=[]
      const splitX=W*0.44,rightCols=Math.floor((W-splitX)/STEP)+1
      for(let i=0;i<rightCols;i++){
        const x=splitX+i*STEP,ramp=i/Math.max(rightCols-1,1),base=0.12+ramp*0.72,variance=(Math.random()-0.5)*0.12,targetH=Math.max(0.08,Math.min(0.88,base+variance)),rand=Math.random(),accentBias=ramp>0.4?0.28:0.12
        let colourType:'neutral'|'accent'|'azure'='neutral'
        if(rand<accentBias*0.65)colourType='accent'; else if(rand<accentBias)colourType='azure'
        cols.push({x,targetH,currentH:0,speed:0.006+(1-targetH)*0.004,colourType,coloured:false,colourFlash:0,breathPhase:Math.random()*Math.PI*2,staggerDelay:i*4,zone:'right'})
      }
      const leftCols=Math.ceil(splitX/STEP)
      for(let i=0;i<leftCols;i++){
        const x=i*STEP,ramp=i/Math.max(leftCols-1,1),base=0.08+ramp*0.45,targetH=Math.max(0.06,Math.min(0.55,base+(Math.random()-0.5)*0.08))
        cols.push({x,targetH,currentH:0,speed:0.005,colourType:'neutral',coloured:false,colourFlash:0,breathPhase:Math.random()*Math.PI*2,staggerDelay:Math.floor(leftCols*4)+i*3,zone:'left'})
      }
    }
    function resize(){W=canvas!.width=canvas!.parentElement!.offsetWidth;H=canvas!.height=canvas!.parentElement!.offsetHeight;build()}
    resize()
    const ro=new ResizeObserver(resize);ro.observe(canvas.parentElement!)
    function draw(){
      t+=0.012;frame++
      ctx!.clearRect(0,0,W,H)
      const groundY=H*0.78,maxColH=groundY*0.88,splitX=W*0.44
      for(let row=0;row<=10;row++){const yBase=groundY+row*28;if(yBase>H+10)break;ctx!.beginPath();ctx!.moveTo(splitX,yBase);ctx!.lineTo(W+50,yBase);ctx!.strokeStyle=`rgba(59,132,255,${0.025+row*0.005})`;ctx!.lineWidth=0.5;ctx!.stroke()}
      for(let v=0;v<=12;v++){const xB=splitX+(v/12)*(W-splitX+60);ctx!.beginPath();ctx!.moveTo(xB,groundY+220);ctx!.lineTo(W*0.72,groundY-maxColH*0.1);ctx!.strokeStyle='rgba(59,132,255,0.018)';ctx!.lineWidth=0.4;ctx!.stroke()}
      cols.forEach(col=>{
        if(frame<=col.staggerDelay)return
        if(col.currentH<col.targetH)col.currentH=Math.min(col.targetH,col.currentH+col.speed)
        if(!col.coloured&&col.currentH>=col.targetH*0.85&&col.colourType!=='neutral'){col.coloured=true;col.colourFlash=1.0}
        if(col.colourFlash>0)col.colourFlash=Math.max(0,col.colourFlash-0.025)
        const breathAmt=col.currentH>=col.targetH*0.98?Math.sin(t*1.4+col.breathPhase)*0.025:0,displayH=(col.currentH+breathAmt)*maxColH,colTop=groundY-displayH
        const zoneAlpha=col.zone==='left'?0.13:1.0
        let r=244,g=244,b=244
        if(col.coloured){if(col.colourType==='accent'){r=251;g=86;b=7}if(col.colourType==='azure'){r=59;g=132;b=255}}
        const isAccent=col.coloured&&col.colourType!=='neutral',pulse=isAccent?0.6+0.4*Math.sin(t*2.2+col.breathPhase):0,flashBoost=col.colourFlash*0.6,baseAlpha=isAccent?(0.55+pulse*0.25+flashBoost)*zoneAlpha:(0.06+(col.currentH/col.targetH)*0.06)*zoneAlpha
        const grad=ctx!.createLinearGradient(col.x,colTop,col.x,groundY);grad.addColorStop(0,`rgba(${r},${g},${b},${baseAlpha})`);grad.addColorStop(0.55,`rgba(${r},${g},${b},${baseAlpha*0.45})`);grad.addColorStop(1,`rgba(${r},${g},${b},0.02)`)
        ctx!.fillStyle=grad;ctx!.fillRect(col.x-COL_W/2,colTop,COL_W,displayH)
        ctx!.beginPath();ctx!.moveTo(col.x-COL_W/2,colTop);ctx!.lineTo(col.x+COL_W/2,colTop)
        if(isAccent){ctx!.strokeStyle=`rgba(${r},${g},${b},${(0.85+pulse*0.15)*zoneAlpha})`;ctx!.lineWidth=1.5}else{ctx!.strokeStyle=`rgba(244,244,244,${0.08*zoneAlpha})`;ctx!.lineWidth=0.5}
        ctx!.stroke()
        if(isAccent&&col.zone==='right'){const glowR=COL_W*3+pulse*COL_W*1.5,glow=ctx!.createRadialGradient(col.x,colTop,0,col.x,colTop,glowR);glow.addColorStop(0,`rgba(${r},${g},${b},${0.28+pulse*0.18+flashBoost*0.3})`);glow.addColorStop(1,'rgba(0,0,0,0)');ctx!.fillStyle=glow;ctx!.beginPath();ctx!.arc(col.x,colTop,glowR,0,Math.PI*2);ctx!.fill()}
      })
      ctx!.beginPath();ctx!.moveTo(splitX,groundY);ctx!.lineTo(W+50,groundY);ctx!.strokeStyle='rgba(251,86,7,0.07)';ctx!.lineWidth=1;ctx!.stroke()
      const topFade=ctx!.createLinearGradient(0,0,0,H*0.22);topFade.addColorStop(0,'rgba(20,15,12,0.7)');topFade.addColorStop(1,'transparent');ctx!.fillStyle=topFade;ctx!.fillRect(0,0,W,H*0.22)
      const botFade=ctx!.createLinearGradient(0,H*0.7,0,H);botFade.addColorStop(0,'transparent');botFade.addColorStop(1,'rgba(20,15,12,0.95)');ctx!.fillStyle=botFade;ctx!.fillRect(0,H*0.7,W,H*0.3)
      const textVig=ctx!.createLinearGradient(0,0,splitX*1.2,0);textVig.addColorStop(0,'rgba(20,15,12,0.88)');textVig.addColorStop(0.7,'rgba(20,15,12,0.4)');textVig.addColorStop(1,'transparent');ctx!.fillStyle=textVig;ctx!.fillRect(0,0,splitX*1.2,H)
      raf=requestAnimationFrame(draw)
    }
    draw()
    return ()=>{cancelAnimationFrame(raf);ro.disconnect()}
  },[])
  return <canvas ref={ref} aria-hidden="true" style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}} />
}

// ─── 1. Hero ──────────────────────────────────────────────────────────────────
function Hero() {
  const { isMobile, isTablet } = useBreakpoint()
  const heroPad = isMobile ? '40px 20px 36px' : isTablet ? '56px 32px' : '64px 48px'
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 80) }, [])
  return (
    <section style={{ position:'relative', overflow:'hidden', background:C.bg, padding: heroPad, display: 'flex', alignItems: 'center' }}>
      <GridColumnsCanvas />
      <div style={{position:'absolute',top:'-10%',right:'5%',width:700,height:600,pointerEvents:'none',background:'radial-gradient(ellipse, rgba(251,86,7,0.06) 0%, transparent 60%)',zIndex:0}} aria-hidden="true" />
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:200,background:`linear-gradient(to bottom, transparent, ${C.bg})`,pointerEvents:'none',zIndex:2}} aria-hidden="true" />
      <div style={{maxWidth:1280,margin:'0 auto',padding:isMobile?'0 20px':isTablet?'0 32px':'0 48px',width:'100%',position:'relative',zIndex:3}}>
        <div style={{maxWidth:580,opacity:mounted?1:0,transform:mounted?'translateY(0)':'translateY(24px)',transition:'opacity 0.7s ease, transform 0.7s ease'}}>
          <div style={{marginBottom:20}}><span style={{fontSize:11,fontWeight:700,color:ACCENT,textTransform:'uppercase',letterSpacing:'0.20em'}}>Asset Management</span></div>
          <h1 style={{fontSize:'clamp(2rem, 4vw, 3.25rem)',fontWeight:700,lineHeight:1.08,letterSpacing:'-0.028em',color:C.text,maxWidth:560,marginBottom:24}}>
            Revenue integrity for{' '}<span style={{color:ACCENT}}>scaling cross-border funds and distribution.</span>
          </h1>
          <p style={{fontSize:'1.0625rem',color:C.muted,lineHeight:1.75,maxWidth:480,marginBottom:40}}>PureFacts helps global asset managers scale cross-border distribution and expand across domiciles by standardizing fee logic, governing rebates, and keeping revenue audit-ready by design.</p>
          <Link href="/contact" className="btn-primary" style={{borderColor:ACCENT}}>Get in contact</Link>
        </div>
      </div>
    </section>
  )
}

// ─── 2. Three Forces ─────────────────────────────────────────────────────────
const THREE_FORCES = [
  { number:'01', title:'Compression', desc:'Margin pressure is structural, not cyclical. Every basis point of leakage from billing errors or mis-priced mandates compounds directly into EBITDA.', href:'/industry/challenges' },
  { number:'02', title:'Collection', desc:'Rebate and trailer fee flows across distributors, entities, and domiciles create a reconciliation burden that manual processes cannot reliably contain.', href:'/industry/challenges' },
  { number:'03', title:'Complexity', desc:'Expanding distribution across domiciles multiplies fee logic variants. Without centralized governance, each new market adds fragility, not scale.', href:'/industry/challenges' },
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
              <span style={{color:C.text}}>Three forces are </span><span style={{color:ACCENT}}>squeezing</span><span style={{color:C.text}}> asset management </span><span style={{color:ACCENT}}>economics.</span>
            </h2>
            <div style={{opacity:inView?1:0,transform:inView?'translateY(0)':'translateY(12px)',transition:'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s'}}>
              <p style={{fontSize:'1rem',color:C.muted,lineHeight:1.75,margin:'0 0 16px'}}>Compression, collection complexity, and cross-border scale are rising simultaneously. The revenue infrastructure that worked at smaller scale becomes structural risk as the business grows.</p>
              <p style={{fontSize:'1rem',color:C.muted,lineHeight:1.75,margin:'0 0 36px'}}>When fee logic lives in spreadsheets and exception handling is the operating model, every new market and mandate adds fragility rather than scale.</p>
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

// ─── 3. Why Asset Managers (Carousel) ────────────────────────────────────────
const WHY_FEATURES = [
  { icon:'fa-globe', title:'Standardize Across Domiciles', body:'Apply consistent fee logic across funds, mandates, and entities so pricing is governed centrally, not interpreted locally by each market or entity.' },
  { icon:'fa-money-bill-transfer', title:'Govern Rebates and Trailer Fees', body:'Validate, approve, and control rebate and trailer fee flows across distributors and entities with built-in oversight and approval trails.' },
  { icon:'fa-bolt', title:'Automate Revenue Workflows', body:'Reduce manual tasks, recurring exceptions, and operational risk. Replace fragmented spreadsheets and reconciliations with a governed revenue operating model.' },
  { icon:'fa-shield-halved', title:'Audit-Ready by Design', body:'Build clear approval trails and data lineage into every workflow so evidence exists when you need it, not after the fact.' },
  { icon:'fa-chart-line', title:'Revenue Visibility Across the Firm', body:'Replace a fragmented view of fee calculations and billing status with a single, authoritative picture of what has been billed and where gaps remain.' },
]
const CAROUSEL_DURATION = 3400

function WhyAssetManagers() {
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
    const tick=()=>{const elapsed=Date.now()-startRef.current;const pct=Math.min(100,(elapsed/CAROUSEL_DURATION)*100);setFillPct(pct);if(elapsed>=CAROUSEL_DURATION){setActive(a=>a+1);setFillPct(0);startRef.current=Date.now()};rafRef.current=requestAnimationFrame(tick)}
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
            <h2 style={{fontSize:'clamp(2rem, 3.5vw, 3rem)',fontWeight:700,lineHeight:1.08,letterSpacing:'-0.03em',color:C.text,marginBottom:20}}>Why asset managers<br/><span style={{color:ACCENT}}>choose PureFacts.</span></h2>
            <p style={{fontSize:'0.9375rem',color:C.muted,lineHeight:1.75,maxWidth:340,marginBottom:40}}>PureFacts is purpose-built to help asset managers operate revenue with consistency across products, entities, and distribution networks. Enterprise-grade infrastructure that scales with cross-border growth.</p>
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

// ─── 4. Revenue Integrity (two-col tab+panel) ─────────────────────────────────
interface IntegrityItem { number: string; icon: string; title: string; body: string; bullets: string[]; stat: { value: string; label: string } }
const INTEGRITY_ITEMS: IntegrityItem[] = [
  { number:'01', icon:'fa-sliders', title:'Standardized Fee Logic', body:'Apply consistent fee models across funds, mandates, and domiciles with governed logic that scales as distribution expands.', bullets:['Single fee engine across all fund structures','Domicile-specific rule governance','Eliminates local spreadsheet interpretation','Version-controlled schedule management'], stat:{value:'1–5%',label:'EBITDA recovered from billing consistency'} },
  { number:'02', icon:'fa-money-bill-transfer', title:'Governed Rebate Oversight', body:'Validate and control rebate and trailer fee flows across distributors and entities. Every payment governed, traceable, and defensible.', bullets:['Rebate calculation validation at source','Approval gates before distributor payments','Full audit trail on every rebate run','Exception queue with root-cause tracing'], stat:{value:'99.9%',label:'rebate accuracy rate across distributors'} },
  { number:'03', icon:'fa-bolt', title:'Automated Billing Workflows', body:'Replace manual cycles and recurring exception handling with automated, rules-based billing that flags anomalies before they become breaks.', bullets:['Rules-based billing runs at scale','Pre-billing anomaly detection','Automated exception queue and routing','No manual intervention for standard runs'], stat:{value:'30%',label:'reduction in billing cycle time'} },
  { number:'04', icon:'fa-file-lines', title:'Built-In Audit Evidence', body:'Approval trails and data lineage exist inside the workflow by design. When transparency is demanded, the evidence is already there.', bullets:['Immutable approval history on every run','Data lineage from source to output','Regulator-ready evidence packages','No post-hoc assembly required'], stat:{value:'100%',label:'of billing runs fully auditable'} },
  { number:'05', icon:'fa-chart-bar', title:'Unified Revenue Reporting', body:'Consolidate fee calculations, rebate flows, and billing status into a single governed view of what has been earned, billed, and collected.', bullets:['Fee, rebate, and billing data unified','Board-ready dashboards on demand','Segmentation by fund, domicile, distributor','Automated delivery to finance teams'], stat:{value:'$3B+',label:'fees calculated annually on the platform'} },
  { number:'06', icon:'fa-globe', title:'Cross-Entity Control', body:'Operate consistently across legal entities, fund structures, and jurisdictions. Revenue logic that works the same way everywhere the business operates.', bullets:['M&A-ready: onboard new entities in days','Multi-domicile fee logic centralized','API-first custodian and CRM integrations','No re-architecture as the firm expands'], stat:{value:'$15T+',label:'AUA governed on the platform today'} },
]

function RevenueIntegrity() {
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '56px 0' : '90px 0'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const topCols = isTablet ? '1fr' : '1fr 1fr'
  const stackTabs = isTablet
  const { ref, inView } = useInView(0.05)
  const [active, setActive] = useState(0), [paused, setPaused] = useState(false), [fillPct, setFillPct] = useState(0)
  const startRef = useRef<number>(Date.now()), rafRef = useRef<number>(0)
  const N = INTEGRITY_ITEMS.length, DURATION = 4500
  useEffect(()=>{
    if(!inView||paused){cancelAnimationFrame(rafRef.current);return}
    startRef.current=Date.now()
    const tick=()=>{const elapsed=Date.now()-startRef.current;setFillPct(Math.min(100,(elapsed/DURATION)*100));if(elapsed>=DURATION){setActive(a=>(a+1)%N);setFillPct(0);startRef.current=Date.now()};rafRef.current=requestAnimationFrame(tick)}
    rafRef.current=requestAnimationFrame(tick);return()=>cancelAnimationFrame(rafRef.current)
  },[inView,paused,active])
  const goTo=(i:number)=>{setActive(i);setFillPct(0);startRef.current=Date.now()}
  const p=INTEGRITY_ITEMS[active]
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
            {INTEGRITY_ITEMS.map((item,i)=>{const isActive=active===i;return(
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
function diagramWedgePath(cx:number,cy:number,outerR:number,innerR:number,s:number,e:number){const o1=diagramPolarToXY(cx,cy,outerR,s),o2=diagramPolarToXY(cx,cy,outerR,e),i2=diagramPolarToXY(cx,cy,innerR,e),i1=diagramPolarToXY(cx,cy,innerR,s),lg=e-s>180?1:0;return `M${o1.x} ${o1.y} A${outerR} ${outerR} 0 ${lg} 1 ${o2.x} ${o2.y} L${i2.x} ${i2.y} A${innerR} ${innerR} 0 ${lg} 0 ${i1.x} ${i1.y}Z`}
function PureRevenueDiagram({visible}:{visible:boolean}){
  const { isMobile } = useBreakpoint()
  const VB=200,CX=100,CY=100,INNER=43,OUTER=84,WEDGE_INNER=INNER+2,LABEL_R=OUTER+18
  return (
    <div style={{position:'relative',width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{position:'absolute',width:'min(260px,70%)',aspectRatio:'1',borderRadius:'50%',pointerEvents:'none',background:`radial-gradient(circle, rgba(59,132,255,0.13) 0%, transparent 70%)`}} aria-hidden="true" />
      <div style={{position:'relative',width:isMobile?'min(194px,67vw)':'min(340px,88%)',aspectRatio:'1'}}>
        <svg viewBox={`0 0 ${VB} ${VB}`} style={{width:'100%',height:'100%',overflow:'visible'}}>
          <defs><radialGradient id="hub-grad-am2-azure" cx="40%" cy="35%" r="60%"><stop offset="0%" stopColor="rgba(59,132,255,0.20)"/><stop offset="100%" stopColor="rgba(59,132,255,0.05)"/></radialGradient></defs>
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
            One platform.<br/><span style={{color:ACCENT}}>Revenue integrity</span><span style={{color:C.text}}> across every fund and entity.</span>
          </h2>
        </motion.div>
        <div ref={row0Ref} style={{display:'grid',gridTemplateColumns:twoColGrid,marginBottom:2,overflow:'hidden',border:`1px solid ${C.border}`}}>
          <div style={{padding:isTablet?'36px 24px':'52px 48px',background:C.surface,display:'flex',flexDirection:'column',justifyContent:'center'}}>
            <motion.div initial={{opacity:0,y:16}} animate={row0V?{opacity:1,y:0}:{}} transition={{duration:0.5}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',color:C.azure,marginBottom:14}}>The Platform</div>
              <h3 style={{fontSize:'clamp(1.4rem, 2.5vw, 1.9rem)',fontWeight:700,color:C.text,lineHeight:1.2,letterSpacing:'-0.025em',margin:'0 0 16px'}}>One operating system for revenue.</h3>
              <p style={{fontSize:15,color:C.muted,lineHeight:1.7,margin:'0 0 28px',maxWidth:400}}>Fees and Billing, Compensation, and Practice Management sit on top of the Revenue Book of Record, each pulling from the same data. One consistent view across every fund and entity.</p>
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
              <p style={{fontSize:15,color:C.muted,lineHeight:1.7,margin:'0 0 28px',maxWidth:400}}>The Revenue Book of Record consolidates every client, account, contract, and pricing rule. Every billing run, rebate calculation, and distributor payment flows from one authoritative foundation, keeping revenue audit-ready at every stage.</p>
              <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:28}}>
                {['Custodians, CRM, and portfolio data connected','Fee logic and contracts centralized across entities','Audit-ready at every stage'].map((pt,i)=>(
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
            <motion.h2 initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6}} className="text-3xl lg:text-4xl xl:text-5xl font-bold leading-[1.06] mb-5" style={{color:C.text}}>Trusted by leading asset managers worldwide</motion.h2>
            <motion.p initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5,delay:0.1}} className="text-base leading-relaxed mb-10" style={{color:C.muted}}>The world&rsquo;s most demanding asset managers rely on PureFacts to govern revenue with precision across funds, domiciles, and distribution networks.</motion.p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',paddingTop:24,gap:16}}>
              {[{value:'$15T+',label:'Assets Under Administration'},{value:'$3B+',label:'Fees Calculated Annually'},{value:'>30%',label:'Reduction in Billing Cycle Time'}].map((s,i)=>(
                <motion.div key={s.label} initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5,delay:0.15+i*0.1}}>
                  <div style={{fontSize:'clamp(1.6rem, 2.5vw, 2.2rem)',fontWeight:800,color:C.mandarin,letterSpacing:'-0.04em',lineHeight:1,marginBottom:6}}>{s.value}</div>
                  <div style={{fontSize:10,color:C.subtle,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.12em',lineHeight:1.4}}>{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
          {isMobile ? (
            <MobileLogoCarousel logos={logos} />
          ) : (
            <div className="lg:w-[58%] grid grid-cols-3 gap-3 overflow-hidden"><LogoColumn logos={pad(col1)} direction="down" /><LogoColumn logos={pad(col2)} direction="up" /><LogoColumn logos={pad(col3)} direction="down" /></div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── 7. Final CTA ─────────────────────────────────────────────────────────────
const CTA_FEATURES=[
  {icon:'fa-globe', color:C.azure, title:'Standardize Across Domiciles', desc:'Apply consistent fee logic across funds, mandates, and entities so pricing is governed centrally, not interpreted locally.'},
  {icon:'fa-money-bill-transfer', color:C.mandarin, title:'Govern Rebates and Trailers', desc:'Validate and control rebate and trailer fee flows across distributors and entities with built-in oversight and approval trails.'},
  {icon:'fa-shield-halved', color:C.honey, title:'Audit-Ready by Design', desc:'Build clear approval trails and data lineage into every workflow so evidence exists when you need it, not after the fact.'},
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
              See where revenue integrity is{' '}<span style={{background:SUNSET,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>breaking down.</span>
            </h2>
            <p style={{fontSize:14,color:C.muted,lineHeight:1.7,maxWidth:400,marginBottom:36,opacity:inView?1:0,transition:'opacity 0.6s ease 0.3s'}}>PureFacts works with asset managers to identify where leakage, inefficiency, and exposure are most likely, and how to modernize revenue without disrupting the business.</p>
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

export default function AssetManagementClient({logos}:{logos:ClientLogo[]}){
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
        <Hero /><TheProblem /><WhyAssetManagers /><RevenueIntegrity /><PlatformConnection /><ProofBand logos={logos} /><FinalCTA />
      </main>
    </>
  )
}