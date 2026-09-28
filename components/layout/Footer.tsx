'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// ─── HubSpot newsletter form ─────────────────────────────────────────────────
const PORTAL_ID = '3218774'
const FORM_ID   = '3d3590c3-54ae-4c0a-8bab-ff44991d44cc'

function FooterNewsletterForm() {
  const [email, setEmail]   = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = useCallback(async () => {
    if (!email.trim() || status === 'loading') return
    setStatus('loading')
    try {
      const res = await fetch(
        `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_ID}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: [{ name: 'email', value: email }],
            context: {
              pageUri:  typeof window !== 'undefined' ? window.location.href : '',
              pageName: typeof document !== 'undefined' ? document.title : '',
            },
          }),
        }
      )
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }, [email, status])

  if (status === 'success') {
    return <p className="py-2 text-xs text-gray-400">You're subscribed. Thanks for joining.</p>
  }

  return (
    <div>
      <div className="flex" role="group" aria-label="Newsletter signup">
        <label htmlFor="footer-email" className="sr-only">Email address</label>
        <input
          id="footer-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Email"
          autoComplete="email"
          className="min-w-0 flex-1 border border-white/15 border-r-0 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-brand-blue"
        />
        <button
          onClick={handleSubmit}
          disabled={status === 'loading'}
          aria-label={status === 'loading' ? 'Submitting' : 'Subscribe to newsletter'}
          className="shrink-0 border border-brand-blue bg-brand-blue px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:opacity-60"
        >
          {status === 'loading'
            ? <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
            : <i className="fa-solid fa-paper-plane" aria-hidden="true" />
          }
        </button>
      </div>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
        Revenue intelligence and industry insights, delivered to your inbox.
      </p>
      {status === 'error' && (
        <p className="mt-1 text-xs text-red-400" role="alert">Something went wrong. Please try again.</p>
      )}
    </div>
  )
}

// ─── Accordion ───────────────────────────────────────────────────────────────
function Accordion({ label, links }: { label: string; links: { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false)
  const id = `footer-acc-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className="border-b border-white/[0.07] last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between py-2 text-left text-sm text-gray-400 transition-colors hover:text-gray-300"
        aria-expanded={open}
        aria-controls={id}
      >
        <span>{label}</span>
        <svg
          className={`h-3 w-3 shrink-0 text-gray-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul id={id} className="pb-2 pl-2 space-y-1.5">
          {links.map(link => (
            <li key={link.href}>
              <Link href={link.href} className="block text-sm text-gray-400 transition-colors hover:text-gray-200">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Column data ──────────────────────────────────────────────────────────────
type ColLink      = { label: string; href: string }
type PlainCol     = { kind: 'plain';     heading: string; href: string; links: ColLink[] }
type AccordionCol = { kind: 'accordion'; heading: string; href: string; groups: { label: string; links: ColLink[] }[] }
type Col          = PlainCol | AccordionCol

const COLUMNS: Col[] = [
  {
    kind: 'plain',
    heading: 'Platform',
    href: '/platform',
    links: [
      { label: 'PureRevenue Platform', href: '/platform' },
      { label: 'Fees & Billing',       href: '/platform/fees-and-billing' },
      { label: 'Compensation',         href: '/platform/compensation' },
      { label: 'Practice Management',  href: '/platform/practice-management' },
    ],
  },
  {
    kind: 'accordion',
    heading: 'Why PureFacts',
    href: '/why-purefacts',
    groups: [
      {
        label: 'Industry Challenges',
        links: [
          { label: 'Complexity',  href: '/why-purefacts/complexity' },
          { label: 'Compression', href: '/why-purefacts/compression' },
          { label: 'Collection',  href: '/why-purefacts/collection' },
        ],
      },
      {
        label: 'Solutions',
        links: [
          { label: 'Compensation & Incentives', href: '/why-purefacts/compensation-and-incentives' },
          { label: 'Fee Billing',               href: '/why-purefacts/fee-billing' },
          { label: 'Insights & Analytics',      href: '/why-purefacts/insights-and-analytics' },
        ],
      },
      {
        label: 'Working With Us',
        links: [
          { label: 'Platform Approach',     href: '/why-purefacts/platform-approach' },
          { label: 'Deep Domain Expertise', href: '/why-purefacts/deep-domain-expertise' },
          { label: 'Our Process',           href: '/why-purefacts/our-process' },
        ],
      },
    ],
  },
  {
    kind: 'accordion',
    heading: 'Who We Serve',
    href: '/who-we-serve',
    groups: [
      {
        label: 'Industries',
        links: [
          { label: 'Wealth Management', href: '/who-we-serve/wealth-management' },
          { label: 'Asset Management',  href: '/who-we-serve/asset-management' },
          { label: 'Asset Servicing',   href: '/who-we-serve/asset-servicing' },
        ],
      },
      {
        label: 'Lines of Business',
        links: [
          { label: 'Finance',        href: '/who-we-serve/finance' },
          { label: 'Operations',     href: '/who-we-serve/operations' },
          { label: 'Head of Wealth', href: '/who-we-serve/head-of-wealth' },
        ],
      },
    ],
  },
  {
    kind: 'plain',
    heading: 'Company',
    href: '/about',
    links: [
      { label: 'About',      href: '/about' },
      { label: 'Leadership', href: '/about/leadership' },
      { label: 'Careers',    href: '/about/careers' },
      { label: 'Contact',    href: '/contact' },
    ],
  },
  {
    kind: 'plain',
    heading: 'Resources',
    href: '/resources',
    links: [
      { label: 'All Blogs',  href: '/resources' },
      { label: 'Events',     href: '/events' },
      { label: 'Newsletter', href: '/resources/newsletter' },
      { label: 'EV Simulator', href: '/resources/enterprise-value-simulator' },
    ],
  },
]

// ─── Social icons ─────────────────────────────────────────────────────────────
const SOCIALS = [
  {
    label: 'LinkedIn',
    href: 'http://linkedin.com/company/purefacts-financial-solutions-inc-/',
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/PureFactsFS/',
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.532-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/purefactslife/',
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162S8.597 18.163 12 18.163s6.162-2.759 6.162-6.162S15.403 5.838 12 5.838zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@purefactsfinancialsolutions/',
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
]

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden bg-[#0d0d0d] text-white" aria-label="Site footer">

      {/* Breathing glow keyframes */}
      <style>{`
        @keyframes footer-breathe-blue {
          0%, 100% { opacity: 0.12; transform: scale(1); }
          50%       { opacity: 0.22; transform: scale(1.12); }
        }
        @keyframes footer-breathe-orange {
          0%, 100% { opacity: 0.08; transform: scale(1); }
          50%       { opacity: 0.16; transform: scale(1.15); }
        }
        @keyframes footer-breathe-blue2 {
          0%, 100% { opacity: 0.06; transform: scale(1); }
          50%       { opacity: 0.13; transform: scale(1.10); }
        }
      `}</style>

      {/* Ambient glows */}
      <div aria-hidden="true" style={{ pointerEvents: 'none', position: 'absolute', zIndex: 0, top: '-10rem', left: '-8rem', width: '36rem', height: '36rem', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(59,132,255,0.22) 0%, transparent 68%)', filter: 'blur(48px)', animation: 'footer-breathe-blue 7s ease-in-out infinite' }} />
      <div aria-hidden="true" style={{ pointerEvents: 'none', position: 'absolute', zIndex: 0, bottom: '-4rem', right: '-6rem', width: '28rem', height: '28rem', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(251,86,7,0.16) 0%, transparent 68%)', filter: 'blur(48px)', animation: 'footer-breathe-orange 9s ease-in-out infinite 1.5s' }} />
      <div aria-hidden="true" style={{ pointerEvents: 'none', position: 'absolute', zIndex: 0, bottom: '2rem', left: '40%', width: '22rem', height: '22rem', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(59,132,255,0.10) 0%, transparent 68%)', filter: 'blur(56px)', animation: 'footer-breathe-blue2 11s ease-in-out infinite 3s' }} />

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr] lg:gap-14">

          {/* Left: logo + newsletter */}
          <div className="flex flex-col">
            <Link href="/" className="inline-block" aria-label="PureFacts home">
              <Image src="/logo-white.svg" alt="PureFacts" width={130} height={30} />
            </Link>
            <div className="mt-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-300">
                Join the Newsletter
              </p>
              <FooterNewsletterForm />
            </div>
          </div>

          {/* Right: 5 nav columns */}
          <nav aria-label="Footer navigation">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
              {COLUMNS.map(col => (
                <div key={col.heading}>
                  <Link
                    href={col.href}
                    className="text-xs font-semibold uppercase tracking-widest text-gray-300 transition-colors hover:text-white"
                  >
                    {col.heading}
                  </Link>

                  {col.kind === 'plain' && (
                    <ul className="mt-4 space-y-2.5">
                      {col.links.map(link => (
                        <li key={link.href}>
                          <Link href={link.href} className="text-sm text-gray-400 transition-colors hover:text-gray-200">
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  {col.kind === 'accordion' && (
                    <div className="mt-4">
                      {col.groups.map(group => (
                        <Accordion key={group.label} label={group.label} links={group.links} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-gray-600 sm:flex-row">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <p>© {year} PureFacts Financial Solutions. All rights reserved.</p>
            <Link href="/privacy" className="transition-colors hover:text-gray-400">Privacy Policy</Link>
            <Link href="/terms-of-use" className="transition-colors hover:text-gray-400">Terms of Use</Link>
          </div>
          <nav aria-label="Social media links">
            <div className="flex items-center gap-2">
              {SOCIALS.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`PureFacts on ${s.label}`}
                  className="flex h-8 w-8 items-center justify-center border border-white/10 text-gray-600 transition-colors hover:border-brand-blue hover:text-brand-blue"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </nav>
        </div>
      </div>

    </footer>
  )
}