"use client";
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
  return { isMobile: w < 640 };
}

// Lines 0–3 are the "problem" lines (indented on desktop).
// Lines 4–5 are the consequence lines (left-aligned, same as The Problem label).
const LINES = [
  {
    words: [
      { text: "Pricing",       color: "#fb5607" },
      { text: "is",            color: null },
      { text: "sub-optimally", color: null },
      { text: "designed",      color: null },
      { text: "and",           color: null },
      { text: "executed.",     color: null },
    ],
    indented: true,
  },
  {
    words: [
      { text: "Compensation", color: "#FF006E" },
      { text: "is",           color: null },
      { text: "misaligned",   color: null },
      { text: "with",         color: null },
      { text: "strategy.",    color: null },
    ],
    indented: true,
  },
  {
    words: [
      { text: "Billing",        color: "#ED65D0" },
      { text: "infrastructure", color: null },
      { text: "is",             color: null },
      { text: "antiquated.",    color: null },
    ],
    indented: true,
  },
  {
    words: [
      { text: "Incentives", color: "#ffb30c" },
      { text: "are",        color: null },
      { text: "not",        color: null },
      { text: "aligned.",   color: null },
    ],
    indented: true,
  },
  {
    words: [
      { text: "Systems",       color: null },
      { text: "are",           color: null },
      { text: "disconnected.", color: null },
    ],
    indented: true,
  },
  {
    words: [
      { text: "The",       color: null },
      { text: "result:",   color: null },
      { text: "$Millions", color: "#3b84ff" },
      { text: "are",       color: null },
      { text: "lost",      color: null },
      { text: "from",      color: null },
      { text: "the",       color: null },
      { text: "business.", color: null },
    ],
    indented: true,
  },
];

const fontSize = "clamp(2.15rem, 2.6vw, 2.6rem)";
const fontSizeMobile = "clamp(1.28rem, 6vw, 1.55rem)";

const gradientTextStyle: React.CSSProperties = {
  background: "linear-gradient(135deg,#FACC22 0%,#FB5607 35%,#4760FF 70%,#0DCCFF 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const lineVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export default function KineticChallengeStatic() {
  const { isMobile } = useBreakpoint();

  return (
    <section
      className="bg-[#140f0c]"
      style={{ padding: isMobile ? "26px 20px 64px" : "50px 0 96px" }}
      aria-label="Revenue fragmentation narrative"
    >
      <div
        className="max-w-7xl mx-auto"
        style={{ padding: isMobile ? "0" : "0 48px" }}
      >
        {/* Screen-reader and crawler fallback — visually hidden */}
        <p className="sr-only">
          The Problem: Pricing is sub-optimally designed and executed. Compensation is
          misaligned with strategy. Billing infrastructure is antiquated. Incentives are
          not aligned. Systems are disconnected. The result: millions are lost from the
          business. The cost of fragmentation is real.
        </p>

        {/* "The Problem" label */}
        <motion.p
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={lineVariants}
          className="font-bold text-white/80"
          style={{ fontSize: isMobile ? fontSizeMobile : fontSize, marginBottom: 20 }}
          aria-hidden="true"
        >
          The Problem
        </motion.p>

        {/* All lines */}
        <div className="flex flex-col gap-2" aria-hidden="true">
          {LINES.map((line, li) => (
            <motion.p
              key={li}
              custom={li + 1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={lineVariants}
              className="font-bold leading-tight"
              style={{
                fontSize: isMobile ? fontSizeMobile : fontSize,
                paddingLeft: !isMobile && line.indented ? "2rem" : 0,
              }}
            >
              {line.words.map((word, wi) => (
                <span
                  key={wi}
                  className="inline-block mr-[0.28em]"
                  style={
                    word.color === "gradient"
                      ? gradientTextStyle
                      : { color: word.color ?? "rgba(244,244,244,0.95)" }
                  }
                >
                  {word.text}
                </span>
              ))}
            </motion.p>
          ))}
        </div>

        {/* "The cost of fragmentation is real" */}
        <motion.p
          custom={LINES.length + 1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={lineVariants}
          className="text-center mt-12"
          style={{
            fontSize: isMobile ? fontSizeMobile : fontSize,
            fontWeight: 500,
            color: "rgba(244,244,244,0.95)",
          }}
          aria-hidden="true"
        >
          The{" "}
          <span style={{ color: "#3b84ff", fontWeight: 700 }}>cost</span>
          {" "}of fragmentation is{" "}
          <span style={{ color: "#3b84ff", fontWeight: 700 }}>real</span>
        </motion.p>
      </div>
    </section>
  );
}