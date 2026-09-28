import type { Metadata } from 'next'
import WealthManagementClient from '@/components/sections/WealthManagementClient'
import { getWealthManagementSettings } from '@/lib/sanity/queries'

export const metadata: Metadata = {
  title: 'Wealth Management Firms | PureFacts',
  description:
    "PureFacts helps wealth managers standardize fee billing, align advisor compensation, and operate revenue with the accuracy, transparency, and control today's market demands.",
}

export default async function WealthManagementPage() {
  const settings = await getWealthManagementSettings()
  const logos = settings?.clientLogos ?? []
  return <WealthManagementClient logos={logos} />
}