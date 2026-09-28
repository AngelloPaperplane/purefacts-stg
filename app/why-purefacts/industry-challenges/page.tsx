import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'
import IndustryChallengesClient from '@/components/sections/IndustryChallengesClient'

export const metadata: Metadata = {
  title: 'Wealth Management Industry Challenges | PureFacts',
  description:
    'Explore the three forces reshaping wealth management revenue: compression, collection, and complexity. Learn how firms protect margin, improve revenue capture, and reduce operational friction.',
}

export default function IndustryChallengesPage() {
  return (
    <>
      <BreadcrumbJsonLd pathname="/why-purefacts/industry-challenges" />
      <IndustryChallengesClient />
    </>
  )
}
