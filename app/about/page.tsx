// app/about/page.tsx

import type { Metadata } from 'next'
import { getAboutSettings } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/client'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'
import AboutPageClient from '@/components/sections/AboutPageClient'

export const metadata: Metadata = {
  title: 'Revenue Performance Management | About PureFacts',
  description:
    'PureFacts is the leader in the Revenue Performance Management category for wealth and asset management firms. For more than 25 years, we have helped leading financial institutions turn revenue from an operational process into a strategic advantage.',
}

export default async function AboutPage() {
  const settings = await getAboutSettings()

  const teamPhotoUrl = settings?.teamPhoto
    ? urlFor(settings.teamPhoto).width(1400).url()
    : null

  const carouselImages = (settings?.recognitionImages ?? []).map((img: any) => ({
    url: urlFor(img).width(480).url(),
    alt: 'PureFacts industry recognition award',
  }))

  return (
    <>
      <BreadcrumbJsonLd pathname="/about" />
      <AboutPageClient
        teamPhotoUrl={teamPhotoUrl}
        carouselImages={carouselImages}
      />
    </>
  )
}