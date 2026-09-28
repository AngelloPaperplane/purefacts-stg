// ─────────────────────────────────────────────
// components/sections/CaseStudyDetail.tsx
// ─────────────────────────────────────────────
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity/client'
import type { PostFull } from '@/lib/sanity/queries'
import PostDetailSidebar from './PostDetailSidebar'
import NewsletterForm from './NewsletterForm'
import type { PostSettings } from './PostDetail'

// ── Types ─────────────────────────────────────────────────────────────────────

type Block = {
  _type: string
  _key: string
  style?: string
  listItem?: string
  markDefs?: { _key: string; _type: string; href?: string }[]
  children?: { _key: string; text: string; marks: string[] }[]
  asset?: { _ref: string }
  hotspot?: { x: number; y: number }
}

type RelatedPost = {
  _id: string
  title: string
  slug: { current: string }
  publishedAt: string
  coverImage?: { asset: { _ref: string } }
  category?: { slug: { current: string } }
  excerpt?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

// ── Portable Text renderer (shared logic) ─────────────────────────────────────

function renderSpan(
  span: { text: string; marks: string[] },
  markDefs: Block['markDefs'] = [],
  key: string
): React.ReactNode {
  let content: React.ReactNode = span.text
  for (const mark of span.marks) {
    const def = markDefs.find(d => d._key === mark)
    if (def?._type === 'link') {
      content = (
        <a key={mark} href={def.href}
          className="text-brand-blue underline hover:opacity-80"
          target={def.href?.startsWith('http') ? '_blank' : undefined}
          rel={def.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        >{content}</a>
      )
    } else if (mark === 'strong')   content = <strong key={mark}>{content}</strong>
    else if (mark === 'em')         content = <em key={mark}>{content}</em>
    else if (mark === 'underline')  content = <u key={mark}>{content}</u>
  }
  return <span key={key}>{content}</span>
}

function renderBlock(block: Block): React.ReactNode {
  if (block._type === 'image' && block.asset) {
    return (
      <figure key={block._key} className="my-8">
        <img
          src={urlFor({ _type: 'image', asset: block.asset, hotspot: block.hotspot }).width(800).url()}
          alt={(block as any).alt ?? ''}
          className="h-auto w-full"
        />
      </figure>
    )
  }
  if (block._type !== 'block') return null

  const children = block.children ?? []
  const markDefs = block.markDefs ?? []
  const text     = children.map(s => s.text).join('')
  const rendered = children.map(span => renderSpan(span, markDefs, span._key))

  if (block.listItem === 'bullet') return <li key={block._key} className="ml-4 text-gray-700">{rendered}</li>
  if (block.listItem === 'number') return <li key={block._key} className="ml-4 text-gray-700">{rendered}</li>

  const style = block.style ?? 'normal'
  switch (style) {
    case 'h1': return <h1 key={block._key} className="mt-10 mb-4 text-3xl font-bold text-brand-off-black">{rendered}</h1>
    case 'h2': return <h2 key={block._key} className="mt-10 mb-4 text-2xl font-bold text-brand-off-black">{rendered}</h2>
    case 'h3': return <h3 key={block._key} className="mt-6 mb-3 text-lg font-bold text-brand-off-black">{rendered}</h3>
    case 'h4': return <h4 key={block._key} className="mt-5 mb-2 text-base font-bold text-brand-off-black">{rendered}</h4>
    case 'blockquote':
      return <blockquote key={block._key} className="my-6 border-l-4 border-brand-blue pl-4 italic text-gray-600">{rendered}</blockquote>
    default:
      if (!text.trim()) return null
      return <p key={block._key} className="my-4 text-gray-700 leading-relaxed">{rendered}</p>
  }
}

function renderBody(body: Block[]) {
  const output: React.ReactNode[] = []
  let i = 0
  while (i < body.length) {
    const block = body[i]
    if (block.listItem === 'bullet') {
      const items: Block[] = []
      while (i < body.length && body[i].listItem === 'bullet') { items.push(body[i]); i++ }
      output.push(<ul key={`ul-${items[0]._key}`} className="my-4 list-disc space-y-1 pl-6">{items.map(renderBlock)}</ul>)
      continue
    }
    if (block.listItem === 'number') {
      const items: Block[] = []
      while (i < body.length && body[i].listItem === 'number') { items.push(body[i]); i++ }
      output.push(<ol key={`ol-${items[0]._key}`} className="my-4 list-decimal space-y-1 pl-6">{items.map(renderBlock)}</ol>)
      continue
    }
    output.push(renderBlock(block))
    i++
  }
  return output
}

// ── Related post card ─────────────────────────────────────────────────────────

function RelatedPostCard({ post }: { post: RelatedPost }) {
  const cat = post.category?.slug?.current ?? 'blog'
  return (
    <Link href={`/${cat}/${post.slug.current}`} className="group flex flex-col border border-gray-200 bg-white">
      <div className="overflow-hidden bg-gray-100" style={{ aspectRatio: '16/9' }}>
        {post.coverImage ? (
          <img
            src={urlFor(post.coverImage).width(600).url()}
            alt={post.title}
            className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-blue/10 to-brand-orange/10" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-2 text-xs text-gray-400">{formatDate(post.publishedAt)}</p>
        <h3 className="mb-3 text-sm font-bold leading-snug text-brand-off-black group-hover:text-brand-blue transition-colors">
          {post.title}
        </h3>
        <span className="mt-auto text-xs font-semibold text-brand-blue">Read more</span>
      </div>
    </Link>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface CaseStudyDetailProps {
  post: PostFull & {
    template?: string
    clientProfile?: {
      logo?: { asset: { _ref: string }; hotspot?: unknown }
      companyName?: string
      profileLine?: string
    }
  }
  relatedPosts: RelatedPost[]
  postSettings: PostSettings | null
  newsletterBg?: { asset: { _ref: string } } | null
}

export default function CaseStudyDetail({ post, relatedPosts, postSettings, newsletterBg }: CaseStudyDetailProps) {
  const body          = (post.body ?? []) as Block[]
  const clientProfile = post.clientProfile
  const bottomCta     = postSettings?.bottomCta

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="bg-[#f4f4f4]">
        <div className="h-px w-full bg-brand-gradient" />
        <div className="mx-auto max-w-7xl px-6 py-10 lg:py-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">

            {/* Left: meta + title */}
            <div className="flex-1">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-orange">
                Case Study
              </p>
              <h1 className="text-3xl font-bold leading-tight text-brand-off-black lg:text-4xl">
                {post.title}
              </h1>
              <p className="mt-4 text-sm text-gray-500">{formatDate(post.publishedAt)}</p>

              {/* Share row */}
              <div className="mt-4 flex items-center gap-3 text-sm text-gray-400">
                <span className="font-semibold text-gray-500">Share the Post:</span>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue transition-colors"><i className="fa-brands fa-facebook" /></a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue transition-colors"><i className="fa-brands fa-linkedin" /></a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue transition-colors"><i className="fa-brands fa-x-twitter" /></a>
                <a href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} className="hover:text-brand-blue transition-colors"><i className="fa-regular fa-envelope" /></a>
              </div>
            </div>

            {/* Right: cover image */}
            {post.coverImage && (
              <div className="w-full lg:w-[320px] shrink-0">
                <img
                  src={urlFor(post.coverImage).width(640).url()}
                  alt={post.title}
                  className="h-auto w-full"
                />
              </div>
            )}
          </div>
        </div>
        <div className="h-px w-full bg-brand-gradient" />
      </section>

      {/* ── Body + Sidebar ─────────────────────────────────── */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-14">

            {/* Article body (65%) */}
            <article className="min-w-0 lg:w-[65%]">

              {/* ── Client profile block ──────────────────────── */}
              {clientProfile && (clientProfile.logo || clientProfile.companyName || clientProfile.profileLine) && (
                <div className="mb-8 flex items-start gap-5 border border-gray-200 bg-[#f9f9f9] p-5">
                  {clientProfile.logo && (
                    <div className="relative h-12 w-24 shrink-0">
                      <img
                        src={urlFor(clientProfile.logo).width(200).url()}
                        alt={clientProfile.companyName ?? 'Client logo'}
                        className="h-full w-full object-contain object-left"
                      />
                    </div>
                  )}
                  <div>
                    {clientProfile.companyName && (
                      <p className="text-sm font-bold text-brand-off-black">{clientProfile.companyName}</p>
                    )}
                    {clientProfile.profileLine && (
                      <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                        <span className="font-semibold text-brand-off-black">Client Profile: </span>
                        {clientProfile.profileLine}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Body content */}
              <div>{renderBody(body)}</div>

              {/* Back / share row */}
              <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-6">
                <Link href="/resources" className="text-sm font-semibold text-brand-blue hover:underline">
                  ← Back to Resources
                </Link>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span className="font-semibold">Share:</span>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue transition-colors"><i className="fa-brands fa-facebook" /></a>
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue transition-colors"><i className="fa-brands fa-linkedin" /></a>
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue transition-colors"><i className="fa-brands fa-x-twitter" /></a>
                  <a href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} className="hover:text-brand-blue transition-colors"><i className="fa-regular fa-envelope" /></a>
                </div>
              </div>
            </article>

            {/* Sidebar (35%) */}
            <aside className="lg:w-[35%] shrink-0">
              <PostDetailSidebar
                imageCtas={postSettings?.imageCtas ?? []}
                textCtas={postSettings?.textCtas ?? []}
              />
            </aside>

          </div>
        </div>
      </section>

      {/* ── Bottom CTA band (case study specific) ──────────── */}
      {bottomCta?.title && (
        <section className="bg-brand-blue py-14">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-2xl font-bold text-white lg:text-3xl">
              {bottomCta.title}
            </h2>
            {bottomCta.linkUrl && bottomCta.linkLabel && (
              <Link
                href={bottomCta.linkUrl}
                className="mt-8 inline-flex items-center gap-2 border-2 border-white px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-white hover:text-brand-blue"
              >
                {bottomCta.linkLabel}
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ── Related posts ───────────────────────────────────── */}
      {relatedPosts.length > 0 && (
        <section className="bg-[#f4f4f4] py-14">
          <div className="h-px w-full bg-brand-gradient mb-0" />
          <div className="mx-auto max-w-[1200px] px-6 pt-10">
            <h2 className="mb-8 text-2xl font-bold text-brand-off-black">Recent Posts</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map(p => <RelatedPostCard key={p._id} post={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Newsletter band ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-off-black" style={{ minHeight: 460 }}>
        <div className="absolute inset-0 z-0" style={{ backgroundImage: 'url(/background/black-bg.svg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        {newsletterBg && (
          <div className="absolute bottom-0 left-0 z-10 h-full w-[42%] animate-slide-in-left">
            <Image src={urlFor(newsletterBg).width(900).url()} alt="" fill className="object-contain object-left-bottom" />
          </div>
        )}
        <div className="relative z-20 flex min-h-[460px] flex-col justify-center px-10 py-16 lg:ml-[42%] lg:max-w-[640px]">
          <h2 className="text-3xl font-bold text-white lg:text-4xl">
            Insights That <span className="text-brand-yellow">Power Better Decisions</span>
          </h2>
          <p className="mt-3 text-base text-gray-300 leading-relaxed">
            Subscribe to receive our monthly roundup of PureFacts commentary on revenue management, optimization, and industry trends.
          </p>
          <div className="mt-8 [&_.hs-newsletter-form_.hs-form-field_label]:hidden [&_.hs-newsletter-form_.hs-input]:w-full [&_.hs-newsletter-form_.hs-input]:rounded-none [&_.hs-newsletter-form_.hs-input]:border [&_.hs-newsletter-form_.hs-input]:border-white/30 [&_.hs-newsletter-form_.hs-input]:bg-white/10 [&_.hs-newsletter-form_.hs-input]:px-4 [&_.hs-newsletter-form_.hs-input]:py-3 [&_.hs-newsletter-form_.hs-input]:text-white [&_.hs-newsletter-form_.hs-input]:placeholder-gray-400 [&_.hs-newsletter-form_.hs-input]:outline-none [&_.hs-newsletter-form_.hs-button]:mt-4 [&_.hs-newsletter-form_.hs-button]:cursor-pointer [&_.hs-newsletter-form_.hs-button]:bg-brand-yellow [&_.hs-newsletter-form_.hs-button]:px-8 [&_.hs-newsletter-form_.hs-button]:py-3 [&_.hs-newsletter-form_.hs-button]:font-semibold [&_.hs-newsletter-form_.hs-button]:text-brand-off-black [&_.hs-newsletter-form_.hs-button]:border-0 [&_.hs-newsletter-form_.hs-error-msgs]:mt-1 [&_.hs-newsletter-form_.hs-error-msgs]:text-sm [&_.hs-newsletter-form_.hs-error-msgs]:text-red-400">
            <NewsletterForm />
          </div>
          <p className="mt-6 text-xs text-gray-500">By subscribing, you agree to receive marketing emails from PureFacts. Unsubscribe at any time.</p>
        </div>
      </section>
    </>
  )
}