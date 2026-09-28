'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const C = {
  bg:      '#140f0c',
  surface: '#1a1410',
  text:    '#f4f4f4',
  body:    'rgba(244,244,244,0.75)',
  subtle:  'rgba(244,244,244,0.45)',
  border:  'rgba(255,255,255,0.07)',
  azure:   '#3b84ff',
  mandarin:'#fb5607',
  honey:   '#ffb30c',
  fees:    '#ED65D0',
  comp:    '#FF006E',
  sunset:  'linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%)',
} as const

function GradientText({ children }: { children: React.ReactNode }) {
  return <span style={{ background: C.sunset, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{children}</span>
}

function Eyebrow({ children, color = C.honey }: { children: React.ReactNode; color?: string }) {
  return <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.20em', color, margin: '0 0 14px' }}>{children}</p>
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

function Reveal({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(22px)', transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`, ...style }}>
      {children}
    </div>
  )
}

/* ─── SONAR CANVAS ─────────────────────────────────────────── */
function SonarCanvas() {
  const { isMobile } = useBreakpoint()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    let W = 0, H = 0, tick = 0

    function ha(hex: string, a: number) {
      return `${hex}${Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0')}`
    }

    const NODES = [
      { label: 'Pricing',        color: C.fees,    angle: -80,  dist: 0.36 },
      { label: 'Compensation',   color: C.comp,    angle: -20,  dist: 0.38 },
      { label: 'Performance',    color: C.honey,   angle:  40,  dist: 0.35 },
      { label: 'Client Data',    color: C.azure,   angle: 100,  dist: 0.37 },
      { label: 'Benchmarks',     color: C.mandarin,angle: 155,  dist: 0.36 },
      { label: 'Exceptions',     color: C.honey,   angle: 210,  dist: 0.38 },
      { label: 'Advisor Growth', color: C.azure,   angle: 265,  dist: 0.35 },
    ]

    const PULSES: { r: number; born: number }[] = []
    let lastPulse = 0

    function init() {
      W = canvas!.offsetWidth; H = canvas!.offsetHeight
      canvas!.width = W; canvas!.height = H
    }

    function draw() {
      tick++
      const now = tick / 60
      ctx!.clearRect(0, 0, W, H)

      const cx = W * 0.5, cy = H * 0.5
      const maxR = Math.min(W, H) * 0.48

      if (now - lastPulse > 2.4) { PULSES.push({ r: 0, born: now }); lastPulse = now }
      for (let i = PULSES.length - 1; i >= 0; i--) { if (PULSES[i].r > maxR * 1.05) PULSES.splice(i, 1) }
      PULSES.forEach(p => { p.r += maxR / (2.4 * 60) })

      ;[0.25, 0.5, 0.75, 1.0].forEach(f => {
        ctx!.beginPath()
        ctx!.arc(cx, cy, maxR * f, 0, Math.PI * 2)
        ctx!.strokeStyle = ha('#ffffff', 0.04)
        ctx!.lineWidth = 1
        ctx!.stroke()
      })

      const sweepAngle = (tick * 0.018) % (Math.PI * 2)
      ctx!.save()
      ctx!.translate(cx, cy)
      ctx!.rotate(sweepAngle)
      const sweepGrad = ctx!.createLinearGradient(0, 0, maxR, 0)
      sweepGrad.addColorStop(0, ha(C.honey, 0.55))
      sweepGrad.addColorStop(1, ha(C.honey, 0))
      ctx!.beginPath()
      ctx!.moveTo(0, 0)
      ctx!.lineTo(maxR, 0)
      ctx!.strokeStyle = sweepGrad
      ctx!.lineWidth = 1.5
      ctx!.stroke()
      ctx!.beginPath()
      ctx!.moveTo(0, 0)
      ctx!.arc(0, 0, maxR, 0, -Math.PI * 0.35, true)
      ctx!.closePath()
      ctx!.fillStyle = ha(C.honey, 0.04)
      ctx!.fill()
      ctx!.restore()

      PULSES.forEach(p => {
        const alpha = Math.max(0, 0.5 * (1 - p.r / maxR))
        ctx!.beginPath()
        ctx!.arc(cx, cy, p.r, 0, Math.PI * 2)
        ctx!.strokeStyle = ha(C.honey, alpha)
        ctx!.lineWidth = 1.5
        ctx!.stroke()
      })

      NODES.forEach(n => {
        const rad = (n.angle * Math.PI) / 180
        const r = maxR * n.dist
        const nx = cx + r * Math.cos(rad)
        const ny = cy + r * Math.sin(rad)

        let lit = 0
        PULSES.forEach(p => {
          const proximity = 1 - Math.abs(p.r - r) / (maxR * 0.12)
          if (proximity > 0) lit = Math.max(lit, proximity)
        })
        const nodeAngle = n.angle * Math.PI / 180
        const sweepNorm = sweepAngle % (Math.PI * 2)
        let angleDiff = Math.abs(sweepNorm - ((nodeAngle + Math.PI * 2) % (Math.PI * 2)))
        if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff
        const sweepLit = Math.max(0, 1 - angleDiff / 0.35)
        lit = Math.max(lit, sweepLit * 0.85)

        const baseAlpha = 0.25 + lit * 0.65
        const glowR = (10 + lit * 18)

        const g = ctx!.createRadialGradient(nx, ny, 0, nx, ny, glowR)
        g.addColorStop(0, ha(n.color, 0.25 * (0.3 + lit * 0.7)))
        g.addColorStop(1, ha(n.color, 0))
        ctx!.beginPath(); ctx!.arc(nx, ny, glowR, 0, Math.PI * 2)
        ctx!.fillStyle = g; ctx!.fill()

        ctx!.beginPath(); ctx!.arc(nx, ny, 4 + lit * 2.5, 0, Math.PI * 2)
        ctx!.fillStyle = ha(n.color, baseAlpha); ctx!.fill()
        ctx!.strokeStyle = ha(n.color, 0.5 + lit * 0.4); ctx!.lineWidth = 1; ctx!.stroke()

        const labelOffset = 14
        const lx = nx + Math.cos(rad) * labelOffset
        const ly = ny + Math.sin(rad) * labelOffset
        ctx!.fillStyle = ha(n.color, 0.45 + lit * 0.45)
        ctx!.font = `600 9.5px Carlito, sans-serif`
        ctx!.textAlign = lx < cx - 10 ? 'right' : lx > cx + 10 ? 'left' : 'center'
        ctx!.textBaseline = 'middle'
        ctx!.fillText(n.label, lx, ly)
      })

      const hubR = Math.min(W, H) * 0.085
      const hg = ctx!.createRadialGradient(cx, cy, 0, cx, cy, hubR)
      hg.addColorStop(0, ha(C.honey, 0.22))
      hg.addColorStop(1, ha(C.honey, 0.05))
      ctx!.beginPath(); ctx!.arc(cx, cy, hubR, 0, Math.PI * 2)
      ctx!.fillStyle = hg; ctx!.fill()
      ctx!.strokeStyle = ha(C.honey, 0.5); ctx!.lineWidth = 1.5; ctx!.stroke()

      ctx!.fillStyle = ha(C.text, 0.92)
      ctx!.font = `700 ${Math.max(9, hubR * 0.46)}px Carlito, sans-serif`
      ctx!.textAlign = 'center'; ctx!.textBaseline = 'middle'
      ctx!.fillText('Practice', cx, cy - hubR * 0.18)
      ctx!.fillStyle = ha(C.honey, 0.7)
      ctx!.font = `500 ${Math.max(8, hubR * 0.36)}px Carlito, sans-serif`
      ctx!.fillText('Intelligence', cx, cy + hubR * 0.28)

      rafRef.current = requestAnimationFrame(draw)
    }

    init(); draw()
    const ro = new ResizeObserver(() => init()); ro.observe(canvas)
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect() }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" style={{ display: 'block', width: '100%', height: isMobile ? 300 : '100%', minHeight: isMobile ? 300 : 380 }} />
}

/* ─── PUZZLE CANVAS ────────────────────────────────────────── */
function PuzzleCanvas() {
  const { isMobile } = useBreakpoint()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const container = containerRef.current; if (!container) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) { started.current = true; startCanvas() }
    }, { threshold: 0.15 })
    obs.observe(container)
    return () => { obs.disconnect(); cancelAnimationFrame(rafRef.current) }
  }, [])

  function startCanvas() {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    let W = 0, H = 0, tick = 0

    const COLS = 3, ROWS = 2
    const LABELS = ['Pricing', 'Advisor Data', 'Client Value', 'Benchmarks', 'Discounting', 'Growth Goals']
    const GOOD = '#ffb30c', BAD = '#fb5607'

    const connH = [[1, -1, 1]]
    const connV = [[1, -1], [-1, 1]]

    function getEdges(r: number, c: number) {
      return {
        top:    r === 0      ? 0 : -connH[r-1][c],
        bottom: r === ROWS-1 ? 0 :  connH[r][c],
        left:   c === 0      ? 0 : -connV[r][c-1],
        right:  c === COLS-1 ? 0 :  connV[r][c],
      }
    }

    function puzzlePath(x: number, y: number, w: number, h: number, edges: Record<string,number>) {
      const nub = Math.min(w, h) * 0.2
      const p = new Path2D()
      p.moveTo(x, y)
      if (edges.top === 0) { p.lineTo(x+w, y) } else {
        const mx=x+w/2, d=edges.top
        p.lineTo(mx-nub*0.8,y); p.bezierCurveTo(mx-nub*0.8,y-d*nub*1.3,mx-nub*0.5,y-d*nub*1.6,mx,y-d*nub*1.6)
        p.bezierCurveTo(mx+nub*0.5,y-d*nub*1.6,mx+nub*0.8,y-d*nub*1.3,mx+nub*0.8,y); p.lineTo(x+w,y)
      }
      if (edges.right === 0) { p.lineTo(x+w,y+h) } else {
        const my=y+h/2, d=edges.right
        p.lineTo(x+w,my-nub*0.8); p.bezierCurveTo(x+w+d*nub*1.3,my-nub*0.8,x+w+d*nub*1.6,my-nub*0.5,x+w+d*nub*1.6,my)
        p.bezierCurveTo(x+w+d*nub*1.6,my+nub*0.5,x+w+d*nub*1.3,my+nub*0.8,x+w,my+nub*0.8); p.lineTo(x+w,y+h)
      }
      if (edges.bottom === 0) { p.lineTo(x,y+h) } else {
        const mx=x+w/2, d=edges.bottom
        p.lineTo(mx+nub*0.8,y+h); p.bezierCurveTo(mx+nub*0.8,y+h+d*nub*1.3,mx+nub*0.5,y+h+d*nub*1.6,mx,y+h+d*nub*1.6)
        p.bezierCurveTo(mx-nub*0.5,y+h+d*nub*1.6,mx-nub*0.8,y+h+d*nub*1.3,mx-nub*0.8,y+h); p.lineTo(x,y+h)
      }
      if (edges.left === 0) { p.lineTo(x,y) } else {
        const my=y+h/2, d=edges.left
        p.lineTo(x,my+nub*0.8); p.bezierCurveTo(x-d*nub*1.3,my+nub*0.8,x-d*nub*1.6,my+nub*0.5,x-d*nub*1.6,my)
        p.bezierCurveTo(x-d*nub*1.6,my-nub*0.5,x-d*nub*1.3,my-nub*0.8,x,my-nub*0.8); p.lineTo(x,y)
      }
      p.closePath()
      return p
    }

    function wrongEdges(e: Record<string,number>) {
      const flip = (v: number) => v === 0 ? (Math.random()>0.5?1:-1) : -v
      return { top:flip(e.top), right:flip(e.right), bottom:flip(e.bottom), left:flip(e.left) }
    }

    function ha(hex: string, a: number) {
      const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16)
      return `rgba(${r},${g},${b},${a})`
    }

    let PW: number, PH: number, OX: number, OY: number
    let wrongSet = new Set<number>()

    function pickWrong() {
      wrongSet.clear()
      const pool=[0,1,2,3,4,5]
      while(wrongSet.size<2) wrongSet.add(pool[Math.floor(Math.random()*pool.length)])
    }
    pickWrong()

    type Piece = {
      label: string; i: number; c: number; r: number
      tx: number; ty: number; x: number; y: number
      vx: number; vy: number; state: string
      delay: number; shakeT: number; alpha: number
      isWrong: boolean; correctEdges: Record<string,number>; edges: Record<string,number>; color: string
      _reset?: boolean
    }
    let pieces: Piece[] = []

    function makePieces() {
      PW = Math.floor(Math.min(W*0.72, H*1.1)/COLS)
      PH = Math.floor(PW*0.82)
      OX = Math.floor((W-COLS*PW)/2)
      OY = Math.floor((H-ROWS*PH)/2)-10
      pieces = LABELS.map((label, i) => {
        const c=i%COLS, r=Math.floor(i/COLS)
        const correctEdges=getEdges(r,c)
        const isWrong=wrongSet.has(i)
        return { label,i,c,r, tx:OX+c*PW, ty:OY+r*PH, x:Math.random()*W*0.6+W*0.2, y:-PH*1.5-Math.random()*H*0.4, vx:0,vy:0, state:'flying', delay:i*28+12, shakeT:0, alpha:1, isWrong, correctEdges, edges:isWrong?wrongEdges(correctEdges):correctEdges, color:isWrong?BAD:GOOD }
      })
    }

    function drawPiece(p: Piece, ox: number, oy: number) {
      const x=p.x+(ox||0), y=p.y+(oy||0)
      const path=puzzlePath(x,y,PW,PH,p.edges)
      const nub=Math.min(PW,PH)*0.2
      const inset=nub*1.7
      const iw=PW-inset*2
      ctx!.save()
      ctx!.globalAlpha=p.alpha
      ctx!.fillStyle=ha(p.color,0.15); ctx!.fill(path)
      ctx!.strokeStyle=ha(p.color,0.8); ctx!.lineWidth=1.5; ctx!.stroke(path)
      ctx!.beginPath(); ctx!.rect(x+inset,y+inset,iw,PH-inset*2); ctx!.clip()
      ctx!.textAlign='center'; ctx!.textBaseline='middle'
      let fs=Math.max(8,Math.min(PW*0.13,iw/p.label.length*1.55))
      ctx!.font=`700 ${fs}px Carlito,sans-serif`
      while(ctx!.measureText(p.label).width>iw-6&&fs>7){fs-=0.5;ctx!.font=`700 ${fs}px Carlito,sans-serif`}
      ctx!.fillStyle=ha(p.color,0.92)
      ctx!.fillText(p.label,x+PW/2,y+PH/2)
      ctx!.restore()
    }

    function drawHole(r: number, c: number) {
      const x=OX+c*PW, y=OY+r*PH
      const path=puzzlePath(x,y,PW,PH,getEdges(r,c))
      ctx!.save(); ctx!.strokeStyle='rgba(255,255,255,0.07)'; ctx!.lineWidth=1
      ctx!.setLineDash([4,5]); ctx!.stroke(path); ctx!.setLineDash([]); ctx!.restore()
    }

    function init() {
      W=canvas!.offsetWidth; H=canvas!.offsetHeight
      canvas!.width=W*(window.devicePixelRatio||1); canvas!.height=H*(window.devicePixelRatio||1)
      ctx!.scale(window.devicePixelRatio||1,window.devicePixelRatio||1)
      makePieces(); tick=0
    }

    function draw() {
      tick++
      ctx!.clearRect(0,0,W,H)
      for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) drawHole(r,c)

      let allPlaced=true
      pieces.forEach(p => {
        if(tick<p.delay){allPlaced=false;return}
        if(p.state==='flying'){
          allPlaced=false
          const dx=p.tx-p.x,dy=p.ty-p.y
          p.x+=dx*0.11;p.y+=dy*0.11
          if(Math.abs(dx)<1.5&&Math.abs(dy)<1.5){p.x=p.tx;p.y=p.ty;p.state=p.isWrong?'reject-shake':'placed';p.shakeT=0}
          drawPiece(p,0,0)
        } else if(p.state==='reject-shake'){
          allPlaced=false; p.shakeT+=0.18
          const ox=Math.sin(p.shakeT*2.4)*6, oy=Math.sin(p.shakeT*1.8)*3
          if(p.shakeT>Math.PI*3.2){p.state='falling';p.vy=1.8+Math.random();p.vx=(Math.random()-0.5)*4}
          drawPiece(p,ox,oy)
        } else if(p.state==='falling'){
          allPlaced=false; p.vy+=0.38; p.x+=p.vx; p.y+=p.vy
          p.alpha=Math.max(0,p.alpha-0.017)
          if(p.y>H+PH*2){
            pickWrong()
            const isWrong=wrongSet.has(p.i)
            p.isWrong=isWrong; p.edges=isWrong?wrongEdges(p.correctEdges):p.correctEdges
            p.color=isWrong?BAD:GOOD; p.x=Math.random()*W*0.6+W*0.2; p.y=-PH*1.5-Math.random()*60
            p.alpha=1;p.vx=0;p.vy=0;p.state='flying';p.delay=tick+55+Math.random()*55
          }
          drawPiece(p,0,0)
        } else { drawPiece(p,0,0) }
      })

      if(allPlaced){
        if(!pieces[0]._reset){
          pieces.forEach(p=>p._reset=true)
          setTimeout(()=>{pickWrong();makePieces();tick=0},1400)
        }
      } else { pieces.forEach(p=>p._reset=false) }

      rafRef.current=requestAnimationFrame(draw)
    }

    init(); draw()
    const ro=new ResizeObserver(()=>init()); ro.observe(canvas)
    return () => { ro.disconnect() }
  }

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <canvas ref={canvasRef} aria-hidden="true" style={{ display: 'block', width: '100%', minHeight: isMobile ? 300 : 360 }} />
    </div>
  )
}

