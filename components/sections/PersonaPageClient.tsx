'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity/client'
import { type ClientLogo } from '@/components/sections/LogoCarousel'
import { motion, useInView as useFramerInView } from 'framer-motion'

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface PersonaCard {
  icon: string
  title: string
  desc: string
  bullets?: string[]
  stat?: { value: string; label: string }
}

export interface PersonaPageProps {
  persona: string
  eyebrow: string
  headline: string
  accentPhrase: string
  headlineSuffix?: string
  body: string
  accent: string
  aRgb: string
  bgTint: string
  statsBandHeadline: string
  whyHeadline: string
  whyAccentWord: string
  whySubheadline?: string
  whyParagraphs: string[]
  pressuresHeadline: string
  pressureCards: PersonaCard[]
  needsHeadline: string
  needsSubheadline?: string
  needCards: { title: string; body: string }[]
  solutionCards: PersonaCard[]
  ctaFeatures: PersonaCard[]
  ctaHeadline: string
  ctaAccentPhrase: string
  ctaBody: string
  logos?: ClientLogo[]
}

// ─── Brand tokens ──────────────────────────────────────────────────────────────
const C = {
  bg:      '#140f0c',
  surface: '#1a1410',
  azure:   '#3b84ff',
  text:    '#f4f4f4',
  muted:   'rgba(244,244,244,0.75)',
  subtle:  'rgba(244,244,244,0.45)',
  border:  'rgba(255,255,255,0.07)',
}
const SUNSET = 'linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%)'

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

