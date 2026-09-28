'use client'

import { useState, useEffect, useRef, Fragment } from 'react'
import type { PostCard, Event } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/client'
import EventCard from '@/components/sections/EventCard'

const PAGE_SIZE = 9

// ── Category styles ───────────────────────────────────────────────────────────

const CAT_COLORS: Record<string, { bg: string; text: string }> = {
  'blog':           { bg: '#dbeafe', text: '#1d4ed8' },
  'case-study':     { bg: '#ffedd5', text: '#c2410c' },
  'whitepaper':     { bg: '#fef9c3', text: '#a16207' },
  'press-release':  { bg: '#f3e8ff', text: '#7e22ce' },
  'news':           { bg: '#dcfce7', text: '#15803d' },
  'awards':         { bg: '#fee2e2', text: '#b91c1c' },
}
const DEFAULT_CAT = { bg: '#f3f4f6', text: '#4b5563' }

const CAT_LABELS: Record<string, string> = {
  'blog':           'Blog',
  'case-study':     'Case Study',
  'whitepaper':     'Whitepaper',
  'press-release':  'Press Release',
  'news':           'News',
  'awards':         'Award',
}

// ── Ad unit type ──────────────────────────────────────────────────────────────

interface AdUnit {
  enabled: boolean
  eyebrow?: string
  title?: string
  body?: string
  link?: string
}

const EV_SIMULATOR_LINK = '/resources/enterprise-value-simulator'
const EV_SIMULATOR_COVER = '/images/resources/enterprise-value-simulator-cover.webp'
const EV_SIMULATOR_ALT =
  'Five-year enterprise value projection driven by leakage recovery, pricing alignment, and operational efficiency'
const PRICING_WHITEPAPER_SLUG = 'the-price-you-set-is-not-the-price-you-get'
const PRICING_WHITEPAPER_ALT =
  'Fee schedule compared with realized pricing outcomes affected by discounts, waivers, and legacy arrangements'

function postCoverAlt(post: PostCard) {
  return post.slug.current === PRICING_WHITEPAPER_SLUG
    ? PRICING_WHITEPAPER_ALT
    : post.title
}

// ── Post card ─────────────────────────────────────────────────────────────────

function PostCardItem({ post }: { post: PostCard }) {
  const href     = `/${post.category?.slug?.current ?? 'blog'}/${post.slug.current}`
  const catSlug  = post.category?.slug?.current ?? 'blog'
  const catLabel = CAT_LABELS[catSlug] ?? post.category?.title ?? 'Article'
  const cat      = CAT_COLORS[catSlug] ?? DEFAULT_CAT

  return (
    <a
      href={href}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#1a1410',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
        textDecoration: 'none',
        transition: 'box-shadow 0.2s, transform 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.08)'
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.04)'
        el.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ height: 220, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
        {post.coverImage?.asset ? (
          <img
            src={urlFor(post.coverImage).width(700).url()}
            alt={postCoverAlt(post)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1e2d42, #162033)' }} />
        )}
        <span style={{
          position: 'absolute', top: 12, left: 14,
          fontSize: 11, fontWeight: 600, letterSpacing: '0.03em',
          color: cat.text, backgroundColor: cat.bg,
          padding: '3px 10px', borderRadius: 999,
        }}>
          {catLabel}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '18px 20px 22px' }}>
        {post.publishedAt && (
          <p style={{ fontSize: 11, color: 'rgba(244,244,244,0.35)', marginBottom: 8 }}>
            {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}
        <h3 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4, color: '#f4f4f4', marginBottom: 10 }}>
          {post.title}
        </h3>
        {post.excerpt && (
          <p style={{
            fontSize: 13, color: 'rgba(244,244,244,0.55)', lineHeight: 1.6, marginBottom: 16,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {post.excerpt}
          </p>
        )}
        <div style={{ marginTop: 'auto' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#3b84ff' }}>Read more</span>
        </div>
      </div>
    </a>
  )
}

// ── Ad unit card (slot 3) ─────────────────────────────────────────────────────

function AdUnitCard({ ad }: { ad: AdUnit }) {
  const [hovered, setHovered] = useState(false)
  const showEnterpriseValueCover = ad.link === EV_SIMULATOR_LINK

  return (
    <a
      href={ad.link ?? '#'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0a0806',
        textDecoration: 'none',
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        // Gradient border via box-shadow trick — no pseudo-elements in inline React
        outline: '2px solid transparent',
        outlineOffset: '-2px',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Gradient border overlay */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          padding: 2,
          background: 'linear-gradient(135deg, #FACC22, #FB5607, #4760FF, #0DCCFF)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {showEnterpriseValueCover && (
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            height: 220,
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          <img
            src={EV_SIMULATOR_COVER}
            alt={EV_SIMULATOR_ALT}
            width={1000}
            height={565}
            loading="lazy"
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
            }}
          />
        </div>
      )}

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        padding: showEnterpriseValueCover ? '18px 20px 22px' : '28px 24px 28px',
        justifyContent: showEnterpriseValueCover ? 'flex-start' : 'center',
      }}>
        {ad.eyebrow && (
          <p style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#fb5607',
            marginBottom: 14,
          }}>
            {ad.eyebrow}
          </p>
        )}

        <h3 style={{
          fontSize: 22,
          fontWeight: 700,
          lineHeight: 1.2,
          color: '#f4f4f4',
          marginBottom: 14,
        }}>
          {ad.title}
        </h3>

        {ad.body && (
          <p style={{
            fontSize: 13,
            color: 'rgba(244,244,244,0.55)',
            lineHeight: 1.65,
            marginBottom: 24,
          }}>
            {ad.body}
          </p>
        )}

        <span style={{
          fontSize: 13,
          fontWeight: 700,
          color: hovered ? '#fb5607' : '#3b84ff',
          transition: 'color 0.15s',
          letterSpacing: '0.02em',
        }}>
          Try it now &rarr;
        </span>
      </div>
    </a>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  posts: PostCard[]
  featuredPosts: PostCard[]
  events: Event[]
  adUnit?: AdUnit | null
}

