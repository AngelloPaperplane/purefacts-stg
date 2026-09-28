import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'
import CollectionClient from '@/components/sections/CollectionClient'

export const metadata: Metadata = {
  title: 'Revenue Collection | PureFacts Financial Solutions',
  description:
    'Collection is where revenue integrity becomes real. PureFacts helps wealth management firms tighten billing execution, improve accuracy, and turn realized value into collected value.',
}

export default function CollectionPage() {
  return (
    <>
      <BreadcrumbJsonLd pathname="/why-purefacts/collection" />
      <CollectionClient />
    </>
  )
}
