import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'
import DeepDomainExpertiseClient from '@/components/sections/DeepDomainExpertiseClient'

export const metadata: Metadata = {
  title: 'Deep Domain Expertise | PureFacts Financial Solutions',
  description:
    "For 15 years, PureFacts has helped some of the world's largest financial institutions manage the complexity of fee billing, advisor compensation, reporting, and revenue operations. That experience is built into everything we do.",
}

export default function DeepDomainExpertisePage() {
  return (
    <>
      <BreadcrumbJsonLd pathname="/why-purefacts/deep-domain-expertise" />
      <DeepDomainExpertiseClient />
    </>
  )
}