"use client";

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type PointerEvent,
} from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#140f0c",
  surface: "#1a1410",
  azure: "#3b84ff",
  mandarin: "#fb5607",
  honey: "#FACC22",
  cyan: "#0DCCFF",
  indigo: "#4760FF",
  offwhite: "#f4f4f4",
  muted: "rgba(244,244,244,0.55)",
  border: "rgba(255,255,255,0.07)",
  borderMed: "rgba(255,255,255,0.12)",
};

// ─── Reveal helper ────────────────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, margin: "-80px 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function useBreakpoint() {
  const [w, setW] = useState(1280);
  useEffect(() => {
    const update = () => setW(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return { isMobile: w < 640, isTablet: w < 1024, w };
}

// ─── HERO: Infinity Flow ──────────────────────────────────────────────────────
function InfinityFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const ro = new ResizeObserver(() => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    });
    ro.observe(canvas);

    // Lemniscate (∞) parametric: scaled to fill canvas
    function lemniscate(
      t: number,
      cx: number,
      cy: number,
      a: number,
      b: number,
    ) {
      // Lemniscate of Bernoulli: x = a*cos(t)/(1+sin²(t)), y = b*sin(t)*cos(t)/(1+sin²(t))
      const denom = 1 + Math.sin(t) ** 2;
      return {
        x: cx + (a * Math.cos(t)) / denom,
        y: cy + (b * Math.sin(t) * Math.cos(t)) / denom,
      };
    }

    // Particles along the ∞ path
    const PARTICLE_COUNT = 55;
    type Particle = {
      t: number;
      speed: number;
      size: number;
      alpha: number;
      color: string;
    };
    const COLORS = [C.azure, C.azure, C.azure, C.cyan, C.mandarin, C.honey];
    const particles: Particle[] = Array.from(
      { length: PARTICLE_COUNT },
      (_, i) => ({
        t: (i / PARTICLE_COUNT) * Math.PI * 2,
        speed: 0.004 + Math.random() * 0.003,
        size: 2.5 + Math.random() * 3.5,
        alpha: 0.15 + Math.random() * 0.35,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }),
    );

    // Secondary floating dots
    type Dot = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
    };
    const DOTS: Dot[] = Array.from({ length: 30 }, () => ({
      x: Math.random() * 800,
      y: Math.random() * 600,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      r: 0.8 + Math.random() * 1.4,
      alpha: 0.06 + Math.random() * 0.12,
    }));

    let frame = 0;

    function draw() {
      if (!ctx) return;
      animRef.current = requestAnimationFrame(draw);
      frame++;
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const a = W * 0.38; // horizontal half-axis
      const b = H * 0.42; // vertical half-axis (taller loops)

      // Floating background dots
      for (const d of DOTS) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = W;
        if (d.x > W) d.x = 0;
        if (d.y < 0) d.y = H;
        if (d.y > H) d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59,132,255,${d.alpha})`;
        ctx.fill();
      }

      // Particles along the ∞
      for (const p of particles) {
        p.t += p.speed;
        const pos = lemniscate(p.t, cx, cy, a, b);

        // Fade out particles on the left half (behind copy), x < cx*0.9
        const leftFade = pos.x < cx * 0.85 ? 0.22 : 1;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color
          .replace(")", `,${p.alpha * leftFade})`)
          .replace("rgb", "rgba")
          .replace("rgba(rgba", "rgba");
        // Parse hex colors properly
        const hex = p.color;
        let r = 59,
          g = 132,
          b2 = 255;
        if (hex === C.mandarin) {
          r = 251;
          g = 86;
          b2 = 7;
        }
        if (hex === C.honey) {
          r = 250;
          g = 204;
          b2 = 34;
        }
        if (hex === C.cyan) {
          r = 13;
          g = 204;
          b2 = 255;
        }
        ctx.fillStyle = `rgba(${r},${g},${b2},${p.alpha * leftFade})`;
        ctx.fill();

        // Trailing glow
        const grad = ctx.createRadialGradient(
          pos.x,
          pos.y,
          0,
          pos.x,
          pos.y,
          p.size * 6,
        );
        grad.addColorStop(0, `rgba(${r},${g},${b2},${0.12 * leftFade})`);
        grad.addColorStop(1, `rgba(${r},${g},${b2},0)`);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, p.size * 6, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Left-side vignette to keep copy legible
      const vignette = ctx.createLinearGradient(0, 0, W * 0.55, 0);
      vignette.addColorStop(0, "rgba(20,15,12,0.92)");
      vignette.addColorStop(0.42, "rgba(20,15,12,0.55)");
      vignette.addColorStop(1, "rgba(20,15,12,0)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);
    }

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}

// ─── Generic vs PureRevenue table ─────────────────────────────────────────────
function VendorTable({ visible }: { visible: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: C.surface,
        border: `1px solid ${C.borderMed}`,
        borderRadius: 10,
        overflow: "hidden",
        fontFamily: "'Carlito','Segoe UI',sans-serif",
        width: "100%",
        maxWidth: 540,
      }}
    >
      {/* Table header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          borderBottom: `1px solid ${C.borderMed}`,
        }}
      >
        <div
          style={{
            padding: "14px 20px",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: C.muted,
          }}
        >
          Fee Complexity
        </div>
        <div
          style={{
            padding: "14px 16px",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: C.muted,
            borderLeft: `1px solid ${C.border}`,
            textAlign: "center",
          }}
        >
          Generic Vendor
        </div>
        <div
          style={{
            padding: "14px 16px",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: C.azure,
            borderLeft: `1px solid ${C.border}`,
            textAlign: "center",
          }}
        >
          PureRevenue
        </div>
      </div>

      {[
        {
          scenario: "Multi-tier fee schedules",
          generic: false,
          pure: true,
        },
        {
          scenario: "Household billing aggregation",
          generic: false,
          pure: true,
        },
        {
          scenario: "Exception-based pricing rules",
          generic: false,
          pure: true,
        },
        {
          scenario: "Audit-ready billing records",
          generic: false,
          pure: true,
        },
        {
          scenario: "Real-time revenue reconciliation",
          generic: false,
          pure: true,
        },
      ].map((row, i) => (
        <motion.div
          key={row.scenario}
          initial={{ opacity: 0, x: -8 }}
          animate={visible ? { opacity: 1, x: 0 } : {}}
          transition={{
            duration: 0.4,
            delay: 0.2 + i * 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            borderBottom: i < 4 ? `1px solid ${C.border}` : "none",
          }}
        >
          <div
            style={{
              padding: "14px 20px",
              fontSize: 13.5,
              color: C.offwhite,
              lineHeight: 1.4,
            }}
          >
            {row.scenario}
          </div>
          <div
            style={{
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderLeft: `1px solid ${C.border}`,
            }}
          >
            <span style={{ fontSize: 18, color: "rgba(244,244,244,0.25)" }}>
              ✕
            </span>
          </div>
          <div
            style={{
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderLeft: `1px solid ${C.border}`,
            }}
          >
            <span style={{ fontSize: 18, color: C.azure }}>✓</span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── Revenue Performance Wheel (lifted from CategoryDefinition) ───────────────
const DOMAINS = [
  {
    id: "strategy",
    label: "Strategy",
    short:
      "How pricing models, fee structures, and commercial rules are designed with intent.",
  },
  {
    id: "alignment",
    label: "Alignment",
    short: "How incentives, advisor behavior, and firm strategy are connected.",
  },
  {
    id: "execution",
    label: "Execution",
    short:
      "How pricing and rules become accurate billing and revenue workflows.",
  },
  {
    id: "transparency",
    label: "Transparency",
    short:
      "How fees, value, and revenue outcomes are explained with confidence.",
  },
  {
    id: "intelligence",
    label: "Intelligence",
    short:
      "How leakage is detected, opportunities surfaced, and drivers understood.",
  },
  {
    id: "governance",
    label: "Governance",
    short:
      "How exceptions, approvals, contracts, and policy adherence are controlled.",
  },
];
const NUM = DOMAINS.length;
const SLICE = 360 / NUM;
const CX = 260;
const CY = 260;
const OUTER_R_BASE = 175;
const OUTER_R_ACTIVE = 250;
const INNER_R = 62;
const GAP_DEG = 2.2;
const INTERVAL = 2800;
const VB = 520;

function polarXY(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function arcPath(
  startDeg: number,
  endDeg: number,
  innerR: number,
  outerR: number,
) {
  const s1 = polarXY(startDeg, outerR);
  const s2 = polarXY(endDeg, outerR);
  const s3 = polarXY(endDeg, innerR);
  const s4 = polarXY(startDeg, innerR);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${s1.x} ${s1.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${s2.x} ${s2.y}`,
    `L ${s3.x} ${s3.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${s4.x} ${s4.y}`,
    "Z",
  ].join(" ");
}

