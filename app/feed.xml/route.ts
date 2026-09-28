import { sanityFetch, urlFor } from '@/lib/sanity/client'

const SITE_URL = 'https://purefacts.com'
const FEED_TITLE = 'PureFacts Financial Solutions'
const FEED_DESCRIPTION = 'Thought leadership, real-world learnings, and fresh ideas from the people driving change across financial firms.'

const FEED_QUERY = `
  *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) [0..49] {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    coverImage,
    category-> {
      slug,
      title
    }
  }
`

interface FeedPost {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt: string
  coverImage?: unknown
  category?: {
    slug: { current: string }
    title: string
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const posts = await sanityFetch<FeedPost[]>({ query: FEED_QUERY, revalidate: 3600 })

  const items = posts.map(post => {
    const categorySlug = post.category?.slug?.current ?? 'blog'
    const url = `${SITE_URL}/${categorySlug}/${post.slug.current}`
    const pubDate = new Date(post.publishedAt).toUTCString()
    const title = escapeXml(post.title)
    const description = post.excerpt ? escapeXml(post.excerpt) : ''

    let enclosure = ''
    if (post.coverImage) {
      try {
        const imageUrl = urlFor(post.coverImage).width(1200).url()
        enclosure = `<enclosure url="${escapeXml(imageUrl)}" type="image/jpeg" length="0" />`
      } catch {
        // skip if image URL fails
      }
    }

    return `
    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      ${description ? `<description>${description}</description>` : ''}
      ${enclosure}
    </item>`
  }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${FEED_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${FEED_DESCRIPTION}</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}