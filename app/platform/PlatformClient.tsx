'use client'

import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity/client'
import { type ClientLogo } from '@/components/sections/LogoCarousel'
import { motion, useInView as useFramerInView } from 'framer-motion'
import PlatformFAQSection from '@/components/faq/PlatformFAQSection'

// ─── Brand tokens ──────────────────────────────────────────────────────────────
const C = {
  bg:       '#140f0c',
  surface:  '#1a1410',
  azure:    '#3b84ff',
  mandarin: '#fb5607',
  text:     '#f4f4f4',
  muted:    'rgba(244,244,244,0.60)',
  subtle:   'rgba(244,244,244,0.35)',
  border:   'rgba(255,255,255,0.07)',
  fees:     '#ED65D0',
  comp:     '#FF006E',
  practice: '#ffb30c',
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

// ─── Faceted gemstone hero canvas — mouse-reactive parallax ───────────────────
function FacetCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    let raf: number

    type Node = { x: number; y: number; bx: number; by: number; vx: number; vy: number; parallaxScale: number; pulse: number }
    let nodes: Node[] = []
    let W = 0, H = 0

    function seed() {
      const count = Math.max(Math.floor((W * H) / 9000), 45)
      nodes = Array.from({ length: count }, () => {
        const bx = Math.random() * W; const by = Math.random() * H
        return { x: bx, y: by, bx, by, vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.12, parallaxScale: 0.4 + Math.random() * 1.6, pulse: Math.random() * Math.PI * 2 }
      })
    }
    function resize() { W = canvas!.width = canvas!.parentElement!.offsetWidth; H = canvas!.height = canvas!.parentElement!.offsetHeight; seed() }
    resize()
    const ro = new ResizeObserver(resize); ro.observe(canvas.parentElement!)
    const parent = canvas.parentElement!
    const onMove = (e: MouseEvent) => { const r = parent.getBoundingClientRect(); targetMouseRef.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height } }
    parent.addEventListener('mousemove', onMove)

    function getTriangles(pts: Node[]) {
      const tris: [Node, Node, Node][] = []
      for (let i = 0; i < pts.length; i++) {
        const dists = pts.map((p, j) => ({ j, d: Math.hypot(p.x - pts[i].x, p.y - pts[i].y) })).filter(d => d.j !== i).sort((a, b) => a.d - b.d).slice(0, 3)
        for (let k = 0; k < dists.length - 1; k++) tris.push([pts[i], pts[dists[k].j], pts[dists[k + 1].j]])
      }
      return tris
    }

    function draw() {
      const sm = mouseRef.current, tm = targetMouseRef.current
      sm.x += (tm.x - sm.x) * 0.04; sm.y += (tm.y - sm.y) * 0.04
      ctx!.clearRect(0, 0, W, H)
      const lx = W * (0.3 + sm.x * 0.4), ly = H * (0.1 + sm.y * 0.5)
      nodes.forEach(n => {
        n.bx += n.vx; n.by += n.vy
        if (n.bx < -80) n.bx = W + 80; if (n.bx > W + 80) n.bx = -80
        if (n.by < -80) n.by = H + 80; if (n.by > H + 80) n.by = -80
        n.x = n.bx + (sm.x - 0.5) * n.parallaxScale * 28
        n.y = n.by + (sm.y - 0.5) * n.parallaxScale * 18
        n.pulse += 0.012 + n.parallaxScale * 0.004
      })
      getTriangles(nodes).forEach(([a, b, c]) => {
        if (Math.max(Math.hypot(a.x-b.x,a.y-b.y), Math.hypot(b.x-c.x,b.y-c.y), Math.hypot(c.x-a.x,c.y-a.y)) > W * 0.2) return
        const cx_ = (a.x+b.x+c.x)/3, cy_ = (a.y+b.y+c.y)/3
        const d = Math.hypot(cx_-lx, cy_-ly) / (W * 0.65)
        ctx!.beginPath(); ctx!.moveTo(a.x,a.y); ctx!.lineTo(b.x,b.y); ctx!.lineTo(c.x,c.y); ctx!.closePath()
        ctx!.fillStyle = `rgba(59,132,255,${Math.max(0, 0.024 - d * 0.018)})`; ctx!.fill()
        ctx!.strokeStyle = `rgba(255,255,255,${Math.max(0, 0.07 - d * 0.05)})`; ctx!.lineWidth = 0.4; ctx!.stroke()
      })
      nodes.forEach(n => {
        const d = Math.hypot(n.x-lx, n.y-ly) / (W * 0.55)
        const p = Math.max(0, 0.7 - d * 0.65) * (0.7 + 0.3 * Math.sin(n.pulse))
        if (p < 0.04) return
        const g = ctx!.createRadialGradient(n.x,n.y,0,n.x,n.y,7); g.addColorStop(0,`rgba(59,132,255,${p*0.28})`); g.addColorStop(1,'rgba(59,132,255,0)')
        ctx!.beginPath(); ctx!.arc(n.x,n.y,7,0,Math.PI*2); ctx!.fillStyle=g; ctx!.fill()
        ctx!.beginPath(); ctx!.arc(n.x,n.y,1.2,0,Math.PI*2); ctx!.fillStyle=`rgba(255,255,255,${p*0.6})`; ctx!.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); ro.disconnect(); parent.removeEventListener('mousemove', onMove) }
  }, [])

  return <canvas ref={ref} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
}