function centroid(midDeg: number, innerR: number, outerR: number) {
  const halfRad = ((SLICE / 2) * Math.PI) / 180;
  const r =
    (2 / 3) *
    ((outerR ** 3 - innerR ** 3) / (outerR ** 2 - innerR ** 2)) *
    (Math.sin(halfRad) / halfRad);
  return polarXY(midDeg, r);
}

function MobileFrameworkCarousel() {
  const { isMobile } = useBreakpoint();
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
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: "100%", maxWidth: isMobile ? "calc(100vw - 40px)" : "100%", overflow: "hidden", margin: "0 auto" }}
    >
      <h3
        style={{
          color: C.offwhite,
          fontSize: "1.35rem",
          fontWeight: 700,
          lineHeight: 1.15,
          margin: "0 0 18px",
        }}
      >
        Revenue performance framework
      </h3>
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "100%",
          overflow: "hidden",
          touchAction: "pan-y",
          cursor: "grab",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          if (!draggingRef.current) pausedRef.current = false;
        }}
      >
        <div
          ref={trackRef}
          style={{ display: "flex", gap: 12, willChange: "transform", maxWidth: "none" }}
        >
          {items.map((domain, i) => (
            <div
              key={`${domain.id}-${i}`}
              style={{
                width: isMobile ? "min(72vw, 280px)" : "min(78vw, 300px)",
                minHeight: 190,
                flexShrink: 0,
                padding: "22px 20px",
                border: "1px solid rgba(59,132,255,0.28)",
                background:
                  "linear-gradient(145deg, rgba(59,132,255,0.18), rgba(26,20,16,0.92))",
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
                    color: C.azure,
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
                    color: C.offwhite,
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
                    color: C.muted,
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
          style={{
            position: "absolute",
            inset: "0 auto 0 0",
            width: 40,
            pointerEvents: "none",
            background: `linear-gradient(to right, ${C.bg}, transparent)`,
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "0 0 0 auto",
            width: 40,
            pointerEvents: "none",
            background: `linear-gradient(to left, ${C.bg}, transparent)`,
            zIndex: 1,
          }}
        />
      </div>
    </motion.div>
  );
}

function RevenueWheel() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const circumference = 2 * Math.PI * (INNER_R - 1);

  const startRotation = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIndex((i) => (i === null ? 0 : (i + 1) % NUM));
    }, INTERVAL);
  }, []);

  const stopRotation = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (!hovered) startRotation();
    else stopRotation();
    return stopRotation;
  }, [hovered, startRotation, stopRotation]);

  function handleClick(i: number) {
    if (activeIndex === i) {
      setActiveIndex(null);
      startRotation();
    } else {
      setActiveIndex(i);
      stopRotation();
    }
  }

  return (
    <div
      className="w-full max-w-[460px] mx-auto"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        startRotation();
      }}
    >
      <svg
        viewBox={`0 0 ${VB} ${VB}`}
        className="w-full overflow-visible"
        aria-label="Revenue Performance Framework: six interconnected domains"
        role="img"
      >
        <defs>
          <linearGradient id="dde-sunset" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FACC22" />
            <stop offset="33%" stopColor="#FB5607" />
            <stop offset="66%" stopColor="#4760FF" />
            <stop offset="100%" stopColor="#0DCCFF" />
          </linearGradient>
        </defs>

        <circle cx={CX} cy={CY} r={OUTER_R_BASE} fill="#1a1410" />

        {Array.from({ length: NUM }).map((_, i) => {
          const angle = i * SLICE - SLICE / 2;
          const p1 = polarXY(angle, INNER_R);
          const p2 = polarXY(angle, OUTER_R_BASE + 6);
          return (
            <line
              key={i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={C.bg}
              strokeWidth="4"
            />
          );
        })}

        {DOMAINS.map((d, i) => {
          const baseMid = i * SLICE;
          const wStart = baseMid - SLICE / 2 + GAP_DEG;
          const wEnd = baseMid + SLICE / 2 - GAP_DEG;
          const isActive = activeIndex === i;
          const outerR = isActive ? OUTER_R_ACTIVE : OUTER_R_BASE;
          const c = centroid(baseMid, INNER_R, outerR);
          const foW = isActive ? 145 : 90;
          const foH = isActive ? 120 : 30;
          return (
            <g
              key={d.id}
              className="cursor-pointer focus:outline-none"
              onClick={() => handleClick(i)}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && handleClick(i)
              }
              tabIndex={0}
              role="button"
              aria-pressed={isActive}
              aria-label={`${d.label}: ${d.short}`}
            >
              <motion.path
                d={arcPath(wStart, wEnd, INNER_R, outerR)}
                fill={isActive ? C.azure : "rgba(180,180,180,0.18)"}
                animate={{ d: arcPath(wStart, wEnd, INNER_R, outerR) }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              />
              {isActive && (
                <>
                  <line
                    x1={polarXY(wStart - GAP_DEG, INNER_R).x}
                    y1={polarXY(wStart - GAP_DEG, INNER_R).y}
                    x2={polarXY(wStart - GAP_DEG, OUTER_R_ACTIVE + 6).x}
                    y2={polarXY(wStart - GAP_DEG, OUTER_R_ACTIVE + 6).y}
                    stroke={C.bg}
                    strokeWidth="4"
                  />
                  <line
                    x1={polarXY(wEnd + GAP_DEG, INNER_R).x}
                    y1={polarXY(wEnd + GAP_DEG, INNER_R).y}
                    x2={polarXY(wEnd + GAP_DEG, OUTER_R_ACTIVE + 6).x}
                    y2={polarXY(wEnd + GAP_DEG, OUTER_R_ACTIVE + 6).y}
                    stroke={C.bg}
                    strokeWidth="4"
                  />
                </>
              )}
              <foreignObject
                x={c.x - foW / 2}
                y={c.y - foH / 2}
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
                    gap: 6,
                    fontFamily: "Carlito, sans-serif",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: isActive ? 20 : 13,
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
                        fontSize: 15,
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

        <circle cx={CX} cy={CY} r={INNER_R + 4} fill={C.bg} />
        <circle cx={CX} cy={CY} r={INNER_R} fill={C.bg} />
        <circle
          cx={CX}
          cy={CY}
          r={INNER_R}
          fill="none"
          stroke={C.azure}
          strokeWidth="1"
          strokeOpacity="0.35"
        />

        {!hovered && (
          <motion.circle
            key={`prog-${activeIndex}`}
            cx={CX}
            cy={CY}
            r={INNER_R - 1}
            fill="none"
            stroke="url(#dde-sunset)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            style={{
              transformOrigin: `${CX}px ${CY}px`,
              transform: "rotate(-90deg)",
            }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: INTERVAL / 1000, ease: "linear" }}
          />
        )}

        <text
          x={CX}
          y={CY - 16}
          textAnchor="middle"
          fill={C.azure}
          fontSize="11"
          fontWeight="700"
          fontFamily="Carlito, sans-serif"
          letterSpacing="0.13em"
          style={{ pointerEvents: "none" }}
        >
          REVENUE
        </text>
        <text
          x={CX}
          y={CY - 1}
          textAnchor="middle"
          fill={C.azure}
          fontSize="11"
          fontWeight="700"
          fontFamily="Carlito, sans-serif"
          letterSpacing="0.08em"
          style={{ pointerEvents: "none" }}
        >
          PERFORMANCE
        </text>
        <text
          x={CX}
          y={CY + 15}
          textAnchor="middle"
          fill={C.azure}
          fontSize="11"
          fontWeight="700"
          fontFamily="Carlito, sans-serif"
          letterSpacing="0.08em"
          style={{ pointerEvents: "none" }}
        >
          FRAMEWORK
        </text>
      </svg>
    </div>
  );
}

