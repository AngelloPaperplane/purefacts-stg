import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getWorkWithUsSettings } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/client'
import LogoCarousel from '@/components/sections/LogoCarousel'
import StaggerCards from '@/components/sections/StaggerCards'
import StatCounter from '@/components/sections/StatCounter'

export const metadata: Metadata = {
  title: 'Work With Us | PureFacts Financial Solutions',
  description:
    "For more than 15 years, PureFacts has helped the world's largest financial institutions bring discipline, visibility, and performance to revenue operations through an AI-fueled platform, deep domain expertise, and a process built for complex environments.",
}

export default async function WorkWithUsPage() {
  const settings = await getWorkWithUsSettings()
  const logos = settings?.clientLogos ?? []

  return (
    <>
      {/* ── 1. Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white">
        <div className="flex flex-col lg:flex-row lg:min-h-[540px]">
          <div className="flex items-center px-6 py-16 lg:w-1/2 lg:py-24 lg:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]">
            <div className="max-w-xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-blue">
                Work With Us
              </p>
              <h1 className="text-4xl font-bold leading-tight text-brand-off-black lg:text-5xl">
                The Partner Behind Better Revenue Outcomes
              </h1>
              <p className="mt-5 text-lg text-gray-600">
                Technology matters. But in a category this complex, technology alone is
                not enough. For more than 15 years, PureFacts has helped some of the
                world's largest and most respected financial institutions bring more
                discipline, visibility, and performance to revenue operations.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/contact" className="btn-primary">Talk to an expert</Link>
                <Link href="/why-purefacts" className="btn-secondary">Why PureFacts</Link>
              </div>
            </div>
          </div>
          <div className="relative w-full lg:w-1/2 min-h-[360px]">
            {settings?.heroImage ? (
              <Image
                src={urlFor(settings.heroImage).width(900).url()}
                alt="Working with PureFacts"
                fill
                className="object-contain -right"
                priority
              />
            ) : (
              <div className="h-full w-full bg-brand-gradient opacity-80" />
            )}
          </div>
        </div>
      </section>

     {/* ── 2. Scale proof band ─────────────────────────────── */}
      <section className="bg-[#f4f4f4]">
        <div className="h-px w-full bg-brand-gradient" />
        <div className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="mb-12 text-center font-bold text-brand-off-black" style={{ fontSize: '2em' }}>
            Built For The Firms That Cannot Afford To Get Revenue Wrong
          </h2>
          <dl className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">

            {/* Stat 1: 15+ years — static, trailing + after integer */}
            <div className="px-8 py-8 first:pl-0 last:pr-0">
              <dt>
                <StatCounter value={15} suffix="+" color="#3b84ff" duration={1400} />
              </dt>
              <div className="mt-3 h-[3px] w-10" style={{ backgroundColor: '#3b84ff' }} />
              <p className="mt-4 text-base font-bold text-brand-off-black">
                Years Of Category-Specific Expertise
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Over 15 years of deep, category-specific revenue management work across the world's most complex financial institutions.
              </p>
            </div>

            {/* Stat 2: $15T AuA */}
            <div className="px-8 py-8 first:pl-0 last:pr-0">
              <dt>
                <StatCounter prefix="$" value={15} suffix="T" color="#fb5607" duration={1600} />
              </dt>
              <div className="mt-3 h-[3px] w-10" style={{ backgroundColor: '#fb5607' }} />
              <p className="mt-4 text-base font-bold text-brand-off-black">
                In Assets Under Administration
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Wealth and asset managers worldwide trust PureRevenue to calculate fees across trillions in AuA.
              </p>
            </div>

            {/* Stat 3: 200M+ actions */}
            <div className="px-8 py-8 first:pl-0 last:pr-0">
              <dt>
                <StatCounter value={200} suffix="M+" color="#140f0c" duration={1800} />
              </dt>
              <div className="mt-3 h-[3px] w-10" style={{ backgroundColor: '#140f0c' }} />
              <p className="mt-4 text-base font-bold text-brand-off-black">
                Revenue Actions Processed Annually
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                From billing cycles to compensation workflows, PureFacts handles enterprise-scale volume reliably.
              </p>
            </div>

          </dl>
        </div>
        <div className="h-px w-full bg-brand-gradient" />
      </section>

      {/* ── 3. Manifesto section ────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-16 lg:flex-row lg:gap-24">

            {/* Left: bold statement */}
            <div className="lg:w-2/5 lg:sticky lg:top-24 lg:self-start">
              <h2 className="text-4xl font-bold leading-tight text-brand-off-black lg:text-5xl">
                Why firms who have tried everything else{' '}
                <span className="text-brand-blue">choose PureFacts.</span>
              </h2>
              <p className="mt-6 text-base text-gray-600 leading-relaxed">
                Revenue management in this industry is not a generic problem. It is shaped
                by complexity that most platforms were never designed to handle. PureFacts
                was built specifically for it.
              </p>
              <Link href="/contact" className="btn-primary mt-8 inline-flex">
                Talk to an expert
              </Link>
            </div>

            {/* Right: 6 punchy truths */}
            <div className="grid grid-cols-1 gap-px bg-brand-gradient sm:grid-cols-2 lg:flex-1">
              {[
                {
                  title: 'We understand the realities, not just the theory.',
                  body:  'Complex household structures, multi-tier fee schedules, advisor payout rules, legacy system constraints. We have seen all of it, in production, at scale.',
                },
                {
                  title: 'We connect the dots other vendors leave disconnected.',
                  body:  'Billing, compensation, and reporting are not separate problems. They are parts of the same revenue system. We treat them that way.',
                },
                {
                  title: 'We have earned trust at the highest stakes.',
                  body:  'The firms running $15T in AuA on PureRevenue did not get there by accident. They chose a platform they could depend on when errors have real consequences.',
                },
                {
                  title: 'Our AI is grounded in domain knowledge.',
                  body:  'Intelligence built on top of bad logic is still bad logic. Our AI-fueled approach starts from a deep understanding of how revenue actually works in this industry.',
                },
                {
                  title: 'We build for durable outcomes, not fast demos.',
                  body:  'Our process is designed for complex organizations where adoption matters as much as implementation. We focus on what the business looks like six months after go-live.',
                },
                {
                  title: 'We grow with the firms we work with.',
                  body:  'The relationship does not end at deployment. It deepens as the platform evolves, the business grows, and the problems worth solving get more interesting.',
                },
              ].map(item => (
                <div key={item.title} className="flex flex-col gap-3 bg-white p-8">
                  <h3 className="font-bold text-brand-off-black leading-snug">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. Logo carousel ────────────────────────────────── */}
      {logos.length > 0 && (
        <LogoCarousel logos={logos} label="Trusted By The Industry's Best" />
      )}

      {/* ── 5. Three pillars ────────────────────────────────── */}
      <section className="bg-white">
        <div className="h-px w-full bg-brand-gradient" />
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-bold text-brand-off-black lg:text-4xl">
              Three Things That Make The Difference
            </h2>
            <p className="mt-4 text-base text-gray-600 leading-relaxed">
              Most firms that struggle with revenue management have the effort. They are
              missing the platform, the expertise, or the process to make it stick.
              PureFacts brings all three.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {[
              {
                number: '01',
                title:  'AI-Fueled Platform Approach',
                href:   '/why-purefacts/platform-approach',
                body:   'Built to bring intelligence, automation, and better coordination to revenue operations over time. Not as an afterthought, but by design.',
              },
              {
                number: '02',
                title:  'Deep Domain Expertise',
                href:   '/why-purefacts/deep-domain-expertise',
                body:   'Grounded in the complexity of wealth and asset management. Not generic software theory. Real experience earned across 15+ years of category-specific work.',
              },
              {
                number: '03',
                title:  'Our Process',
                href:   '/why-purefacts/our-process',
                body:   'Structured to move from diagnosis to execution with rigor, alignment, and measurable progress. Built for complex environments and high-stakes revenue flows.',
              },
            ].map(card => (
              <Link
                key={card.number}
                href={card.href}
                className="group relative p-[2px] bg-gray-200 hover:bg-brand-gradient transition-all duration-200"
              >
                <div className="h-full bg-white p-8">
                  <span
                    className="mb-6 block text-5xl font-black leading-none"
                    style={{
                      background: 'linear-gradient(90deg, #FACC22, #FB5607, #4760FF, #0DCCFF)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {card.number}
                  </span>
                  <h3 className="text-xl font-bold text-brand-off-black">{card.title}</h3>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{card.body}</p>
                  <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue group-hover:underline">
                    Learn more <i className="fa-solid fa-arrow-right text-xs" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="h-px w-full bg-brand-gradient" />
      </section>

      {/* ── 6. Process timeline — horizontal ────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-blue">
                Our Process
              </p>
              <h2 className="text-3xl font-bold text-brand-off-black lg:text-4xl">
                From Complexity To Control
              </h2>
              <p className="mt-3 text-base text-gray-600">
                A structured path that turns diagnosis into durable improvement.
              </p>
            </div>
            <Link href="/why-purefacts/our-process" className="btn-secondary shrink-0 self-start lg:self-end">
              Explore Our Process
            </Link>
          </div>

          {/* Desktop: all cards below the line, label above node */}
          <div className="hidden lg:block">

            {/* Step labels row — sits above the nodes */}
            <div className="grid grid-cols-4">
              {[
                { step: '1', label: 'Diagnose' },
                { step: '2', label: 'Align' },
                { step: '3', label: 'Configure' },
                { step: '4', label: 'Optimize' },
              ].map(item => (
                <div key={item.step} className="flex justify-center">
                  <p className="font-bold text-sm text-brand-off-black">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Node row — nodes sit on the gradient line */}
            <div className="relative mt-2 grid grid-cols-4">
              {/* Horizontal gradient line through node centres */}
              <div
                className="absolute inset-x-0 top-7 h-[2px]"
                style={{ background: 'linear-gradient(90deg, #FACC22, #FB5607, #4760FF, #0DCCFF)' }}
              />
              {[
                { step: '1' },
                { step: '2' },
                { step: '3' },
                { step: '4' },
              ].map(item => (
                <div key={item.step} className="relative z-10 flex justify-center">
                  <div
                    className="flex h-14 w-14 items-center justify-center bg-white text-2xl font-black"
                    style={{
                      background: 'linear-gradient(white, white) padding-box, linear-gradient(90deg, #FACC22, #FB5607, #4760FF, #0DCCFF) border-box',
                      border: '2px solid transparent',
                    }}
                  >
                    <span className="text-brand-off-black">{item.step}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Connector lines + cards below */}
            <div className="grid grid-cols-4">
              {[
                { step: '1', body: 'Understand the revenue model, friction points, and the outcomes that matter most to the business.' },
                { step: '2', body: 'Bring stakeholders together around priorities, success criteria, and a shared path forward.' },
                { step: '3', body: 'Implement with the rigor that complex revenue environments demand. No shortcuts on sensitive flows.' },
                { step: '4', body: 'Support adoption, measure outcomes, and continue improving performance over time.' },
              ].map(item => (
                <div key={item.step} className="flex flex-col items-center px-3 pt-0">
                  {/* Connector — centered under the node (node is w-14 = 56px, sits at justify-center) */}
                  <div
                    className="w-[2px] h-6"
                    style={{ background: 'linear-gradient(180deg, #FACC22, #FB5607, #4760FF, #0DCCFF)' }}
                  />
                  {/* Gradient border card */}
                  <div className="w-full p-[2px]" style={{ background: 'linear-gradient(90deg, #FACC22, #FB5607, #4760FF, #0DCCFF)' }}>
                    <div className="bg-white p-6">
                      <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Mobile: stacked cards */}
          <div className="flex flex-col gap-6 lg:hidden">
            {[
              { step: '1', label: 'Diagnose',  body: 'Understand the revenue model, friction points, and the outcomes that matter most to the business.' },
              { step: '2', label: 'Align',     body: 'Bring stakeholders together around priorities, success criteria, and a shared path forward.' },
              { step: '3', label: 'Configure', body: 'Implement with the rigor that complex revenue environments demand. No shortcuts on sensitive flows.' },
              { step: '4', label: 'Optimize',  body: 'Support adoption, measure outcomes, and continue improving performance over time.' },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center text-xl font-black"
                  style={{
                    background: 'linear-gradient(white, white) padding-box, linear-gradient(90deg, #FACC22, #FB5607, #4760FF, #0DCCFF) border-box',
                    border: '2px solid transparent',
                  }}
                >
                  <span style={{ background: 'linear-gradient(90deg, #FACC22, #FB5607, #4760FF, #0DCCFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    {item.step}
                  </span>
                </div>
                <div className="flex-1 border border-gray-200 p-5">
                  <h3 className="font-bold text-brand-off-black">{item.label}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. CTA band ─────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div
            className="p-[2px]"
            style={{
              background: 'linear-gradient(135deg, #FACC22, #FB5607, #4760FF, #0DCCFF)',
            }}
          >
            <div className="bg-white px-8 py-12 lg:px-16 lg:py-16">
              <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">

                {/* Left: three icon cards */}
                <StaggerCards className="lg:w-1/2">
                  {[
                    {
                      icon: 'fa-brain',
                      color: '#eef2ff',
                      iconColor: '#4760FF',
                      title: 'Expertise Earned in This Category',
                      desc: 'Over 15 years of category-specific work across the most complex revenue environments in wealth and asset management — not generic software theory.',
                    },
                    {
                      icon: 'fa-diagram-project',
                      color: '#fff1ee',
                      iconColor: '#FB5607',
                      title: 'A Process Built for Complexity',
                      desc: 'From diagnosis through optimization, a structured path designed for high-stakes revenue flows where adoption matters as much as implementation.',
                    },
                    {
                      icon: 'fa-handshake',
                      color: '#fefce8',
                      iconColor: '#FACC22',
                      title: 'A Partner That Grows With You',
                      desc: 'The relationship deepens after deployment — as the platform evolves, the business grows, and the problems worth solving get more interesting.',
                    },
                  ].map(({ icon, color, iconColor, title, desc }) => (
                    <div key={title} className="flex items-start gap-4">
                      <div
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center"
                        style={{ backgroundColor: color }}
                      >
                        <i className={`fa-solid ${icon} text-lg`} style={{ color: iconColor }} />
                      </div>
                      <div>
                        <p className="font-bold text-brand-off-black">{title}</p>
                        <p className="mt-1 text-sm text-gray-500">{desc}</p>
                      </div>
                    </div>
                  ))}
                </StaggerCards>

                {/* Right: headline + CTA */}
                <div className="lg:w-1/2">
                  <h2 className="text-3xl font-bold leading-tight text-brand-off-black lg:text-4xl">
                    More Than A Platform.{' '}
                    <br />
                    <span
                      style={{
                        background: 'linear-gradient(135deg, #FACC22, #FB5607, #4760FF, #0DCCFF)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      A Partner Built For This Work.
                    </span>
                  </h2>
                  <p className="mt-4 text-gray-600">
                    When firms choose PureFacts, they are choosing a platform approach
                    shaped by where the market is going, expertise earned through years
                    of category-specific work, and a process designed to deliver durable
                    results in complex environments.
                  </p>
                  <div className="mt-8">
                    <Link href="/contact" className="btn-secondary">Talk to an expert</Link>
                  </div>
                  <p className="mt-6 text-sm text-gray-400">
                    Trusted by the top global financial firms
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}