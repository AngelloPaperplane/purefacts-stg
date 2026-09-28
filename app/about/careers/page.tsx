// app/about/careers/page.tsx

import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'
import CareersPageClient from '@/components/sections/CareersPageClient'

export const metadata: Metadata = {
  title: 'Fintech Jobs | Careers at PureFacts',
  description:
    "Join PureFacts and help shape the future of revenue management for the world's leading financial institutions.",
}

export default function CareersPage() {
  return (
    <>
      <BreadcrumbJsonLd pathname="/about/careers" />
      <CareersPageClient />
    </>
  )
}