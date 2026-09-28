import type { Metadata } from 'next'
import { getWhoWeServeSettings } from '@/lib/sanity/queries'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'
import WhoWeServeClient from '@/components/sections/WhoWeServeClient'

export const metadata: Metadata = {
  title: 'Who We Serve | PureFacts Financial Solutions',
  description:
    'Built for wealth managers, asset managers, and asset servicers managing complex fees, compensation, and cross-entity revenue workflows.',
}

export default async function WhoWeServePage() {
  const settings = await getWhoWeServeSettings()

  return (
    <>
      <BreadcrumbJsonLd pathname="/who-we-serve" />
      <WhoWeServeClient
        industryCards={settings?.industryCards ?? []}
        personaCards={settings?.personaCards ?? []}
      />
    </>
  )
}