import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity/client'
import type { PostCard as PostCardType } from '@/lib/sanity/queries'

// ─── Variant sizes ────────────────────────────────────────────────────────────
// default  → blog index grid, homepage featured
// compact  → sidebar / related posts (no excerpt)

type Variant = 'default' | 'compact'

interface PostCardProps {
  post: PostCardType
  variant?: Variant
  priority?: boolean // pass true for above-the-fold cards
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function PostCard({ post, variant = 'default', priority = false }: PostCardProps) {
  const { title, slug, publishedAt, excerpt, coverImage, category, author } = post
  const href = `/${category.slug.current}/${slug.current}`
  const isCompact = variant === 'compact'

  return (
    <Link
      href={href}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#e8e8e8] hover:shadow-lg transition-shadow duration-200"
    >
      {/* Cover image */}
      <div className={`relative w-full overflow-hidden bg-[#f4f4f4] ${isCompact ? 'h-40' : 'h-52'}`}>
        {coverImage?.asset ? (
          <Image
            src={urlFor(coverImage).width(isCompact ? 480 : 720).height(isCompact ? 160 : 208).fit('crop').url()}
            alt={title}
            fill
            sizes={isCompact ? '(max-width: 768px) 100vw, 320px' : '(max-width: 768px) 100vw, 480px'}
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            priority={priority}
          />
        ) : (
          // Gradient placeholder when no image
          <div className="absolute inset-0 bg-gradient-to-br from-[#FACC22] via-[#FB5607] to-[#4760FF]" />
        )}
      </div>

      {/* Body */}
      <div className={`flex flex-col flex-1 ${isCompact ? 'p-4 gap-2' : 'p-6 gap-3'}`}>
        {/* Category pill */}
        <span className="self-start text-xs font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-[#3b84ff]/10 text-[#3b84ff]">
          {category.title}
        </span>

        {/* Title */}
        <h3 className={`font-semibold text-[#140f0c] leading-snug group-hover:text-[#3b84ff] transition-colors ${isCompact ? 'text-sm line-clamp-2' : 'text-lg line-clamp-3'}`}>
          {title}
        </h3>

        {/* Excerpt — default only */}
        {!isCompact && excerpt && (
          <p className="text-sm text-[#140f0c]/60 leading-relaxed line-clamp-3">
            {excerpt}
          </p>
        )}

        {/* Meta row */}
        <div className="mt-auto flex items-center gap-2 pt-2">
          {author?.photo?.asset && (
            <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 bg-[#f4f4f4]">
              <Image
                src={urlFor(author.photo).width(56).height(56).fit('crop').url()}
                alt={author.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex flex-col leading-tight">
            {author?.name && (
              <span className="text-xs font-medium text-[#140f0c]">{author.name}</span>
            )}
            {publishedAt && (
              <span className="text-xs text-[#140f0c]/50">{formatDate(publishedAt)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}