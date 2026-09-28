import type { Metadata } from 'next'
import AssetServicingClient from '@/components/sections/AssetServicingClient'
import { getAssetServicingSettings } from '@/lib/sanity/queries'

export const metadata: Metadata = {
  title: 'Asset Servicing Revenue Platform | PureFacts',
  description:
    'PureFacts helps asset servicers standardize fee and rebate operations, automate manual workflows, reduce exception-driven risk, and deliver audit-ready revenue outcomes across complex platforms.',
}

export default async function AssetServicingPage() {
  const settings = await getAssetServicingSettings()
  const logos = settings?.clientLogos ?? []
  return <AssetServicingClient logos={logos} />
}