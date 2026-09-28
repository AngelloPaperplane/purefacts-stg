'use client'

import { useEffect, useRef } from 'react'

const SYMBOLS = [
  'AUM','FEE','REV','MGT','NET','YLD','RET','PNL',
  'NAV','IRR','TER','BPS','MER','EPS','ROE','CAR',
  'LTV','DCF','IRQ','WAL',
]

const ITEM_COUNT = 55  // more items across the full canvas
const FONT_SIZE  = 11
const ITEM_H     = 36  // vertical space each item occupies

interface TickerItem {
  x: number
  y: number
  speed: number
  sym: string
  val: string
  chg: string
  up: boolean
}

function randomItem(w: number, h: number, spreadY = true): TickerItem {
  return {
    x:     Math.random() * (w - 80) + 40,
    y:     spreadY ? Math.random() * (h + 200) - 200 : -(Math.random() * 200 + 40),
    speed: 0.18 + Math.random() * 0.28,
    sym:   SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    val:   (Math.random() * 200 + 10).toFixed(2),
    chg:   (Math.random() * 6 - 3).toFixed(2),
    up:    Math.random() > 0.5,
  }
}

export default function HeroTicker() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let items: TickerItem[] = []
    let raf: number

    function resize() {
      const parent = canvas!.parentElement!
      canvas!.width  = parent.offsetWidth
      canvas!.height = parent.offsetHeight
      // Rebuild with items spread across current canvas
      items = Array.from({ length: ITEM_COUNT }, () =>
        randomItem(canvas!.width, canvas!.height, true)
      )
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement!)

    function draw() {
      const w = canvas!.width
      const h = canvas!.height
      ctx!.clearRect(0, 0, w, h)

      items.forEach(item => {
        item.y += item.speed

        // Reset when off bottom
        if (item.y > h + 60) {
          const fresh = randomItem(w, h, false)
          Object.assign(item, fresh)
        }

        // Fade at top and bottom edges
        const alpha = Math.max(0, Math.min(1, item.y / 80, (h - item.y) / 80))
        if (alpha <= 0) return

        ctx!.font = `600 ${FONT_SIZE}px monospace`
        ctx!.fillStyle = `rgba(200,215,230,${alpha * 0.9})`
        ctx!.fillText(item.sym, item.x, item.y)

        ctx!.font = `${FONT_SIZE}px monospace`
        ctx!.fillStyle = `rgba(180,200,220,${alpha * 0.75})`
        ctx!.fillText(item.val, item.x, item.y + 14)

        ctx!.font = `10px monospace`
        ctx!.fillStyle = item.up
          ? `rgba(13,204,255,${alpha * 0.85})`
          : `rgba(251,86,7,${alpha * 0.85})`
        ctx!.fillText(
          (item.up ? '▲ +' : '▼ ') + item.chg + '%',
          item.x,
          item.y + 26,
        )
      })

      raf = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity: 0.55 }}
    />
  )
}