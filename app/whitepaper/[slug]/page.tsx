// ─────────────────────────────────────────────
// app/whitepaper/[slug]/page.tsx
//
// Switches between the default shared template and
// bespoke custom templates based on post.template field.
// To add a new custom whitepaper:
//   1. Set template = 'custom' on the post in Sanity
//   2. Add an import and case to CUSTOM_TEMPLATES below
// ─────────────────────────────────────────────
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPost, getAllPostSlugs, getPosts } from '@/lib/sanity/queries'
import { sanityFetch } from '@/lib/sanity/client'
import PostDetail, { type PostSettings } from '@/components/sections/PostDetail'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'
import Script from 'next/script'
import { urlFor } from '@/lib/sanity/client'

// ── Custom template imports ───────────────────────────────────────────────────
import RevenueLeakageMap from '@/components/whitepapers/RevenueLeakageMap'
import PricingPerformance from '@/components/whitepapers/PricingPerformance'

const CUSTOM_TEMPLATES: Record<string, React.ComponentType<{ post: any }>> = {
  'the-revenue-leakage-map': RevenueLeakageMap,
  'the-price-you-set-is-not-the-price-you-get': PricingPerformance,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getPostSettings(): Promise<PostSettings | null> {
  const query = `*[_type == "postSettings"][0] {
    imageCtas[] { image, altText, linkUrl, openInNewTab },
    textCtas[]  { eyebrow, headline, description, linkLabel, linkUrl, openInNewTab }
  }`
  return sanityFetch<PostSettings | null>({ query, revalidate: 3600 })
}

async function getNewsletterBg() {
  const query = `*[_type == "newsletterSettings"][0] { ctaBackgroundImage }`
  const result = await sanityFetch<{ ctaBackgroundImage?: unknown }>({ query, revalidate: 3600 })
  return (result?.ctaBackgroundImage as any) ?? null
}

async function getRelatedPosts(currentId: string, topicSlugs: string[], limit = 3) {
  if (topicSlugs.length > 0) {
    const byTopic = await getPosts({ topic: topicSlugs[0], limit: limit + 1 })
    const filtered = byTopic.filter(p => p._id !== currentId).slice(0, limit)
    if (filtered.length >= limit) return filtered
  }
  const recent = await getPosts({ limit: limit + 1 })
  return recent.filter(p => p._id !== currentId).slice(0, limit)
}

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs()
  return slugs
    .filter(s => s.category === 'whitepaper')
    .map(s => ({ slug: s.slug }))
}

// ── Metadata ──────────────────────────────────────────────────────────────────

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
  const pageUrl      = `https://purefacts.com/whitepaper/${slug}`

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function WhitepaperPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post || post.category?.slug?.current !== 'whitepaper') notFound()

  // ── Custom template branch ────────────────────────────────────────────────
  const template = (post as any).template ?? 'default'

  if (template === 'custom') {
    const CustomTemplate = CUSTOM_TEMPLATES[slug]
    if (CustomTemplate) return <CustomTemplate post={post} />
    // Custom flag set in Sanity but component not yet built -- fall through to default
  }

  // ── Default template ──────────────────────────────────────────────────────
  const topicSlugs = post.topics?.map((t: any) => t.slug?.current).filter(Boolean) ?? []

  const [postSettings, relatedPosts, newsletterBg] = await Promise.all([
    getPostSettings(),
    getRelatedPosts(post._id, topicSlugs),
    getNewsletterBg(),
  ])

  const ogImageAsset = post.seo?.ogImage ?? post.coverImage ?? null
const ogImageUrl   = ogImageAsset
  ? urlFor(ogImageAsset).width(1200).url()
  : 'https://purefacts.com/og-homepage.png'
const pageUrl      = `https://purefacts.com/whitepaper/${slug}`

const schemaJson = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type':       'Article',
      '@id':         pageUrl,
      headline:      post.title,
      description:   post.seo?.metaDescription ?? post.excerpt ?? '',
      url:           pageUrl,
      datePublished: post.publishedAt,
      dateModified:  (post as any)._updatedAt ?? post.publishedAt,
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
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',        item: 'https://purefacts.com' },
        { '@type': 'ListItem', position: 2, name: 'Whitepapers', item: 'https://purefacts.com/whitepaper' },
        { '@type': 'ListItem', position: 3, name: post.title,    item: pageUrl },
      ],
    },
  ],
})

return (
  <>
    <Script
      id={`schema-whitepaper-${slug}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: schemaJson }}
    />
    <BreadcrumbJsonLd pathname={`/whitepaper/${slug}`} label={post.title} />
    <PostDetail
      post={post as any}
      relatedPosts={relatedPosts as any}
      postSettings={postSettings}
      newsletterBg={newsletterBg}
    />
  </>
)
}
