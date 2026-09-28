import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'
import CompensationIncentivesClient from '@/components/sections/CompensationIncentivesClient'

export const metadata: Metadata = {
  title: 'Advisor Compensation Software | PureFacts',
  description:
    'Strengthen pricing discipline, manage exceptions with greater rigor, and build advisor trust in billing and payouts. PureFacts helps wealth management firms improve profitability through smarter compensation strategy.',
}

export default function CompensationIncentivesPage() {
  return (
    <>
      <BreadcrumbJsonLd pathname="/why-purefacts/compensation-and-incentives" />
      <CompensationIncentivesClient />
    </>
  )
}
