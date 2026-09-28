// app/about/newsroom/page.tsx

import type { Metadata } from 'next'
import Image from 'next/image'
import { getPosts, getNewsroomSettings } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/client'
import PressReleases from './PressReleases'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: 'Newsroom | PureFacts Financial Solutions',
  description:
    'The latest press releases and industry recognition from PureFacts, the global leader in revenue management technology for wealth and asset management.',
}

export default async function NewsroomPage() {
  const [pressReleases, settings] = await Promise.all([
    getPosts({ category: 'press-release', limit: 50 }),
    getNewsroomSettings(),
  ])

  type Award = {
    order?: number
    year: number
    title: string
    provider: string
    image: any
    [key: string]: unknown
  }
  const awards: Award[] = (settings?.awards ?? []).slice().sort(
    (a: Award, b: Award) => (a.order ?? 999) - (b.order ?? 999)
  )

  return (
    <div className="dark-page" style={{ background: '#140f0c', fontFamily: "'Carlito','Segoe UI',sans-serif", position: 'relative' }}>
      <BreadcrumbJsonLd pathname="/about/newsroom" />

      <style>{`
        .nr-glows { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .nr-glow-1 { position: absolute; top: 5%;  left: -5%;  width: 600px; height: 500px; background: radial-gradient(ellipse, rgba(59,132,255,0.07) 0%, transparent 65%);  animation: gd1 18s ease-in-out infinite; }
        .nr-glow-2 { position: absolute; top: 35%; right: -6%; width: 550px; height: 450px; background: radial-gradient(ellipse, rgba(251,86,7,0.06) 0%, transparent 65%);    animation: gd2 23s ease-in-out infinite; }
        .nr-glow-3 { position: absolute; top: 65%; left: 8%;   width: 500px; height: 420px; background: radial-gradient(ellipse, rgba(255,179,12,0.06) 0%, transparent 65%);  animation: gd3 28s ease-in-out infinite; }
        .nr-glow-4 { position: absolute; top: 85%; right: 8%;  width: 480px; height: 400px; background: radial-gradient(ellipse, rgba(71,96,255,0.06) 0%, transparent 65%);   animation: gd4 21s ease-in-out infinite; }
        @keyframes gd1{0%,100%{transform:translate(0,0)}33%{transform:translate(40px,35px)}66%{transform:translate(-25px,55px)}}
        @keyframes gd2{0%,100%{transform:translate(0,0)}33%{transform:translate(-50px,40px)}66%{transform:translate(25px,-35px)}}
        @keyframes gd3{0%,100%{transform:translate(0,0)}33%{transform:translate(35px,-40px)}66%{transform:translate(-40px,25px)}}
        @keyframes gd4{0%,100%{transform:translate(0,0)}33%{transform:translate(-30px,-50px)}66%{transform:translate(50px,30px)}}

        .nr-nav-link {
          font-size: 1rem; font-weight: 600; color: #f4f4f4;
          text-decoration: none; transition: color 0.2s;
        }
        .nr-nav-link:hover { color: #3b84ff; }

        .nr-press-email {
          color: #3b84ff; text-decoration: none; transition: text-decoration 0.2s;
        }
        .nr-press-email:hover { text-decoration: underline; }

        .nr-award-card {
          display: flex; flex-direction: column; align-items: center;
          padding: 1.25rem; text-align: center; gap: 1rem;
          background: #1a1410;
          border: 1px solid rgba(255,255,255,0.07);
          transition: border-color 0.2s;
        }
        .nr-award-card:hover { border-color: rgba(255,255,255,0.14); }
      `}</style>

      {/* ── Background glows ────────────────────────────────────────── */}
      <div aria-hidden="true" className="nr-glows">
        <div className="nr-glow-1" />
        <div className="nr-glow-2" />
        <div className="nr-glow-3" />
        <div className="nr-glow-4" />
      </div>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section
        style={{ position: 'relative', zIndex: 1, padding: 'clamp(3rem,6vw,5rem) 0 clamp(2rem,4vw,3rem)' }}
        aria-label="Newsroom"
      >
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', color: '#fb5607', marginBottom: 16 }}>
            Resources
          </p>
          <h1 style={{ fontSize: 'clamp(2.25rem,5vw,3.5rem)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.025em', color: '#f4f4f4', marginBottom: 16 }}>
            The Newsroom
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(244,244,244,0.6)', marginBottom: 28 }}>
            For media inquiries please contact{' '}
            <a href="mailto:press@purefacts.com" className="nr-press-email" aria-label="Email the PureFacts press team at press@purefacts.com">
              press@purefacts.com
            </a>
          </p>

          <nav aria-label="Newsroom sections" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
            {[
              { label: 'Press Releases', href: '#press-releases' },
              { label: 'Awards',         href: '#awards' },
            ].map((link, i, arr) => (
              <span key={link.href} style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <a href={link.href} className="nr-nav-link">{link.label}</a>
                {i < arr.length - 1 && (
                  <span aria-hidden="true" style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)', display: 'inline-block' }} />
                )}
              </span>
            ))}
          </nav>
        </div>
      </section>

      {/* ── Press Releases ──────────────────────────────────────────── */}
      <PressReleases posts={pressReleases} />

      {/* ── Awards ──────────────────────────────────────────────────── */}
      <section
        id="awards"
        style={{ position: 'relative', zIndex: 1, padding: 'clamp(3.5rem,6vw,5rem) 0', scrollMarginTop: '6rem' }}
        aria-label="Awards and recognition"
      >
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)', fontWeight: 700, color: '#f4f4f4', letterSpacing: '-0.025em', marginBottom: '2.5rem' }}>
            Our Awards
          </h2>

          {awards.length === 0 ? (
            <p style={{ fontSize: '1rem', color: 'rgba(244,244,244,0.4)' }}>No awards added yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '1rem' }}>
              {awards.map((award, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', padding: '0.5rem 0' }}>
                  <div style={{ position: 'relative', width: 180, height: 180, flexShrink: 0, background: '#f4f4f4', padding: 20, borderRadius: 20 }}>
                    <Image
                      src={urlFor(award.image).width(440).url()}
                      alt={`${award.title} award from ${award.provider}, ${award.year}`}
                      fill
                      style={{ objectFit: 'contain', padding: 20 }}
                    />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(244,244,244,0.4)', marginBottom: 4 }}>
                      {award.provider as string}
                    </p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f4f4f4', lineHeight: 1.35 }}>
                      {award.title as string}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(244,244,244,0.4)', marginTop: 4 }}>
                      {award.year}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  )
}