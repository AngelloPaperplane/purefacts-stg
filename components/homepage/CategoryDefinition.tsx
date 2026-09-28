"use client";
import { useState, useEffect, useRef, useCallback, type PointerEvent } from "react";
import { motion } from "framer-motion";

// Original order: Strategy, Alignment, Execution, Transparency, Intelligence, Governance
// New order:      Strategy, Alignment, Execution, Transparency, Governance, Intelligence
// (Governance and Intelligence swapped — Governance between Transparency and Intelligence,
//  Intelligence between Governance and Strategy)
const DOMAINS = [
  {
    id: "strategy",
    label: "Strategy",
    short: "How pricing models, fee structures, and commercial rules are designed with intent.",
  },
  {
    id: "alignment",
    label: "Alignment",
    short: "How incentives, advisor behavior, and firm strategy are connected.",
  },
  {
    id: "execution",
    label: "Execution",
    short: "How pricing and rules become accurate billing and revenue workflows.",
  },
  {
    id: "transparency",
    label: "Transparency",
    short: "How fees, value, and revenue outcomes are explained with confidence.",
  },
  {
    id: "governance",
    label: "Governance",
    short: "How exceptions, approvals, contracts, and policy adherence are controlled.",
  },
  {
    id: "intelligence",
    label: "Intelligence",
    short: "How leakage is detected, opportunities surfaced, and drivers understood.",
  },
];

const NUM = DOMAINS.length;
const SLICE = 360 / NUM;

const CX = 260;
const CY = 260;
const OUTER_R_BASE = 175;
const OUTER_R_ACTIVE = 298;
const OUTER_R_ACTIVE_MOBILE = 220;
const INNER_R = 62;
const GAP_DEG = 2.2;
const INTERVAL_MS = 2800;
const VB = 520;
const MOBILE_VB_PAD = 36;

