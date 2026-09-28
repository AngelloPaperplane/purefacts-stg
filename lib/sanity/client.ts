import { createClient } from 'next-sanity'
import { createImageUrlBuilder } from '@sanity/image-url'

export const config = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
}

export const client = createClient(config)

const builder = createImageUrlBuilder(client)

export function urlFor(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source)
}

export async function sanityFetch<T>({
  query,
  params = {},
  revalidate = 60,
}: {
  query: string
  params?: Record<string, unknown>
  revalidate?: number
}): Promise<T> {
  return client.fetch<T>(query, params, {
    next: { revalidate },
  })
}