/* ─── PLATFORM DIAGRAM ─────────────────────────────────────── */
const DIAGRAM_WEDGES = [
  { id: 'practice', label: 'Practice Management', startAngle: -60, endAngle: 60,  fill: 'none', stroke: '#ffb30c', faUnicode: '\uf201' },
  { id: 'comp',     label: 'Compensation',         startAngle: 60,  endAngle: 180, fill: 'none', stroke: '#FF006E', faUnicode: '\uf51e' },
  { id: 'fees',     label: 'Fees & Billing',        startAngle: 180, endAngle: 300, fill: 'none', stroke: '#ED65D0', faUnicode: '\uf571' },
]

function diagramPolarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * Math.PI / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function diagramWedgePath(cx: number, cy: number, outerR: number, innerR: number, s: number, e: number) {
  const o1 = diagramPolarToXY(cx, cy, outerR, s), o2 = diagramPolarToXY(cx, cy, outerR, e)
  const i2 = diagramPolarToXY(cx, cy, innerR, e), i1 = diagramPolarToXY(cx, cy, innerR, s)
  const lg = e - s > 180 ? 1 : 0
  return `M${o1.x} ${o1.y} A${outerR} ${outerR} 0 ${lg} 1 ${o2.x} ${o2.y} L${i2.x} ${i2.y} A${innerR} ${innerR} 0 ${lg} 0 ${i1.x} ${i1.y}Z`
}

