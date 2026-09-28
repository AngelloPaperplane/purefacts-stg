'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'

interface StaggerCardsProps {
  children: ReactNode[]
  className?: string
  staggerMs?: number   // delay between each card, default 120
}

export default function StaggerCards({
  children,
  className = '',
  staggerMs = 120,
}: StaggerCardsProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`flex flex-col gap-6 ${className}`}>
      {children.map((child, i) => (
        <div
          key={i}
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateX(0)' : 'translateX(-32px)',
            transition: `opacity 0.55s ease ${i * staggerMs}ms, transform 0.55s ease ${i * staggerMs}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}