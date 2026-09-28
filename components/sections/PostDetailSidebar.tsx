'use client'

// ─────────────────────────────────────────────
// components/sections/PostDetailSidebar.tsx
// ─────────────────────────────────────────────
import Link from 'next/link'
import { urlFor } from '@/lib/sanity/client'

type ImageCta = {
  image?: { asset: { _ref: string }; hotspot?: unknown }
  altText?: string
  linkUrl?: string
  openInNewTab?: boolean
}

type TextCta = {
  eyebrow?: string
  headline?: string
  description?: string
  linkLabel?: string
  linkUrl?: string
  openInNewTab?: boolean
}

interface PostDetailSidebarProps {
  imageCtas: ImageCta[]
  textCtas: TextCta[]
}

export default function PostDetailSidebar({ imageCtas, textCtas }: PostDetailSidebarProps) {
  return (
    <div className="sticky top-28 flex flex-col gap-5 max-w-[340px]">

      {/* Image CTAs */}
      {imageCtas.map((cta, i) => {
        if (!cta.image) return null
        const imgUrl = urlFor(cta.image).width(400).url()
        const inner = (
          <img
            src={imgUrl}
            alt={cta.altText ?? ''}
            className="h-auto block transition-opacity hover:opacity-90"
            style={{ width: '100%', maxWidth: '340px' }}
          />
        )
        if (cta.linkUrl) {
          return (
            <a
              key={i}
              href={cta.linkUrl}
              target={cta.openInNewTab ? '_blank' : undefined}
              rel={cta.openInNewTab ? 'noopener noreferrer' : undefined}
            >
              {inner}
            </a>
          )
        }
        return <div key={i}>{inner}</div>
      })}

      {/* Text CTAs */}
      {textCtas.map((cta, i) => (
        <div key={i} className="border border-gray-200 bg-white p-5">
          {cta.eyebrow && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
              {cta.eyebrow}
            </p>
          )}
          {cta.headline && (
            <h3 className="mb-2 text-base font-bold text-brand-off-black leading-snug">
              {cta.headline}
            </h3>
          )}
          {cta.description && (
            <p className="mb-4 text-sm text-gray-500 leading-relaxed">
              {cta.description}
            </p>
          )}
          {cta.linkUrl && cta.linkLabel && (
            <a
              href={cta.linkUrl}
              target={cta.openInNewTab ? '_blank' : undefined}
              rel={cta.openInNewTab ? 'noopener noreferrer' : undefined}
              className="btn-secondary inline-flex text-sm"
            >
              {cta.linkLabel}
            </a>
          )}
        </div>
      ))}

    </div>
  )
}