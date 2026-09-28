import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'
import SolutionsClient from '@/components/sections/SolutionsClient'

export const metadata: Metadata = {
  title: 'Revenue Solutions for Wealth and Asset Managers | PureFacts',
  description:
    'PureFacts helps wealth and asset management firms strengthen the economics of their business through connected fee billing, advisor compensation, and analytics across the full revenue lifecycle.',
}

export default function SolutionsPage() {
  return (
    <>
      <BreadcrumbJsonLd pathname="/why-purefacts/solutions" />
      <SolutionsClient />
    </>
  )
}
