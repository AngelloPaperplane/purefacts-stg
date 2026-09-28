import type { Metadata } from 'next'
import FeesAndBillingClient from '@/components/sections/FeesAndBillingClient'
import { getPurefeesSettings } from '@/lib/sanity/queries'

export const metadata: Metadata = {
  title: 'Fees and Billing Software for Wealth Management | PureFacts',
  description:
    'Bill with precision and flexibility across complex portfolios. Eliminate revenue leakage, prevent costly overcharges, and automate fee billing at enterprise scale.',
}

export default async function FeesAndBillingPage() {
  const settings = await getPurefeesSettings()
  const logos = settings?.clientLogos ?? []
  const heroImage = settings?.heroImage ?? null

  return <FeesAndBillingClient heroImage={heroImage} logos={logos} />
}