'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import GlobeCanvas from '@/components/sections/GlobeCanvas'

// ── Inline crossfade carousel — plain img tags, no Next.js Image ──────────────
function CrossfadeCarousel({ images }: { images: { url: string; alt: string }[] }) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  useEffect(() => {
    if (images.length <= 1) return
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % images.length), 3500)
    return () => clearInterval(timerRef.current)
  }, [images.length])
  if (!images.length) return null
  return (
    <div style={{ position: 'relative', width: 280, height: 280, flexShrink: 0, background: '#f4f4f4', padding: 20, borderRadius: 20 }}>
      {images.map((img, i) => (
        <img
          key={i}
          src={img.url}
          alt={img.alt}
          style={{
            position: 'absolute', inset: 20,
            width: 'calc(100% - 40px)', height: 'calc(100% - 40px)',
            objectFit: 'contain',
            opacity: i === current ? 1 : 0,
            transition: 'opacity 0.8s ease',
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  )
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

function PageGlows() {
  return (
    <div aria-hidden="true" style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'5%',  left:'-5%',  width:700, height:550, background:'radial-gradient(ellipse, rgba(59,132,255,0.07) 0%, transparent 65%)',  animation:'gd1 18s ease-in-out infinite' }} />
      <div style={{ position:'absolute', top:'28%', right:'-6%', width:600, height:500, background:'radial-gradient(ellipse, rgba(251,86,7,0.06) 0%, transparent 65%)',    animation:'gd2 23s ease-in-out infinite' }} />
      <div style={{ position:'absolute', top:'55%', left:'8%',   width:580, height:460, background:'radial-gradient(ellipse, rgba(255,179,12,0.06) 0%, transparent 65%)',  animation:'gd3 28s ease-in-out infinite' }} />
      <div style={{ position:'absolute', top:'78%', right:'8%',  width:520, height:440, background:'radial-gradient(ellipse, rgba(71,96,255,0.06) 0%, transparent 65%)',   animation:'gd4 21s ease-in-out infinite' }} />
      <style>{`
        @keyframes gd1{0%,100%{transform:translate(0,0)}33%{transform:translate(40px,35px)}66%{transform:translate(-25px,55px)}}
        @keyframes gd2{0%,100%{transform:translate(0,0)}33%{transform:translate(-50px,40px)}66%{transform:translate(25px,-35px)}}
        @keyframes gd3{0%,100%{transform:translate(0,0)}33%{transform:translate(35px,-40px)}66%{transform:translate(-40px,25px)}}
        @keyframes gd4{0%,100%{transform:translate(0,0)}33%{transform:translate(-30px,-50px)}66%{transform:translate(50px,30px)}}
      `}</style>
    </div>
  )
}

// ── Timeline canvas ───────────────────────────────────────────────────────────
const MILESTONES = [
  { year:'2000', label:'Founded',          color:'#3b84ff', glow:'rgba(59,132,255,0.35)',  t:0.02 },
  { year:'2008', label:'$1T AUM',           color:'#3b84ff', glow:'rgba(59,132,255,0.30)',  t:0.22 },
  { year:'2012', label:'Global Expansion', color:'#fb5607', glow:'rgba(251,86,7,0.30)',    t:0.38 },
  { year:'2016', label:'$5T AUM',           color:'#fb5607', glow:'rgba(251,86,7,0.30)',    t:0.54 },
  { year:'2020', label:'4 Offices',        color:'#ffb30c', glow:'rgba(255,179,12,0.35)',  t:0.70 },
  { year:'2025', label:'$15T AUM',          color:'#ffb30c', glow:'rgba(255,179,12,0.40)',  t:0.87 },
  { year:'Now',  label:'Category Leader',  color:'#0DCCFF', glow:'rgba(13,204,255,0.45)',  t:0.97, live:true },
]

function TimelineCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef(0)
  const tRef      = useRef(0)
  const phaseRef  = useRef<'draw'|'pulse'>('draw')
  const pulseT    = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    let w = 0, h = 0

    function resize() {
      const p = canvas!.parentElement; if (!p) return
      w = p.offsetWidth; h = p.offsetHeight
      if (w <= 0 || h <= 0) return
      canvas!.width  = w * devicePixelRatio
      canvas!.height = h * devicePixelRatio
      ctx!.setTransform(1,0,0,1,0,0); ctx!.scale(devicePixelRatio, devicePixelRatio)
    }

    function tlX(t: number) { return w * 0.04 + (w * 0.93) * t }
    function tlY() { return h * 0.62 }
    function curveY(t: number) { return tlY() - h * 0.48 * Math.pow(t, 1.6) }

    function draw() {
      if (w <= 0 || h <= 0) return
      ctx!.clearRect(0, 0, w, h)
      const prog = tRef.current
      if (prog > 0.01) {
        ctx!.beginPath(); ctx!.moveTo(tlX(0), tlY())
        for (let i = 0; i <= 80; i++) { const t=(i/80)*prog; ctx!.lineTo(tlX(t), curveY(t)) }
        ctx!.lineTo(tlX(prog), tlY()); ctx!.closePath()
        const ag = ctx!.createLinearGradient(tlX(0), 0, tlX(prog), 0)
        ag.addColorStop(0,'rgba(59,132,255,0.04)'); ag.addColorStop(0.5,'rgba(251,86,7,0.05)'); ag.addColorStop(1,'rgba(13,204,255,0.07)')
        ctx!.fillStyle = ag; ctx!.fill()
      }
      if (prog > 0) {
        ctx!.beginPath(); ctx!.moveTo(tlX(0), tlY())
        for (let i = 0; i <= 80; i++) { const t=(i/80)*prog; ctx!.lineTo(tlX(t), curveY(t)) }
        const lg = ctx!.createLinearGradient(tlX(0), 0, tlX(prog), 0)
        lg.addColorStop(0,'rgba(59,132,255,0.5)'); lg.addColorStop(0.45,'rgba(251,86,7,0.6)'); lg.addColorStop(0.75,'rgba(255,179,12,0.7)'); lg.addColorStop(1,'rgba(13,204,255,0.85)')
        ctx!.strokeStyle = lg; ctx!.lineWidth = 1.5; ctx!.stroke()
      }
      for (let i = 0; i <= 6; i++) {
        const x = tlX(i/6); ctx!.beginPath(); ctx!.moveTo(x, tlY()+18); ctx!.lineTo(x, tlY()-h*0.55)
        ctx!.strokeStyle='rgba(244,244,244,0.03)'; ctx!.lineWidth=1; ctx!.setLineDash([4,6]); ctx!.stroke(); ctx!.setLineDash([])
      }
      for (const ms of MILESTONES) {
        if (ms.t > prog) continue
        const mx=tlX(ms.t), my=curveY(ms.t), age=Math.min(1,(prog-ms.t)/0.08), pT=pulseT.current
        const glowR = (ms as any).live ? (28+Math.sin(pT*3)*6) : 22
        const grd = ctx!.createRadialGradient(mx,my,0,mx,my,glowR)
        const gc = ms.glow.replace('rgba(','').replace(')','').split(',')
        grd.addColorStop(0,`rgba(${gc[0]},${gc[1]},${gc[2]},${0.5*age})`); grd.addColorStop(1,'transparent')
        ctx!.beginPath(); ctx!.arc(mx,my,glowR,0,Math.PI*2); ctx!.fillStyle=grd; ctx!.fill()
        const dotR = (ms as any).live ? (4+Math.sin(pT*3)*1.5) : 4
        ctx!.beginPath(); ctx!.arc(mx,my,dotR,0,Math.PI*2); ctx!.fillStyle=ms.color; ctx!.globalAlpha=age; ctx!.fill(); ctx!.globalAlpha=1
        const labelY = tlY()+28
        ctx!.beginPath(); ctx!.moveTo(mx,my+dotR+2); ctx!.lineTo(mx,labelY-4)
        ctx!.strokeStyle=ms.color; ctx!.globalAlpha=0.25*age; ctx!.lineWidth=1; ctx!.stroke(); ctx!.globalAlpha=1
        ctx!.font='600 10px Carlito,sans-serif'; ctx!.fillStyle=ms.color; ctx!.globalAlpha=age*0.85; ctx!.textAlign='center'
        ctx!.fillText(ms.year, mx, labelY+10)
        const floatOff = (ms as any).live ? Math.sin(pT*1.5)*2 : 0
        ctx!.font='500 10px Carlito,sans-serif'; ctx!.fillStyle=C.text; ctx!.globalAlpha=age*0.6
        ctx!.fillText(ms.label, mx, my-dotR-8+floatOff)
        ctx!.globalAlpha=1; ctx!.textAlign='left'
      }
      if (prog < 0.995 && prog > 0) {
        const ex=tlX(prog), ey=curveY(prog)
        const ldg=ctx!.createRadialGradient(ex,ey,0,ex,ey,12)
        ldg.addColorStop(0,'rgba(13,204,255,0.6)'); ldg.addColorStop(1,'transparent')
        ctx!.beginPath(); ctx!.arc(ex,ey,12,0,Math.PI*2); ctx!.fillStyle=ldg; ctx!.fill()
        ctx!.beginPath(); ctx!.arc(ex,ey,2.5,0,Math.PI*2); ctx!.fillStyle='#0DCCFF'; ctx!.fill()
      }
      const vig=ctx!.createLinearGradient(0,0,w*0.18,0)
      vig.addColorStop(0,C.bg); vig.addColorStop(1,'transparent')
      ctx!.fillStyle=vig; ctx!.fillRect(0,0,w*0.18,h)
    }

    let last = 0
    function loop(ts: number) {
      const dt=Math.min(last?(ts-last)/1000:0.016,0.1); last=ts
      if (phaseRef.current==='draw') { tRef.current+=dt*0.22; if(tRef.current>=1){tRef.current=1;phaseRef.current='pulse'} } else { pulseT.current+=dt }
      draw(); rafRef.current=requestAnimationFrame(loop)
    }

    let timer: ReturnType<typeof setTimeout>
    function init() { resize(); if(w>0&&h>0) rafRef.current=requestAnimationFrame(loop); else timer=setTimeout(init,50) }
    timer=setTimeout(init,120)
    const ro=new ResizeObserver(()=>{resize()})
    if(canvas.parentElement) ro.observe(canvas.parentElement)
    return ()=>{clearTimeout(timer);cancelAnimationFrame(rafRef.current);ro.disconnect()}
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" style={{ position:'absolute', inset:0, width:'100%', height:'100%', display:'block' }} />
}

// ── Platform wedge diagram ────────────────────────────────────────────────────
const WEDGES = [
  { id:'practice', label:'Practice Management', startAngle:-60, endAngle:60,  stroke:'#ffb30c', fa:'\uf201' },
  { id:'comp',     label:'Compensation',         startAngle:60,  endAngle:180, stroke:'#FF006E', fa:'\uf51e' },
  { id:'fees',     label:'Fees & Billing',        startAngle:180, endAngle:300, stroke:'#ED65D0', fa:'\uf571' },
]
function wPolar(cx:number,cy:number,r:number,deg:number){const rad=(deg-90)*Math.PI/180;return{x:cx+r*Math.cos(rad),y:cy+r*Math.sin(rad)}}
function wPath(cx:number,cy:number,oR:number,iR:number,s:number,e:number){const o1=wPolar(cx,cy,oR,s),o2=wPolar(cx,cy,oR,e),i2=wPolar(cx,cy,iR,e),i1=wPolar(cx,cy,iR,s);const lg=e-s>180?1:0;return`M${o1.x} ${o1.y} A${oR} ${oR} 0 ${lg} 1 ${o2.x} ${o2.y} L${i2.x} ${i2.y} A${iR} ${iR} 0 ${lg} 0 ${i1.x} ${i1.y}Z`}

function PlatformDiagram({ visible }: { visible: boolean }) {
  const VB=200,CX=100,CY=100,INNER=43,OUTER=84,WIN=INNER+2,LR=OUTER+18
  return (
    <div style={{ position:'relative', width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ position:'absolute', width:'min(260px,70%)', aspectRatio:'1', borderRadius:'50%', background:'radial-gradient(circle,rgba(59,132,255,0.13) 0%,transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'relative', width:'min(340px,88%)', aspectRatio:'1' }}>
        <svg viewBox={`0 0 ${VB} ${VB}`} style={{ width:'100%', height:'100%', overflow:'visible' }}>
          {WEDGES.map((w,wi)=>{
            const path=wPath(CX,CY,OUTER,WIN,w.startAngle,w.endAngle)
            const mid=(w.startAngle+w.endAngle)/2
            const ipt=wPolar(CX,CY,(OUTER+WIN)/2,mid)
            const lpt=wPolar(CX,CY,LR,mid)
            const ta=lpt.x<CX-5?'end':lpt.x>CX+5?'start':'middle'
            const words=w.label.split(' '),half=Math.ceil(words.length/2)
            return(
              <g key={w.id}>
                <path d={path} fill="none" stroke={w.stroke} strokeWidth="1.5" opacity={visible?1:0} style={{ transformOrigin:`${CX}px ${CY}px`, transform:visible?'scale(1)':'scale(0.88)', transition:`opacity 0.55s ease ${wi*0.18}s, transform 0.55s ease ${wi*0.18}s` }} />
                <text x={ipt.x} y={ipt.y} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="900" fontFamily="'Font Awesome 6 Free','Font Awesome 6 Pro','Font Awesome 5 Free'" fill={w.stroke} opacity={visible?1:0} aria-hidden="true" style={{ transition:`opacity 0.4s ease ${wi*0.18+0.18}s` }}>{w.fa}</text>
                <text x={lpt.x} y={lpt.y} textAnchor={ta} dominantBaseline="middle" fontSize="8.5" fontWeight="700" fill={w.stroke} style={{ letterSpacing:'0.02em', opacity:visible?1:0, transition:`opacity 0.4s ease ${wi*0.18+0.30}s` }}>
                  {words.length>1?(<><tspan x={lpt.x} dy="-0.6em">{words.slice(0,half).join(' ')}</tspan><tspan x={lpt.x} dy="1.3em">{words.slice(half).join(' ')}</tspan></>):w.label}
                </text>
              </g>
            )
          })}
          <circle cx={CX} cy={CY} r={INNER+2} fill={C.bg} />
          <circle cx={CX} cy={CY} r={INNER} fill="none" stroke="rgba(59,132,255,0.18)" strokeWidth="1.5" />
          <circle cx={CX} cy={CY} r={INNER} fill="none" stroke="rgba(59,132,255,0.45)" strokeWidth="1.5" />
          <text x={CX} y={CY} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="600" fill={C.text} style={{ letterSpacing:'0.02em', opacity:visible?1:0, transition:'opacity 0.5s ease 0.38s' }}>
            <tspan x={CX} dy="-5">Revenue Book</tspan><tspan x={CX} dy="11">of Record</tspan>
          </text>
        </svg>
      </div>
    </div>
  )
}

// ── Stat counter ──────────────────────────────────────────────────────────────
function StatCount({ prefix='', value, suffix='', color, bg, labelColor=C.subtle, duration=1600, label }: {
  prefix?:string; value:number; suffix?:string; color:string; bg:string; labelColor?:string; duration?:number; label:string
}) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const ran = useRef(false)
  useEffect(() => {
    const el=ref.current; if(!el) return
    const io=new IntersectionObserver(([e])=>{
      if(!e.isIntersecting||ran.current) return
      ran.current=true; io.disconnect()
      const start=performance.now()
      const tick=(now:number)=>{ const p=Math.min(1,(now-start)/duration); setDisplay((1-Math.pow(1-p,3))*value); if(p<1) requestAnimationFrame(tick) }
      requestAnimationFrame(tick)
    },{threshold:0.3})
    io.observe(el); return ()=>io.disconnect()
  },[value,duration])
  return (
    <div ref={ref} style={{ background:bg, padding:'1.75rem 1.5rem', display:'flex', flexDirection:'column', justifyContent:'center', minHeight:160 }}>
      <span style={{ fontSize:'clamp(2rem,3.5vw,2.75rem)', fontWeight:800, color, letterSpacing:'-0.04em', lineHeight:1, display:'block' }}>
        {prefix}{Math.round(display)}{suffix}
      </span>
      <p style={{ marginTop:'0.625rem', fontSize:'0.7rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.12em', color:labelColor, lineHeight:1.4 }}>{label}</p>
    </div>
  )
}

function useReveal(threshold=0.05){
  const ref=useRef<HTMLElement>(null)
  const [visible,setVisible]=useState(false)
  useEffect(()=>{
    const el=ref.current; if(!el) return
    const io=new IntersectionObserver(([e])=>{if(e.isIntersecting){setVisible(true);io.disconnect()}},{threshold})
    io.observe(el); return ()=>io.disconnect()
  },[threshold])
  return {ref,visible}
}

function useBreakpoint(){
  const [w,setW]=useState(1280)
  useEffect(()=>{const upd=()=>setW(window.innerWidth);upd();window.addEventListener('resize',upd);return ()=>window.removeEventListener('resize',upd)},[])
  return {isMobile:w<640,isTablet:w<1024}
}

interface Props { teamPhotoUrl:string|null; carouselImages:{url:string;alt:string}[] }

export default function AboutPageClient({ teamPhotoUrl, carouselImages }: Props) {
  const [mounted,setMounted]=useState(false)
  const {isMobile,isTablet}=useBreakpoint()
  useEffect(()=>{const t=setTimeout(()=>setMounted(true),60);return ()=>clearTimeout(t)},[])

  const story    =useReveal()
  const mission  =useReveal()
  const team     =useReveal()
  const awards   =useReveal()
  const valuesCta=useReveal()

  const col=(frac:string)=>isTablet?'unset':`0 0 ${frac}`
  const sectionPad='clamp(4rem,7vw,6rem) 0'
  const maxW={maxWidth:'80rem',margin:'0 auto',padding:'0 1.5rem'}

  const STAT_TILES=[
    {prefix:'$',value:15,suffix:'T',  label:'In Assets Under Administration',color:'#3b84ff',bg:'rgba(59,132,255,0.12)',  labelColor:'rgba(59,132,255,0.7)'},
    {prefix:'$',value:3, suffix:'B+', label:'In Fees Calculated Annually',   color:'#ffffff',bg:C.azure,                  labelColor:'rgba(255,255,255,0.75)'},
    {value:200,          suffix:'M+', label:'Actions Run Per Year',          color:'#ffffff',bg:C.mand,                   labelColor:'rgba(255,255,255,0.75)'},
    {value:4,            suffix:'',   label:'One global team, always local.',color:C.bg,     bg:'#facc22',                labelColor:'rgba(20,15,12,0.65)'},
  ]

  const VALUES=[
    {icon:'fa-heart',        color:C.azure, title:'Client Obsession',  desc:'We build products that help wealth management firms grow revenue and profit, creating a great experience for our customers and our employees.'},
    {icon:'fa-people-group', color:C.mand,  title:'Come As You Are',   desc:'We value diverse perspectives, experiences, and cultures. Open ideas and healthy debate are how we do our best work, together.'},
    {icon:'fa-bolt',         color:C.honey, title:'Play to Win',       desc:'Every day is an opportunity to make something happen. We act with urgency, take ownership, and push hard when it matters most.'},
  ]

  return (
    <div style={{ background:C.bg, fontFamily:"'Carlito','Segoe UI',sans-serif", position:'relative' }}>
      <PageGlows />

      {/* ── 1. Hero — Globe ──────────────────────────────────────────── */}
      <section style={{ position:'relative', zIndex:1, minHeight:'88vh', display:'flex', alignItems:'stretch' }} aria-label="About PureFacts">
        <div style={{ display:'flex', width:'100%', flexDirection:isTablet?'column':'row' }}>
          <div style={{
            flex:isTablet?'unset':'0 0 50%', display:'flex', alignItems:'center',
            paddingTop:96, paddingBottom:96,
            paddingLeft:'max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))',
            paddingRight:isTablet?'max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))':'3rem',
            opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(24px)',
            transition:'opacity 0.7s ease, transform 0.7s ease',
          }}>
            <div style={{ maxWidth:'34rem' }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.20em', textTransform:'uppercase', color:C.mand, marginBottom:20 }}>About PureFacts</div>
              <h1 style={{ fontSize:'clamp(2.25rem,5vw,3.75rem)', fontWeight:700, lineHeight:1.08, letterSpacing:'-0.025em', color:C.text, marginBottom:24 }}>
                25 Years of{' '}
                <span style={{ background:SUNSET, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Revenue Performance</span>
              </h1>
              <p style={{ fontSize:'1.0625rem', color:C.muted, lineHeight:1.75, marginBottom:40 }}>
                PureFacts is the leader in the Revenue Performance Management category for
                wealth and asset management firms. For more than 25 years, we have helped
                leading financial institutions turn revenue from an operational process into
                a strategic advantage.
              </p>
              <Link href="/contact" className="btn-primary">Get in touch</Link>
            </div>
          </div>
          <div style={{ flex:isTablet?'unset':'0 0 50%', position:'relative', minHeight: isTablet ? 380 : 480, alignSelf:'stretch', opacity:mounted?1:0, transition:'opacity 0.9s ease 0.2s' }}>
            <GlobeCanvas />
            <div style={{ position:'absolute', bottom:'10%', right:'6%', background:'rgba(26,20,16,0.88)', border:'1px solid rgba(255,179,12,0.25)', backdropFilter:'blur(12px)', padding:'12px 18px', opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(8px)', transition:'opacity 0.8s ease 0.7s, transform 0.8s ease 0.7s' }}>
              <div style={{ fontSize:10, fontWeight:700, color:C.honey, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:4 }}>4 Global Offices</div>
              <div style={{ fontSize:13, color:C.text, fontWeight:600 }}>Toronto · New York · Lisbon · Zurich</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Our Story ─────────────────────────────────────────────── */}
      <section ref={story.ref as React.RefObject<HTMLElement>} style={{ position:'relative', zIndex:1, padding:sectionPad, opacity:story.visible?1:0, transform:story.visible?'translateY(0)':'translateY(24px)', transition:'opacity 0.7s ease, transform 0.7s ease' }} aria-label="Our story">
        <div style={maxW}>
          <div style={{ display:'flex', flexDirection:isTablet?'column':'row', gap:isTablet?'3rem':'5rem', alignItems:'flex-start' }}>
            <div style={{ flex:col('58%') }}>
              <h2 style={{ fontSize:'clamp(1.75rem,3vw,2.5rem)', fontWeight:700, lineHeight:1.15, letterSpacing:'-0.025em', color:C.text, marginBottom:'1.25rem' }}>Discover our story.</h2>
              <p style={{ fontSize:'1.0625rem', color:C.muted, lineHeight:1.75, marginBottom:'1rem' }}>
                With offices across the globe, we empower financial institutions to unlock new revenue, streamline operations, and accelerate their ambitions.
              </p>
              <p style={{ fontSize:'1.0625rem', color:C.muted, lineHeight:1.75, marginBottom:'1rem' }}>
                We&apos;re not just technologists. We&apos;re financial services insiders, investment specialists, data scientists, and forward-thinking innovators. Our team combines deep industry knowledge with advanced technology expertise to bring tangible impact to client operations and revenue performance.
              </p>
              <p style={{ fontSize:'1.0625rem', color:C.muted, lineHeight:1.75, marginBottom:24}}>
                From a scrappy Toronto startup to the global benchmark for revenue management, every step was a basis point earned.
              </p>
              <Link href="/about/leadership" className="btn-primary">Our leadership</Link>
            </div>
            <div style={{ flex:col('40%'), width:isTablet?'100%':'auto' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:3 }}>
                {STAT_TILES.map((s,i)=>(
                  <div key={s.label} style={{ opacity:story.visible?1:0, transform:story.visible?'translateY(0)':'translateY(16px)', transition:`opacity 0.5s ease ${i*0.08}s, transform 0.5s ease ${i*0.08}s` }}>
                    <StatCount {...s} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Our Mission ───────────────────────────────────────────── */}
      <section ref={mission.ref as React.RefObject<HTMLElement>} style={{ position:'relative', zIndex:1, padding:sectionPad, opacity:mission.visible?1:0, transform:mission.visible?'translateY(0)':'translateY(24px)', transition:'opacity 0.7s ease, transform 0.7s ease' }} aria-label="Our mission">
        <div style={maxW}>
          <div style={{ display:'flex', flexDirection:isTablet?'column':'row', gap:isTablet?'3rem':'5rem', alignItems:'center' }}>
            <div style={{ flex:col('55%') }}>
              <h2 style={{ fontSize:'clamp(1.75rem,3vw,2.5rem)', fontWeight:700, lineHeight:1.15, letterSpacing:'-0.025em', color:C.text, marginBottom:'1.5rem' }}>Our Mission</h2>
              <p style={{ fontSize:'clamp(1rem,1.6vw,1.125rem)', color:C.muted, lineHeight:1.8, marginBottom:'1.25rem' }}>
                PureFacts is the leader in the Revenue Performance Management category for wealth and asset management firms. The PureRevenue Platform helps organizations maximize revenue potential by connecting pricing, billing, compensation, advisor behavior, and AI-powered intelligence within a single{' '}
                <span style={{ color:C.azure }}>Revenue Book of Record.</span>
              </p>
              <p style={{ fontSize:'clamp(1rem,1.6vw,1.125rem)', color:C.muted, lineHeight:1.8, marginBottom:'1.25rem' }}>
                By transforming fragmented revenue processes into a coordinated growth system, firms gain greater visibility, stronger pricing discipline, improved revenue capture, and more effective advisor alignment. The result is faster organic growth, improved profitability, and increased enterprise value.
              </p>
              <p style={{ fontSize:'clamp(1rem,1.6vw,1.125rem)', color:C.muted, lineHeight:1.8, marginBottom:'2rem' }}>
                For more than 25 years, PureFacts has helped leading financial institutions turn revenue from an operational process into a strategic advantage.
              </p>
              <Link href="/platform" className="btn-primary">Explore PureRevenue</Link>
            </div>
            <div style={{ flex:col('42%'), width:isTablet?'100%':'auto', minHeight:isTablet?300:380 }}>
              <PlatformDiagram visible={mission.visible} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Meet the team ─────────────────────────────────────────── */}
      <section ref={team.ref as React.RefObject<HTMLElement>} style={{ position:'relative', zIndex:1, padding:'clamp(3.5rem,6vw,5rem) 0', opacity:team.visible?1:0, transform:team.visible?'translateY(0)':'translateY(24px)', transition:'opacity 0.7s ease, transform 0.7s ease' }} aria-label="Meet the team">
        <div style={maxW}>
          <div style={{ display:'flex', flexDirection:isTablet?'column':'row', justifyContent:'space-between', alignItems:isTablet?'flex-start':'flex-end', gap:'1rem', marginBottom:'2rem' }}>
            <div>
              <h2 style={{ fontSize:'clamp(1.75rem,3vw,2.5rem)', fontWeight:700, color:C.text, letterSpacing:'-0.025em', marginBottom:'0.75rem' }}>Meet the team.</h2>
              <p style={{ fontSize:'1rem', color:C.subtle, maxWidth:'32rem', lineHeight:1.7 }}>Financial services insiders, data scientists, and forward-thinking innovators united by a shared commitment to client performance.</p>
            </div>
            <Link href="/about/leadership" className="btn-primary" style={{ flexShrink:0 }}>Our leadership</Link>
          </div>
          <div style={{ position:'relative', width:'100%', aspectRatio:'16/8', overflow:'hidden' }}>
            {teamPhotoUrl
              ? <Image src={teamPhotoUrl} alt="The PureFacts team gathered together" fill sizes="100vw" style={{ objectFit:'cover', objectPosition:'center' }} />
              : <div style={{ width:'100%', height:'100%', background:C.surface, display:'flex', alignItems:'center', justifyContent:'center' }}><p style={{ color:C.subtle, fontSize:'0.875rem' }}>Team photo coming soon</p></div>
            }
          </div>
        </div>
      </section>

      {/* ── 5. Partnership and Recognition ───────────────────────────── */}
      <section ref={awards.ref as React.RefObject<HTMLElement>} style={{ position:'relative', zIndex:1, padding:sectionPad, opacity:awards.visible?1:0, transform:awards.visible?'translateY(0)':'translateY(24px)', transition:'opacity 0.7s ease, transform 0.7s ease' }} aria-label="Partnership and recognition">
        <div style={maxW}>
          <div style={{ display:'flex', flexDirection:isTablet?'column':'row', gap:isTablet?'3rem':'5rem', alignItems:'center' }}>
            <div style={{ flexShrink:0, width:isTablet?'100%':'auto' }}>
              <CrossfadeCarousel images={carouselImages} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.20em', textTransform:'uppercase', color:C.mand, marginBottom:16 }}>Recognition</div>
              <h2 style={{ fontSize:'clamp(1.75rem,3vw,2.5rem)', fontWeight:700, color:C.text, letterSpacing:'-0.025em', marginBottom:'1.25rem' }}>Partnership &amp; Recognition</h2>
              <p style={{ fontSize:'1.0625rem', color:C.muted, lineHeight:1.75, marginBottom:'1.75rem' }}>
                Our long-standing collaborations with leading financial brands testify to our ability to forge strong, results-driven relationships. Industry recognition reflects our consistent innovation at the intersection of finance and technology.
              </p>
              <Link href="/about/newsroom" className="btn-primary">View our awards</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Values + Careers CTA ──────────────────────────────────── */}
      <section ref={valuesCta.ref as React.RefObject<HTMLElement>} style={{ position:'relative', zIndex:1, padding:sectionPad, opacity:valuesCta.visible?1:0, transform:valuesCta.visible?'translateY(0)':'translateY(24px)', transition:'opacity 0.7s ease, transform 0.7s ease' }} aria-label="Join PureFacts">
        <div style={maxW}>
          <div style={{ display:'flex', flexDirection:isTablet?'column':'row', gap:isTablet?'3rem':'5rem', alignItems:'flex-start' }}>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'2rem' }}>
              {VALUES.map(({icon,color,title,desc},i)=>(
                <div key={title} style={{ display:'flex', gap:'1.25rem', alignItems:'flex-start', opacity:valuesCta.visible?1:0, transform:valuesCta.visible?'translateY(0)':'translateY(16px)', transition:`opacity 0.5s ease ${i*0.1}s, transform 0.5s ease ${i*0.1}s` }}>
                  <div style={{ width:'3rem', height:'3rem', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:C.surface, border:`1px solid ${C.border}` }} aria-hidden="true">
                    <i className={`fa-solid ${icon}`} style={{ color, fontSize:'1.05rem' }} />
                  </div>
                  <div>
                    <p style={{ fontSize:'1rem', fontWeight:700, color:C.text, marginBottom:'0.375rem' }}>{title}</p>
                    <p style={{ fontSize:'0.9375rem', color:C.muted, lineHeight:1.7 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ flex:'0 0 42%' }}>
              <h2 style={{ fontSize:'clamp(1.75rem,3vw,2.5rem)', fontWeight:700, lineHeight:1.15, letterSpacing:'-0.025em', color:C.text, marginBottom:'1.25rem' }}>
                Ambitious, Driven, and Ready{' '}
                <span style={{ background:SUNSET, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>To Make An Impact?</span>
              </h2>
              <p style={{ fontSize:'1.0625rem', color:C.muted, lineHeight:1.75, marginBottom:'2rem' }}>
                PureFacts is a fast-moving fintech where meaningful work, a supportive culture, and real growth opportunities come together. If that sounds like your kind of place, we would love to meet you.
              </p>
              <Link href="/about/careers" className="btn-primary">See open roles</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}