// ─── Platform Diagram ─────────────────────────────────────────────────────────
const DIAGRAM_WEDGES = [
  { id:'practice', label:'Practice Management', startAngle:-60, endAngle:60,  fill:'none', stroke:'#ffb30c', faUnicode:'\uf201' },
  { id:'comp',     label:'Compensation',        startAngle:60,  endAngle:180, fill:'none', stroke:'#FF006E', faUnicode:'\uf51e' },
  { id:'fees',     label:'Fees & Billing',      startAngle:180, endAngle:300, fill:'none', stroke:'#ED65D0', faUnicode:'\uf571' },
]
function dPolarToXY(cx:number,cy:number,r:number,a:number){const rad=(a-90)*Math.PI/180;return{x:cx+r*Math.cos(rad),y:cy+r*Math.sin(rad)}}
function dWedgePath(cx:number,cy:number,oR:number,iR:number,s:number,e:number){
  const o1=dPolarToXY(cx,cy,oR,s),o2=dPolarToXY(cx,cy,oR,e),i2=dPolarToXY(cx,cy,iR,e),i1=dPolarToXY(cx,cy,iR,s),lg=e-s>180?1:0
  return `M${o1.x} ${o1.y} A${oR} ${oR} 0 ${lg} 1 ${o2.x} ${o2.y} L${i2.x} ${i2.y} A${iR} ${iR} 0 ${lg} 0 ${i1.x} ${i1.y}Z`
}
function PlatformDiagram({visible}:{visible:boolean}){
  const { isMobile } = useBreakpoint()
  const VB=200,CX=100,CY=100,INNER=43,OUTER=84,WI=INNER+2,LR=OUTER+18
  return (
    <div style={{position:'relative',width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',minHeight:isMobile?260:380,overflow:'hidden'}}>
      <div style={{position:'absolute',width:'min(260px,70%)',aspectRatio:'1',borderRadius:'50%',pointerEvents:'none',background:'radial-gradient(circle, rgba(59,132,255,0.13) 0%, transparent 70%)'}} aria-hidden="true" />
      <div style={{position:'relative',width:isMobile?'min(200px,70vw)':'min(340px,88%)',aspectRatio:'1'}}>
        <svg viewBox={`0 0 ${VB} ${VB}`} style={{width:'100%',height:'100%',overflow:'visible'}}>
          <defs><radialGradient id="hub-grad-pp" cx="40%" cy="35%" r="60%"><stop offset="0%" stopColor="rgba(59,132,255,0.20)"/><stop offset="100%" stopColor="rgba(59,132,255,0.05)"/></radialGradient></defs>
          {DIAGRAM_WEDGES.map((w,wi)=>{
            const path=dWedgePath(CX,CY,OUTER,WI,w.startAngle,w.endAngle),mid=(w.startAngle+w.endAngle)/2
            const iconPt=dPolarToXY(CX,CY,(OUTER+WI)/2,mid),labelPt=dPolarToXY(CX,CY,LR,mid)
            const textAnchor=labelPt.x<CX-5?'end':labelPt.x>CX+5?'start':'middle',words=w.label.split(' '),half=Math.ceil(words.length/2)
            return (
              <g key={w.id}>
                <path d={path} fill={w.fill} stroke={w.stroke} strokeWidth="1.5" opacity={visible?1:0} style={{transformOrigin:`${CX}px ${CY}px`,transform:visible?'scale(1)':'scale(0.88)',transition:`opacity 0.55s ease ${wi*0.18}s, transform 0.55s ease ${wi*0.18}s`}} />
                <text x={iconPt.x} y={iconPt.y} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="900" fontFamily="'Font Awesome 6 Free','Font Awesome 6 Pro','Font Awesome 5 Free'" fill={w.stroke} opacity={visible?1:0} style={{transition:`opacity 0.4s ease ${wi*0.18+0.18}s`}}>{w.faUnicode}</text>
                <text x={labelPt.x} y={labelPt.y} textAnchor={textAnchor} dominantBaseline="middle" fontSize="8.5" fontWeight="700" fill={w.stroke} style={{letterSpacing:'0.02em',opacity:visible?1:0,transition:`opacity 0.4s ease ${wi*0.18+0.30}s`}}>
                  {words.length>1?(<><tspan x={labelPt.x} dy="-0.6em">{words.slice(0,half).join(' ')}</tspan><tspan x={labelPt.x} dy="1.3em">{words.slice(half).join(' ')}</tspan></>):w.label}
                </text>
              </g>
            )
          })}
          <circle cx={CX} cy={CY} r={INNER+2} fill="#140f0c" />
          <circle cx={CX} cy={CY} r={INNER} fill="none" stroke="rgba(59,132,255,0.18)" strokeWidth="1.5" />
          <circle cx={CX} cy={CY} r={INNER} fill="none" stroke="rgba(59,132,255,0.45)" strokeWidth="1.5" />
          <text x={CX} y={CY} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="600" fill={C.text} style={{letterSpacing:'0.02em',opacity:visible?1:0,transition:'opacity 0.5s ease 0.38s'}}>
            <tspan x={CX} dy="-5">Revenue Book</tspan><tspan x={CX} dy="11">of Record</tspan>
          </text>
        </svg>
      </div>
    </div>
  )
}

// ─── Proof Band ────────────────────────────────────────────────────────────────
function LogoCard({logo,onPause,onResume}:{logo:ClientLogo;onPause:()=>void;onResume:()=>void}){
  return (
    <div className="relative flex flex-col items-center justify-center bg-[#f4f4f4] p-6 w-full aspect-square overflow-hidden rounded-[10px]" onMouseEnter={onPause} onMouseLeave={onResume}>
      <div className="relative w-full h-16"><Image src={urlFor(logo.logo).width(480).height(192).url()} alt={logo.name} fill className="object-contain" draggable={false} sizes="160px" /></div>
      {logo.caseStudyUrl?(<div className="absolute bottom-3 inset-x-0 flex justify-center">{logo.caseStudyUrl.startsWith('http')?<a href={logo.caseStudyUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 whitespace-nowrap">Case study →</a>:<Link href={logo.caseStudyUrl} className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 whitespace-nowrap">Case study →</Link>}</div>):null}
    </div>
  )
}
function LogoColumn({logos,direction,bg}:{logos:ClientLogo[];direction:'up'|'down';bg:string}){
  const innerRef=useRef<HTMLDivElement>(null),rafRef=useRef<number>(0),pausedRef=useRef(false)
  useEffect(()=>{
    const inner=innerRef.current;if(!inner)return
    const getH=()=>inner.scrollHeight/2;let offset=direction==='down'?-getH():0;inner.style.transform=`translateY(${offset}px)`
    const tick=()=>{const h=getH();if(h===0){rafRef.current=requestAnimationFrame(tick);return}if(!pausedRef.current){if(direction==='up'){offset-=0.8;if(offset<=-h)offset+=h}else{offset+=0.8;if(offset>=0)offset-=h}inner.style.transform=`translateY(${offset}px)`}rafRef.current=requestAnimationFrame(tick)}
    rafRef.current=requestAnimationFrame(tick);return()=>cancelAnimationFrame(rafRef.current)
  },[direction,logos.length])
  const items=[...logos,...logos]
  return (
    <div className="relative overflow-hidden" style={{height:520}}>
      <div ref={innerRef} className="flex flex-col gap-3 will-change-transform">{items.map((logo,i)=><LogoCard key={`${logo._id}-${i}`} logo={logo} onPause={()=>{pausedRef.current=true}} onResume={()=>{pausedRef.current=false}} />)}</div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 z-10" style={{background:`linear-gradient(to bottom, ${bg}, transparent)`}} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 z-10" style={{background:`linear-gradient(to top, ${bg}, transparent)`}} />
    </div>
  )
}
function ProofBand({logos,accent,aRgb,headline}:{logos:ClientLogo[];accent:string;aRgb:string;headline:string}){
  const { isMobile, isTablet } = useBreakpoint()
  const col1=logos.filter((_,i)=>i%3===0),col2=logos.filter((_,i)=>i%3===1),col3=logos.filter((_,i)=>i%3===2)
  const pad=(arr:ClientLogo[])=>{let out=[...arr];while(out.length<4)out=[...out,...(arr.length?arr:logos)];return out}
  return (
    <section style={{background:C.bg,position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:'20%',left:'50%',transform:'translateX(-50%)',width:800,height:500,pointerEvents:'none',background:`radial-gradient(ellipse, rgba(${aRgb},0.05) 0%, transparent 60%)`}} aria-hidden="true" />
      <div style={{maxWidth:1280,margin:'0 auto',padding:isMobile?'56px 20px':isTablet?'64px 32px':'90px 48px'}}>
        <div style={{display:isTablet?'grid':'flex',gridTemplateColumns:isTablet?'1fr':undefined,alignItems:'center',gap:isMobile?32:64}}>
          <div style={{flexShrink:0,marginBottom:0,width:isTablet?'100%':'42%'}}>
            <motion.h2 initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6}} style={{fontSize:'clamp(1.8rem,3vw,2.6rem)',fontWeight:700,lineHeight:1.12,margin:'0 0 20px',color:C.text}}>{headline}</motion.h2>
            <motion.p initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5,delay:0.1}} style={{fontSize:16,lineHeight:1.75,margin:'0 0 32px',color:C.muted}}>The world&rsquo;s most demanding financial firms rely on PureFacts to protect and grow their revenue every day.</motion.p>
            <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(3, 1fr)',paddingTop:24,gap:16}}>
              {[{value:'$15T+',label:'Assets Under Administration'},{value:'$3B+',label:'Fees Calculated Annually'},{value:'200M+',label:'Automated Actions Per Year'}].map((s,i)=>(
                <motion.div key={s.label} initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5,delay:0.15+i*0.1}}>
                  <div style={{fontSize:'clamp(1.5rem, 2.5vw, 2rem)',fontWeight:800,color:accent,letterSpacing:'-0.04em',lineHeight:1,marginBottom:6}}>{s.value}</div>
                  <div style={{fontSize:10,color:C.subtle,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.12em',lineHeight:1.4}}>{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
          {!isMobile && (
            <div style={{width:isTablet?'100%':'58%',display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,overflow:'hidden'}}>
              <LogoColumn logos={pad(col1)} direction="down" bg={C.bg} />
              <LogoColumn logos={pad(col2)} direction="up" bg={C.bg} />
              <LogoColumn logos={pad(col3)} direction="down" bg={C.bg} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Why Carousel ─────────────────────────────────────────────────────────────
const CAROUSEL_DURATION = 3400
function WhyCarousel({features,headline,subheadline,accent,aRgb}:{
  features:{icon:string;title:string;body:string}[];
  headline:string; subheadline:string; accent:string; aRgb:string
}){
  const {ref,inView}=useInView(0.05)
  const { isMobile, isTablet } = useBreakpoint()
  const [active,setActive]=useState(0)
  const [fillPct,setFillPct]=useState(0)
  const [paused,setPaused]=useState(false)
  const rafRef=useRef<number>(0),startRef=useRef<number>(Date.now())
  const dragRef=useRef({down:false,startX:0,moved:false})
  const N=features.length
  const prev=useCallback(()=>{setActive(a=>a-1);setFillPct(0);startRef.current=Date.now()},[])
  const next=useCallback(()=>{setActive(a=>a+1);setFillPct(0);startRef.current=Date.now()},[])
  useEffect(()=>{
    if(paused){cancelAnimationFrame(rafRef.current);return}
    startRef.current=Date.now()
    const tick=()=>{
      const e=Date.now()-startRef.current
      setFillPct(Math.min(100,(e/CAROUSEL_DURATION)*100))
      if(e>=CAROUSEL_DURATION){setActive(a=>a+1);setFillPct(0);startRef.current=Date.now()}
      rafRef.current=requestAnimationFrame(tick)
    }
    rafRef.current=requestAnimationFrame(tick)
    return()=>cancelAnimationFrame(rafRef.current)
  },[paused,active])
  const onDown=(e:React.PointerEvent)=>{dragRef.current={down:true,startX:e.clientX,moved:false};(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);setPaused(true)}
  const onMove=(e:React.PointerEvent)=>{if(!dragRef.current.down)return;if(Math.abs(e.clientX-dragRef.current.startX)>8)dragRef.current.moved=true}
  const onUp=(e:React.PointerEvent)=>{if(!dragRef.current.down)return;const dx=e.clientX-dragRef.current.startX;if(Math.abs(dx)>40)dx<0?next():prev();dragRef.current.down=false;setFillPct(0);startRef.current=Date.now();setPaused(false)}
  const cardWidth=340,cardGap=20,WINDOW=4
  const cardSlots=Array.from({length:WINDOW*2+1},(_,k)=>k-WINDOW)
  const activeFeature = features[((active % N) + N) % N]

  return (
    <section ref={ref as React.RefObject<HTMLElement>} style={{background:C.bg,padding:isMobile?'40px 0':'90px 0',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:'-5%',left:'20%',width:700,height:400,pointerEvents:'none',background:`radial-gradient(ellipse, rgba(${aRgb},0.06) 0%, transparent 60%)`}} aria-hidden="true" />
      <div style={{maxWidth:1280,margin:'0 auto',padding:isMobile?'0 20px':isTablet?'0 32px':'0 48px'}}>
        <div style={{display:'grid',gridTemplateColumns:isTablet?'1fr':'1.04fr 1.55fr',gap:isMobile?'24px':isTablet?'32px':'40px',alignItems:'center'}}>
          <div style={{position:isTablet?'relative':'sticky',top:isTablet?'auto':96,opacity:inView?1:0,transform:inView?'translateY(0)':'translateY(16px)',transition:'opacity 0.6s ease, transform 0.6s ease'}}>
            <h2 style={{fontSize:'clamp(2rem, 3.5vw, 3rem)',fontWeight:700,lineHeight:1.08,letterSpacing:'-0.03em',color:C.text,marginBottom:16}} dangerouslySetInnerHTML={{__html:headline}} />
            <p style={{fontSize:'0.9375rem',color:C.muted,lineHeight:1.75,maxWidth:420,marginBottom:32}}>{subheadline}</p>
            <div style={{display:'flex',gap:12}}>
              {[{label:'←',fn:prev},{label:'→',fn:next}].map(({label,fn})=>(
                <button key={label} onClick={()=>{fn();setPaused(true);setTimeout(()=>setPaused(false),4000)}}
                  style={{width:44,height:44,display:'flex',alignItems:'center',justifyContent:'center',background:'transparent',border:`1px solid ${C.border}`,color:C.muted,fontSize:16,cursor:'pointer',transition:'border-color 0.2s, color 0.2s'}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=accent;(e.currentTarget as HTMLElement).style.color=accent}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=C.border;(e.currentTarget as HTMLElement).style.color=C.muted}}
                  aria-label={label==='←'?'Previous':'Next'}
                >{label}</button>
              ))}
            </div>
          </div>
          {isTablet ? (
            // tablet: single active card, no bg/border on icon, no top accent bar
            <div style={{padding:'32px 28px 24px',background:`rgba(${aRgb},0.07)`,border:`1px solid ${accent}`,position:'relative',overflow:'hidden',boxSizing:'border-box'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'flex-start',marginBottom:20}}>
                <i className={`fa-solid ${activeFeature.icon}`} style={{color:accent,fontSize:20}} aria-hidden="true" />
              </div>
              <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:10,lineHeight:1.3}}>{activeFeature.title}</div>
              <p style={{fontSize:13,color:C.muted,lineHeight:1.7,margin:0}}>{activeFeature.body}</p>
              <div style={{position:'absolute',bottom:0,left:0,right:0,height:2,background:`rgba(${aRgb},0.12)`}} aria-hidden="true">
                <div style={{height:'100%',width:`${fillPct}%`,background:accent,transition:'none'}} />
              </div>
            </div>
          ) : (
            // desktop: full carousel, no bg/border on icons, no top accent bar, icon fontSize 20
            <div style={{overflow:'hidden',position:'relative',cursor:'grab',height:320}}
              onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
              onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>{setFillPct(0);startRef.current=Date.now();setPaused(false)}}>
              {cardSlots.map(offset=>{
                const fi=((active+offset)%N+N)%N,f=features[fi],isCenter=offset===0
                const xPos=offset*(cardWidth+cardGap)
                return (
                  <div key={`slot-${offset}`} onClick={()=>{if(!dragRef.current.moved&&!isCenter)setActive(a=>a+offset)}}
                    style={{position:'absolute',top:0,left:0,width:cardWidth,height:'100%',padding:'32px 28px 20px',
                      background:isCenter?`rgba(${aRgb},0.07)`:C.surface,border:`1px solid ${isCenter?accent:C.border}`,overflow:'hidden',
                      opacity:Math.abs(offset)<=1?(isCenter?1:0.5):0,transform:`translateX(${xPos}px)`,
                      transition:'opacity 0.35s ease, border-color 0.35s ease, background 0.35s ease, transform 0.45s cubic-bezier(0.4,0,0.2,1)',
                      cursor:isCenter?'default':'pointer',pointerEvents:Math.abs(offset)>2?'none':'auto',boxSizing:'border-box'}}>
                    {/* no top accent bar */}
                    {/* icon: no bg/border, fontSize 20 */}
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'flex-start',marginBottom:20}}>
                      <i className={`fa-solid ${f.icon}`} style={{color:accent,fontSize:20}} aria-hidden="true" />
                    </div>
                    <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:10,lineHeight:1.3}}>{f.title}</div>
                    <p style={{fontSize:13,color:C.muted,lineHeight:1.7,margin:0}}>{f.body}</p>
                    {isCenter&&(
                      <div style={{position:'absolute',bottom:0,left:0,right:0,height:2,background:`rgba(${aRgb},0.12)`}} aria-hidden="true">
                        <div style={{height:'100%',width:`${fillPct}%`,background:accent,transition:'none'}} />
                      </div>
                    )}
                  </div>
                )
              })}
              <div style={{position:'absolute',top:0,right:0,bottom:0,width:80,background:`linear-gradient(to right, transparent, ${C.bg})`,pointerEvents:'none',zIndex:10}} aria-hidden="true" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Pressures Tab+Panel section ──────────────────────────────────────────────
const PERSONA_DURATION = 4500
function PressuresSection({headline,cards,accent,aRgb}:{
  headline:string; cards:PersonaCard[]; accent:string; aRgb:string
}){
  const {ref,inView}=useInView(0.05)
  const { isMobile, isTablet } = useBreakpoint()
  const [active,setActive]=useState(0)
  const [fillPct,setFillPct]=useState(0)
  const [paused,setPaused]=useState(false)
  const startRef=useRef<number>(Date.now()),rafRef=useRef<number>(0)
  useEffect(()=>{
    if(!inView||paused){cancelAnimationFrame(rafRef.current);return}
    startRef.current=Date.now()
    const tick=()=>{
      const elapsed=Date.now()-startRef.current
      setFillPct(Math.min(100,(elapsed/PERSONA_DURATION)*100))
      if(elapsed>=PERSONA_DURATION){setActive(a=>(a+1)%cards.length);startRef.current=Date.now();setFillPct(0)}
      rafRef.current=requestAnimationFrame(tick)
    }
    rafRef.current=requestAnimationFrame(tick)
    return()=>cancelAnimationFrame(rafRef.current)
  },[inView,paused,active,cards.length])
  const goTo=(i:number)=>{setActive(i);setFillPct(0);startRef.current=Date.now()}
  const p=cards[active]
  return (
    <section ref={ref as React.RefObject<HTMLElement>} style={{background:C.bg,padding:isMobile?'40px 0':'90px 0',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:'30%',right:'-5%',width:600,height:500,pointerEvents:'none',background:`radial-gradient(ellipse, rgba(${aRgb},0.06) 0%, transparent 60%)`}} aria-hidden="true" />
      <div style={{maxWidth:1280,margin:'0 auto',padding:isMobile?'0 20px':isTablet?'0 32px':'0 48px'}}>
        <div style={{marginBottom:isMobile?28:56,opacity:inView?1:0,transform:inView?'translateY(0)':'translateY(16px)',transition:'opacity 0.6s ease, transform 0.6s ease'}}>
          <h2 style={{fontSize:'clamp(1.8rem, 3vw, 2.6rem)',fontWeight:700,lineHeight:1.15,letterSpacing:'-0.025em',maxWidth:700,color:C.text}} dangerouslySetInnerHTML={{__html:headline}} />
        </div>
        <div onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>{startRef.current=Date.now();setFillPct(0);setPaused(false)}}
          style={{display:isTablet?'grid':'flex',gridTemplateColumns:isTablet?'1fr':undefined,gap:isMobile?'16px':'32px',opacity:inView?1:0,transform:inView?'translateY(0)':'translateY(16px)',transition:'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s'}}>
          <div style={{width:isTablet?'100%':'45%',display:'flex',flexDirection:'column',gap:8}}>
            {cards.map((card,i)=>{
              const isActive=active===i
              return (
                <button key={card.title} onClick={()=>goTo(i)} onMouseEnter={()=>goTo(i)}
                  style={{position:'relative',overflow:'hidden',display:'flex',alignItems:'center',gap:16,width:'100%',padding:isMobile?'16px 18px':'18px 22px',textAlign:'left',
                    background:isActive?`rgba(${aRgb},0.18)`:'rgba(255,255,255,0.02)',border:`1px solid ${isActive?`rgba(${aRgb},0.30)`:C.border}`,cursor:'pointer',transition:'background 0.25s, border-color 0.25s'}}>
                  {isActive&&!paused&&<div style={{position:'absolute',bottom:0,left:0,height:2,width:`${fillPct}%`,background:accent,transition:'none'}} aria-hidden="true" />}
                  {/* tab icon: no bg/border */}
                  <div style={{width:40,height:40,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}} aria-hidden="true">
                    <i className={`fa-solid ${card.icon}`} style={{color:isActive?accent:'rgba(244,244,244,0.28)',fontSize:14,transition:'color 0.25s'}} />
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700,lineHeight:1.3,color:isActive?C.text:C.muted,transition:'color 0.25s',marginBottom:2}}>{card.title}</div>
                    <div style={{fontSize:10,fontWeight:600,letterSpacing:'0.12em',textTransform:'uppercase',color:isActive?accent:'rgba(244,244,244,0.28)',transition:'color 0.25s'}}>Explore</div>
                  </div>
                  <span style={{fontSize:14,marginLeft:'auto',color:isActive?accent:'rgba(244,244,244,0.15)',transform:isActive?'translateX(3px)':'none',transition:'color 0.25s, transform 0.25s'}} aria-hidden="true">→</span>
                </button>
              )
            })}
          </div>
          <div style={{width:isTablet?'100%':'55%'}}>
            <div style={{position:isTablet?'relative':'sticky',top:isTablet?'auto':96,overflow:'hidden',background:'rgba(26,20,16,0.6)',border:`1px solid rgba(255,255,255,0.09)`,boxShadow:`0 0 50px rgba(${aRgb},0.06), inset 0 1px 0 rgba(255,255,255,0.06)`}}>
              <div style={{height:1,width:'100%',background:`linear-gradient(to right, ${accent}, rgba(${aRgb},0.35), transparent)`}} aria-hidden="true" />
              <div style={{position:'absolute',top:-32,right:-32,width:176,height:176,pointerEvents:'none',background:`radial-gradient(circle, rgba(${aRgb},0.12) 0%, transparent 70%)`,filter:'blur(40px)'}} aria-hidden="true" />
              <div style={{position:'relative',padding:isMobile?'28px 24px':'36px 40px 32px'}}>
                {/* detail card: inline icon + title, no eyebrow, no bg/border on icon */}
                <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20}}>
                  <i className={`fa-solid ${p.icon}`} style={{color:accent,fontSize:17,flexShrink:0}} aria-hidden="true" />
                  <h3 style={{fontSize:'1.1875rem',fontWeight:700,color:C.text,lineHeight:1.25,letterSpacing:'-0.02em',margin:0}}>{p.title}</h3>
                </div>
                <p style={{fontSize:'0.9375rem',color:C.muted,lineHeight:1.75,marginBottom:p.bullets&&p.bullets.length>0?24:p.stat?24:0}}>{p.desc}</p>
                {p.bullets&&p.bullets.length>0&&(
                  <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:8,marginBottom:p.stat?20:0}}>
                    {p.bullets.map((b,i)=>(
                      <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',border:`1px solid rgba(${aRgb},0.14)`,background:`rgba(${aRgb},0.04)`}}>
                        <div style={{width:5,height:5,borderRadius:'50%',background:accent,flexShrink:0}} aria-hidden="true" />
                        <span style={{fontSize:12.5,color:C.muted,lineHeight:1.4,fontWeight:500}}>{b}</span>
                      </div>
                    ))}
                  </div>
                )}
                {p.stat&&(
                  <div style={{paddingTop:16,borderTop:`1px solid rgba(255,255,255,0.07)`,display:'flex',alignItems:'baseline',gap:8}}>
                    <span style={{fontSize:'1.75rem',fontWeight:800,color:accent,letterSpacing:'-0.04em',lineHeight:1}}>{p.stat.value}</span>
                    <span style={{fontSize:12,color:C.muted}}>{p.stat.label}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Needs Section ────────────────────────────────────────────────────────────
function NeedsSection({headline,subheadline,cards,accent,aRgb}:{
  headline:string; subheadline:string; cards:{title:string;body:string}[]; accent:string; aRgb:string
}){
  const {ref,inView}=useInView(0.05)
  const { isMobile, isTablet } = useBreakpoint()
  return (
    <section ref={ref as React.RefObject<HTMLElement>} style={{background:C.bg,padding:isMobile?'40px 0':'90px 0',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:'-5%',left:'20%',width:700,height:400,pointerEvents:'none',background:`radial-gradient(ellipse, rgba(${aRgb},0.05) 0%, transparent 60%)`}} aria-hidden="true" />
      <div style={{maxWidth:1280,margin:'0 auto',padding:isMobile?'0 20px':isTablet?'0 32px':'0 48px'}}>
        <div style={{display:'grid',gridTemplateColumns:isTablet?'1fr':'1fr 1fr',gap:isMobile?'24px':isTablet?'32px':'72px',alignItems:'start'}}>
          <div style={{opacity:inView?1:0,transform:inView?'translateY(0)':'translateY(16px)',transition:'opacity 0.6s ease, transform 0.6s ease'}}>
            <h2 style={{fontSize:'clamp(1.8rem, 3vw, 2.6rem)',fontWeight:700,lineHeight:1.12,letterSpacing:'-0.025em',color:C.text,margin:'0 0 20px'}} dangerouslySetInnerHTML={{__html:headline}} />
            <p style={{fontSize:'1rem',color:C.muted,lineHeight:1.75,margin:0}}>{subheadline}</p>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:0}}>
            {cards.map((card,i)=>(
              <div key={card.title} style={{
                opacity:inView?1:0,transform:inView?'translateX(0)':'translateX(16px)',
                transition:`opacity 0.5s ease ${i*0.1}s, transform 0.5s ease ${i*0.1}s`,
                paddingTop:i===0?0:'28px',paddingBottom:'28px',
              }}>
                <div style={{display:'grid',gridTemplateColumns:'40px 1fr',gap:'14px',alignItems:'start'}}>
                  <div style={{fontSize:'1.75rem',fontWeight:800,color:`rgba(${aRgb},0.32)`,letterSpacing:'-0.05em',lineHeight:1,paddingTop:3}}>
                    {String(i+1).padStart(2,'0')}
                  </div>
                  <div>
                    <div style={{fontSize:'1rem',fontWeight:700,color:C.text,letterSpacing:'-0.01em',marginBottom:8,lineHeight:1.3}}>{card.title}</div>
                    <p style={{fontSize:13.5,color:C.muted,lineHeight:1.7,margin:0}}>{card.body}</p>
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

// ─── How PureFacts Helps ──────────────────────────────────────────────────────
function HowPurefactsHelps({headline,accent,aRgb,solutionCards}:{
  headline:string; accent:string; aRgb:string; solutionCards:PersonaCard[]
}){
  const {ref,inView}=useInView(0.05)
  const { isMobile, isTablet } = useBreakpoint()
  const diagramRef=useRef<HTMLDivElement>(null)
  const diagramV=useFramerInView(diagramRef,{once:true,margin:'-80px 0px -80px 0px'})
  return (
    <section ref={ref as React.RefObject<HTMLElement>} style={{background:C.bg,padding:isMobile?'40px 0':'90px 0',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:'-5%',left:'-8%',width:600,height:500,pointerEvents:'none',background:`radial-gradient(ellipse, rgba(${aRgb},0.06) 0%, transparent 55%)`}} aria-hidden="true" />
      <div style={{maxWidth:1280,margin:'0 auto',padding:isMobile?'0 20px':isTablet?'0 32px':'0 48px'}}>
        <div ref={diagramRef} style={{display:'grid',gridTemplateColumns:isTablet?'1fr':'1fr 1fr',gap:isMobile?'24px':isTablet?'32px':'80px',alignItems:'center'}}>
          <div style={{opacity:inView?1:0,transform:inView?'translateY(0)':'translateY(16px)',transition:'opacity 0.6s ease, transform 0.6s ease'}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',color:accent,marginBottom:14}}>How PureFacts helps</div>
            <h3 style={{fontSize:'clamp(1.8rem, 3vw, 2.6rem)',fontWeight:700,color:C.text,lineHeight:1.12,letterSpacing:'-0.025em',margin:'0 0 20px'}} dangerouslySetInnerHTML={{__html:headline}} />
            <p style={{fontSize:'1rem',color:C.muted,lineHeight:1.75,margin:'0 0 36px',maxWidth:480}}>
              Fees and Billing, Compensation, and Practice Management sit on top of the Revenue Book of Record, each pulling from the same data. No reconciliation gaps. One consistent view of revenue performance across the full firm.
            </p>
            <Link href="/platform/" className="btn-primary" style={{display:'inline-flex',maxWidth:200,borderColor:accent}}>Explore the Platform</Link>
          </div>
          <div style={{minHeight:isMobile?260:420,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <PlatformDiagram visible={diagramV} />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Hero canvases ─────────────────────────────────────────────────────────────
function AdvisorNetworkCanvas({aRgb}:{aRgb:string}) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current as HTMLCanvasElement; if (!cv) return
    const ctx = cv.getContext('2d') as CanvasRenderingContext2D; if (!ctx) return
    let raf: number
    const AR=255,AG=179,AB=12
    function resize() { if (!cv) return; cv.width  = cv.parentElement!.offsetWidth; cv.height = cv.parentElement!.offsetHeight }
    resize()
    const ro = new ResizeObserver(resize); ro.observe(cv.parentElement!)
    type Node = {x:number;y:number;vx:number;vy:number;r:number;ph:number;tier:0|1|2}
    const nodes: Node[] = []
    function rn(lo:number,hi:number){return lo+Math.random()*(hi-lo)}
    function build() {
      if (!cv) return;
      nodes.length = 0
      const W=cv.width,H=cv.height
      ;([[W*0.18,H*0.38],[W*0.46,H*0.56],[W*0.68,H*0.26],[W*0.86,H*0.64]] as [number,number][])
        .forEach(([x,y]) => nodes.push({x,y,vx:(Math.random()-0.5)*0.16,vy:(Math.random()-0.5)*0.16,r:13,ph:Math.random()*Math.PI*2,tier:0}))
      for(let i=0;i<16;i++) nodes.push({x:rn(W*0.04,W*0.96),y:rn(H*0.06,H*0.94),vx:(Math.random()-0.5)*0.22,vy:(Math.random()-0.5)*0.22,r:6.5,ph:Math.random()*Math.PI*2,tier:1})
      for(let i=0;i<30;i++) nodes.push({x:rn(W*0.02,W*0.98),y:rn(H*0.02,H*0.98),vx:(Math.random()-0.5)*0.28,vy:(Math.random()-0.5)*0.28,r:3.0,ph:Math.random()*Math.PI*2,tier:2})
    }
    build()
    let t=0
    function draw() {
      const W=cv.width,H=cv.height
      if(W===0||H===0){raf=requestAnimationFrame(draw);return}
      t+=0.007
      ctx.clearRect(0,0,W,H)
      const TEXT_END=W*0.50
      nodes.forEach(n=>{ n.x+=n.vx;n.y+=n.vy; if(n.x<5||n.x>W-5)n.vx*=-1; if(n.y<5||n.y>H-5)n.vy*=-1 })
      for(let a=0;a<nodes.length;a++) for(let b=a+1;b<nodes.length;b++) {
        const na=nodes[a],nb=nodes[b]
        const dx=na.x-nb.x,dy=na.y-nb.y,dist=Math.sqrt(dx*dx+dy*dy)
        const thr=na.tier===0&&nb.tier===1?140:na.tier===0&&nb.tier===0?260:na.tier===1&&nb.tier===2?90:na.tier===1&&nb.tier===1?110:0
        if(thr>0&&dist<thr){
          const fade=(1-dist/thr)*0.18
          const mx=(na.x+nb.x)/2
          const ef=mx<TEXT_END?Math.max(0,mx/TEXT_END)*0.6:1.0
          ctx.beginPath();ctx.moveTo(na.x,na.y);ctx.lineTo(nb.x,nb.y)
          ctx.strokeStyle=`rgba(${AR},${AG},${AB},${fade*ef})`
          ctx.lineWidth=na.tier===0&&nb.tier===0?1.0:0.6;ctx.stroke()
        }
      }
      nodes.forEach(n=>{
        const xAlpha=n.x<TEXT_END?Math.max(0,n.x/TEXT_END)*(0.10+0.55*(n.x/TEXT_END)):1.0
        if(xAlpha<0.03)return
        const pulse=0.5+0.5*Math.sin(t*1.4+n.ph)
        const cols:[[number,number,number],[number,number,number],[number,number,number]]=[[AR,AG,AB],[255,200,70],[180,130,30]]
        const c=cols[n.tier]
        const ba=(n.tier===0?0.75:n.tier===1?0.42:0.20)*xAlpha
        if(n.tier===0){
          const gR=n.r*5+pulse*n.r*1.5
          const glo=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,gR)
          glo.addColorStop(0,`rgba(${c[0]},${c[1]},${c[2]},${0.22*xAlpha})`);glo.addColorStop(1,'rgba(0,0,0,0)')
          ctx.beginPath();ctx.arc(n.x,n.y,gR,0,Math.PI*2);ctx.fillStyle=glo;ctx.fill()
        }
        ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2)
        ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${ba})`;ctx.fill()
        ctx.strokeStyle=`rgba(${c[0]},${c[1]},${c[2]},${ba+0.14})`;ctx.lineWidth=n.tier===0?1.4:0.7;ctx.stroke()
      })
      const lv=ctx.createLinearGradient(0,0,W*0.55,0)
      lv.addColorStop(0,'rgba(13,9,8,0.88)');lv.addColorStop(0.38,'rgba(13,9,8,0.60)');lv.addColorStop(0.55,'rgba(13,9,8,0.18)');lv.addColorStop(1,'transparent')
      ctx.fillStyle=lv;ctx.fillRect(0,0,W*0.55,H)
      const tf=ctx.createLinearGradient(0,0,0,H*0.14);tf.addColorStop(0,'rgba(13,9,8,0.70)');tf.addColorStop(1,'transparent');ctx.fillStyle=tf;ctx.fillRect(0,0,W,H*0.14)
      const bf=ctx.createLinearGradient(0,H*0.80,0,H);bf.addColorStop(0,'transparent');bf.addColorStop(1,'rgba(13,9,8,0.92)');ctx.fillStyle=bf;ctx.fillRect(0,H*0.80,W,H*0.20)
      raf=requestAnimationFrame(draw)
    }
    draw()
    return()=>{cancelAnimationFrame(raf);ro.disconnect()}
  },[])
  return <canvas ref={ref} aria-hidden="true" style={{position:'absolute',inset:0,width:'100%',height:'100%',display:'block',pointerEvents:'none'}} />
}

function DataMatrixCanvas({aRgb}:{aRgb:string}) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current as HTMLCanvasElement; if (!cv) return
    const ctx = cv.getContext('2d') as CanvasRenderingContext2D; if (!ctx) return
    let raf: number
    const [AR,AG,AB] = aRgb.split(',').map(Number)
    const COL_SPACING=22, ROW_SPACING=20
    type Cell={x:number;y:number;val:number;nextVal:number;timer:number;interval:number;baseAlpha:number;highlight:boolean;phase:number;inTextZone:boolean}
    let cells:Cell[]=[]
    function build(){
      cells=[]
      const W=cv.width,H=cv.height
      const cols=Math.ceil(W/COL_SPACING)+2,rows=Math.ceil(H/ROW_SPACING)+2
      for(let c=0;c<cols;c++) for(let r=0;r<rows;r++){
        const x=c*COL_SPACING+4,y=r*ROW_SPACING
        const inTZ=x/W<0.50
        cells.push({x,y,val:Math.floor(Math.random()*10),nextVal:Math.floor(Math.random()*10),
          timer:Math.random()*80,interval:15+Math.floor(Math.random()*90),
          baseAlpha:inTZ?0.02+Math.random()*0.04:0.04+Math.random()*0.16,
          highlight:inTZ?false:Math.random()<0.055,phase:Math.random()*Math.PI*2,inTextZone:inTZ})
      }
    }
    function resize(){ cv.width=cv.parentElement!.offsetWidth; cv.height=cv.parentElement!.offsetHeight; build() }
    resize()
    const ro=new ResizeObserver(resize);ro.observe(cv.parentElement!)
    let t=0
    function draw(){
      const W=cv.width,H=cv.height
      if(W===0||H===0){raf=requestAnimationFrame(draw);return}
      ctx.clearRect(0,0,W,H);t+=0.010
      ctx.font='bold 11px monospace'
      cells.forEach(cell=>{
        cell.timer--
        if(cell.timer<=0){cell.val=cell.nextVal;cell.nextVal=Math.floor(Math.random()*10);cell.timer=cell.interval;if(!cell.inTextZone&&Math.random()<0.06)cell.highlight=!cell.highlight}
        const yFade=cell.y<H*0.10?cell.y/(H*0.10):cell.y>H*0.90?(H-cell.y)/(H*0.10):1.0
        if(yFade<0.02)return
        const pulse=cell.highlight?(0.5+0.5*Math.sin(t*2.2+cell.phase)):0
        const alpha=(cell.highlight?(0.55+pulse*0.30):cell.baseAlpha)*yFade
        ctx.fillStyle=`rgba(${AR},${AG},${AB},${alpha})`
        ctx.fillText(String(cell.val),cell.x,cell.y+ROW_SPACING*0.78)
        if(cell.highlight&&pulse>0.4){
          const glo=ctx.createRadialGradient(cell.x+5,cell.y+8,0,cell.x+5,cell.y+8,14)
          glo.addColorStop(0,`rgba(${AR},${AG},${AB},${0.12*pulse*yFade})`);glo.addColorStop(1,'rgba(0,0,0,0)')
          ctx.fillStyle=glo;ctx.beginPath();ctx.arc(cell.x+5,cell.y+8,14,0,Math.PI*2);ctx.fill()
          ctx.font='bold 11px monospace'
        }
      })
      const lv=ctx.createLinearGradient(0,0,W*0.58,0)
      lv.addColorStop(0,'rgba(19,15,12,0.92)');lv.addColorStop(0.34,'rgba(19,15,12,0.72)');lv.addColorStop(0.52,'rgba(19,15,12,0.32)');lv.addColorStop(1,'transparent')
      ctx.fillStyle=lv;ctx.fillRect(0,0,W*0.58,H)
      const tf=ctx.createLinearGradient(0,0,0,H*0.13);tf.addColorStop(0,'rgba(19,15,12,0.75)');tf.addColorStop(1,'transparent');ctx.fillStyle=tf;ctx.fillRect(0,0,W,H*0.13)
      const bf=ctx.createLinearGradient(0,H*0.80,0,H);bf.addColorStop(0,'transparent');bf.addColorStop(1,'rgba(19,15,12,0.95)');ctx.fillStyle=bf;ctx.fillRect(0,H*0.80,W,H*0.20)
      raf=requestAnimationFrame(draw)
    }
    draw()
    return()=>{cancelAnimationFrame(raf);ro.disconnect()}
  },[aRgb])
  return <canvas ref={ref} aria-hidden="true" style={{position:'absolute',inset:0,width:'100%',height:'100%',display:'block',pointerEvents:'none'}} />
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

// ─── Hero ──────────────────────────────────────────────────────────────────────
const HERO_BG: Record<string,string> = {
  'head-of-wealth': '#0d0908',
  'operations':     '#130f0c',
  'finance':        '#0c0f14',
}

function Hero({persona,eyebrow,headline,accentPhrase,headlineSuffix,body,accent,aRgb}:{
  persona:string;eyebrow:string;headline:string;accentPhrase:string;headlineSuffix?:string;body:string;accent:string;aRgb:string
}){
  const [mounted,setMounted]=useState(false)
  const { isMobile, isTablet } = useBreakpoint()
  useEffect(()=>{setTimeout(()=>setMounted(true),80)},[])
  const bg = HERO_BG[persona] ?? C.bg
  return (
    <section style={{position:'relative',overflow:'hidden',background:bg,padding:isMobile?'48px 0':isTablet?'72px 0':'90px 0 72px',display:'flex',alignItems:'center'}}>
      {persona==='head-of-wealth' && <AdvisorNetworkCanvas aRgb={aRgb} />}
      {persona==='operations'     && <DataMatrixCanvas     aRgb={aRgb} />}
      {persona==='finance'        && <RevenueLedgerCanvas  aRgb={aRgb} />}
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:160,background:`linear-gradient(to bottom, transparent, ${bg})`,pointerEvents:'none',zIndex:2}} aria-hidden="true" />
      <div style={{maxWidth:1280,margin:'0 auto',padding:isMobile?'0 20px':isTablet?'0 32px':'0 48px',width:'100%',position:'relative',zIndex:3}}>
        <div style={{maxWidth:640,opacity:mounted?1:0,transform:mounted?'translateY(0)':'translateY(24px)',transition:'opacity 0.7s ease, transform 0.7s ease'}}>
          <div style={{marginBottom:20}}>
            <span style={{fontSize:11,fontWeight:700,color:accent,textTransform:'uppercase',letterSpacing:'0.20em'}}>{eyebrow}</span>
          </div>
          <h1 style={{fontSize:'clamp(2rem, 4vw, 3.25rem)',fontWeight:700,lineHeight:1.08,letterSpacing:'-0.028em',color:C.text,maxWidth:640,marginBottom:24}}>
            {headline}{' '}<span style={{color:accent}}>{accentPhrase}</span>{' '}{headlineSuffix}
          </h1>
          <p style={{fontSize:'1.0625rem',color:C.muted,lineHeight:1.75,maxWidth:520,marginBottom:40}}>{body}</p>
          <Link href="/contact" className="btn-primary" style={{borderColor:accent}}>Get in contact</Link>
        </div>
      </div>
    </section>
  )
}

// ─── CTA ───────────────────────────────────────────────────────────────────────
function CTASection({ctaFeatures,ctaHeadline,ctaAccentPhrase,ctaBody,accent,aRgb}:{
  ctaFeatures:PersonaCard[];ctaHeadline:string;ctaAccentPhrase:string;ctaBody:string;accent:string;aRgb:string
}){
  const {ref,inView}=useInView()
  const { isMobile, isTablet } = useBreakpoint()
  return (
    <section ref={ref as React.RefObject<HTMLElement>} style={{background:C.bg,padding:isMobile?'40px 0':'90px 0',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:'0%',left:'50%',transform:'translateX(-50%)',width:800,height:500,pointerEvents:'none',background:`radial-gradient(ellipse, rgba(${aRgb},0.07) 0%, transparent 60%)`}} aria-hidden="true" />
      <div style={{maxWidth:1280,margin:'0 auto',padding:isMobile?'0 20px':isTablet?'0 32px':'0 48px'}}>
        <div style={{display:isTablet?'grid':'flex',gridTemplateColumns:isTablet?'1fr':undefined,alignItems:'center',gap:isMobile?'32px':'80px'}}>
          <div style={{flex:1,display:'flex',flexDirection:'column',gap:32}}>
            {ctaFeatures.map((f,i)=>(
              <div key={f.title} style={{display:'flex',alignItems:'flex-start',gap:20,opacity:inView?1:0,transform:inView?'translateX(0)':'translateX(-12px)',transition:`opacity 0.5s ease ${0.3+i*0.1}s, transform 0.5s ease ${0.3+i*0.1}s`}}>
                {/* icon: no background, flex-start */}
                <div style={{width:48,height:48,flexShrink:0,display:'flex',alignItems:'flex-start',justifyContent:'flex-start'}}>
                  <i className={`fa-solid ${f.icon}`} style={{color:accent,fontSize:17}} aria-hidden="true" />
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
              {ctaHeadline}{' '}<span style={{background:SUNSET,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>{ctaAccentPhrase}</span>
            </h2>
            <p style={{fontSize:14,color:C.muted,lineHeight:1.7,maxWidth:400,marginBottom:36,opacity:inView?1:0,transition:'opacity 0.6s ease 0.3s'}}>{ctaBody}</p>
            <div style={{opacity:inView?1:0,transition:'opacity 0.6s ease 0.4s'}}>
              <Link href="/contact" className="btn-primary" style={{borderColor:accent}}>Get in contact</Link>
              <p style={{fontSize:12,color:C.subtle,fontWeight:500,marginTop:16}}>Trusted by the top global financial firms.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Client ───────────────────────────────────────────────────────────────
export default function PersonaPageClient(props: PersonaPageProps & { logos?: ClientLogo[] }) {
  const {
    persona,
    eyebrow, headline, accentPhrase, headlineSuffix, body, accent, aRgb,
    statsBandHeadline,
    whyHeadline, whySubheadline, whyParagraphs,
    pressuresHeadline, pressureCards,
    needsHeadline, needsSubheadline, needCards,
    solutionCards,
    ctaFeatures, ctaHeadline, ctaAccentPhrase, ctaBody,
    logos = [],
  } = props

  const whyFeatures = solutionCards.map((card, i) => ({
    icon: card.icon,
    title: card.title,
    body: whyParagraphs[i] ?? card.desc,
  }))

  const whyHeadlineHtml = (() => {
    if (persona === 'finance') {
      return 'Why this matters to finance'
    }
    if (persona === 'head-of-wealth') {
      return 'Why this matters to the <span style="color:#ffb30c">Head of Wealth</span>'
    }
    if (persona === 'operations') {
      return 'Why this matters to operations'
    }
    return whyHeadline.includes(props.whyAccentWord)
      ? whyHeadline.replace(props.whyAccentWord, `<span style="color:${accent}">${props.whyAccentWord}</span>`)
      : `${whyHeadline} <span style="color:${accent}">${props.whyAccentWord}.</span>`
  })()

  const pressuresHtml = (() => {
    if (persona === 'finance') {
      return 'The pressures finance teams are up against'
    }
    if (persona === 'head-of-wealth') {
      return 'The pressures wealth leaders are navigating'
    }
    if (persona === 'operations') {
      return 'The <span style="color:#fb5607">operating challenges</span> behind revenue performance'
    }
    return pressuresHeadline
  })()

  const needsHtml = (() => {
    if (persona === 'finance') {
      return 'What finance needs from a <span style="color:#3b84ff">better revenue model</span>'
    }
    if (persona === 'head-of-wealth') {
      return 'What heads of wealth need from a <span style="color:#ffb30c">better revenue model</span>'
    }
    if (persona === 'operations') {
      return 'What operators need from a better revenue model'
    }
    return needsHeadline
  })()

  const howHtml = `One platform.<br/><span style="color:${accent}">Built for your revenue challenges.</span>`

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
      <main id="main-content" style={{fontFamily:"'Carlito', 'Segoe UI', sans-serif",background:C.bg,overflow:'hidden'}}>
        <Hero persona={persona} eyebrow={eyebrow} headline={headline} accentPhrase={accentPhrase} headlineSuffix={headlineSuffix} body={body} accent={accent} aRgb={aRgb} />
        {logos.length > 0 && <ProofBand logos={logos} accent={accent} aRgb={aRgb} headline={statsBandHeadline} />}
        <WhyCarousel features={whyFeatures} headline={whyHeadlineHtml} subheadline={whySubheadline ?? ''} accent={accent} aRgb={aRgb} />
        <PressuresSection headline={pressuresHtml} cards={pressureCards} accent={accent} aRgb={aRgb} />
        <NeedsSection headline={needsHtml} subheadline={needsSubheadline ?? 'The right revenue operating model creates the conditions for these outcomes, not just better tools running the same broken process.'} cards={needCards} accent={accent} aRgb={aRgb} />
        <HowPurefactsHelps headline={howHtml} accent={accent} aRgb={aRgb} solutionCards={solutionCards} />
        <CTASection ctaFeatures={ctaFeatures} ctaHeadline={ctaHeadline} ctaAccentPhrase={ctaAccentPhrase} ctaBody={ctaBody} accent={accent} aRgb={aRgb} />
      </main>
    </>
  )
}