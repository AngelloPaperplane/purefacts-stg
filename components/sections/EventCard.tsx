'use client'

import { urlFor } from '@/lib/sanity/client'

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

const EVENT_TYPE_COLORS_DARK: Record<string, { bg: string; text: string }> = {
  webinar:    { bg: 'rgba(59,132,255,0.15)', text: '#3b84ff' },
  conference: { bg: 'rgba(251,86,7,0.15)',   text: '#fb5607' },
  hosted:     { bg: 'rgba(168,85,247,0.15)', text: '#c084fc' },
}
const DEFAULT_TYPE_DARK = { bg: 'rgba(255,255,255,0.08)', text: 'rgba(244,244,244,0.6)' }

function formatEventDate(start: string, end?: string) {
  const startDate = new Date(start)
  const endDate   = end ? new Date(end) : null

  const dateOpts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' }
  const timeOpts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }

  const startDateStr = startDate.toLocaleDateString('en-US', dateOpts)
  const startTimeStr = startDate.toLocaleTimeString('en-US', timeOpts)

  if (!endDate) return `${startDateStr} · ${startTimeStr}`

  const sameDay = startDate.toDateString() === endDate.toDateString()
  if (sameDay) {
    return `${startDateStr} · ${startTimeStr} – ${endDate.toLocaleTimeString('en-US', timeOpts)}`
  }

  return `${startDateStr} – ${endDate.toLocaleDateString('en-US', dateOpts)}`
}

interface SanityEvent {
  _id: string
  title: string
  slug: { current: string }
  eventType?: string
  coverImage?: object
  excerpt?: string
  startDate: string
  endDate?: string
  location?: string
  registrationUrl?: string
  ctaLabel?: string
  speakers?: { name: string; title?: string; company?: string; photo?: object }[]
}

interface EventCardProps {
  event: SanityEvent
  variant?: 'default' | 'compact'
  dark?: boolean
}

