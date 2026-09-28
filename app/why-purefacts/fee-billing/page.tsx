import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'
import FeeBillingClient from '@/components/sections/FeeBillingClient'

export const metadata: Metadata = {
  title: 'Fee Billing Software for Wealth Management | PureFacts',
  description:
    'PureFacts helps wealth and asset management firms calculate and bill complex fees accurately, consistently, and audit-ready, at scale, without the spreadsheets, workarounds, and recurring fire drills.',
}

export default function FeeBillingPage() {
  return (
    <>
      <BreadcrumbJsonLd pathname="/why-purefacts/fee-billing" />
      <FeeBillingClient />
    </>
  )
}
