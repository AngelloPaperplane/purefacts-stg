'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// ── Brand tokens ──────────────────────────────────────────────────────────────
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

// ── Floating background glows ─────────────────────────────────────────────────
function PageGlows() {
  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {/* Azure — top left */}
      <div style={{ position: 'absolute', top: '8%', left: '-5%', width: 600, height: 500,
        background: 'radial-gradient(ellipse, rgba(59,132,255,0.07) 0%, transparent 65%)',
        animation: 'glow-drift-1 18s ease-in-out infinite' }} />
      {/* Mandarin — mid right */}
      <div style={{ position: 'absolute', top: '35%', right: '-8%', width: 500, height: 450,
        background: 'radial-gradient(ellipse, rgba(251,86,7,0.06) 0%, transparent 65%)',
        animation: 'glow-drift-2 22s ease-in-out infinite' }} />
      {/* Honey — lower left */}
      <div style={{ position: 'absolute', top: '62%', left: '10%', width: 550, height: 400,
        background: 'radial-gradient(ellipse, rgba(255,179,12,0.06) 0%, transparent 65%)',
        animation: 'glow-drift-3 26s ease-in-out infinite' }} />
      {/* Indigo — bottom right */}
      <div style={{ position: 'absolute', top: '78%', right: '5%', width: 480, height: 420,
        background: 'radial-gradient(ellipse, rgba(71,96,255,0.06) 0%, transparent 65%)',
        animation: 'glow-drift-4 20s ease-in-out infinite' }} />
      <style>{`
        @keyframes glow-drift-1 {
          0%,100% { transform: translate(0px, 0px); }
          33%      { transform: translate(40px, 30px); }
          66%      { transform: translate(-20px, 50px); }
        }
        @keyframes glow-drift-2 {
          0%,100% { transform: translate(0px, 0px); }
          33%      { transform: translate(-50px, 40px); }
          66%      { transform: translate(20px, -30px); }
        }
        @keyframes glow-drift-3 {
          0%,100% { transform: translate(0px, 0px); }
          33%      { transform: translate(30px, -40px); }
          66%      { transform: translate(-40px, 20px); }
        }
        @keyframes glow-drift-4 {
          0%,100% { transform: translate(0px, 0px); }
          33%      { transform: translate(-30px, -50px); }
          66%      { transform: translate(50px, 30px); }
        }
      `}</style>
    </div>
  )
}

// ── Stat counter ──────────────────────────────────────────────────────────────
function StatCount({ prefix = '', value, suffix = '', color, duration = 1600 }: {
  prefix?: string; value: number; suffix?: string; color: string; duration?: number
}) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const ran = useRef(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || ran.current) return
      ran.current = true; io.disconnect()
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration)
        const eased = 1 - Math.pow(1 - p, 3)
        setDisplay(eased * value)
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [value, duration])
  return (
    <span ref={ref} style={{ fontSize: 'clamp(2.25rem,4vw,3rem)', fontWeight: 800, color, letterSpacing: '-0.04em', lineHeight: 1 }}>
      {prefix}{Math.round(display)}{suffix}
    </span>
  )
}

// ── Scroll reveal hook ────────────────────────────────────────────────────────
function useReveal(threshold = 0.07) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); io.disconnect() }
    }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return { ref, visible }
}

// ── Leader type ───────────────────────────────────────────────────────────────
type Leader = {
  name: string
  title: string
  bio?: string
  linkedinUrl?: string
  photoUrl: string | null
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  heroImageUrl: string | null
  leaders: Leader[]
}