export default function ResourcesClient({ posts, featuredPosts, events, adUnit }: Props) {
  const [search, setSearch]             = useState('')
  const [categoryFilter, setCategory]   = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const eventsRef = useRef<HTMLElement>(null)

  const showAdUnit = !!(adUnit?.enabled && adUnit.title)

  const categoryOptions = Array.from(
    new Map(
      posts
        .map(p => p.category)
        .filter(Boolean)
        .map(c => [c.slug.current, { value: c.slug.current, label: c.title }])
    ).values()
  ).sort((a, b) => a.label.localeCompare(b.label))

  // Build pill options: insert "Events" between "Case Study" and "News" if events exist
  // We keep the category pills as-is and add Events separately in the render
  const hasActiveFilters = !!(search || categoryFilter)

  function reset() {
    setSearch('')
    setCategory('')
    setVisibleCount(PAGE_SIZE)
  }

  function scrollToEvents(e: React.MouseEvent) {
    e.preventDefault()
    eventsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const filtered = posts.filter(post => {
    if (categoryFilter && post.category?.slug?.current !== categoryFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!post.title.toLowerCase().includes(q) && !(post.excerpt ?? '').toLowerCase().includes(q)) return false
    }
    return true
  })

  const firstPageSize = showAdUnit && !hasActiveFilters ? PAGE_SIZE - 1 : PAGE_SIZE
  const totalVisible = visibleCount <= PAGE_SIZE ? firstPageSize : firstPageSize + (visibleCount - PAGE_SIZE)
  const visible = filtered.slice(0, totalVisible)
  const hasMore = filtered.length > totalVisible

  useEffect(() => { setVisibleCount(PAGE_SIZE) }, [search, categoryFilter])

  // Build the pills in alphabetical order, injecting "Events" between Case Study and News
  const allPills: { key: string; label: string; isEvents?: boolean }[] = [
    { key: 'all', label: 'All' },
    ...categoryOptions.map(o => ({ key: o.value, label: CAT_LABELS[o.value] ?? o.label })),
  ]

  // Insert Events pill alphabetically (between Case Study and News)
  const upcomingEventsCount = events.filter(e => new Date(e.startDate) >= new Date()).length
  if (upcomingEventsCount > 0) {
    const insertIdx = allPills.findIndex(p => p.label === 'News')
    const eventsEntry = { key: 'events', label: 'Events', isEvents: true }
    if (insertIdx > -1) {
      allPills.splice(insertIdx, 0, eventsEntry)
    } else {
      allPills.push(eventsEntry)
    }
  }

  return (
    <>
      {/* ── Filter bar ───────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 pb-10" style={{ position: 'relative', zIndex: 10 }}>
        <style>{`
          .pf-pill {
            padding: 5px 13px;
            font-size: 12.6px;
            font-weight: 600;
            border: 1px solid rgba(230,230,230,0);
            background: transparent;
            color: rgba(230,230,230,0.5);
            cursor: pointer;
            border-radius: 0;
            transition: color 0.15s;
            white-space: nowrap;
            font-family: inherit;
            line-height: 1;
          }
          .pf-pill:hover {
            color: #f4f4f4;
            border: 2px solid transparent;
            border-image: linear-gradient(135deg, #FACC22, #FB5607, #4760FF, #0DCCFF) 1;
            padding: 4px 12px;
          }
          .pf-pill.active {
            border: 1px solid rgba(255,255,255,0.35);
            background: rgba(255,255,255,0.10);
            color: #f4f4f4;
            padding: 5px 13px;
          }
          .pf-pill.active:hover {
            border: 1px solid rgba(255,255,255,0.35);
            background: rgba(255,255,255,0.10);
            color: #f4f4f4;
            padding: 5px 13px;
            border-image: none;
          }
          .pf-pill-events:hover {
            color: #f4f4f4 !important;
          }
          .pf-search::placeholder { color: rgba(220,220,220,0.55); }
        `}</style>

        {/* Search row */}
        <div style={{ maxWidth: 700, margin: '0 auto 10px' }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            border: '1px solid rgba(255,255,255,0.18)',
            backgroundColor: '#1a1410',
          }}>
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: 10, padding: '11px 18px' }}>
              <svg style={{ width: 15, height: 15, flexShrink: 0, color: 'rgba(244,244,244,0.55)' }} viewBox="0 0 20 20" fill="none">
                <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search"
                className="pf-search"
                style={{ width: '100%', background: 'none', border: 'none', outline: 'none', fontSize: '14px', color: '#f4f4f4', caretColor: '#f4f4f4' }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(244,244,244,0.5)', fontSize: 16, padding: '0 2px', lineHeight: 1, flexShrink: 0 }}
                >
                  &times;
                </button>
              )}
            </div>
            {hasActiveFilters && (
              <>
                <div style={{ width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
                <button
                  onClick={reset}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: '#3b84ff', whiteSpace: 'nowrap', padding: '0 18px',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fb5607')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#3b84ff')}
                >
                  Reset
                </button>
              </>
            )}
          </div>
        </div>

        {/* Category pills row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexWrap: 'wrap', gap: 4, padding: '6px 0',
        }}>
          {allPills.map(pill => {
            if (pill.isEvents) {
              return (
                <button
                  key="events"
                  onClick={scrollToEvents}
                  className="pf-pill pf-pill-events"
                >
                  Events
                </button>
              )
            }
            const isActive = pill.key === 'all' ? !categoryFilter : categoryFilter === pill.key
            return (
              <button
                key={pill.key}
                onClick={() => setCategory(pill.key === 'all' ? '' : (categoryFilter === pill.key ? '' : pill.key))}
                className={`pf-pill${isActive ? ' active' : ''}`}
              >
                {pill.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Featured posts ───────────────────────────────────── */}
      {featuredPosts.length > 0 && !hasActiveFilters && (
        <section className="mx-auto max-w-7xl px-6 pb-12">
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(244,244,244,0.3)' }}>
            Featured
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2" style={{ alignItems: 'stretch' }}>
            {featuredPosts.map(post => (
              <PostCardItem key={post._id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* ── All posts (with ad unit injected at slot 3) ──────── */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        {featuredPosts.length > 0 && !hasActiveFilters && (
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(244,244,244,0.3)' }}>
            Latest
          </p>
        )}
        {visible.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" style={{ alignItems: 'stretch' }}>
            {visible.map((post, idx) => (
              <Fragment key={post._id}>
                <PostCardItem post={post} />
                {idx === 1 && showAdUnit && !hasActiveFilters && totalVisible === firstPageSize && (
                  <AdUnitCard ad={adUnit!} />
                )}
              </Fragment>
            ))}
          </div>
        ) : (
          <p className="py-16 text-center" style={{ color: 'rgba(244,244,244,0.3)' }}>
            No articles found.
          </p>
        )}
        {hasMore && (
          <div className="mt-10 flex justify-center">
            <button onClick={() => setVisibleCount(c => c + PAGE_SIZE)} className="btn-alt">
              Load More
            </button>
          </div>
        )}
      </section>

      {/* ── Events (upcoming only) ──────────────────────────── */}
      {(() => {
        const now = new Date()
        const upcomingEvents = events.filter(e => new Date(e.startDate) >= now)
        if (upcomingEvents.length === 0) return null
        return (
          <section ref={eventsRef} id="events-section" className="mx-auto max-w-7xl px-6 pb-16" style={{ scrollMarginTop: '80px' }}>
            <div
              className="mb-8 h-px w-full"
              style={{ background: 'linear-gradient(90deg, #FACC22, #FB5607, #4760FF, #0DCCFF)' }}
            />
            <h2
              className="mb-8"
              style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.25rem)',
                fontWeight: 800,
                color: '#f4f4f4',
                letterSpacing: '-0.01em',
                lineHeight: 1.15,
              }}
            >
              Events
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map(event => (
                <EventCard key={event._id} event={event} variant="default" dark={true} />
              ))}
            </div>
          </section>
        )
      })()}
    </>
  )
}