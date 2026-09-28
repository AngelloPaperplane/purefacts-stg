import { sanityFetch } from '@/lib/sanity/client'
import EventsClient from '@/components/sections/EventsClient'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'

const ALL_EVENTS_QUERY = `
  *[_type == "event"] | order(startDate asc) {
    _id, title, slug, eventType, excerpt,
    startDate, endDate, location, registrationUrl, ctaLabel,
    coverImage, featured,
    speakers[]{ name, title, company, photo }
  }
`

export const metadata = {
  title: 'Events | PureFacts Financial Solutions',
  description: 'Join PureFacts at upcoming webinars, conferences, and industry events shaping the future of wealth and asset management technology.',
}

export default async function EventsPage() {
  const events = await sanityFetch<any[]>({ query: ALL_EVENTS_QUERY })

  const now      = new Date()
  const upcoming = (events || []).filter(e => new Date(e.startDate) >= now)
  const past     = (events || []).filter(e => new Date(e.startDate) < now).reverse()

  return (
    <main>
          <BreadcrumbJsonLd pathname="/events" />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="bg-[#0f1a2e] py-14 px-6 sm:py-20"
        aria-label="Events at PureFacts"
      >
        <div className="mx-auto max-w-7xl">
          <p className="text-brand-orange font-semibold text-sm uppercase tracking-widest mb-3">
            Events
          </p>
          <h1 className="text-3xl font-bold text-white mb-4 max-w-2xl sm:text-4xl md:text-5xl">
            Connect With PureFacts
          </h1>
          <p className="text-white/70 text-base max-w-xl sm:text-lg">
            Join us at industry conferences, webinars, and events where we explore the future
            of wealth and asset management technology.
          </p>
        </div>
      </section>

      {/* ── Events content ───────────────────────────────────── */}
      <section
        className="py-12 px-6 bg-brand-off-white min-h-[60vh] sm:py-16"
        aria-label="Upcoming and past events"
      >
        <div className="mx-auto max-w-7xl">
          <EventsClient upcoming={upcoming} past={past} />
        </div>
      </section>
    </main>
  )
}