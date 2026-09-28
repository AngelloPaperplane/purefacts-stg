'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useEffect, useCallback } from 'react'
import { urlFor } from '@/lib/sanity/client'
import type { SanityImage } from '@/lib/sanity/queries'

export type ClientLogo = {
  _id: string
  name: string
  logo: SanityImage
  caseStudyUrl?: string
}

type Props = {
  logos: ClientLogo[]
  label?: string
}

const MIN_COPIES = 6

export default function LogoCarousel({ logos, label = 'Trusted By The Industries Best' }: Props) {
  if (!logos?.length) return null

  const copies = Math.max(MIN_COPIES, Math.ceil(80 / logos.length) * 2)
  const items = Array.from({ length: copies }, () => logos).flat()

  const trackRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const offsetRef = useRef(0)
  const speedRef = useRef(0.6)
  const pausedRef = useRef(false)
  const dragRef = useRef({
    active: false,
    startX: 0,
    startOffset: 0,
    lastX: 0,
    velocity: 0,
    timestamp: 0,
  })
  // True if the pointer moved far enough to count as a drag (not a click)
  const wasDragRef = useRef(false)

  const setWidthRef = useRef(0)

  const measure = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    setWidthRef.current = track.scrollWidth / copies
  }, [copies])

  const clamp = useCallback((offset: number) => {
    const setW = setWidthRef.current
    if (!setW) return offset
    while (offset < -setW * 2) offset += setW
    while (offset > -setW) offset -= setW
    return offset
  }, [])

  const applyTransform = useCallback((offset: number) => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${offset}px)`
    }
  }, [])

  useEffect(() => {
    measure()
    offsetRef.current = -setWidthRef.current

    const tick = () => {
      if (!dragRef.current.active && !pausedRef.current) {
        offsetRef.current -= speedRef.current
      }
      offsetRef.current = clamp(offsetRef.current)
      applyTransform(offsetRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [measure, clamp, applyTransform])

  useEffect(() => {
    const observer = new ResizeObserver(measure)
    if (trackRef.current) observer.observe(trackRef.current)
    return () => observer.disconnect()
  }, [measure])

  // ── Drag handlers — passed down to each logo image zone only ──────────────

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const target = e.currentTarget as HTMLElement
    target.setPointerCapture(e.pointerId)
    wasDragRef.current = false
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startOffset: offsetRef.current,
      lastX: e.clientX,
      velocity: 0,
      timestamp: e.timeStamp,
    }
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active) return
    const dx = e.clientX - dragRef.current.lastX
    dragRef.current.velocity = dx / Math.max(1, e.timeStamp - dragRef.current.timestamp)
    dragRef.current.lastX = e.clientX
    dragRef.current.timestamp = e.timeStamp

    const totalDrag = e.clientX - dragRef.current.startX
    if (Math.abs(totalDrag) > 5) wasDragRef.current = true
    offsetRef.current = clamp(dragRef.current.startOffset + totalDrag)
  }, [clamp])

  const onPointerUp = useCallback(() => {
    if (!dragRef.current.active) return
    dragRef.current.active = false
    const v = dragRef.current.velocity
    const newSpeed = Math.max(0.3, Math.min(2.5, Math.abs(v) * 60))
    speedRef.current = v < 0 ? newSpeed : -newSpeed
    setTimeout(() => { speedRef.current = 0.6 }, 1000)
    // Reset drag flag after the click event has fired (click fires after pointerup)
    setTimeout(() => { wasDragRef.current = false }, 50)
  }, [])

  const onMouseEnter = useCallback(() => { pausedRef.current = true }, [])
  const onMouseLeave = useCallback(() => { pausedRef.current = false }, [])

  return (
    <section
      className="relative w-full overflow-hidden select-none"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Gradient border top */}
      <div className="h-px w-full bg-brand-gradient" />

      <div className="bg-white py-8">
        {/* Label */}
        <h2 className="mb-6 text-center text-sm font-bold uppercase tracking-widest text-brand-off-black">
          {label}
        </h2>

        {/* Viewport clip */}
        <div className="relative overflow-hidden">
          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />

          {/* Scrolling track */}
          <div
            ref={trackRef}
            className="flex gap-[22px] will-change-transform"
            style={{ transform: 'translateX(0px)' }}
          >
            {items.map((client, i) => (
              <LogoItem
                key={`${client._id}-${i}`}
                client={client}
                wasDragRef={wasDragRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Gradient border bottom */}
      <div className="h-px w-full bg-brand-gradient" />
    </section>
  )
}

// ── Logo item ────────────────────────────────────────────────────────────────

type LogoItemProps = {
  client: ClientLogo
  wasDragRef: React.RefObject<boolean>
  onPointerDown: (e: React.PointerEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: (e: React.PointerEvent) => void
}

function LogoItem({ client, wasDragRef, onPointerDown, onPointerMove, onPointerUp }: LogoItemProps) {
  return (
    <div className="shrink-0 flex flex-col items-center gap-2">
      {/*
        Drag zone: ONLY the logo image div has pointer handlers.
        setPointerCapture fires here so it never swallows events on sibling elements.
        The case study button below is a sibling — not a child — of this div,
        so it receives its own pointer events untouched.
      */}
      <div
        className="relative h-[65px] w-40 cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <Image
          src={urlFor(client.logo).width(320).height(130).url()}
          alt={client.name}
          fill
          className="object-contain"
          draggable={false}
        />
      </div>

      {/* Case study button — sibling of the drag zone, never inside it */}
      {client.caseStudyUrl && (
        <CaseStudyButton url={client.caseStudyUrl} wasDragRef={wasDragRef} />
      )}
    </div>
  )
}

// ── Case study button ────────────────────────────────────────────────────────

function CaseStudyButton({
  url,
  wasDragRef,
}: {
  url: string
  wasDragRef: React.RefObject<boolean>
}) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (wasDragRef.current) e.preventDefault()
    },
    [wasDragRef]
  )

  const className =
    'rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 whitespace-nowrap cursor-pointer'

  const isExternal = url.startsWith('http')

  return isExternal ? (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className} onClick={handleClick}>
      Case study →
    </a>
  ) : (
    <Link href={url} className={className} onClick={handleClick}>
      Case study →
    </Link>
  )
}