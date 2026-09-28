// ─────────────────────────────────────────────
// lib/postPageFactory.tsx
// ─────────────────────────────────────────────
import type { Metadata } from 'next'
import Script from 'next/script'
import { notFound } from 'next/navigation'
import { getPost, getAllPostSlugs, getPosts } from '@/lib/sanity/queries'
import { sanityFetch } from '@/lib/sanity/client'
import PostDetail, { type PostSettings } from '@/components/sections/PostDetail'
import { urlFor } from '@/lib/sanity/client'

const CATEGORY_LABELS: Record<string, string> = {
  blog:            'Blog',
  'case-study':    'Case Studies',
  whitepaper:      'Whitepapers',
  news:            'News',
  'press-release': 'Press Releases',
  awards:          'Awards',
  topic:           'Topics',
}

function buildArticleSchema(
  post: any,
  categorySlug: string,
  slug: string,
  ogImageUrl: string
) {
  const pageUrl      = `https://purefacts.com/${categorySlug}/${slug}`
  const categoryLabel = CATEGORY_LABELS[categorySlug] ?? categorySlug
  const articleType  = categorySlug === 'blog' ? 'BlogPosting' : 'Article'

  const article: any = {
    '@type':       articleType,
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
    author: post.author?.name
      ? {
          '@type': 'Person',
          name:    post.author.name,
          ...(post.author.slug?.current && {
            url: `https://purefacts.com/author/${post.author.slug.current}`,
          }),
        }
      : {
          '@type': 'Organization',
          name:    'PureFacts Financial Solutions',
          url:     'https://purefacts.com',
        },
    image: { '@type': 'ImageObject', url: ogImageUrl, width: 1200, height: 630 },
  }

  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',        item: 'https://purefacts.com' },
      { '@type': 'ListItem', position: 2, name: categoryLabel, item: `https://purefacts.com/${categorySlug}` },
      { '@type': 'ListItem', position: 3, name: post.title,    item: pageUrl },
    ],
  }

  const graph: any[] = [article, breadcrumb]

  if (Array.isArray(post.faqs) && post.faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: post.faqs.map((faq: { question: string; answer: string }) => ({
        '@type': 'Question',
        name:    faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    })
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
}

async function getPostSettings(): Promise<PostSettings | null> {
  const query = `*[_type == "postSettings"][0] {
    imageCtas[] { image, altText, linkUrl, openInNewTab },
    textCtas[]  { eyebrow, headline, description, linkLabel, linkUrl, openInNewTab },
    bottomCta { title, linkLabel, linkUrl }
  }`
  return sanityFetch<PostSettings | null>({ query, revalidate: 3600 })
}

async function getNewsletterBg() {
  const query  = `*[_type == "newsletterSettings"][0] { ctaBackgroundImage }`
  const result = await sanityFetch<{ ctaBackgroundImage?: unknown }>({ query, revalidate: 3600 })
  return (result?.ctaBackgroundImage as any) ?? null
}

async function getRelatedPosts(currentId: string, topicSlugs: string[], limit = 3) {
  if (topicSlugs.length > 0) {
    const byTopic  = await getPosts({ topic: topicSlugs[0], limit: limit + 1 })
    const filtered = byTopic.filter(p => p._id !== currentId).slice(0, limit)
    if (filtered.length >= limit) return filtered
  }
  const recent = await getPosts({ limit: limit + 1 })
  return recent.filter(p => p._id !== currentId).slice(0, limit)
}

export function buildPostPage(categorySlug: string) {
  async function generateStaticParams() {
    const slugs = await getAllPostSlugs()
    return slugs
      .filter(s => s.category === categorySlug)
      .map(s => ({ slug: s.slug }))
  }

  async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> }
  ): Promise<Metadata> {
    const { slug } = await params
    const post     = await getPost(slug)
    if (!post) return {}

    const ogImageAsset = post.seo?.ogImage ?? post.coverImage ?? null
    const ogImageUrl   = ogImageAsset
      ? urlFor(ogImageAsset).width(1200).url()
      : 'https://purefacts.com/og-homepage.png'
    const pageUrl      = `https://purefacts.com/${categorySlug}/${slug}`

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

  async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const post     = await getPost(slug)

    if (!post || post.category?.slug?.current !== categorySlug) notFound()

    const topicSlugs   = post.topics?.map((t: any) => t.slug?.current).filter(Boolean) ?? []
    const ogImageAsset = post.seo?.ogImage ?? post.coverImage ?? null
    const ogImageUrl   = ogImageAsset
      ? urlFor(ogImageAsset).width(1200).url()
      : 'https://purefacts.com/og-homepage.png'
    const schemaJson   = buildArticleSchema(post, categorySlug, slug, ogImageUrl)

    const [postSettings, relatedPosts, newsletterBg] = await Promise.all([
      getPostSettings(),
      getRelatedPosts(post._id, topicSlugs),
      getNewsletterBg(),
    ])

    return (
      <>
        <Script
          id={`schema-${categorySlug}-${slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemaJson }}
        />
        <PostDetail
          post={post as any}
          relatedPosts={relatedPosts as any}
          postSettings={postSettings}
          newsletterBg={newsletterBg}
        />
      </>
    )
  }

  return { generateStaticParams, generateMetadata, Page }
}