'use client'

import { useEffect, useRef, useState } from 'react'

interface StatCounterProps {
  // The display value e.g. '$15T', '>$3B', '200M+'
  // We split into: prefix (non-numeric lead), number, suffix (trailing non-numeric)
  prefix?: string
  value: number
  suffix?: string
  decimals?: number
  color: string
  duration?: number // ms
}

export default function StatCounter({
  prefix = '',
  value,
  suffix = '',
  decimals = 0,
  color,
  duration = 1800,
}: StatCounterProps) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLElement>(null)
  const hasRun = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true
          observer.disconnect()

          const start = performance.now()
          const tick = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplay(eased * value)
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value, duration])

  const formatted = display.toFixed(decimals)

  return (
    <span
      ref={ref}
      className="text-6xl font-black lg:text-7xl tabular-nums"
      style={{ color }}
    >
      {prefix}{formatted}{suffix}
    </span>
  )
}