import type { Metadata } from 'next'
import AssetManagementClient from '@/components/sections/AssetManagementClient'
import { getAssetManagementSettings } from '@/lib/sanity/queries'

export const metadata: Metadata = {
  title: 'Asset Management Solutions | PureFacts',
  description:
    'PureFacts helps global asset managers scale cross-border distribution and expand across domiciles by standardizing fee logic, governing rebates, and keeping revenue audit-ready by design.',
}

export default async function AssetManagementPage() {
  const settings = await getAssetManagementSettings()
  const logos = settings?.clientLogos ?? []
  return <AssetManagementClient logos={logos} />
}