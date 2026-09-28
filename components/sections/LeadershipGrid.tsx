'use client'

// import { useState } from 'react'
import Image from 'next/image'

type Leader = {
  name: string
  title: string
  bio?: string
  linkedinUrl?: string
  photoUrl: string | null
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

// ── Modal commented out until bios are available post-launch ──────────────────
// function LeaderModal({ leader, onClose }: { leader: Leader; onClose: () => void }) { ... }

export default function LeadershipGrid({
  leaders,
  dark = false,
}: {
  leaders: Leader[]
  dark?: boolean
}) {
  // const [active, setActive] = useState<Leader | null>(null)

  const nameColor    = dark ? '#f4f4f4'                  : '#140f0c'
  const titleColor   = dark ? 'rgba(244,244,244,0.55)'   : '#6b7280'
  const iconBorder   = dark ? 'rgba(255,255,255,0.10)'   : '#e5e7eb'
  const iconColor    = dark ? 'rgba(244,244,244,0.45)'   : '#9ca3af'
  const iconHoverBg  = dark ? 'rgba(59,132,255,0.12)'    : undefined
  const photoFallBg  = dark
    ? 'linear-gradient(135deg, #1a1410 0%, #1f1a16 100%)'
    : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
  const photoFallText = dark ? 'rgba(244,244,244,0.15)' : 'rgba(255,255,255,0.2)'

  return (
    <>
      <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {leaders.map((leader, i) => (
          <div
            key={i}
            className="group flex flex-col text-left"
          >
            {/* Photo */}
            <div
              style={{ position: 'relative', width: '100%', aspectRatio: '1/1', overflow: 'hidden' }}
            >
              {leader.photoUrl ? (
                <Image
                  src={leader.photoUrl}
                  alt={leader.name}
                  fill
                  className="object-cover object-top"
                />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: photoFallBg,
                  fontSize: '1.5rem', fontWeight: 700,
                  color: photoFallText,
                }}>
                  {leader.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
              )}
            </div>

            {/* Name + title */}
            <div style={{ marginTop: '0.75rem' }}>
              <p style={{ fontWeight: 700, color: nameColor, fontSize: '0.9375rem', lineHeight: 1.3 }}>
                {leader.name}
              </p>
              <p style={{ fontSize: '0.8125rem', color: titleColor, marginTop: '0.2rem', lineHeight: 1.4 }}>
                {leader.title}
              </p>
            </div>

            {/* LinkedIn */}
            {leader.linkedinUrl && (
              <a
                href={leader.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginTop: '0.625rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '1.75rem',
                  height: '1.75rem',
                  border: `1px solid ${iconBorder}`,
                  color: iconColor,
                  transition: 'color 0.2s, border-color 0.2s, background 0.2s',
                  background: 'transparent',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.color = '#3b84ff'
                  el.style.borderColor = '#3b84ff'
                  if (iconHoverBg) el.style.background = iconHoverBg
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.color = iconColor
                  el.style.borderColor = iconBorder
                  el.style.background = 'transparent'
                }}
                aria-label={`${leader.name} on LinkedIn`}
              >
                <LinkedInIcon />
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Modal — re-enable once bios are available in Sanity */}
      {/* {active && <LeaderModal leader={active} onClose={() => setActive(null)} />} */}
    </>
  )
}