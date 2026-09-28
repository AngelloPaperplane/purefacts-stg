import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'
import PlatformApproachClient from '@/components/sections/PlatformApproachClient'

export const metadata: Metadata = {
  title: 'Revenue Management Platform Approach | PureFacts',
  description:
    'PureFacts connects fee billing, advisor compensation, reporting, and AI-fueled intelligence in one revenue management platform: built for the complexity of wealth and asset management.',
}

export default function PlatformApproachPage() {
  return (
    <>
      <BreadcrumbJsonLd pathname="/why-purefacts/platform-approach" />
      <PlatformApproachClient />
    </>
  )
}