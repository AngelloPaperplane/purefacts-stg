import { MetadataRoute } from 'next'
import { client } from '@/lib/sanity/client'
import fs from 'fs'
import path from 'path'

export const revalidate = 0

const BASE_URL = 'https://purefacts.com'

// Recursively find all page.tsx files in the app directory
function getAppRoutes(dir: string, baseDir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const routes: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      // Skip these directories
      if (['studio', 'api', '(auth)'].includes(entry.name)) continue
      // Skip dynamic route segments like [slug]
      if (entry.name.startsWith('[')) continue
      routes.push(...getAppRoutes(fullPath, baseDir))
    } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
      const route = dir
        .replace(baseDir, '')
        .replace(/\\/g, '/')
      routes.push(route || '/')
    }
  }

  return routes
}

const postsQuery = `*[_type == "post" && defined(slug.current)] {
  "slug": slug.current,
  _updatedAt,
  "category": category->slug.current
}`

const categoryToPath: Record<string, string> = {
  blog: 'blog',
  'case-study': 'case-study',
  whitepaper: 'whitepaper',
  'press-release': 'press-release',
  news: 'news',
  awards: 'awards',
  topic: 'topic',
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appDir = path.join(process.cwd(), 'app')
  const routes = getAppRoutes(appDir, appDir)

  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '/' ? 1.0 : 0.8,
  }))

  const posts = await client.fetch(postsQuery)

  const postEntries: MetadataRoute.Sitemap = posts
    .filter((post: any) => categoryToPath[post.category])
    .map((post: any) => ({
      url: `${BASE_URL}/${categoryToPath[post.category]}/${post.slug}`,
      lastModified: new Date(post._updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

  return [...staticEntries, ...postEntries]
}