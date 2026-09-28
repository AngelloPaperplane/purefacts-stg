'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

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
      <div style={{ position:'absolute', top:'5%',  left:'-5%',  width:600, height:500, background:'radial-gradient(ellipse,rgba(59,132,255,0.07) 0%,transparent 65%)',  animation:'gd1 18s ease-in-out infinite' }} />
      <div style={{ position:'absolute', top:'35%', right:'-6%', width:550, height:450, background:'radial-gradient(ellipse,rgba(251,86,7,0.06) 0%,transparent 65%)',    animation:'gd2 23s ease-in-out infinite' }} />
      <div style={{ position:'absolute', top:'65%', left:'8%',   width:500, height:420, background:'radial-gradient(ellipse,rgba(255,179,12,0.06) 0%,transparent 65%)',  animation:'gd3 28s ease-in-out infinite' }} />
      <div style={{ position:'absolute', top:'85%', right:'8%',  width:480, height:400, background:'radial-gradient(ellipse,rgba(71,96,255,0.06) 0%,transparent 65%)',   animation:'gd4 21s ease-in-out infinite' }} />
      <style>{`
        @keyframes gd1{0%,100%{transform:translate(0,0)}33%{transform:translate(40px,35px)}66%{transform:translate(-25px,55px)}}
        @keyframes gd2{0%,100%{transform:translate(0,0)}33%{transform:translate(-50px,40px)}66%{transform:translate(25px,-35px)}}
        @keyframes gd3{0%,100%{transform:translate(0,0)}33%{transform:translate(35px,-40px)}66%{transform:translate(-40px,25px)}}
        @keyframes gd4{0%,100%{transform:translate(0,0)}33%{transform:translate(-30px,-50px)}66%{transform:translate(50px,30px)}}
      `}</style>
    </div>
  )
}

function useBreakpoint() {
  const [w, setW] = useState(1280)
  useEffect(() => {
    const upd = () => setW(window.innerWidth); upd()
    window.addEventListener('resize', upd); return () => window.removeEventListener('resize', upd)
  }, [])
  return { isMobile: w < 640, isTablet: w < 1024 }
}

function useReveal(threshold = 0.05) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect() } }, { threshold })
    io.observe(el); return () => io.disconnect()
  }, [threshold])
  return { ref, visible }
}

// ── Acrostic ──────────────────────────────────────────────────────────────────
const ACROSTIC_VALUES = [
  { letter: 'P', word: 'Purposeful',     desc: 'We act with intention, aligned to goals that matter.' },
  { letter: 'U', word: 'United',         desc: 'We collaborate across functions and borders to win together.' },
  { letter: 'R', word: 'Respectful',     desc: 'We value people, time, and perspectives, even when they differ.' },
  { letter: 'E', word: 'Empathetic',     desc: 'We listen to understand, not just respond.' },
  { letter: 'F', word: 'Future-Focused', desc: 'We build with tomorrow in mind.' },
  { letter: 'A', word: 'Accountable',    desc: 'We own our results, always.' },
  { letter: 'C', word: 'Curious',        desc: 'We never stop exploring better ways.' },
  { letter: 'T', word: 'Trusted',        desc: 'We do what we say and say what we mean.' },
  { letter: 'S', word: 'Smart',          desc: 'We make decisions with insight, focus, and strategic intent.' },
]

const GRADIENT_STOPS = [
  { pos: 0,    color: '#FACC22' },
  { pos: 0.33, color: '#FB5607' },
  { pos: 0.66, color: '#4760FF' },
  { pos: 1,    color: '#0DCCFF' },
]

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function hexToRgb(hex: string) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)]
}
function sampleGradient(t: number, offset: number): string {
  const shifted = ((t + offset) % 1 + 1) % 1
  for (let i = 0; i < GRADIENT_STOPS.length - 1; i++) {
    const s0 = GRADIENT_STOPS[i], s1 = GRADIENT_STOPS[i+1]
    if (shifted >= s0.pos && shifted <= s1.pos) {
      const lt = (shifted - s0.pos) / (s1.pos - s0.pos)
      const [r0,g0,b0] = hexToRgb(s0.color), [r1,g1,b1] = hexToRgb(s1.color)
      return `rgb(${Math.round(lerp(r0,r1,lt))},${Math.round(lerp(g0,g1,lt))},${Math.round(lerp(b0,b1,lt))})`
    }
  }
  return GRADIENT_STOPS[GRADIENT_STOPS.length-1].color
}

