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
  layout?: 'side-panel'
  panelLogo?: string
  ctaLabel?: string
  children?: { label: string; href: string; description: string; icon?: string; iconColor?: string }[]
  panelRowEyebrows?: { label: string; href: string }[]
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
    layout: 'side-panel',
    panelLogo: '/PureRevenueWhite.svg',
    ctaLabel: 'Explore the Platform',
    description: 'One platform. Complete revenue intelligence for wealth and asset managers.',
    children: [
      { label: 'Practice Management', href: '/platform/practice-management', description: 'AI-powered insights to optimize growth', icon: 'fa-solid fa-chart-line', iconColor: '#ffb30c' },
      { label: 'Compensation', href: '/platform/compensation', description: 'Streamline advisor compensation and incentive programs.', icon: 'fa-solid fa-coins', iconColor: '#FF006E' },
      { label: 'Fees & Billing', href: '/platform/fees-and-billing', description: 'Automate fee billing and eliminate revenue leakage.', icon: 'fa-solid fa-file-invoice-dollar', iconColor: '#ED65D0' },
      { label: 'Revenue Book of Record', href: '/platform/revenue-book-of-record', description: 'The authoritative commercial data layer', icon: 'fa-solid fa-database', iconColor: '#3b84ff' },
    ],
  },
  {
    label: 'Why PureFacts',
    href: '/why-purefacts',
    layout: 'side-panel',
    ctaLabel: 'Explore Why PureFacts',
    description: 'Most firms leak 1 to 3% of revenue annually. See how PureFacts closes the gap.',
    panelRowEyebrows: [
      { label: 'Industry Challenges', href: '/why-purefacts/industry-challenges' },
      { label: 'Solutions', href: '/why-purefacts/solutions' },
      { label: 'Working with Us', href: '/why-purefacts/working-with-us' },
    ],
    children: [
      // Row 1 — Industry Challenges
      { label: 'Compression', href: '/why-purefacts/compression', description: 'Combat margin pressure with smarter revenue operations.', icon: 'fa-solid fa-compress' },
      { label: 'Collection', href: '/why-purefacts/collection', description: 'Ensure every dollar billed is a dollar collected.', icon: 'fa-solid fa-circle-dollar-to-slot' },
      { label: 'Complexity', href: '/why-purefacts/complexity', description: 'Navigate the layers of pricing, billing and compliance with confidence.', icon: 'fa-solid fa-layer-group' },
      // Row 2 — Solutions
      { label: 'Fee Billing', href: '/why-purefacts/fee-billing', description: 'End billing errors and manual workarounds for good.', icon: 'fa-solid fa-receipt' },
      { label: 'Compensation & Incentives', href: '/why-purefacts/compensation-and-incentives', description: 'Pay advisors accurately and motivate the right behaviors.', icon: 'fa-solid fa-hand-holding-dollar' },
      { label: 'Practice Management', href: '/why-purefacts/practice-management', description: 'Turn advisor decisions into organic growth.', icon: 'fa-solid fa-chart-bar' },
      // Row 3 — Working with Us
      { label: 'Deep Domain Expertise', href: '/why-purefacts/deep-domain-expertise', description: 'Decades of wealth management knowledge embedded in every product.', icon: 'fa-solid fa-brain' },
      { label: 'Platform Approach', href: '/why-purefacts/platform-approach', description: 'How our technology is built to adapt to your business.', icon: 'fa-solid fa-puzzle-piece' },
      { label: 'Our Process', href: '/why-purefacts/our-process', description: 'A proven implementation and partnership model.', icon: 'fa-solid fa-diagram-project' },
    ],
  },
  {
    label: 'Who We Serve',
    href: '/who-we-serve',
    layout: 'side-panel',
    ctaLabel: 'See Who We Serve',
    description: 'PureFacts adapts to how your team works: from the CFO to the operations analyst.',
    panelRowEyebrows: [
      { label: 'Industries', href: '/who-we-serve' },
      { label: 'Lines of Business', href: '/who-we-serve' },
    ],
    children: [
      { label: 'Wealth Management', href: '/who-we-serve/wealth-management', description: 'Built for the complexity of modern wealth management firms.', icon: 'fa-solid fa-building-columns' },
      { label: 'Asset Management', href: '/who-we-serve/asset-management', description: 'Revenue operations precision for asset managers globally.', icon: 'fa-solid fa-chart-pie' },
      { label: 'Asset Servicing', href: '/who-we-serve/asset-servicing', description: 'Scalable fee and billing infrastructure for servicers.', icon: 'fa-solid fa-server' },
      { label: 'Finance', href: '/who-we-serve/finance', description: 'Revenue clarity for finance leaders across the enterprise.', icon: 'fa-solid fa-calculator' },
      { label: 'Head of Wealth', href: '/who-we-serve/head-of-wealth', description: 'Strategic tools for wealth leaders driving firm-wide growth.', icon: 'fa-solid fa-crown' },
      { label: 'Operations', href: '/who-we-serve/operations', description: 'Streamline revenue operations from billing to reconciliation.', icon: 'fa-solid fa-gears' },
    ],
  },
  {
    label: 'About',
    dropdownLabel: 'Overview',
    href: '/about',
    layout: 'side-panel',
    ctaLabel: 'Learn about PureFacts',
    description: 'Our story, mission and the team building the future of revenue performance.',
    children: [
      { label: 'Leadership', href: '/about/leadership', description: 'Meet the executives leading PureFacts forward.', icon: 'fa-solid fa-people-group' },
      { label: 'Careers', href: '/about/careers', description: 'Join a team building the future of growth.', icon: 'fa-solid fa-briefcase' },
      { label: 'Newsroom', href: '/about/newsroom', description: 'Press releases, coverage and company updates.', icon: 'fa-solid fa-newspaper' },
      { label: 'Partner', href: '/about/partner', description: 'Partnerships designed for the way you work.', icon: 'fa-solid fa-users-viewfinder' },
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

export default function NavDark() {
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
      className="sticky top-0 z-50 w-full border-b border-white/10 bg-brand-off-black shadow-sm"
      onMouseLeave={() => setOpen(null)}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6" aria-label="Main navigation">
        <Link href="/" className="shrink-0" onClick={() => setOpen(null)} aria-label="PureFacts home">
          <Image src="/logo-white.svg" alt="PureFacts" width={140} height={32} priority />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex flex-1 justify-center" role="menubar">
          {NAV.map(item => (
            <li key={item.label} role="none">
              {item.children ? (
                  <Link
                    href={item.href!}
                    onMouseEnter={() => setOpen(item.label)}
                    onFocus={() => setOpen(item.label)}
                    onClick={() => setOpen(null)}
                    className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors
                      ${open === item.label ? 'text-brand-blue' : 'text-white hover:text-brand-blue'}`}
                    aria-expanded={open === item.label}
                    aria-haspopup="true"
                    role="menuitem"
                  >
                    {item.label}
                    <ChevronIcon open={open === item.label} />
                  </Link>
                ) : (
                <Link
                  href={item.href!}
                  className="rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:text-brand-blue"
                  role="menuitem"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <Link href="/resources/enterprise-value-simulator" className="btn-orange">
            EV Calculator
          </Link>
          <Link href="/contact" className="btn-primary">
            Get in Contact
          </Link>
        </div>

        <button
          className="lg:hidden p-2 text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu-dark"
        >
          {mobileOpen ? <XIcon /> : <MenuIcon />}
        </button>
      </nav>

      {open && (
        <div className="absolute left-0 top-16 w-full bg-brand-off-black shadow-xl shadow-black/40" role="region" aria-label={`${open} menu`}>
          <div className="mx-auto max-w-7xl px-6 py-8">
            {NAV.filter(i => i.label === open).map(item => (
              <div key={item.label}>
                {item.layout === 'side-panel' && item.children && (
                  <div className="flex gap-10">

                    {/* Left: overview panel */}
                    <div className="w-56 shrink-0 flex flex-col items-start justify-start">
                      {item.panelLogo && item.href ? (
                        <Link href={item.href} onClick={() => setOpen(null)} className="group mb-3 inline-block">
                          <Image
                            src={item.panelLogo}
                            alt="PureRevenue Platform"
                            width={120}
                            height={24}
                            className="h-auto w-auto max-w-[120px] opacity-90 transition-opacity group-hover:opacity-100"
                          />
                        </Link>
                      ) : item.href ? (
                        <Link href={item.href} onClick={() => setOpen(null)} className="group mb-3 flex flex-col">
                          <span className="text-sm font-bold text-white group-hover:text-brand-blue transition-colors leading-snug">
                            {item.dropdownLabel ?? item.label}
                          </span>
                        </Link>
                      ) : null}
                      {item.description && (
                        <span className="mt-0 text-xs text-white/60 leading-relaxed">
                          {item.description}
                        </span>
                      )}
                      {item.href && (
                        <Link href={item.href} onClick={() => setOpen(null)} className="btn-alt mt-5 text-center text-xs">
                          {item.ctaLabel ?? `Explore ${item.label}`}
                        </Link>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="w-px self-stretch bg-white/10" aria-hidden="true" />

                    {/* Right: rows with eyebrow headings (3 items per row) or plain 2-col grid */}
                    {item.panelRowEyebrows ? (
                      <div className="flex-1 flex flex-col gap-4">
                        {item.panelRowEyebrows.map((eyebrow, rowIdx) => {
                          const rowChildren = item.children!.slice(rowIdx * 3, rowIdx * 3 + 3)
                          return (
                            <div key={eyebrow.href + rowIdx}>
                              <Link
                                href={eyebrow.href}
                                onClick={() => setOpen(null)}
                                className="mb-2 block px-3 text-xs font-semibold uppercase tracking-wider text-brand-orange hover:opacity-70 transition-opacity"
                              >
                                {eyebrow.label}
                              </Link>
                              <ul className="grid grid-cols-3 gap-x-2 gap-y-1">
                                {rowChildren.map(child => (
                                  <IconChildLink key={child.href} child={child} onClose={() => setOpen(null)} />
                                ))}
                              </ul>
                              {rowIdx < item.panelRowEyebrows!.length - 1 && (
                                <div className="mt-4 h-px w-full bg-white/10" aria-hidden="true" />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <ul className="flex-1 grid grid-cols-2 gap-x-8 gap-y-1 content-start">
                        {item.children.map(child => (
                          <IconChildLink key={child.href} child={child} onClose={() => setOpen(null)} />
                        ))}
                      </ul>
                    )}

                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="h-[2px] w-full bg-brand-gradient" aria-hidden="true" />
        </div>
      )}

      {mobileOpen && (
        <div id="mobile-menu-dark" className="lg:hidden border-t border-white/10 bg-brand-off-black">
          <ul className="divide-y divide-white/10">
            {NAV.map(item => (
              <li key={item.label}>
                {item.children ? (
                  <>
                    <button
                      className="flex w-full items-center justify-between px-6 py-4 text-sm font-semibold text-white"
                      onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                      aria-expanded={mobileExpanded === item.label}
                      aria-controls={`mobile-dark-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {item.label}
                      <ChevronIcon open={mobileExpanded === item.label} />
                    </button>
                    {mobileExpanded === item.label && (
                      <ul id={`mobile-dark-${item.label.toLowerCase().replace(/\s+/g, '-')}`} className="bg-white/5 px-6 pb-4">
                        {item.href && (
                          <li>
                            <Link
                              href={item.href}
                              onClick={() => setMobileOpen(false)}
                              className="block py-2.5 text-sm font-semibold text-brand-blue"
                            >
                              All {item.label} &rarr;
                            </Link>
                          </li>
                        )}
                        {item.panelRowEyebrows ? item.panelRowEyebrows.map((eyebrow, rowIdx) => (
                          <li key={eyebrow.href + rowIdx}>
                            <Link
                              href={eyebrow.href}
                              onClick={() => setMobileOpen(false)}
                              className="mt-3 block pb-0.5 text-xs font-semibold uppercase tracking-wider text-brand-orange"
                            >
                              {eyebrow.label}
                            </Link>
                            <ul>
                              {item.children!.slice(rowIdx * 3, rowIdx * 3 + 3).map(child => (
                                <li key={child.href}>
                                  <Link
                                    href={child.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="block py-2 text-sm text-white/70 hover:text-white"
                                  >
                                    {child.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </li>
                        )) : item.children.map(child => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              className="block py-2.5 text-sm text-white/70 hover:text-white"
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
                    className="block px-6 py-4 text-sm font-semibold text-white hover:text-brand-blue"
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
                className="btn-primary block w-full text-center"
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
// Icon child link (all side-panel items)
// ---------------------------------------------------------------------------

function IconChildLink({
  child,
  onClose,
}: {
  child: { label: string; href: string; description: string; icon?: string; iconColor?: string }
  onClose: () => void
}) {
  return (
    <li>
      <Link
        href={child.href}
        onClick={onClose}
        className="group flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-white/10"
      >
        {child.icon && (
          <span
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white/[0.07] transition-colors group-hover:text-brand-blue"
            style={{ color: child.iconColor ?? 'rgba(255,255,255,0.7)' }}
          >
            <i className={`${child.icon} text-sm`} aria-hidden="true" />
          </span>
        )}
        <span className="flex flex-col">
          <span className="text-sm font-semibold text-white group-hover:text-brand-blue transition-colors">
            {child.label}
          </span>
          <span className="mt-0.5 text-xs text-white/60 leading-snug">
            {child.description}
          </span>
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