function useBreakpoint() {
  const [w, setW] = useState(() => (typeof window === "undefined" ? 1280 : window.innerWidth));
  useEffect(() => {
    const update = () => setW(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return { isMobile: w < 640, isTablet: w < 1024, w };
}

function polarToXY(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function describeArc(startDeg: number, endDeg: number, innerR: number, outerR: number) {
  const s1 = polarToXY(startDeg, outerR);
  const s2 = polarToXY(endDeg, outerR);
  const s3 = polarToXY(endDeg, innerR);
  const s4 = polarToXY(startDeg, innerR);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${s1.x} ${s1.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${s2.x} ${s2.y}`,
    `L ${s3.x} ${s3.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${s4.x} ${s4.y}`,
    "Z",
  ].join(" ");
}

function wedgeCentroid(midAngleDeg: number, innerR: number, outerR: number) {
  const halfSliceRad = ((SLICE / 2) * Math.PI) / 180;
  const r = (2 / 3) * ((outerR ** 3 - innerR ** 3) / (outerR ** 2 - innerR ** 2)) *
    (Math.sin(halfSliceRad) / halfSliceRad);
  return polarToXY(midAngleDeg, r);
}

function MobileFrameworkCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const lastClientXRef = useRef(0);
  const SPEED = 0.45;
  const items = [...DOMAINS, ...DOMAINS, ...DOMAINS];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const getSetWidth = () => track.scrollWidth / 3;

    const normalize = () => {
      const setW = getSetWidth();
      if (!setW) return;
      if (xRef.current <= -setW) xRef.current += setW;
      if (xRef.current > 0) xRef.current -= setW;
    };

    const tick = () => {
      if (!pausedRef.current && !draggingRef.current) {
        xRef.current -= SPEED;
        normalize();
        track.style.transform = `translateX(${xRef.current}px)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    pausedRef.current = true;
    lastClientXRef.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!draggingRef.current || !track) return;

    const dx = e.clientX - lastClientXRef.current;
    lastClientXRef.current = e.clientX;
    xRef.current += dx;

    const setW = track.scrollWidth / 3;
    if (setW) {
      if (xRef.current <= -setW) xRef.current += setW;
      if (xRef.current > 0) xRef.current -= setW;
    }

    track.style.transform = `translateX(${xRef.current}px)`;
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    pausedRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
      style={{ overflow: "hidden" }}
    >
      <h3
        className="font-bold text-[#f4f4f4] leading-tight"
        style={{ fontSize: "1.35rem", margin: "0 0 18px" }}
      >
        Revenue performance framework
      </h3>

      <div
        className="relative overflow-hidden"
        style={{ touchAction: "pan-y", cursor: "grab" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { if (!draggingRef.current) pausedRef.current = false; }}
      >
        <div ref={trackRef} className="flex gap-3 will-change-transform">
          {items.map((domain, i) => (
            <div
              key={`${domain.id}-${i}`}
              className="shrink-0"
              style={{
                width: "min(78vw, 300px)",
                minHeight: 190,
                padding: "22px 20px",
                borderRadius: 16,
                border: "1px solid rgba(59,132,255,0.28)",
                background: "linear-gradient(145deg, rgba(59,132,255,0.18), rgba(26,20,16,0.92))",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: "1px solid rgba(59,132,255,0.45)",
                    color: "#3b84ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 18,
                  }}
                >
                  {String((i % NUM) + 1).padStart(2, "0")}
                </div>
                <div
                  style={{
                    color: "#f4f4f4",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    lineHeight: 1.15,
                    marginBottom: 10,
                  }}
                >
                  {domain.label}
                </div>
                <div
                  style={{
                    color: "rgba(244,244,244,0.72)",
                    fontSize: "0.98rem",
                    lineHeight: 1.45,
                  }}
                >
                  {domain.short}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-10 z-10"
          style={{ background: "linear-gradient(to right, #140f0c, transparent)" }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-10 z-10"
          style={{ background: "linear-gradient(to left, #140f0c, transparent)" }}
        />
      </div>
    </motion.div>
  );
}

export default function CategoryDefinition() {
  const { isMobile, isTablet } = useBreakpoint();
  const showMobileCarousel = isMobile;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const circumference = 2 * Math.PI * (INNER_R - 1);
  const activeOuterR = isMobile ? OUTER_R_ACTIVE_MOBILE : OUTER_R_ACTIVE;
  const viewBox = isMobile
    ? `${-MOBILE_VB_PAD} ${-MOBILE_VB_PAD} ${VB + MOBILE_VB_PAD * 2} ${VB + MOBILE_VB_PAD * 2}`
    : `0 0 ${VB} ${VB}`;

  const startRotation = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIndex((i) => (i === null ? 0 : (i + 1) % NUM));
    }, INTERVAL_MS);
  }, []);

  const stopRotation = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (!hovered) startRotation();
    else stopRotation();
    return () => stopRotation();
  }, [hovered, startRotation, stopRotation]);

  function handleWedgeClick(i: number) {
    if (activeIndex === i) {
      setActiveIndex(null);
      startRotation();
    } else {
      setActiveIndex(i);
      stopRotation();
    }
  }

  function handleMouseLeave() {
    setHovered(false);
    startRotation();
  }

  return (
    <section className="bg-[#140f0c] overflow-hidden" style={{ padding: isMobile ? "64px 0" : "80px 0" }}>
      <div className="max-w-7xl mx-auto" style={{ padding: isMobile ? "0 20px" : isTablet ? "0 32px" : "0 48px" }}>
        <div className="grid items-center" style={{ gridTemplateColumns: isTablet ? "1fr" : "1fr 1fr", gap: isMobile ? "32px" : isTablet ? "40px" : "80px" }}>

          {/* Left */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-bold text-[#f4f4f4] leading-tight mb-6"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Manage revenue as a connected performance discipline, not in silos.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-[#f4f4f4]/75 leading-relaxed"
              style={{ fontSize: isMobile ? "1rem" : "1.125rem" }}
            >
              Revenue Performance Management is the discipline of designing, capturing, distributing, measuring, and optimizing revenue across the full revenue lifecycle. For wealth and asset 
              management firms, it connects commercial strategy to the operational 
              systems and technology decisions that support it.
            </motion.p>
          </div>

          {/* Right: desktop wheel, mobile framework carousel */}
          {showMobileCarousel ? (
            <MobileFrameworkCarousel />
          ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full mx-auto"
            style={{ maxWidth: isMobile ? "min(360px, 100%)" : "520px", overflow: "visible" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={handleMouseLeave}
          >
            <svg
              viewBox={viewBox}
              className="w-full"
              style={{ display: "block", maxWidth: isMobile ? "min(360px, 100%)" : "520px", overflow: "visible" }}
              aria-label="Revenue Performance Framework: six interconnected domains"
              role="img"
            >
              <defs>
                <linearGradient id="rpf-sunset" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FACC22" />
                  <stop offset="33%" stopColor="#FB5607" />
                  <stop offset="66%" stopColor="#4760FF" />
                  <stop offset="100%" stopColor="#0DCCFF" />
                </linearGradient>
              </defs>

              {/* Base donut */}
              <circle cx={CX} cy={CY} r={OUTER_R_BASE} fill="#1a1410" />

              {/* Spoke separators */}
              {Array.from({ length: NUM }).map((_, i) => {
                const angle = i * SLICE - SLICE / 2;
                const p1 = polarToXY(angle, INNER_R);
                const p2 = polarToXY(angle, OUTER_R_BASE + 6);
                return (
                  <line key={`sep-${i}`}
                    x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                    stroke="#140f0c" strokeWidth="4"
                  />
                );
              })}

              {DOMAINS.map((d, i) => {
                const baseMid = i * SLICE;
                const wStart = baseMid - SLICE / 2 + GAP_DEG;
                const wEnd = baseMid + SLICE / 2 - GAP_DEG;
                const isActive = activeIndex === i;
                const outerR = isActive ? activeOuterR : OUTER_R_BASE;

                const centroid = wedgeCentroid(baseMid, INNER_R, outerR);

                const foW = isActive ? 145 : 90;
                const foH = isActive ? 120 : 30;

                return (
                  <g
                    key={d.id}
                    className="cursor-pointer focus:outline-none"
                    onClick={() => handleWedgeClick(i)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleWedgeClick(i)}
                    tabIndex={0}
                    role="button"
                    aria-pressed={isActive}
                    aria-label={`${d.label}: ${d.short}`}
                  >
                    <motion.path
                      d={describeArc(wStart, wEnd, INNER_R, outerR)}
                      fill={isActive ? "#3b84ff" : "rgba(180,180,180,0.18)"}
                      animate={{ d: describeArc(wStart, wEnd, INNER_R, outerR) }}
                      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                    />

                    {isActive && (
                      <>
                        <line
                          x1={polarToXY(wStart - GAP_DEG, INNER_R).x}
                          y1={polarToXY(wStart - GAP_DEG, INNER_R).y}
                          x2={polarToXY(wStart - GAP_DEG, activeOuterR + 6).x}
                          y2={polarToXY(wStart - GAP_DEG, activeOuterR + 6).y}
                          stroke="#140f0c" strokeWidth="4"
                        />
                        <line
                          x1={polarToXY(wEnd + GAP_DEG, INNER_R).x}
                          y1={polarToXY(wEnd + GAP_DEG, INNER_R).y}
                          x2={polarToXY(wEnd + GAP_DEG, activeOuterR + 6).x}
                          y2={polarToXY(wEnd + GAP_DEG, activeOuterR + 6).y}
                          stroke="#140f0c" strokeWidth="4"
                        />
                      </>
                    )}

                    <foreignObject
                      x={centroid.x - foW / 2}
                      y={centroid.y - foH / 2}
                      width={foW}
                      height={foH}
                      style={{ pointerEvents: "none", overflow: "visible" }}
                    >
                      <div
                        style={{
                          width: `${foW}px`,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "6px",
                          fontFamily: "Carlito, sans-serif",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            fontSize: isActive ? "20px" : "13px",
                            fontWeight: 700,
                            color: isActive ? "white" : "rgba(244,244,244,0.85)",
                            lineHeight: 1.2,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {d.label}
                        </div>

                        {isActive && (
                          <div
                            style={{
                              fontSize: "15px",
                              fontWeight: 400,
                              color: "rgba(255,255,255,0.85)",
                              lineHeight: 1.45,
                            }}
                          >
                            {d.short}
                          </div>
                        )}
                      </div>
                    </foreignObject>
                  </g>
                );
              })}

              {/* Hub */}
              <circle cx={CX} cy={CY} r={INNER_R + 4} fill="#140f0c" />
              <circle cx={CX} cy={CY} r={INNER_R} fill="#140f0c" />
              <circle cx={CX} cy={CY} r={INNER_R}
                fill="none" stroke="#3b84ff" strokeWidth="1" strokeOpacity="0.35"
              />

              {/* Progress sweep */}
              {!hovered && (
                <motion.circle
                  key={`prog-${activeIndex}`}
                  cx={CX} cy={CY}
                  r={INNER_R - 1}
                  fill="none"
                  stroke="url(#rpf-sunset)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference}
                  style={{ transformOrigin: `${CX}px ${CY}px`, transform: "rotate(-90deg)" }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: INTERVAL_MS / 1000, ease: "linear" }}
                />
              )}

              {/* Hub text */}
              <text x={CX} y={CY - 16} textAnchor="middle"
                fill="#3b84ff" fontSize="11" fontWeight="700"
                fontFamily="Carlito, sans-serif" letterSpacing="0.13em"
                style={{ pointerEvents: "none" }}>
                REVENUE
              </text>
              <text x={CX} y={CY - 1} textAnchor="middle"
                fill="#3b84ff" fontSize="11" fontWeight="700"
                fontFamily="Carlito, sans-serif" letterSpacing="0.08em"
                style={{ pointerEvents: "none" }}>
                PERFORMANCE
              </text>
              <text x={CX} y={CY + 15} textAnchor="middle"
                fill="#3b84ff" fontSize="11" fontWeight="700"
                fontFamily="Carlito, sans-serif" letterSpacing="0.08em"
                style={{ pointerEvents: "none" }}>
                FRAMEWORK
              </text>
            </svg>
          </motion.div>
          )}

        </div>
      </div>
    </section>
  );
}