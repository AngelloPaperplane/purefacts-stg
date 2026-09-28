import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'
import CompressionClient from '@/components/sections/CompressionClient'

export const metadata: Metadata = {
  title: 'Fee Compression and Margin Protection | PureFacts',
  description:
    'Fee pressure is rising. Service expectations are rising faster. PureFacts helps wealth management firms protect yield, defend margin, and build a pricing model that supports profitable growth.',
}

export default function CompressionPage() {
  return (
    <>
      <BreadcrumbJsonLd pathname="/why-purefacts/compression" />
      <CompressionClient />
    </>
  )
}