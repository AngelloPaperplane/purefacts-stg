import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'
import PracticeManagementSolutionClient from '@/components/sections/PracticeManagementSolutionClient'

export const metadata: Metadata = {
  title: 'Practice Management for Wealth Firms | PureFacts',
  description:
    'Turn advisor decisions into organic growth. PureFacts Practice Management helps wealth and asset management firms improve advisor performance, reduce excessive discounting, benchmark books of business, and connect strategy to the behaviors that drive profitable growth.',
}

export default function PracticeManagementSolutionPage() {
  return (
    <>
      <BreadcrumbJsonLd pathname="/why-purefacts/practice-management" />
      <PracticeManagementSolutionClient />
    </>
  )
}