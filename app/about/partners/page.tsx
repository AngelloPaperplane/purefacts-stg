// app/about/partner/page.tsx


import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'
import ContentParnerClient from './ContentParnerClient'

export const metadata: Metadata = {
  title: 'Partner | About PureFacts',
  description:
    "Join PureFacts and help shape the future of revenue management for the world's leading financial institutions.",
}


export default function PartnerPage() {
  return (
    <>
      <BreadcrumbJsonLd pathname="/about/partner" />
      <ContentParnerClient />
    </>
  )
}
