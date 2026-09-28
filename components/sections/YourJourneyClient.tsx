"use client";

import type { Metadata } from 'next';
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ForkCard {
  tag: string;
  tagStyle: string;
  title: string;
  description: string;
  href: string;
  linkText: string;
}

interface Stop {
  type: "single" | "fork";
  milestone: number;
  tag?: string;
  tagStyle?: string;
  sideLabel?: string;
  title?: string;
  description?: string;
  href?: string;
  linkText?: string;
  forkTitle?: string;
  left?: ForkCard;
  right?: ForkCard;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const stops: Stop[] = [
  {
    type: "single",
    milestone: 1,
    tag: "Start Here",
    tagStyle: "bg-[#fb5607]/15 text-[#fb5607]",
    sideLabel: "The Foundation",
    title: "Who Is PureFacts?",
    description:
      "Before the deep dives, get a clear picture of who we are, what we build, and why revenue management in financial services is more complex and more important than most firms realize.",
    href: "https://purefacts.com/who-is-purefacts/",
    linkText: "Read the overview",
  },
  {
    type: "fork",
    milestone: 2,
    forkTitle: "Where does revenue leakage hit you hardest?",
    left: {
      tag: "Advisor Compensation",
      tagStyle: "bg-[#fb5607]/12 text-[#ff8c5a] border border-[#fb5607]/25",
      title: "Why Advisor Comp Is a Strategic Growth Lever",
      description:
        "Compensation isn't just a cost center. Learn how leading firms are turning advisor comp into a precision tool for growth, retention, and profitability.",
      href: "https://purefacts.com/why-advisor-compensation-is-a-strategic-growth-lever/",
      linkText: "Read the article",
    },
    right: {
      tag: "Billing & Revenue",
      tagStyle: "bg-[#fb5607]/12 text-[#ff8c5a] border border-[#fb5607]/25",
      title: "Why Billing Is Now a Growth Lever in Wealth Management",
      description:
        "Billing has quietly become one of the most strategic functions in the firm. Discover how modern billing drives competitive advantage, not just invoices.",
      href: "https://purefacts.com/why-billing-is-now-a-growth-lever-in-wealth-asset-management/",
      linkText: "Read the article",
    },
  },
  {
    type: "single",
    milestone: 3,
    tag: "Whitepaper",
    tagStyle: "bg-[#ffb30c]/15 text-[#ffb30c]",
    sideLabel: "The Problem, Quantified",
    title: "Preventing Revenue Spillage in Wealth Management",
    description:
      "The Front-End Yield Drain whitepaper. This is the one that changes the conversation. Uncover how small systematic errors compound into massive revenue loss, and what high-performing firms do differently.",
    href: "https://purefacts.com/preventing-revenue-spillage-in-wealth-management/",
    linkText: "Download the whitepaper",
  },
  {
    type: "single",
    milestone: 4,
    tag: "Research",
    tagStyle: "bg-[#ffb30c]/15 text-[#ffb30c]",
    sideLabel: "The Industry View",
    title: "The Wealth Manager's Guide to Optimising Revenue Management",
    description:
      "Industry-wide data, benchmarks, and the frameworks that top-quartile firms are using to close the gap between billed and earned revenue.",
    href: "https://info.purefacts.com/optimising-revenue-management",
    linkText: "Access the research",
  },
  {
    type: "fork",
    milestone: 5,
    forkTitle: "See who's already betting on PureFacts.",
    left: {
      tag: "Partnership",
      tagStyle: "bg-[#0DCCFF]/15 text-[#0DCCFF]",
      title: "CapCo & PureFacts Announce Strategic Partnership",
      description:
        "A global management consulting and technology firm chose PureFacts as their revenue management partner of choice. Here's why it matters.",
      href: "https://purefacts.com/capco-and-purefacts-announce-strategic-partnership/",
      linkText: "Read the press release",
    },
    right: {
      tag: "Integration",
      tagStyle: "bg-[#0DCCFF]/15 text-[#0DCCFF]",
      title: "PureFacts to Enhance Revenue Management with BNY Pershing",
      description:
        "BNY Pershing is one of the most trusted names in custody and clearing. This integration signals where enterprise wealth tech is heading.",
      href: "https://purefacts.com/purefacts-financial-solutions-to-enhance-revenue-management-capabilities-with-bny-pershing/",
      linkText: "Read the press release",
    },
  },
];

const toasts = [
  { icon: "👋", msg: "<strong>Welcome aboard.</strong> You're starting at the beginning, the best place to be." },
  { icon: "🔀", msg: "<strong>Fork in the road.</strong> Both paths lead somewhere valuable. Pick what fits your focus." },
  { icon: "📉", msg: "<strong>This one stings.</strong> Most firms discover they've been leaving money on the table for years." },
  { icon: "📊", msg: "<strong>Industry data.</strong> See how your peers are approaching revenue optimization." },
  { icon: "🤝", msg: "<strong>The proof is in the partners.</strong> See who's already committed to PureFacts." },
];

const ctaFeatures = [
  {
    icon: "fa-chart-line",
    color: "rgba(71,96,255,0.15)",
    iconColor: "#4760FF",
    title: "Stop Leaving Revenue on the Table",
    desc: "PureFacts customers recover millions in previously undetected billing errors and compensation misalignments, often within the first quarter.",
  },
  {
    icon: "fa-gears",
    color: "rgba(251,86,7,0.12)",
    iconColor: "#FB5607",
    title: "Built for Complexity at Scale",
    desc: "From multi-currency fee schedules to advisor tiering, our platform handles the revenue complexity that generic tools were never designed for.",
  },
  {
    icon: "fa-shield-halved",
    color: "rgba(13,204,255,0.12)",
    iconColor: "#0DCCFF",
    title: "Trusted by Industry Leaders",
    desc: "Top-tier wealth managers and asset managers across North America and Europe rely on PureFacts to protect and optimize their revenue every day.",
  },
];

const grad = "linear-gradient(135deg,#FACC22,#FB5607,#4760FF,#0DCCFF)";

// ── Sub-components ────────────────────────────────────────────────────────────

function ArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="transition-transform group-hover:translate-x-1"
      aria-hidden="true"
    >
      <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NodeCircle({ n }: { n: number }) {
  return (
    <div
      className="relative flex items-center justify-center w-12 h-12 flex-shrink-0"
      aria-label={`Stop ${n}`}
    >
      <div className="absolute inset-0 rounded-full" style={{ background: grad }} aria-hidden="true" />
      <div className="absolute inset-[2px] rounded-full bg-[#140f0c] flex items-center justify-center" aria-hidden="true">
        <span className="text-[#f4f4f4] font-bold text-sm">{n}</span>
      </div>
    </div>
  );
}

function StopCard({ tag, tagStyle, title, description, href, linkText }: ForkCard) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#3b84ff]/40 hover:bg-[#3b84ff]/[0.06] sm:p-6">
      <span className={`inline-block text-[0.65rem] font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full mb-3 ${tagStyle}`}>
        {tag}
      </span>
      <h3 className="text-[#f4f4f4] font-bold text-base leading-snug mb-2">{title}</h3>
      <p className="text-[#f4f4f4]/55 text-sm leading-relaxed mb-4">{description}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-1.5 text-[#3b84ff] text-sm font-bold hover:text-[#6ba3ff] transition-colors"
        aria-label={`${linkText}: ${title} (opens in new tab)`}
      >
        {linkText} <ArrowIcon />
      </a>
    </div>
  );
}