function PlatformDiagram() {
  const { isMobile } = useBreakpoint()
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = containerRef.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.2 })
    obs.observe(el); return () => obs.disconnect()
  }, [])

  const VB = 200, CX = 100, CY = 100, INNER = 43, OUTER = 84
  const WEDGE_INNER = INNER + 2, LABEL_R = OUTER + 18, HUB_R = INNER

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: isMobile ? 240 : 380, overflow: 'visible' }}>
      <div aria-hidden="true" style={{ position: 'absolute', width: 'min(260px, 70%)', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,179,12,0.13) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', width: isMobile ? 'min(200px, 70vw)' : 'min(340px, 88%)', aspectRatio: '1' }}>
        <svg viewBox={`0 0 ${VB} ${VB}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {DIAGRAM_WEDGES.map((w, wi) => {
            const path = diagramWedgePath(CX, CY, OUTER, WEDGE_INNER, w.startAngle, w.endAngle)
            const mid = (w.startAngle + w.endAngle) / 2
            const iconPt = diagramPolarToXY(CX, CY, (OUTER + WEDGE_INNER) / 2, mid)
            const labelPt = diagramPolarToXY(CX, CY, LABEL_R, mid)
            const textAnchor = labelPt.x < CX - 5 ? 'end' : labelPt.x > CX + 5 ? 'start' : 'middle'
            const words = w.label.split(' ')
            const half = Math.ceil(words.length / 2)
            return (
              <g key={w.id}>
                <motion.path d={path} fill={w.fill} stroke={w.stroke} strokeWidth="1.5"
                  initial={{ opacity: 0, scale: 0.88 }} animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.88 }}
                  style={{ transformOrigin: `${CX}px ${CY}px` }} transition={{ duration: 0.55, delay: visible ? wi * 0.18 : 0, ease: [0.16, 1, 0.3, 1] }} />
                <motion.text x={iconPt.x} y={iconPt.y} textAnchor="middle" dominantBaseline="middle"
                  fontSize="13" fontWeight="900" fontFamily="'Font Awesome 6 Free', 'Font Awesome 6 Pro', 'Font Awesome 5 Free'"
                  fill={w.stroke} initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.4, delay: visible ? wi * 0.18 + 0.18 : 0 }}>
                  {w.faUnicode}
                </motion.text>
                <motion.text x={labelPt.x} y={labelPt.y} textAnchor={textAnchor} dominantBaseline="middle"
                  fontSize="8.5" fontWeight="700" fill={w.stroke} style={{ letterSpacing: '0.02em' }}
                  initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.4, delay: visible ? wi * 0.18 + 0.30 : 0 }}>
                  {words.length > 1 ? (
                    <><tspan x={labelPt.x} dy="-0.6em">{words.slice(0, half).join(' ')}</tspan><tspan x={labelPt.x} dy="1.3em">{words.slice(half).join(' ')}</tspan></>
                  ) : w.label}
                </motion.text>
              </g>
            )
          })}
          <circle cx={CX} cy={CY} r={HUB_R + 2} fill="#140f0c" />
          <circle cx={CX} cy={CY} r={HUB_R} fill="none" stroke="rgba(255,179,12,0.18)" strokeWidth="1.5" />
          <motion.circle cx={CX} cy={CY} r={HUB_R} fill="none"
            initial={{ scale: 0.7, opacity: 0 }} animate={visible ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} style={{ transformOrigin: `${CX}px ${CY}px` }} />
          <circle cx={CX} cy={CY} r={HUB_R} fill="none" stroke="rgba(255,179,12,0.45)" strokeWidth="1.5" />
          <motion.text x={CX} y={CY} textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fontWeight="600" fill="#f4f4f4" style={{ letterSpacing: '0.02em' }}
            initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.5, delay: 0.38 }}>
            <tspan x={CX} dy="-5">Revenue Book</tspan>
            <tspan x={CX} dy="11">of Record</tspan>
          </motion.text>
        </svg>
      </div>
    </div>
  )
}

/* ─── STAT COUNT (animated) ────────────────────────────────── */
function StatCount({ value, prefix = '', suffix = '', color }: { value: number; prefix?: string; suffix?: string; color: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const triggered = useRef(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !triggered.current) {
        triggered.current = true; obs.disconnect()
        const start = Date.now(); const dur = 1600
        const tick = () => { const p = Math.min((Date.now() - start) / dur, 1); const eased = 1 - Math.pow(1 - p, 3); setCount(Math.round(eased * value)); if (p < 1) requestAnimationFrame(tick) }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    obs.observe(el); return () => obs.disconnect()
  }, [value])
  return <div ref={ref} style={{ fontSize: 'clamp(2.4rem,4.5vw,3.4rem)', fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.02em' }}>{prefix}{count}{suffix}</div>
}

function LargeStatCount({ value, prefix = '', suffix = '', color }: { value: number; prefix?: string; suffix?: string; color: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const triggered = useRef(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !triggered.current) {
        triggered.current = true; obs.disconnect()
        const start = Date.now(); const dur = 1800
        const tick = () => { const p = Math.min((Date.now() - start) / dur, 1); const eased = 1 - Math.pow(1 - p, 3); setCount(Math.round(eased * value)); if (p < 1) requestAnimationFrame(tick) }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    obs.observe(el); return () => obs.disconnect()
  }, [value])
  return <div ref={ref} style={{ fontSize: 'clamp(4rem,10vw,7rem)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', color: C.text, margin: 0 }} aria-label={`${prefix}${value}${suffix}`}>{prefix}{count}{suffix}</div>
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
export default function PracticeManagementSolutionClient() {
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '44px 0' : '90px 0'
  const heroPad = isMobile ? '44px 0 40px' : 'clamp(4rem,8vw,6rem) 0 clamp(3rem,5vw,4rem)'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const twoCols = isTablet ? '1fr' : 'repeat(2, minmax(0, 1fr))'
  const sectionGap = isMobile ? '24px' : 'clamp(2.5rem,5vw,5rem)'
  const productGap = isMobile ? '24px' : 'clamp(2.5rem,5vw,4rem)'
  const cardCols = isMobile ? '1fr' : '1fr 1fr'

  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; } }
        *, *::before, *::after { box-sizing: border-box; }
        section { max-width: 100%; }
        h1, h2, h3, p { overflow-wrap: anywhere; }
        svg, canvas { max-width: 100%; }

        .pm-feature-card {
          background: ${C.bg};
          border: 1px solid ${C.border};
          padding: 20px 18px;
          position: relative;
          transition: border-color 0.3s ease;
          cursor: pointer;
          display: block;
          text-decoration: none;
          height: 100%;
          box-sizing: border-box;
        }
        .pm-feature-card:hover { border-color: rgba(255,179,12,0.3); }

        .btn-honey-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.55rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #f4f4f4;
          background: #140f0c;
          box-shadow: inset 0 0 0 2px #ffb30c;
          border: none;
          border-radius: 0;
          cursor: pointer;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.25s ease;
        }
        .btn-honey-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%);
          opacity: 0;
          transition: opacity 0.25s ease;
          z-index: 0;
        }
        .btn-honey-primary::after {
          content: '';
          position: absolute;
          inset: 2px;
          background: #140f0c;
          z-index: 1;
        }
        .btn-honey-primary span, .btn-honey-primary-text {
          position: relative;
          z-index: 2;
        }
        .btn-honey-primary:hover::before { opacity: 1; }
      `}</style>

      {/* 1. HERO */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: heroPad }} aria-label="Practice Management hero">
        <div aria-hidden="true" style={{ position: 'absolute', top: '5%', left: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.07) 0%, transparent 62%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '5%', right: '5%', width: 700, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.05) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad, width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: isMobile ? '24px' : 'clamp(3rem,6vw,6rem)', alignItems: 'center' }}>
            <div style={{ maxWidth: 560 }}>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                <Eyebrow color={C.honey}>Practice Management</Eyebrow>
              </motion.div>
              <h1 style={{ fontSize: 'clamp(2.25rem,5vw,4rem)', fontWeight: 700, color: C.text, lineHeight: 1.05, letterSpacing: '-0.028em', margin: 0 }}>
                <motion.span initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                  Turn Advisor Decisions Into <span style={{ color: C.honey }}>Organic Growth</span>
                </motion.span>
              </h1>
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.75 }} style={{ marginTop: 24, fontSize: 18, color: C.body, lineHeight: 1.75, maxWidth: 500 }}>
                Practice management gives firms a more disciplined way to improve advisor performance, protect margins, and grow more profitably by helping advisors make better decisions for their clients, their books, and the enterprise.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.95 }} style={{ marginTop: 36 }}>
                <Link href="/platform/practice-management" className="btn-honey-primary">
                  <span>Explore Practice Management</span>
                </Link>
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%' }}>
                <SonarCanvas />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. STATS BAND */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden' }} aria-label="The cost of unmanaged advisor decision-making">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 300, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.05) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '44px 20px' : 'clamp(2.5rem,4vw,3.5rem) 48px' }}>
          <Reveal>
            <h2 style={{ textAlign: isMobile ? 'left' : 'center', fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', margin: isMobile ? '0 0 20px' : '0 0 40px' }}>
              The Cost of Unmanaged Advisor Decision-Making
            </h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: isMobile ? 12 : 0 }}>
            {[
              {
                node: <span style={{ fontSize: 'clamp(2.4rem,4.5vw,3.4rem)', fontWeight: 800, color: C.honey, lineHeight: 1, letterSpacing: '-0.02em' }}>3 to 5x</span>,
                color: C.honey,
                label: 'More Time Reconciling Data Than Acting On It',
                body: 'Finance teams spend a disproportionate amount of time reconstructing the past instead of improving the future.',
              },
              {
                node: <StatCount value={40} suffix="%" color={C.honey} />,
                color: C.honey,
                label: 'Revenue Exceptions Undetected Until They Escalate',
                body: 'Without unified visibility, anomalies compound quietly until they become client, financial, or compliance problems.',
              },
              {
                node: <StatCount prefix="$" value={370} suffix="M+" color={C.honey} />,
                color: C.honey,
                label: 'Annual Cost To Enterprise Firms From Process Drag',
                body: 'Manual workflows, disconnected systems, and technical debt compound into significant bottom-line impact.',
              },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 90}>
                <div style={{ padding: isMobile ? '1.1rem 0' : '1.5rem 2rem', position: 'relative' }}>
                  {s.node}
                  <div style={{ height: 3, width: 32, borderRadius: 2, backgroundColor: s.color, marginTop: 14 }} aria-hidden="true" />
                  <p style={{ marginTop: 14, fontSize: 15, fontWeight: 700, color: C.text }}>{s.label}</p>
                  <p style={{ marginTop: 6, fontSize: 15, color: C.body, lineHeight: 1.72 }}>{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PROBLEM SPLIT */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="When practice management is disconnected">
        <div aria-hidden="true" style={{ position: 'absolute', top: '10%', right: '0%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,0,110,0.05) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'center' }}>
            <div>
              <Reveal>
                <Eyebrow color={C.honey}>The Problem</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                  When <span style={{ color: C.honey }}>Practice Management Is Disconnected,</span> Growth Becomes Harder to Scale
                </h2>
              </Reveal>
              <Reveal delay={70}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
                  <p style={{ fontSize: 16, color: C.body, lineHeight: 1.75, margin: 0 }}>
                    Most firms have strong advisors, ambitious growth goals, and more data than ever before. The challenge is that those elements are often not connected in a way that helps advisors make better decisions every day.
                  </p>
                  <p style={{ fontSize: 16, color: C.body, lineHeight: 1.75, margin: 0 }}>
                    Pricing decisions happen without a clear understanding of client value. Service models do not reflect profitability or growth potential. Advisors may not know how their book compares to relevant peers. Leaders can see aggregate performance, but struggle to understand which <span style={{ color: C.text, fontWeight: 600 }}>behaviors</span> are driving growth, which <span style={{ color: C.text, fontWeight: 600 }}>relationships</span> are underserved, and which <span style={{ color: C.text, fontWeight: 600 }}>decisions</span> are quietly compounding into margin risk.
                  </p>
                  <p style={{ fontSize: 16, color: C.body, lineHeight: 1.75, margin: 0 }}>
                    The result is a gap between strategy and execution. Firms know where they want to go, but advisors lack the decision support to consistently translate that strategy into profitable action.
                  </p>
                </div>
              </Reveal>
            </div>
            <Reveal delay={100}><PuzzleCanvas /></Reveal>
          </div>
        </div>
      </section>

      {/* 4. PROOF MOMENT */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Where growth actually happens">
        <div aria-hidden="true" style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.07) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1.4fr', gap: sectionGap, alignItems: 'center' }}>
            <Reveal>
              <LargeStatCount value={40} suffix="%" color={C.honey} />
              <p style={{ marginTop: 16, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.18em', color: C.subtle }}>Revenue Exceptions Undetected Until They Escalate</p>
              <div style={{ marginTop: 20, height: 1, width: 64, background: C.border }} aria-hidden="true" />
            </Reveal>
            <Reveal delay={120}>
              <Eyebrow color={C.honey}>Where Growth Happens</Eyebrow>
              <h2 style={{ fontSize: 'clamp(1.6rem,2.8vw,2.2rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.22, margin: 0 }}>
                Every firm-level growth strategy ultimately depends on thousands of advisor-level decisions made every day.
              </h2>
              <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                Which clients receive more attention. Which relationships are priced correctly. Which households have untapped opportunity. Which advisors need coaching. Which service models are sustainable.
              </p>
              <p style={{ marginTop: 14, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                When those decisions are supported by timely, trusted, and relevant insight, firms can improve growth without simply adding more advisors, more headcount, or more operational complexity. Practice management turns advisor behavior into a visible, measurable, and manageable driver of organic growth.
              </p>
              <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: cardCols, gap: 16, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
                {[
                  { value: 'Behavior', label: 'Turned into a measurable driver of organic growth', color: C.honey },
                  { value: 'Decisions', label: 'Supported by timely, trusted, and relevant insight', color: C.honey },
                ].map(s => (
                  <div key={s.label}>
                    <p style={{ fontSize: 'clamp(1.1rem,2vw,1.4rem)', fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
                    <p style={{ marginTop: 4, fontSize: 13, color: C.body, lineHeight: 1.6 }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24 }}>
                <Link href="/platform/practice-management" className="btn-honey-primary">
                  <span>Explore Practice Management</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 5. PUREFACTS APPROACH */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="See the full advisor growth picture">
        <div aria-hidden="true" style={{ position: 'absolute', top: '5%', left: '0%', width: 550, height: 450, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.06) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'center' }}>
            <div>
              <Reveal>
                <Eyebrow color={C.honey}>The PureFacts Approach</Eyebrow>
                <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                  See the Full Advisor Growth Picture, <span style={{ color: C.honey }}>Not Just Isolated Metrics</span>
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                  Advisor performance cannot be understood through production numbers alone. Revenue, pricing, client satisfaction, service intensity, household opportunity, discounting behavior, retention risk, and growth potential all need to be viewed together.
                </p>
              </Reveal>
              <Reveal delay={120}>
                <p style={{ marginTop: 16, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                  A more complete practice management model gives firms a clearer understanding of how advisors are creating value, where margin is being lost, and which decisions can improve outcomes for clients, advisors, and the enterprise. The goal is not to micromanage advisors. It is to give them the intelligence to act with greater <span style={{ color: C.text, fontWeight: 600 }}>Confidence,</span> <span style={{ color: C.text, fontWeight: 600 }}>Consistency,</span> and <span style={{ color: C.text, fontWeight: 600 }}>Commercial Discipline.</span>
                </p>
              </Reveal>
              <Reveal delay={160}>
                <div style={{ marginTop: 28 }}>
                  <Link href="/platform" className="btn-honey-primary">
                    <span>Explore the Platform</span>
                  </Link>
                </div>
              </Reveal>
            </div>
            <Reveal delay={80}>
              <PlatformDiagram />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 6. PRACTICE MANAGEMENT PRODUCT CALLOUT */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Practice Management product capabilities">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.05) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: productGap, alignItems: 'start' }}>
            <Reveal>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.20em', color: C.honey, margin: '0 0 14px' }}>The Solution</p>
              <h2 style={{ fontSize: 'clamp(1.4rem,2.5vw,1.9rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.02em', margin: '0 0 20px', lineHeight: 1.22 }}>
                Practice Management: <span style={{ color: C.honey }}>create the conditions for more profitable growth.</span>
              </h2>
              <p style={{ fontSize: 16, color: C.body, lineHeight: 1.75, margin: '0 0 18px' }}>
                Practice management gives leaders a more disciplined way to understand and improve advisor performance across the firm. It connects strategic growth goals to the behaviors, decisions, and client interactions that determine whether those goals are achieved.
              </p>
              <p style={{ fontSize: 16, color: C.body, lineHeight: 1.75, margin: '0 0 32px' }}>
                For advisors, it creates clarity. For managers, it creates better coaching conversations. For executives, it creates a more scalable way to improve organic growth, protect margins, and increase enterprise value.
              </p>
              <Link href="/platform/practice-management" className="btn-honey-primary">
                <span>Explore Practice Management</span>
              </Link>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: cardCols, gap: 12, gridAutoRows: '1fr' }}>
              {[
                { icon: 'fa-tags',                   title: 'Reduce Excessive Discounting',  body: 'Help advisors price with greater confidence by connecting fee decisions to client value, service levels, and firm-defined pricing guidance.' },
                { icon: 'fa-chart-bar',              title: 'Benchmark Performance',         body: 'Compare advisors, books, households, and client segments against relevant peers to identify where performance is strong, underdeveloped, or underpriced.' },
                { icon: 'fa-face-smile',             title: 'Improve Client Satisfaction',   body: 'Surface opportunities to strengthen client relationships, improve service alignment, and make value more visible to the clients who matter most.' },
                { icon: 'fa-link',                   title: 'Link Value to Pricing',         body: 'Give advisors a clearer way to connect the value they deliver to the fees they charge, improving profitability without reducing the relationship to a pricing conversation.' },
              ].map((card, i) => (
                <Reveal key={card.title} delay={i * 70} style={{ height: '100%' }}>
                  <Link href="/platform/practice-management" className="pm-feature-card" style={{ height: '100%' }}>
                    <i className={`fa-solid ${card.icon}`} style={{ color: C.honey, fontSize: 18, marginBottom: 12 }} aria-hidden="true" />
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: '0 0 8px', lineHeight: 1.3 }}>{card.title}</p>
                    <p style={{ fontSize: 13, color: C.body, lineHeight: 1.65, margin: 0 }}>{card.body}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', padding: sectionPad }} aria-label="Call to action">
        <div aria-hidden="true" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 1000, height: 600, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.06) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
          <div style={{ display: 'grid', gridTemplateColumns: twoCols, gap: sectionGap, alignItems: 'center' }}>
            <div>
              {[
                { icon: 'fa-tags',            color: C.honey,    title: 'Reduce Excessive Discounting',           desc: 'Connect fee decisions to client value and firm-defined pricing guidance so advisors price with greater confidence and consistency across the book.' },
                { icon: 'fa-chart-bar',      color: C.mandarin, title: 'Benchmark Performance That Matters',     desc: 'Compare advisors, books, households, and client segments against relevant peers to surface where performance is strong, underdeveloped, or underpriced.' },
                { icon: 'fa-arrows-to-dot',  color: C.azure,    title: 'From Advisor Activity to Enterprise Growth', desc: 'Connect strategic growth goals to the behaviors and decisions that determine whether those goals are achieved, at every level of the firm.' },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 70}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '18px 0' }}>
                    <div style={{ width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                      <i className={`fa-solid ${item.icon}`} style={{ color: item.color, fontSize: 17 }} aria-hidden="true" />
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1 }}>{item.title}</p>
                      <p style={{ marginTop: 6, fontSize: 15, color: C.body, lineHeight: 1.72, margin: '6px 0 0' }}>{item.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={100}>
              <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.18, margin: 0 }}>
                See What Becomes Possible When <GradientText>Advisors Have the Full Picture.</GradientText>
              </h2>
              <p style={{ marginTop: 18, fontSize: 16, color: C.body, lineHeight: 1.75 }}>
                Better reporting is useful. Better decisions are transformational. PureFacts helps firms turn advisor behavior into a visible, measurable driver of organic growth that protects margin, deepens client relationships, and scales without adding complexity.
              </p>
              <div style={{ marginTop: 30 }}>
                <Link href="/contact" className="btn-primary">Get in Contact</Link>
              </div>
              <p style={{ marginTop: 16, fontSize: 13, color: C.subtle }}>Trusted by the top global financial firms</p>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}