// ─── 1. Hero ──────────────────────────────────────────────────────────────────
function Hero() {
  const { isMobile, isTablet } = useBreakpoint()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 80) }, [])
  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: 'radial-gradient(ellipse 120% 80% at 50% 10%, #1a1e2e 0%, #140f0c 55%)', minHeight: isMobile ? 'auto' : '88vh', display: 'flex', alignItems: 'center' }}>
      <FacetCanvas />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 180, background: `linear-gradient(to bottom, transparent, ${C.bg})`, pointerEvents: 'none', zIndex: 1 }} aria-hidden="true" />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 2, paddingTop: isMobile ? 112 : 160, paddingBottom: isMobile ? 96 : 130 }}>
        <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'center', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
          <div style={{ position: 'relative', height: isMobile ? 36 : 44, width: isMobile ? 196 : 240 }}>
            <Image src="/PureRevenueWhite.svg" alt="PureRevenue" fill style={{ objectFit: 'contain' }} />
          </div>
        </div>
        <h1 style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.028em', color: C.text, maxWidth: 820, margin: '0 auto 24px', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.7s ease 0.08s, transform 0.7s ease 0.08s' }}>
          The platform built to manage your{' '}
          <span style={{ background: SUNSET, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>full revenue lifecycle.</span>
        </h1>
        <p style={{ fontSize: isMobile ? '1rem' : '1.125rem', color: C.muted, lineHeight: 1.75, maxWidth: 600, margin: '0 auto 44px', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.7s ease 0.16s, transform 0.7s ease 0.16s' }}>
          PureRevenue connects fees and billing, advisor compensation, and practice management in one platform, helping wealth and asset management firms increase profitability, improve advisor performance, and drive enterprise value.
        </p>
        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.7s ease 0.24s, transform 0.7s ease 0.24s' }}>
          <Link href="/contact" className="btn-primary">Request a Demo</Link>
        </div>
      </div>
    </section>
  )
}

// ─── 2. The Problem ────────────────────────────────────────────────────────────
const PAIN_CARDS = [
  { icon: 'fa-eye-slash',            title: 'No pricing visibility',  desc: 'Pricing decisions made without visibility into actual client value or peer benchmarks.' },
  { icon: 'fa-triangle-exclamation', title: 'Revenue leakage',        desc: 'Legacy systems and manual overrides introduce errors, missed fees, and reconciliation gaps every cycle.' },
  { icon: 'fa-circle-exclamation',   title: 'Advisor disputes',       desc: 'Compensation friction rises when payout data lives disconnected from billing.' },
  { icon: 'fa-chart-bar',            title: 'No performance signal',  desc: 'No signal on which advisors are discounting, underperforming, or losing wallet share.' },
  { icon: 'fa-magnifying-glass',     title: 'Blind enterprise view',  desc: 'Leaders lack a trusted, firm-wide view of revenue performance when it matters most.' },
]

function TheProblem() {
  const { isMobile, isTablet } = useBreakpoint()
  const { ref, inView } = useInView(0.1)
  const [revealed, setRevealed] = useState<boolean[]>(new Array(PAIN_CARDS.length).fill(false))
  const [dotsLit, setDotsLit] = useState<boolean[]>(new Array(PAIN_CARDS.length - 1).fill(false))
  useEffect(() => {
    if (!inView) return
    PAIN_CARDS.forEach((_, i) => {
      setTimeout(() => {
        setRevealed(prev => { const n = [...prev]; n[i] = true; return n })
        if (i < PAIN_CARDS.length - 1) setTimeout(() => { setDotsLit(prev => { const n = [...prev]; n[i] = true; return n }) }, 160)
      }, 150 + i * 250)
    })
  }, [inView])

  return (
    <section ref={ref as React.RefObject<HTMLElement>} style={{ background: C.bg, padding: isMobile ? '64px 0' : '100px 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.07) 0%, transparent 60%)' }} aria-hidden="true" />
      <div style={{ position: 'absolute', bottom: '-5%', right: '-8%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(251,86,7,0.06) 0%, transparent 60%)' }} aria-hidden="true" />
      <div style={{ position: 'absolute', top: '60%', left: '-6%', width: 400, height: 350, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 60%)' }} aria-hidden="true" />
      <div style={{ position: 'absolute', top: '-8%', right: '10%', width: 420, height: 320, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.05) 0%, transparent 58%)' }} aria-hidden="true" />
      <div style={{ position: 'absolute', bottom: '30%', left: '30%', width: 380, height: 300, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,0,110,0.04) 0%, transparent 58%)' }} aria-hidden="true" />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px' }}>
        {/* Header — top-aligned */}
        <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap: isMobile ? '24px' : isTablet ? '32px' : '80px', marginBottom: isMobile ? 40 : 72, alignItems: 'start' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.75rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.025em', margin: 0, opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
            <span style={{ color: C.text }}>Revenue has always been </span><span style={{ color: C.azure }}>managed in silos.</span>
          </h2>
          <div style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s' }}>
            <p style={{ fontSize: '1rem', color: C.muted, lineHeight: 1.75, margin: '0 0 16px' }}>
              For decades, wealth and asset management firms have managed revenue through disconnected systems. Fees and billing in one place. Advisor compensation in another. Practice management somewhere else entirely.
            </p>
            <p style={{ fontSize: '1rem', color: C.muted, lineHeight: 1.75, margin: 0 }}>
              That fragmentation creates trapped value at every step. Revenue leaks. Margins compress. Advisors question the numbers.
            </p>
          </div>
        </div>

        {/* Error cards */}
        <div style={{ display: isTablet ? 'grid' : 'flex', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', alignItems: 'stretch', gap: isTablet ? 16 : 0 }}>
          {PAIN_CARDS.map((card, i) => (
            <div key={card.title} style={{ display: 'flex', alignItems: 'stretch', flex: 1, minWidth: 0 }}>
              <div style={{ flex: 1, padding: '28px 22px 26px', background: revealed[i] ? 'rgba(251,86,7,0.05)' : 'rgba(255,255,255,0.01)', border: `1px solid ${revealed[i] ? 'rgba(251,86,7,0.22)' : C.border}`, position: 'relative', overflow: 'hidden', opacity: revealed[i] ? 1 : 0, transform: revealed[i] ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.5s ease, transform 0.5s ease, background 0.3s, border-color 0.3s', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }} aria-hidden="true">
                  <i className={`fa-solid ${card.icon}`} style={{ color: 'rgba(251,86,7,0.7)', fontSize: 16 }} aria-hidden="true" />
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>{card.title}</div>
                <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.65, margin: 0, flex: 1 }}>{card.desc}</p>
              </div>
              {!isTablet && i < PAIN_CARDS.length - 1 && (
                <div style={{ width: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, flexDirection: 'column' }}>
                  {Array.from({ length: 3 }).map((_, di) => (
                    <div key={di} style={{ width: 3, height: 3, borderRadius: '50%', background: dotsLit[i] ? 'rgba(251,86,7,0.5)' : 'rgba(255,255,255,0.08)', opacity: dotsLit[i] ? 1 : 0.3, transform: dotsLit[i] ? 'scale(1)' : 'scale(0.5)', transition: `all 0.3s ease ${di * 0.08}s` }} aria-hidden="true" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── 3. Platform Section ──────────────────────────────────────────────────────
const LEFT_NODES = [
  { label: 'Custodians',           sub: 'Holdings & transactions'  },
  { label: 'Portfolio Management', sub: 'AUM, accounts, positions' },
  { label: 'CRM',                  sub: 'Client & advisor data'    },
  { label: 'Trading Platform',     sub: 'Order & execution data'   },
]
const RIGHT_NODES = [
  { label: 'Accounting Systems',   sub: 'GL, reconciliation'       },
  { label: 'Billing Systems',      sub: 'Invoicing & collections'  },
  { label: 'Compensation Systems', sub: 'Payout structures'        },
  { label: 'Customer Data Lakes',  sub: 'Enterprise data sources'  },
]

function FoundationVisual({ visible }: { visible: boolean }) {
  const { isMobile, isTablet } = useBreakpoint()
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 600, h: 420 })
  useEffect(() => {
    const el = containerRef.current; if (!el) return
    const ro = new ResizeObserver(e => setSize({ w: e[0].contentRect.width, h: e[0].contentRect.height }))
    ro.observe(el); return () => ro.disconnect()
  }, [])
  const { w } = size
  const NODE_W = isMobile ? 112 : isTablet ? 136 : 162, NODE_H = isMobile ? 40 : 44, LEFT_X = isMobile ? 8 : 24, RIGHT_X = w - (isMobile ? 8 : 24) - NODE_W
  const NODE_TOPS = isMobile ? [64, 128, 192, 256] : [88, 160, 232, 304], HUB_R = isMobile ? 46 : 62
  const cx = w / 2, cy = (NODE_TOPS[0] + NODE_TOPS[3] + NODE_H) / 2
  const leftConns  = NODE_TOPS.map(top => ({ fromX: LEFT_X + NODE_W, fromY: top + NODE_H / 2 }))
  const rightConns = NODE_TOPS.map(top => ({ fromX: RIGHT_X, fromY: top + NODE_H / 2 }))
  function hubEntry(fromX: number, fromY: number) { const dx = cx-fromX, dy = cy-fromY, dist = Math.sqrt(dx*dx+dy*dy); return { x: cx-(dx/dist)*HUB_R, y: cy-(dy/dist)*HUB_R } }
  function nodePath(fromX: number, fromY: number) { const e = hubEntry(fromX, fromY), midX = (fromX+cx)/2; return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${e.y}, ${e.x} ${e.y}` }
  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: cx-HUB_R*2.2, top: cy-HUB_R*2.2, width: HUB_R*4.4, height: HUB_R*4.4, borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(59,132,255,0.12) 0%, transparent 70%)' }} aria-hidden="true" />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} aria-hidden="true">
        {leftConns.map((c, i) => (<motion.path key={`l${i}`} d={nodePath(c.fromX,c.fromY)} fill="none" stroke={C.azure} strokeWidth="1" strokeOpacity="0.3" initial={{ pathLength:0, opacity:0 }} animate={visible?{pathLength:1,opacity:1}:{pathLength:0,opacity:0}} transition={{ duration:0.6, delay:0.4+i*0.1, ease:'easeOut' }} />))}
        {rightConns.map((c, i) => (<motion.path key={`r${i}`} d={nodePath(c.fromX,c.fromY)} fill="none" stroke={C.azure} strokeWidth="1" strokeOpacity="0.3" initial={{ pathLength:0, opacity:0 }} animate={visible?{pathLength:1,opacity:1}:{pathLength:0,opacity:0}} transition={{ duration:0.6, delay:0.5+i*0.1, ease:'easeOut' }} />))}
        {visible && leftConns.map((c, i) => (<motion.circle key={`lp${i}`} r="2.5" fill={C.azure} opacity="0.8"><animateMotion dur={`${1.6+i*0.25}s`} repeatCount="indefinite" begin={`${i*0.45}s`} path={nodePath(c.fromX,c.fromY)} /></motion.circle>))}
        {visible && rightConns.map((c, i) => (<motion.circle key={`rp${i}`} r="2.5" fill={C.azure} opacity="0.8"><animateMotion dur={`${1.6+i*0.25}s`} repeatCount="indefinite" begin={`${i*0.45+0.3}s`} path={nodePath(c.fromX,c.fromY)} /></motion.circle>))}
        <circle cx={cx} cy={cy} r={HUB_R} fill="none" stroke="rgba(59,132,255,0.18)" strokeWidth="1.5" />
      </svg>
      {LEFT_NODES.map((node, i) => (<motion.div key={node.label} initial={{ opacity:0, x:-16 }} animate={visible?{opacity:1,x:0}:{opacity:0,x:-16}} transition={{ duration:0.45, delay:i*0.09, ease:[0.16,1,0.3,1] }} style={{ position:'absolute', left:LEFT_X, top:NODE_TOPS[i], width:NODE_W, height:NODE_H, background:C.surface, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:isMobile ? 10 : 12, fontWeight:600, color:C.text, textAlign:'center', padding:'0 8px' }}>{node.label}</span></motion.div>))}
      {RIGHT_NODES.map((node, i) => (<motion.div key={node.label} initial={{ opacity:0, x:16 }} animate={visible?{opacity:1,x:0}:{opacity:0,x:16}} transition={{ duration:0.45, delay:0.12+i*0.09, ease:[0.16,1,0.3,1] }} style={{ position:'absolute', left:RIGHT_X, top:NODE_TOPS[i], width:NODE_W, height:NODE_H, background:C.surface, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:isMobile ? 10 : 12, fontWeight:600, color:C.text, textAlign:'center', padding:'0 8px' }}>{node.label}</span></motion.div>))}
      <motion.div initial={{ scale:0.7, opacity:0 }} animate={visible?{scale:1,opacity:1}:{scale:0.7,opacity:0}} transition={{ duration:0.6, delay:0.2, ease:[0.16,1,0.3,1] }} style={{ position:'absolute', left:cx-HUB_R, top:cy-HUB_R, width:HUB_R*2, height:HUB_R*2, borderRadius:'50%', border:'1.5px solid rgba(59,132,255,0.45)', background:'radial-gradient(circle at 40% 35%, rgba(59,132,255,0.18), rgba(59,132,255,0.05))', backdropFilter:'blur(12px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:5 }}>
        <span style={{ fontSize:isMobile ? 10 : 12, fontWeight:600, color:C.text, lineHeight:1.35, textAlign:'center', padding:'0 10px' }}>Revenue Book<br />of Record</span>
      </motion.div>
    </div>
  )
}

const DIAGRAM_WEDGES = [
  {
    id: 'practice',
    label: 'Practice Management',
    startAngle: -60, endAngle: 60,
    fill: 'none', stroke: '#ffb30c',
    faUnicode: '\uf201',
  },
  {
    id: 'comp',
    label: 'Compensation',
    startAngle: 60, endAngle: 180,
    fill: 'none', stroke: '#FF006E',
    faUnicode: '\uf51e',
  },
  {
    id: 'fees',
    label: 'Fees & Billing',
    startAngle: 180, endAngle: 300,
    fill: 'none', stroke: '#ED65D0',
    faUnicode: '\uf571',
  },
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

function PlatformDiagram({ visible }: { visible: boolean }) {
  const { isMobile } = useBreakpoint()
  const VB = 200
  const CX = 100, CY = 100
  const INNER = 43
  const OUTER = 84
  const WEDGE_INNER = INNER + 2
  const LABEL_R = OUTER + 18
  const HUB_R = INNER

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: isMobile ? 260 : 360, overflow: 'visible', padding: isMobile ? '20px 24px' : 0 }}>
      {/* Ambient glow behind diagram */}
      <div style={{
        position: 'absolute',
        width: 'min(260px, 70%)', aspectRatio: '1',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,132,255,0.13) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', width: isMobile ? 'min(190px, 62vw)' : 'min(312px, 82%)', aspectRatio: '1' }}>
        <svg viewBox={`0 0 ${VB} ${VB}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <radialGradient id="hub-grad-ic" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="rgba(59,132,255,0.20)" />
              <stop offset="100%" stopColor="rgba(59,132,255,0.05)" />
            </radialGradient>
          </defs>

          {DIAGRAM_WEDGES.map((w, wi) => {
            const path = diagramWedgePath(CX, CY, OUTER, WEDGE_INNER, w.startAngle, w.endAngle)
            const mid  = (w.startAngle + w.endAngle) / 2
            const iconPt  = diagramPolarToXY(CX, CY, (OUTER + WEDGE_INNER) / 2, mid)
            const labelPt = diagramPolarToXY(CX, CY, LABEL_R, mid)
            const textAnchor = labelPt.x < CX - 5 ? 'end' : labelPt.x > CX + 5 ? 'start' : 'middle'
            const words = w.label.split(' ')
            const half = Math.ceil(words.length / 2)

            return (
              <g key={w.id}>
                {/* Wedge shape */}
                <motion.path
                  d={path}
                  fill={w.fill} stroke={w.stroke} strokeWidth="1.5"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.88 }}
                  style={{ transformOrigin: `${CX}px ${CY}px` }}
                  transition={{ duration: 0.55, delay: visible ? wi * 0.18 : 0, ease: [0.16, 1, 0.3, 1] }}
                />
                {/* FA icon inside wedge — using Unicode glyph */}
                <motion.text
                  x={iconPt.x} y={iconPt.y}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="13" fontWeight="900"
                  fontFamily="'Font Awesome 6 Free', 'Font Awesome 6 Pro', 'Font Awesome 5 Free'"
                  fill={w.stroke}
                  initial={{ opacity: 0 }}
                  animate={visible ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.4, delay: visible ? wi * 0.18 + 0.18 : 0 }}
                >
                  {w.faUnicode}
                </motion.text>
                {/* Label outside wedge */}
                <motion.text
                  x={labelPt.x} y={labelPt.y}
                  textAnchor={textAnchor} dominantBaseline="middle"
                  fontSize="8.5" fontWeight="700" fill={w.stroke}
                  style={{ letterSpacing: '0.02em' }}
                  initial={{ opacity: 0 }}
                  animate={visible ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.4, delay: visible ? wi * 0.18 + 0.30 : 0 }}
                >
                  {words.length > 1 ? (
                    <>
                      <tspan x={labelPt.x} dy="-0.6em">{words.slice(0, half).join(' ')}</tspan>
                      <tspan x={labelPt.x} dy="1.3em">{words.slice(half).join(' ')}</tspan>
                    </>
                  ) : w.label}
                </motion.text>
              </g>
            )
          })}

          {/* Hub background wipe */}
          <circle cx={CX} cy={CY} r={HUB_R + 2} fill="#140f0c" />
          <circle cx={CX} cy={CY} r={HUB_R} fill="none" stroke="rgba(59,132,255,0.18)" strokeWidth="1.5" />

          {/* Hub fill */}
          <motion.circle
            cx={CX} cy={CY} r={HUB_R}
            fill="url(#hub-grad-ic)"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={visible ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          />

          {/* Hub border ring */}
          <circle cx={CX} cy={CY} r={HUB_R} fill="none" stroke="rgba(59,132,255,0.45)" strokeWidth="1.5" />

          {/* Hub label */}
          <motion.text
            x={CX} y={CY}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fontWeight="600" fill="#f4f4f4"
            style={{ letterSpacing: '0.02em' }}
            initial={{ opacity: 0 }}
            animate={visible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.38 }}
          >
            <tspan x={CX} dy="-5">Revenue Book</tspan>
            <tspan x={CX} dy="11">of Record</tspan>
          </motion.text>
        </svg>
      </div>
    </div>
  )
}

const MODULES = [
  { id:'fees',     name:'Fees & Billing',     tagline:'Fee Management',        color:C.fees,     colorMuted:'rgba(237,101,208,0.09)', border:'rgba(237,101,208,0.28)', href:'/platform/fees-and-billing',            points:['Complex fee schedule management','Automated billing runs at scale','Zero tolerance for calculation errors'],                            stat:{ value:'$3B+',     label:'fees calculated annually' } },
  { id:'comp',     name:'Compensation',       tagline:'Advisor Compensation',  color:C.comp,     colorMuted:'rgba(255,0,110,0.09)',   border:'rgba(255,0,110,0.28)',   href:'/platform/compensation',         points:['Sophisticated payout structures','Incentive and governance controls','Transparency that builds advisor trust'],                           stat:{ value:'100%',     label:'payout accuracy' } },
  { id:'practice', name:'Practice Management',tagline:'Revenue Intelligence',  color:C.practice, colorMuted:'rgba(255,179,12,0.09)',  border:'rgba(255,179,12,0.28)',  href:'/platform/practice-management', points:['Pricing gap identification at scale','AI-native next-best advisor actions','Connected to Revenue Book of Record'], stat:{ value:'Real-time', label:'pricing intelligence' } },
]

function ModuleCard({ mod, index, visible, isMobile }: { mod: typeof MODULES[0]; index: number; visible: boolean; isMobile: boolean }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div initial={{ opacity:0, y:24 }} animate={visible?{opacity:1,y:0}:{opacity:0,y:24}} transition={{ duration:0.55, delay:index*0.12, ease:[0.16,1,0.3,1] }} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{ flex:1, padding:isMobile ? '22px 20px 20px' : '28px 28px 24px', border:`1px solid ${hovered?mod.border:mod.border}`, background:hovered?mod.colorMuted:C.surface, borderRadius:12, display:'flex', flexDirection:'column', transition:'border-color 0.2s, background 0.2s', position:'relative', overflow:'hidden' }}>
      <div style={{ marginBottom:isMobile ? 16 : 20 }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:mod.color, marginBottom:5 }}>{mod.tagline}</div>
        <div style={{ fontSize:isMobile ? 20 : 22, fontWeight:700, color:C.text, letterSpacing:'-0.02em' }}>{mod.name}</div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:9, flex:1 }}>
        {mod.points.map((pt,i) => (<div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}><div style={{ width:5, height:5, borderRadius:'50%', background:mod.color, flexShrink:0 }} aria-hidden="true" /><span style={{ fontSize:isMobile ? 13.5 : 14.5, color:C.muted, lineHeight:1.6 }}>{pt}</span></div>))}
      </div>
      <div style={{ marginTop:isMobile ? 20 : 22, paddingTop:isMobile ? 16 : 18, borderTop:`1px solid ${C.border}`, display:'flex', alignItems:'baseline', gap:6 }}>
        <span style={{ fontSize:isMobile ? 20 : 26, fontWeight:700, color:mod.color, letterSpacing:'-0.03em', lineHeight:1 }}>{mod.stat.value}</span>
        <span style={{ fontSize:13, color:C.muted }}>{mod.stat.label}</span>
      </div>
      <Link href={mod.href} style={{ marginTop:14, display:'inline-flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, color:mod.color, textDecoration:'none', opacity:hovered?1:0.7, transition:'opacity 0.2s' }}>
        Explore {mod.name}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 6h7M6.5 3l3 3-3 3" stroke={mod.color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </Link>
    </motion.div>
  )
}

function PlatformSection() {
  const { isMobile, isTablet } = useBreakpoint()
  const sectionPad = isMobile ? '64px 0' : '100px 0'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const textPad = isMobile ? '32px 20px' : isTablet ? '40px 28px' : '52px 48px'
  const rowCols = isTablet ? '1fr' : '1fr 1fr'
  const rowVisualMinHeight = isMobile ? 260 : 420
  const row0Ref = useRef<HTMLDivElement>(null)
  const row1Ref = useRef<HTMLDivElement>(null)
  const row2Ref = useRef<HTMLDivElement>(null)
  const row0Visible = useFramerInView(row0Ref, { once: true, margin: '-80px 0px -80px 0px' })
  const row1Visible = useFramerInView(row1Ref, { once: true, margin: '-80px 0px -80px 0px' })
  const row2Visible = useFramerInView(row2Ref, { once: true, margin: '-80px 0px -80px 0px' })

  return (
    <section style={{ background: C.bg, padding: sectionPad, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-5%', left: '-8%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(237,101,208,0.07) 0%, transparent 55%)' }} aria-hidden="true" />
      <div style={{ position: 'absolute', bottom: '5%', right: '-6%', width: 600, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.06) 0%, transparent 55%)' }} aria-hidden="true" />
      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 60%)' }} aria-hidden="true" />
      <div style={{ position: 'absolute', top: '15%', right: '15%', width: 400, height: 320, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,0,110,0.04) 0%, transparent 58%)' }} aria-hidden="true" />
      <div style={{ position: 'absolute', bottom: '-5%', left: '25%', width: 500, height: 350, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.06) 0%, transparent 60%)' }} aria-hidden="true" />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>

        {/* Section heading */}
        <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5 }} style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize:'clamp(2rem, 4vw, 3rem)', fontWeight:700, color:C.text, lineHeight:1.12, letterSpacing:'-0.03em', margin:0, maxWidth:640 }}>
            One platform.<br /><span style={{ color:C.azure }}>To fuel your revenue growth.</span>
          </h2>
        </motion.div>

        {/* Row 0: The Platform (first — wedge diagram) */}
        <div ref={row0Ref} style={{ display:'grid', gridTemplateColumns:rowCols, marginBottom:2, overflow:'hidden', border:`1px solid ${C.border}` }}>
          <div style={{ padding:textPad, background:C.surface, display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <motion.div initial={{ opacity:0, y:16 }} animate={row0Visible?{opacity:1,y:0}:{}} transition={{ duration:0.5 }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:C.azure, marginBottom:14 }}>The Platform</div>
              <h3 style={{ fontSize:'clamp(1.4rem, 2.5vw, 1.9rem)', fontWeight:700, color:C.text, lineHeight:1.2, letterSpacing:'-0.025em', margin:'0 0 16px' }}>One operating system for revenue.</h3>
              <p style={{ fontSize:15, color:C.muted, lineHeight:1.7, margin:'0 0 28px', maxWidth:400 }}>
                Fees and Billing, Compensation, and Practice Management sit on top of the Revenue Book of Record, each pulling from the same data. No reconciliation gaps. One consistent view of revenue performance across the full firm.
              </p>
              <Link href="/contact" className="btn-primary" style={{ maxWidth: 160 }}>Request a Demo</Link>
            </motion.div>
          </div>
          <div style={{ background:C.bg, minHeight:rowVisualMinHeight, display:'flex', alignItems:'center', justifyContent:'center', borderLeft:isTablet ? 'none' : `1px solid ${C.border}`, borderTop:isTablet ? `1px solid ${C.border}` : 'none', overflow:'visible' }}>
            <PlatformDiagram visible={row0Visible} />
          </div>
        </div>

        {/* Row 1: Modules */}
        <div ref={row1Ref} style={{ border:`1px solid ${C.border}`, borderTop:'none', overflow:'hidden', background:C.bg }}>
          <div style={{ padding:isMobile ? '28px 16px 0' : isTablet ? '40px 28px 0' : '40px 48px 0' }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:C.azure, marginBottom:10 }}>The Modules</div>
            <h3 style={{ fontSize:'clamp(1.3rem, 2.2vw, 1.75rem)', fontWeight:700, color:C.text, lineHeight:1.2, letterSpacing:'-0.025em', margin:0 }}>Built for every dimension of revenue.</h3>
          </div>
          <div style={{ display:isTablet ? 'grid' : 'flex', gridTemplateColumns:isMobile ? '1fr' : 'repeat(3, 1fr)', gap:16, padding:isMobile ? '20px 14px 28px' : isTablet ? '28px' : '32px 48px 40px', flexWrap:'wrap' }}>
            {MODULES.map((mod,i) => <ModuleCard key={mod.id} mod={mod} index={i} visible={row1Visible} isMobile={isMobile} />)}
          </div>
        </div>

        {/* Row 2: The Foundation (last — hub diagram) */}
        <div ref={row2Ref} style={{ display:'grid', gridTemplateColumns:rowCols, marginTop:2, overflow:'hidden', border:`1px solid ${C.border}`, borderTop:'none' }}>
          <div style={{ padding:textPad, background:C.surface, display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <motion.div initial={{ opacity:0, y:16 }} animate={row2Visible?{opacity:1,y:0}:{}} transition={{ duration:0.5 }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:C.azure, marginBottom:14 }}>The Foundation</div>
              <h3 style={{ fontSize:'clamp(1.4rem, 2.5vw, 1.9rem)', fontWeight:700, color:C.text, lineHeight:1.2, letterSpacing:'-0.025em', margin:'0 0 16px' }}>Revenue data, unified into one source of truth.</h3>
              <p style={{ fontSize:15, color:C.muted, lineHeight:1.7, margin:'0 0 28px', maxWidth:400 }}>
                The Revenue Book of Record consolidates every client, account, contract, and pricing rule across the firm. Every downstream calculation, billing run, and payout flows from one authoritative, always-current foundation.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
                {['Custodians, CRM, and portfolio data connected','Contracts and pricing logic centralized','Audit-ready at every stage'].map((pt,i) => (
                  <motion.div key={i} initial={{ opacity:0, x:-8 }} animate={row2Visible?{opacity:1,x:0}:{}} transition={{ duration:0.4, delay:0.3+i*0.1 }} style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:5, height:5, borderRadius:'50%', background:C.azure, flexShrink:0 }} aria-hidden="true" />
                    <span style={{ fontSize:13.5, color:C.muted }}>{pt}</span>
                  </motion.div>
                ))}
              </div>
              <Link href="/platform/revenue-book-of-record" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, fontWeight:700, color:C.azure, textDecoration:'none' }}>
                Learn about the Revenue Book of Record
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 6h7M6.5 3l3 3-3 3" stroke={C.azure} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            </motion.div>
          </div>
          {!isMobile && (
            <div style={{ background:C.bg, minHeight:rowVisualMinHeight, display:'flex', alignItems:'stretch', borderLeft:isTablet ? 'none' : `1px solid ${C.border}`, borderTop:isTablet ? `1px solid ${C.border}` : 'none' }}>
              <FoundationVisual visible={row2Visible} />
            </div>
          )}
        </div>

      </div>
    </section>
  )
}

