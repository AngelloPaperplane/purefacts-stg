import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'
import WorkWithUsClient from '@/components/sections/WorkWithUsClient'
import { getWorkWithUsSettings } from '@/lib/sanity/queries'

export const metadata: Metadata = {
  title: 'Working With Us | PureFacts Financial Solutions',
  description:
    "For more than 15 years, PureFacts has helped the world's leading financial institutions bring discipline and performance to revenue operations through deep domain expertise, AI-fueled technology, and a process built for complexity.",
}

export default async function WorkWithUsPage() {
  const settings = await getWorkWithUsSettings()
  const logos = settings?.clientLogos ?? []

  return (
    <>
      <BreadcrumbJsonLd pathname="/why-purefacts/working-with-us" />
      <WorkWithUsClient logos={logos} />
    </>
  )
}