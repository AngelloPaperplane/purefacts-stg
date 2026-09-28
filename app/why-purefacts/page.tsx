import { type Metadata } from 'next'
import { sanityFetch } from '@/lib/sanity/client'
import { type ClientLogo } from '@/components/sections/LogoCarousel'
import WhyPurefactsClient from '@/components/sections/WhyPurefactsClient'

/* ─── SEO ─────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: 'Why PureFacts | Revenue Performance Management',
  description:
    'PureFacts is the only enterprise-grade revenue management platform built for global wealth and asset management firms. Discover why revenue leaders choose PureFacts.',
}

/* ─── GROQ ────────────────────────────────────────────────── */
const WHY_PUREFACTS_LOGOS_QUERY = `
  *[_type == "whyPurefactsSettings"][0]{
    clientLogos[]->{
      _id,
      name,
      logo,
      caseStudyUrl
    }
  }
`

/* ─── PAGE ────────────────────────────────────────────────── */
export default async function WhyPurefactsPage() {
  const data = await sanityFetch<{ clientLogos: ClientLogo[] | null }>({
    query: WHY_PUREFACTS_LOGOS_QUERY,
    revalidate: 60,
  })

  const logos: ClientLogo[] = data?.clientLogos ?? []

  return <WhyPurefactsClient logos={logos} />
}