// ─── Platform Diagram (three-wedge PureRevenue diagram) ──────────────────────
const PLATFORM_WEDGES = [
  {
    id: "practice",
    label: "Practice Management",
    startAngle: -60,
    endAngle: 60,
    stroke: "#ffb30c",
    faUnicode: "\uf201",
  },
  {
    id: "comp",
    label: "Compensation",
    startAngle: 60,
    endAngle: 180,
    stroke: "#FF006E",
    faUnicode: "\uf51e",
  },
  {
    id: "fees",
    label: "Fees & Billing",
    startAngle: 180,
    endAngle: 300,
    stroke: "#ED65D0",
    faUnicode: "\uf571",
  },
];

function platPolarXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function platWedgePath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  s: number,
  e: number,
) {
  const o1 = platPolarXY(cx, cy, outerR, s),
    o2 = platPolarXY(cx, cy, outerR, e);
  const i2 = platPolarXY(cx, cy, innerR, e),
    i1 = platPolarXY(cx, cy, innerR, s);
  const lg = e - s > 180 ? 1 : 0;
  return `M${o1.x} ${o1.y} A${outerR} ${outerR} 0 ${lg} 1 ${o2.x} ${o2.y} L${i2.x} ${i2.y} A${innerR} ${innerR} 0 ${lg} 0 ${i1.x} ${i1.y}Z`;
}

