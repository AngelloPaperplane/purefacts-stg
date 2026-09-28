import type { Metadata } from 'next'
import { RevenueBookOfRecordClient } from './RevenueBookOfRecordClient'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: 'Revenue Book of Record | PureFacts Financial Solutions',
  description:
    'A single, trusted Revenue Book of Record for wealth and asset managers. PureFacts unifies billing, compensation, and reporting to eliminate revenue leakage.',
}

export default function RevenueBookOfRecordPage() {
  return (
    <>
  <BreadcrumbJsonLd pathname="/platform/revenue-book-of-record" />
  <RevenueBookOfRecordClient />
  </>
)
}