function Acrostic({ mobile }: { mobile: boolean }) {
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([])
  const animRef    = useRef(0)
  const offsetRef  = useRef(0)

  useEffect(() => {
    const total = ACROSTIC_VALUES.length
    function animate() {
      offsetRef.current = ((offsetRef.current - 0.003) % 1 + 1) % 1
      letterRefs.current.forEach((el, i) => {
        if (!el) return
        el.style.color = sampleGradient(i / (total - 1), offsetRef.current)
      })
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  if (mobile) {
    return (
      <div style={{ display:'flex', flexDirection:'column' }}>
        {ACROSTIC_VALUES.map((v, i) => (
          <div key={v.letter} style={{ display:'flex', alignItems:'center', gap:'1.25rem', padding:'1rem 0' }}>
            <span
              ref={el => { letterRefs.current[i] = el }}
              style={{ fontSize:'3rem', fontWeight:900, lineHeight:1, minWidth:'2.5rem', flexShrink:0 }}
              aria-hidden="true"
            >
              {v.letter}
            </span>
            <div>
              <p style={{ fontSize:'1rem', fontWeight:700, color:C.text, marginBottom:'0.2rem' }}>{v.word}</p>
              <p style={{ fontSize:'0.875rem', color:C.muted, lineHeight:1.6 }}>{v.desc}</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Horizontal — 9 equal columns, no gap/border background, no extra padding on edges
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(9, 1fr)', gap:0 }}>
      {ACROSTIC_VALUES.map((v, i) => (
        <div key={v.letter} style={{
          padding: i === 0 ? '1.5rem 1rem 1.5rem 0'
                 : i === ACROSTIC_VALUES.length - 1 ? '1.5rem 0 1.5rem 1rem'
                 : '1.5rem 1rem',
          display:'flex', flexDirection:'column', gap:'0.5rem',
        }}>
          <span
            ref={el => { letterRefs.current[i] = el }}
            style={{ fontSize:'2.75rem', fontWeight:900, lineHeight:1, display:'block' }}
            aria-hidden="true"
          >
            {v.letter}
          </span>
          <p style={{ fontSize:'0.8125rem', fontWeight:700, color:C.text, lineHeight:1.3 }}>{v.word}</p>
          <p style={{ fontSize:'0.75rem', color:C.muted, lineHeight:1.6 }}>{v.desc}</p>
        </div>
      ))}
    </div>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────
const WHY_WORK = [
  { icon:'fa-heart-pulse',    color:C.indigo, title:'Culture Of Impact',       desc:'We focus on what moves the needle.' },
  { icon:'fa-trophy',         color:C.azure,  title:'Great Work Gets Noticed',  desc:'High performance leads to growth, trust, and opportunity.' },
  { icon:'fa-bolt',           color:C.honey,  title:'Smart Hustle',             desc:'We think fast, act with purpose, and stay ahead of the curve.' },
  { icon:'fa-earth-americas', color:C.mand,   title:'Global Team',              desc:'With offices in Toronto, New York, Lisbon, and Zurich.' },
]

const BENEFITS = [
  { icon:'fa-heart-pulse',    title:'Health and Dental',            desc:'Comprehensive coverage for employees across Canada, the US, and Europe.' },
  { icon:'fa-umbrella-beach', title:'Four Weeks Vacation',          desc:'All employees start with four weeks of paid vacation to rest, recharge, and do what matters outside of work.' },
  { icon:'fa-piggy-bank',     title:'Retirement and Savings',       desc:'Matching retirement and savings programs to help you build for the future. Specific programs vary by region.' },
  { icon:'fa-baby',           title:'Parental and Sick Leave',      desc:'Supportive leave policies for new parents and when life gets in the way. Available to all employees.' },
  { icon:'fa-earth-americas', title:'Work From Anywhere',           desc:'Flexibility to work from different locations so you can build a life that fits, not just a schedule.' },
  { icon:'fa-stethoscope',    title:'Virtual Healthcare',           desc:'On-demand access to primary care, mental health support, and wellness services.' },
  { icon:'fa-shield-heart',   title:'Employee Assistance',          desc:'Confidential wellbeing and support resources to help employees navigate challenges at work and at home.' },
  { icon:'fa-dumbbell',       title:'Fitness Benefits',             desc:'Corporate gym memberships and fitness support to keep you active. Available in select regions.' },
  { icon:'fa-bus',            title:'Commuter Benefits',            desc:'Commuter and parking support to help offset daily travel costs. Available in select regions.' },
]

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CareersPageClient() {
  const [mounted, setMounted] = useState(false)
  const { isMobile, isTablet } = useBreakpoint()
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t) }, [])

  const acrostic = useReveal()
  const whyWork  = useReveal()
  const benefits = useReveal()
  const cta      = useReveal()

  const maxW      = { maxWidth:'80rem', margin:'0 auto', padding:'0 1.5rem' }
  const sectionPad = 'clamp(4rem,7vw,6rem) 0'

  return (
    <div style={{ background:C.bg, fontFamily:"'Carlito','Segoe UI',sans-serif", position:'relative' }}>
      <PageGlows />

      {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
      <section style={{ position:'relative', zIndex:1, minHeight:'72vh', display:'flex', alignItems:'stretch' }} aria-label="Careers at PureFacts">
        <div style={{ display:'flex', width:'100%', flexDirection:isTablet?'column':'row' }}>

          {/* Left */}
          <div style={{
            flex:isTablet?'unset':'0 0 50%', display:'flex', alignItems:'center',
            paddingTop:96, paddingBottom:96,
            paddingLeft:'max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))',
            paddingRight:isTablet?'max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))':'3rem',
            opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(24px)',
            transition:'opacity 0.7s ease, transform 0.7s ease',
          }}>
            <div style={{ maxWidth:'34rem' }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.20em', textTransform:'uppercase', color:C.mand, marginBottom:20 }}>
                Join PureFacts
              </div>
              <h1 style={{ fontSize:'clamp(2.25rem,5vw,3.75rem)', fontWeight:700, lineHeight:1.08, letterSpacing:'-0.025em', color:C.text, marginBottom:24 }}>
                A Fintech With{' '}
                <span style={{ background:SUNSET, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                  Heart.
                </span>
              </h1>
              <p style={{ fontSize:'1.0625rem', color:C.muted, lineHeight:1.75, marginBottom:'1rem' }}>
                At PureFacts, we&apos;re on a mission to help our clients grow stronger businesses
                through better data, smarter technology, and trusted partnerships. We don&apos;t
                just power financial services. We power performance.
              </p>
              <p style={{ fontSize:'1.0625rem', color:C.muted, lineHeight:1.75, marginBottom:40 }}>
                Whether you&apos;re in engineering, product, client success, or operations, you&apos;ll
                be part of a human-first, intelligence-driven culture that&apos;s serious about
                outcomes and never too serious to have fun.
              </p>
              <Link href="https://ats.rippling.com/purefacts_jobs/jobs/" className="btn-primary">
                View job postings
              </Link>
            </div>
          </div>

          {/* Right — SVG logo, centered */}
          <div style={{
            flex:isTablet?'unset':'0 0 50%',
            display:'flex', alignItems:'center', justifyContent:'center',
            minHeight:isTablet?280:0, alignSelf:'stretch',
            opacity:mounted?1:0, transition:'opacity 0.9s ease 0.2s',
          }}>
            <img
              src="/logos/PureFacts-Gradient-Outline.svg"
              alt="PureFacts"
              aria-hidden="true"
              style={{ width:'100%', maxWidth:500, height:'auto', display:'block' }}
            />
          </div>
        </div>
      </section>

      {/* ── 2. Culture Code ──────────────────────────────────────────────── */}
      <section
        ref={acrostic.ref as React.RefObject<HTMLElement>}
        style={{ position:'relative', zIndex:1, padding:sectionPad, opacity:acrostic.visible?1:0, transform:acrostic.visible?'translateY(0)':'translateY(24px)', transition:'opacity 0.7s ease, transform 0.7s ease' }}
        aria-label="Our culture code"
      >
        <div style={maxW}>

          {/* Row 1: intro */}
          <div style={{ display:'flex', flexDirection:isTablet?'column':'row', gap:'3rem', marginBottom:'2.5rem', alignItems:isTablet?'flex-start':'center' }}>
            <div style={{ flex:isTablet?'unset':'0 0 38%' }}>
              <h2 style={{ fontSize:'clamp(1.75rem,3vw,2.5rem)', fontWeight:700, lineHeight:1.15, letterSpacing:'-0.025em', color:C.text, marginBottom:'0.5rem' }}>
                Our Culture Code:
              </h2>
              <h2 style={{ fontSize:'clamp(1.75rem,3vw,2.5rem)', fontWeight:700, lineHeight:1.15, letterSpacing:'-0.025em', marginBottom:0, background:SUNSET, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                PUREFACTS
              </h2>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:'1.0625rem', color:C.muted, lineHeight:1.75 }}>
                At PureFacts, progress means real outcomes: higher revenue, streamlined
                operations, and improved client experiences. This is how we show up, with
                clients, with each other, and with the work.
              </p>
            </div>
          </div>

          {/* Row 2: acrostic full width */}
          <Acrostic mobile={isMobile} />

        </div>
      </section>

      {/* ── 3. Why Work Here ─────────────────────────────────────────────── */}
      <section
        ref={whyWork.ref as React.RefObject<HTMLElement>}
        style={{ position:'relative', zIndex:1, padding:sectionPad, opacity:whyWork.visible?1:0, transform:whyWork.visible?'translateY(0)':'translateY(24px)', transition:'opacity 0.7s ease, transform 0.7s ease' }}
        aria-label="Why work at PureFacts"
      >
        <div style={maxW}>
          <div style={{ display:'flex', flexDirection:isTablet?'column':'row', gap:'3rem' }}>
            <div style={{ flex:isTablet?'unset':'0 0 28%' }}>
              <h2 style={{ fontSize:'clamp(1.75rem,3vw,2.5rem)', fontWeight:700, color:C.text, letterSpacing:'-0.025em', marginBottom:'0.65rem' }}>
                Why Work Here?
              </h2>
              <p style={{ fontSize:'1rem', color:C.muted, lineHeight:1.75 }}>
                We build an environment where great people do the best work of their careers.
              </p>
            </div>
            <div style={{ flex:1, display:'grid', gridTemplateColumns:isTablet?'1fr':'1fr 1fr', gap:3 }}>
              {WHY_WORK.map(({ icon, color, title, desc }) => (
                <div key={title} style={{ background:C.surface, padding:'1.75rem', display:'flex', gap:'1rem', alignItems:'flex-start' }}>
                  <i className={`fa-solid ${icon}`} style={{ color, fontSize:'1.25rem', flexShrink:0, marginTop:'0.1rem' }} aria-hidden="true" />
                  <div>
                    <p style={{ fontSize:'1rem', fontWeight:700, color:C.text, marginBottom:'0.3rem' }}>{title}</p>
                    <p style={{ fontSize:'0.9375rem', color:C.muted, lineHeight:1.7 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Benefits ──────────────────────────────────────────────────── */}
      <section
        ref={benefits.ref as React.RefObject<HTMLElement>}
        style={{ position:'relative', zIndex:1, padding:sectionPad, opacity:benefits.visible?1:0, transform:benefits.visible?'translateY(0)':'translateY(24px)', transition:'opacity 0.7s ease, transform 0.7s ease' }}
        aria-label="Employee benefits"
      >
        <div style={maxW}>
          <div style={{ marginBottom:'2.15rem' }}>
            <h2 style={{ fontSize:'clamp(1.75rem,3vw,2.5rem)', fontWeight:700, color:C.text, letterSpacing:'-0.025em', marginBottom:'0.65rem' }}>
              Benefits and Perks
            </h2>
            <p style={{ fontSize:'1rem', color:C.muted, lineHeight:1.7, maxWidth:'40rem' }}>
              Our benefits are designed to support your health, finances, and life outside of work.
              Specific programs vary by region, and we are always working to offer meaningful support.
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':isTablet?'repeat(2,1fr)':'repeat(3,1fr)', gap:3 }}>
            {BENEFITS.map(({ icon, title, desc }, i) => (
              <div key={title} style={{
                background:C.surface, padding:'1.75rem',
                display:'flex', gap:'1rem', alignItems:'flex-start',
                opacity:benefits.visible?1:0,
                transform:benefits.visible?'translateY(0)':'translateY(16px)',
                transition:`opacity 0.5s ease ${i*0.06}s, transform 0.5s ease ${i*0.06}s`,
              }}>
                <i className={`fa-solid ${icon}`} style={{ color:C.azure, fontSize:'1.125rem', flexShrink:0, marginTop:'0.15rem' }} aria-hidden="true" />
                <div>
                  <p style={{ fontSize:'0.9375rem', fontWeight:700, color:C.text, marginBottom:'0.3rem' }}>{title}</p>
                  <p style={{ fontSize:'0.875rem', color:C.muted, lineHeight:1.65 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p style={{ marginTop:'1.5rem', fontSize:'0.8125rem', color:C.subtle }}>
            * Benefit availability varies by country and region. Our People team is happy to walk you through what applies to your location.
          </p>
        </div>
      </section>

      {/* ── 5. CTA ───────────────────────────────────────────────────────── */}
      <section
        ref={cta.ref as React.RefObject<HTMLElement>}
        style={{ position:'relative', zIndex:1, padding:sectionPad, opacity:cta.visible?1:0, transform:cta.visible?'translateY(0)':'translateY(24px)', transition:'opacity 0.7s ease, transform 0.7s ease' }}
        aria-label="Apply to PureFacts"
      >
        <div style={maxW}>
          <div style={{ display:'flex', flexDirection:isTablet?'column':'row', gap:'5rem', alignItems:'flex-start' }}>

            {/* Left — values */}
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'2rem' }}>
              {[
                { icon:'fa-heart-pulse',    color:C.indigo, title:'Culture of Impact',       desc:'We focus on what moves the needle. Great work gets noticed, high performance leads to real growth, and your contributions shape the product and the company.' },
                { icon:'fa-earth-americas', color:C.mand,   title:'Global Team, Human First', desc:'With offices in Toronto, New York, Lisbon, and Zurich, we bring together diverse perspectives united by a shared commitment to doing meaningful work.' },
                { icon:'fa-bolt',           color:C.honey,  title:'Smart Hustle',             desc:'We think fast, act with purpose, and stay ahead of the curve. Seriously committed to outcomes, and never too serious to have fun along the way.' },
              ].map(({ icon, color, title, desc }) => (
                <div key={title} style={{ display:'flex', gap:'1.25rem', alignItems:'flex-start' }}>
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

            {/* Right */}
            <div style={{ flex:'0 0 42%' }}>
              <h2 style={{ fontSize:'clamp(1.75rem,3vw,2.5rem)', fontWeight:700, lineHeight:1.15, letterSpacing:'-0.025em', color:C.text, marginBottom:'1.25rem' }}>
                Ready To Take Your Career{' '}
                <span style={{ background:SUNSET, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                  To The Next Level?
                </span>
              </h2>
              <p style={{ fontSize:'1.0625rem', color:C.muted, lineHeight:1.75, marginBottom:'0.75rem' }}>
                Come build with us. Explore open roles across engineering, product,
                client success, and operations, and find out what it means to work
                at a fintech with real purpose.
              </p>
              <p style={{ fontSize:'0.875rem', color:C.subtle, marginBottom:'2rem' }}>
                Toronto · New York · Lisbon · Zurich
              </p>
              <Link href="https://ats.rippling.com/purefacts_jobs/jobs/" className="btn-primary">
                View job postings
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}