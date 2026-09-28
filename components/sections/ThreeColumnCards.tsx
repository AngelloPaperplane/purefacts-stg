import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity/client'

export type ThreeColumnCard = {
  _key: string
  image?: any
  title: string
  subtitle?: string
  description: string
  linkUrl?: string
  linkLabel?: string
}

type Props = {
  headline?: string
  subheadline?: string
  cards: ThreeColumnCard[]
  background?: 'white' | 'off-white'
  accentColors?: string[]
}

export default function ThreeColumnCards({
  headline,
  subheadline,
  cards,
  background = 'white',
  accentColors,
}: Props) {
  if (!cards?.length) return null

  const bg = background === 'off-white' ? 'bg-[#f4f4f4]' : 'bg-white'

  return (
    <section className={`${bg} py-14`}>
      <div className="mx-auto max-w-7xl px-6">
        {(headline || subheadline) && (
          <div className="mb-10 text-center">
            {headline && (
              <h2 className="text-3xl font-bold text-brand-off-black lg:text-4xl">
                {headline}
              </h2>
            )}
            {subheadline && (
              <p className="mx-auto mt-3 max-w-2xl text-base text-gray-500">
                {subheadline}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-6">
          {cards.map((card, i) => {
            const accentColor = accentColors ? accentColors[i % accentColors.length] : null
            return (
              <div
                key={card._key}
                className="w-full md:w-[calc(33.333%-1rem)]"
                style={accentColor ? {
                  borderTop: `3px solid ${accentColor}`,
                  borderLeft: '1px solid #e5e7eb',
                  borderRight: '1px solid #e5e7eb',
                  borderBottom: '1px solid #e5e7eb',
                } : {
                  background: 'linear-gradient(135deg, #FACC22, #FB5607, #4760FF, #0DCCFF)',
                  padding: '2px',
                }}
              >
                <div className="flex h-full flex-col bg-white">
                  {/* Image — natural height, no crop */}
                  {card.image && (
                    <div className="w-full px-4 pt-1">
                      <img
                        src={urlFor(card.image).width(600).url()}
                        alt={card.title}
                        className="h-auto w-full"
                      />
                    </div>
                  )}

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg font-bold text-brand-off-black">
                      {card.title}
                    </h3>
                    {card.subtitle && (
                      <p
                        className="mt-1 text-sm font-semibold uppercase tracking-widest"
                        style={{ color: accentColor ?? '#3b84ff' }}
                      >
                        {card.subtitle}
                      </p>
                    )}
                    <p className="mt-3 flex-1 text-base text-gray-600 leading-relaxed">
                      {card.description}
                    </p>

                    {card.linkUrl && (
                      <div className="mt-5">
                        <Link
                          href={card.linkUrl}
                          className="btn-secondary inline-flex"
                        >
                          {card.linkLabel ?? 'Learn more'}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}