"use client";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/lib/sanity/client";
import { type ClientLogo } from "@/components/sections/LogoCarousel";


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

const PROOF_STATS = [
  { value: 15,  suffix: "T+", prefix: "$", label: "Assets Under Administration", decimals: 0 },
  { value: 3,   suffix: "B+", prefix: "$", label: "Fees Calculated Annually",    decimals: 0 },
  { value: 200, suffix: "M+", prefix: "",  label: "Automated Actions Per Year",  decimals: 0 },
];

function CountUp({
  target, suffix, prefix, decimals,
}: {
  target: number; suffix: string; prefix: string; decimals: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setIsInView(true); obs.disconnect(); } }, { once: true } as IntersectionObserverInit);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { setDisplay(String(target)); return; }
    const duration = 1600;
    const step = 16;
    const increments = duration / step;
    let current = 0;
    const inc = target / increments;
    const timer = setInterval(() => {
      current += inc;
      if (current >= target) { setDisplay(String(target)); clearInterval(timer); }
      else { setDisplay(decimals > 0 ? current.toFixed(decimals) : String(Math.floor(current))); }
    }, step);
    return () => clearInterval(timer);
  }, [isInView, target, decimals]);

  return <span ref={ref}>{prefix}{display}{suffix}</span>;
}

function LogoCard({ logo, onPause, onResume }: { logo: ClientLogo; onPause: () => void; onResume: () => void }) {
  const isExternal = logo.caseStudyUrl?.startsWith("http");

  return (
    <div
      className="relative flex flex-col items-center justify-center bg-[#f4f4f4] p-6 w-full aspect-square overflow-hidden rounded-[10px]"
      onMouseEnter={onPause}
      onMouseLeave={onResume}
    >
      <div className="relative w-full h-16">
        <Image
          src={urlFor(logo.logo).width(480).height(192).url()}
          alt={logo.name}
          fill
          className="object-contain"
          draggable={false}
          sizes="220px"
        />
      </div>

      {logo.caseStudyUrl ? (
        <div className="absolute bottom-4 inset-x-0 flex justify-center">
          {isExternal ? (
            <a
              href={logo.caseStudyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 whitespace-nowrap"
              onClick={(e) => e.stopPropagation()}
            >
              Case study →
            </a>
          ) : (
            <Link
              href={logo.caseStudyUrl}
              className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 whitespace-nowrap"
              onClick={(e) => e.stopPropagation()}
            >
              Case study →
            </Link>
          )}
        </div>
      ) : (
        <div className="absolute bottom-4 h-5" />
      )}
    </div>
  );
}

function LogoColumn({
  logos,
  direction,
}: {
  logos: ClientLogo[];
  direction: "up" | "down";
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const SPEED = 0.8;

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    const getSetHeight = () => inner.scrollHeight / 2;

    offsetRef.current = direction === "down" ? -getSetHeight() : 0;
    inner.style.transform = `translateY(${offsetRef.current}px)`;

    const tick = () => {
      const setH = getSetHeight();
      if (setH === 0) { rafRef.current = requestAnimationFrame(tick); return; }

      if (!pausedRef.current) {
        if (direction === "up") {
          offsetRef.current -= SPEED;
          if (offsetRef.current <= -setH) offsetRef.current += setH;
        } else {
          offsetRef.current += SPEED;
          if (offsetRef.current >= 0) offsetRef.current -= setH;
        }
        inner.style.transform = `translateY(${offsetRef.current}px)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [direction, logos.length]);

  const items = [...logos, ...logos];

  return (
    <div className="relative overflow-hidden h-[520px]">
      <div
        ref={innerRef}
        className="flex flex-col gap-3 will-change-transform"
      >
        {items.map((logo, i) => (
          <LogoCard
            key={`${logo._id}-${i}`}
            logo={logo}
            onPause={() => { pausedRef.current = true; }}
            onResume={() => { pausedRef.current = false; }}
          />
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-20 z-10"
        style={{ background: "linear-gradient(to bottom, #140f0c, transparent)" }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 z-10"
        style={{ background: "linear-gradient(to top, #140f0c, transparent)" }}
      />
    </div>
  );
}


function MobileLogoCarousel({ logos }: { logos: ClientLogo[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const lastClientXRef = useRef(0);
  const SPEED = 0.55;
  const items = [...logos, ...logos, ...logos];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const getSetWidth = () => track.scrollWidth / 3;

    const normalize = () => {
      const setW = getSetWidth();
      if (!setW) return;
      if (xRef.current <= -setW) xRef.current += setW;
      if (xRef.current > 0) xRef.current -= setW;
    };

    const tick = () => {
      if (!pausedRef.current && !draggingRef.current) {
        xRef.current -= SPEED;
        normalize();
        track.style.transform = `translateX(${xRef.current}px)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [logos.length]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    pausedRef.current = true;
    lastClientXRef.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!draggingRef.current || !track) return;

    const dx = e.clientX - lastClientXRef.current;
    lastClientXRef.current = e.clientX;
    xRef.current += dx;

    const setW = track.scrollWidth / 3;
    if (setW) {
      if (xRef.current <= -setW) xRef.current += setW;
      if (xRef.current > 0) xRef.current -= setW;
    }

    track.style.transform = `translateX(${xRef.current}px)`;
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    pausedRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      className="relative overflow-hidden"
      style={{ touchAction: "pan-y", cursor: "grab" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { if (!draggingRef.current) pausedRef.current = false; }}
    >
      <div ref={trackRef} className="flex gap-3 will-change-transform">
        {items.map((logo, i) => (
          <div key={`${logo._id}-${i}`} className="shrink-0" style={{ width: "min(44vw, 168px)" }}>
            <LogoCard
              logo={logo}
              onPause={() => { pausedRef.current = true; }}
              onResume={() => { if (!draggingRef.current) pausedRef.current = false; }}
            />
          </div>
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-10 z-10"
        style={{ background: "linear-gradient(to right, #140f0c, transparent)" }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-10 z-10"
        style={{ background: "linear-gradient(to left, #140f0c, transparent)" }}
      />
    </div>
  );
}

export default function ProofBand({ logos }: { logos: ClientLogo[] }) {
  const { isMobile, isTablet } = useBreakpoint();
  const col1 = logos.filter((_, i) => i % 3 === 0);
  const col2 = logos.filter((_, i) => i % 3 === 1);
  const col3 = logos.filter((_, i) => i % 3 === 2);

  const pad = (arr: ClientLogo[]): ClientLogo[] => {
    if (arr.length === 0) return logos.slice(0, 4);
    let out = [...arr];
    while (out.length < 4) out = [...out, ...arr];
    return out;
  };

  return (
    <section className="relative bg-[#140f0c]">
      <div className="max-w-7xl mx-auto" style={{ padding: isMobile ? "44px 20px" : isTablet ? "80px 32px" : "96px 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isTablet ? "1fr" : "42% 1fr", gap: isMobile ? 36 : isTablet ? 48 : 80, alignItems: "center" }}>

          {/* LEFT: copy + stats */}
          <div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-bold text-[#f4f4f4] leading-[1.06] mb-5"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Trusted by leading financial firms worldwide
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base text-[#f4f4f4]/75 leading-relaxed"
              style={{ marginBottom: isMobile ? 28 : 48 }}
            >
              Don&rsquo;t just take our word for it. The world&rsquo;s most demanding financial
              firms have recovered $525M of revenue, relying on PureFacts to protect and grow
              their revenue every day.
            </motion.p>

            {/* Stats */}
            <div className="grid divide-white/[0.08]" style={{ gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", rowGap: isMobile ? 14 : 0, marginBottom: isMobile ? 26 : 40 }} >
              {PROOF_STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="pl-4 first:pl-0 pr-4"
                  style={{ borderLeft: !isMobile && i > 0 ? "1px solid rgba(255,255,255,0.08)" : "none", paddingLeft: isMobile ? 0 : i === 0 ? 0 : 16 }}
                >
                  <div className="font-bold text-[#f4f4f4] tracking-tight leading-none mb-1.5" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
                    <CountUp
                      target={s.value}
                      suffix={s.suffix}
                      prefix={s.prefix}
                      decimals={s.decimals}
                    />
                  </div>
                  <div className="text-[10px] text-[#f4f4f4]/35 font-medium uppercase tracking-widest leading-tight">
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </div>

          </div>

          {/* RIGHT: animated logo columns */}
          {!isMobile ? (
          <div className="grid grid-cols-3 gap-3 overflow-hidden">
            <LogoColumn logos={pad(col1)} direction="down" />
            <LogoColumn logos={pad(col2)} direction="up"   />
            <LogoColumn logos={pad(col3)} direction="down" />
          </div>
          ) : (
            <MobileLogoCarousel logos={logos} />
          )}

        </div>
      </div>
    </section>
  );
}