function PlatformDiagram({ visible }: { visible: boolean }) {
  const { isMobile } = useBreakpoint();
  const PVB = 200;
  const PCX = 100;
  const PCY = 100;
  const INNER = 43;
  const OUTER = 84;
  const WEDGE_INNER = INNER + 2;
  const LABEL_R = OUTER + 18;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: isMobile ? 240 : 380,
        overflow: "visible",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "min(260px, 70%)",
          aspectRatio: "1",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(59,132,255,0.13) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          width: isMobile ? "min(200px,70vw)" : "min(340px, 88%)",
          aspectRatio: "1",
        }}
      >
        <svg
          viewBox={`0 0 ${PVB} ${PVB}`}
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          {PLATFORM_WEDGES.map((w, wi) => {
            const path = platWedgePath(
              PCX,
              PCY,
              OUTER,
              WEDGE_INNER,
              w.startAngle,
              w.endAngle,
            );
            const mid = (w.startAngle + w.endAngle) / 2;
            const iconPt = platPolarXY(
              PCX,
              PCY,
              (OUTER + WEDGE_INNER) / 2,
              mid,
            );
            const labelPt = platPolarXY(PCX, PCY, LABEL_R, mid);
            const textAnchor =
              labelPt.x < PCX - 5
                ? "end"
                : labelPt.x > PCX + 5
                  ? "start"
                  : "middle";
            const words = w.label.split(" ");
            const half = Math.ceil(words.length / 2);
            return (
              <g key={w.id}>
                <motion.path
                  d={path}
                  fill="none"
                  stroke={w.stroke}
                  strokeWidth="1.5"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={
                    visible
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 0.88 }
                  }
                  style={{ transformOrigin: `${PCX}px ${PCY}px` }}
                  transition={{
                    duration: 0.55,
                    delay: visible ? wi * 0.18 : 0,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
                <motion.text
                  x={iconPt.x}
                  y={iconPt.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="13"
                  fontWeight="900"
                  fontFamily="'Font Awesome 6 Free','Font Awesome 6 Pro','Font Awesome 5 Free'"
                  fill={w.stroke}
                  initial={{ opacity: 0 }}
                  animate={visible ? { opacity: 1 } : { opacity: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: visible ? wi * 0.18 + 0.18 : 0,
                  }}
                >
                  {w.faUnicode}
                </motion.text>
                <motion.text
                  x={labelPt.x}
                  y={labelPt.y}
                  textAnchor={textAnchor}
                  dominantBaseline="middle"
                  fontSize="8.5"
                  fontWeight="700"
                  fill={w.stroke}
                  style={{ letterSpacing: "0.02em" }}
                  initial={{ opacity: 0 }}
                  animate={visible ? { opacity: 1 } : { opacity: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: visible ? wi * 0.18 + 0.3 : 0,
                  }}
                >
                  {words.length > 1 ? (
                    <>
                      <tspan x={labelPt.x} dy="-0.6em">
                        {words.slice(0, half).join(" ")}
                      </tspan>
                      <tspan x={labelPt.x} dy="1.3em">
                        {words.slice(half).join(" ")}
                      </tspan>
                    </>
                  ) : (
                    w.label
                  )}
                </motion.text>
              </g>
            );
          })}
          <circle cx={PCX} cy={PCY} r={INNER + 2} fill={C.bg} />
          <circle
            cx={PCX}
            cy={PCY}
            r={INNER}
            fill="none"
            stroke="rgba(59,132,255,0.18)"
            strokeWidth="1.5"
          />
          <circle
            cx={PCX}
            cy={PCY}
            r={INNER}
            fill="none"
            stroke="rgba(59,132,255,0.45)"
            strokeWidth="1.5"
          />
          <motion.text
            x={PCX}
            y={PCY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fontWeight="600"
            fill={C.offwhite}
            style={{ letterSpacing: "0.02em" }}
            initial={{ opacity: 0 }}
            animate={visible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.38 }}
          >
            <tspan x={PCX} dy="-5">
              Revenue Book
            </tspan>
            <tspan x={PCX} dy="11">
              of Record
            </tspan>
          </motion.text>
        </svg>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function DeepDomainExpertiseClient() {
  const { isMobile, isTablet } = useBreakpoint();
  const sectionPad = isMobile ? "56px 0" : "90px 0";
  const finalPad = isMobile ? "48px 0 64px" : "72px 0 96px";
  const innerPad = isMobile ? "0 20px" : isTablet ? "0 32px" : "0 48px";
  const twoCols = isTablet ? "1fr" : "1fr 1fr";
  const sectionGap = isMobile ? 28 : isTablet ? 40 : 72;

  const heroRef = useRef<HTMLDivElement>(null);
  const genericRef = useRef<HTMLDivElement>(null);
  const lifecycleRef = useRef<HTMLDivElement>(null);
  const platformRef = useRef<HTMLDivElement>(null);

  const genericVisible = useInView(genericRef, {
    once: true,
    margin: "-80px 0px",
  });
  const lifecycleVisible = useInView(lifecycleRef, {
    once: true,
    margin: "-80px 0px",
  });
  const platformVisible = useInView(platformRef, {
    once: true,
    margin: "-80px 0px",
  });

  return (
    <div 
      style={{
        background: C.bg,
        fontFamily: "'Carlito','Segoe UI',sans-serif",
        overflowX: "hidden",
      }}
      className="dark-page dde-page"
    >
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        .dde-page *, .dde-page *::before, .dde-page *::after { box-sizing: border-box; }
        .dde-page section, .dde-page canvas, .dde-page svg { max-width: 100%; }
        .dde-page h1, .dde-page h2, .dde-page h3, .dde-page p { overflow-wrap: anywhere; }
        h1, h2, h3, p { overflow-wrap: anywhere; }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; } }
      `}</style>

      {/* ── 1. Hero ────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          minHeight: isMobile ? "auto" : "64vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          padding: isMobile ? "20px 0 20px" : "0",
        }}
      >
        <InfinityFlow />

        {/* Subtle radial glow behind copy */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 55% 70% at 0% 50%, rgba(59,132,255,0.06) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: isMobile
              ? "0 20px"
              : isTablet
                ? "80px 32px 64px"
                : "86px 48px 68px",
            position: "relative",
            zIndex: 1,
            width: "100%",
          }}
        >
          <div style={{ maxWidth: 600 }}>
            <Reveal>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: C.mandarin,
                  marginBottom: 16,
                }}
              >
                Deep Domain Expertise
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <h1
                style={{
                  fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)",
                  fontWeight: 700,
                  color: C.offwhite,
                  lineHeight: 1.12,
                  letterSpacing: "-0.03em",
                  margin: "0 0 20px",
                }}
              >
                Solve revenue complexity{" "}
                <span style={{ color: C.azure }}>with the right partner</span>
              </h1>
            </Reveal>

            <Reveal delay={0.15}>
              <p
                style={{
                  fontSize: 17,
                  color: C.muted,
                  lineHeight: 1.7,
                  margin: "0 0 32px",
                  maxWidth: 520,
                }}
              >
                For 15 years, PureFacts has helped the world's most respected
                wealth and asset management firms manage the complexity of
                revenue operations. That experience is built into the platform,
                the process, and every engagement.
              </p>
            </Reveal>

            <Reveal delay={0.22}>
              <Link href="/contact" className="btn-primary">
                Get in Contact
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 3. Not a generic software problem ─────────────────── */}
      <section ref={genericRef} style={{ padding: isMobile ? "36px 0" : "52px 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: innerPad }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Centered copy */}
            <div style={{ maxWidth: 700, textAlign: isMobile ? 'left' : 'center' }}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={genericVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55 }}
              >
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: C.mandarin,
                    marginBottom: 14,
                  }}
                >
                  The Challenge
                </p>
                <h2
                  style={{
                    fontSize: "clamp(1.6rem,3vw,2.4rem)",
                    fontWeight: 700,
                    color: C.offwhite,
                    lineHeight: 1.18,
                    letterSpacing: "-0.025em",
                    margin: "0 0 20px",
                  }}
                >
                  Revenue management in this industry is not a{" "}
                  <span style={{ color: C.azure }}>
                    generic software problem
                  </span>
                </h2>
                <p
                  style={{
                    fontSize: 15,
                    color: C.muted,
                    lineHeight: 1.75,
                    margin: "0 0 16px",
                  }}
                >
                  It is shaped by product complexity, pricing nuance,
                  compensation design, household structures, regulatory
                  scrutiny, and the need to produce outcomes firms can trust and
                  defend.
                </p>
                <p
                  style={{
                    fontSize: 15,
                    color: C.muted,
                    lineHeight: 1.75,
                    margin: 0,
                  }}
                >
                  Firms need a partner who understands how revenue actually
                  moves through the business: where friction shows up, and what
                  it takes to improve outcomes without creating new risk.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Full Revenue Lifecycle ──────────────────────────── */}
      <section ref={lifecycleRef} style={{ padding: sectionPad }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: innerPad }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: twoCols,
              gap: sectionGap,
              alignItems: "center",
              width: "100%",
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            {/* Left: copy */}
            <div style={{ minWidth: 0, width: "100%", maxWidth: "100%", overflow: "hidden" }}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={lifecycleVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55 }}
              >
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: C.mandarin,
                    marginBottom: 14,
                  }}
                >
                  Revenue Performance
                </p>
                <h2
                  style={{
                    fontSize: "clamp(1.6rem,3vw,2.4rem)",
                    fontWeight: 700,
                    color: C.offwhite,
                    lineHeight: 1.18,
                    letterSpacing: "-0.025em",
                    margin: "0 0 16px",
                  }}
                >
                  Expertise across the{" "}
                  <span style={{ color: C.azure }}>full revenue lifecycle</span>
                </h2>
                <p
                  style={{
                    fontSize: 15,
                    color: C.muted,
                    lineHeight: 1.75,
                    margin: "0 0 20px",
                  }}
                >
                  Revenue Performance is a connected discipline. From how
                  pricing is designed and governed to how it is executed,
                  measured, and improved, PureFacts brings deep expertise to
                  every dimension of the lifecycle.
                </p>
                <p
                  style={{
                    fontSize: 15,
                    color: C.muted,
                    lineHeight: 1.75,
                    margin: "0 0 28px",
                  }}
                >
                  That expertise spans Strategy, Alignment, Execution,
                  Transparency, Intelligence, and Governance. Each domain is
                  connected to the others, and together they form the foundation
                  of a firm that manages revenue with intention.
                </p>
              </motion.div>
            </div>

            {/* Right: Revenue wheel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={lifecycleVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ minWidth: 0, width: "100%", maxWidth: isMobile ? "100%" : 460, margin: "0 auto", overflow: "visible" }}
            >
              {isMobile ? <MobileFrameworkCarousel /> : <RevenueWheel />}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 5. Expertise Built Into The Platform ──────────────── */}
      <section ref={platformRef} style={{ padding: sectionPad }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: innerPad }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: twoCols,
              gap: sectionGap,
              alignItems: "center",
            }}
          >
            {/* Left: copy + bullets */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={platformVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55 }}
              >
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: C.mandarin,
                    marginBottom: 14,
                  }}
                >
                  The Platform
                </p>
                <h2
                  style={{
                    fontSize: "clamp(1.6rem,3vw,2.4rem)",
                    fontWeight: 700,
                    color: C.offwhite,
                    lineHeight: 1.18,
                    letterSpacing: "-0.025em",
                    margin: "0 0 16px",
                  }}
                >
                  Expertise built into the platform
                </h2>
                <p
                  style={{
                    fontSize: 15,
                    color: C.muted,
                    lineHeight: 1.75,
                    margin: "0 0 28px",
                  }}
                >
                  The PureRevenue Platform is not a generic tool adapted to
                  financial services. It was built from the ground up to address
                  the specific complexity of wealth and asset management revenue
                  operations, with domain knowledge embedded at every layer.
                </p>

                {[
                  "Built-in rules for complex fee schedule structures",
                  "Compensation logic designed for real advisor relationships",
                  "Revenue intelligence surfacing leakage and opportunity",
                  "Audit-ready records at every stage of the lifecycle",
                ].map((pt, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={platformVisible ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.25 + i * 0.08 }}
                    style={{
                      display: "flex",
                      gap: 12,
                      marginBottom: 10,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: C.azure,
                        flexShrink: 0,
                        marginTop: 8,
                      }}
                    />
                    <span
                      style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}
                    >
                      {pt}
                    </span>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={platformVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  style={{ marginTop: 28 }}
                >
                  <Link href="/platform/" className="btn-primary">
                    Explore the Platform
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            {/* Right: Platform diagram */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={platformVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PlatformDiagram visible={platformVisible} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 6. Final CTA ──────────────────────────────────────── */}
      <section style={{ padding: finalPad }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: innerPad }}>
          <Reveal>
            <div
              style={{
                display: "flex",
                flexDirection: isTablet ? "column" : "row",
                gap: isMobile ? 28 : 64,
                alignItems: isTablet ? "flex-start" : "center",
                flexWrap: "wrap",
                padding: isMobile ? "28px 0 0" : "52px 0 0",
              }}
            >
              {/* Left: icon feature list */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 28,
                  flex: "1 1 340px",
                }}
              >
                {[
                  {
                    icon: "fa-magnifying-glass-dollar",
                    color: "rgba(251,86,7,0.12)",
                    iconColor: C.mandarin,
                    title: "Find Hidden Revenue",
                    desc: "Identify leakage, underbilled accounts, and missed opportunities across your entire book.",
                  },
                  {
                    icon: "fa-gears",
                    color: "rgba(59,132,255,0.12)",
                    iconColor: C.azure,
                    title: "Replace Manual Processes",
                    desc: "Automate complex billing, compensation, and reconciliation workflows that rely on spreadsheets today.",
                  },
                  {
                    icon: "fa-shield-halved",
                    color: "rgba(13,204,255,0.12)",
                    iconColor: C.cyan,
                    title: "Strengthen Governance",
                    desc: "Apply consistent controls, exception handling, and audit-ready records across every revenue workflow.",
                  },
                ].map(({ icon, color, iconColor, title, desc }) => (
                  <div
                    key={title}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                      }}
                    >
                      <i
                        className={`fa-solid ${icon}`}
                        style={{ color: iconColor, fontSize: 16 }}
                      />
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: C.offwhite,
                          margin: "0 0 4px",
                          lineHeight: 1,
                        }}
                      >
                        {title}
                      </p>
                      <p
                        style={{
                          fontSize: 13.5,
                          color: C.muted,
                          lineHeight: 1.6,
                          margin: 0,
                        }}
                      >
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: headline + CTA */}
              <div style={{ flex: "1 1 300px", minWidth: 0 }}>
                <h3
                  style={{
                    fontSize: "clamp(1.6rem,3vw,2.2rem)",
                    fontWeight: 700,
                    lineHeight: 1.15,
                    letterSpacing: "-0.025em",
                    margin: "0 0 16px",
                  }}
                >
                  <span
                    style={{
                      background:
                        "linear-gradient(135deg,#FACC22,#FB5607,#4760FF,#0DCCFF)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Talk to a team that understands your business,
                  </span>{" "}
                  <span style={{ color: C.offwhite }}>
                    not just your software.
                  </span>
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: C.muted,
                    lineHeight: 1.7,
                    margin: "0 0 28px",
                    maxWidth: 380,
                  }}
                >
                  Trusted by leading wealth and asset management firms across
                  North America and beyond.
                </p>
                <Link href="/contact" className="btn-primary">
                  Get in Contact
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
