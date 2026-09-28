import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'
import ComplexityClient from '@/components/sections/ComplexityClient'

export const metadata: Metadata = {
  title: 'Revenue Complexity | PureFacts Financial Solutions',
  description:
    'As firms add households, products, fee schedules, exceptions, and payout rules, complexity grows faster than the business. PureFacts helps firms bring order to that complexity and make growth more scalable.',
}

export default function ComplexityPage() {
  return (
    <>
      <BreadcrumbJsonLd pathname="/why-purefacts/complexity" />
      <ComplexityClient />
    </>
  )
}
