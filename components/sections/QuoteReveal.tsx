'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface QuoteRevealProps {
  children: ReactNode
  className?: string
  delay?: number  // ms stagger delay
}

export default function QuoteReveal({ children, className = '', delay = 0 }: QuoteRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Start hidden
    el.style.opacity = '0'
    el.style.transform = 'translateY(28px)'
    el.style.transition = `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}