function SingleStop({ stop, side }: { stop: Stop; side: "left" | "right" }) {
  const cardLeft = side === "left";
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_56px_1fr] sm:items-start">
      {/* Card */}
      <div className={`sm:row-start-1 ${cardLeft ? "sm:col-start-1" : "sm:col-start-3"}`}>
        <StopCard
          tag={stop.tag!}
          tagStyle={stop.tagStyle!}
          title={stop.title!}
          description={stop.description!}
          href={stop.href!}
          linkText={stop.linkText!}
        />
      </div>

      {/* Node — always col 2, row 1 */}
      <div className="hidden sm:flex sm:col-start-2 sm:row-start-1 sm:justify-center sm:pt-6">
        <NodeCircle n={stop.milestone} />
      </div>

      {/* Side label — always the opposite column, row 1 */}
      <div
        className={`hidden sm:block sm:row-start-1 sm:pt-8 ${
          cardLeft ? "sm:col-start-3 sm:pl-5" : "sm:col-start-1 sm:pr-5 sm:text-right"
        }`}
      >
        <p className="text-[#f4f4f4]/55 text-sm font-bold leading-snug">
          {stop.sideLabel}
        </p>
      </div>

      {/* Mobile: node + label inline */}
      <div className="flex items-center gap-3 sm:hidden">
        <NodeCircle n={stop.milestone} />
        <p className="text-[#f4f4f4]/55 text-sm font-bold leading-snug">{stop.sideLabel}</p>
      </div>
    </div>
  );
}

