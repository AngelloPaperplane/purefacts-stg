import type { Metadata } from 'next'
import Image from 'next/image'
import { getPosts, getNewsletterSettings } from '@/lib/sanity/queries'
import { sanityFetch, urlFor } from '@/lib/sanity/client'
import { ALL_EVENTS_QUERY } from '@/lib/sanity/queries'
import type { Event } from '@/lib/sanity/queries'
import ResourcesClient from '@/components/sections/ResourcesClient'
import HeroTicker from '@/components/sections/HeroTicker'
import NewsletterForm from '@/components/sections/NewsletterForm'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: 'Resources | PureFacts Financial Solutions',
  description:
    'Thought leadership, real-world learnings, and fresh ideas from the people driving change across financial firms.',
}

const RESOURCES_AD_UNIT_QUERY = `
  *[_type == "resourcesAdUnit"][0]{
    enabled,
    eyebrow,
    title,
    body,
    link
  }
`

export default async function ResourcesPage() {
  const [allPosts, events, newsletterSettings, adUnit] = await Promise.all([
    getPosts({ limit: 200 }),
    sanityFetch<Event[]>({ query: ALL_EVENTS_QUERY, revalidate: 60 }),
    getNewsletterSettings(),
    sanityFetch<{
      enabled: boolean
      eyebrow?: string
      title?: string
      body?: string
      link?: string
    } | null>({ query: RESOURCES_AD_UNIT_QUERY, revalidate: 60 }),
  ])

  const featuredPosts = allPosts.filter(p => p.featured).slice(0, 2)
  const regularPosts  = allPosts.filter(p => !p.featured)

  return (
    <div style={{ backgroundColor: '#140f0c' }}>
      <BreadcrumbJsonLd pathname="/resources" />

      {/* ── 1. Hero ─────────────────────────────────────────── */}
      <section
        className="relative flex min-h-[360px] flex-col items-center justify-center overflow-hidden px-4 pb-6 pt-20 text-center sm:min-h-[400px] sm:pt-24"
        style={{ backgroundColor: '#140f0c' }}
        aria-label="Resources hub"
      >
        <HeroTicker />

        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background: 'radial-gradient(ellipse 65% 75% at 50% 50%, transparent 20%, #140f0c 90%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-[2] max-w-2xl">
          <h1
            className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
            style={{ color: '#f4f4f4' }}
          >
            Insights That
            <span
              className="block"
              style={{
                background: 'linear-gradient(135deg, #FACC22, #FB5607, #4760FF, #0DCCFF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Move Wealth Forward
            </span>
          </h1>
          <p
            className="mx-auto mt-4 max-w-xl text-base leading-relaxed sm:mt-5 sm:text-lg"
            style={{ color: 'rgba(244,244,244,0.55)' }}
          >
            Thought leadership, real-world learnings, and fresh ideas from the people driving change across financial firms.
          </p>
        </div>
      </section>

      {/* ── 2. Filter bar + posts + events (client) ─────────── */}
      <div style={{ backgroundColor: '#140f0c' }}>
        <ResourcesClient
          posts={regularPosts}
          featuredPosts={featuredPosts}
          events={events}
          adUnit={adUnit}
        />
      </div>

      {/* ── 3. Newsletter band ───────────────────────────────── */}
      <section
        className="relative overflow-hidden bg-brand-off-black"
        style={{ minHeight: 460 }}
        aria-label="Subscribe to the PureFacts newsletter"
      >
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/background/black-bg.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          aria-hidden="true"
        />

        {newsletterSettings?.ctaBackgroundImage && (
          <div className="absolute bottom-0 left-0 z-10 h-full w-[42%] animate-slide-in-left" aria-hidden="true">
            <Image
              src={urlFor(newsletterSettings.ctaBackgroundImage).width(900).url()}
              alt=""
              fill
              className="object-contain object-left-bottom"
            />
          </div>
        )}

        <div className="relative z-20 flex min-h-[460px] flex-col justify-center px-6 py-12 sm:px-10 sm:py-16 lg:ml-[42%] lg:max-w-[640px]">
          <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            Insights That{' '}
            <span className="text-brand-yellow">Power Better Decisions</span>
          </h2>
          <p className="mt-3 text-base leading-relaxed text-gray-300">
            Subscribe to receive our monthly roundup of PureFacts commentary on revenue
            management, optimization, and industry trends.
          </p>

          <div className="mt-6 sm:mt-8 [&_.hs-newsletter-form_.hs-form-field_label]:hidden [&_.hs-newsletter-form_.hs-input]:w-full [&_.hs-newsletter-form_.hs-input]:rounded-none [&_.hs-newsletter-form_.hs-input]:border [&_.hs-newsletter-form_.hs-input]:border-white/30 [&_.hs-newsletter-form_.hs-input]:bg-white/10 [&_.hs-newsletter-form_.hs-input]:px-4 [&_.hs-newsletter-form_.hs-input]:py-3 [&_.hs-newsletter-form_.hs-input]:text-white [&_.hs-newsletter-form_.hs-input]:placeholder-gray-400 [&_.hs-newsletter-form_.hs-input]:outline-none [&_.hs-newsletter-form_.hs-button]:mt-4 [&_.hs-newsletter-form_.hs-button]:cursor-pointer [&_.hs-newsletter-form_.hs-button]:bg-brand-yellow [&_.hs-newsletter-form_.hs-button]:px-8 [&_.hs-newsletter-form_.hs-button]:py-3 [&_.hs-newsletter-form_.hs-button]:font-semibold [&_.hs-newsletter-form_.hs-button]:text-brand-off-black [&_.hs-newsletter-form_.hs-button]:border-0 [&_.hs-newsletter-form_.hs-error-msgs]:mt-1 [&_.hs-newsletter-form_.hs-error-msgs]:text-sm [&_.hs-newsletter-form_.hs-error-msgs]:text-red-400">
            <NewsletterForm />
          </div>

          <p className="mt-5 text-xs text-gray-500 sm:mt-6">
            By subscribing, you agree to receive marketing emails from PureFacts. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </div>
  )
}