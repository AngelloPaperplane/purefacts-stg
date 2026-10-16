// app/about/partner/page.tsx


import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'
import TechnologyPartnerClient from './TechnologyPartnerClient'

export const metadata: Metadata = {
  title: 'Referral Partner | Partner | About PureFacts',
  description:
    "Join PureFacts and help shape the future of revenue management for the world's leading financial institutions.",
}


export default function ReferralPartnerPage() {
  return (
    <>
      <BreadcrumbJsonLd pathname="/about/partner" />
      <TechnologyPartnerClient />
    </>
  )
}
