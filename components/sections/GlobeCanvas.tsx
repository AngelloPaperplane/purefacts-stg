'use client'

import { useEffect, useRef } from 'react'
import createGlobe, { type COBEOptions } from 'cobe'
import { useMotionValue, useSpring } from 'motion/react'

const MOVEMENT_DAMPING = 1400

const DOT = 0.06 // uniform size for all markers

// ── Offices ───────────────────────────────────────────────────────────────────
const OFFICE_MARKERS = [
  { location: [43.65, -79.38] as [number, number], size: DOT }, // Toronto
  { location: [40.71, -74.01] as [number, number], size: DOT }, // New York
  { location: [38.72,  -9.14] as [number, number], size: DOT }, // Lisbon
  { location: [47.38,   8.54] as [number, number], size: DOT }, // Zurich
]

// ── Customer cities (deduped; office locations Toronto/New York/Zürich omitted) ─
const CUST = DOT
const CUSTOMER_MARKERS = [
  // United States
  { location: [30.27,  -97.74] as [number, number], size: CUST }, // Austin, TX
  { location: [41.88,  -87.63] as [number, number], size: CUST }, // Chicago, IL
  { location: [47.49, -111.30] as [number, number], size: CUST }, // Great Falls, MT
  { location: [35.15,  -90.05] as [number, number], size: CUST }, // Memphis, TN
  { location: [34.74,  -92.29] as [number, number], size: CUST }, // Little Rock, AR
  { location: [34.40, -119.52] as [number, number], size: CUST }, // Carpinteria, CA
  { location: [39.96,  -82.99] as [number, number], size: CUST }, // Columbus, OH
  { location: [42.36,  -71.06] as [number, number], size: CUST }, // Boston, MA
  { location: [39.05,  -95.68] as [number, number], size: CUST }, // Topeka, KS
  { location: [40.86,  -74.43] as [number, number], size: CUST }, // Parsippany, NJ
  { location: [38.88,  -77.10] as [number, number], size: CUST }, // Arlington, VA
  { location: [25.76,  -80.19] as [number, number], size: CUST }, // Miami, FL
  { location: [42.65,  -73.76] as [number, number], size: CUST }, // Albany, NY
  { location: [28.60,  -81.35] as [number, number], size: CUST }, // Winter Park, FL
  { location: [26.36,  -80.08] as [number, number], size: CUST }, // Boca Raton, FL
  { location: [45.01,  -93.46] as [number, number], size: CUST }, // Plymouth, MN
  { location: [40.06,  -80.72] as [number, number], size: CUST }, // Wheeling, WV
  { location: [29.42,  -98.49] as [number, number], size: CUST }, // San Antonio, TX
  { location: [42.50,  -71.07] as [number, number], size: CUST }, // Wakefield, MA
  { location: [33.52,  -86.81] as [number, number], size: CUST }, // Birmingham, AL
  { location: [33.75,  -84.39] as [number, number], size: CUST }, // Atlanta, GA
  { location: [41.14,  -73.36] as [number, number], size: CUST }, // Westport, CT
  { location: [44.51,  -88.02] as [number, number], size: CUST }, // Green Bay, WI
  { location: [35.78,  -78.64] as [number, number], size: CUST }, // Raleigh, NC
  { location: [38.98,  -94.67] as [number, number], size: CUST }, // Overland Park, KS
  { location: [42.47,  -83.22] as [number, number], size: CUST }, // Southfield, MI
  { location: [40.77,  -73.50] as [number, number], size: CUST }, // Syosset, NY
  { location: [41.14,  -73.26] as [number, number], size: CUST }, // Fairfield, CT
  { location: [42.17,  -87.84] as [number, number], size: CUST }, // Deerfield, IL
  { location: [28.54,  -81.38] as [number, number], size: CUST }, // Orlando, FL
  { location: [39.10,  -84.51] as [number, number], size: CUST }, // Cincinnati, OH
  { location: [41.26,  -95.93] as [number, number], size: CUST }, // Omaha, NE
  { location: [44.99,  -93.35] as [number, number], size: CUST }, // Golden Valley, MN
  { location: [18.47,  -66.11] as [number, number], size: CUST }, // San Juan, PR
  { location: [38.64,  -90.32] as [number, number], size: CUST }, // Clayton, MO
  { location: [40.67,  -74.65] as [number, number], size: CUST }, // Bedminster, NJ
  { location: [37.54,  -77.44] as [number, number], size: CUST }, // Richmond, VA
  { location: [39.10,  -94.58] as [number, number], size: CUST }, // Kansas City, MO
  { location: [42.03,  -88.08] as [number, number], size: CUST }, // Schaumburg, IL
  { location: [41.59,  -93.62] as [number, number], size: CUST }, // Des Moines, IA
  { location: [33.77,  -84.30] as [number, number], size: CUST }, // Decatur, GA

  // United Kingdom
  { location: [53.48,   -2.24] as [number, number], size: CUST }, // Manchester
  { location: [51.51,   -0.13] as [number, number], size: CUST }, // London

  // Switzerland
  { location: [46.20,    6.14] as [number, number], size: CUST }, // Genève

  // Singapore
  { location: [ 1.35,  103.82] as [number, number], size: CUST }, // Singapore

  // Netherlands
  { location: [51.92,    4.48] as [number, number], size: CUST }, // Rotterdam

  // Luxembourg (note: "Tonbridge" placed in the UK — verify label)
  { location: [51.19,    0.27] as [number, number], size: CUST }, // Tonbridge, UK (?)
  { location: [49.61,    6.13] as [number, number], size: CUST }, // Luxembourg City
  { location: [49.62,    6.07] as [number, number], size: CUST }, // Strassen

  // Liechtenstein
  { location: [47.14,    9.52] as [number, number], size: CUST }, // Vaduz

  // Germany (note: "Prague" placed in Czechia — verify label)
  { location: [50.08,   14.44] as [number, number], size: CUST }, // Prague, CZ (?)
  { location: [48.17,   11.72] as [number, number], size: CUST }, // Aschheim
  { location: [51.23,    6.78] as [number, number], size: CUST }, // Düsseldorf

  // France
  { location: [48.88,    2.24] as [number, number], size: CUST }, // Puteaux

  // Denmark
  { location: [55.68,   12.57] as [number, number], size: CUST }, // Copenhagen

  // Canada
  { location: [42.31,  -83.04] as [number, number], size: CUST }, // Windsor, ON
  { location: [50.45, -104.62] as [number, number], size: CUST }, // Regina, SK
  { location: [49.28, -123.12] as [number, number], size: CUST }, // Vancouver, BC
  { location: [51.05, -114.07] as [number, number], size: CUST }, // Calgary, AB
  { location: [49.90,  -97.14] as [number, number], size: CUST }, // Winnipeg, MB

  // Belgium
  { location: [50.85,    4.35] as [number, number], size: CUST }, // Brussels
]

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0.5,        // start facing Atlantic so all four offices are visible
  theta: 0.3,
  dark: 1,
  diffuse: 1.8,
  mapSamples: 16000,
  mapBrightness: 6,
  baseColor: [0.05, 0.10, 0.30],
  markerColor: [1.0, 0.70, 0.05], // honey/yellow (original)
  glowColor: [0.15, 0.35, 0.85],
  markers: [...OFFICE_MARKERS, ...CUSTOMER_MARKERS],
}

