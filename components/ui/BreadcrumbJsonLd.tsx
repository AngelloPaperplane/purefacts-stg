// components/ui/BreadcrumbJsonLd.tsx
// Invisible breadcrumb structured data for SEO (BreadcrumbList schema).
// Renders a JSON-LD script tag via Next.js Script.
// No visible UI. Auto-generates from pathname — no Sanity config needed.
//
// Usage:
//   <BreadcrumbJsonLd pathname="/blog/my-post-slug" label="My Post Title" />
//
// For static pages:
//   <BreadcrumbJsonLd pathname="/platform/fees-and-billing" />
//
// Pass an explicit `label` prop to override the final segment (recommended
// for all dynamic pages where the slug is not human-readable).

import Script from 'next/script'

const SEGMENT_LABELS: Record<string, string> = {
  'platform':                  'Platform',
  'fees-and-billing':          'Fees & Billing',
  'compensation':              'Compensation',
  'practice-management':       'Practice Management',
  'revenue-book-of-record':    'Revenue Book of Record',
  'fee-manager':               'Fee Manager',
  'why-purefacts':             'Why PureFacts',
  'compression':               'Fee Compression',
  'complexity':                'Billing Complexity',
  'collection':                'Revenue Collection',
  'deep-domain-expertise':     'Deep Domain Expertise',
  'platform-approach':         'Platform Approach',
  'our-process':               'Our Process',
  'who-we-serve':              'Who We Serve',
  'wealth-management':         'Wealth Management',
  'asset-management':          'Asset Management',
  'asset-servicing':           'Asset Servicing',
  'finance':                   'Finance',
  'operations':                'Operations',
  'head-of-wealth':            'Head of Wealth',
  'about':                     'About',
  'leadership':                'Leadership',
  'careers':                   'Careers',
  'resources':                 'Resources',
  'your-journey':              'Your Journey',
  'newsletter':                'Newsletter',
  'ev-calculator':             'EV Calculator',
  'blog':                      'Blog',
  'case-study':                'Case Studies',
  'whitepaper':                'Whitepapers',
  'news':                      'News',
  'press-release':             'Press Releases',
  'awards':                    'Awards',
  'topic':                     'Topics',
  'contact':                   'Contact',
}

const BASE_URL = 'https://purefacts.com'

function segmentToLabel(segment: string): string {
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment]
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

interface BreadcrumbJsonLdProps {
  pathname: string
  label?: string
}

export default function BreadcrumbJsonLd({ pathname, label }: BreadcrumbJsonLdProps) {
  const segments = pathname.replace(/\/$/, '').split('/').filter(Boolean)

  const crumbs: { name: string; item: string }[] = [
    { name: 'Home', item: BASE_URL },
  ]

  segments.forEach((segment, index) => {
    const path   = '/' + segments.slice(0, index + 1).join('/')
    const isLast = index === segments.length - 1
    const name   = isLast && label ? label : segmentToLabel(segment)
    crumbs.push({ name, item: `${BASE_URL}${path}` })
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type':    'ListItem',
      position:   index + 1,
      name:       crumb.name,
      item:       crumb.item,
    })),
  }

  return (
    <Script
      id={`breadcrumb-${pathname.replace(/\//g, '-')}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}