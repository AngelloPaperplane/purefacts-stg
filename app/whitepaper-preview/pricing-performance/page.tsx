import type { Metadata } from 'next'
import PricingPerformance from '@/components/whitepapers/PricingPerformance'

// Preview-only route for internal review
export const metadata: Metadata = {
  title: 'Draft: The Price You Set Is Not the Price You Get',
  robots: { index: false, follow: false },
}

export default function PricingWhitepaperPreview() {
  return (
    <PricingPerformance
      post={{
        title: 'The Price You Set Is Not the Price You Get',
        excerpt: 'Managing the Price Realization Gap Across the Wealth Management Book',
        publishedAt: '2026-08-25T13:00:00.000Z',
        author: { name: 'PureFacts Financial Solutions' },
      }}
    />
  )
}

