// app/about/partner/page.tsx


import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'
import ContImplementationPartnerClient from './ContImplementationPartnerClient'

export const metadata: Metadata = {
  title: 'Implementation Partner | Partner | About PureFacts',
  description:
    "Join PureFacts and help shape the future of revenue management for the world's leading financial institutions.",
}


export default function ImplementationPartnerPage() {
  return (
    <>
      <BreadcrumbJsonLd pathname="/about/partner" />
      <ContImplementationPartnerClient />
    </>
  )
}