export default function GlobeCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phiRef    = useRef(0.5)
  const widthRef  = useRef(0)
  const pointerInteracting          = useRef<number | null>(null)
  const pointerInteractionMovement  = useRef(0)

  const r  = useMotionValue(0)
  const rs = useSpring(r, { mass: 1, damping: 30, stiffness: 100 })

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? 'grabbing' : 'grab'
    }
  }

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      r.set(r.get() + delta / MOVEMENT_DAMPING)
    }
  }

  useEffect(() => {
    const onResize = () => {
      if (canvasRef.current) {
        widthRef.current = canvasRef.current.offsetWidth
      }
    }
    window.addEventListener('resize', onResize)
    onResize()

    const globe = createGlobe(canvasRef.current!, {
      ...GLOBE_CONFIG,
      width:  widthRef.current * 2,
      height: widthRef.current * 2,
      onRender: (state) => {
        if (!pointerInteracting.current) phiRef.current -= 0.01
        state.phi    = phiRef.current + rs.get()
        state.width  = widthRef.current * 2
        state.height = widthRef.current * 2
      },
    })

    setTimeout(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = '1'
    }, 0)

    return () => {
      globe.destroy()
      window.removeEventListener('resize', onResize)
    }
  }, [rs])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 700,
          aspectRatio: '1 / 1',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            opacity: 0,
            transition: 'opacity 0.5s ease',
            contain: 'layout paint size',
          }}
          onPointerDown={(e) => {
            pointerInteracting.current = e.clientX
            updatePointerInteraction(e.clientX)
          }}
          onPointerUp={() => updatePointerInteraction(null)}
          onPointerOut={() => updatePointerInteraction(null)}
          onMouseMove={(e) => updateMovement(e.clientX)}
          onTouchMove={(e) => e.touches[0] && updateMovement(e.touches[0].clientX)}
        />
      </div>
    </div>
  )
}