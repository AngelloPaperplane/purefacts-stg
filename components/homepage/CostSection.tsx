"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

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

type Silo = {
  id: string;
  label: string;
  stat: string;
  statDetail: string[];
  source: string;
  sourceUrl: string;
  accentColor: string;
  borderColor: string;
  gradientFrom: string;
  gradientTo: string;
};

// Order: Pricing (was Performance), Compensation, Billing
const SILOS: Silo[] = [
  {
    id: "pricing",
    label: "PRICING",
    stat: "10–15%",
    statDetail: ["revenue improvement available", "through pricing discipline alone"],
    source: "Cerulli Associates, 2025",
    sourceUrl: "https://www.cerulli.com/cerulli-capabilities-pricing-and-profitability-analysis",
    accentColor: "#ffb30c",
    borderColor: "rgba(255,179,12,0.30)",
    gradientFrom: "rgba(255,179,12,0.12)",
    gradientTo:   "rgba(255,179,12,0.02)",
  },
  {
    id: "compensation",
    label: "COMPENSATION",
    stat: "5%",
    statDetail: ["of advisor's time wasted understanding", "and validating compensation"],
    source: "PwC Asset and Wealth Management Survey, 2024",
    sourceUrl: "https://www.pwc.com/gx/en/1/issues/reinvention/asset-wealth-management-revolution.html",
    accentColor: "#FF006E",
    borderColor: "rgba(255,0,110,0.30)",
    gradientFrom: "rgba(255,0,110,0.12)",
    gradientTo:   "rgba(255,0,110,0.02)",
  },
  {
    id: "billing",
    label: "BILLING",
    stat: "2–5%",
    statDetail: ["of revenue lost annually", "to operational leakage"],
    source: "McKinsey, 2024",
    sourceUrl: "https://www.mckinsey.com/capabilities/risk-and-resilience/our-insights/operational-resilience-has-become-critical-how-are-banks-responding",
    accentColor: "#ED65D0",
    borderColor: "rgba(237,101,208,0.30)",
    gradientFrom: "rgba(237,101,208,0.12)",
    gradientTo:   "rgba(237,101,208,0.02)",
  },
];

function SiloCard({ silo, index }: { silo: Silo; index: number }) {
  const { isMobile } = useBreakpoint();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex-1 min-w-0 overflow-hidden"
      style={{
        padding: isMobile ? 24 : 28,
        background: `linear-gradient(180deg, ${silo.gradientFrom} 0%, ${silo.gradientTo} 100%)`,
        border: `1.5px solid ${silo.borderColor}`,
        borderRadius: "2px",
      }}
    >
      {/* Corner accents */}
      <span className="absolute top-0 left-0 w-7 h-[3px]" style={{ background: silo.accentColor }} />
      <span className="absolute top-0 left-0 w-[3px] h-7" style={{ background: silo.accentColor }} />
      <span className="absolute bottom-0 right-0 w-7 h-[3px]" style={{ background: silo.accentColor }} />
      <span className="absolute bottom-0 right-0 w-[3px] h-7" style={{ background: silo.accentColor }} />

      {/* Silo label */}
      <p className="text-s font-bold tracking-[0.22em] mb-5" style={{ color: silo.accentColor }}>
        {silo.label}
      </p>

      {/* Stat */}
      <p className="text-5xl font-bold text-[#f4f4f4] leading-none mb-2">{silo.stat}</p>
      {silo.statDetail.map((line, i) => (
        <p key={i} className="text-[15px] text-[#f4f4f4]/75 leading-snug">{line}</p>
      ))}

      {/* Source — linked for AI citation verification */}
      <a
        href={silo.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs mt-2.5 italic block hover:underline"
        style={{ color: silo.accentColor, opacity: 0.65 }}
      >
        {silo.source}
      </a>
    </motion.div>
  );
}

function GapDivider({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="hidden lg:flex flex-col items-center justify-center w-10 shrink-0 gap-2 py-12"
      aria-hidden
    >
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          style={{ height: 7, width: 1, background: i % 2 === 0 ? "white" : "gray", borderRadius: 999 }}
          animate={{ opacity: [0.15, 0.5, 0.15] }}
          transition={{ duration: 2 + i * 0.35, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
        />
      ))}
    </motion.div>
  );
}

export default function CostSection() {
  const { isMobile, isTablet } = useBreakpoint();
  return (
    <section className="bg-[#140f0c]" style={{ padding: isMobile ? "48px 0 64px" : "56px 0 72px" }}>
      <div className="max-w-7xl mx-auto" style={{ padding: isMobile ? "0 20px" : isTablet ? "0 32px" : "0 48px" }}>

        {/* Headline + subheading */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
          style={{ marginBottom: isMobile ? 32 : 48 }}
        >
          <h2 className="font-bold text-[#f4f4f4] leading-tight" style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}>
            Fragmented revenue systems quietly suppress growth.
          </h2>
          <p className="mt-4 text-base text-[#f4f4f4]/60 mx-auto leading-relaxed">
            Most firms are not held back by a lack of talent. It&rsquo;s due to their systems not being built to work together.
          </p>
        </motion.div>

        {/* Silos */}
        <div style={{ display: isTablet ? "grid" : "flex", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isTablet ? 12 : 0 }}>
          <SiloCard silo={SILOS[0]} index={0} />
          <GapDivider delay={0.3} />
          <SiloCard silo={SILOS[1]} index={1} />
          <GapDivider delay={0.45} />
          <SiloCard silo={SILOS[2]} index={2} />
        </div>

        {/* Consequence stat */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative mt-8 text-center"
          style={{ padding: "1.5px", background: "linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%)" }}
        >
          {/* Inner fill */}
          <div className="relative bg-[#140f0c]" style={{ padding: isMobile ? 24 : 32 }}>
            <span className="absolute top-0 left-0 w-7 h-[3px]" style={{ background: "linear-gradient(90deg,#FACC22,#FB5607)" }} />
            <span className="absolute top-0 left-0 w-[3px] h-7" style={{ background: "linear-gradient(180deg,#FACC22,#FB5607)" }} />
            <span className="absolute bottom-0 right-0 w-7 h-[3px]" style={{ background: "linear-gradient(270deg,#0DCCFF,#4760FF)" }} />
            <span className="absolute bottom-0 right-0 w-[3px] h-7" style={{ background: "linear-gradient(0deg,#0DCCFF,#4760FF)" }} />

            <p
              className="font-bold mb-2"
              style={{ fontSize: "clamp(2.2rem, 4vw, 3rem)" }}
            >
              <span style={{ color: "#FFFFFF" }}>2x to 3x </span>
              <span
                style={{
                  background: "linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Organic Growth Rate
              </span>
            </p>
            <p className="text-[15px] text-[#f4f4f4]/75 max-w-lg mx-auto leading-relaxed">
              through Revenue Performance Management.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}