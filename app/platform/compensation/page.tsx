import type { Metadata } from 'next'
import Script from 'next/script'
import CompensationClient from '@/components/sections/CompensationClient'
import { getPurerewardsSettings } from '@/lib/sanity/queries'
import { ogImage } from '@/lib/og'

export const metadata: Metadata = {
  title: 'Advisor Compensation Software for Wealth & Asset Managers',
  description:
    'Automates advisor payout calculations, aligns incentives with firm goals, and gives wealth management firms accurate, audit-ready compensation at scale.',
  alternates: {
    canonical: 'https://purefacts.com/platform/compensation',
  },
  openGraph: {
    title: 'Advisor Compensation Software for Wealth & Asset Managers',
    description:
      'Automates advisor payout calculations, aligns incentives with firm goals, and gives wealth management firms accurate, audit-ready compensation at scale.',
    url: 'https://purefacts.com/platform/compensation',
    siteName: 'PureFacts',
    images: [
      {
        url: ogImage(),
        width: 1200,
        height: 630,
        alt: 'PureFacts Advisor Compensation Software',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Advisor Compensation Software for Wealth & Asset Managers',
    description:
      'Automates advisor payout calculations, aligns incentives with firm goals, and gives wealth management firms accurate, audit-ready compensation at scale.',
    images: [ogImage()],
  },
}

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://purefacts.com/platform/compensation#software',
      name: 'PureFacts Compensation',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        'Advisor compensation software for wealth and asset management firms. Automates multi-variable payout calculations, aligns incentive programs with firm goals, and delivers audit-ready compensation records with full transparency for advisors and leadership.',
      url: 'https://purefacts.com/platform/compensation',
      provider: {
        '@type': 'Organization',
        name: 'PureFacts Financial Solutions',
        url: 'https://purefacts.com',
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Enterprise pricing — contact PureFacts for a custom quote.',
      },
      featureList: [
        'Automated multi-variable advisor payout calculations',
        'Incentive program design and goal alignment',
        'Grid-based and custom compensation structures',
        'Full payout audit trail and governance controls',
        'Advisor-facing compensation transparency and statements',
        'Integration with Revenue Book of Record',
      ],
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://purefacts.com/platform/compensation#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://purefacts.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Platform',
          item: 'https://purefacts.com/platform',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Compensation',
          item: 'https://purefacts.com/platform/compensation',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://purefacts.com/platform/compensation#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is advisor compensation software for wealth management?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Advisor compensation software for wealth management automates the calculation, validation, and distribution of advisor payouts based on complex plan structures including grid-based, tiered, and goal-linked arrangements. It replaces manual spreadsheet-driven processes with a rules engine that ensures accuracy, auditability, and consistency across every advisor, region, and payout cycle.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does incentive compensation software improve advisor retention?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Inaccurate or opaque compensation is one of the leading causes of advisor dissatisfaction and attrition. Incentive compensation software improves retention by ensuring every payout is calculated correctly, delivered on time, and backed by a clear statement that advisors can review on demand. When advisors trust their compensation, they spend less time disputing payouts and more time focused on clients and growth.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the difference between incentive compensation management and payroll?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Payroll processes fixed salaries and statutory deductions. Incentive compensation management handles the variable, performance-linked component of advisor pay, including grid-based production credits, trailing commissions, bonuses, and override structures. These calculations require a purpose-built engine that understands AUM-based revenue, fee splits, and the business rules specific to wealth and asset management.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can compensation software handle grid-based advisor payout structures?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Purpose-built advisor compensation platforms like PureFacts Compensation are designed to handle grid-based payout structures, where production credits move an advisor into higher payout tiers as thresholds are met. The platform applies the correct grid rate at each level, accounts for overrides and adjustments, and produces a traceable calculation that advisors and compliance teams can audit.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does advisor compensation software integrate with fee billing systems?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'In a connected revenue management platform, compensation flows directly from the same data that drives fee billing. PureFacts Compensation sits on top of the Revenue Book of Record, drawing from the same client, account, and fee data used for billing. This eliminates the reconciliation gap between what was billed and what was paid out, and ensures that compensation calculations always reflect current revenue performance.',
          },
        },
      ],
    },
  ],
}

export default async function CompensationPage() {
  const settings = await getPurerewardsSettings()
  const logos = settings?.clientLogos ?? []
  const heroImage = settings?.heroImage ?? null

  return (
    <>
      <Script
        id="compensation-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <CompensationClient heroImage={heroImage} logos={logos} />
    </>
  )
}