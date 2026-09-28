'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'pf-announcement-bar-dismissed-carousel'

const announcements = [
  {
    label: 'Model your Enterprise Value',
    href: '/resources/enterprise-value-simulator',
  },
]

const hasMultiple = announcements.length > 1

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right'>('right')

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (!dismissed) setVisible(true)
  }, [])

  useEffect(() => {
    if (!hasMultiple || paused || !visible) return

    const interval = window.setInterval(() => {
      setDirection('right')
      setActiveIndex((current) => (current + 1) % announcements.length)
    }, 4000)

    return () => window.clearInterval(interval)
  }, [paused, visible])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  const previous = () => {
    setDirection('left')
    setActiveIndex((current) =>
      current === 0 ? announcements.length - 1 : current - 1
    )
  }

  const next = () => {
    setDirection('right')
    setActiveIndex((current) => (current + 1) % announcements.length)
  }

  if (!visible) return null

  const announcement = announcements[activeIndex]

  return (
    <>
      <style jsx>{`
        @keyframes slideLeft {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideRight {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-left {
          animation: slideLeft 300ms ease-out;
        }

        .animate-slide-right {
          animation: slideRight 300ms ease-out;
        }
      `}</style>

      <div
        className="relative z-50 overflow-hidden bg-brand-blue px-4 py-2"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative mx-auto flex max-w-[1240px] items-center justify-center px-12">
          {hasMultiple && (
            <button
              onClick={previous}
              aria-label="Previous announcement"
              className="absolute left-0 top-1/2 -translate-y-1/2 text-lg text-white/90 transition-all hover:scale-110 hover:text-white"
            >
              <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            </button>
          )}

          <div className="flex items-center justify-center overflow-hidden px-8">
            <Link
              key={`${activeIndex}-${direction}`}
              href={announcement.href}
              className={`text-center text-s font-semibold tracking-wide text-white transition-opacity hover:opacity-80 ${
                direction === 'right'
                  ? 'animate-slide-left'
                  : 'animate-slide-right'
              }`}
            >
              {announcement.label}
            </Link>
          </div>

          {hasMultiple && (
            <button
              onClick={next}
              aria-label="Next announcement"
              className="absolute right-0 top-1/2 -translate-y-1/2 text-lg text-white/90 transition-all hover:scale-110 hover:text-white"
            >
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          )}
        </div>

        <button
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 transition-colors hover:text-white sm:right-4"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </>
  )
}