function ForkStop({ stop }: { stop: Stop }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center mb-6">
        <NodeCircle n={stop.milestone} />
        <p className="text-[#f4f4f4]/70 font-bold text-base mt-3 text-center">{stop.forkTitle}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 w-full sm:grid-cols-2">
        <StopCard {...stop.left!} />
        <StopCard {...stop.right!} />
      </div>
    </div>
  );
}

function Toast({ icon, msg, show }: { icon: string; msg: string; show: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`fixed bottom-6 right-4 z-50 max-w-[260px] rounded-xl border border-white/10 bg-[#140f0c]/95 p-4 transition-all duration-500 sm:bottom-8 sm:right-8 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      }`}
    >
      <div className="text-xl mb-1" aria-hidden="true">{icon}</div>
      <div
        className="text-sm text-[#f4f4f4]/70 leading-snug"
        dangerouslySetInnerHTML={{ __html: msg }}
      />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Your Journey to Revenue Optimization | PureFacts',
  description:
    'Five stops. Real insights. A clear picture of how PureFacts helps financial firms unlock revenue they did not know they were losing.',
}

export default function YourJourneyPage() {
  const [scrollPct, setScrollPct] = useState(0);
  const [visibleStops, setVisibleStops] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState({ icon: "", msg: "", show: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const stopRefs = useRef<(HTMLDivElement | null)[]>([]);
  const finishRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      setScrollPct((h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const shown = new Set<number>();
    const fireToast = (idx: number) => {
      clearTimeout(toastTimer.current);
      setToast({ ...toasts[idx], show: true });
      toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
    };
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = Number(entry.target.getAttribute("data-idx"));
          if (!isNaN(idx) && !shown.has(idx)) {
            shown.add(idx);
            setVisibleStops((prev) => new Set([...prev, idx]));
            setTimeout(() => fireToast(idx), 400);
          }
        });
      },
      { threshold: 0.15 }
    );
    stopRefs.current.forEach((el) => el && obs.observe(el));
    if (finishRef.current) obs.observe(finishRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="dark-page">

      {/* Progress bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] bg-white/5 z-50"
        role="progressbar"
        aria-valuenow={Math.round(scrollPct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Page scroll progress"
      >
        <div
          className="h-full transition-[width] duration-100"
          style={{ width: `${scrollPct}%`, background: grad }}
          aria-hidden="true"
        />
      </div>

      <Toast {...toast} />

      {/* ── Hero ── */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 pt-28 pb-16 overflow-hidden sm:pt-40 sm:pb-24"
        aria-label="Your journey to revenue optimization"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 30%,rgba(71,96,255,0.18) 0%,transparent 70%),radial-gradient(ellipse 50% 40% at 80% 80%,rgba(251,86,7,0.12) 0%,transparent 60%)",
          }}
          aria-hidden="true"
        />

        <p className="text-[#fb5607] text-xs tracking-[0.2em] uppercase mb-4 sm:mb-5 animate-[fadeUp_0.8s_0.2s_both]">
          Your journey with PureFacts
        </p>

        <h1 className="font-bold leading-[1.05] max-w-[18ch] text-4xl sm:text-5xl lg:text-[clamp(2.8rem,7vw,5.5rem)] animate-[fadeUp_0.8s_0.4s_both]">
          Your Journey To{" "}
          <span
            style={{
              background: grad,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Revenue Optimization
          </span>
        </h1>

        <p className="mt-5 text-[#f4f4f4]/65 max-w-[52ch] leading-relaxed text-base sm:text-lg animate-[fadeUp_0.8s_0.6s_both]">
          Five stops. Real insights. A clear picture of how PureFacts helps financial firms unlock revenue they
          didn&apos;t know they were losing.
        </p>
      </section>

      {/* ── Journey ── */}
      <div
        className="relative max-w-[900px] mx-auto px-6 pt-8 pb-16 sm:pt-12 sm:pb-24"
        role="main"
        aria-label="Revenue optimization journey stops"
      >
        {/* Vertical spine — hidden on mobile */}
        <div
          className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 opacity-30 pointer-events-none"
          style={{ background: grad }}
          aria-hidden="true"
        />
        <div className="flex flex-col gap-12 sm:gap-20">
          {stops.map((stop, i) => {
            const singleSides: Record<number, "left" | "right"> = { 0: "left", 2: "right", 3: "left" };
            return (
              <div
                key={i}
                data-idx={i}
                ref={(el) => { stopRefs.current[i] = el; }}
                className={`transition-all duration-700 ${
                  visibleStops.has(i) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                {stop.type === "single" ? (
                  <SingleStop stop={stop} side={singleSides[i] ?? "left"} />
                ) : (
                  <ForkStop stop={stop} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CTA ── */}
      <section
        ref={finishRef}
        data-idx={stops.length}
        className={`relative px-6 pb-16 sm:pb-24 transition-all duration-700 ${
          visibleStops.has(stops.length) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        aria-label="Get started with PureFacts"
      >
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] sm:w-[600px] sm:h-[300px]"
          style={{ background: "radial-gradient(ellipse,rgba(71,96,255,0.15) 0%,transparent 70%)" }}
          aria-hidden="true"
        />

        <div className="mx-auto max-w-[1100px]">
          <div className="p-[1px]" style={{ background: grad }}>
            <div className="bg-[#140f0c] px-5 py-10 sm:px-8 sm:py-12 lg:px-14 lg:py-14">
              <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">

                {/* Feature list */}
                <div className="flex flex-col gap-6 sm:gap-8 lg:w-1/2">
                  {ctaFeatures.map(({ icon, color, iconColor, title, desc }) => (
                    <div key={title} className="flex items-start gap-4 sm:gap-5">
                      <div
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center"
                        style={{ backgroundColor: color }}
                        aria-hidden="true"
                      >
                        <i className={`fa-solid ${icon} text-lg`} style={{ color: iconColor }} />
                      </div>
                      <div>
                        <p className="text-[#f4f4f4] font-bold text-base">{title}</p>
                        <p className="mt-1 text-sm text-[#f4f4f4]/50 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA copy + button */}
                <div className="lg:w-1/2">
                  <p className="text-[#fb5607] text-xs tracking-[0.2em] uppercase mb-4">You made it</p>
                  <h2 className="font-bold leading-[1.1] text-3xl text-[#f4f4f4] sm:text-[clamp(1.8rem,3.5vw,2.6rem)]">
                    Ready To See{" "}
                    <span
                      style={{
                        background: grad,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      Revenue Recovery
                    </span>{" "}
                    In Action
                  </h2>
                  <p className="mt-4 text-sm text-[#f4f4f4]/55 leading-relaxed">
                    See how PureFacts helps wealth and asset managers close the gap between
                    billed and earned revenue, and keep it closed.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-4 sm:mt-8">
                    <Link href="/contact" className="btn-primary">
                      Request a demo
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}