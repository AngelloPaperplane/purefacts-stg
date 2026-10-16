
'use client'

import { useEffect, useRef, useState } from 'react'
import HubspotModal from '@/components/resources/HubspotModal';
import Link from 'next/link'

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
  const aRgb = '251,86,7'
  const accent = '#fb5607'
  const [mounted,setMounted]=useState(false)
  const { isMobile, isTablet } = useBreakpoint()
  useEffect(()=>{setTimeout(()=>setMounted(true),80)},[])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const bg = C.bg
  return (
    <>
      <section style={{position:'relative',overflow:'hidden',background:bg,padding:isMobile?'48px 0':isTablet?'72px 0':'90px 0 72px',display:'flex',alignItems:'center'}}>
        <RevenueLedgerCanvas  aRgb={aRgb} />
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:160,background:`linear-gradient(to bottom, transparent, ${bg})`,pointerEvents:'none',zIndex:2}} aria-hidden="true" />
        <div style={{maxWidth:1280,margin:'0 auto',padding:isMobile?'0 20px':isTablet?'0 32px':'0 48px',width:'100%',position:'relative',zIndex:3}}>
          <div style={{maxWidth:640,opacity:mounted?1:0,transform:mounted?'translateY(0)':'translateY(24px)',transition:'opacity 0.7s ease, transform 0.7s ease'}}>
            <div style={{marginBottom:20}}>
              <span style={{fontSize:11,fontWeight:700,color:accent,textTransform:'uppercase',letterSpacing:'0.20em'}}>partner type</span>
            </div>
            <h1 style={{fontSize:'clamp(2rem, 4vw, 3.25rem)',fontWeight:700,lineHeight:1.08,letterSpacing:'-0.028em',color:C.text,maxWidth:640,marginBottom:24}}>
              Referral Partner<br /><span style={{color:accent}}>Refer. Reward. Repeat.</span>
            </h1>
            <p style={{fontSize:'1.0625rem',color:C.muted,lineHeight:1.75,maxWidth:520,marginBottom:40}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat</p>
            <button 
                onClick={() => setIsModalOpen(true)} 
                className="btn-primary"
                style={{ cursor: 'pointer', backgroundColor: accent, zIndex: 'unset', marginRight: '10px', borderColor: accent }}
              >
                Become a Partner
              </button>
            <Link href="/contact" className="btn-primary" style={{borderColor:accent}}>Get in contact</Link>
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






export default function ContImplementationPartnerClient() {

  return (
    <div style={{ background:C.bg, fontFamily:"'Carlito','Segoe UI',sans-serif", position:'relative' }}>
      <Hero />
    </div>
  )
}