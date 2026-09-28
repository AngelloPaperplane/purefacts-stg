"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";


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

// ─── Spreadsheet Chaos Canvas ──────────────────────────────────────────────

const CELL_VALUES = [
  "1,247,830","0.25%","$4,200","98.3","2,500,000",
  "FEE","0.0175","BPS","12.50","AUM",
  "247.50","1.00","99.8%","3,412","0.50%",
  "NAV","44,200","0.125","19,847","2.75",
  "ADV","1,000","—","0.375","85,000",
  "7,500","0.0%","P&L","4.125","250K",
  "18,500","REV","0.025","3.50%","1M",
  "6,250","COMP","99","0.15","44.2",
];

const COL_HEADERS = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N"];
const ROW_HEADERS = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20"];

interface SpreadCell {
  col: number;
  row: number;
  value: string;
  frame: number;
  duration: number;
  phase: "typing" | "hold" | "fade";
  typedLen: number;
  typeTimer: number;
  opacity: number;
  hasRect: boolean;
  isSelected: boolean;
}

function SpreadsheetChaos() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0, raf = 0;
    let tick = 0;

    const COL_W = 82;
    const ROW_H = 22;
    const HEADER_COL = 28;
    const HEADER_ROW = 20;

    let numCols = 0, numRows = 0;
    const active = new Map<string, SpreadCell>();

    function resize() {
      W = canvas!.width = canvas!.offsetWidth;
      H = canvas!.height = canvas!.offsetHeight;
      numCols = Math.ceil((W - HEADER_COL) / COL_W) + 1;
      numRows = Math.ceil((H - HEADER_ROW) / ROW_H) + 1;
    }

    function zoneAlpha(px: number, py: number, max: number): number {
      const cx = W * 0.5, cy = H * 0.5;
      const zW = W * 0.64, zH = H * 0.60;
      const dx = Math.abs(px - cx) / (zW * 0.5);
      const dy = Math.abs(py - cy) / (zH * 0.5);
      if (dx < 1 && dy < 1) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        return max * Math.pow(Math.max(0, dist - 0.15) / 0.85, 2.5) * 0.18;
      }
      const edgeX = Math.min(px, W - px) / (W * 0.18);
      const boost = edgeX < 1 ? 1 + (1 - edgeX) * 0.6 : 1;
      return max * boost;
    }

    function spawnCell() {
      const col = Math.floor(Math.random() * numCols);
      const row = Math.floor(Math.random() * numRows);
      const key = `${col},${row}`;
      if (active.has(key)) return;

      const px = HEADER_COL + col * COL_W + COL_W * 0.5;
      const py = HEADER_ROW + row * ROW_H + ROW_H * 0.5;

      const cx = W * 0.5, cy = H * 0.5;
      const dx = Math.abs(px - cx) / (W * 0.30);
      const dy = Math.abs(py - cy) / (H * 0.28);
      if (dx < 1 && dy < 1) return;

      const value = CELL_VALUES[Math.floor(Math.random() * CELL_VALUES.length)];
      const holdFrames = 60 + Math.floor(Math.random() * 140);

      active.set(key, {
        col, row, value,
        frame: 0,
        duration: holdFrames,
        phase: "typing",
        typedLen: 0,
        typeTimer: 0,
        opacity: 0.34 + Math.random() * 0.18,
        hasRect: Math.random() > 0.35,
        isSelected: Math.random() > 0.82,
      });
    }

    function drawGridLines() {
      ctx!.lineWidth = 0.5;
      for (let c = 0; c <= numCols; c++) {
        const x = HEADER_COL + c * COL_W;
        const alpha = zoneAlpha(x, H * 0.5, 0.07);
        ctx!.strokeStyle = `rgba(59,132,255,${alpha})`;
        ctx!.beginPath();
        ctx!.moveTo(x, HEADER_ROW);
        ctx!.lineTo(x, H);
        ctx!.stroke();
      }
      for (let r = 0; r <= numRows; r++) {
        const y = HEADER_ROW + r * ROW_H;
        const alpha = zoneAlpha(W * 0.5, y, 0.07);
        ctx!.strokeStyle = `rgba(59,132,255,${alpha})`;
        ctx!.beginPath();
        ctx!.moveTo(HEADER_COL, y);
        ctx!.lineTo(W, y);
        ctx!.stroke();
      }
    }

    function drawHeaders() {
      ctx!.font = `400 9px 'Carlito', monospace`;
      ctx!.textAlign = "center";
      for (let c = 0; c < Math.min(numCols, COL_HEADERS.length); c++) {
        const x = HEADER_COL + c * COL_W + COL_W * 0.5;
        const alpha = zoneAlpha(x, HEADER_ROW * 0.5, 0.13);
        ctx!.fillStyle = `rgba(59,132,255,${alpha})`;
        ctx!.fillText(COL_HEADERS[c], x, HEADER_ROW - 5);
      }
      ctx!.textAlign = "right";
      for (let r = 0; r < Math.min(numRows, ROW_HEADERS.length); r++) {
        const y = HEADER_ROW + r * ROW_H + ROW_H * 0.72;
        const alpha = zoneAlpha(HEADER_COL * 0.5, y, 0.13);
        ctx!.fillStyle = `rgba(59,132,255,${alpha})`;
        ctx!.fillText(ROW_HEADERS[r], HEADER_COL - 5, y);
      }
      const hAlpha = zoneAlpha(W * 0.5, HEADER_ROW, 0.08);
      ctx!.strokeStyle = `rgba(59,132,255,${hAlpha})`;
      ctx!.lineWidth = 0.5;
      ctx!.beginPath();
      ctx!.moveTo(HEADER_COL, HEADER_ROW);
      ctx!.lineTo(W, HEADER_ROW);
      ctx!.stroke();
      ctx!.beginPath();
      ctx!.moveTo(HEADER_COL, HEADER_ROW);
      ctx!.lineTo(HEADER_COL, H);
      ctx!.stroke();
    }

    function drawCells() {
      for (const [key, cell] of active) {
        cell.frame++;

        if (cell.phase === "typing") {
          cell.typeTimer++;
          if (cell.typeTimer >= 3) {
            cell.typeTimer = 0;
            cell.typedLen = Math.min(cell.typedLen + 1, cell.value.length);
          }
          if (cell.typedLen >= cell.value.length) {
            cell.phase = "hold";
            cell.frame = 0;
          }
        } else if (cell.phase === "hold") {
          if (cell.frame >= cell.duration) {
            cell.phase = "fade";
            cell.frame = 0;
          }
        } else {
          if (cell.frame >= 30) { active.delete(key); continue; }
        }

        const fadeAlpha =
          cell.phase === "fade"
            ? 1 - cell.frame / 30
            : cell.phase === "typing" && cell.typedLen < 2
            ? cell.typedLen / 2
            : 1;

        const cx2 = HEADER_COL + cell.col * COL_W;
        const cy2 = HEADER_ROW + cell.row * ROW_H;
        const px = cx2 + COL_W * 0.5;
        const py = cy2 + ROW_H * 0.5;

        const baseAlpha = cell.opacity * fadeAlpha;
        const alpha = zoneAlpha(px, py, baseAlpha);
        if (alpha < 0.005) continue;

        const displayVal = cell.value.slice(0, cell.typedLen);

        if (cell.hasRect) {
          if (cell.isSelected) {
            ctx!.fillStyle = `rgba(59,132,255,${alpha * 0.12})`;
            ctx!.fillRect(cx2, cy2, COL_W, ROW_H);
            ctx!.strokeStyle = `rgba(59,132,255,${alpha * 0.9})`;
            ctx!.lineWidth = 1;
            ctx!.strokeRect(cx2 + 0.5, cy2 + 0.5, COL_W - 1, ROW_H - 1);
          } else {
            ctx!.strokeStyle = `rgba(59,132,255,${alpha * 0.5})`;
            ctx!.lineWidth = 0.75;
            ctx!.strokeRect(cx2 + 0.5, cy2 + 0.5, COL_W - 1, ROW_H - 1);
          }
        }

        const showCursor = cell.phase === "typing" && Math.floor(tick / 20) % 2 === 0;
        const text = displayVal + (showCursor ? "|" : "");

        ctx!.font = `400 9.5px 'Carlito', 'SF Mono', monospace`;
        ctx!.textAlign = "right";
        ctx!.fillStyle = cell.isSelected
          ? `rgba(120,180,255,${alpha * 1.4})`
          : `rgba(180,205,240,${alpha})`;
        ctx!.fillText(text, cx2 + COL_W - 5, cy2 + ROW_H * 0.72);
      }
    }

    function spawnBurst() {
      const startCol = Math.floor(Math.random() * (numCols - 4));
      const startRow = Math.floor(Math.random() * (numRows - 3));
      const bCols = 2 + Math.floor(Math.random() * 3);
      const bRows = 1 + Math.floor(Math.random() * 2);
      for (let dc = 0; dc < bCols; dc++) {
        for (let dr = 0; dr < bRows; dr++) {
          const key = `${startCol + dc},${startRow + dr}`;
          if (!active.has(key)) {
            const px = HEADER_COL + (startCol + dc) * COL_W + COL_W * 0.5;
            const py = HEADER_ROW + (startRow + dr) * ROW_H + ROW_H * 0.5;
            const cx = W * 0.5, cy = H * 0.5;
            const dx = Math.abs(px - cx) / (W * 0.30);
            const dy = Math.abs(py - cy) / (H * 0.28);
            if (dx < 1 && dy < 1) continue;
            const value = CELL_VALUES[Math.floor(Math.random() * CELL_VALUES.length)];
            active.set(key, {
              col: startCol + dc, row: startRow + dr,
              value,
              frame: 0,
              duration: 50 + Math.floor(Math.random() * 80),
              phase: "typing",
              typedLen: 0,
              typeTimer: Math.floor(Math.random() * 5),
              opacity: 0.30 + Math.random() * 0.3,
              hasRect: true,
              isSelected: dc === 0 && dr === 0,
            });
          }
        }
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      tick++;

      drawGridLines();
      drawHeaders();
      drawCells();

      if (tick % 11 === 0) spawnCell();
      if (tick % 7 === 0) spawnCell();
      if (tick % 90 === 0) spawnBurst();
      if (tick % 130 === 0) spawnBurst();

      raf = requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    draw();

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}

// ─── Gradient style helpers ─────────────────────────────────────────────────

const gradientTextStyle: React.CSSProperties = {
  background: "linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

// ─── Hero ──────────────────────────────────────────────────────────────────

export default function Hero() {
  const { isMobile, isTablet } = useBreakpoint();
  return (
    <section
      className="relative w-full bg-[#140f0c] flex items-center overflow-hidden"
      style={{ height: isMobile ? "auto" : "calc(100dvh - var(--nav-height, 64px))", minHeight: isMobile ? 640 : 540, padding: isMobile ? "96px 0 72px" : "0" }}
    >
      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Spreadsheet Chaos */}
      <SpreadsheetChaos />

      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 78% 72% at 50% 50%, transparent 28%, rgba(20,15,12,0.72) 100%)",
        }}
      />

      {/* Subtle center glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 45% at 38% 52%, rgba(59,132,255,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto" style={{ padding: isMobile ? "0 20px" : isTablet ? "0 32px" : "0 48px" }}>
        <div style={{ maxWidth: isMobile ? 720 : 896 }}>

          {/* Headline */}
          <motion.h1
            className="font-bold leading-[1.06] tracking-tight text-white mb-5"
            style={{ fontSize: "clamp(2.2rem, 5.5vw, 80px)" }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            Double Your{" "}
            <span style={gradientTextStyle}>Organic Growth Rate</span>
            {" "}with Revenue Performance Management
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-white/75 leading-relaxed max-w-2xl mb-10"
            style={{ fontSize: isMobile ? "1rem" : "clamp(1.125rem, 1.8vw, 1.25rem)", fontWeight: 400 }}
          >
            Turn disconnected revenue processes into a coordinated system for growth, profitability, and scale by consolidating Pricing, Compensation, and Fees on a single Revenue Book of Record.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-wrap items-center gap-4"
            style={{ flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center" }}
          >
            <a href="/platform" className="btn-primary">
              Explore the Platform
            </a>

            <a
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              Talk to an Expert
              <span className="text-[#3b84ff]">→</span>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#140f0c] to-transparent pointer-events-none" />
    </section>
  );
}