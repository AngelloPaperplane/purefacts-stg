import { sanityFetch, urlFor } from '@/lib/sanity/client'
import { PortableText } from '@portabletext/react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import HubSpotForm from '@/components/sections/HubSpotForm'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'

const EVENT_BY_SLUG_QUERY = `
  *[_type == "event" && slug.current == $slug][0] {
    _id, title, slug, eventType, excerpt,
    startDate, endDate, location, registrationUrl, hubspotFormId, ctaLabel,
    coverImage, body, featured,
    speakers[]{ name, title, company, photo },
    sponsors[]{ name, logo, url },
    seo
  }
`

const ALL_SLUGS_QUERY = `*[_type == "event" && defined(slug.current)]{ "slug": slug.current }`

const EVENT_TYPE_LABELS: Record<string, string> = {
  webinar:    'Webinar',
  conference: 'Conference',
  hosted:     'Hosted Event',
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  webinar:    'bg-brand-blue/10 text-brand-blue',
  conference: 'bg-brand-orange/10 text-brand-orange',
  hosted:     'bg-purple-100 text-purple-700',
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday:      'long',
    month:        'long',
    day:          'numeric',
    year:         'numeric',
    hour:         'numeric',
    minute:       '2-digit',
    timeZoneName: 'short',
  })
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day:   'numeric',
    year:  'numeric',
  })
}

