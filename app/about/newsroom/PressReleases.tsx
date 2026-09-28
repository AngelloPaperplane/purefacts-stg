'use client'

import { useState } from 'react'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity/client'

const PAGE_SIZE = 6

type Post = {
  _id: string
  title: string
  slug: { current: string }
  publishedAt: string
  coverImage?: unknown
  excerpt?: string
}

export default function PressReleases({ posts }: { posts: Post[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const visible = posts.slice(0, visibleCount)
  const hasMore = visibleCount < posts.length

  if (posts.length === 0) {
    return (
      <section id="press-releases" style={{ background: '#140f0c' }} className="py-20 scroll-mt-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-bold mb-12" style={{ color: '#f4f4f4' }}>Press Releases</h2>
          <p style={{ color: 'rgba(244,244,244,0.4)' }}>No press releases published yet.</p>
        </div>
      </section>
    )
  }

  return (
    <section id="press-releases" style={{ background: '#140f0c', position: 'relative', zIndex: 1 }} className="py-20 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-3xl font-bold mb-12" style={{ color: '#f4f4f4' }}>Press Releases</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map(post => (
            <Link
              key={post._id}
              href={`/press-release/${post.slug.current}`}
              className="group flex flex-col overflow-hidden hover:shadow-lg transition-shadow"
              style={{ background: '#1a1410', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="w-full" style={{ background: '#1a1410' }}>
                {post.coverImage ? (
                  <img
                    src={urlFor(post.coverImage).width(600).url()}
                    alt={post.title}
                    className="h-auto w-full group-hover:opacity-90 transition-opacity duration-500"
                  />
                ) : (
                  <div className="h-64 w-full bg-brand-gradient opacity-60" />
                )}
              </div>
              <div className="flex flex-col flex-1 p-6 gap-3">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#fb5607' }}>
                  {new Date(post.publishedAt).toLocaleDateString('en-CA', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
                <h3 className="font-bold leading-snug group-hover:text-[#3b84ff] transition-colors" style={{ color: '#f4f4f4' }}>
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'rgba(244,244,244,0.65)' }}>
                    {post.excerpt}
                  </p>
                )}
                <span className="mt-auto text-sm font-semibold" style={{ color: '#3b84ff' }}>
                  Read more →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {hasMore && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
              className="btn-primary"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </section>
  )
}