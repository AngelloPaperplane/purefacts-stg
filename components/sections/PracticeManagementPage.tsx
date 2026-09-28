"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PracticeManagementFAQSection from '@/components/faq/PracticeManagementFAQSection'

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:       "#140f0c",
  surface:  "#1a1410",
  azure:    "#3b84ff",
  mandarin: "#fb5607",
  honey:    "#ffb30c",
  text:     "#f4f4f4",
  muted:    "rgba(244,244,244,0.75)",
  subtle:   "rgba(244,244,244,0.45)",
  border:   "rgba(255,255,255,0.07)",
  borderHz: "rgba(255,179,12,0.28)",
};

const SUNSET = "linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%)";
const HONEY_GLOW = "rgba(255,179,12,0.08)";

// ─── useBreakpoint ─────────────────────────────────────────────────────────────
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

// ─── Shared: Eyebrow ──────────────────────────────────────────────────────────
function Eyebrow({ label, color = C.mandarin }: { label: string; color?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.20em" }}>{label}</span>
    </div>
  );
}

// ─── Shared: IllumHeading ─────────────────────────────────────────────────────
function IllumHeading({
  text, gradient, style, as: Tag = "h2", gradientColor = "honey",
}: {
  text: string; gradient?: [number, number]; style?: React.CSSProperties;
  as?: "h1" | "h2" | "h3"; gradientColor?: "honey" | "sunset";
}) {
  const ref = useRef<HTMLElement>(null);
  const [lit, setLit] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onScroll = () => { const r = el.getBoundingClientRect(); if (r.top < window.innerHeight * 0.8) setLit(true); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const words = text.split(" ");
  const content = words.map((w, i) => {
    const isHighlight = gradient && i >= gradient[0] && i < gradient[1];
    if (isHighlight && gradientColor === "sunset") return (
      <span key={i} style={{ background: lit ? SUNSET : "none", color: lit ? "transparent" : C.text, WebkitBackgroundClip: lit ? "text" : undefined, WebkitTextFillColor: lit ? "transparent" : C.text, backgroundClip: lit ? "text" : undefined, transition: "color 0.5s ease" }}>{w}{" "}</span>
    );
    if (isHighlight) return (
      <span key={i} style={{ color: lit ? C.honey : C.text, transition: "color 0.5s ease" }}>{w}{" "}</span>
    );
    return <span key={i} style={{ color: C.text }}>{w}{" "}</span>;
  });
  return <Tag ref={ref as React.RefObject<any>} style={style}>{content}</Tag>;
}

// ─── Hero canvas grid ─────────────────────────────────────────────────────────
function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let raf: number, t = 0;
    function resize() { canvas!.width = canvas!.parentElement!.offsetWidth; canvas!.height = canvas!.parentElement!.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(canvas.parentElement!);
    function draw() {
      const W = canvas!.width, H = canvas!.height; ctx!.clearRect(0, 0, W, H);
      const spacing = 44, a = Math.min(W, H) * 0.22;
      const lx = W / 2 + a * Math.cos(t) / (1 + Math.sin(t) ** 2);
      const ly = H / 2 + (a * Math.sin(t) * Math.cos(t)) / (1 + Math.sin(t) ** 2);
      const cols = Math.ceil(W / spacing) + 1, rows = Math.ceil(H / spacing) + 1;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const x = c * spacing, y = r * spacing, dist = Math.sqrt((x - lx) ** 2 + (y - ly) ** 2);
        const alpha = 0.03 + Math.max(0, 1 - dist / 280) * 0.22;
        ctx!.beginPath(); ctx!.arc(x, y, 1.1, 0, Math.PI * 2); ctx!.fillStyle = `rgba(255,179,12,${alpha * 0.4})`; ctx!.fill();
        ctx!.beginPath(); ctx!.arc(x, y, 1.1, 0, Math.PI * 2); ctx!.fillStyle = `rgba(59,132,255,${alpha * 0.7})`; ctx!.fill();
      }
      t += 0.008; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={ref} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

// ─── Hero Score Dashboard ─────────────────────────────────────────────────────
const SCORE_ITEMS = [
  { label: "Pricing Score",          value: 74, color: C.honey,    delta: "+6" },
  { label: "Value Score",            value: 61, color: C.azure,    delta: "+12" },
  { label: "Loyalty Score",          value: 88, color: "#22c55e",  delta: "-2" },
  { label: "Practice Effectiveness", value: 53, color: C.mandarin, delta: "+9" },
];

function ScoreDashboard() {
  const [bars, setBars] = useState(SCORE_ITEMS.map(() => 0));
  const [pulsing, setPulsing] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rootRef.current; if (!el) return;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const rafs: number[] = [];
    let cancelled = false;
    setBars(SCORE_ITEMS.map(() => 0)); setPulsing(null);
    const run = () => {
      SCORE_ITEMS.forEach((item, i) => {
        const t = setTimeout(() => {
          if (cancelled) return;
          let frame = 0;
          const go = () => {
            if (cancelled) return; frame++;
            setBars(prev => { const next = [...prev]; next[i] = Math.min(item.value, Math.round(item.value * (1 - (1 - frame / 40) ** 2))); return next; });
            if (frame < 40) { rafs.push(requestAnimationFrame(go)); }
            else { setPulsing(i); const pt = setTimeout(() => { if (!cancelled) setPulsing(null); }, 600); timeouts.push(pt); }
          };
          rafs.push(requestAnimationFrame(go));
        }, 300 + i * 220);
        timeouts.push(t);
      });
    };
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !cancelled) { obs.disconnect(); const st = setTimeout(run, 400); timeouts.push(st); } }, { threshold: 0.2 });
    obs.observe(el);
    return () => { cancelled = true; obs.disconnect(); timeouts.forEach(clearTimeout); rafs.forEach(cancelAnimationFrame); };
  }, []);
  return (
    <div ref={rootRef} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", height: "100%", position: "relative" }}>
      <div style={{ position: "absolute", top: "15%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${HONEY_GLOW} 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ width: "100%", maxWidth: 400, background: "rgba(26,20,16,0.88)", border: `1px solid rgba(255,179,12,0.15)`, backdropFilter: "blur(12px)", padding: "28px 28px 24px", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.honey, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 4 }}>Practice Intelligence</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Score Overview</div>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 3px rgba(34,197,94,0.2)" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {SCORE_ITEMS.map((item, i) => (
            <div key={item.label}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{item.label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: item.delta.startsWith("+") ? "#22c55e" : C.mandarin, opacity: bars[i] === item.value ? 1 : 0, transition: "opacity 0.4s" }}>{item.delta}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text, minWidth: 28, textAlign: "right", transition: "transform 0.15s", transform: pulsing === i ? "scale(1.15)" : "scale(1)" }}>{bars[i]}</span>
                </div>
              </div>
              <div style={{ height: 3, background: "rgba(255,255,255,0.07)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${bars[i]}%`, background: item.color, transition: "width 0.05s linear", boxShadow: pulsing === i ? `0 0 8px ${item.color}` : "none" }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, paddingTop: 18, borderTop: `1px solid rgba(255,255,255,0.07)`, display: "flex" }}>
          {[{ label: "Advisors", value: "847" }, { label: "Accounts", value: "12.4 K" }, { label: "Actions", value: "34" }].map((m, i) => (
            <div key={m.label} style={{ flex: 1, textAlign: "center", borderRight: i < 2 ? `1px solid rgba(255,255,255,0.07)` : "none" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text, letterSpacing: "-0.03em" }}>{m.value}</div>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 3 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section 1: Hero ──────────────────────────────────────────────────────────
function Hero() {
  const [mounted, setMounted] = useState(false);
  const { isMobile, isTablet } = useBreakpoint();
  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const pad  = isMobile ? "40px 20px 32px" : isTablet ? "56px 32px 40px" : "64px 48px 40px";
  const cols = isTablet ? "1fr" : "1fr 1fr";
  const gap  = isMobile ? "28px" : "80px";

  return (
    <section style={{ position: "relative", overflow: "hidden", background: C.bg, minHeight: isTablet ? "auto" : "72vh", display: "flex", alignItems: "center" }}>
      <HeroCanvas />
      <div style={{ position: "absolute", top: "-15%", right: "-8%", width: 700, height: 700, borderRadius: "50%", pointerEvents: "none", background: "radial-gradient(circle, rgba(255,179,12,0.09) 0%, transparent 60%)" }} aria-hidden="true" />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100, background: `linear-gradient(to bottom, transparent, ${C.bg})`, pointerEvents: "none" }} aria-hidden="true" />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: pad, width: "100%", display: "grid", gridTemplateColumns: cols, gap, alignItems: "center", position: "relative", zIndex: 2, boxSizing: "border-box" }}>
        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
          <Eyebrow label="Practice Management" color={C.honey} />
          <h1 style={{ fontSize: isMobile ? "clamp(1.75rem, 7vw, 2.5rem)" : "clamp(1.875rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.025em", color: C.text, maxWidth: 640, marginBottom: 24 }}>
            Pricing Intelligence For More{" "}<span style={{ color: C.honey }}>Profitable Advisor Decisions</span>
          </h1>
          <p style={{ fontSize: "1.0625rem", color: C.muted, lineHeight: 1.75, maxWidth: 520, marginBottom: 40 }}>
            PureFacts Practice Management helps wealth and asset management firms identify pricing gaps, reduce excessive discounting, and improve profitability through AI-powered insights connected to the Revenue Book of Record.
          </p>
          <Link href="/contact" className="btn-primary" style={{ border: `2px solid ${C.honey}`, boxSizing: "border-box" }}>Request a Demo</Link>
        </div>
        {/* Dashboard: below text on mobile, right column on desktop */}
        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateX(0)" : "translateX(32px)", transition: "opacity 0.8s ease 0.15s, transform 0.8s ease 0.15s", minHeight: isMobile ? "auto" : 420, position: "relative" }}>
          <ScoreDashboard />
        </div>
      </div>
    </section>
  );
}

// ─── Section 2: The Challenge ─────────────────────────────────────────────────
const RISK_WEDGES = [
  { label: "Pricing Gaps",          desc: "Fee schedules priced below market",          iconPath: "M2 10h2v4H2zm3-3h2v7H5zm3-5h2v12H8zm3 3h2v9h-2zM1 16h14v1.5H1z M13 6l2 2-2 2" },
  { label: "Excessive Discounting", desc: "Advisor exceptions eroding margin",          iconPath: "M9.5 1L15 6.5V15a1 1 0 01-1 1H2a1 1 0 01-1-1V2a1 1 0 011-1h7.5zM5 9h6" },
  { label: "Underpriced Relationships", desc: "Value delivered not monetized",          iconPath: "M8 2a1 1 0 011 1v2h4l1 1v2l-1 1H4L3 8V6l1-1h4V3a1 1 0 011-1zM3 10h10v4H3z" },
  { label: "Margin Erosion",        desc: "Silent compression across books",            iconPath: "M1 4l5 5 3-3 6 6M13 12h3v3" },
  { label: "No Peer Visibility",    desc: "No benchmark to compare against",            iconPath: "M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5zm7 2a2 2 0 100-4 2 2 0 000 4zM2 2l12 12" },
  { label: "Manual Review",         desc: "Exceptions caught too late",                 iconPath: "M8 1a7 7 0 100 14A7 7 0 008 1zM8 4v4l3 2M8 13v.5" },
  { label: "Fee Exceptions",        desc: "Untracked one-off pricing decisions",        iconPath: "M8 1L1 14h14L8 1zM8 6v4M8 11.5v1" },
  { label: "Lost Enterprise Value", desc: "Cumulative impact on firm valuation",        iconPath: "M2 14V4l5-3 5 3v10H2zM5 14v-4h6v4M8 8V5m0 3l-2 3h4l-2-3" },
];

function riskWedgePath(cx: number, cy: number, outerR: number, innerR: number, startDeg: number, endDeg: number, gapDeg = 2) {
  const toRad = (d: number) => (d - 90) * Math.PI / 180;
  const sg = toRad(startDeg + gapDeg / 2), eg = toRad(endDeg - gapDeg / 2);
  const o1 = { x: cx + outerR * Math.cos(sg), y: cy + outerR * Math.sin(sg) };
  const o2 = { x: cx + outerR * Math.cos(eg), y: cy + outerR * Math.sin(eg) };
  const i2 = { x: cx + innerR * Math.cos(eg), y: cy + innerR * Math.sin(eg) };
  const i1 = { x: cx + innerR * Math.cos(sg), y: cy + innerR * Math.sin(sg) };
  const lg = endDeg - startDeg > 180 ? 1 : 0;
  return `M${o1.x.toFixed(2)} ${o1.y.toFixed(2)} A${outerR} ${outerR} 0 ${lg} 1 ${o2.x.toFixed(2)} ${o2.y.toFixed(2)} L${i2.x.toFixed(2)} ${i2.y.toFixed(2)} A${innerR} ${innerR} 0 ${lg} 0 ${i1.x.toFixed(2)} ${i1.y.toFixed(2)}Z`;
}

function WedgeIcon({ d, cx, cy, size = 14, color }: { d: string; cx: number; cy: number; size?: number; color: string }) {
  const half = size / 2;
  return (
    <g transform={`translate(${(cx - half).toFixed(1)} ${(cy - half).toFixed(1)})`} aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" overflow="visible">
        <path d={d} />
      </svg>
    </g>
  );
}

function ErrorDial({ visible }: { visible: boolean }) {
  const { isMobile } = useBreakpoint();
  const [activeIdx, setActiveIdx] = useState(0);
  const [hovered, setHovered]     = useState<number | null>(null);

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setActiveIdx(i => (i + 1) % RISK_WEDGES.length), 1400);
    return () => clearInterval(id);
  }, [visible]);

  const total = RISK_WEDGES.length, degPer = 360 / total;
  // Scale down on mobile
  const SIZE = isMobile ? 280 : 520;
  const CX = SIZE / 2, CY = SIZE / 2;
  const OUTER  = isMobile ? 110 : 210;
  const INNER  = isMobile ? 58  : 110;
  const ICON_R = (OUTER + INNER) / 2;
  const LABEL_R = OUTER + (isMobile ? 30 : 68);
  const lit = hovered !== null ? hovered : activeIdx;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(20px)", transition: "opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s" }}>
      <svg width={SIZE} height={SIZE} viewBox={`-60 -60 ${SIZE + 120} ${SIZE + 120}`} style={{ overflow: "visible", maxWidth: "100%" }} aria-label="Risk factor dial" role="img">
        <defs>
          <radialGradient id="hub-red-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(220,38,38,0.22)" />
            <stop offset="100%" stopColor="rgba(220,38,38,0.04)" />
          </radialGradient>
          <filter id="red-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx={CX} cy={CY} r={OUTER + 6} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <circle cx={CX} cy={CY} r={INNER - 6} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        {RISK_WEDGES.map((w, i) => {
          const startDeg = i * degPer, endDeg = startDeg + degPer, midDeg = startDeg + degPer / 2;
          const midRad = (midDeg - 90) * Math.PI / 180;
          const iconX = CX + ICON_R * Math.cos(midRad), iconY = CY + ICON_R * Math.sin(midRad);
          const labelX = CX + LABEL_R * Math.cos(midRad), labelY = CY + LABEL_R * Math.sin(midRad);
          const isLit = lit === i;
          const path = riskWedgePath(CX, CY, OUTER, INNER, startDeg, endDeg);
          const words = w.label.split(" "), mid = Math.ceil(words.length / 2);
          const line1 = words.slice(0, mid).join(" "), line2 = words.slice(mid).join(" ");
          const fSize = isMobile ? 10 : 18;
          return (
            <g key={w.label} style={{ cursor: "pointer" }} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              <path d={path} fill={isLit ? "rgba(220,38,38,0.20)" : "rgba(255,255,255,0.04)"} stroke={isLit ? "rgba(220,38,38,0.75)" : "rgba(255,255,255,0.10)"} strokeWidth={isLit ? 1.5 : 0.75} filter={isLit ? "url(#red-glow)" : undefined} style={{ transition: "fill 0.4s ease, stroke 0.4s ease" }} />
              <WedgeIcon d={w.iconPath} cx={iconX} cy={iconY} size={isMobile ? 11 : 20} color={isLit ? "#f87171" : "rgba(255,255,255,0.25)"} />
              {line2 ? (
                <>
                  <text x={labelX} y={labelY - (isMobile ? 6 : 10)} textAnchor="middle" dominantBaseline="middle" fontSize={fSize} fontWeight={isLit ? "700" : "500"} fill={isLit ? "#f87171" : "rgba(255,255,255,0.35)"} style={{ transition: "fill 0.35s ease" }}>{line1}</text>
                  <text x={labelX} y={labelY + (isMobile ? 6 : 10)} textAnchor="middle" dominantBaseline="middle" fontSize={fSize} fontWeight={isLit ? "700" : "500"} fill={isLit ? "#f87171" : "rgba(255,255,255,0.35)"} style={{ transition: "fill 0.35s ease" }}>{line2}</text>
                </>
              ) : (
                <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" fontSize={fSize} fontWeight={isLit ? "700" : "500"} fill={isLit ? "#f87171" : "rgba(255,255,255,0.35)"} style={{ transition: "fill 0.35s ease" }}>{w.label}</text>
              )}
            </g>
          );
        })}
        <circle cx={CX} cy={CY} r={INNER} fill="url(#hub-red-grad)" stroke="rgba(220,38,38,0.35)" strokeWidth="1.5" />
        <circle cx={CX} cy={CY} r={INNER} fill="none" stroke="rgba(220,38,38,0.10)" strokeWidth="14" />
        <text x={CX} y={CY - (isMobile ? 9 : 16)} textAnchor="middle" dominantBaseline="middle" fontSize={isMobile ? 10 : 18} fontWeight="700" letterSpacing="0.14em" fill="rgba(220,38,38,0.80)">LOST</text>
        <text x={CX} y={CY + (isMobile ? 2 : 3)}  textAnchor="middle" dominantBaseline="middle" fontSize={isMobile ? 10 : 18} fontWeight="700" letterSpacing="0.10em" fill="rgba(220,38,38,0.80)">ENTERPRISE</text>
        <text x={CX} y={CY + (isMobile ? 13 : 22)} textAnchor="middle" dominantBaseline="middle" fontSize={isMobile ? 10 : 18} fontWeight="700" letterSpacing="0.10em" fill="rgba(220,38,38,0.80)">VALUE</text>
      </svg>
    </div>
  );
}

