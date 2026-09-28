'use client'

import { useState } from 'react'
import Image from 'next/image'

type Item = {
  label: string
  detail: string
}

export default function AccordionList({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.label ?? null)

  return (
    <div className="divide-y divide-gray-200 border-t border-gray-200">
      {items.map(item => {
        const isOpen = open === item.label
        return (
          <div key={item.label}>
            <button
              onClick={() => setOpen(isOpen ? null : item.label)}
              className="flex w-full items-center justify-between py-4 text-left"
            >
              <span className={`text-sm font-semibold transition-colors ${isOpen ? 'text-brand-blue' : 'text-brand-off-black'}`}>
                {item.label}
              </span>
              <span className="relative ml-4 h-4 w-4 shrink-0">
                <Image
                  src={isOpen ? '/icons/open-bullet.svg' : '/icons/closed-bullet.svg'}
                  alt=""
                  fill
                  className="object-contain"
                />
              </span>
            </button>
            {isOpen && (
              <p className="pb-4 text-sm leading-relaxed text-gray-600">{item.detail}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}