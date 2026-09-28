"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

const FAQS = [
  {
    question: "What is PureRevenue and how does it work?",
    answer:
      "PureRevenue is wealth management software built by PureFacts that connects Fees and Billing, Compensation, and Practice Management on a single Revenue Book of Record. It automates complex fee calculations, advisor payout workflows, and practice-level revenue reporting so that wealth and asset management firms can run revenue operations from one integrated platform.",
  },
  {
    question: "How does PureFacts connect fee billing, compensation, and practice management?",
    answer:
      "All three modules in the PureRevenue platform share a common data foundation called the Revenue Book of Record. This means fee billing, advisor compensation, and practice management analytics all draw from the same client, account, contract, and pricing data. There is no reconciliation between systems, no manual data transfers, and one consistent view of revenue across the firm.",
  },
  {
    question: "What types of financial firms use PureRevenue?",
    answer:
      "PureRevenue is used by wealth management firms, asset managers, broker-dealers, banks, custodians, and family offices. The platform is built for enterprises managing complex fee schedules, large advisor populations, and high volumes of automated billing and compensation workflows.",
  },
  {
    question: "How is a connected revenue platform different from point solutions?",
    answer:
      "Point solutions handle individual tasks in isolation. A connected revenue platform like PureRevenue links fee billing, advisor compensation, and practice management to a single data foundation. This eliminates reconciliation gaps, surfaces cross-system insights such as pricing exceptions and advisor performance signals, and lets improvements in one area compound across the business rather than staying isolated.",
  },
];

function FAQItem({
  faq,
  isOpen,
  onToggle,
  isMobile,
}: {
  faq: (typeof FAQS)[0];
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
}) {
  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full text-left flex items-start justify-between gap-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b84ff]/40"
        style={{
          padding: isMobile ? "16px 0" : "18px 0",
          cursor: "pointer",
          background: "none",
          border: "none",
        }}
      >
        <span
          className="text-[#f4f4f4]/80 leading-snug"
          style={{ fontSize: isMobile ? "0.9rem" : "0.9375rem", fontWeight: 500 }}
        >
          {faq.question}
        </span>

        <motion.svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          style={{ flexShrink: 0, marginTop: 3 }}
          aria-hidden="true"
        >
          <path
            d="M6 1v10M1 6h10"
            stroke="#3b84ff"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="faq-answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p
              className="text-[#f4f4f4]/50 leading-relaxed"
              style={{
                fontSize: isMobile ? "0.875rem" : "0.9375rem",
                paddingBottom: isMobile ? 16 : 20,
              }}
            >
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PlatformFAQSection() {
  const { isMobile, isTablet } = useBreakpoint();
  const [sectionOpen, setSectionOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggleSection() {
    setSectionOpen((v) => !v);
    if (sectionOpen) setOpenIndex(null);
  }

  function toggleItem(i: number) {
    setOpenIndex(openIndex === i ? null : i);
  }

  return (
    <section
      className="bg-[#140f0c]"
      style={{ padding: isMobile ? "0 0 48px" : "0 0 64px" }}
      aria-labelledby="platform-faq-heading"
    >
      <div
        className="max-w-7xl mx-auto"
        style={{ padding: isMobile ? "0 20px" : isTablet ? "0 32px" : "0 48px" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <button
            onClick={toggleSection}
            aria-expanded={sectionOpen}
            aria-controls="platform-faq-inner"
            className="w-full text-left flex items-center justify-between gap-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b84ff]/40"
            style={{
              padding: isMobile ? "28px 0" : "32px 0",
              cursor: "pointer",
              background: "none",
              border: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <p
                className="font-bold tracking-[0.18em] uppercase"
                style={{ fontSize: 10, color: "#3b84ff", margin: 0 }}
              >
                FAQ
              </p>
              <h2
                id="platform-faq-heading"
                className="font-bold text-[#f4f4f4] leading-tight"
                style={{ fontSize: "clamp(1.25rem, 2vw, 1.6rem)", margin: 0 }}
              >
                Common questions
              </h2>
            </div>

            <span
              style={{
                width: 32,
                height: 32,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(59,132,255,0.35)",
                borderRadius: "50%",
                background: sectionOpen ? "rgba(59,132,255,0.12)" : "transparent",
                transition: "background 0.2s",
              }}
              aria-hidden="true"
            >
              <motion.svg
                width="13"
                height="13"
                viewBox="0 0 12 12"
                fill="none"
                animate={{ rotate: sectionOpen ? 45 : 0 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              >
                <path
                  d="M6 1v10M1 6h10"
                  stroke="#3b84ff"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </motion.svg>
            </span>
          </button>

          <AnimatePresence initial={false}>
            {sectionOpen && (
              <motion.div
                id="platform-faq-inner"
                key="platform-faq-inner"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ paddingBottom: isMobile ? 28 : 36 }}>
                  <p
                    className="text-[#f4f4f4]/40 leading-relaxed"
                    style={{
                      fontSize: "0.9rem",
                      marginBottom: isMobile ? 16 : 20,
                      maxWidth: 480,
                    }}
                  >
                    Common questions about the PureRevenue wealth management platform and how it works.
                  </p>

                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    {FAQS.map((faq, i) => (
                      <FAQItem
                        key={i}
                        faq={faq}
                        isOpen={openIndex === i}
                        onToggle={() => toggleItem(i)}
                        isMobile={isMobile}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}