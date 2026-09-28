'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NavColumn = {
  eyebrow: string
  eyebrowHref: string
  children: { label: string; href: string; description: string }[]
}

type NavItem = {
  label: string
  dropdownLabel?: string
  href?: string
  description?: string
  children?: { label: string; href: string; description: string }[]
  rowEyebrows?: [string?, string?]
  rowEyebrowHrefs?: [string?, string?]
  columns?: NavColumn[]
}

// ---------------------------------------------------------------------------
// Nav data
// ---------------------------------------------------------------------------

const NAV: NavItem[] = [
  {
    label: 'Platform',
    dropdownLabel: 'The PureRevenue Platform',
    href: '/platform',
    description: 'One platform. Complete revenue intelligence for wealth and asset managers.',
    children: [
      { label: 'PureFees',    href: '/platform/fees-and-billing',    description: 'Automate fee billing and eliminate revenue leakage.' },
      { label: 'PureRewards', href: '/platform/compensation', description: 'Streamline advisor compensation and incentive programs.' },
      { label: 'PureReports', href: '/platform/purereports', description: 'Deliver personalized, compliant client reporting at scale.' },
    ],
  },
  {
    label: 'Why PureFacts',
    href: '/why-purefacts',
    description: 'Most firms leak 1 to 3% of revenue annually. See how PureFacts closes the gap.',
    columns: [
      {
        eyebrow: 'Industry Challenges',
        eyebrowHref: '/why-purefacts/industry-challenges',
        children: [
          { label: 'Complexity',  href: '/why-purefacts/complexity',  description: 'Navigate the layers of pricing, billing and compliance with confidence.' },
          { label: 'Compression', href: '/why-purefacts/compression', description: 'Combat margin pressure with smarter revenue operations.' },
          { label: 'Collection',  href: '/why-purefacts/collection',  description: 'Ensure every dollar billed is a dollar collected.' },
        ],
      },
      {
        eyebrow: 'Solutions',
        eyebrowHref: '/why-purefacts/solutions',
        children: [
          { label: 'Compensation & Incentives', href: '/why-purefacts/compensation-and-incentives', description: 'Pay advisors accurately and motivate the right behaviors.' },
          { label: 'Fee Billing',               href: '/why-purefacts/fee-billing',                 description: 'End billing errors and manual workarounds for good.' },
          { label: 'Insights & Analytics',      href: '/why-purefacts/insights-and-analytics',      description: 'Turn revenue data into decisions that drive growth.' },
        ],
      },
      {
        eyebrow: 'Working with Us',
        eyebrowHref: '/why-purefacts/working-with-us',
        children: [
          { label: 'Platform Approach',     href: '/why-purefacts/platform-approach',     description: 'How our technology is built to adapt to your business.' },
          { label: 'Deep Domain Expertise', href: '/why-purefacts/deep-domain-expertise', description: 'Decades of WealthTech knowledge embedded in every product.' },
          { label: 'Our Process',           href: '/why-purefacts/our-process',           description: 'A proven implementation and partnership model.' },
        ],
      },
    ],
  },
  {
    label: 'Who We Serve',
    href: '/who-we-serve',
    description: 'PureFacts adapts to how your team works: from the CFO to the operations analyst.',
    rowEyebrows: ['Industries', 'Lines of Business'],
    rowEyebrowHrefs: ['/who-we-serve', '/who-we-serve'],
    children: [
      { label: 'Wealth Management', href: '/who-we-serve/wealth-management', description: 'Built for the complexity of modern wealth management firms.' },
      { label: 'Asset Management',  href: '/who-we-serve/asset-management',  description: 'Revenue operations precision for asset managers globally.' },
      { label: 'Asset Servicing',   href: '/who-we-serve/asset-servicing',   description: 'Scalable fee and billing infrastructure for servicers.' },
      { label: 'Finance',           href: '/who-we-serve/finance',           description: 'Revenue clarity for finance leaders across the enterprise.' },
      { label: 'Operations',        href: '/who-we-serve/operations',        description: 'Streamline revenue operations from billing to reconciliation.' },
      { label: 'Head of Wealth',    href: '/who-we-serve/head-of-wealth',    description: 'Strategic tools for wealth leaders driving firm-wide growth.' },
    ],
  },
  {
    label: 'About',
    dropdownLabel: 'About PureFacts',
    href: '/about',
    description: 'Our story, mission and the team building the future of WealthTech.',
    children: [
      { label: 'Leadership', href: '/about/leadership', description: 'Meet the executives leading PureFacts forward.' },
      { label: 'Careers',    href: '/about/careers',    description: 'Join a team building the future of WealthTech.' },
      { label: 'Newsroom',   href: '/about/newsroom',   description: 'Press releases, coverage and company updates.' },
    ],
  },
  {
    label: 'Resources',
    href: '/resources',
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Nav() {
  const [open, setOpen] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm"
      onMouseLeave={() => setOpen(null)}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6" aria-label="Main navigation">

        <Link href="/" className="shrink-0" onClick={() => setOpen(null)} aria-label="PureFacts home">
          <Image src="/logo.svg" alt="PureFacts" width={140} height={32} priority />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex" role="menubar">
          {NAV.map(item => (
            <li key={item.label} role="none">
              {(item.children || item.columns) ? (
                <button
                  onMouseEnter={() => setOpen(item.label)}
                  onFocus={() => setOpen(item.label)}
                  onClick={() => setOpen(open === item.label ? null : item.label)}
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors
                    ${open === item.label ? 'text-brand-blue' : 'text-brand-off-black hover:text-brand-blue'}`}
                  aria-expanded={open === item.label}
                  aria-haspopup="true"
                  role="menuitem"
                >
                  {item.label}
                  <ChevronIcon open={open === item.label} />
                </button>
              ) : (
                <Link
                  href={item.href!}
                  className="rounded-md px-3 py-2 text-sm font-medium text-brand-off-black transition-colors hover:text-brand-blue"
                  role="menuitem"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <Link href="/contact" className="btn-secondary">
            Get in Contact
          </Link>
        </div>

        <button
          className="lg:hidden p-2 text-brand-off-black"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? <XIcon /> : <MenuIcon />}
        </button>
      </nav>

      {/* ------------------------------------------------------------------ */}
      {/* Mega menu                                                           */}
      {/* ------------------------------------------------------------------ */}
      {open && (
        <div className="absolute left-0 top-16 w-full bg-white shadow-xl" role="region" aria-label={`${open} menu`}>
          <div className="mx-auto max-w-7xl px-6 py-8">
            {NAV.filter(i => i.label === open).map(item => (
              <div key={item.label}>

                {item.href && (
                  <Link
                    href={item.href}
                    onClick={() => setOpen(null)}
                    className="group mb-4 inline-flex flex-col border-b border-gray-100 pb-4 w-full"
                  >
                    <span className="text-sm font-bold text-brand-off-black group-hover:text-brand-blue transition-colors">
                      {item.dropdownLabel ?? item.label}
                    </span>
                    {item.description && (
                      <span className="mt-0.5 text-xs text-gray-500 leading-snug">
                        {item.description}
                      </span>
                    )}
                  </Link>
                )}

                {item.columns ? (
                  <div className="grid grid-cols-3 gap-x-8">
                    {item.columns.map(col => (
                      <div key={col.eyebrowHref}>
                        <Link
                          href={col.eyebrowHref}
                          onClick={() => setOpen(null)}
                          className="mb-2 block px-3 text-xs font-semibold uppercase tracking-wider text-brand-blue hover:opacity-70 transition-opacity"
                        >
                          {col.eyebrow}
                        </Link>
                        <ul>
                          {col.children.map(child => (
                            <ChildLink key={child.href} child={child} onClose={() => setOpen(null)} />
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : item.rowEyebrows ? (
                  <div className="flex flex-col gap-3">
                    <div>
                      {item.rowEyebrowHrefs?.[0] ? (
                        <Link href={item.rowEyebrowHrefs[0]} onClick={() => setOpen(null)} className="mb-2 block px-3 text-xs font-semibold uppercase tracking-wider text-brand-blue hover:opacity-70 transition-opacity">
                          {item.rowEyebrows[0]}
                        </Link>
                      ) : (
                        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-brand-blue">{item.rowEyebrows[0]}</p>
                      )}
                      <ul className="grid grid-cols-3 gap-x-8 gap-y-1">
                        {item.children?.slice(0, 3).map(child => (
                          <ChildLink key={child.href} child={child} onClose={() => setOpen(null)} />
                        ))}
                      </ul>
                    </div>
                    {(item.children?.length ?? 0) > 3 && (
                      <div className="border-t border-gray-100 pt-3">
                        {item.rowEyebrowHrefs?.[1] ? (
                          <Link href={item.rowEyebrowHrefs[1]} onClick={() => setOpen(null)} className="mb-2 block px-3 text-xs font-semibold uppercase tracking-wider text-brand-blue hover:opacity-70 transition-opacity">
                            {item.rowEyebrows[1]}
                          </Link>
                        ) : (
                          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-brand-blue">{item.rowEyebrows[1]}</p>
                        )}
                        <ul className="grid grid-cols-3 gap-x-8 gap-y-1">
                          {item.children?.slice(3).map(child => (
                            <ChildLink key={child.href} child={child} onClose={() => setOpen(null)} />
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <ul className="grid grid-cols-3 gap-x-8 gap-y-1">
                    {item.children?.map(child => (
                      <ChildLink key={child.href} child={child} onClose={() => setOpen(null)} />
                    ))}
                  </ul>
                )}

              </div>
            ))}
          </div>
          <div className="h-[2px] w-full bg-brand-gradient" aria-hidden="true" />
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Mobile menu                                                         */}
      {/* ------------------------------------------------------------------ */}
      {mobileOpen && (
        <div id="mobile-menu" className="lg:hidden border-t border-gray-100 bg-white">
          <ul className="divide-y divide-gray-100">
            {NAV.map(item => (
              <li key={item.label}>
                {(item.children || item.columns) ? (
                  <>
                    <button
                      className="flex w-full items-center justify-between px-6 py-4 text-sm font-semibold text-brand-off-black"
                      onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                      aria-expanded={mobileExpanded === item.label}
                      aria-controls={`mobile-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {item.label}
                      <ChevronIcon open={mobileExpanded === item.label} />
                    </button>
                    {mobileExpanded === item.label && (
                      <ul id={`mobile-${item.label.toLowerCase().replace(/\s+/g, '-')}`} className="bg-gray-50 px-6 pb-4">
                        {item.href && (
                          <li>
                            <Link
                              href={item.href}
                              onClick={() => setMobileOpen(false)}
                              className="block py-2.5 text-sm font-semibold text-brand-blue"
                            >
                              All {item.label} →
                            </Link>
                          </li>
                        )}
                        {item.columns ? item.columns.map(col => (
                          <li key={col.eyebrowHref}>
                            <Link
                              href={col.eyebrowHref}
                              onClick={() => setMobileOpen(false)}
                              className="mt-3 block pb-0.5 text-xs font-semibold uppercase tracking-wider text-brand-blue"
                            >
                              {col.eyebrow}
                            </Link>
                            <ul>
                              {col.children.map(child => (
                                <li key={child.href}>
                                  <Link
                                    href={child.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="block py-2 text-sm text-gray-700 hover:text-brand-blue"
                                  >
                                    {child.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </li>
                        )) : item.rowEyebrows ? (
                          <>
                            {item.rowEyebrowHrefs?.[0] ? (
                              <li><Link href={item.rowEyebrowHrefs[0]} onClick={() => setMobileOpen(false)} className="mt-3 block pb-0.5 text-xs font-semibold uppercase tracking-wider text-brand-blue">{item.rowEyebrows[0]}</Link></li>
                            ) : (
                              <li className="mt-3 pb-0.5 text-xs font-semibold uppercase tracking-wider text-brand-blue">{item.rowEyebrows[0]}</li>
                            )}
                            {item.children?.slice(0, 3).map(child => (
                              <li key={child.href}><Link href={child.href} onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-gray-700 hover:text-brand-blue">{child.label}</Link></li>
                            ))}
                            {(item.children?.length ?? 0) > 3 && (
                              <>
                                {item.rowEyebrowHrefs?.[1] ? (
                                  <li><Link href={item.rowEyebrowHrefs[1]} onClick={() => setMobileOpen(false)} className="mt-3 block pb-0.5 text-xs font-semibold uppercase tracking-wider text-brand-blue">{item.rowEyebrows[1]}</Link></li>
                                ) : (
                                  <li className="mt-3 pb-0.5 text-xs font-semibold uppercase tracking-wider text-brand-blue">{item.rowEyebrows[1]}</li>
                                )}
                                {item.children?.slice(3).map(child => (
                                  <li key={child.href}><Link href={child.href} onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-gray-700 hover:text-brand-blue">{child.label}</Link></li>
                                ))}
                              </>
                            )}
                          </>
                        ) : item.children?.map(child => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              className="block py-2.5 text-sm text-gray-700 hover:text-brand-blue"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href!}
                    onClick={() => setMobileOpen(false)}
                    className="block px-6 py-4 text-sm font-semibold text-brand-off-black hover:text-brand-blue"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
            <li className="px-6 py-4">
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="btn-secondary block w-full text-center"
              >
                Get in Contact
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}

// ---------------------------------------------------------------------------
// Shared child link component
// ---------------------------------------------------------------------------

function ChildLink({
  child,
  onClose,
}: {
  child: { label: string; href: string; description: string }
  onClose: () => void
}) {
  return (
    <li>
      <Link
        href={child.href}
        onClick={onClose}
        className="group flex flex-col rounded-lg p-3 transition-colors hover:bg-gray-50"
      >
        <span className="text-sm font-semibold text-brand-off-black group-hover:text-brand-blue">
          {child.label}
        </span>
        <span className="mt-0.5 text-xs text-gray-500 leading-snug">
          {child.description}
        </span>
      </Link>
    </li>
  )
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}
function MenuIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}
function XIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}