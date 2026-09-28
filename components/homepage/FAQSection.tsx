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
    question: "What is revenue performance management for wealth management firms?",
    answer:
      "Revenue performance management is the discipline of designing, capturing, distributing, measuring, and optimizing revenue across the full revenue lifecycle. For wealth and asset management firms, it connects commercial strategy to the operational systems that support fee billing, advisor compensation, and practice-level revenue intelligence. Without a centralized approach, firms risk revenue leakage, billing errors, operational inefficiencies, and limited visibility into profitability.",
  },
  {
    question: "What is a Revenue Book of Record?",
    answer:
      "A Revenue Book of Record is a centralized system that serves as the authoritative source for all revenue-related data, calculations, workflows, and reporting across an organization. For wealth and asset management firms, it consolidates information related to fee billing, advisor compensation, revenue sharing, and practice performance. This creates a consistent and auditable foundation for managing revenue operations.",
  },
  {
    question: "What does PureFacts do?",
    answer:
      "PureFacts is a B2B enterprise fintech company that helps wealth and asset management firms improve revenue performance through its PureRevenue Platform. The platform connects Fees and Billing, Compensation, and Practice Management on a single Revenue Book of Record. By centralizing revenue operations, PureFacts enables firms to automate complex workflows, reduce revenue leakage, improve billing and compensation accuracy, and gain actionable revenue intelligence.",
  },
  {
    question: "How much revenue do wealth management firms lose to billing errors and operational leakage?",
    answer:
      "Revenue leakage is a significant challenge for wealth management firms. Manual processes, disconnected systems, inaccurate fee calculations, and compensation errors can result in lost revenue and increased operational costs. Common sources of leakage include incorrect fee billing, missed billing opportunities, data inconsistencies, and compensation calculation errors. Implementing automated revenue performance management solutions can help firms identify and recover lost revenue while reducing future leakage.",
  },
  {
    question: "What are the best software solutions for revenue performance management?",
    answer:
      "The best revenue performance management software solutions provide automation, transparency, scalability, and analytics across the revenue lifecycle. Key capabilities include revenue calculation and reconciliation, fee billing automation, advisor compensation management, revenue reporting and analytics, and enterprise integration. For wealth and asset management firms, PureFacts combines Fees and Billing, Compensation, and Practice Management on a single platform, helping firms reduce revenue leakage, improve operational efficiency, and gain actionable revenue intelligence.",
  },
  {
    question: "How do you compare revenue performance management tools by features?",
    answer:
      "When evaluating revenue performance management tools, organizations should compare platforms based on revenue automation capabilities, billing and fee management functionality, compensation management support, reporting and analytics, data accuracy and governance, integration with existing systems, and scalability for future growth. For wealth and asset management firms, solutions that unify revenue workflows on a single platform often deliver greater value than disconnected point solutions.",
  },
  {
    question: "What are the best practices for implementing a revenue performance management strategy?",
    answer:
      "Successful revenue performance management strategies focus on aligning people, processes, and technology around revenue optimization. Best practices include: establishing a single source of truth for revenue data, automating manual revenue and billing processes, standardizing compensation and fee calculation rules, monitoring performance with consistent KPIs, improving data quality and governance, integrating revenue systems across business functions, and continuously analyzing and optimizing revenue outcomes.",
  },
  {
    question: "What are the key revenue cycle management performance indicators?",
    answer:
      "Key performance indicators for revenue cycle management measure the effectiveness, accuracy, and efficiency of revenue operations. Common KPIs include revenue leakage rate, billing accuracy, revenue realization rate, days sales outstanding, fee collection rate, compensation accuracy, revenue per advisor, operating margin, and cost to collect revenue. For wealth and asset management firms, monitoring these metrics helps identify inefficiencies and improve revenue outcomes.",
  },
  {
    question: "What are the 7 principles of revenue management?",
    answer:
      "The seven core principles of revenue management help organizations maximize revenue while improving operational efficiency: understand your client segments, align pricing and fees with value delivered, forecast revenue accurately, optimize resource allocation, use data-driven decision-making, continuously monitor performance metrics, and adapt strategies based on market and business conditions. In wealth and asset management, applying these principles requires accurate revenue data, transparent reporting, and automated operational processes.",
  },
  {
    question: "What are the top-rated revenue performance management platforms for enterprise use?",
    answer:
      "Enterprise revenue performance management platforms are designed to support complex revenue models, large-scale operations, and regulatory requirements. Leading solutions offer enterprise-grade scalability, workflow automation, advanced reporting and analytics, revenue governance controls, integration with core business systems, and multi-entity support. For wealth and asset management enterprises, the PureFacts PureRevenue Platform provides a comprehensive solution built specifically for the industry's unique requirements.",
  },
];

// ── Inner FAQ accordion item ──────────────────────────────────────────────────

function FAQItem({
  faq,
  index,
  isOpen,
  onToggle,
  isMobile,
}: {
  faq: (typeof FAQS)[0];
  index: number;
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
                paddingLeft: 0,
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

// ── Outer section accordion ───────────────────────────────────────────────────

export default function FAQSection() {
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
      aria-labelledby="faq-heading"
    >
      <div
        className="max-w-7xl mx-auto"
        style={{ padding: isMobile ? "0 20px" : isTablet ? "0 32px" : "0 48px" }}
      >
        {/* Outer accordion trigger */}
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
            aria-controls="faq-inner"
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
                id="faq-heading"
                className="font-bold text-[#f4f4f4] leading-tight"
                style={{ fontSize: "clamp(1.25rem, 2vw, 1.6rem)", margin: 0 }}
              >
                Common questions
              </h2>
            </div>

            {/* Outer toggle icon */}
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

          {/* Inner FAQ list */}
          <AnimatePresence initial={false}>
            {sectionOpen && (
              <motion.div
                id="faq-inner"
                key="faq-inner"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                style={{ overflow: "hidden" }}
              >
                <div
                  style={{
                    paddingBottom: isMobile ? 28 : 36,
                    paddingLeft: isMobile ? 0 : 0,
                  }}
                >
                  {/* Optional subheading inside */}
                  <p
                    className="text-[#f4f4f4]/40 leading-relaxed"
                    style={{
                      fontSize: "0.9rem",
                      marginBottom: isMobile ? 16 : 20,
                      maxWidth: 480,
                    }}
                  >
                    Everything you need to know about revenue performance management and the PureRevenue Platform.
                  </p>

                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    {FAQS.map((faq, i) => (
                      <FAQItem
                        key={i}
                        faq={faq}
                        index={i}
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