'use client'

import { useEffect, useRef } from 'react'

const VALUES = [
  { letter: 'P', word: 'Purposeful', desc: 'We act with intention, aligned to goals that matter.' },
  { letter: 'U', word: 'United',     desc: 'We collaborate across functions and borders to win together.' },
  { letter: 'R', word: 'Respectful', desc: 'We value people, time, and perspectives — even when they differ.' },
  { letter: 'E', word: 'Empathetic', desc: 'We listen to understand, not just respond.' },
  { letter: 'F', word: 'Future-Focused', desc: 'We build with tomorrow in mind.' },
  { letter: 'A', word: 'Accountable', desc: 'We own our results, always.' },
  { letter: 'C', word: 'Curious',    desc: 'We never stop exploring better ways.' },
  { letter: 'T', word: 'Trusted',    desc: 'We do what we say and say what we mean.' },
  { letter: 'S', word: 'Smart',      desc: 'We make decisions with insight, focus, and strategic intent.' },
]

// The 4-stop brand gradient colours
const GRADIENT_STOPS = [
  { pos: 0,    color: '#FACC22' },
  { pos: 0.33, color: '#FB5607' },
  { pos: 0.66, color: '#4760FF' },
  { pos: 1,    color: '#0DCCFF' },
]

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

// Sample the 4-stop gradient at position t (0–1), with an animated offset
function sampleGradient(t: number, offset: number): string {
  // Shift t by offset and wrap around so the gradient flows
  const shifted = ((t + offset) % 1 + 1) % 1
  // Find which two stops we're between
  for (let i = 0; i < GRADIENT_STOPS.length - 1; i++) {
    const s0 = GRADIENT_STOPS[i]
    const s1 = GRADIENT_STOPS[i + 1]
    if (shifted >= s0.pos && shifted <= s1.pos) {
      const localT = (shifted - s0.pos) / (s1.pos - s0.pos)
      const [r0, g0, b0] = hexToRgb(s0.color)
      const [r1, g1, b1] = hexToRgb(s1.color)
      const r = Math.round(lerp(r0, r1, localT))
      const g = Math.round(lerp(g0, g1, localT))
      const b = Math.round(lerp(b0, b1, localT))
      return `rgb(${r},${g},${b})`
    }
  }
  return GRADIENT_STOPS[GRADIENT_STOPS.length - 1].color
}

export default function PurefactsAcrostic() {
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([])
  const animRef = useRef<number>(0)
  const offsetRef = useRef(0)

  useEffect(() => {
    const total = VALUES.length

    function animate() {
      offsetRef.current = ((offsetRef.current - 0.003) % 1 + 1) % 1

      letterRefs.current.forEach((el, i) => {
        if (!el) return
        const t = i / (total - 1)
        el.style.color = sampleGradient(t, offsetRef.current)
      })

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {VALUES.map((v, i) => (
        <div
          key={v.letter}
          className="flex items-center gap-5 py-5 group"
        >
          {/* Animated gradient letter */}
          <span
            ref={el => { letterRefs.current[i] = el }}
            className="shrink-0 text-5xl font-black leading-none select-none"
            style={{ minWidth: '2.5rem', fontVariantNumeric: 'tabular-nums' }}
            aria-hidden="true"
          >
            {v.letter}
          </span>

          {/* Word + description */}
          <div className="flex flex-col gap-0.5">
            <span className="text-lg font-bold text-brand-off-black leading-tight">
              {v.word}
            </span>
            <span className="text-sm text-gray-500 leading-relaxed">
              {v.desc}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}