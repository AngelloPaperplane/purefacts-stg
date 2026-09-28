'use client'

import { useState, useEffect } from 'react'

export type TocItem = {
  id: string
  text: string
  level: number
}

export default function TopicToC({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const headings = items
      .map(item => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[]

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    )

    headings.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <div className="sticky top-28">
      <div className="border border-gray-200 bg-white p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
          Table of Contents
        </p>
        <nav>
          <ul className="space-y-1">
            {items.map(item => {
              const isActive = activeId === item.id
              return (
                <li key={item.id} style={{ paddingLeft: item.level === 3 ? '0.75rem' : 0 }}>
                  <a
                    href={`#${item.id}`}
                    onClick={e => {
                      e.preventDefault()
                      document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      setActiveId(item.id)
                    }}
                    className={`block py-1 text-sm leading-snug transition-colors ${
                      isActive
                        ? 'font-semibold text-brand-blue'
                        : 'text-gray-500 hover:text-brand-off-black'
                    }`}
                  >
                    {item.level === 3 && <span className="mr-1 text-gray-300">›</span>}
                    {item.text}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}