function TheChallenge() {
  const { isMobile, isTablet } = useBreakpoint();
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  const sectionPad = isMobile ? "0 0 64px" : "0px 0 80px";
  const innerPad   = isMobile ? "0 20px" : isTablet ? "0 32px" : "0 48px";
  const cols       = isTablet ? "1fr" : "1fr 1fr";

  return (
    <section ref={ref} style={{ background: C.bg, padding: sectionPad, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", bottom: "0%", right: "-5%", width: 600, height: 500, pointerEvents: "none", background: "radial-gradient(ellipse, rgba(255,179,12,0.07) 0%, transparent 60%)" }} aria-hidden="true" />
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: innerPad, boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: cols, gap: isMobile ? "40px" : "80px", alignItems: "center" }}>
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.025em", color: C.text, marginBottom: 20 }}>
              Pricing decisions happen every day. Most firms{" "}<span style={{ color: C.honey }}>cannot see where value is being lost.</span>
            </h2>
            <p style={{ fontSize: "1rem", color: C.muted, lineHeight: 1.75, marginBottom: 16 }}>
              Every advisor makes pricing decisions that affect firm profitability. A discount here. A fee exception there. A relationship priced below the value being delivered. One decision may look small. Across hundreds or thousands of advisors, those decisions quietly depress revenue, margin, and enterprise value.
            </p>
            <p style={{ fontSize: "1rem", color: C.muted, lineHeight: 1.75 }}>
              The problem is not that advisors are careless. The problem is that most firms do not have a connected way to see pricing behavior across clients, advisors, branches, products, and books of business.
            </p>
          </div>
          {/* Dial: on mobile show below text, scaled down */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ErrorDial visible={visible} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 3: Intelligence Scores ──────────────────────────────────────────
const SCORES = [
  {
    id: "pricing", label: "Pricing Score",
    headline: "See exactly where you are pricing well and where revenue is slipping.",
    body: "Shows the relative strength of pricing across clients, advisors, products, branches, and peer groups. Identifies underpriced relationships and excessive discounting patterns before they compound into systemic margin loss.",
    question: "Where are we pricing well, and where are we leaving money on the table?",
    visual: { type: "bars" as const, items: [{ label: "Top Quartile Advisors", pct: 91 }, { label: "Mid-Tier Advisors", pct: 67 }, { label: "Bottom Quartile", pct: 34 }, { label: "Peer Group Avg", pct: 74 }] },
  },
  {
    id: "value", label: "Value Score",
    headline: "Understand exactly where delivered value exceeds captured revenue.",
    body: "Connects the value delivered to a client with the revenue captured from that relationship. Surfaces gaps where the firm is providing more than it monetizes, turning those gaps into structured pricing conversation opportunities.",
    question: "Where are we providing more value than we are monetizing?",
    visual: { type: "split" as const, delivered: 88, captured: 61 },
  },
  {
    id: "loyalty", label: "Loyalty Score",
    headline: "Identify retention risk before it becomes lost revenue.",
    body: "Highlights relationships that may need attention before retention risk becomes real. Gives advisors early signals so they can act before a client relationship deteriorates or moves to a competitor.",
    question: "Which clients should advisors focus on before there is a problem?",
    visual: { type: "segments" as const, items: [{ label: "Stable", pct: 62, color: "#22c55e" }, { label: "Watch", pct: 24, color: C.honey }, { label: "At Risk", pct: 14, color: C.mandarin }] },
  },
  {
    id: "effectiveness", label: "Practice Effectiveness",
    headline: "Benchmark advisor performance and replicate what works.",
    body: "Benchmarks advisor performance across pricing discipline, client growth, wallet share, and profitability. Identifies which advisors are creating the most value and surfaces the specific behaviors others can learn from.",
    question: "Which advisors are creating the most value, and what can others learn from them?",
    visual: { type: "radar" as const, axes: ["Pricing", "Retention", "Growth", "Wallet", "Efficiency"], you: [74, 88, 61, 55, 80], peer: [68, 72, 70, 65, 68] },
  },
];

function ScoreVisual({ score, active }: { score: typeof SCORES[0]; active: boolean }) {
  const { isMobile } = useBreakpoint();
  const [pct, setPct] = useState(0);
  useEffect(() => {
    if (!active) { setPct(0); return; }
    let frame = 0;
    const go = () => { frame++; setPct(Math.min(1, frame / 35)); if (frame < 35) requestAnimationFrame(go); };
    const t = setTimeout(() => requestAnimationFrame(go), 80);
    return () => clearTimeout(t);
  }, [active]);
  const v = score.visual;
  if (v.type === "bars") return (
    <div style={{ padding: "8px 0", width: "100%" }}>
      {v.items.map((item, i) => {
        const barColor = i === 0 ? C.honey : i === 2 ? C.mandarin : i === 3 ? C.azure : "rgba(255,179,12,0.6)";
        return (
          <div key={item.label} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: C.muted }}>{item.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{Math.round(item.pct * pct)}</span>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.07)", position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${item.pct * pct}%`, background: barColor, transition: "width 0.05s" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
  if (v.type === "split") return (
    <div style={{ padding: "16px 0", width: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[{ label: "Value Delivered", val: v.delivered, color: C.honey }, { label: "Revenue Captured", val: v.captured, color: C.azure }].map(m => (
          <div key={m.label} style={{ padding: "20px 16px", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.07)`, textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: m.color, letterSpacing: "-0.04em" }}>{Math.round(m.val * pct)}</div>
            <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 6 }}>{m.label}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(255,179,12,0.06)", border: `1px solid rgba(255,179,12,0.2)` }}>
        <span style={{ fontSize: 12, color: C.honey, fontWeight: 600 }}>Gap: {Math.round((v.delivered - v.captured) * pct)} points: pricing opportunity identified</span>
      </div>
    </div>
  );
  if (v.type === "segments") {
    const radius = 58, cx = 80, cy = 72; let cumAngle = -Math.PI / 2;
    return (
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", justifyContent: "center", gap: isMobile ? 12 : 24, padding: "8px 0", width: "100%", maxWidth: "100%", overflow: "hidden" }}>
        <svg width={160} height={144} style={{ overflow: "visible", flexShrink: 0 }}>
          {v.items.map((seg, i) => {
            const angle = (seg.pct / 100) * 2 * Math.PI * pct;
            const x1 = cx + radius * Math.cos(cumAngle), y1 = cy + radius * Math.sin(cumAngle);
            const endA = cumAngle + angle, x2 = cx + radius * Math.cos(endA), y2 = cy + radius * Math.sin(endA);
            const large = angle > Math.PI ? 1 : 0;
            const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`;
            cumAngle = endA;
            return <path key={i} d={path} fill={seg.color} opacity={0.9} />;
          })}
          <circle cx={cx} cy={cy} r={34} fill={C.surface} />
          <text x={cx} y={cy - 4} textAnchor="middle" fill={C.text} fontSize={12} fontWeight={700}>62%</text>
          <text x={cx} y={cy + 13} textAnchor="middle" fill={C.muted} fontSize={9}>Stable</text>
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {v.items.map(seg => (
            <div key={seg.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 9, height: 9, borderRadius: 2, background: seg.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: C.muted, minWidth: 50 }}>{seg.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{seg.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (v.type === "radar") {
    const cx = 110, cy = 110, r = 80;
    const toXY = (angle: number, val: number) => { const rad = (angle * Math.PI) / 180; const d = (val / 100) * r * pct; return [cx + d * Math.sin(rad), cy - d * Math.cos(rad)] as [number, number]; };
    const step = 360 / v.axes.length;
    return (
      <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={220} height={240} aria-label="Radar chart" role="img">
          {[0.25, 0.5, 0.75, 1].map(ring => <polygon key={ring} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1} points={v.axes.map((_, i) => toXY(i * step, ring * 100).join(",")).join(" ")} />)}
          <polygon fill="rgba(255,179,12,0.06)" stroke="rgba(255,179,12,0.25)" strokeWidth={1} points={v.peer.map((val, i) => toXY(i * step, val).join(",")).join(" ")} />
          <polygon fill="rgba(255,179,12,0.14)" stroke={C.honey} strokeWidth={1.5} points={v.you.map((val, i) => toXY(i * step, val).join(",")).join(" ")} />
          {v.axes.map((label, i) => { const [x, y] = toXY(i * step, 126); return <text key={label} x={x} y={y} textAnchor="middle" fill={C.muted} fontSize={9} fontWeight={600}>{label}</text>; })}
          <text x={16} y={228} fill={C.muted} fontSize={8}>You</text><rect x={8} y={220} width={6} height={6} fill={C.honey} opacity={0.7} />
          <text x={52} y={228} fill="rgba(255,179,12,0.5)" fontSize={8}>Peer avg</text><rect x={44} y={220} width={6} height={6} fill="rgba(255,179,12,0.25)" />
        </svg>
      </div>
    );
  }
  return null;
}

const SCORE_DURATION = 4200;

function IntelligenceScores() {
  const ref = useRef<HTMLElement>(null);
  const { isMobile, isTablet } = useBreakpoint();
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.05 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  const tick = useCallback((ts: number) => {
    if (!startRef.current) startRef.current = ts;
    const p = Math.min(1, (ts - startRef.current) / SCORE_DURATION);
    setProgress(p);
    if (p >= 1) { startRef.current = null; setActive(a => (a + 1) % SCORES.length); setProgress(0); }
    else { rafRef.current = requestAnimationFrame(tick); }
  }, []);
  useEffect(() => {
    if (!visible || paused) { if (rafRef.current) cancelAnimationFrame(rafRef.current); if (!paused) setProgress(0); return; }
    startRef.current = null; rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [visible, paused, active, tick]);

  const sectionPad = isMobile ? "64px 0" : "80px 0";
  const innerPad   = isMobile ? "0 20px" : isTablet ? "0 32px" : "0 48px";

  return (
    <section ref={ref} style={{ background: C.bg, padding: sectionPad, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-10%", left: "30%", width: 700, height: 400, pointerEvents: "none", background: "radial-gradient(ellipse, rgba(255,179,12,0.06) 0%, transparent 60%)" }} aria-hidden="true" />
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: innerPad, boxSizing: "border-box" }}>
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.6s ease, transform 0.6s ease", marginBottom: isMobile ? 32 : 56 }}>
          <IllumHeading text="Four intelligence scores. One clear picture of pricing performance." gradient={[4, 7]} gradientColor="honey"
            style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.025em", maxWidth: 600, marginBottom: 16, color: C.text }} />
          <p style={{ fontSize: "1rem", color: C.muted, lineHeight: 1.7, maxWidth: 560 }}>
            Practice Management connects pricing, value, loyalty, advisor, compensation, and revenue data so firms can see the opportunities hidden across the business.
          </p>
        </div>

        <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => { setPaused(false); startRef.current = null; setProgress(0); }}
          style={{ background: C.surface, border: `1px solid ${C.border}`, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s", width: "100%", maxWidth: "100%", minWidth: 0, overflow: "hidden", boxSizing: "border-box" }}>
          {/* Tabs: 2-col on mobile, 4-col on desktop */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))", borderBottom: `1px solid ${C.border}`, width: "100%", maxWidth: "100%" }}>
            {SCORES.map((score, i) => (
              <button key={score.id} onClick={() => { setActive(i); setProgress(0); startRef.current = null; }}
                style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", minWidth: 0, maxWidth: "100%", padding: isMobile ? "12px 6px" : "18px 12px", textAlign: "center", borderRight: i < SCORES.length - 1 ? `1px solid ${C.border}` : "none", borderBottom: isMobile && i < 2 ? `1px solid ${C.border}` : "none", background: active === i ? "rgba(255,179,12,0.18)" : "transparent", borderTop: `3px solid ${active === i ? C.honey : "transparent"}`, cursor: "pointer", transition: "background 0.2s, border-color 0.2s", minHeight: isMobile ? 52 : 72, boxSizing: "border-box" }}>
                {active === i && !paused && <div style={{ position: "absolute", bottom: 0, left: 0, height: 2, width: `${progress * 100}%`, background: C.honey, transition: "width 0.05s linear" }} aria-hidden="true" />}
                <span style={{ display: "block", width: "100%", maxWidth: "100%", minWidth: 0, fontSize: isMobile ? 11.5 : 18, fontWeight: 700, lineHeight: 1.25, color: active === i ? C.text : C.muted, transition: "color 0.2s", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "normal" }}>{score.label}</span>
              </button>
            ))}
          </div>
          {/* Content: stacked on mobile, two-col on desktop */}
          <div style={{ display: "grid", gridTemplateColumns: isTablet ? "minmax(0, 1fr)" : "repeat(2, minmax(0, 1fr))", overflow: "hidden", width: "100%", maxWidth: "100%", minWidth: 0 }}>
            <div style={{ padding: isMobile ? "28px 18px" : isTablet ? "36px 32px" : "44px 48px", borderRight: isTablet ? "none" : `1px solid ${C.border}`, borderBottom: isTablet ? `1px solid ${C.border}` : "none", display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", maxWidth: "100%", minWidth: 0, overflow: "hidden", boxSizing: "border-box" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.honey, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 12 }}>{SCORES[active].label}</div>
              <h3 style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.4rem)", fontWeight: 700, color: C.text, lineHeight: 1.28, letterSpacing: "-0.02em", marginBottom: 16, maxWidth: "100%", wordBreak: "normal", overflowWrap: "anywhere" }}>{SCORES[active].headline}</h3>
              <p style={{ fontSize: "0.9375rem", color: C.muted, lineHeight: 1.75, marginBottom: 24, maxWidth: "100%", overflowWrap: "anywhere", wordBreak: "normal" }}>{SCORES[active].body}</p>
              <div style={{ padding: isMobile ? "12px 14px" : "12px 16px", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.07)`, overflow: "hidden", width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
                <div style={{ fontSize: 9, color: C.subtle, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 5 }}>Helps firms answer</div>
                <div style={{ fontSize: "0.875rem", color: C.text, fontStyle: "italic", overflowWrap: "anywhere", wordBreak: "normal" }}>"{SCORES[active].question}"</div>
              </div>
            </div>
            <div style={{ padding: isMobile ? "28px 18px" : isTablet ? "36px 32px" : "44px 48px", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: "100%", minWidth: 0, overflow: "hidden", boxSizing: "border-box" }}>
              <ScoreVisual score={SCORES[active]} active={true} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 4: AI Next-Best Actions ─────────────────────────────────────────
const FEED_ACTIONS = [
  { priority: "HIGH",   color: C.mandarin, text: "Review account #A-4821: pricing is 23% below comparable relationships." },
  { priority: "MED",    color: C.honey,    text: "Prepare pricing conversation for J. Hartwell: delivered value exceeds current revenue." },
  { priority: "HIGH",   color: C.mandarin, text: "Discount on group B-7 is outside peer norms. Review and reduce." },
  { priority: "WATCH",  color: C.azure,    text: "Loyalty risk rising for Meridian Capital. Schedule advisor touchpoint." },
  { priority: "OPP",    color: "#22c55e",  text: "Wallet share opportunity identified in Northeast segment." },
  { priority: "REVIEW", color: C.honey,    text: "Advisor group C discounting patterns reducing profitability by est. 1.2%." },
  { priority: "HIGH",   color: C.mandarin, text: "Escalate exception #E-112: may affect compliance and client trust." },
  { priority: "OPP",    color: "#22c55e",  text: "Replicate R. Chen's approach: pricing outcomes 34% above peer group." },
];

function ActionFeed() {
  const ref = useRef<HTMLElement>(null);
  const { isMobile, isTablet } = useBreakpoint();
  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!visible || shown >= FEED_ACTIONS.length) return;
    const t = setTimeout(() => setShown(s => s + 1), 240 + shown * 130);
    return () => clearTimeout(t);
  }, [visible, shown]);

  const sectionPad = isMobile ? "64px 0" : "80px 0";
  const innerPad   = isMobile ? "0 20px" : isTablet ? "0 32px" : "0 48px";
  const cols       = isTablet ? "1fr" : "1fr 1fr";
  const gap        = isMobile ? "40px" : "80px";

  return (
    <section ref={ref} style={{ background: C.bg, padding: sectionPad, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", bottom: "-5%", right: "10%", width: 600, height: 500, pointerEvents: "none", background: "radial-gradient(ellipse, rgba(255,179,12,0.07) 0%, transparent 60%)" }} aria-hidden="true" />
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: innerPad, boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: cols, gap, alignItems: "center" }}>
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
            <IllumHeading text="Give advisors next-best actions, not another report to interpret." gradient={[2, 4]} gradientColor="honey"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.025em", marginBottom: 20, color: C.text }} />
            <p style={{ fontSize: "1rem", color: C.muted, lineHeight: 1.75, marginBottom: 16 }}>
              Dashboards can show what happened. PureFacts helps firms decide what should happen next. Practice Management uses AI-native intelligence to review pricing, value, loyalty, revenue, and advisor behavior signals, then surfaces the actions most likely to improve profitability.
            </p>
            <p style={{ fontSize: "1rem", color: C.muted, lineHeight: 1.75, marginBottom: 36 }}>
              The goal is simple: put the right insight in front of the right person at the right moment.
            </p>
            <div style={{ padding: "18px 22px", background: "rgba(255,179,12,0.05)", border: `1px solid ${C.borderHz}` }}>
              <p style={{ fontSize: "0.9375rem", color: C.text, lineHeight: 1.6, fontWeight: 500, margin: 0 }}>
                From insight to decision. From decision to action. From action to measurable growth.
              </p>
            </div>
          </div>
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(24px)", transition: "opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s" }}>
            <div style={{ background: "#0e0b09", border: `1px solid rgba(255,255,255,0.09)` }}>
              <div style={{ padding: "10px 16px", borderBottom: `1px solid rgba(255,255,255,0.07)`, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {["#ff5f57","#ffbd2e","#28c840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.8 }} aria-hidden="true" />)}
                </div>
                <span style={{ fontSize: isMobile ? 9 : 11, color: C.muted, fontFamily: "monospace", marginLeft: 4 }}>practice-intelligence: next-best-actions</span>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.5)" }} aria-hidden="true" />
                  <span style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace" }}>LIVE</span>
                </div>
              </div>
              <div style={{ padding: "16px 0", minHeight: isMobile ? 240 : 380 }}>
                {FEED_ACTIONS.slice(0, shown).map((action, i) => (
                  <div key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                    style={{ padding: "10px 16px", display: "flex", alignItems: "flex-start", gap: 12, background: hovered === i ? "rgba(255,179,12,0.04)" : "transparent", transition: "background 0.15s", animation: "feedIn 0.3s ease forwards" }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: action.color, background: `${action.color}18`, padding: "2px 6px", letterSpacing: "0.08em", flexShrink: 0, marginTop: 2 }}>{action.priority}</span>
                    <span style={{ fontSize: isMobile ? 11 : 12.5, color: hovered === i ? C.text : C.muted, lineHeight: 1.6, fontFamily: "monospace", transition: "color 0.15s" }}>{action.text}</span>
                  </div>
                ))}
                {shown < FEED_ACTIONS.length && (
                  <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: C.honey, fontFamily: "monospace" }}>analyzing</span>
                    <span style={{ display: "inline-block", width: 7, height: 14, background: C.honey, animation: "blink 0.9s step-end infinite" }} aria-hidden="true" />
                  </div>
                )}
                {shown >= FEED_ACTIONS.length && (
                  <div style={{ padding: "10px 16px" }}>
                    <span style={{ fontSize: 11, color: "#22c55e", fontFamily: "monospace" }}>✓ {FEED_ACTIONS.length} actions surfaced · next cycle in 4h</span>
                  </div>
                )}
              </div>
            </div>
            <style>{`@keyframes feedIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } } @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }`}</style>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 5: Why It Matters ────────────────────────────────────────────────
const VALUES = [
  { number: "01", title: "Reduce Excessive Discounting", body: "Spot patterns that erode revenue and margin before they spread across the organization." },
  { number: "02", title: "Improve Pricing Discipline",   body: "Find pricing gaps across advisors, clients, products, branches, and peer groups before they compound into margin loss." },
  { number: "03", title: "Guide Advisor Behavior",       body: "Give advisors timely recommendations tied to their actual clients and books, not generic guidance." },
  { number: "04", title: "Increase Profitability",       body: "Identify where the firm is delivering more value than it captures. Discover opportunities before they become invisible." },
  { number: "05", title: "Grow Enterprise Value",        body: "Turn better pricing and advisor behavior into measurable firm-level impact that shows up at the board level." },
];

function CalloutCTA({ href, label }: { href: string; label: string }) {
  const [hov, setHov] = useState(false);
  return (
    <Link href={href} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position: "relative", display: "inline-flex", alignItems: "center", padding: "11px 28px", fontSize: "0.875rem", fontWeight: 600, color: C.text, background: C.bg, border: `2px solid ${hov ? "transparent" : C.honey}`, textDecoration: "none", overflow: "hidden", transition: "color 0.2s" }}>
      <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
      {hov && <span style={{ position: "absolute", inset: -2, background: "linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%)", WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "destination-out", maskComposite: "exclude", border: "2px solid transparent" }} aria-hidden="true" />}
    </Link>
  );
}

function WhyItMatters() {
  const ref = useRef<HTMLElement>(null);
  const { isMobile, isTablet } = useBreakpoint();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.05 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const sectionPad = isMobile ? "64px 0" : "80px 0";
  const innerPad   = isMobile ? "0 20px" : isTablet ? "0 32px" : "0 48px";
  // 5 cols on desktop → 2 cols tablet → 1 col mobile
  const valueCols  = isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(5, 1fr)";

  return (
    <section ref={ref} style={{ background: C.bg, padding: sectionPad, position: "relative" }}>
      <div style={{ position: "absolute", top: "-5%", left: "20%", width: 700, height: 400, pointerEvents: "none", background: "radial-gradient(ellipse, rgba(255,179,12,0.06) 0%, transparent 60%)" }} aria-hidden="true" />
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: innerPad, boxSizing: "border-box" }}>
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.6s ease, transform 0.6s ease", marginBottom: isMobile ? 32 : 56 }}>
          <IllumHeading text="Better pricing discipline is one of the fastest paths to better firm economics." gradient={[7, 9]} gradientColor="honey"
            style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.025em", maxWidth: 680, color: C.text }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: valueCols, gap: isMobile ? 12 : 4, marginBottom: 3 }}>
          {VALUES.map((v, i) => (
            <div key={v.number} style={{ padding: isMobile ? "24px 20px" : "36px 24px", background: C.surface, position: "relative", overflow: "hidden", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.5s ease ${0.08 + i * 0.09}s, transform 0.5s ease ${0.08 + i * 0.09}s` }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: C.honey }} aria-hidden="true" />
              <div style={{ fontSize: isMobile ? "2rem" : "3rem", fontWeight: 800, color: "rgba(255,179,12,0.6)", letterSpacing: "-0.05em", lineHeight: 1, marginBottom: 20 }}>{v.number}</div>
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: C.text, marginBottom: 10, lineHeight: 1.35 }}>{v.title}</h3>
              <p style={{ fontSize: "0.8125rem", color: C.muted, lineHeight: 1.7 }}>{v.body}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48, padding: isMobile ? "28px 20px" : "40px", background: "none", border: `1px solid rgba(255,179,12,0.30)`, textAlign: "center", opacity: visible ? 1 : 0, transition: "opacity 0.6s ease 0.55s" }}>
          <p style={{ fontSize: isMobile ? "1.1rem" : "1.4rem", color: C.text, fontWeight: 700, maxWidth: 640, margin: "0 auto 28px", lineHeight: 1.5 }}>
            Most growth initiatives require new markets, new products, or more headcount. Pricing improvement starts with the{" "}<span style={{ color: C.honey }}>revenue opportunity already inside the firm.</span>
          </p>
          <CalloutCTA href="/contact" label="Request a Demo" />
        </div>
      </div>
    </section>
  );
}

// ─── Section 6: Platform Connection ──────────────────────────────────────────
const PLATFORM_LEFT_NODES  = ["Custodians", "Portfolio Management", "CRM", "Trading Platform"];
const PLATFORM_RIGHT_NODES = ["Accounting Systems", "Billing Systems", "Compensation Systems", "Customer Data Lakes"];

function FoundationVisual({ visible }: { visible: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sz, setSz] = useState({ w: 600, h: 420 });
  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const ro = new ResizeObserver(e => setSz({ w: e[0].contentRect.width, h: e[0].contentRect.height }));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  const { w } = sz;
  const NODE_W = 162, NODE_H = 42, LEFT_X = 24, RIGHT_X = w - 24 - NODE_W;
  const NODE_TOPS = [88, 158, 228, 298], HUB_R = 62;
  const cx = w / 2, cy = (NODE_TOPS[0] + NODE_TOPS[3] + NODE_H) / 2;
  const leftConns  = NODE_TOPS.map(top => ({ fromX: LEFT_X + NODE_W, fromY: top + NODE_H / 2 }));
  const rightConns = NODE_TOPS.map(top => ({ fromX: RIGHT_X,         fromY: top + NODE_H / 2 }));
  function hubEntry(fromX: number, fromY: number) { const dx = cx - fromX, dy = cy - fromY, dist = Math.sqrt(dx * dx + dy * dy); return { x: cx - (dx / dist) * HUB_R, y: cy - (dy / dist) * HUB_R }; }
  function nodePath(fromX: number, fromY: number) { const entry = hubEntry(fromX, fromY), midX = (fromX + cx) / 2; return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${entry.y}, ${entry.x} ${entry.y}`; }
  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: cx - HUB_R * 2.2, top: cy - HUB_R * 2.2, width: HUB_R * 4.4, height: HUB_R * 4.4, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,132,255,0.15) 0%, transparent 70%)", pointerEvents: "none" }} aria-hidden="true" />
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} aria-hidden="true">
        {leftConns.map((c, i) => <path key={`l${i}`} d={nodePath(c.fromX, c.fromY)} fill="none" stroke={C.azure} strokeWidth="1.5" strokeOpacity={visible ? 0.55 : 0} style={{ transition: `stroke-opacity 0.5s ease ${0.4 + i * 0.1}s` }} />)}
        {rightConns.map((c, i) => <path key={`r${i}`} d={nodePath(c.fromX, c.fromY)} fill="none" stroke={C.azure} strokeWidth="1.5" strokeOpacity={visible ? 0.55 : 0} style={{ transition: `stroke-opacity 0.5s ease ${0.5 + i * 0.1}s` }} />)}
        {visible && leftConns.map((c, i) => <circle key={`lp${i}`} r="2.5" fill={C.azure} opacity="0.9"><animateMotion dur={`${1.8 + i * 0.25}s`} repeatCount="indefinite" begin={`${i * 0.4}s`} path={nodePath(c.fromX, c.fromY)} /></circle>)}
        {visible && rightConns.map((c, i) => <circle key={`rp${i}`} r="2.5" fill={C.azure} opacity="0.9"><animateMotion dur={`${1.8 + i * 0.25}s`} repeatCount="indefinite" begin={`${i * 0.4 + 0.3}s`} path={nodePath(c.fromX, c.fromY)} /></circle>)}
        <circle cx={cx} cy={cy} r={HUB_R} fill="none" stroke="rgba(59,132,255,0.45)" strokeWidth="1.5" />
      </svg>
      {PLATFORM_LEFT_NODES.map((label, i) => <div key={label} style={{ position: "absolute", left: LEFT_X, top: NODE_TOPS[i], width: NODE_W, height: NODE_H, background: C.surface, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-12px)", transition: `opacity 0.45s ease ${i * 0.09}s, transform 0.45s ease ${i * 0.09}s` }}><span style={{ fontSize: 12, fontWeight: 600, color: C.text, textAlign: "center", padding: "0 8px" }}>{label}</span></div>)}
      {PLATFORM_RIGHT_NODES.map((label, i) => <div key={label} style={{ position: "absolute", left: RIGHT_X, top: NODE_TOPS[i], width: NODE_W, height: NODE_H, background: C.surface, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(12px)", transition: `opacity 0.45s ease ${0.12 + i * 0.09}s, transform 0.45s ease ${0.12 + i * 0.09}s` }}><span style={{ fontSize: 12, fontWeight: 600, color: C.text, textAlign: "center", padding: "0 8px" }}>{label}</span></div>)}
      <div style={{ position: "absolute", left: cx - HUB_R, top: cy - HUB_R, width: HUB_R * 2, height: HUB_R * 2, borderRadius: "50%", border: "1.5px solid rgba(59,132,255,0.45)", background: "radial-gradient(circle at 40% 35%, rgba(59,132,255,0.18), rgba(59,132,255,0.05))", backdropFilter: "blur(12px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 5, opacity: visible ? 1 : 0, transform: visible ? "scale(1)" : "scale(0.7)", transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.text, lineHeight: 1.35, textAlign: "center", padding: "0 10px" }}>Revenue Book<br />of Record</span>
      </div>
    </div>
  );
}

const DIAGRAM_WEDGES = [
  { id: "practice", label: "Practice Management", startAngle: -60, endAngle: 60,  stroke: "#ffb30c", faUnicode: "\uf201" },
  { id: "comp",     label: "Compensation",         startAngle: 60,  endAngle: 180, stroke: "#FF006E", faUnicode: "\uf51e" },
  { id: "fees",     label: "Fees & Billing",        startAngle: 180, endAngle: 300, stroke: "#ED65D0", faUnicode: "\uf571" },
];
function diagramPolarToXY(cx: number, cy: number, r: number, angleDeg: number) { const rad = (angleDeg - 90) * Math.PI / 180; return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }; }
function diagramWedgePath(cx: number, cy: number, outerR: number, innerR: number, s: number, e: number) {
  const o1 = diagramPolarToXY(cx, cy, outerR, s), o2 = diagramPolarToXY(cx, cy, outerR, e);
  const i2 = diagramPolarToXY(cx, cy, innerR, e), i1 = diagramPolarToXY(cx, cy, innerR, s);
  const lg = e - s > 180 ? 1 : 0;
  return `M${o1.x} ${o1.y} A${outerR} ${outerR} 0 ${lg} 1 ${o2.x} ${o2.y} L${i2.x} ${i2.y} A${innerR} ${innerR} 0 ${lg} 0 ${i1.x} ${i1.y}Z`;
}

function PureRevenueDiagram({ visible }: { visible: boolean }) {
  const { isMobile } = useBreakpoint();
  const VB = 200, CX = 100, CY = 100, INNER = 43, OUTER = 84, WEDGE_INNER = INNER + 2, LABEL_R = OUTER + 18;
  const wrapSize = isMobile ? "min(220px, 78vw)" : "min(340px, 88%)";
  return (
    // No overflow:hidden — SVG labels use overflow:visible and must not be clipped
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", width: "min(260px, 70%)", aspectRatio: "1", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,132,255,0.13) 0%, transparent 70%)", pointerEvents: "none" }} aria-hidden="true" />
      <div style={{ position: "relative", width: wrapSize, aspectRatio: "1" }}>
        <svg viewBox={`0 0 ${VB} ${VB}`} style={{ width: "100%", height: "100%", overflow: "visible" }}>
          <defs><radialGradient id="hub-grad-pm" cx="40%" cy="35%" r="60%"><stop offset="0%" stopColor="rgba(59,132,255,0.20)" /><stop offset="100%" stopColor="rgba(59,132,255,0.05)" /></radialGradient></defs>
          {DIAGRAM_WEDGES.map((w, wi) => {
            const path = diagramWedgePath(CX, CY, OUTER, WEDGE_INNER, w.startAngle, w.endAngle);
            const mid = (w.startAngle + w.endAngle) / 2;
            const iconPt = diagramPolarToXY(CX, CY, (OUTER + WEDGE_INNER) / 2, mid);
            const labelPt = diagramPolarToXY(CX, CY, LABEL_R, mid);
            const textAnchor = labelPt.x < CX - 5 ? "end" : labelPt.x > CX + 5 ? "start" : "middle";
            const words = w.label.split(" "), half = Math.ceil(words.length / 2);
            return (
              <g key={w.id}>
                <path d={path} fill="none" stroke={w.stroke} strokeWidth="1.5" opacity={visible ? 1 : 0} style={{ transformOrigin: `${CX}px ${CY}px`, transform: visible ? "scale(1)" : "scale(0.88)", transition: `opacity 0.55s ease ${wi * 0.18}s, transform 0.55s ease ${wi * 0.18}s` }} />
                <text x={iconPt.x} y={iconPt.y} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="900" fontFamily="'Font Awesome 6 Free','Font Awesome 6 Pro','Font Awesome 5 Free'" fill={w.stroke} opacity={visible ? 1 : 0} aria-hidden="true" style={{ transition: `opacity 0.4s ease ${wi * 0.18 + 0.18}s` }}>{w.faUnicode}</text>
                <text x={labelPt.x} y={labelPt.y} textAnchor={textAnchor} dominantBaseline="middle" fontSize="8.5" fontWeight="700" fill={w.stroke} style={{ letterSpacing: "0.02em", opacity: visible ? 1 : 0, transition: `opacity 0.4s ease ${wi * 0.18 + 0.30}s` }}>
                  {words.length > 1 ? (<><tspan x={labelPt.x} dy="-0.6em">{words.slice(0, half).join(" ")}</tspan><tspan x={labelPt.x} dy="1.3em">{words.slice(half).join(" ")}</tspan></>) : w.label}
                </text>
              </g>
            );
          })}
          <circle cx={CX} cy={CY} r={INNER + 2} fill="#140f0c" />
          <circle cx={CX} cy={CY} r={INNER} fill="none" stroke="rgba(59,132,255,0.18)" strokeWidth="1.5" />
          <circle cx={CX} cy={CY} r={INNER} fill="none" opacity={visible ? 1 : 0} style={{ transformOrigin: `${CX}px ${CY}px`, transform: visible ? "scale(1)" : "scale(0.7)", transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s" }} />
          <circle cx={CX} cy={CY} r={INNER} fill="none" stroke="rgba(59,132,255,0.45)" strokeWidth="1.5" />
          <text x={CX} y={CY} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="600" fill="#f4f4f4" style={{ letterSpacing: "0.02em", opacity: visible ? 1 : 0, transition: "opacity 0.5s ease 0.38s" }}>
            <tspan x={CX} dy="-5">Revenue Book</tspan><tspan x={CX} dy="11">of Record</tspan>
          </text>
        </svg>
      </div>
    </div>
  );
}

const PM_MODULES = [
  { name: "Fees and Billing",   tagline: "Fee Management",       color: "#ED65D0", colorMuted: "rgba(237,101,208,0.08)", borderColor: "rgba(237,101,208,0.28)", href: "/platform/fees-and-billing",          active: false, points: ["Complex fee schedule management", "Automated billing runs at scale", "Zero tolerance for calculation errors"], stat: { value: "10%",       label: "avg. revenue lift" } },
  { name: "Compensation",       tagline: "Advisor Compensation", color: "#FF006E", colorMuted: "rgba(255,0,110,0.08)",   borderColor: "rgba(255,0,110,0.28)",   href: "/platform/compensation",       active: false, points: ["Sophisticated payout structures", "Incentive and governance controls", "Transparency that builds advisor trust"], stat: { value: "100%",      label: "payout accuracy" } },
  { name: "Practice Management",tagline: "Revenue Intelligence", color: "#ffb30c", colorMuted: "rgba(255,179,12,0.08)", borderColor: "rgba(255,179,12,0.35)",   href: "#",                           active: true,  points: ["Pricing gap identification at scale", "AI-native next-best advisor actions", "Connected to Revenue Book of Record"],  stat: { value: "Real-time", label: "pricing intelligence" } },
];

function PlatformModuleCard({ mod, index, visible }: { mod: typeof PM_MODULES[0]; index: number; visible: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ flex: 1, minWidth: 220, padding: "28px 28px 24px", border: `1px solid ${mod.active ? mod.borderColor : (hovered ? mod.borderColor : mod.borderColor)}`, background: mod.active ? "rgba(255,179,12,0.18)" : (hovered ? mod.colorMuted : C.surface), borderRadius: 12, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", transition: "border-color 0.2s, background 0.2s", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transitionProperty: "opacity, transform, border-color, background", transitionDuration: "0.5s, 0.5s, 0.2s, 0.2s", transitionDelay: `${0.1 + index * 0.1}s, ${0.1 + index * 0.1}s, 0s, 0s`, transitionTimingFunction: "ease, ease, ease, ease" }}>
      {mod.active && <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at top left, rgba(255,179,12,0.06) 0%, transparent 60%)", pointerEvents: "none" }} aria-hidden="true" />}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: mod.color, marginBottom: 6 }}>{mod.active ? "Current Module" : mod.tagline}</div>
        <div style={{ fontSize: 21, fontWeight: 700, color: C.text, letterSpacing: "-0.02em" }}>{mod.name}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
        {mod.points.map((pt, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 5, height: 5, borderRadius: "50%", background: mod.color, flexShrink: 0 }} aria-hidden="true" /><span style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6 }}>{pt}</span></div>)}
      </div>
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: mod.color, letterSpacing: "-0.03em" }}>{mod.stat.value}</span>
        <span style={{ fontSize: 13, color: C.muted }}>{mod.stat.label}</span>
      </div>
      {!mod.active && <Link href={mod.href} style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: mod.color, textDecoration: "none", opacity: hovered ? 1 : 0.7, transition: "opacity 0.2s" }}>Explore {mod.name}<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 6h7M6.5 3l3 3-3 3" stroke={mod.color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></Link>}
    </div>
  );
}

function PlatformConnection() {
  const ref = useRef<HTMLElement>(null);
  const { isMobile, isTablet } = useBreakpoint();
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const row3Ref = useRef<HTMLDivElement>(null);
  const [vis1, setVis1] = useState(false);
  const [vis2, setVis2] = useState(false);
  const [vis3, setVis3] = useState(false);
  useEffect(() => {
    const observe = (el: HTMLElement | null, setter: (v: boolean) => void) => { if (!el) return; const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setter(true); }, { threshold: 0.05 }); obs.observe(el); return () => obs.disconnect(); };
    const c1 = observe(row1Ref.current, setVis1), c2 = observe(row2Ref.current, setVis2), c3 = observe(row3Ref.current, setVis3);
    return () => { c1?.(); c2?.(); c3?.(); };
  }, []);

  const sp = isMobile ? "64px 0" : "80px 0";
  const ip = isMobile ? "0 20px" : isTablet ? "0 32px" : "0 48px";
  const rc = isTablet ? "1fr" : "1fr 1fr";
  const tp = isMobile ? "32px 20px" : isTablet ? "40px 28px" : "52px 48px";
  const mp = isMobile ? "20px 20px 28px" : isTablet ? "24px 28px 32px" : "28px 40px 40px";
  const mh = isMobile ? "28px 20px 0" : isTablet ? "32px 28px 0" : "36px 40px 0";

  return (
    <section ref={ref} style={{ background: C.bg, padding: sp, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", bottom: "10%", left: "5%", width: 600, height: 500, pointerEvents: "none", background: "radial-gradient(ellipse, rgba(255,179,12,0.06) 0%, transparent 60%)" }} aria-hidden="true" />
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: ip, boxSizing: "border-box" }}>
        <div style={{ marginBottom: isMobile ? 32 : 48, opacity: vis1 ? 1 : 0, transform: vis1 ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
          <IllumHeading text="Pricing intelligence is stronger when connected to trusted revenue data." gradient={[5, 10]} gradientColor="honey"
            style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.025em", maxWidth: 680, color: C.text }} />
        </div>

        {/* Row 1: The Platform — no overflow:hidden so SVG labels render correctly */}
        <div ref={row1Ref} style={{ display: "grid", gridTemplateColumns: rc, border: `1px solid ${C.border}`, marginBottom: 3 }}>
          <div style={{ padding: tp, background: C.bg, display: "flex", flexDirection: "column", justifyContent: "center", opacity: vis1 ? 1 : 0, transform: vis1 ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.azure, marginBottom: 14 }}>The Platform</div>
            <h3 style={{ fontSize: "clamp(1.3rem, 2vw, 1.7rem)", fontWeight: 700, color: C.text, lineHeight: 1.2, letterSpacing: "-0.025em", margin: "0 0 16px" }}>Three modules. One operating system for revenue.</h3>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, margin: "0 0 28px", maxWidth: 400 }}>Fees and Billing, Compensation, and Practice Management sit on top of the Revenue Book of Record, each pulling from the same data. No reconciliation gaps. One consistent view of revenue performance across the full firm.</p>
            <Link href="/platform/" className="btn-primary" style={{ display: "inline-flex", maxWidth: 160 }}>Explore the Platform</Link>
          </div>
          {/* minHeight 460 gives SVG labels room to breathe above/below */}
          <div style={{ background: C.bg, minHeight: isTablet ? 320 : 460, display: "flex", alignItems: "center", justifyContent: "center", borderLeft: isTablet ? "none" : `1px solid ${C.border}`, borderTop: isTablet ? `1px solid ${C.border}` : "none" }}>
            <PureRevenueDiagram visible={vis1} />
          </div>
        </div>

        {/* Row 2: The Modules */}
        <div ref={row2Ref} style={{ border: `1px solid ${C.border}`, borderTop: "none", overflow: "hidden", background: C.bg, marginBottom: 3 }}>
          <div style={{ padding: mh }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.honey, marginBottom: 10 }}>The Modules</div>
            <h3 style={{ fontSize: "clamp(1.2rem, 2vw, 1.6rem)", fontWeight: 700, color: C.text, lineHeight: 1.2, letterSpacing: "-0.025em", margin: 0 }}>Built for every dimension of revenue.</h3>
          </div>
          <div style={{ display: "flex", flexDirection: isTablet ? "column" : "row", gap: 16, padding: mp }}>
            {PM_MODULES.map((mod, i) => <PlatformModuleCard key={mod.name} mod={mod} index={i} visible={vis2} />)}
          </div>
        </div>

        {/* Row 3: The Foundation */}
        <div ref={row3Ref} style={{ display: "grid", gridTemplateColumns: rc, border: `1px solid ${C.border}`, borderTop: "none", overflow: "hidden" }}>
          <div style={{ padding: tp, background: C.bg, display: "flex", flexDirection: "column", justifyContent: "center", opacity: vis3 ? 1 : 0, transform: vis3 ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.azure, marginBottom: 14 }}>The Foundation</div>
            <h3 style={{ fontSize: "clamp(1.3rem, 2vw, 1.7rem)", fontWeight: 700, color: C.text, lineHeight: 1.2, letterSpacing: "-0.025em", margin: "0 0 16px" }}>Practice Management connects to revenue truth, not just activity data.</h3>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, margin: "0 0 28px", maxWidth: 400 }}>Most practice management tools look at activity. PureFacts connects pricing intelligence to the Revenue Book of Record: the same authoritative data that powers fees, billing, compensation, and client revenue activity across the platform.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {["Client, account, and contract data unified", "Pricing rules and fee schedules centralized", "Audit-ready at every stage"].map((pt, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, opacity: vis3 ? 1 : 0, transition: `opacity 0.4s ease ${0.35 + i * 0.1}s` }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.azure, flexShrink: 0 }} aria-hidden="true" />
                  <span style={{ fontSize: 13.5, color: C.text }}>{pt}</span>
                </div>
              ))}
            </div>
            <Link href="/platform/revenue-book-of-record" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: C.azure, textDecoration: "none" }}>
              Learn about the Revenue Book of Record
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 6h7M6.5 3l3 3-3 3" stroke={C.azure} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>
          <div style={{ background: C.bg, minHeight: isTablet ? 340 : 420, display: isMobile ? "none" : "flex", alignItems: "stretch", borderLeft: isTablet ? "none" : `1px solid ${C.border}`, borderTop: isTablet ? `1px solid ${C.border}` : "none" }}>
            <FoundationVisual visible={vis3} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 7: Built For ─────────────────────────────────────────────────────
const PERSONAS = [
  { role: "Advisors", icon: "fa-user-tie", tagline: "Clear next steps", value: "Know exactly which clients, accounts, and relationships deserve attention next. No interpretation required. Just specific, timely actions tied to your book.", bullets: ["AI-native next-best actions by client", "Loyalty risk alerts before clients leave", "Wallet share opportunities surfaced", "Peer comparison to guide conversations"] },
  { role: "CEOs and Heads of Wealth", icon: "fa-building-columns", tagline: "Enterprise visibility", value: "See where pricing discipline, advisor behavior, and practice performance are creating or eroding enterprise value across the whole organization.", bullets: ["Firm-level pricing performance vs. peers", "Advisor and branch benchmarking", "Revenue capture vs. value delivered", "Enterprise value impact of pricing behavior"] },
  { role: "Practice Management Teams", icon: "fa-people-group", tagline: "Targeted advisor support", value: "Focus advisor coaching and support on the accounts, books, and behaviors where intervention creates the most measurable value.", bullets: ["Identify which advisors need support most", "Surface discounting patterns early", "Prioritize accounts for pricing review", "Track improvement over time"] },
  { role: "Finance Leaders", icon: "fa-chart-line", tagline: "Revenue and margin clarity", value: "Connect pricing decisions directly to revenue capture, profitability, and firm economics. See where margin is created and where it quietly erodes.", bullets: ["Pricing gaps mapped to revenue impact", "Discount pattern analysis by segment", "Revenue captured vs. value delivered", "EBITDA margin improvement opportunities"] },
  { role: "Compliance and Operations", icon: "fa-shield-halved", tagline: "Oversight and control", value: "Improve visibility into pricing patterns, fee exceptions, and review opportunities. Escalate what needs attention before it becomes a problem.", bullets: ["Fee exception tracking and escalation", "Pricing pattern monitoring at scale", "Audit-ready pricing records", "Compliance review queue prioritization"] },
];
const PERSONA_DURATION = 4500;

function BuiltForWho() {
  const ref = useRef<HTMLElement>(null);
  const { isMobile, isTablet } = useBreakpoint();
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(0);
  const [fillPct, setFillPct] = useState(0);
  const [paused, setPaused] = useState(false);
  const startRef = useRef<number>(Date.now());
  const rafRef = useRef<number>(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.05 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!visible || paused) { cancelAnimationFrame(rafRef.current); return; }
    startRef.current = Date.now();
    const tick = () => { const elapsed = Date.now() - startRef.current; const pct = Math.min(100, (elapsed / PERSONA_DURATION) * 100); setFillPct(pct); if (elapsed >= PERSONA_DURATION) { setActive(a => (a + 1) % PERSONAS.length); startRef.current = Date.now(); setFillPct(0); } rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible, paused, active]);
  const goTo = (i: number) => { setActive(i); setFillPct(0); startRef.current = Date.now(); };
  const p = PERSONAS[active];

  const sectionPad = isMobile ? "64px 0" : "80px 0";
  const innerPad   = isMobile ? "0 20px" : isTablet ? "0 32px" : "0 48px";

  return (
    <section ref={ref} style={{ background: C.bg, padding: sectionPad, position: "relative" }}>
      <div style={{ position: "absolute", top: "30%", right: "-5%", width: 600, height: 500, pointerEvents: "none", background: "radial-gradient(ellipse, rgba(255,179,12,0.06) 0%, transparent 60%)" }} aria-hidden="true" />
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: innerPad, boxSizing: "border-box" }}>
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.6s ease, transform 0.6s ease", marginBottom: isMobile ? 32 : 56 }}>
          <IllumHeading text="Everyone gets a clearer view of how pricing decisions affect performance." gradient={[4, 9]} gradientColor="honey"
            style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.025em", maxWidth: 640, color: C.text }} />
        </div>

        {isTablet ? (
          <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.7s ease 0.2s" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
              {PERSONAS.map((persona, i) => {
                const isActive = active === i;
                return (
                  <button key={persona.role} onClick={() => goTo(i)}
                    style={{ position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: 14, width: "100%", padding: isMobile ? "12px 16px" : "16px 20px", textAlign: "left", background: isActive ? "rgba(255,179,12,0.18)" : "rgba(255,255,255,0.02)", border: `1px solid ${isActive ? "rgba(255,179,12,0.30)" : C.border}`, cursor: "pointer", transition: "background 0.25s, border-color 0.25s" }}>
                    {isActive && !paused && <div style={{ position: "absolute", bottom: 0, left: 0, height: 2, width: `${fillPct}%`, background: C.honey, transition: "none" }} aria-hidden="true" />}
                    <div style={{ width: 36, height: 36, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }} aria-hidden="true">
                      <i className={`fa-solid ${persona.icon}`} style={{ color: isActive ? C.honey : "rgba(244,244,244,0.28)", fontSize: 13, transition: "color 0.25s" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? C.text : C.muted, transition: "color 0.25s", marginBottom: 2 }}>{persona.role}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: isActive ? C.honey : "rgba(244,244,244,0.28)", transition: "color 0.25s" }}>{persona.tagline}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div style={{ overflow: "hidden", background: "rgba(26,20,16,0.6)", border: "1px solid rgba(255,255,255,0.09)" }}>
              <div style={{ height: 1, width: "100%", background: `linear-gradient(to right, ${C.honey}, rgba(255,179,12,0.35), transparent)` }} aria-hidden="true" />
              <div style={{ padding: isMobile ? "28px 20px" : "36px 32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                  <i className={`fa-solid ${p.icon}`} style={{ color: C.honey, fontSize: 17, flexShrink: 0 }} aria-hidden="true" />
                  <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: C.text, lineHeight: 1.25, letterSpacing: "-0.02em", margin: 0 }}>{p.role}</h3>
                </div>
                <p style={{ fontSize: "0.9375rem", color: C.muted, lineHeight: 1.75, marginBottom: 24 }}>{p.value}</p>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8 }}>
                  {p.bullets.map((b, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "1px solid rgba(255,179,12,0.14)", background: "rgba(255,179,12,0.04)" }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.honey, flexShrink: 0 }} aria-hidden="true" />
                      <span style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.4, fontWeight: 500 }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => { startRef.current = Date.now(); setFillPct(0); setPaused(false); }}
            style={{ display: "flex", gap: "32px", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s" }}>
            <div style={{ width: "45%", display: "flex", flexDirection: "column", gap: 8 }}>
              {PERSONAS.map((persona, i) => {
                const isActive = active === i;
                return (
                  <button key={persona.role} onClick={() => goTo(i)} onMouseEnter={() => goTo(i)}
                    style={{ position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: 16, width: "100%", padding: "18px 22px", textAlign: "left", background: isActive ? "rgba(255,179,12,0.18)" : "rgba(255,255,255,0.02)", border: `1px solid ${isActive ? "rgba(255,179,12,0.30)" : C.border}`, boxShadow: isActive ? "inset 0 0 20px rgba(255,179,12,0.04)" : "none", cursor: "pointer", transition: "background 0.25s, border-color 0.25s" }}>
                    {isActive && !paused && <div style={{ position: "absolute", bottom: 0, left: 0, height: 2, width: `${fillPct}%`, background: C.honey, boxShadow: `0 0 6px ${C.honey}`, transition: "none" }} aria-hidden="true" />}
                    <div style={{ width: 40, height: 40, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }} aria-hidden="true">
                      <i className={`fa-solid ${persona.icon}`} style={{ color: isActive ? C.honey : "rgba(244,244,244,0.28)", fontSize: 14, transition: "color 0.25s" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3, color: isActive ? C.text : C.muted, transition: "color 0.25s", marginBottom: 2 }}>{persona.role}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: isActive ? C.honey : "rgba(244,244,244,0.28)", transition: "color 0.25s" }}>{persona.tagline}</div>
                    </div>
                    <span style={{ fontSize: 14, marginLeft: "auto", color: isActive ? C.honey : "rgba(244,244,244,0.15)", transform: isActive ? "translateX(3px)" : "none", transition: "color 0.25s, transform 0.25s" }} aria-hidden="true">&#x2192;</span>
                  </button>
                );
              })}
            </div>
            <div style={{ width: "55%" }}>
              <div style={{ position: "sticky", top: 96, overflow: "hidden", background: "rgba(26,20,16,0.6)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: `0 0 50px rgba(255,179,12,0.06), inset 0 1px 0 rgba(255,255,255,0.06)`, minHeight: 380 }}>
                <div style={{ height: 1, width: "100%", background: `linear-gradient(to right, ${C.honey}, rgba(255,179,12,0.35), transparent)` }} aria-hidden="true" />
                <div style={{ position: "absolute", top: -32, right: -32, width: 176, height: 176, pointerEvents: "none", background: `radial-gradient(circle, rgba(255,179,12,0.12) 0%, transparent 70%)`, filter: "blur(40px)" }} aria-hidden="true" />
                <div style={{ position: "relative", padding: "40px 44px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                    <i className={`fa-solid ${p.icon}`} style={{ color: C.honey, fontSize: 17, flexShrink: 0 }} aria-hidden="true" />
                    <h3 style={{ fontSize: "1.1875rem", fontWeight: 700, color: C.text, lineHeight: 1.25, letterSpacing: "-0.02em", margin: 0 }}>{p.role}</h3>
                  </div>
                  <p style={{ fontSize: "0.9375rem", color: C.muted, lineHeight: 1.75, marginBottom: 32 }}>{p.value}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {p.bullets.map((b, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "1px solid rgba(255,179,12,0.14)", background: "rgba(255,179,12,0.04)" }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.honey, flexShrink: 0 }} aria-hidden="true" />
                        <span style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.4, fontWeight: 500 }}>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Section 8: Proof + CTA ───────────────────────────────────────────────────
const FEATURES = [
  { icon: "fa-chart-bar",      iconColor: C.honey,    bg: "rgba(255,179,12,0.10)", title: "Pricing Intelligence", desc: "Identify pricing gaps across advisors, clients, products, branches, and peer groups before they erode margin." },
  { icon: "fa-bolt",           iconColor: C.mandarin, bg: "rgba(251,86,7,0.10)",   title: "AI-Native Actions",    desc: "Turn pricing and practice intelligence into recommended advisor actions that are specific, timely, and tied to their book." },
  { icon: "fa-arrow-trend-up", iconColor: C.azure,    bg: "rgba(59,132,255,0.10)", title: "Enterprise Value",     desc: "Connect better pricing discipline and advisor behavior to measurable firm-level growth." },
];

function ProofCTA() {
  const ref = useRef<HTMLElement>(null);
  const { isMobile, isTablet } = useBreakpoint();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.05 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const innerPad = isMobile ? "0 20px" : isTablet ? "0 32px" : "0 48px";

  return (
    <section ref={ref} style={{ background: C.bg, padding: isMobile ? "64px 0 80px" : "40px 0 80px", position: "relative" }}>
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 700, height: 400, pointerEvents: "none", background: "radial-gradient(ellipse, rgba(255,179,12,0.06) 0%, transparent 60%)" }} aria-hidden="true" />
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: innerPad, boxSizing: "border-box" }}>
        <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.8s ease 0.3s" }}>
          <div style={{ padding: "0 0 64px" }}>
            <div style={{ display: "flex", flexDirection: isTablet ? "column" : "row", alignItems: isTablet ? "stretch" : "center", gap: isTablet ? "40px" : "80px" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: isMobile ? 24 : 32 }}>
                {FEATURES.map((f, i) => (
                  <div key={f.title} style={{ display: "flex", alignItems: "flex-start", gap: 20, opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-12px)", transition: `opacity 0.5s ease ${0.4 + i * 0.1}s, transform 0.5s ease ${0.4 + i * 0.1}s` }}>
                    <div style={{ width: 48, height: 48, flexShrink: 0, display: "flex", alignItems: "flex-start", justifyContent: "flex-start" }} aria-hidden="true">
                      <i className={`fa-solid ${f.icon}`} style={{ color: f.iconColor, fontSize: 17 }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4, lineHeight: 1 }}>{f.title}</p>
                      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, lineHeight: 1.06, color: C.text, letterSpacing: "-0.025em", marginBottom: 16 }}>
                  Find the{" "}<span style={{ background: SUNSET, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>pricing opportunities</span>{" "}inside your firm.
                </h2>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, maxWidth: 380, marginBottom: 36 }}>
                  A Revenue Performance Assessment helps identify where revenue, margin, advisor productivity, and enterprise value may be trapped inside disconnected systems.
                </p>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16 }}>
                  <Link href="/contact" className="btn-primary">Request a Demo</Link>
                  <span style={{ fontSize: 12, color: C.subtle, fontWeight: 500 }}>Trusted by leading financial firms worldwide.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Global: reduced motion ───────────────────────────────────────────────────
const globalStyles = `
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
  }
`;

// ─── Page export ──────────────────────────────────────────────────────────────
export default function PracticeManagementPage() {
  return (
    <>
      <style>{globalStyles}</style>
      <main id="main-content" style={{ fontFamily: "'Carlito', 'Segoe UI', sans-serif", background: C.bg, overflow: "hidden" }}>
        <Hero />
        <TheChallenge />
        <IntelligenceScores />
        <ActionFeed />
        <WhyItMatters />
        <BuiltForWho />
        <PlatformConnection />
        <ProofCTA />
        <PracticeManagementFAQSection />
      </main>
    </>
  );
}