export default function EventCard({ event, variant = 'default', dark = false }: EventCardProps) {
  const isPast           = new Date(event.startDate) < new Date()
  const typeLabel        = event.eventType ? EVENT_TYPE_LABELS[event.eventType] : null
  const typeColor        = event.eventType ? EVENT_TYPE_COLORS[event.eventType] : 'bg-gray-100 text-gray-600'
  const typeDark         = event.eventType ? (EVENT_TYPE_COLORS_DARK[event.eventType] ?? DEFAULT_TYPE_DARK) : DEFAULT_TYPE_DARK
  const internalHref     = `/event/${event.slug.current}`
  const registrationHref = event.registrationUrl || null

  // ── Compact (sidebar / widget list) ──────────────────────────────────────
  if (variant === 'compact') {
    return (
      <a
        href={internalHref}
        className="group flex gap-4 items-start p-4 rounded-xl border border-gray-200 hover:border-brand-blue/40 hover:shadow-sm transition-all"
      >
        <div className="flex-shrink-0 w-14 text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-orange">
            {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
          </div>
          <div className="text-2xl font-bold text-brand-off-black leading-none">
            {new Date(event.startDate).getDate()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {typeLabel && (
            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${typeColor}`}>
              {typeLabel}
            </span>
          )}
          <p className="font-semibold text-sm text-brand-off-black group-hover:text-brand-blue transition-colors line-clamp-2">
            {event.title}
          </p>
          {event.location && (
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <i className="fa-solid fa-location-dot text-[10px]" />
              {event.location}
            </p>
          )}
        </div>
      </a>
    )
  }

  // ── Dark full card ────────────────────────────────────────────────────────
  if (dark) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#1a1410',
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
          opacity: isPast ? 0.7 : 1,
          transition: 'box-shadow 0.2s, transform 0.2s',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)'
          el.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = 'none'
          el.style.transform = 'translateY(0)'
        }}
      >
        {/* Image */}
        <a
          href={internalHref}
          style={{ display: 'block', position: 'relative', aspectRatio: '16/9', overflow: 'hidden', flexShrink: 0 }}
        >
          {event.coverImage ? (
            <>
              <img
                src={urlFor(event.coverImage).width(800).url()}
                alt={event.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)' }}
              />
              {isPast && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{
                    background: 'rgba(244,244,244,0.15)',
                    color: '#f4f4f4',
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '4px 14px',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}>
                    Past Event
                  </span>
                </div>
              )}
            </>
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: 'linear-gradient(135deg, #0f1a2e, #1a2d4f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="fa-solid fa-calendar-days" style={{ fontSize: 36, color: 'rgba(255,255,255,0.12)' }} />
            </div>
          )}
        </a>

        {/* Body */}
        <div style={{ padding: '20px 22px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Type badge row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            {typeLabel && (
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '3px 10px',
                backgroundColor: typeDark.bg,
                color: typeDark.text,
                letterSpacing: '0.03em',
              }}>
                {typeLabel}
              </span>
            )}
            {isPast && (
              <span style={{ fontSize: 11, color: 'rgba(244,244,244,0.35)', marginLeft: 'auto' }}>Past Event</span>
            )}
          </div>

          {/* Title */}
          <a href={internalHref} style={{ display: 'block', marginBottom: 10, textDecoration: 'none' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f4f4f4', lineHeight: 1.35, margin: 0 }}>
              {event.title}
            </h3>
          </a>

          {/* Date */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'rgba(244,244,244,0.5)', marginBottom: 6 }}>
            <i className="fa-regular fa-clock" style={{ marginTop: 2, flexShrink: 0, color: '#fb5607' }} />
            <span>{formatEventDate(event.startDate, event.endDate)}</span>
          </div>

          {/* Location */}
          {event.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(244,244,244,0.5)', marginBottom: 10 }}>
              <i className="fa-solid fa-location-dot" style={{ flexShrink: 0, color: '#fb5607' }} />
              <span>{event.location}</span>
            </div>
          )}

          {/* Excerpt */}
          {event.excerpt && (
            <p style={{
              fontSize: 13,
              color: 'rgba(244,244,244,0.5)',
              lineHeight: 1.6,
              marginBottom: 16,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {event.excerpt}
            </p>
          )}

          {/* Speakers */}
          {event.speakers && event.speakers.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ display: 'flex' }}>
                {event.speakers.slice(0, 3).map((speaker, i) => (
                  <div key={i} style={{
                    width: 28, height: 28,
                    borderRadius: '50%',
                    border: '2px solid #1a1410',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    overflow: 'hidden',
                    marginLeft: i > 0 ? -8 : 0,
                    flexShrink: 0,
                  }}>
                    {speaker.photo ? (
                      <img src={urlFor(speaker.photo).width(56).url()} alt={speaker.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#f4f4f4' }}>
                        {speaker.name.charAt(0)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 12, color: 'rgba(244,244,244,0.4)' }}>
                {event.speakers.slice(0, 2).map(s => s.name).join(', ')}
                {event.speakers.length > 2 && ` +${event.speakers.length - 2} more`}
              </span>
            </div>
          )}

          {/* CTA */}
          <div style={{ marginTop: 'auto', paddingTop: 8 }}>
            <a
              href={registrationHref || internalHref}
              target={registrationHref ? '_blank' : undefined}
              rel={registrationHref ? 'noopener noreferrer' : undefined}
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                pointerEvents: isPast ? 'none' : 'auto',
                opacity: isPast ? 0.5 : 1,
              }}
            >
              {event.ctaLabel || 'Learn More'}
              <i className="fa-solid fa-arrow-right" style={{ fontSize: 11 }} />
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ── Default light full card ───────────────────────────────────────────────
  return (
    <div className={`group rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col bg-white ${isPast ? 'opacity-75' : ''}`}>

      <a href={internalHref} className="block relative overflow-hidden aspect-[16/9]">
        {event.coverImage ? (
          <>
            <img
              src={urlFor(event.coverImage).width(800).url()}
              alt={event.title}
              className="h-auto w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {isPast && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-white/90 text-gray-700 text-sm font-semibold px-3 py-1 rounded-full">Past Event</span>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0f1a2e] to-[#1a2d4f] flex items-center justify-center">
            <i className="fa-solid fa-calendar-days text-4xl text-white/20" />
          </div>
        )}
      </a>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-3">
          {typeLabel && (
            <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${typeColor}`}>
              {typeLabel}
            </span>
          )}
          {isPast && (
            <span className="text-xs font-medium text-gray-400 ml-auto">Past Event</span>
          )}
        </div>

        <a href={internalHref} className="block mb-2">
          <h3 className="font-bold text-lg text-brand-off-black group-hover:text-brand-blue transition-colors line-clamp-2">
            {event.title}
          </h3>
        </a>

        <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
          <i className="fa-regular fa-clock mt-0.5 flex-shrink-0 text-brand-orange" />
          <span>{formatEventDate(event.startDate, event.endDate)}</span>
        </div>

        {event.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <i className="fa-solid fa-location-dot flex-shrink-0 text-brand-orange" />
            <span>{event.location}</span>
          </div>
        )}

        {event.excerpt && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">{event.excerpt}</p>
        )}

        {event.speakers && event.speakers.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex -space-x-2">
              {event.speakers.slice(0, 3).map((speaker, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                  {speaker.photo ? (
                    <img src={urlFor(speaker.photo).width(56).url()} alt={speaker.name} className="h-auto w-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-off-black text-white text-xs font-bold">
                      {speaker.name.charAt(0)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <span className="text-xs text-gray-500">
              {event.speakers.slice(0, 2).map(s => s.name).join(', ')}
              {event.speakers.length > 2 && ` +${event.speakers.length - 2} more`}
            </span>
          </div>
        )}

        <div className="mt-auto pt-2">
          <a
            href={registrationHref || internalHref}
            target={registrationHref ? '_blank' : undefined}
            rel={registrationHref ? 'noopener noreferrer' : undefined}
            className={`btn-primary inline-flex items-center gap-2 text-sm px-5 py-2.5 ${isPast ? 'opacity-60 pointer-events-none' : ''}`}
          >
            {event.ctaLabel || 'Learn More'}
            <i className="fa-solid fa-arrow-right text-xs" />
          </a>
        </div>
      </div>
    </div>
  )
}