"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";


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

const C = {
  bg: "#140f0c",
  surface: "#1a1410",
  azure: "#3b84ff",
  mandarin: "#fb5607",
  honey: "#FACC22",
  cyan: "#0DCCFF",
  indigo: "#4760FF",
  muted: "rgba(244,244,244,0.55)",
  border: "rgba(255,255,255,0.07)",
};

// ─── Foundation visual (Row 3 right) ─────────────────────────────────────────

const LEFT_NODES = [
  { label: "Custodians",           sub: "Holdings & transactions"  },
  { label: "Portfolio Management", sub: "AUM, accounts, positions" },
  { label: "CRM",                  sub: "Client & advisor data"    },
  { label: "Trading Platform",     sub: "Order & execution data"   },
];
const RIGHT_NODES = [
  { label: "Accounting Systems",   sub: "GL, reconciliation"       },
  { label: "Billing Systems",      sub: "Invoicing & collections"  },
  { label: "Compensation Systems", sub: "Payout structures"        },
  { label: "Customer Data Lakes",  sub: "Enterprise data sources"  },
];

function FoundationVisual({ visible }: { visible: boolean }) {
  const { isMobile } = useBreakpoint();
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 600, h: 420 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(e => {
      setSize({ w: e[0].contentRect.width, h: e[0].contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w } = size;
  const NODE_W = isMobile ? 128 : 170, NODE_H = isMobile ? 40 : 44;
  const LEFT_X = isMobile ? 8 : 30, RIGHT_X = w - (isMobile ? 8 : 30) - NODE_W;
  const NODE_TOPS = isMobile ? [80, 142, 204, 266] : [90, 160, 230, 300];
  const HUB_R = isMobile ? 48 : 65;
  const cx = w / 2;
  const cy = (NODE_TOPS[0] + NODE_TOPS[3] + NODE_H) / 2;

  const leftConns  = NODE_TOPS.map(top => ({ fromX: LEFT_X + NODE_W, fromY: top + NODE_H / 2 }));
  const rightConns = NODE_TOPS.map(top => ({ fromX: RIGHT_X,         fromY: top + NODE_H / 2 }));

  function hubEntry(fromX: number, fromY: number) {
    const dx = cx - fromX, dy = cy - fromY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return {
      x: cx - (dx / dist) * HUB_R,
      y: cy - (dy / dist) * HUB_R,
      angle: Math.atan2(fromY - cy, fromX - cx),
    };
  }

  function nodePath(fromX: number, fromY: number) {
    const entry = hubEntry(fromX, fromY);
    const midX = (fromX + cx) / 2;
    return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${entry.y}, ${entry.x} ${entry.y}`;
  }

  const circleCircumference = 2 * Math.PI * HUB_R;
  const arcLen = circleCircumference * 0.18;

  const arcSeeds = [...leftConns, ...rightConns].map((conn, i) => {
    const entry = hubEntry(conn.fromX, conn.fromY);
    return {
      startAngleDeg: (entry.angle * 180 / Math.PI + 360) % 360,
      delay: 0.6 + i * 0.18,
    };
  });

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      <div style={{
        position: "absolute",
        left: cx - HUB_R * 2.2, top: cy - HUB_R * 2.2,
        width: HUB_R * 4.4, height: HUB_R * 4.4,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,132,255,0.15) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        {leftConns.map((conn, i) => (
          <motion.path key={`l${i}`} d={nodePath(conn.fromX, conn.fromY)}
            fill="none" stroke={C.azure} strokeWidth="1" strokeOpacity="0.3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={visible ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.4 + i * 0.1, ease: "easeOut" }}
          />
        ))}
        {rightConns.map((conn, i) => (
          <motion.path key={`r${i}`} d={nodePath(conn.fromX, conn.fromY)}
            fill="none" stroke={C.azure} strokeWidth="1" strokeOpacity="0.3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={visible ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.5 + i * 0.1, ease: "easeOut" }}
          />
        ))}

        {visible && leftConns.map((conn, i) => (
          <motion.circle key={`lp${i}`} r="2.5" fill={C.azure} opacity="0.8">
            <animateMotion dur={`${1.6 + i * 0.25}s`} repeatCount="indefinite" begin={`${i * 0.45}s`} path={nodePath(conn.fromX, conn.fromY)} />
          </motion.circle>
        ))}
        {visible && rightConns.map((conn, i) => (
          <motion.circle key={`rp${i}`} r="2.5" fill={C.azure} opacity="0.8">
            <animateMotion dur={`${1.6 + i * 0.25}s`} repeatCount="indefinite" begin={`${i * 0.45 + 0.3}s`} path={nodePath(conn.fromX, conn.fromY)} />
          </motion.circle>
        ))}

        {visible && (
          <circle cx={cx} cy={cy} r={HUB_R} fill="none" stroke="rgba(59,132,255,0.18)" strokeWidth="1.5" />
        )}

        {arcSeeds.map((arc, i) => (
          <motion.circle
            key={`arc${i}`}
            cx={cx} cy={cy} r={HUB_R}
            fill="none"
            stroke={C.azure}
            strokeWidth="2"
            strokeDasharray={`${arcLen} ${circleCircumference - arcLen}`}
            strokeLinecap="round"
            style={{ rotate: arc.startAngleDeg, transformOrigin: `${cx}px ${cy}px` }}
            initial={{ opacity: 0, strokeDashoffset: 0 }}
            animate={visible ? {
              opacity: [0, 0.75, 0.55, 0],
              strokeDashoffset: [0, -circleCircumference * 0.35],
            } : { opacity: 0 }}
            transition={{
              duration: 1.4,
              delay: arc.delay,
              ease: "easeOut",
              opacity: { times: [0, 0.08, 0.6, 1] },
            }}
          />
        ))}
      </svg>

      {LEFT_NODES.map((node, i) => (
        <motion.div key={node.label}
          initial={{ opacity: 0, x: -16 }}
          animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
          transition={{ duration: 0.45, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute", left: LEFT_X, top: NODE_TOPS[i],
            width: NODE_W, height: NODE_H,
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "#f4f4f4", textAlign: "center", padding: "0 10px" }}>{node.label}</span>
        </motion.div>
      ))}

      {RIGHT_NODES.map((node, i) => (
        <motion.div key={node.label}
          initial={{ opacity: 0, x: 16 }}
          animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: 16 }}
          transition={{ duration: 0.45, delay: 0.12 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute", left: RIGHT_X, top: NODE_TOPS[i],
            width: NODE_W, height: NODE_H,
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "#f4f4f4", textAlign: "center", padding: "0 10px" }}>{node.label}</span>
        </motion.div>
      ))}

      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={visible ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute", left: cx - HUB_R, top: cy - HUB_R,
          width: HUB_R * 2, height: HUB_R * 2,
          borderRadius: "50%",
          border: `1.5px solid rgba(59,132,255,0.45)`,
          background: `radial-gradient(circle at 40% 35%, rgba(59,132,255,0.18), rgba(59,132,255,0.05))`,
          backdropFilter: "blur(12px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          zIndex: 5,
        }}
      >
        <span style={{ fontSize: isMobile ? 11 : 13, fontWeight: 600, color: "#f4f4f4", lineHeight: 1.35, textAlign: "center", padding: "0 10px" }}>
          Revenue Book<br />of Record
        </span>
      </motion.div>
    </div>
  );
}

// ─── Platform Diagram (Row 1 right) ──────────────────────────────────────────

const DIAGRAM_WEDGES = [
  {
    id: "practice",
    label: "Practice Management",
    startAngle: -60, endAngle: 60,
    fill: "none", stroke: "#ffb30c",
    faUnicode: "\uf201",
  },
  {
    id: "comp",
    label: "Compensation",
    startAngle: 60, endAngle: 180,
    fill: "none", stroke: "#FF006E",
    faUnicode: "\uf51e",
  },
  {
    id: "fees",
    label: "Fees & Billing",
    startAngle: 180, endAngle: 300,
    fill: "none", stroke: "#ED65D0",
    faUnicode: "\uf571",
  },
];

function diagramPolarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function diagramWedgePath(cx: number, cy: number, outerR: number, innerR: number, s: number, e: number) {
  const o1 = diagramPolarToXY(cx, cy, outerR, s), o2 = diagramPolarToXY(cx, cy, outerR, e);
  const i2 = diagramPolarToXY(cx, cy, innerR, e), i1 = diagramPolarToXY(cx, cy, innerR, s);
  const lg = e - s > 180 ? 1 : 0;
  return `M${o1.x} ${o1.y} A${outerR} ${outerR} 0 ${lg} 1 ${o2.x} ${o2.y} L${i2.x} ${i2.y} A${innerR} ${innerR} 0 ${lg} 0 ${i1.x} ${i1.y}Z`;
}

function PlatformDiagram({ visible }: { visible: boolean }) {
  const { isMobile } = useBreakpoint();
  const VB = 200;
  const CX = 100, CY = 100;
  const INNER = 43;
  const OUTER = 84;
  const WEDGE_INNER = INNER + 2;
  const LABEL_R = OUTER + 18;
  const HUB_R = INNER;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "visible", padding: isMobile ? "20px 24px" : 0 }}>
      <div style={{
        position: "absolute",
        width: "min(260px, 70%)", aspectRatio: "1",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,132,255,0.13) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", width: isMobile ? "min(190px, 62vw)" : "min(340px, 88%)", aspectRatio: "1" }}>
        <svg viewBox={`0 0 ${VB} ${VB}`} style={{ width: "100%", height: "100%", overflow: "visible" }}>
          <defs>
            <radialGradient id="hub-grad-platform" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="rgba(59,132,255,0.20)" />
              <stop offset="100%" stopColor="rgba(59,132,255,0.05)" />
            </radialGradient>
          </defs>

          {DIAGRAM_WEDGES.map((w, wi) => {
            const path = diagramWedgePath(CX, CY, OUTER, WEDGE_INNER, w.startAngle, w.endAngle);
            const mid = (w.startAngle + w.endAngle) / 2;
            const iconPt = diagramPolarToXY(CX, CY, (OUTER + WEDGE_INNER) / 2, mid);
            const labelPt = diagramPolarToXY(CX, CY, LABEL_R, mid);
            const textAnchor = labelPt.x < CX - 5 ? "end" : labelPt.x > CX + 5 ? "start" : "middle";
            const words = w.label.split(" ");
            const half = Math.ceil(words.length / 2);

            return (
              <g key={w.id}>
                <motion.path
                  d={path}
                  fill={w.fill} stroke={w.stroke} strokeWidth="1.5"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.88 }}
                  style={{ transformOrigin: `${CX}px ${CY}px` }}
                  transition={{ duration: 0.55, delay: visible ? wi * 0.18 : 0, ease: [0.16, 1, 0.3, 1] }}
                />
                <motion.text
                  x={iconPt.x} y={iconPt.y}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="13" fontWeight="900"
                  fontFamily="'Font Awesome 6 Free', 'Font Awesome 6 Pro', 'Font Awesome 5 Free'"
                  fill={w.stroke}
                  initial={{ opacity: 0 }}
                  animate={visible ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.4, delay: visible ? wi * 0.18 + 0.18 : 0 }}
                >
                  {w.faUnicode}
                </motion.text>
                <motion.text
                  x={labelPt.x} y={labelPt.y}
                  textAnchor={textAnchor} dominantBaseline="middle"
                  fontSize="8.5" fontWeight="700" fill={w.stroke}
                  style={{ letterSpacing: "0.02em" }}
                  initial={{ opacity: 0 }}
                  animate={visible ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.4, delay: visible ? wi * 0.18 + 0.30 : 0 }}
                >
                  {words.length > 1 ? (
                    <>
                      <tspan x={labelPt.x} dy="-0.6em">{words.slice(0, half).join(" ")}</tspan>
                      <tspan x={labelPt.x} dy="1.3em">{words.slice(half).join(" ")}</tspan>
                    </>
                  ) : w.label}
                </motion.text>
              </g>
            );
          })}

          <circle cx={CX} cy={CY} r={HUB_R + 2} fill="#140f0c" />
          <circle cx={CX} cy={CY} r={HUB_R} fill="none" stroke="rgba(59,132,255,0.18)" strokeWidth="1.5" />

          <motion.circle
            cx={CX} cy={CY} r={HUB_R}
            fill="url(#hub-grad-platform)"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={visible ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          />

          <circle cx={CX} cy={CY} r={HUB_R} fill="none" stroke="rgba(59,132,255,0.45)" strokeWidth="1.5" />

          <motion.text
            x={CX} y={CY}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fontWeight="600" fill="#f4f4f4"
            style={{ letterSpacing: "0.02em" }}
            initial={{ opacity: 0 }}
            animate={visible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.38 }}
          >
            <tspan x={CX} dy="-5">Revenue Book</tspan>
            <tspan x={CX} dy="11">of Record</tspan>
          </motion.text>
        </svg>
      </div>
    </div>
  );
}

// ─── Module cards (Row 2) ─────────────────────────────────────────────────────

const MODULES = [
  {
    id: "practice",
    name: "Practice Management",
    tagline: "Revenue Intelligence",
    color: "#ffb30c",
    colorMuted: "rgba(255,179,12,0.1)",
    border: "rgba(255,179,12,0.3)",
    href: "/platform/practice-management/",
    points: [
      "Unified revenue visibility",
      "Advisor and practice insights",
      "Identify growth opportunities",
    ],
    stat: { value: "Real-time", label: "performance data" },
  },
  {
    id: "comp",
    name: "Compensation",
    tagline: "Advisor Compensation",
    color: "#FF006E",
    colorMuted: "rgba(255,0,110,0.1)",
    border: "rgba(255,0,110,0.3)",
    href: "/platform/compensation/",
    points: [
      "Aligned with firm strategy",
      "Incentive and governance controls",
      "Transparency for advisor trust",
    ],
    stat: { value: "100%", label: "payout accuracy" },
  },
  {
    id: "fees",
    name: "Fees & Billing",
    tagline: "Fee Management",
    color: "#ED65D0",
    colorMuted: "rgba(237,101,208,0.1)",
    border: "rgba(237,101,208,0.3)",
    href: "/platform/fees-and-billing/",
    points: [
      "Complex fee schedule management",
      "Automated billing runs at scale",
      "Zero tolerance for errors",
    ],
    stat: { value: "2-5%", label: "of revenue captured annually" },
  },
];

function ModuleCard({ mod, index, visible, isMobile }: { mod: typeof MODULES[0]; index: number; visible: boolean; isMobile: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ flex: 1, position: "relative" }}
    >
      {/* Full-box link */}
      <Link
        href={mod.href}
        style={{
          display: "flex",
          flexDirection: "column",
          padding: isMobile ? "22px 20px 20px" : "28px 28px 24px",
          border: `1px solid ${hovered ? mod.border : mod.border}`,
          background: hovered ? mod.colorMuted : C.surface,
          borderRadius: 12,
          textDecoration: "none",
          transition: "border-color 0.2s, background 0.2s",
          cursor: "pointer",
          overflow: "hidden",
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: mod.color, marginBottom: 5 }}>
            {mod.tagline}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#f4f4f4", letterSpacing: "-0.02em" }}>
            {mod.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
          {mod.points.map((pt, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: mod.color, flexShrink: 0 }} />
              <span style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.6 }}>{pt}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: isMobile ? 20 : 26, fontWeight: 700, color: mod.color, letterSpacing: "-0.03em", lineHeight: 1 }}>{mod.stat.value}</span>
          <span style={{ fontSize: 13, color: C.muted }}>{mod.stat.label}</span>
        </div>

        <div style={{
          marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 13, fontWeight: 600, color: mod.color,
          opacity: hovered ? 1 : 0.7, transition: "opacity 0.2s",
        }}>
          Explore {mod.name}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke={mod.color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── RBoR inline link ─────────────────────────────────────────────────────────

function RboRLink() {
  const [hovered, setHovered] = useState(false);
  const color = hovered ? "#7aaeff" : "#3b84ff";
  return (
    <Link
      href="/platform/revenue-book-of-record"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: 13, fontWeight: 700,
        color,
        textDecoration: "none",
        transition: "color 0.2s",
      }}
    >
      Learn about the Revenue Book of Record
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </Link>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PlatformSection() {
  const { isMobile, isTablet } = useBreakpoint();
  const sectionPad = isMobile ? "64px 0" : "80px 0 100px";
  const innerPad = isMobile ? "0 20px" : isTablet ? "0 32px" : "0 48px";
  const textPad = isMobile ? "32px 20px" : isTablet ? "40px 28px" : "52px 48px";
  const cols = isTablet ? "1fr" : "1fr 1fr";
  const visualMinHeight = isMobile ? 320 : 420;
  const rowGap = isMobile ? 0 : 2;
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const row3Ref = useRef<HTMLDivElement>(null);
  const row1Visible = useInView(row1Ref, { once: true, margin: "-120px 0px -120px 0px" });
  const row2Visible = useInView(row2Ref, { once: true, margin: "-120px 0px -120px 0px" });
  const row3Visible = useInView(row3Ref, { once: true, margin: "-120px 0px -120px 0px" });

  return (
    <section style={{ background: C.bg, fontFamily: "'Carlito','Segoe UI',sans-serif", padding: sectionPad }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: innerPad }}>

        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: isMobile ? 40 : 64 }}
        >
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: "#f4f4f4", lineHeight: 1.15, letterSpacing: "-0.03em", margin: 0, maxWidth: 640 }}>
            One platform.<br /><span style={{ color: C.azure }}>One growth foundation.</span>
          </h2>
        </motion.div>

        {/* ── Row 1: The Platform ───────────────────────────────────────────── */}
        <div ref={row1Ref} style={{
          display: "grid", gridTemplateColumns: isMobile ? "1fr" : cols,
          marginBottom: rowGap, borderRadius: "12px 12px 0 0",
          overflow: "hidden", border: `1px solid ${C.border}`,
        }}>
          <div style={{ padding: textPad, background: C.surface, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={row1Visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.azure, marginBottom: 14 }}>
                The Platform
              </div>
              <h3 style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", fontWeight: 700, color: "#f4f4f4", lineHeight: 1.2, letterSpacing: "-0.025em", margin: "0 0 16px" }}>
                Three modules. One operating system.
              </h3>
              <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, margin: 0, maxWidth: 400 }}>
                Practice Management, Compensation, and Fees &amp; Billing sit on top of the Revenue Book of Record, each pulling from the same data, eliminating reconciliation gaps and giving leaders a single, consistent view of revenue performance.
              </p>
              <Link href="/platform/" className="btn-primary" style={{ margin: "20px 0 0", maxWidth: 160 }}>
                Explore the Platform
              </Link>
            </motion.div>
          </div>
          <div style={{ background: C.bg, minHeight: isMobile ? 260 : visualMinHeight, display: "flex", alignItems: "center", justifyContent: "center", borderLeft: isTablet ? "none" : `1px solid ${C.border}`, borderTop: isTablet ? `1px solid ${C.border}` : "none", overflow: "visible" }}>
            <PlatformDiagram visible={row1Visible} />
          </div>
        </div>

        {/* ── Row 2: The Modules ────────────────────────────────────────────── */}
        <div ref={row2Ref} style={{ border: `1px solid ${C.border}`, borderTop: "none", overflow: "hidden", background: C.bg }}>
          <div style={{ padding: isMobile ? "28px 16px 0" : isTablet ? "40px 28px 0" : "40px 48px 0" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#3b84ff", marginBottom: 10 }}>
              The Modules
            </div>
            <h3 style={{ fontSize: "clamp(1.3rem, 2.2vw, 1.75rem)", fontWeight: 700, color: "#f4f4f4", lineHeight: 1.2, letterSpacing: "-0.025em", margin: 0 }}>
              Built for every dimension of revenue.
            </h3>
          </div>
          <div style={{ display: isTablet ? "grid" : "flex", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16, padding: isMobile ? "20px 14px 28px" : isTablet ? "28px" : "32px 48px 40px", flexWrap: "wrap" }}>
            {MODULES.map((mod, i) => (
              <ModuleCard key={mod.id} mod={mod} index={i} visible={row2Visible} isMobile={isMobile} />
            ))}
          </div>
          <div style={{ padding: isMobile ? "0 20px 32px" : isTablet ? "0 28px 40px" : "0 48px 48px" }}>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={row2Visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.45 }}
            >
            </motion.div>
          </div>
        </div>

        {/* ── Row 3: The Foundation ─────────────────────────────────────────── */}
        <div ref={row3Ref} style={{
          display: "grid", gridTemplateColumns: isMobile ? "1fr" : cols,
          marginTop: rowGap, borderRadius: "0 0 12px 12px",
          overflow: "hidden", border: `1px solid ${C.border}`, borderTop: "none",
        }}>
          <div style={{ padding: textPad, background: C.surface, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={row3Visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.azure, marginBottom: 14 }}>
                The Foundation
              </div>
              <h3 style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", fontWeight: 700, color: "#f4f4f4", lineHeight: 1.2, letterSpacing: "-0.025em", margin: "0 0 16px" }}>
                Revenue data, unified into your one source of truth.
              </h3>
              <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, margin: "0 0 28px", maxWidth: 400 }}>
                The Revenue Book of Record consolidates every client, account, contract, and pricing rule across your entire firm. Every downstream calculation, billing run, and payout flows from one authoritative, always-current foundation.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["Custodians, CRM, and portfolio data connected", "Contracts and pricing logic centralized", "Audit-ready at every stage"].map((pt, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={row3Visible ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.azure, flexShrink: 0 }} />
                    <span style={{ fontSize: 13.5, color: C.muted }}>{pt}</span>
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={row3Visible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.65 }}
                style={{ marginTop: 24 }}
              >
                <RboRLink />
              </motion.div>
            </motion.div>
          </div>
          {!isMobile && (
            <div style={{ background: C.bg, minHeight: visualMinHeight, display: "flex", alignItems: "stretch", borderLeft: isTablet ? "none" : `1px solid ${C.border}`, borderTop: isTablet ? `1px solid ${C.border}` : "none" }}>
              <FoundationVisual visible={row3Visible} />
            </div>
          )}
        </div>

      </div>
    </section>
  );
}