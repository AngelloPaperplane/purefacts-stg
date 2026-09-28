'use client'

import { useState } from 'react'
import Image from 'next/image'

export type FaqItem = {
  _key: string
  question: string
  answer: string
}

export default function TopicFaqs({ faqs }: { faqs: FaqItem[] }) {
  const [openKey, setOpenKey] = useState<string | null>(null)

  if (faqs.length === 0) return null

  return (
    <div className="mt-12">
      <h2
        id="faqs"
        className="mb-6 text-2xl font-bold text-brand-off-black scroll-mt-28"
      >
        FAQs
      </h2>
      <div className="divide-y divide-gray-200 border-t border-gray-200">
        {faqs.map(faq => {
          const isOpen = openKey === faq._key
          return (
            <div key={faq._key}>
              <button
                onClick={() => setOpenKey(isOpen ? null : faq._key)}
                className="flex w-full items-center justify-between py-4 text-left"
              >
                <span className={`text-sm font-semibold transition-colors ${isOpen ? 'text-brand-blue' : 'text-brand-off-black'}`}>
                  {faq.question}
                </span>
                <span className="relative ml-4 h-4 w-4 shrink-0 flex-none">
                  <Image
                    src={isOpen ? '/icons/open-bullet.svg' : '/icons/closed-bullet.svg'}
                    alt=""
                    fill
                    className="object-contain"
                  />
                </span>
              </button>
              {isOpen && (
                <p className="pb-4 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}