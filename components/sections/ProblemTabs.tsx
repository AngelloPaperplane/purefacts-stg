'use client'

import { useState } from 'react'
import Image from 'next/image'

const tabs = [
  {
    id: 'system-disconnects',
    label: 'System Disconnects',
    icon: '/icons/system-disconnects.svg',
    left: 'Disconnected revenue systems create inconsistent rules and no single source of truth.',
    quote: 'In recent RIA surveys, 74% of advisors say poor technology integration is a major pain point, and 67% have actually lost clients because of it.',
    source: '— Advisor360, Connected Wealth Report',
  },
  {
    id: 'pricing-spillage',
    label: 'Pricing Spillage',
    icon: '/icons/pricing-spillage.svg',
    left: 'Advisors over discount due to missing pricing guardrails, benchmarks, and clear guidance.',
    quote: "Fidelity's RIA Benchmarking data show that 89% of firms over $1 billion in AUM now discount their stated fees, highlighting how common give-away pricing has become.",
    source: '— Fidelity RIA Benchmarking Study (via PlanAdviser)',
  },
  {
    id: 'revenue-leakage',
    label: 'Revenue Leakage',
    icon: '/icons/revenue-leakage.svg',
    left: 'Manual, error prone workflows cause missed, delayed, or incorrect revenue capture.',
    quote: 'Consultants citing EY research estimate that firms routinely lose 1-5% of EBITDA to revenue leakage from billing errors, mis-priced contracts, and data gaps.',
    source: '— EY revenue-leakage analysis',
  },
  {
    id: 'regulatory-risk',
    label: 'Regulatory Risk',
    icon: '/icons/regulatory-risk.svg',
    left: 'Limited controls and transparency weaken audit defense and confidence in reported numbers.',
    quote: 'In 2023, FINRA collected about $71 million in fines tied to billing errors and misaligned compensation, putting fee accuracy firmly in regulators crosshairs.',
    source: '— FINRA enforcement data',
  },
]

export default function ProblemTabs() {
  const [active, setActive] = useState(tabs[0].id)
  const tab = tabs.find(t => t.id === active)!

  return (
    <div className="mt-10">
      {/* Tab row */}
      <div className="overflow-x-auto scrollbar-hide -mx-6 px-6 lg:mx-0 lg:px-0">
        <div className="flex min-w-max gap-1 border-b border-gray-200 lg:min-w-0">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`flex shrink-0 items-center gap-2.5 px-5 py-4 text-base font-semibold transition-colors ${
                active === t.id
                  ? 'border-b-2 border-brand-blue text-brand-blue'
                  : 'text-gray-500 hover:text-brand-off-black'
              }`}
            >
              <span className="relative h-6 w-6 shrink-0">
                <Image src={t.icon} alt="" fill className="object-contain" />
              </span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content panel */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left — gradient border card */}
        <div className="bg-brand-gradient p-px">
          <div className="flex h-full items-center bg-white p-8">
            <p className="text-xl font-bold leading-snug text-brand-off-black lg:text-2xl">
              {tab.left}
            </p>
          </div>
        </div>

        {/* Right — quote */}
        <div className="flex flex-col justify-center bg-gray-50 p-8">
          <blockquote className="text-lg font-normal leading-relaxed text-brand-off-black lg:text-2xl">
            "{tab.quote}"
          </blockquote>
          <cite className="mt-4 block text-sm font-semibold not-italic text-gray-400">
            {tab.source}
          </cite>
        </div>
      </div>
    </div>
  )
}