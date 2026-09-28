// app/resources/newsletter/page.tsx

import type { Metadata } from 'next'
import Image from 'next/image'
import { getNewsletterSettings } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/client'
import NewsletterForm from '@/components/sections/NewsletterForm'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: 'Newsletter | PureFacts',
  description:
    'Stay ahead with actionable insights, industry trends, and expert commentary on revenue management and financial technology delivered to your inbox.',
}

export default async function NewsletterPage() {
  const settings = await getNewsletterSettings()

  return (
    <>
      <BreadcrumbJsonLd pathname="/resources/newsletter" />

      <section
        className="relative overflow-hidden"
        style={{ background: '#140f0c', minHeight: 520 }}
        aria-label="PureFacts newsletter"
      >
        {/* Background glows */}
        <div aria-hidden="true" style={{ position: 'absolute', top: '10%', right: '5%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(59,132,255,0.07) 0%, transparent 65%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '10%', left: '35%', width: 400, height: 350, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,179,12,0.06) 0%, transparent 65%)' }} />

        {/* Left decorative image */}
        {settings?.ctaBackgroundImage && (
          <div className="absolute bottom-0 left-0 z-10 h-full w-[38%] hidden lg:block" aria-hidden="true">
            <Image
              src={urlFor(settings.ctaBackgroundImage).width(900).url()}
              alt=""
              fill
              style={{ objectFit: 'contain', objectPosition: 'left bottom' }}
            />
          </div>
        )}

        {/* Content */}
        <div
          className="relative z-20 flex min-h-[520px] flex-col justify-center px-6 py-16 sm:px-10 sm:py-20 lg:ml-[42%]"
          style={{ maxWidth: 680 }}
        >
          {/* H1 */}
          <h1 style={{ fontSize: '2.6em', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.025em', color: '#f4f4f4', marginBottom: '1.25rem' }}>
            Insights That Power {' '}
            <span style={{ color: '#ffb30c' }}>Better Decisions</span>
          </h1>

          {/* Body from row 1 */}
          <p style={{ fontSize: '1.0625rem', color: 'rgba(244,244,244,0.75)', lineHeight: 1.75, marginBottom: '1.25rem' }}>
            Everything you need to stay current, make smarter decisions, and move faster.
            Get practical updates, expert analysis, and curated resources delivered to your inbox.
          </p>

          {/* Bullet points from row 1 */}
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }} aria-label="Newsletter benefits">
            {[
              'Actionable insights you can use immediately',
              'Industry trends and expert commentary',
              'Early access to tools, events, and resources',
            ].map(item => (
              <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffb30c', flexShrink: 0, marginTop: '0.5rem' }} aria-hidden="true" />
                <span style={{ fontSize: '1rem', color: 'rgba(244,244,244,0.75)', lineHeight: 1.65 }}>{item}</span>
              </li>
            ))}
          </ul>

          {/* Form — unchanged */}
          <div className="[&_.hs-newsletter-form_.hs-form-field_label]:hidden [&_.hs-newsletter-form_.hs-input]:w-full [&_.hs-newsletter-form_.hs-input]:rounded-none [&_.hs-newsletter-form_.hs-input]:border [&_.hs-newsletter-form_.hs-input]:border-white/30 [&_.hs-newsletter-form_.hs-input]:bg-white/10 [&_.hs-newsletter-form_.hs-input]:px-4 [&_.hs-newsletter-form_.hs-input]:py-3 [&_.hs-newsletter-form_.hs-input]:text-white [&_.hs-newsletter-form_.hs-input]:placeholder-gray-400 [&_.hs-newsletter-form_.hs-input]:outline-none [&_.hs-newsletter-form_.hs-button]:mt-4 [&_.hs-newsletter-form_.hs-button]:cursor-pointer [&_.hs-newsletter-form_.hs-button]:bg-brand-yellow [&_.hs-newsletter-form_.hs-button]:px-8 [&_.hs-newsletter-form_.hs-button]:py-3 [&_.hs-newsletter-form_.hs-button]:font-semibold [&_.hs-newsletter-form_.hs-button]:text-brand-off-black [&_.hs-newsletter-form_.hs-button]:border-0 [&_.hs-newsletter-form_.hs-error-msgs]:mt-1 [&_.hs-newsletter-form_.hs-error-msgs]:text-sm [&_.hs-newsletter-form_.hs-error-msgs]:text-red-400">
            <NewsletterForm />
          </div>

          <p style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: 'rgba(244,244,244,0.35)' }}>
            By subscribing, you agree to receive marketing emails from PureFacts. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </>
  )
}