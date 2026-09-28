'use client'

import { useEffect, useRef } from 'react'

// Draws slowly drifting gradient orbs on a dark canvas
// Brand colours: #FACC22, #FB5607, #4760FF, #0DCCFF

type Orb = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  color: string
  alpha: number
}

const ORB_COLORS = ['#FACC22', '#FB5607', '#4760FF', '#0DCCFF', '#FB5607', '#4760FF']

export default function ContactCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const orbsRef = useRef<Orb[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function resize() {
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Initialise orbs
    const count = 7
    orbsRef.current = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 200 + Math.random() * 220,
      color: ORB_COLORS[i % ORB_COLORS.length],
      alpha: 0.13 + Math.random() * 0.1,
    }))

    function draw() {
      if (!canvas || !ctx) return
      // Dark base
      ctx.fillStyle = '#110e0c'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw each orb as a radial gradient blob
      for (const orb of orbsRef.current) {
        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r)
        grad.addColorStop(0, orb.color + Math.round(orb.alpha * 255).toString(16).padStart(2, '0'))
        grad.addColorStop(1, orb.color + '00')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2)
        ctx.fill()

        // Drift
        orb.x += orb.vx
        orb.y += orb.vy

        // Bounce off edges
        if (orb.x < -orb.r) orb.x = canvas.width + orb.r
        if (orb.x > canvas.width + orb.r) orb.x = -orb.r
        if (orb.y < -orb.r) orb.y = canvas.height + orb.r
        if (orb.y > canvas.height + orb.r) orb.y = -orb.r
      }

      // Subtle grid overlay — thin lines at 80px intervals
      ctx.strokeStyle = 'rgba(255,255,255,0.025)'
      ctx.lineWidth = 1
      const step = 80
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ display: 'block' }}
    />
  )
}