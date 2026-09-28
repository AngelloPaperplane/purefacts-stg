'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  src: string
  alt?: string
}

export default function CtaSlideImage({ src, alt = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`absolute bottom-0 left-0 z-10 h-full w-[45%] transition-all duration-[800ms] ease-out
        ${visible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
    >
      <img
        src={src}
        alt={alt}
        className="absolute bottom-0 left-0 h-full w-full object-contain object-left-bottom"
      />
    </div>
  )
}