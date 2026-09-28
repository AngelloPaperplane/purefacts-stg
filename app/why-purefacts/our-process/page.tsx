import type { Metadata } from 'next'
import { OurProcessClient } from './OurProcessClient'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: 'Our Process | PureFacts Financial Solutions',
  description:
    'PureFacts begins with a Revenue Performance Assessment, not a canned demo. See how we help wealth managers bring structure to complex revenue operations.',
}

export default function OurProcessPage() {
  return (
    <>
  <BreadcrumbJsonLd pathname="/why-purefacts/our-process" />
  <OurProcessClient />
  </>
)
}