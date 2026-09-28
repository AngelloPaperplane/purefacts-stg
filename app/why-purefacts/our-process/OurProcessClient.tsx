"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────────
   TOKENS
───────────────────────────────────────────────────────────── */
const C = {
  bg: "#140f0c",
  surface: "#1a1410",
  text: "#f4f4f4",
  body: "rgba(244,244,244,0.75)",
  subtle: "rgba(244,244,244,0.45)",
  border: "rgba(255,255,255,0.07)",
  azure: "#3b84ff",
  mandarin: "#fb5607",
  honey: "#ffb30c",
  sunset:
    "linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%)",
} as const;

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: C.sunset,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {children}
    </span>
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

/* ─────────────────────────────────────────────────────────────
   HERO CANVAS — orbital nodes for dark background
───────────────────────────────────────────────────────────── */
function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const introRef = useRef(0);
  const orbitRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let dpr = window.devicePixelRatio || 1;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      canvas!.width = canvas!.offsetWidth * dpr;
      canvas!.height = canvas!.offsetHeight * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const NODES = [
      { label: "Fee Billing", icon: "$", color: "#ED65D0" },
      { label: "Compensation", icon: "%", color: "#FF006E" },
      { label: "Reporting", icon: "↗", color: C.honey },
      { label: "Collection", icon: "◎", color: C.mandarin },
      { label: "AI Intelligence", icon: "⬡", color: C.azure },
    ];

    function ha(hex: string, a: number) {
      return `${hex}${Math.round(a * 255)
        .toString(16)
        .padStart(2, "0")}`;
    }

    function gradLine(x1: number, y1: number, x2: number, y2: number) {
      const g = ctx!.createLinearGradient(x1, y1, x2, y2);
      g.addColorStop(0, "#FACC22");
      g.addColorStop(0.33, "#FB5607");
      g.addColorStop(0.66, "#4760FF");
      g.addColorStop(1, "#0DCCFF");
      return g;
    }

    function easeOut(t: number) {
      return 1 - Math.pow(1 - t, 3);
    }

    function draw() {
      const w = canvas!.offsetWidth,
        h = canvas!.offsetHeight;
      ctx!.clearRect(0, 0, w, h);
      const cx = w / 2,
        cy = h / 2;
      const orbitR = Math.min(w, h) * 0.32;
      const intro = Math.min(introRef.current, 1);
      const orbit = orbitRef.current;

      // Outer glow ring
      const hubGlow = ctx!.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        orbitR * 1.1,
      );
      hubGlow.addColorStop(0, ha(C.azure, 0.04));
      hubGlow.addColorStop(1, ha(C.azure, 0));
      ctx!.beginPath();
      ctx!.arc(cx, cy, orbitR * 1.1, 0, Math.PI * 2);
      ctx!.fillStyle = hubGlow;
      ctx!.fill();

      // Orbit path
      ctx!.beginPath();
      ctx!.arc(cx, cy, orbitR, 0, Math.PI * 2);
      ctx!.strokeStyle = ha("#f4f4f4", 0.05);
      ctx!.lineWidth = 1;
      ctx!.stroke();

      NODES.forEach((node, i) => {
        const nodeIntro = Math.max(0, Math.min(1, (intro - i * 0.12) / 0.55));
        const ease = easeOut(nodeIntro);
        if (ease <= 0) return;

        const baseAngle = (i / NODES.length) * Math.PI * 2 - Math.PI / 2;
        const finalAngle = baseAngle + orbit;
        const startMult = 1.8;
        const currentR = orbitR * (startMult - (startMult - 1) * ease);
        const nx = cx + Math.cos(finalAngle) * currentR;
        const ny = cy + Math.sin(finalAngle) * currentR;

        // Connection line
        ctx!.beginPath();
        ctx!.moveTo(nx, ny);
        ctx!.lineTo(cx, cy);
        ctx!.strokeStyle = gradLine(nx, ny, cx, cy);
        ctx!.lineWidth = 1.5;
        ctx!.globalAlpha = ease * 0.35;
        ctx!.stroke();
        ctx!.globalAlpha = 1;

        // Node glow
        const ng = ctx!.createRadialGradient(nx, ny, 0, nx, ny, 40);
        ng.addColorStop(0, ha(node.color, 0.18 * ease));
        ng.addColorStop(1, ha(node.color, 0));
        ctx!.beginPath();
        ctx!.arc(nx, ny, 40, 0, Math.PI * 2);
        ctx!.fillStyle = ng;
        ctx!.fill();

        // Node circle — dark fill with gradient border
        ctx!.beginPath();
        ctx!.arc(nx, ny, 28, 0, Math.PI * 2);
        ctx!.fillStyle = ha(C.surface, ease * 0.95);
        ctx!.fill();

        ctx!.beginPath();
        ctx!.arc(nx, ny, 28, 0, Math.PI * 2);
        ctx!.strokeStyle = node.color;
        ctx!.lineWidth = 1.5;
        ctx!.globalAlpha = ease * 0.7;
        ctx!.stroke();
        ctx!.globalAlpha = 1;

        // Icon
        ctx!.font = "bold 14px Carlito, sans-serif";
        ctx!.textAlign = "center";
        ctx!.textBaseline = "middle";
        ctx!.fillStyle = node.color;
        ctx!.globalAlpha = ease;
        ctx!.fillText(node.icon, nx, ny);
        ctx!.globalAlpha = 1;

        // Label
        ctx!.font = "9.5px Carlito, sans-serif";
        ctx!.fillStyle = ha(C.subtle, 0.9);
        ctx!.globalAlpha = ease * Math.min(1, orbit * 8);
        ctx!.fillText(node.label, nx, ny + 40);
        ctx!.globalAlpha = 1;
      });

      // Hub
      const hubEase = easeOut(Math.max(0, Math.min(1, (intro - 0.5) / 0.5)));
      if (hubEase > 0) {
        const hg = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 44);
        hg.addColorStop(0, ha(C.azure, 0.25 * hubEase));
        hg.addColorStop(1, ha(C.azure, 0.06 * hubEase));
        ctx!.beginPath();
        ctx!.arc(cx, cy, 44, 0, Math.PI * 2);
        ctx!.fillStyle = hg;
        ctx!.fill();

        ctx!.beginPath();
        ctx!.arc(cx, cy, 44, 0, Math.PI * 2);
        ctx!.strokeStyle = gradLine(cx - 44, cy, cx + 44, cy);
        ctx!.lineWidth = 2;
        ctx!.globalAlpha = hubEase * 0.7;
        ctx!.stroke();
        ctx!.globalAlpha = 1;

        ctx!.font = `bold 9.5px Carlito, sans-serif`;
        ctx!.textAlign = "center";
        ctx!.textBaseline = "middle";
        ctx!.fillStyle = ha(C.text, 0.92);
        ctx!.globalAlpha = hubEase;
        ctx!.fillText("PureRevenue", cx, cy - 6);
        ctx!.fillText("Platform", cx, cy + 7);
        ctx!.globalAlpha = 1;
      }
    }

    let last = 0;
    const tick = (ts: number) => {
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      if (introRef.current < 1)
        introRef.current = Math.min(1, introRef.current + dt * 0.7);
      else orbitRef.current += dt * 0.08;
      draw();
      rafRef.current = requestAnimationFrame(tick);
    };

    const timeout = setTimeout(() => {
      rafRef.current = requestAnimationFrame(tick);
    }, 200);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        minHeight: "clamp(260px, 46vw, 360px)",
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   STICKY PROGRESS SIDEBAR
───────────────────────────────────────────────────────────── */
const STEPS = [
  { n: "1", label: "Discovery" },
  { n: "2", label: "RPA" },
  { n: "3", label: "BNA" },
  { n: "4", label: "Value" },
];

