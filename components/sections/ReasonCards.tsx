import Link from 'next/link'
import { urlFor } from '@/lib/sanity/client'
import type { ReasonCard } from '@/lib/sanity/queries'

type Props = {
  headline?: string
  subheadline?: string
  cards: ReasonCard[]
}

export default function ReasonCards({ headline, subheadline, cards }: Props) {
  if (!cards?.length) return null

  return (
    <section className="bg-white py-8">
      <div className="mx-auto max-w-7xl px-6">
        {(headline || subheadline) && (
          <div className="mb-10">
            {headline && (
              <h2 className="text-3xl font-bold text-brand-off-black lg:text-4xl">
                {headline}
              </h2>
            )}
            {subheadline && (
              <p className="mt-2 text-base text-gray-500">{subheadline}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {cards.map(card => (
            // Gradient border via padding trick on a gradient wrapper
            <div
              key={card._key}
              className="rounded-sm p-[2px]"
              style={{
                background: 'linear-gradient(135deg, #FACC22, #FB5607, #4760FF, #0DCCFF)',
              }}
            >
              <div className="flex h-full flex-col bg-white p-8">
                {/* Top row: text left, image bottom-right */}
                <div className="flex flex-1 items-end gap-6">
                  {/* Text + CTA stacked on the left */}
                  <div className="flex flex-1 flex-col">
                    <h3 className="text-xl font-bold text-brand-off-black">{card.title}</h3>
                    <p className="mt-3 text-base text-gray-600 leading-relaxed">
                      {card.description}
                    </p>
                    {card.linkUrl && (
                      <div className="mt-6">
                        <Link href={card.linkUrl} className="btn-secondary inline-flex">
                          {card.linkLabel ?? 'Learn more'}
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Icon — unconstrained, sits bottom-right, no cropping */}
                  {card.icon && (
                    <div className="shrink-0 self-end">
                      <img
                        src={urlFor(card.icon).width(320).url()}
                        alt=""
                        className="block max-h-44 w-auto max-w-[180px]"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}