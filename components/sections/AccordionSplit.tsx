'use client'

// Reusable 50/50 split section with accordion on one side and image on the other.
// Pass `imageLeft` to flip the layout.

import { useState } from 'react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity/client'
import type { SanityImage } from '@/lib/sanity/queries'

export type AccordionItem = {
  label: string
  detail: string
}

type Props = {
  headline: string
  subheadline?: string
  items: AccordionItem[]
  image: SanityImage | null
  imageAlt?: string
  imageLeft?: boolean
}

export default function AccordionSplit({
  headline,
  subheadline,
  items,
  image,
  imageAlt = '',
  imageLeft = false,
}: Props) {
  const [open, setOpen] = useState<string | null>(items[0]?.label ?? null)

  const accordionCol = (
    <div className="flex-1">
      <h2 className="text-3xl font-bold text-brand-off-black lg:text-4xl">{headline}</h2>
      {subheadline && (
        <p className="mt-4 text-base text-gray-600">{subheadline}</p>
      )}
      <div className="mt-8 divide-y divide-gray-200 border-t border-gray-200">
        {items.map(item => {
          const isOpen = open === item.label
          return (
            <div key={item.label}>
              <button
                onClick={() => setOpen(isOpen ? null : item.label)}
                className="flex w-full items-center gap-3 py-4 text-left"
              >
                <span className="relative h-4 w-4 shrink-0">
                  <Image
                    src={isOpen ? '/icons/open-bullet.svg' : '/icons/closed-bullet.svg'}
                    alt=""
                    fill
                    className="object-contain"
                  />
                </span>
                <span className={`text-base font-semibold transition-colors ${isOpen ? 'text-brand-blue' : 'text-brand-off-black'}`}>
                  {item.label}
                </span>
              </button>
              {isOpen && (
                <p className="pb-4 pl-7 text-base leading-relaxed text-gray-600">{item.detail}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  const imageCol = (
    <div className="relative h-80 w-full shrink-0 lg:w-1/2 lg:h-[460px]">
      {image ? (
        <Image
          src={urlFor(image).width(900).url()}
          alt={imageAlt}
          fill
          className="object-contain"
        />
      ) : (
        <div className="h-full w-full bg-gray-100" />
      )}
    </div>
  )

  return (
    <section className="bg-white py-20">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 lg:flex-row">
        {imageLeft ? (
          <>{imageCol}{accordionCol}</>
        ) : (
          <>{accordionCol}{imageCol}</>
        )}
      </div>
    </section>
  )
}