export async function generateStaticParams() {
  const slugs = await sanityFetch<{ slug: string }[]>({ query: ALL_SLUGS_QUERY })
  return (slugs || []).filter((s) => s?.slug).map((s) => ({ slug: s.slug }))
}

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const event = await sanityFetch<any>({ query: EVENT_BY_SLUG_QUERY, params: { slug } })
  if (!event) return {}
  return {
    title:       event.seo?.title || `${event.title} | PureFacts Events`,
    description: event.seo?.description || event.excerpt,
    openGraph:   event.coverImage
      ? { images: [{ url: urlFor(event.coverImage).width(1200).url() }] }
      : undefined,
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params
  const event = await sanityFetch<any>({ query: EVENT_BY_SLUG_QUERY, params: { slug } })
  if (!event) notFound()

  const isPast    = new Date(event.startDate) < new Date()
  const typeLabel = event.eventType ? EVENT_TYPE_LABELS[event.eventType] : null
  const typeColor = event.eventType ? EVENT_TYPE_COLORS[event.eventType] : 'bg-gray-100 text-gray-600'
  const multiDay  = event.endDate &&
    new Date(event.startDate).toDateString() !== new Date(event.endDate).toDateString()

  const hasForm         = !!event.hubspotFormId
  const heroCta         = hasForm ? '#event-form' : (event.registrationUrl || null)
  const heroCtaExternal = !hasForm && !!event.registrationUrl

  return (
    <main>
      <BreadcrumbJsonLd pathname={`/event/${slug}`} label={event.title} />
      <style>{`
        .gradient-border-card {
          position: relative;
          border-radius: 1rem;
        }
        .gradient-border-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 1rem;
          padding: 2px;
          background: linear-gradient(135deg, #FACC22, #FB5607, #4760FF, #0DCCFF);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
      `}</style>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#0f1a2e] pt-6 pb-0 px-6 overflow-hidden">
        <div className="mx-auto max-w-7xl">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-6">
            <a href="/events" className="hover:text-white transition-colors">Events</a>
            <i className="fa-solid fa-chevron-right text-[10px]" />
            <span className="text-white/70 truncate max-w-xs">{event.title}</span>
          </nav>

          <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-end">
            {/* Left 3/5 */}
            <div className="lg:col-span-3 pb-14">
              <div className="flex items-center gap-3 mb-4">
                {typeLabel && (
                  <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${typeColor}`}>
                    {typeLabel}
                  </span>
                )}
                {isPast && (
                  <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-white/60">
                    Past Event
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-white mb-4 sm:text-4xl md:text-5xl leading-tight">
                {event.title}
              </h1>

              {event.excerpt && (
                <p className="text-white/70 text-base sm:text-lg mb-8">
                  {event.excerpt}
                </p>
              )}

              {!isPast && heroCta && (
                <a
                  href={heroCta}
                  target={heroCtaExternal ? '_blank' : undefined}
                  rel={heroCtaExternal ? 'noopener noreferrer' : undefined}
                  className="btn-alt inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold"
                >
                  Connect There
                </a>
              )}
              {isPast && (
                <span className="inline-block text-sm text-white/40 italic">
                  Registration for this event has closed.
                </span>
              )}
            </div>

            {/* Right 2/5: cover image flush to bottom */}
            {event.coverImage ? (
              <div className="lg:col-span-2 self-end">
                <img
                  src={urlFor(event.coverImage).width(800).url()}
                  alt={event.title}
                  className="h-auto w-full object-cover rounded-t-2xl block"
                />
              </div>
            ) : (
              <div className="lg:col-span-2" />
            )}
          </div>
        </div>
      </section>

      {/* ── Body: 60/40 ───────────────────────────────────────────────────── */}
      <section className="py-14 px-6 bg-white sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">

            {/* Left 3/5: event details card + body */}
            <div className="lg:col-span-3 flex flex-col gap-10">

              {/* Event details card — light gray border */}
              <div className="rounded-2xl border border-gray-200 p-6 bg-gray-50">
                <h3 className="font-bold mb-5 text-xs uppercase tracking-widest text-brand-orange">
                  Event Details
                </h3>
                <div className="flex flex-col gap-4 text-sm">
                  <div className="flex items-start gap-3">
                    <i className="fa-regular fa-calendar text-brand-orange mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-brand-off-black">{formatDateShort(event.startDate)}</p>
                      {event.endDate && multiDay && (
                        <p className="text-gray-500">through {formatDateShort(event.endDate)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <i className="fa-regular fa-clock text-brand-orange mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">{formatDateTime(event.startDate)}</p>
                  </div>
                  {event.location && (
                    <div className="flex items-start gap-3">
                      <i className="fa-solid fa-location-dot text-brand-orange mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600">{event.location}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Body copy */}
              {event.body && event.body.length > 0 ? (
                <div className="prose prose-lg max-w-none
                  prose-headings:font-bold prose-headings:text-brand-off-black
                  prose-p:text-gray-600 prose-p:leading-relaxed
                  prose-a:text-brand-blue prose-a:no-underline hover:prose-a:underline
                  [&_p]:mb-6">
                  <PortableText value={event.body} />
                </div>
              ) : (
                event.excerpt && (
                  <p className="text-gray-600 text-lg leading-relaxed">{event.excerpt}</p>
                )
              )}

              {/* Speakers */}
              {event.speakers && event.speakers.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-brand-off-black mb-6">Speakers</h2>
                  <div className="grid sm:grid-cols-2 gap-5">
                    {event.speakers.map((speaker: any, i: number) => (
                      <div key={i} className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 bg-gray-50">
                        <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                          {speaker.photo ? (
                            <img
                              src={urlFor(speaker.photo).width(112).url()}
                              alt={speaker.name}
                              className="h-auto w-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-brand-off-black text-white text-lg font-bold">
                              {speaker.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-brand-off-black">{speaker.name}</p>
                          {speaker.title && <p className="text-sm text-gray-600">{speaker.title}</p>}
                          {speaker.company && <p className="text-sm text-brand-orange font-medium">{speaker.company}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sponsors */}
              {event.sponsors && event.sponsors.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-brand-off-black mb-6">Sponsors & Partners</h2>
                  <div className="flex flex-wrap gap-6 items-center">
                    {event.sponsors.map((sponsor: any, i: number) => (
                      <div key={i}>
                        {sponsor.url ? (
                          <a href={sponsor.url} target="_blank" rel="noopener noreferrer" className="block grayscale hover:grayscale-0 transition-all">
                            {sponsor.logo ? (
                              <img src={urlFor(sponsor.logo).height(48).url()} alt={sponsor.name} className="h-12 w-auto" />
                            ) : (
                              <span className="text-sm font-semibold text-gray-600">{sponsor.name}</span>
                            )}
                          </a>
                        ) : sponsor.logo ? (
                          <img src={urlFor(sponsor.logo).height(48).url()} alt={sponsor.name} className="h-12 w-auto grayscale" />
                        ) : (
                          <span className="text-sm font-semibold text-gray-600">{sponsor.name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Back to all events — desktop only, sits below body content */}
              <a
                href="/events"
                className="hidden lg:flex items-center gap-2 text-sm text-brand-blue hover:underline font-medium"
              >
                <i className="fa-solid fa-arrow-left text-xs" />
                Back to all events
              </a>

            </div>

            {/* Right 2/5: HubSpot form */}
            <aside className="lg:col-span-2">
              <div className="sticky top-8">
                {hasForm && !isPast ? (
                  <div id="event-form" className="gradient-border-card p-8 bg-white">
                    <p className="text-xs font-semibold uppercase tracking-widest text-brand-orange mb-1">
                      Meet With Us
                    </p>
                    <h3 className="text-xl font-bold text-brand-off-black mb-2">
                      Connect at {event.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Fill out the form below and a member of our team will be in touch to arrange a meeting.
                    </p>
                    <HubSpotForm formId={event.hubspotFormId} />
                  </div>
                ) : !isPast && event.registrationUrl ? (
                  <div className="gradient-border-card p-8 bg-[#0f1a2e]">
                    <p className="text-white font-bold mb-1">Ready to attend?</p>
                    <p className="text-white/60 text-sm mb-5">
                      Secure your spot before registration closes.
                    </p>
                    <a
                      href={event.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-alt w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold"
                    >
                      {event.ctaLabel || 'Register Now'}
                      <i className="fa-solid fa-arrow-right text-xs" />
                    </a>
                  </div>
                ) : null}

                {/* Back to all events — mobile only, sits below form */}
                <a
                  href="/events"
                  className="flex lg:hidden items-center gap-2 text-sm text-brand-blue hover:underline font-medium mt-6"
                >
                  <i className="fa-solid fa-arrow-left text-xs" />
                  Back to all events
                </a>
              </div>
            </aside>

          </div>
        </div>
      </section>
    </main>
  )
}