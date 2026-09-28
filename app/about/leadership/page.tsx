// app/about/leadership/page.tsx

import type { Metadata } from 'next'
import { getLeadershipSettings } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/client'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'
import LeadershipPageClient from '@/components/sections/LeadershipPageClient'

export const metadata: Metadata = {
  title: 'Leadership | PureFacts Financial Solutions',
  description:
    'Meet the leadership team behind PureFacts: financial services insiders, technologists, and innovators driving the future of revenue management.',
}

export default async function LeadershipPage() {
  const settings = await getLeadershipSettings()

  const heroImageUrl = settings?.heroImage
    ? urlFor(settings.heroImage).width(900).url()
    : null

  const leaders = (settings?.leaders ?? []).map((leader: any) => ({
    name: leader.name,
    title: leader.title,
    bio: leader.bio ?? undefined,
    linkedinUrl: leader.linkedinUrl ?? undefined,
    photoUrl: leader.photo ? urlFor(leader.photo).width(800).url() : null,
  }))

  return (
    <>
      <BreadcrumbJsonLd pathname="/about/leadership" />
      <LeadershipPageClient heroImageUrl={heroImageUrl} leaders={leaders} />
    </>
  )
}