export default function LeadershipPageClient({ heroImageUrl, leaders }: Props) {
  const heroRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const grid = useReveal(0.05)
  const cta  = useReveal(0.05)

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t) }, [])

  const VALUES = [
    { icon: 'fa-heart',         color: C.indigo,  title: 'People-First Culture',   desc: 'Trust, autonomy, and care are at our core. Every voice is heard, every contribution matters, and every team member is set up to do their best work.' },
    { icon: 'fa-globe',         color: C.mand,    title: 'Diverse and Distributed', desc: 'With offices across North America, Europe, the UK, and Asia Pacific, we bring together perspectives from across the industry and around the world.' },
    { icon: 'fa-arrow-trend-up',color: C.honey,   title: 'Grow With Us',            desc: 'We are a fast-moving fintech with meaningful work, real ownership, and genuine opportunities to grow alongside a team shaping the future of revenue management.' },
  ]

  return (
    <div style={{ background: C.bg, fontFamily: "'Carlito','Segoe UI',sans-serif", position: 'relative' }}>
      <PageGlows />

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <section
        ref={heroRef as React.RefObject<HTMLElement>}
        style={{ position: 'relative', zIndex: 1, background: 'transparent', minHeight: '72vh', display: 'flex', alignItems: 'stretch' }}
        aria-label="PureFacts leadership team"
      >
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', minHeight: '72vh' }}>

          {/* Left */}
          <div style={{
            flex: '0 0 50%', display: 'flex', alignItems: 'center',
            paddingTop: 96, paddingBottom: 96,
            paddingLeft: 'max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))',
            paddingRight: '3rem',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}>
            <div style={{ maxWidth: '34rem' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', color: C.mand, marginBottom: 20 }}>
                PureFacts Leadership
              </div>
              <h1 style={{ fontSize: 'clamp(2.25rem,5vw,3.75rem)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.025em', color: C.text, marginBottom: 24 }}>
                A Team That{' '}
                <span style={{ background: SUNSET, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Cares
                </span>
              </h1>
              <p style={{ fontSize: '1.0625rem', color: C.muted, lineHeight: 1.75, marginBottom: '1rem' }}>
                At PureFacts, we don&apos;t just create technology. We cultivate meaningful
                relationships. Our people-first culture champions inclusion, creativity, and
                continuous growth, empowering every team member to do their best work.
              </p>
              <p style={{ fontSize: '1.0625rem', color: C.muted, lineHeight: 1.75, marginBottom: 40 }}>
                We are a diverse and distributed team united by a shared purpose. With trust,
                autonomy, and care at our core, every voice is heard and every contribution matters.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/contact" className="btn-primary">Get in touch</Link>
              </div>
            </div>
          </div>

          {/* Right — hero image full bleed */}
          <div style={{ flex: '0 0 50%', position: 'relative', minHeight: 400 }}>
            {heroImageUrl ? (
              <Image
                src={heroImageUrl}
                alt="PureFacts leadership team members"
                fill
                priority
                sizes="50vw"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(59,132,255,0.08) 0%, rgba(251,86,7,0.05) 100%)' }} />
            )}
          </div>
        </div>
      </section>

      {/* ── Divider ──────────────────────────────────────────────────────── */}
      <div aria-hidden="true" style={{ height: 1, background: C.border, position: 'relative', zIndex: 1 }} />

      {/* ── 2. Leadership grid ───────────────────────────────────────────── */}
      <section
        ref={grid.ref as React.RefObject<HTMLElement>}
        style={{
          position: 'relative', zIndex: 1, background: 'transparent',
          padding: 'clamp(3.5rem,6vw,5rem) 0',
          opacity: grid.visible ? 1 : 0,
          transform: grid.visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
        aria-label="Leadership profiles"
      >
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', marginBottom: '2.5rem' }}>
            Our Leadership
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" style={{ gap: '2rem 1.25rem' }}>
            {leaders.map((leader, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Photo */}
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', overflow: 'hidden', background: C.surface }}>
                  {leader.photoUrl ? (
                    <Image
                      src={leader.photoUrl}
                      alt={leader.name}
                      fill
                      sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
                      style={{ objectFit: 'cover', objectPosition: 'top' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700,
                      color: 'rgba(244,244,244,0.15)',
                      background: 'linear-gradient(135deg,#1a1410 0%,#1f1a16 100%)',
                    }}>
                      {leader.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                  )}
                </div>
                {/* Name + title */}
                <div style={{ marginTop: '0.75rem' }}>
                  <p style={{ fontWeight: 700, color: C.text, fontSize: '0.9375rem', lineHeight: 1.3, marginBottom: '0.2rem' }}>
                    {leader.name}
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: C.subtle, lineHeight: 1.4 }}>
                    {leader.title}
                  </p>
                </div>
                {/* LinkedIn */}
                {leader.linkedinUrl && (
                  <a
                    href={leader.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${leader.name} on LinkedIn`}
                    style={{
                      marginTop: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '1.75rem', height: '1.75rem',
                      border: `1px solid ${C.border}`,
                      color: 'rgba(244,244,244,0.35)',
                      textDecoration: 'none', transition: 'color 0.2s, border-color 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = C.azure; e.currentTarget.style.borderColor = C.azure }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(244,244,244,0.35)'; e.currentTarget.style.borderColor = C.border }}
                  >
                    <LinkedInIcon />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Values + Careers CTA ─────────────────────────────────────── */}
      <section
        ref={cta.ref as React.RefObject<HTMLElement>}
        style={{
          position: 'relative', zIndex: 1, background: 'transparent',
          padding: 'clamp(3.5rem,6vw,5rem) 0',
          opacity: cta.visible ? 1 : 0,
          transform: cta.visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
        aria-label="Join our team"
      >
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '5rem', alignItems: 'flex-start' }}>

            {/* Left — values */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {VALUES.map(({ icon, color, title, desc }, i) => (
                <div key={title} style={{
                  display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
                  opacity: cta.visible ? 1 : 0,
                  transform: cta.visible ? 'translateY(0)' : 'translateY(16px)',
                  transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`,
                }}>
                  <div style={{
                    width: '3rem', height: '3rem', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: C.surface, border: `1px solid ${C.border}`,
                  }} aria-hidden="true">
                    <i className={`fa-solid ${icon}`} style={{ color, fontSize: '1.05rem' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: C.text, marginBottom: '0.375rem' }}>{title}</p>
                    <p style={{ fontSize: '0.9375rem', color: C.muted, lineHeight: 1.7 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right — careers pitch */}
            <div style={{ flex: '0 0 42%' }}>
              <h2 style={{
                fontSize: 'clamp(1.75rem,3vw,2.5rem)', fontWeight: 700,
                lineHeight: 1.15, letterSpacing: '-0.025em', color: C.text, marginBottom: '1.25rem',
              }}>
                Sound Like Your{' '}
                <span style={{ background: SUNSET, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Kind Of Team?
                </span>
              </h2>
              <p style={{ fontSize: '1.0625rem', color: C.muted, lineHeight: 1.75, marginBottom: '0.75rem' }}>
                We are always looking for curious minds and passionate people to join our journey.
                If you are looking to do meaningful work with a supportive, purpose-driven team,
                we would love to meet you.
              </p>
              <p style={{ fontSize: '0.875rem', color: C.subtle, marginBottom: '2rem' }}>
                Offices across North America, Europe, the UK, and Asia Pacific
              </p>
              <Link href="/about/careers" className="btn-primary">See open roles</Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}