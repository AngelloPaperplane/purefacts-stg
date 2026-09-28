import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity/client'
import type { PostCard as PostCardType } from '@/lib/sanity/queries'

const CATEGORY_STYLES: Record<string, string> = {
  'blog':           'bg-blue-100 text-blue-700',
  'case-study': 'bg-orange-100 text-orange-700',
  'whitepaper':     'bg-yellow-100 text-yellow-700',
  'press-release':  'bg-purple-100 text-purple-700',
  'news':           'bg-green-100 text-green-700',
  'awards':         'bg-red-100 text-red-700',
}

const CATEGORY_LABELS: Record<string, string> = {
  'blog':           'Blog',
  'case-study': 'Case Study',
  'whitepaper':     'Whitepaper',
  'press-release':  'Press Release',
  'news':           'News',
  'awards':         'Award',
}

type Props = {
  post: PostCardType
  variant?: 'default' | 'horizontal'
}

export default function PostCard({ post, variant = 'default' }: Props) {
  const { title, slug, publishedAt, excerpt, coverImage, category, author } = post
  const href = `/${category.slug.current}/${slug.current}`
  const categorySlug = category.slug.current
  const badgeStyle = CATEGORY_STYLES[categorySlug] ?? 'bg-gray-100 text-gray-600'
  const badgeLabel = CATEGORY_LABELS[categorySlug] ?? category.title
  const date = new Date(publishedAt).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  if (variant === 'horizontal') {
    return (
      <Link href={href} className="group flex gap-5 rounded-xl border border-gray-200 p-4 transition-shadow hover:shadow-md">
        {coverImage && (
          <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-gray-100">
            <Image src={urlFor(coverImage).width(128).height(96).url()} alt={title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
          </div>
        )}
        <div className="flex flex-col justify-center gap-1.5">
          <span className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeStyle}`}>{badgeLabel}</span>
          <h3 className="text-sm font-semibold leading-snug text-brand-off-black line-clamp-2 group-hover:text-brand-blue transition-colors">{title}</h3>
          <p className="text-xs text-gray-400">{date}</p>
        </div>
      </Link>
    )
  }

  return (
    <Link href={href} className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 transition-shadow hover:shadow-lg">
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        {coverImage ? (
          <Image src={urlFor(coverImage).width(600).height(400).url()} alt={title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200" />
        )}
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeStyle}`}>{badgeLabel}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-base font-semibold leading-snug text-brand-off-black line-clamp-2 group-hover:text-brand-blue transition-colors">{title}</h3>
        {excerpt && <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{excerpt}</p>}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {author?.photo && (
              <div className="relative h-6 w-6 overflow-hidden rounded-full bg-gray-200">
                <Image src={urlFor(author.photo).width(24).height(24).url()} alt={author.name} fill className="object-cover" />
              </div>
            )}
            {author?.name && <span className="text-xs text-gray-400">{author.name}</span>}
          </div>
          <span className="text-xs text-gray-400">{date}</span>
        </div>
      </div>
    </Link>
  )
}