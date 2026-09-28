'use client'

import Image from 'next/image'
import { urlFor } from '@/lib/sanity/client'
import type { FeatureCard } from '@/lib/sanity/queries'

type Props = {
  cards: FeatureCard[]
}

export default function FeatureGrid({ cards }: Props) {
  if (!cards?.length) return null

  return (
    <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(card => {
        const bullets = [card.bulletOne, card.bulletTwo, card.bulletThree].filter(Boolean) as string[]

        return (
          <div key={card._key} className="group h-80 [perspective:1000px]">
            <div className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">

              {/* Front */}
              <div className="absolute inset-0 flex flex-col border border-gray-200 bg-white p-6 [backface-visibility:hidden]">
                {/* Icon — natural size, centered */}
                <div className="flex flex-1 items-center justify-center">
                  {card.icon && (
                    <img
                      src={urlFor(card.icon).width(460).url()}
                      alt=""
                      style={{ maxWidth: 230, width: '100%', height: 'auto', objectFit: 'contain' }}
                    />
                  )}
                </div>

                {/* Bottom row: title/category left, plus icon right */}
                <div className="flex items-end justify-between">
                  <div>
                    {card.category && (
                      <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">
                        {card.category}
                      </p>
                    )}
                    <h3 className="mt-0.5 text-lg font-bold text-brand-off-black">{card.title}</h3>
                  </div>
                  <i className="fa-solid fa-plus text-xl text-brand-blue" />
                </div>
              </div>

              {/* Back */}
              <div className="absolute inset-0 flex flex-col justify-center border border-brand-blue bg-brand-off-black p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <div style={{ maxWidth: 280, marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
                  <h3 className="text-base font-bold text-white">{card.title}</h3>
                  <ul className="mt-3 space-y-2">
                    {bullets.map(b => (
                      <li key={b} className="flex items-start gap-2 text-gray-300" style={{ fontSize: 16 }}>
                        <span className="relative mt-1 h-4 w-4 shrink-0">
                          <Image src="/icons/open-bullet.svg" alt="" fill className="object-contain" />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        )
      })}
    </div>
  )
}