function StickyProgress({ active }: { active: number }) {
  return (
    <div
      style={{
        position: "fixed",
        left: 24,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 40,
        display: "none",
        flexDirection: "column",
        alignItems: "center",
      }}
      className="xl-sticky-progress"
      aria-hidden="true"
    >
      <style>{`.xl-sticky-progress { display: none !important; } @media (min-width: 1280px) { .xl-sticky-progress { display: flex !important; } }`}</style>
      {STEPS.map((s, i) => (
        <div
          key={s.n}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <button
            onClick={() =>
              document
                .getElementById(`step-${s.n}`)
                ?.scrollIntoView({ behavior: "smooth" })
            }
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
            aria-label={`Jump to step ${s.n}: ${s.label}`}
          >
            <div
              style={{
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 900,
                transition: "all 0.3s ease",
                ...(active === i
                  ? {
                      background: C.sunset,
                      color: C.text,
                      transform: "scale(1.1)",
                    }
                  : {
                      background: C.surface,
                      border: `1.5px solid ${C.border}`,
                      color: C.subtle,
                    }),
              }}
            >
              {s.n}
            </div>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase" as const,
                color: active === i ? C.azure : C.subtle,
                transition: "color 0.3s",
              }}
            >
              {s.label}
            </span>
          </button>
          {i < STEPS.length - 1 && (
            <div
              style={{
                width: 2,
                height: 32,
                margin: "4px 0",
                background: active > i ? C.sunset : C.border,
                transition: "background 0.5s",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SCROLL STEP TRACKER
───────────────────────────────────────────────────────────── */
function useActiveStep(ids: string[]) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const getActive = () => {
      const mid = window.scrollY + window.innerHeight * 0.4;
      let best = 0;
      ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top <= mid) best = i;
      });
      setActive(best);
    };
    getActive();
    window.addEventListener("scroll", getActive, { passive: true });
    return () => window.removeEventListener("scroll", getActive);
  }, [ids]);
  return active;
}

/* ─────────────────────────────────────────────────────────────
   ANIMATED STEP WRAPPER
───────────────────────────────────────────────────────────── */
function AnimatedStep({
  id,
  children,
  onVisible,
}: {
  id: string;
  children: React.ReactNode;
  onVisible?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  const fired = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !fired.current) {
          fired.current = true;
          setVis(true);
          onVisible?.();
        }
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [onVisible]);
  return (
    <div
      id={id}
      ref={ref}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(28px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP NUMBER NODE
───────────────────────────────────────────────────────────── */
function StepNode({
  n,
  eyebrow,
  title,
  color,
}: {
  n: string;
  eyebrow: string;
  title: string;
  color: string;
}) {
  const { isMobile } = useBreakpoint();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: isMobile ? 12 : 16,
        marginBottom: isMobile ? 20 : 24,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: isMobile ? 48 : 56,
          height: isMobile ? 48 : 56,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: isMobile ? 18 : 22,
          fontWeight: 900,
          color: C.text,
          background: C.surface,
          border: `2px solid ${color}`,
        }}
      >
        {n}
      </div>
      <div>
        <p
          style={{
            fontSize: isMobile ? 11 : 12,
            fontWeight: 800,
            textTransform: "uppercase" as const,
            letterSpacing: "0.16em",
            color,
            margin: "0 0 6px",
          }}
        >
          {eyebrow}
        </p>
        <h2
          style={{
            fontSize: "clamp(1.65rem,2.8vw,2.2rem)",
            fontWeight: 750,
            color: C.text,
            letterSpacing: "-0.025em",
            lineHeight: 1.12,
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP 1 — FRAGMENTATION VISUAL (dark)
───────────────────────────────────────────────────────────── */
function FragmentationVisual({ visible }: { visible: boolean }) {
  const { isMobile } = useBreakpoint();
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isMobile) {
      setOffset({ x: 0, y: 0 });
      return;
    }

    const handleMouse = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setOffset({
        x: ((e.clientX - rect.left - rect.width / 2) / rect.width) * 18,
        y: ((e.clientY - rect.top - rect.height / 2) / rect.height) * 18,
      });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [isMobile]);

  const NODES = isMobile
    ? [
        { label: "Billing System", color: C.honey, baseX: 4, baseY: 10, depth: 0 },
        { label: "Comp Platform", color: C.mandarin, baseX: 44, baseY: 8, depth: 0 },
        { label: "Reporting Tools", color: C.azure, baseX: 40, baseY: 45, depth: 0 },
        { label: "Spreadsheets", color: C.honey, baseX: 5, baseY: 64, depth: 0 },
        { label: "Manual Workarounds", color: C.mandarin, baseX: 27, baseY: 78, depth: 0 },
      ]
    : [
        {
          label: "Billing System",
          color: C.honey,
          baseX: 10,
          baseY: 8,
          depth: 1.2,
        },
        {
          label: "Comp Platform",
          color: C.mandarin,
          baseX: 58,
          baseY: 4,
          depth: 0.8,
        },
        {
          label: "Reporting Tools",
          color: C.azure,
          baseX: 68,
          baseY: 48,
          depth: 1.5,
        },
        { label: "Spreadsheets", color: C.honey, baseX: 6, baseY: 62, depth: 0.6 },
        {
          label: "Manual Workarounds",
          color: C.mandarin,
          baseX: 36,
          baseY: 74,
          depth: 1.0,
        },
      ];

  function ha(hex: string, a: number) {
    return `${hex}${Math.round(a * 255)
      .toString(16)
      .padStart(2, "0")}`;
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        height: isMobile ? 220 : 280,
        width: isMobile ? "min(100%, 320px)" : "100%",
        maxWidth: isMobile ? 320 : 380,
        overflow: isMobile ? "hidden" : "visible",
      }}
      aria-hidden="true"
    >
      {NODES.map((node, i) => (
        <div
          key={node.label}
          style={{
            position: "absolute",
            left: `${node.baseX}%`,
            top: `${node.baseY}%`,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: C.surface,
            border: `1px solid ${node.color}55`,
            padding: isMobile ? "5px 9px" : "6px 12px",
            transform: isMobile ? "translate(0, 0)" : `translate(${offset.x * node.depth}px, ${offset.y * node.depth}px)`,
            transitionDelay: `${i * 60}ms`,
            opacity: visible ? 1 : 0,
            transition: `opacity 500ms ${i * 60}ms, transform 100ms`,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: node.color,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: isMobile ? 10 : 11,
              fontWeight: 600,
              color: C.text,
              whiteSpace: "nowrap" as const,
            }}
          >
            {node.label}
          </span>
        </div>
      ))}
      {/* Central question mark */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: visible
            ? isMobile
              ? "translate(-50%, -50%)"
              : `translate(calc(-50% + ${offset.x * 0.3}px), calc(-50% + ${offset.y * 0.3}px))`
            : "translate(-50%, -50%) scale(0.5)",
          width: 72,
          height: 72,
          border: `2px dashed ${C.border}`,
          background: C.surface,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: visible ? 1 : 0,
          transition: "opacity 500ms 400ms, transform 500ms 400ms",
        }}
      >
        <i
          className="fa-solid fa-question"
          style={{ fontSize: 22, color: C.subtle }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP 2 — RPA ACCORDION (dark)
───────────────────────────────────────────────────────────── */
const RPA_ITEMS = [
  {
    icon: "fa-file-invoice-dollar",
    label: "Pricing",
    color: "#FACC22",
    detail:
      "We examine whether pricing is applied consistently, where discounting has become habitual, and how much yield is being surrendered before a fee is ever billed.",
  },
  {
    icon: "fa-receipt",
    label: "Billing",
    color: C.mandarin,
    detail:
      "We look at billing accuracy, cycle efficiency, exception volume, and where manual effort is filling the gaps that automation should cover.",
  },
  {
    icon: "fa-hand-holding-dollar",
    label: "Compensation",
    color: C.azure,
    detail:
      "We assess whether compensation structures are reinforcing the right behaviors and whether payout processes are creating trust or eroding it.",
  },
  {
    icon: "fa-circle-dollar-to-slot",
    label: "Collection",
    color: "#0DCCFF",
    detail:
      "We identify where earned revenue is not being collected due to householding gaps, stale schedules, orphaned assets, or unmanaged exceptions.",
  },
  {
    icon: "fa-shield-halved",
    label: "Controls",
    color: "#FACC22",
    detail:
      "We review governance over pricing exceptions, discount approval workflows, and whether audit trails exist for key revenue decisions.",
  },
  {
    icon: "fa-chart-line",
    label: "Reporting",
    color: C.mandarin,
    detail:
      "We evaluate whether leadership and operations have a reliable, consistent view of revenue performance or are working from fragmented, manually assembled data.",
  },
];

function RpaAccordion({ visible }: { visible: boolean }) {
  const { isMobile } = useBreakpoint();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div
      style={{
        width: "100%",
        maxWidth: isMobile ? "100%" : 380,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 0,
      }}
      aria-label="Revenue Performance Assessment areas"
    >
      {RPA_ITEMS.map((item, i) => (
        <div
          key={item.label}
          style={{
            background: C.surface,
            border: `1px solid ${open === i ? item.color + "55" : C.border}`,
            overflow: "hidden",
            transition: "border-color 0.2s, opacity 500ms, transform 500ms",
            transitionDelay: `${i * 55}ms`,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(20px)",
          }}
        >
          <button
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left" as const,
            }}
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <i
              className={`fa-solid ${item.icon}`}
              style={{ color: item.color, fontSize: 13, flexShrink: 0 }}
              aria-hidden="true"
            />
            <span
              style={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.text }}
            >
              {item.label}
            </span>
            <i
              className={`fa-solid fa-chevron-down`}
              style={{
                fontSize: 10,
                color: C.subtle,
                transform: open === i ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
              aria-hidden="true"
            />
          </button>
          <div
            style={{
              maxHeight: open === i ? 100 : 0,
              overflow: "hidden",
              transition: "max-height 0.3s ease",
            }}
          >
            <p
              style={{
                padding: "0 14px 12px 38px",
                fontSize: 12,
                color: C.body,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {item.detail}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP 3 — BNA COMPARISON (dark)
───────────────────────────────────────────────────────────── */
function BNAComparison({ visible }: { visible: boolean }) {
  const { isMobile } = useBreakpoint();
  return (
    <div
      style={{ width: "100%", maxWidth: isMobile ? "100%" : 380, minWidth: 0 }}
      aria-label="RPA versus BNA comparison"
    >
      {/* Two-column grid with gradient gap */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 2,
          background: C.sunset,
        }}
      >
        {[
          {
            stage: "RPA",
            color: C.subtle,
            items: [
              "Surfaces friction",
              "Documents workarounds",
              "Identifies opportunity",
              "Determines fit",
            ],
            iconColor: C.azure,
          },
          {
            stage: "BNA",
            color: C.azure,
            items: [
              "Quantifies impact",
              "Defines future state",
              "Structures the path",
              "Builds business case",
            ],
            iconColor: C.mandarin,
          },
        ].map((col, ci) => (
          <div
            key={col.stage}
            style={{ background: C.surface, padding: isMobile ? 16 : 20 }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: "0.14em",
                color: col.color,
                margin: "0 0 14px",
              }}
            >
              {col.stage}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {col.items.map((item, i) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    fontSize: 12,
                    color: C.body,
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(8px)",
                    transition: `opacity 400ms ${(ci * 4 + i) * 70}ms, transform 400ms ${(ci * 4 + i) * 70}ms`,
                  }}
                >
                  <i
                    className="fa-solid fa-circle-check"
                    style={{
                      color: col.iconColor,
                      fontSize: 11,
                      marginTop: 2,
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p
        style={{
          marginTop: 12,
          textAlign: "center",
          fontSize: 12,
          color: C.subtle,
        }}
      >
        Two stages. One connected path to clarity.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP 4 — TREND CHART (dark)
───────────────────────────────────────────────────────────── */
function TrendChart({ visible }: { visible: boolean }) {
  const { isMobile } = useBreakpoint();
  return (
    <div
      style={{
        width: "100%",
        maxWidth: isMobile ? "100%" : 380,
        background: C.surface,
        border: `1px solid ${C.border}`,
        padding: 24,
      }}
      aria-label="Revenue clarity improvement chart"
    >
      <p
        style={{
          fontSize: 10,
          fontWeight: 600,
          textTransform: "uppercase" as const,
          letterSpacing: "0.14em",
          color: C.subtle,
          margin: "0 0 16px",
        }}
      >
        Revenue clarity over time
      </p>

      <div style={{ position: "relative", width: "100%" }}>
        <svg
          viewBox="0 0 260 120"
          style={{ width: "100%", overflow: "visible" }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="trendGradDark" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FACC22" />
              <stop offset="33%" stopColor="#FB5607" />
              <stop offset="66%" stopColor="#4760FF" />
              <stop offset="100%" stopColor="#0DCCFF" />
            </linearGradient>
            <linearGradient id="legendGradDark" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FACC22" />
              <stop offset="100%" stopColor="#0DCCFF" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[20, 45, 70, 95].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="260"
              y2={y}
              stroke="rgba(244,244,244,0.05)"
              strokeWidth="1"
            />
          ))}

          {/* Before — flat dashed line, left half only */}
          <path
            d="M 0 90 L 10 88 L 20 92 L 30 87 L 40 91 L 45 89"
            stroke="rgba(244,244,244,0.15)"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="4 3"
          />

          {/* Logo in the gap — positioned via foreignObject */}
          <foreignObject x="46" y="75" width="70" height="28">
            <img
              // @ts-ignore
              xmlns="http://www.w3.org/1999/xhtml"
              src="/PureRevenueWhite.svg"
              alt="PureRevenue Platform"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                opacity: visible ? 1 : 0,
                transition: "opacity 0.5s ease 0.4s",
              }}
            />
          </foreignObject>

          {/* After line — gradient curve, right half */}
          <path
            d="M 120 88 C 150 75 175 50 210 35 T 260 15"
            stroke="url(#trendGradDark)"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="200"
            strokeDashoffset={visible ? 0 : 200}
            style={{ transition: "stroke-dashoffset 1.2s ease-out 0.3s" }}
          />

          {/* Axis label */}
          <text
            x="0"
            y="113"
            fontSize="7"
            fill={C.subtle}
            fontFamily="Carlito,sans-serif"
          >
            Start
          </text>
        </svg>
      </div>

      <div
        style={{
          marginTop: 12,
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 11,
          color: C.subtle,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              display: "inline-block",
              width: 24,
              borderTop: "2px dashed rgba(244,244,244,0.2)",
            }}
          />
          Before
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="24" height="4" viewBox="0 0 24 4">
            <rect
              x="0"
              y="0"
              width="24"
              height="4"
              rx="2"
              fill="url(#legendGradDark)"
            />
          </svg>
          After PureFacts
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   RPA OUTCOME TILE (dark)
───────────────────────────────────────────────────────────── */
function RpaTile({
  icon,
  label,
  tooltip,
}: {
  icon: string;
  label: string;
  tooltip: string;
}) {
  const { isMobile } = useBreakpoint();
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        position: "relative",
        padding: 2,
        background: open ? C.sunset : C.border,
        cursor: "pointer",
        transition: "background 0.2s",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((o) => !o)}
      role="button"
      aria-label={`${label}: ${tooltip}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setOpen((o) => !o);
      }}
    >
      <div
        style={{
          background: C.surface,
          padding: "14px 8px",
          textAlign: "center" as const,
        }}
      >
        <i
          className={`fa-solid ${icon}`}
          style={{
            fontSize: 16,
            display: "block",
            marginBottom: 6,
            color: C.azure,
          }}
          aria-hidden="true"
        />
        <p style={{ fontSize: 11, fontWeight: 600, color: C.text, margin: 0 }}>
          {label}
        </p>
      </div>
      {open && (
        <div
          style={{
            position: isMobile ? "relative" : "absolute",
            bottom: isMobile ? "auto" : "100%",
            left: isMobile ? "auto" : "50%",
            transform: isMobile ? "none" : "translateX(-50%)",
            marginTop: isMobile ? 8 : 0,
            marginBottom: isMobile ? 0 : 8,
            width: isMobile ? "100%" : 176,
            background: C.surface,
            border: `1px solid ${C.border}`,
            padding: 10,
            zIndex: 50,
          }}
        >
          <p
            style={{ fontSize: 11, color: C.body, lineHeight: 1.55, margin: 0 }}
          >
            {tooltip}
          </p>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "100%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: `6px solid ${C.border}`,
            }}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   BRIDGE SENTENCE
───────────────────────────────────────────────────────────── */
function Bridge({ children }: { children: React.ReactNode }) {
  const { isMobile } = useBreakpoint();
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVis(true);
      },
      { threshold: 0.5 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: isMobile ? "24px 20px" : "36px 24px",
        textAlign: "center",
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
    >
      <p
        style={{
          fontSize: isMobile ? 19 : 24,
          fontStyle: "normal",
          fontWeight: 600,
          color: C.body,
          lineHeight: 1.45,
          margin: 0,
        }}
      >
        {children}
      </p>
      <div
        style={{
          height: 1,
          maxWidth: 260,
          margin: "18px auto 0",
          background:
            "linear-gradient(90deg, transparent, rgba(59,132,255,0.5), transparent)",
        }}
        aria-hidden="true"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP DIVIDER
───────────────────────────────────────────────────────────── */
function StepDivider() {
  return (
    <div
      style={{
        height: 1,
        background: `linear-gradient(90deg, transparent, ${C.border}, transparent)`,
        margin: "0 0",
      }}
      aria-hidden="true"
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
export function OurProcessClient() {
  const { isMobile, isTablet } = useBreakpoint();
  const sectionPad = isMobile ? "56px 0" : "90px 0";
  const innerPad = isMobile ? "0 20px" : isTablet ? "0 32px" : "0 48px";
  const stepGrid = isTablet ? "1fr" : "repeat(2, minmax(0, 1fr))";
  const stepGap = isMobile ? "28px" : isTablet ? "40px" : "80px";
  const heroPad = isMobile
    ? "56px 20px 48px"
    : isTablet
      ? "80px 32px 64px"
      : "90px 48px 72px";
  const stepIds = ["step-1", "step-2", "step-3", "step-4"];
  const active = useActiveStep(stepIds);

  const [rpaVisible, setRpaVisible] = useState(false);
  const [bnaVisible, setBnaVisible] = useState(false);
  const [trendVisible, setTrendVisible] = useState(false);
  const [fragVisible, setFragVisible] = useState(false);

  const STEP_COLORS = [C.azure, C.mandarin, C.honey, `rgba(244,244,244,0.65)`];

  return (
    <div
      style={{
        fontFamily: "'Carlito', 'Segoe UI', sans-serif",
        background: C.bg,
        overflowX: "hidden",
      }}
    >
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        section { max-width: 100%; }
        h1, h2, h3, p, span { overflow-wrap: anywhere; }
        canvas, svg { max-width: 100%; }
        .op-blockquote { border-left: 4px solid ${C.azure}; padding-left: 20px; margin: 24px 0 0; }
        .op-tag { display: inline-flex; align-items: 'center'; padding: '4px 12px'; font-size: 11px; font-weight: 600; border: 1px solid ${C.border}; color: ${C.body}; }
        .op-cta-row { display: flex; gap: 18px; align-items: baseline; padding: 18px 0; }
        @media (max-width: 639px) { .op-cta-row { gap: 14px; } .op-blockquote { padding-left: 16px; } }
        .op-cta-row:last-child { border-bottom: none; }
      `}</style>

      <StickyProgress active={active} />

      {/* ══════════════════════════════════
          1. HERO
      ══════════════════════════════════ */}
      <section
        style={{
          background: C.bg,
          position: "relative",
          overflow: "hidden",
          minHeight: isMobile
            ? "auto"
            : "calc(82dvh - var(--nav-height, 64px))",
          display: "flex",
          alignItems: "center",
        }}
        aria-label="Our Process hero"
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "5%",
            left: "0%",
            width: 600,
            height: 500,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse, rgba(59,132,255,0.07) 0%, transparent 62%)",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 120,
            pointerEvents: "none",
            background: `linear-gradient(to bottom, transparent, ${C.bg})`,
          }}
        />

        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: heroPad,
            width: "100%",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: stepGrid,
              gap: isMobile ? "28px" : "clamp(3rem,6vw,6rem)",
              alignItems: "center",
            }}
          >
            <div style={{ maxWidth: 560 }}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.20em",
                  color: C.azure,
                  margin: "0 0 14px",
                }}
              >
                Our Process
              </p>
              <h1
                style={{
                  fontSize: "clamp(2.25rem,5vw,4rem)",
                  fontWeight: 700,
                  color: C.text,
                  lineHeight: 1.05,
                  letterSpacing: "-0.028em",
                  margin: "0 0 24px",
                }}
              >
                We Start By Learning{" "}
                <span style={{ color: C.azure }}>Your Story</span>
              </h1>
              <p
                style={{
                  fontSize: 18,
                  color: C.body,
                  lineHeight: 1.75,
                  margin: "0 0 36px",
                  maxWidth: 500,
                }}
              >
                Every firm has a story behind the numbers. PureFacts starts by
                understanding that story before recommending anything.
              </p>
              <div
                style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}
              >
                <Link href="/contact" className="btn-primary">
                  Start the conversation
                </Link>
              </div>
            </div>
            {!isMobile && (
              <div
                style={{
                  minHeight: 380,
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                <HeroCanvas />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          OPENING STATEMENT
      ══════════════════════════════════ */}
      <section
        style={{
          background: C.bg,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
        }}
        aria-label="Our approach"
      >
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: isMobile ? "48px 20px" : "72px 48px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "clamp(1.1rem,2vw,1.35rem)",
              lineHeight: 1.75,
              color: C.body,
              margin: 0,
            }}
          >
            We do not begin with a canned demo or a generic pitch.
          </p>
          <p
            style={{
              fontSize: "clamp(1.1rem,2vw,1.35rem)",
              lineHeight: 1.75,
              fontWeight: 700,
              color: C.azure,
              margin: "6px 0",
            }}
          >
            We begin with discovery.
          </p>
          <p
            style={{
              fontSize: "clamp(1.1rem,2vw,1.35rem)",
              lineHeight: 1.75,
              color: C.body,
              margin: 0,
            }}
          >
            Listening closely, asking the right questions, and mapping the
            reality of how revenue actually moves through your organization
            today.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════
          FOUR STEPS
      ══════════════════════════════════ */}
      <section
        style={{ background: C.bg, position: "relative" }}
        aria-label="Our four-step process"
      >
        {/* Background glows per section */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "8%",
            right: "0%",
            width: 500,
            height: 400,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 60%)",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "32%",
            left: "0%",
            width: 500,
            height: 400,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse, rgba(251,86,7,0.05) 0%, transparent 60%)",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "56%",
            right: "0%",
            width: 500,
            height: 400,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse, rgba(255,179,12,0.04) 0%, transparent 60%)",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "78%",
            left: "0%",
            width: 500,
            height: 400,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse, rgba(59,132,255,0.05) 0%, transparent 60%)",
          }}
        />

        <div style={{ maxWidth: 1024, margin: "0 auto", padding: innerPad }}>
          {/* STEP 1 — DISCOVERY */}
          <AnimatedStep id="step-1" onVisible={() => setFragVisible(true)}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: stepGrid,
                gap: stepGap,
                padding: sectionPad,
                alignItems: "center",
              }}
            >
              <div>
                <StepNode
                  n="1"
                  eyebrow="Where it starts"
                  title="Discovery"
                  color={STEP_COLORS[0]}
                />
                <p
                  style={{
                    fontSize: 16,
                    color: C.body,
                    lineHeight: 1.75,
                    margin: "0 0 14px",
                  }}
                >
                  Most revenue operations problems live in the gap between how a
                  process was designed and how it runs. Manual checks have
                  become routine. Reconciliations happen every quarter not
                  because the system requires them, but because someone learned
                  they had to.
                </p>
                <p
                  style={{
                    fontSize: 16,
                    color: C.body,
                    lineHeight: 1.75,
                    margin: 0,
                  }}
                >
                  We map the reality of your billing, compensation, reporting,
                  and collection workflows. We look for the workarounds, the
                  heroics, and the friction that has quietly become the
                  operating model.
                </p>
                <div className="op-blockquote">
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: C.text,
                      margin: 0,
                    }}
                  >
                    The goal is not to sell a predetermined answer. The goal is
                    to understand the challenge well enough to define the right
                    one.
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <FragmentationVisual visible={fragVisible} />
              </div>
            </div>
          </AnimatedStep>

          <StepDivider />
          <Bridge>
            <span style={{ color: C.text, fontWeight: 800 }}>Discovery</span>{" "}
            gives us the map.{" "}
            <span style={{ color: C.mandarin, fontWeight: 800 }}>The RPA</span>
            {" "}gives us the numbers.
          </Bridge>
          <StepDivider />

          {/* STEP 2 — RPA */}
          <AnimatedStep id="step-2" onVisible={() => setRpaVisible(true)}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: stepGrid,
                gap: stepGap,
                padding: sectionPad,
                alignItems: "center",
              }}
            >
              <div style={{ order: isTablet ? 1 : 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <RpaAccordion visible={rpaVisible} />
                </div>
              </div>
              <div style={{ order: 0, minWidth: 0 }}>
                <StepNode
                  n="2"
                  eyebrow="Examine your revenue"
                  title="Revenue Performance Assessment"
                  color={STEP_COLORS[1]}
                />
                <p
                  style={{
                    fontSize: 16,
                    color: C.body,
                    lineHeight: 1.75,
                    margin: "0 0 14px",
                  }}
                >
                  The RPA is a free, structured examination of how revenue is
                  managed today. We work with the people closest to the process
                  to surface the manual interventions, exception handling, and
                  operational heroics that keep revenue moving despite the
                  limitations of the current environment.
                </p>
                <p
                  style={{
                    fontSize: 16,
                    color: C.body,
                    lineHeight: 1.75,
                    margin: "0 0 24px",
                  }}
                >
                  Firms leave the RPA with a better understanding of where
                  performance can improve and whether there is enough
                  opportunity to justify moving forward.
                </p>

              </div>
            </div>
          </AnimatedStep>

          <StepDivider />
          <Bridge>
            The RPA tells you what is happening.<br/>
            <span style={{ color: C.honey, fontWeight: 800 }}>The BNA</span>
            {" "}tells you what it is worth to fix.
          </Bridge>
          <StepDivider />

          {/* STEP 3 — BNA */}
          <AnimatedStep id="step-3" onVisible={() => setBnaVisible(true)}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: stepGrid,
                gap: stepGap,
                padding: sectionPad,
                alignItems: "center",
              }}
            >
              <div>
                <StepNode
                  n="3"
                  eyebrow="Going deeper"
                  title="Business Needs Analysis"
                  color={STEP_COLORS[2]}
                />
                <p
                  style={{
                    fontSize: 16,
                    color: C.body,
                    lineHeight: 1.75,
                    margin: "0 0 14px",
                  }}
                >
                  The BNA goes beyond identifying issues. It quantifies the
                  impact of solving them, defines what the future state looks
                  like, outlines how a project would be structured, and what
                  outcomes the firm can reasonably expect.
                </p>
                <div
                  className="op-blockquote"
                  style={{ borderLeftColor: C.honey }}
                >
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: C.text,
                      margin: 0,
                    }}
                  >
                    By the end of the BNA, the client has more than a
                    recommendation. They have a clearer view of the economics,
                    timing, implementation effort, and practical next steps
                    required to improve how revenue is managed with confidence.
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <BNAComparison visible={bnaVisible} />
              </div>
            </div>
          </AnimatedStep>

          <StepDivider />
          <Bridge>
            The process is designed to deliver{" "}
            <span style={{ color: C.text, fontWeight: 800 }}>value at every step</span>
          </Bridge>
          <StepDivider />

          {/* STEP 4 — VALUE */}
          <AnimatedStep id="step-4" onVisible={() => setTrendVisible(true)}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: stepGrid,
                gap: stepGap,
                padding: sectionPad,
                alignItems: "center",
              }}
            >
              <div style={{ order: isTablet ? 1 : 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <TrendChart visible={trendVisible} />
                </div>
              </div>
              <div style={{ order: 0, minWidth: 0 }}>
                <StepNode
                  n="4"
                  eyebrow="Always on"
                  title="Value At Every Step"
                  color={`rgba(244,244,244,0.7)`}
                />
                <p
                  style={{
                    fontSize: 16,
                    color: C.body,
                    lineHeight: 1.75,
                    margin: "0 0 14px",
                  }}
                >
                  This process is designed to be useful even before a decision
                  is made. The discovery work gives leadership and operations
                  teams a more complete understanding of the current state, the
                  hidden cost of workarounds, and the practical levers
                  available.
                </p>
                <p
                  style={{
                    fontSize: 16,
                    color: C.body,
                    lineHeight: 1.75,
                    margin: "0 0 24px",
                  }}
                >
                  Over 15 years, PureFacts has learned how to deliver this kind
                  of value at scale. We know where to look for hidden friction,
                  and how to help firms build a practical path from operational
                  strain to a stronger, more scalable revenue model.
                </p>
                <div
                  style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}
                >
                  {[
                    "Free to start",
                    "Collaborative by design",
                    "Revenue Clarity",
                  ].map((tag) => (
                    <span
                      key={tag}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "4px 12px",
                        fontSize: 11,
                        fontWeight: 600,
                        border: `1px solid ${C.border}`,
                        color: C.body,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedStep>
        </div>
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, transparent, ${C.border}, transparent)`,
          }}
          aria-hidden="true"
        />
      </section>

      {/* ══════════════════════════════════
          FINAL CTA
      ══════════════════════════════════ */}
      <section
        style={{
          background: C.bg,
          position: "relative",
          overflow: "hidden",
          padding: isMobile ? "44px 0 24px" : sectionPad,
        }}
        aria-label="Call to action"
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "0%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 1000,
            height: 600,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse, rgba(59,132,255,0.07) 0%, transparent 60%)",
          }}
        />

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: innerPad }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: stepGrid,
              gap: stepGap,
              alignItems: "center",
            }}
          >
            <div>
              {[
                {
                  icon: "fa-magnifying-glass",
                  color: C.azure,
                  title: "Free to Start",
                  desc: "The Revenue Performance Assessment costs nothing. Firms leave with a clearer picture of where performance can improve, before any commitment is made.",
                },
                {
                  icon: "fa-people-group",
                  color: C.mandarin,
                  title: "Collaborative by Design",
                  desc: "We work with the people closest to the process, not around them. Discovery, alignment, and scoping happen together, not in a black box.",
                },
                {
                  icon: "fa-chart-line",
                  color: C.honey,
                  title: "Value at Every Step",
                  desc: "Even before a decision is made, the process gives leadership a more complete view of hidden costs, workarounds, and the practical levers available.",
                },
              ].map((item, i) => (
                <div key={item.title} className="op-cta-row">
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <i
                      className={`fa-solid ${item.icon}`}
                      style={{ color: item.color, fontSize: 17 }}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: C.text,
                        margin: 0,
                        lineHeight: 1,
                      }}
                    >
                      {item.title}
                    </p>
                    <p
                      style={{
                        marginTop: 6,
                        fontSize: 15,
                        color: C.body,
                        lineHeight: 1.72,
                        margin: "6px 0 0",
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h2
                style={{
                  fontSize: "clamp(1.8rem,3vw,2.6rem)",
                  fontWeight: 700,
                  color: C.text,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.18,
                  margin: 0,
                }}
              >
                Get A Clear View Of What Is Really{" "}
                <GradientText>
                  Going On Inside Your Revenue Operation.
                </GradientText>
              </h2>
              <p
                style={{
                  marginTop: 18,
                  fontSize: 16,
                  color: C.body,
                  lineHeight: 1.75,
                }}
              >
                PureFacts helps firms uncover the hfidden effort behind billing,
                compensation, and collection, then define a practical path to
                improve it. The conversation is free. The clarity is real.
              </p>
              <div style={{ marginTop: 30 }}>
                <Link href="/contact" className="btn-primary">
                  Start the conversation
                </Link>
              </div>
              <p style={{ marginTop: isMobile ? 10 : 16, marginBottom: 0, fontSize: 13, color: C.subtle }}>
                Trusted by the top global financial firms
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