// ─── 4. Point solutions vs Platform ───────────────────────────────────────────
function WhyPlatform() {
  const { isMobile, isTablet } = useBreakpoint()
  const { ref, inView } = useInView()
  const sectionPad = isMobile ? '64px 0' : '100px 0'
  const innerPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px'
  const ROWS = [
    { topic: 'Data foundation',    point: 'Isolated per tool, manual reconciliation required',        platform: 'Single Revenue Book of Record, all modules share one truth'  },
    { topic: 'Revenue visibility', point: 'Partial view inside each workflow only',                   platform: 'Full lifecycle visibility from pricing to payout'            },
    { topic: 'AI intelligence',    point: 'No cross-system signals or pattern detection',             platform: 'AI-native insights across fees, compensation, and practice'  },
    { topic: 'Advisor actions',    point: 'Advisors work without revenue context',                    platform: 'Next-best actions delivered directly into the workflow'      },
    { topic: 'Compounding value',  point: 'Improvements stay isolated within each system',           platform: 'Performance improvements compound across the full business'  },
  ]
  return (
    <section ref={ref as React.RefObject<HTMLElement>} style={{ background: C.bg, padding: sectionPad, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position:'absolute', top:'20%', left:'-6%', width:600, height:500, pointerEvents:'none', background:'radial-gradient(ellipse, rgba(59,132,255,0.07) 0%, transparent 58%)' }} aria-hidden="true" />
      <div style={{ position:'absolute', bottom:'10%', right:'-6%', width:550, height:450, pointerEvents:'none', background:'radial-gradient(ellipse, rgba(255,0,110,0.05) 0%, transparent 58%)' }} aria-hidden="true" />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: innerPad }}>
        <div style={{ marginBottom: isMobile ? 36 : 52, opacity: inView?1:0, transform: inView?'translateY(0)':'translateY(16px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
          <h2 style={{ fontSize:'clamp(1.8rem, 3vw, 2.6rem)', fontWeight:700, lineHeight:1.12, letterSpacing:'-0.025em', color:C.text, maxWidth:640, marginBottom:16 }}>
            Point solutions solve tasks.<br />
            <span style={{ color: C.azure }}>Platforms improve performance.</span>
          </h2>
          <p style={{ fontSize:'1rem', color:C.muted, lineHeight:1.75, maxWidth:600 }}>
            A fee billing tool can calculate fees. A compensation tool can process payouts. Revenue Performance Management requires a connected platform that shows how revenue moves through the business, where value is created, and how it can be improved.
          </p>
        </div>

        {isTablet ? (
          <div style={{ display:'grid', gridTemplateColumns:isMobile ? '1fr' : 'repeat(2, 1fr)', gap:16, opacity:inView?1:0, transition:'opacity 0.6s ease 0.2s' }}>
            {ROWS.map((row, i) => (
              <div key={row.topic} style={{ border:`1px solid ${C.border}`, background:C.surface, padding:isMobile ? 20 : 24, opacity:inView?1:0, transition:`opacity 0.4s ease ${0.3+i*0.07}s` }}>
                <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:16 }}>{row.topic}</div>
                <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:12 }}>
                  <i className="fa-solid fa-xmark" style={{ color:C.mandarin, fontSize:14, marginTop:3, flexShrink:0 }} aria-hidden="true" />
                  <span style={{ fontSize:14, color:'rgba(244,244,244,0.65)', lineHeight:1.55 }}>{row.point}</span>
                </div>
                <div style={{ display:'flex', alignItems:'flex-start', gap:10, paddingTop:12, borderTop:`1px solid ${C.border}` }}>
                  <i className="fa-solid fa-check" style={{ color:C.azure, fontSize:14, marginTop:3, flexShrink:0 }} aria-hidden="true" />
                  <span style={{ fontSize:14, color:C.text, lineHeight:1.55, fontWeight:500 }}>{row.platform}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ border:`2px solid ${C.border}`, overflow:'hidden', opacity:inView?1:0, transition:'opacity 0.6s ease 0.2s' }}>
            <div style={{ display:'grid', gridTemplateColumns:'220px 1fr 1fr' }}>
              <div style={{ padding:'20px 28px', background:C.surface }} />
              <div style={{ padding:'20px 28px', background:C.surface, borderLeft:`1px solid ${C.border}`, textAlign:'center' }}>
                <span style={{ fontSize:18, fontWeight:700, color:'rgba(244,244,244,0.65)', textTransform:'uppercase', letterSpacing:'0.10em' }}>Point Solutions</span>
              </div>
              <div style={{ padding:'20px 28px', background:'rgba(59,132,255,0.07)', borderLeft:`2px solid ${C.azure}`, borderRight:`2px solid ${C.azure}`, borderTop:`2px solid ${C.azure}`, textAlign:'center' }}>
                <span style={{ fontSize:18, fontWeight:700, color:C.azure, textTransform:'uppercase', letterSpacing:'0.10em' }}>PureRevenue Platform</span>
              </div>
            </div>
            {ROWS.map((row, i) => (
              <div key={row.topic} style={{ display:'grid', gridTemplateColumns:'220px 1fr 1fr', borderTop:`1px solid ${C.border}`, opacity:inView?1:0, transition:`opacity 0.4s ease ${0.3+i*0.07}s` }}>
                <div style={{ padding:'22px 28px', background:C.surface, display:'flex', alignItems:'center' }}>
                  <span style={{ fontSize:16, fontWeight:700, color:C.text }}>{row.topic}</span>
                </div>
                <div style={{ padding:'22px 28px', background:C.bg, borderLeft:`1px solid ${C.border}`, display:'flex', alignItems:'flex-start', gap:12 }}>
                  <i className="fa-solid fa-xmark" style={{ color:C.mandarin, fontSize:14, marginTop:3, flexShrink:0 }} aria-hidden="true" />
                  <span style={{ fontSize:16, color:'rgba(244,244,244,0.65)', lineHeight:1.55 }}>{row.point}</span>
                </div>
                <div style={{ padding:'22px 28px', background:'rgba(59,132,255,0.06)', borderLeft:`2px solid ${C.azure}`, borderRight:`2px solid ${C.azure}`, display:'flex', alignItems:'flex-start', gap:12 }}>
                  <i className="fa-solid fa-check" style={{ color:C.azure, fontSize:14, marginTop:3, flexShrink:0 }} aria-hidden="true" />
                  <span style={{ fontSize:16, color:C.text, lineHeight:1.55, fontWeight:500 }}>{row.platform}</span>
                </div>
              </div>
            ))}
            <div style={{ display:'grid', gridTemplateColumns:'220px 1fr 1fr', borderTop:`1px solid ${C.border}` }}>
              <div style={{ background:C.surface, height:4 }} />
              <div style={{ background:C.bg, height:4, borderLeft:`1px solid ${C.border}` }} />
              <div style={{ background:'rgba(59,132,255,0.06)', height:4, borderLeft:`2px solid ${C.azure}`, borderRight:`2px solid ${C.azure}`, borderBottom:`2px solid ${C.azure}` }} />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// ─── 5. Outcomes ──────────────────────────────────────────────────────────────
function Outcomes() {
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

// ─── 6. Proof Band — matches homepage ProofBand exactly ───────────────────────
const PROOF_STATS = [
  { value:'$15T+', label:'Assets Under Administration' },
  { value:'$3B+',  label:'Fees Calculated Annually'    },
  { value:'200M+', label:'Automated Actions Per Year'  },
]

function LogoCard({ logo, onPause, onResume }: { logo: ClientLogo; onPause: () => void; onResume: () => void }) {
  return (
    <div
      className="relative flex flex-col items-center justify-center bg-[#f4f4f4] p-6 w-full aspect-square overflow-hidden rounded-[10px]"
      onMouseEnter={onPause} onMouseLeave={onResume}
    >
      <div className="relative w-full h-16">
        <Image src={urlFor(logo.logo).width(480).height(192).url()} alt={logo.name} fill className="object-contain" draggable={false} sizes="220px" />
      </div>
      {logo.caseStudyUrl ? (
        <div className="absolute bottom-4 inset-x-0 flex justify-center">
          {logo.caseStudyUrl.startsWith('http') ? (
            <a href={logo.caseStudyUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 whitespace-nowrap" onClick={e => e.stopPropagation()}>Case study →</a>
          ) : (
            <Link href={logo.caseStudyUrl} className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 whitespace-nowrap" onClick={e => e.stopPropagation()}>Case study →</Link>
          )}
        </div>
      ) : <div className="absolute bottom-4 h-5" />}
    </div>
  )
}

function LogoColumn({ logos, direction }: { logos: ClientLogo[]; direction: 'up' | 'down' }) {
  const innerRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0); const rafRef = useRef<number>(0); const pausedRef = useRef(false)
  useEffect(() => {
    const inner = innerRef.current; if (!inner) return
    const getH = () => inner.scrollHeight / 2
    offsetRef.current = direction === 'down' ? -getH() : 0
    inner.style.transform = `translateY(${offsetRef.current}px)`
    const tick = () => {
      const h = getH(); if (h === 0) { rafRef.current = requestAnimationFrame(tick); return }
      if (!pausedRef.current) {
        if (direction === 'up') { offsetRef.current -= 0.8; if (offsetRef.current <= -h) offsetRef.current += h }
        else { offsetRef.current += 0.8; if (offsetRef.current >= 0) offsetRef.current -= h }
        inner.style.transform = `translateY(${offsetRef.current}px)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [direction, logos.length])
  const items = [...logos, ...logos]
  return (
    <div className="relative overflow-hidden h-[520px]">
      <div ref={innerRef} className="flex flex-col gap-3 will-change-transform">
        {items.map((logo, i) => <LogoCard key={`${logo._id}-${i}`} logo={logo} onPause={() => { pausedRef.current = true }} onResume={() => { pausedRef.current = false }} />)}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 z-10" style={{ background: `linear-gradient(to bottom, ${C.bg}, transparent)` }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 z-10" style={{ background: `linear-gradient(to top, ${C.bg}, transparent)` }} />
    </div>
  )
}

function MobileLogoCarousel({ logos }: { logos: ClientLogo[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const xRef = useRef(0)
  const rafRef = useRef<number>(0)
  const pausedRef = useRef(false)
  const draggingRef = useRef(false)
  const lastClientXRef = useRef(0)
  const SPEED = 0.55
  const items = [...logos, ...logos, ...logos]

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const getSetWidth = () => track.scrollWidth / 3
    const normalize = () => {
      const setW = getSetWidth()
      if (!setW) return
      if (xRef.current <= -setW) xRef.current += setW
      if (xRef.current > 0) xRef.current -= setW
    }

    const tick = () => {
      if (!pausedRef.current && !draggingRef.current) {
        xRef.current -= SPEED
        normalize()
        track.style.transform = `translateX(${xRef.current}px)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [logos.length])

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true
    pausedRef.current = true
    lastClientXRef.current = e.clientX
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current
    if (!draggingRef.current || !track) return

    const dx = e.clientX - lastClientXRef.current
    lastClientXRef.current = e.clientX
    xRef.current += dx

    const setW = track.scrollWidth / 3
    if (setW) {
      if (xRef.current <= -setW) xRef.current += setW
      if (xRef.current > 0) xRef.current -= setW
    }

    track.style.transform = `translateX(${xRef.current}px)`
  }

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false
    pausedRef.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  return (
    <div
      className="relative overflow-hidden"
      style={{ touchAction: 'pan-y', cursor: 'grab' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { if (!draggingRef.current) pausedRef.current = false }}
    >
      <div ref={trackRef} className="flex gap-3 will-change-transform">
        {items.map((logo, i) => (
          <div key={`${logo._id}-${i}`} className="shrink-0" style={{ width: 'min(44vw, 168px)' }}>
            <LogoCard
              logo={logo}
              onPause={() => { pausedRef.current = true }}
              onResume={() => { if (!draggingRef.current) pausedRef.current = false }}
            />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 z-10" style={{ background: `linear-gradient(to right, ${C.bg}, transparent)` }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 z-10" style={{ background: `linear-gradient(to left, ${C.bg}, transparent)` }} />
    </div>
  )
}

function ProofBand({ logos }: { logos: ClientLogo[] }) {
  const { isMobile, isTablet } = useBreakpoint()
  const { ref, inView } = useInView(0.05)
  const col1 = logos.filter((_,i) => i%3===0), col2 = logos.filter((_,i) => i%3===1), col3 = logos.filter((_,i) => i%3===2)
  const pad = (arr: ClientLogo[]) => { let out=[...arr]; while(out.length<4) out=[...out,...(arr.length?arr:logos)]; return out }

  return (
    <section ref={ref as React.RefObject<HTMLElement>} style={{ background:C.bg, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'20%', left:'50%', transform:'translateX(-50%)', width:800, height:500, pointerEvents:'none', background:'radial-gradient(ellipse, rgba(59,132,255,0.07) 0%, transparent 60%)' }} aria-hidden="true" />
      <div style={{ position:'absolute', top:'-5%', right:'-6%', width:500, height:400, pointerEvents:'none', background:'radial-gradient(ellipse, rgba(255,0,110,0.05) 0%, transparent 58%)' }} aria-hidden="true" />
      <div style={{ position:'absolute', bottom:'0%', left:'-5%', width:450, height:350, pointerEvents:'none', background:'radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 58%)' }} aria-hidden="true" />

      <div style={{ maxWidth:1280, margin:'0 auto', padding:isMobile ? '64px 20px' : isTablet ? '80px 32px' : '96px 48px' }}>
        <div style={{ display:'flex', flexDirection:isTablet ? 'column' : 'row', alignItems:isTablet ? 'stretch' : 'center', gap:isMobile ? 32 : isTablet ? 48 : 80 }}>
          <div style={{ flexShrink:0, width:isTablet ? '100%' : '42%' }}>
            <motion.h2 initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.6 }} style={{ fontSize:'clamp(1.9rem, 4vw, 3rem)', fontWeight:700, color:C.text, lineHeight:1.06, marginBottom:20 }}>
              Trusted by leading financial firms worldwide
            </motion.h2>
            <motion.p initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:0.1 }} style={{ fontSize:'1rem', color:'rgba(244,244,244,0.75)', lineHeight:1.7, marginBottom:isMobile ? 32 : 48 }}>
              The world&rsquo;s most demanding financial firms rely on PureFacts to protect and grow their revenue every day.
            </motion.p>
            <div style={{ display:'grid', gridTemplateColumns:isMobile ? '1fr' : 'repeat(3, 1fr)', gap:isMobile ? 16 : 0, marginBottom:isMobile ? 0 : 40 }}>
              {PROOF_STATS.map((s,i) => (
                <motion.div key={s.label} initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:i*0.1 }} style={{ paddingLeft:isMobile || i === 0 ? 0 : 16, paddingRight:isMobile ? 0 : 16, borderLeft:!isMobile && i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                  <div style={{ fontSize:isMobile ? 38 : 48, fontWeight:700, color:C.text, letterSpacing:'-0.03em', lineHeight:1, marginBottom:6 }}>{s.value}</div>
                  <div style={{ fontSize:10, color:'rgba(244,244,244,0.35)', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.12em', lineHeight:1.2 }}>{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
          {!isMobile ? (
            <div style={{ width:isTablet ? '100%' : '58%', display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12, overflow:'hidden' }}>
              <LogoColumn logos={pad(col1)} direction="down" />
              <LogoColumn logos={pad(col2)} direction="up" />
              <LogoColumn logos={pad(col3)} direction="down" />
            </div>
          ) : (
            <MobileLogoCarousel logos={logos} />
          )}
        </div>
      </div>
    </section>
  )
}

// ─── 7. Final CTA ──────────────────────────────────────────────────────────────
function FinalCTA() {
  const { isMobile, isTablet } = useBreakpoint()
  const { ref, inView } = useInView()
  return (
    <section ref={ref as React.RefObject<HTMLElement>} style={{ background:C.bg, padding:isMobile ? '0 0 64px' : '0 0 80px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'0%', left:'50%', transform:'translateX(-50%)', width:800, height:500, pointerEvents:'none', background:'radial-gradient(ellipse, rgba(59,132,255,0.07) 0%, transparent 60%)' }} aria-hidden="true" />
      <div style={{ position:'absolute', bottom:'-10%', left:'-5%', width:500, height:400, pointerEvents:'none', background:'radial-gradient(ellipse, rgba(255,179,12,0.05) 0%, transparent 58%)' }} aria-hidden="true" />
      <div style={{ position:'absolute', top:'20%', right:'-6%', width:450, height:400, pointerEvents:'none', background:'radial-gradient(ellipse, rgba(237,101,208,0.05) 0%, transparent 58%)' }} aria-hidden="true" />
      <div style={{ maxWidth:1280, margin:'0 auto', padding:isMobile ? '0 20px' : isTablet ? '0 32px' : '0 48px' }}>
        <div style={{ padding:isMobile ? '48px 0' : '64px 0' }}>
          <div style={{ display:'flex', flexDirection:isTablet ? 'column' : 'row', alignItems:isTablet ? 'stretch' : 'center', gap:isMobile ? '32px' : isTablet ? '48px' : '80px' }}>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:isMobile ? 24 : 32 }}>
              {[
                { icon:'fa-file-invoice-dollar', color:C.fees,     title:'Precision Fee Billing at Scale',      desc:'Calculate and bill complex fees accurately across thousands of households, schedules, and exceptions, with full traceability at every step.' },
                { icon:'fa-hand-holding-dollar', color:C.comp,     title:'Smarter Advisor Compensation',         desc:'Govern pricing exceptions, align pay with profitable behavior, and give advisors the transparency that builds trust and reduces shadow accounting.' },
                { icon:'fa-chart-line',           color:C.practice, title:'Practice Management Intelligence',    desc:'Give advisor teams the visibility to understand performance, identify growth opportunities, and act with confidence at the right moment.' },
              ].map((f,i) => (
                <div key={f.title} style={{ display:'flex', alignItems:'flex-start', gap:20, opacity:inView?1:0, transform:inView?'translateX(0)':'translateX(-12px)', transition:`opacity 0.5s ease ${0.3+i*0.1}s, transform 0.5s ease ${0.3+i*0.1}s` }}>
                  <div style={{ width:48, height:48, flexShrink:0, display:'flex', alignItems:'flex-start', justifyContent:'flex-start' }} aria-hidden="true">
                    <i className={`fa-solid ${f.icon}`} style={{ color:f.color, fontSize:17 }} />
                  </div>
                  <div>
                    <p style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:4, lineHeight:1 }}>{f.title}</p>
                    <p style={{ fontSize:13, color:C.muted, lineHeight:1.65, margin:0 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ flex:1 }}>
              <h2 style={{ fontSize:'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight:700, lineHeight:1.06, color:C.text, letterSpacing:'-0.025em', marginBottom:16, opacity:inView?1:0, transition:'opacity 0.6s ease 0.2s' }}>
                <span style={{ background:SUNSET, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Find the revenue</span>{' '}
                performance opportunity inside your firm.
              </h2>
              <p style={{ fontSize:14, color:C.muted, lineHeight:1.7, maxWidth:380, marginBottom:36, opacity:inView?1:0, transition:'opacity 0.6s ease 0.3s' }}>
                A Revenue Performance Assessment helps identify where revenue, margin, advisor productivity, and enterprise value may be trapped inside disconnected systems.
              </p>
              <div style={{ opacity:inView?1:0, transition:'opacity 0.6s ease 0.4s' }}>
                <Link href="/contact" className="btn-primary">Schedule a Revenue Assessment</Link>
                <p style={{ fontSize:12, color:C.subtle, fontWeight:500, marginTop:16 }}>Trusted by leading financial firms worldwide.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const globalStyles = `
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
    }
  }
`

// ─── Page export ───────────────────────────────────────────────────────────────
export default function NewPlatformClient({ logos }: { logos: ClientLogo[] }) {
  return (
    <main id="main-content" style={{ fontFamily:"'Carlito', 'Segoe UI', sans-serif", background:C.bg, overflow:'hidden' }}>
      <style>{globalStyles}</style>
      <Hero />
      <TheProblem />
      <PlatformSection />
      <WhyPlatform />
      <Outcomes />
      <ProofBand logos={logos} />
      <FinalCTA />
      <PlatformFAQSection />
    </main>
  )
}