"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
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

// Order: 1. Grow Profitable Revenue, 2. Improve Control, 3. Reduce Leakage
const FEATURES = [
  {
    icon: "fa-chart-line",
    iconColor: "#fb5607",
    title: "Grow Profitable Revenue",
    desc: "Connect pricing, billing, compensation, and insights to drive faster growth and stronger profitability.",
  },
  {
    icon: "fa-chart-line",
    iconColor: "#0DCCFF",
    title: "Improve Control",
    desc: "Connect revenue data, workflows, and decisions in one trusted foundation. One version of the truth.",
  },
  {
    icon: "fa-shield-halved",
    iconColor: "#3b84ff",
    title: "Reduce Leakage",
    desc: "Capture more of the revenue your firm has already earned with stronger controls, cleaner data, and governed execution.",
  },
];

export default function ContactRow() {
  const { isMobile, isTablet } = useBreakpoint();
  const panelPad = isMobile ? "40px 20px" : isTablet ? "48px 32px" : "64px 0px";
  return (
    <section className="relative bg-[#140f0c]" style={{ paddingBottom: isMobile ? 48 : 56 }}>
      {/* Subtle indigo glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2"
        style={{ width: isMobile ? 320 : 600, height: isMobile ? 180 : 300, background: "radial-gradient(ellipse,rgba(71,96,255,0.12) 0%,transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl" style={{ padding: isMobile ? "0 20px" : isTablet ? "0 32px" : "0 48px" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Panel */}
          <div className="bg-[#140f0c]" style={{ padding: panelPad }}>
            <div style={{ display: "grid", gridTemplateColumns: isTablet ? "1fr" : "1fr 1fr", gap: isMobile ? 32 : isTablet ? 40 : 64, alignItems: "center" }}>

              {/* Left: feature list */}
              <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 24 : 32 }}>
                {FEATURES.map(({ icon, iconColor, title, desc }, i) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex items-start gap-4 sm:gap-5"
                  >
                    <div
                      className="flex h-12 w-12 flex-shrink-0 items-top justify-top"
                      aria-hidden="true"
                    >
                      <i className={`fa-solid ${icon} text-lg`} style={{ color: iconColor }} />
                    </div>
                    <div>
                      <p className="text-[#f4f4f4] font-bold text-base leading-none">{title}</p>
                      <p className="mt-1 text-sm text-[#f4f4f4]/50 leading-relaxed">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Right: headline + CTA */}
              <div>
                <motion.h2
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="font-bold leading-[1.06] text-[#f4f4f4]"
                  style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
                >
                  <span
                    style={{
                      background: "linear-gradient(135deg,#FACC22,#FB5607,#4760FF,#0DCCFF)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Discover the hidden revenue opportunities
                  </span>{" "}
                  <span className="text-[#f4f4f4]">
                    inside your firm.
                  </span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="mt-4 text-sm text-[#f4f4f4]/55 leading-relaxed max-w-sm"
                >
                  A Revenue Performance Assessment helps identify where revenue, margin,
                  advisor productivity, and enterprise value may be trapped inside
                  disconnected systems.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  className="mt-6 sm:mt-8 flex flex-col items-start gap-4"
                >
                  <Link href="/contact" className="btn-primary">
                    Book a Consultation
                  </Link>
                  <p className="text-xs text-[#f4f4f4]/25 font-medium">
                    Trusted by leading financial firms worldwide.
                  </p>
                </motion.div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}