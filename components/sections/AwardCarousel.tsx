'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

type CarouselImage = {
  url: string
  alt: string
}

export default function AwardCarousel({ images }: { images: CarouselImage[] }) {
  const [current, setCurrent] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Drag state
  const dragStartX = useRef<number | null>(null)
  const isDragging = useRef(false)

  function resetInterval() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (images.length <= 1) return
    intervalRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length)
    }, 3500)
  }

  useEffect(() => {
    resetInterval()
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [images.length])

  function goTo(index: number) {
    setCurrent((index + images.length) % images.length)
    resetInterval()
  }

  // Mouse drag
  function onMouseDown(e: React.MouseEvent) {
    dragStartX.current = e.clientX
    isDragging.current = false
  }

  function onMouseMove(e: React.MouseEvent) {
    if (dragStartX.current === null) return
    if (Math.abs(e.clientX - dragStartX.current) > 5) isDragging.current = true
  }

  function onMouseUp(e: React.MouseEvent) {
    if (dragStartX.current === null) return
    const delta = e.clientX - dragStartX.current
    dragStartX.current = null
    if (!isDragging.current) return
    isDragging.current = false
    if (delta < -40) goTo(current + 1)
    else if (delta > 40) goTo(current - 1)
  }

  // Touch drag
  function onTouchStart(e: React.TouchEvent) {
    dragStartX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (dragStartX.current === null) return
    const delta = e.changedTouches[0].clientX - dragStartX.current
    dragStartX.current = null
    if (delta < -40) goTo(current + 1)
    else if (delta > 40) goTo(current - 1)
  }

  if (!images.length) {
    return (
      <div className="flex h-60 w-60 mx-auto flex-col items-center justify-center border-4 text-center" style={{ borderColor: '#0DCCFF' }}>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">2025</p>
        <p className="text-3xl font-black" style={{ background: 'linear-gradient(180deg, #FACC22, #FB5607)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AIFinTech</p>
        <p className="text-5xl font-black text-brand-off-black">100</p>
      </div>
    )
  }

  return (
    <div
      className="relative w-full select-none overflow-hidden cursor-grab active:cursor-grabbing"
      style={{ aspectRatio: '1/1', maxWidth: 320 }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={() => { dragStartX.current = null }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {images.map((img, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image src={img.url} alt={img.alt} fill className="object-contain" draggable={false} />
        </div>
      ))}
    </div>
  )
}