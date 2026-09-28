// ─────────────────────────────────────────────
// app/topic/[slug]/page.tsx
// ─────────────────────────────────────────────
import type { Metadata } from 'next'
import Script from 'next/script'
import { notFound } from 'next/navigation'
import { getPost, getAllPostSlugs } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/client'
import TopicToC, { type TocItem } from '@/components/sections/TopicToC'
import TopicFaqs from '@/components/sections/TopicFaqs'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs()
  return slugs
    .filter(s => s.category === 'topic')
    .map(s => ({ slug: s.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const post     = await getPost(slug)
  if (!post) return {}

  const ogImageAsset = post.seo?.ogImage ?? post.coverImage ?? null
  const ogImageUrl   = ogImageAsset
    ? urlFor(ogImageAsset).width(1200).url()
    : 'https://purefacts.com/og-homepage.png'
  const pageUrl      = `https://purefacts.com/topic/${slug}`

  return {
    title:       post.seo?.metaTitle ?? `${post.title} | PureFacts`,
    description: post.seo?.metaDescription ?? post.excerpt ?? '',
    alternates:  { canonical: pageUrl },
    openGraph: {
      title:       post.seo?.metaTitle ?? post.title,
      description: post.seo?.metaDescription ?? post.excerpt ?? '',
      url:         pageUrl,
      type:        'article',
      images:      [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card:        'summary_large_image',
      title:       post.seo?.metaTitle ?? post.title,
      description: post.seo?.metaDescription ?? post.excerpt ?? '',
      images:      [ogImageUrl],
    },
  }
}

// ── Types and helpers ─────────────────────────────────────────────────────────

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

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

function renderSpan(
  span: { text: string; marks: string[] },
  markDefs: Block['markDefs'] = [],
  key: string
) {
  let content: React.ReactNode = span.text
  for (const mark of span.marks) {
    const def = markDefs.find(d => d._key === mark)
    if (def?._type === 'link') {
      content = (
        <a
          key={mark}
          href={def.href}
          className="text-brand-blue underline hover:opacity-80"
          target={def.href?.startsWith('http') ? '_blank' : undefined}
          rel={def.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          {content}
        </a>
      )
    } else if (mark === 'strong')  { content = <strong key={mark}>{content}</strong> }
    else if (mark === 'em')        { content = <em key={mark}>{content}</em> }
    else if (mark === 'underline') { content = <u key={mark}>{content}</u> }
  }
  return <span key={key}>{content}</span>
}

function renderBlock(block: Block) {
  if (block._type === 'image' && block.asset) {
    return (
      <figure key={block._key} className="my-8">
        <img
          src={urlFor({ _type: 'image', asset: block.asset, hotspot: block.hotspot }).width(800).url()}
          alt=""
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

  if (block.listItem) {
    return <li key={block._key} className="ml-4 text-gray-700">{rendered}</li>
  }

  const style = block.style ?? 'normal'
  const id    = (style === 'h2' || style === 'h3') ? slugify(text) : undefined

  switch (style) {
    case 'h1': return <h1 key={block._key} id={id} className="mt-10 mb-4 text-3xl font-bold text-brand-off-black scroll-mt-28">{rendered}</h1>
    case 'h2': return <h2 key={block._key} id={id} className="mt-10 mb-4 text-2xl font-bold text-brand-off-black scroll-mt-28">{rendered}</h2>
    case 'h3': return <h3 key={block._key} id={id} className="mt-6 mb-3 text-lg font-bold text-brand-off-black scroll-mt-28">{rendered}</h3>
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

function extractToc(body: Block[], hasFaqs: boolean): TocItem[] {
  const items: TocItem[] = []
  for (const block of body) {
    if (block._type !== 'block') continue
    const style = block.style ?? 'normal'
    if (style !== 'h2' && style !== 'h3') continue
    const text = (block.children ?? []).map(s => s.text).join('')
    if (!text.trim()) continue
    items.push({ id: slugify(text), text, level: style === 'h2' ? 2 : 3 })
  }
  if (hasFaqs) items.push({ id: 'faqs', text: 'FAQs', level: 2 })
  return items
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function TopicPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const post     = await getPost(slug)

  if (!post || post.category?.slug?.current !== 'topic') notFound()

  const body     = (post.body ?? []) as Block[]
  const faqs     = (post as any).faqs ?? []
  const tocItems = extractToc(body, faqs.length > 0)

  const ogImageAsset = post.seo?.ogImage ?? post.coverImage ?? null
  const ogImageUrl   = ogImageAsset
    ? urlFor(ogImageAsset).width(1200).url()
    : 'https://purefacts.com/og-homepage.png'
  const pageUrl      = `https://purefacts.com/topic/${slug}`

  const graph: any[] = [
    {
      '@type':       'Article',
      '@id':         pageUrl,
      headline:      post.title,
      description:   post.seo?.metaDescription ?? post.excerpt ?? '',
      url:           pageUrl,
      datePublished: post.publishedAt,
      dateModified:  post._updatedAt ?? post.publishedAt,
      publisher: {
        '@type': 'Organization',
        name:    'PureFacts Financial Solutions',
        url:     'https://purefacts.com',
        logo: {
          '@type': 'ImageObject',
          url:     'https://purefacts.com/purefacts-logo.png',
        },
      },
      author: {
        '@type': 'Organization',
        name:    'PureFacts Financial Solutions',
        url:     'https://purefacts.com',
      },
      image: { '@type': 'ImageObject', url: ogImageUrl, width: 1200, height: 630 },
    },
  ]

  if (faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq: { question: string; answer: string }) => ({
        '@type': 'Question',
        name:    faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    })
  }

  const schemaJson = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })

  return (
    <>
      <BreadcrumbJsonLd pathname={`/topic/${slug}`} label={post.title} />
      <Script
        id={`schema-topic-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schemaJson }}
      />

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="bg-[#f4f4f4]">
        <div className="h-px w-full bg-brand-gradient" />
        <div className="flex flex-col lg:flex-row lg:min-h-[220px]">
          <div className="flex items-center px-6 py-12 lg:w-3/4 lg:py-16 lg:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Topics
              </p>
              <h1 className="text-4xl font-bold leading-tight text-brand-off-black lg:text-5xl">
                {post.title}
              </h1>
            </div>
          </div>
          <div className="relative hidden lg:block lg:w-1/4 overflow-hidden bg-[#f4f4f4]">
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 300 220"
              fill="none"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <linearGradient id="chevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#FACC22" />
                  <stop offset="33%"  stopColor="#FB5607" />
                  <stop offset="66%"  stopColor="#4760FF" />
                  <stop offset="100%" stopColor="#0DCCFF" />
                </linearGradient>
              </defs>
              <path d="M20 20 L160 110 L20 200"  stroke="url(#chevGrad)" strokeWidth="36" strokeLinecap="square" fill="none" />
              <path d="M100 20 L240 110 L100 200" stroke="url(#chevGrad)" strokeWidth="36" strokeLinecap="square" fill="none" opacity="0.4" />
            </svg>
          </div>
        </div>
        <div className="h-px w-full bg-brand-gradient" />
      </section>

      {/* ── Two-column content layout ────────────────────────── */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
            <div className="min-w-0 lg:w-3/4">
              {post.coverImage && (
                <div className="mb-10">
                  <img
                    src={urlFor(post.coverImage).width(900).url()}
                    alt={post.title}
                    className="h-auto w-full"
                  />
                </div>
              )}
              <div>{renderBody(body)}</div>
              <TopicFaqs faqs={faqs} />
            </div>
            <aside className="hidden lg:block lg:w-1/4 shrink-0">
              <TopicToC items={tocItems} />
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}