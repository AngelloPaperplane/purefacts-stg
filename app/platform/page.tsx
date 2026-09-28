import type { Metadata } from 'next'
import Script from 'next/script'
import NewPlatformClient from './PlatformClient'
import { getPlatformSettings } from '@/lib/sanity/queries'
import { ogImage } from '@/lib/og'

export const metadata: Metadata = {
  title: 'Revenue Management Software for Wealth and Asset Managers',
  description:
    'PureRevenue is the leading solution for wealth firms optimizing fee billing, advisor compensation, and practice performance for profitable organic growth.',
  alternates: {
    canonical: 'https://purefacts.com/platform',
  },
  openGraph: {
    title: 'Revenue Management Software for Wealth and Asset Managers',
    description:
      'PureRevenue is the leading solution for wealth firms optimizing fee billing, advisor compensation, and practice performance for profitable organic growth.',
    url: 'https://purefacts.com/platform',
    siteName: 'PureFacts',
    images: [
      {
        url: ogImage(),
        width: 1200,
        height: 630,
        alt: 'PureRevenue Platform — Revenue Management Software by PureFacts',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Revenue Management Software for Wealth and Asset Managers',
    description:
      'PureRevenue is the leading solution for wealth firms optimizing fee billing, advisor compensation, and practice performance for profitable organic growth.',
    images: [ogImage()],
  },
}

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://purefacts.com/platform#software',
      name: 'PureRevenue Platform',
      alternateName: 'PureRevenue',
      description:
        'PureRevenue is revenue management software for wealth and asset managers that connects Fees and Billing, Compensation, and Practice Management on a single Revenue Book of Record. Designed to automate revenue operations, eliminate billing leakage, and improve advisor compensation accuracy.',
      applicationCategory: 'FinancialApplication',
      operatingSystem: 'Web',
      url: 'https://purefacts.com/platform',
      offers: {
        '@type': 'Offer',
        url: 'https://purefacts.com/contact',
      },
      provider: {
        '@type': 'Organization',
        '@id': 'https://purefacts.com/#organization',
        name: 'PureFacts',
      },
      featureList: [
        'Automated fee billing and schedule management',
        'Advisor compensation and incentive management',
        'Practice management and revenue analytics',
        'Revenue Book of Record',
        'Audit-ready billing controls',
      ],
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://purefacts.com/platform#breadcrumb',
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
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://purefacts.com/platform#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is PureRevenue and how does it work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'PureRevenue is revenue management software for wealth and asset managers built by PureFacts. It connects Fees and Billing, Compensation, and Practice Management on a single Revenue Book of Record, automating complex fee calculations, advisor payout workflows, and practice-level revenue reporting from one integrated platform.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does PureFacts connect fee billing, compensation, and practice management?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'All three modules in the PureRevenue platform share a common data foundation called the Revenue Book of Record. Fee billing, advisor compensation, and practice management analytics all draw from the same client, account, contract, and pricing data. There is no reconciliation between systems, no manual data transfers, and one consistent view of revenue across the firm.',
          },
        },
        {
          '@type': 'Question',
          name: 'What types of financial firms use PureRevenue?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'PureRevenue is used by wealth management firms, asset managers, broker-dealers, banks, custodians, and family offices. The platform is built for enterprises managing complex fee schedules, large advisor populations, and high volumes of automated billing and compensation workflows.',
          },
        },
        {
          '@type': 'Question',
          name: 'How is a connected revenue platform different from point solutions?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Point solutions handle individual tasks in isolation. A connected revenue platform like PureRevenue links fee billing, advisor compensation, and practice management to a single data foundation. This eliminates reconciliation gaps, surfaces cross-system insights such as pricing exceptions and advisor performance signals, and lets improvements in one area compound across the business rather than staying isolated.',
          },
        },
      ],
    },
  ],
}

export default async function NewPlatformPage() {
  const settings = await getPlatformSettings()
  const logos = settings?.clientLogos ?? []
  return (
    <>
      <Script
        id="platform-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <NewPlatformClient logos={logos} />
    </>
  )
}